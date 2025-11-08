import { docs_v1, drive_v3, google, sheets_v4 } from 'googleapis';
import { env } from '$env/dynamic/private';
// import htmlDocx from 'html-docx-js'; // remove
// import { parse } from 'node-html-parser';
import { JSDOM } from 'jsdom';

const SPREADSHEET_ID = env.GOOGLE_SHEET_ID;
const DDE_TICKETS_RANGE = 'DDE!A:D';
const DDE_RANGE = 'DDE!A:X';
const scopes = [
	'https://www.googleapis.com/auth/documents',
	'https://www.googleapis.com/auth/documents.readonly',
	'https://www.googleapis.com/auth/drive',
	'https://www.googleapis.com/auth/drive.file',
	'https://www.googleapis.com/auth/drive.readonly',
	'https://www.googleapis.com/auth/userinfo.profile'
];

async function googleApi(): Promise<{
	docs: docs_v1.Docs;
	sheets: sheets_v4.Sheets;
	drive: drive_v3.Drive;
}> {
	const credentials = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT);
	const auth = new google.auth.GoogleAuth({ credentials, scopes });

	return {
		docs: google.docs({ version: 'v1', auth }),
		sheets: google.sheets({ version: 'v4', auth }),
		drive: google.drive({ version: 'v3', auth })
	};
}

/**
 * Convert simple HTML (bold, italic, paragraph) into Google Docs API batchUpdate requests
 */
/**
 * Convert an HTML fragment into Google Docs batchUpdate requests.
 * Supports: p, br, b/strong, i/em, ul/ol/li (bullets via plain bullet char)
 */
function htmlToDocsRequests(htmlString: string, placeholder: string): docs_v1.Schema$Request[] {
	const dom = new JSDOM(`<body>${htmlString}</body>`);
	const { document, Node } = dom.window;
	const body = document.body;

	const requests: docs_v1.Schema$Request[] = [];
	// const resets: string[] = []
	let insertIndex = 1; // cumulative insertion index (Google Docs starts at 1)

	function pushInsertText(text: string) {
		if (!text) return;
		if (requests.length < 1) {
			requests.push({
				replaceAllText: {
					containsText: { matchCase: true, text: placeholder },
					replaceText: text
				}
			});
		} else {
			requests.push({
				insertText: {
					location: { index: insertIndex },
					text
				}
			});
		}
		insertIndex += text.length;
	}

	function pushStyle(startOffset: number, endOffset: number, style: Record<string, unknown>) {
		requests.push({
			updateTextStyle: {
				range: { startIndex: startOffset, endIndex: endOffset },
				textStyle: style,
				fields: Object.keys(style).join(',')
			}
		});
	}

	// Helper to process inline children (text + inline tags)
	function processInlineChildren(parent: Element) {
		let text = '';
		const styles: Array<{ start: number; end: number; style: Record<string, unknown> }> = [];

		parent.childNodes.forEach((child) => {
			if (child.nodeType === Node.TEXT_NODE) {
				const t = child.textContent ?? '';
				text += t;
			} else if (child.nodeType === Node.ELEMENT_NODE) {
				const el = child as Element;
				const tag = el.tagName.toLowerCase();

				if (tag === 'b' || tag === 'strong') {
					const start = text.length;
					const t = el.textContent ?? '';
					text += t;
					styles.push({ start, end: start + t.length, style: { bold: true } });
				} else if (tag === 'i' || tag === 'em') {
					const start = text.length;
					const t = el.textContent ?? '';
					text += t;
					styles.push({ start, end: start + t.length, style: { italic: true } });
				} else if (tag === 'u') {
					const start = text.length;
					const t = el.textContent ?? '';
					text += t;
					styles.push({ start, end: start + t.length, style: { underline: true } });
				} else if (tag === 'br') {
					text += '\n';
				} else {
					// fallback: append text content
					const t = el.textContent ?? '';
					text += t;
				}
			}
		});

		// Insert the composed text and then style ranges relative to insertIndex
		if (text.length > 0) {
			pushInsertText(text);
			styles.forEach(({ start, end, style }) => {
				const startIndex = insertIndex - text.length + start;
				const endIndex = insertIndex - text.length + end;
				pushStyle(startIndex, endIndex, style);
			});
		}
	}

	// iterate direct children of body (handles fragments like <ul>...</ul>)
	body.childNodes.forEach((node) => {
		if (node.nodeType === Node.TEXT_NODE) {
			const txt = node.textContent ?? '';
			pushInsertText(txt);
			return;
		}

		if (node.nodeType !== Node.ELEMENT_NODE) return;
		const el = node as Element;
		const tag = el.tagName.toLowerCase();

		if (tag === 'p' || tag === 'div' || tag.startsWith('h')) {
			// paragraph / heading -> insert its inline children + a newline
			processInlineChildren(el);
			pushInsertText('\n');
		} else if (tag === 'br') {
			pushInsertText('\n');
		} else if (tag === 'ul' || tag === 'ol') {
			// simple bullet handling: prefix with bullet char or number
			const isOrdered = tag === 'ol';
			const list = Array.from(el.querySelectorAll('li'));
			list.forEach((li, idx) => {
				const bulletPrefix = isOrdered ? `${idx + 1}. ` : '• ';
				pushInsertText(bulletPrefix);
				// process inline for each li
				// create a temporary element wrapper to reuse logic
				const wrapper = document.createElement('span');
				wrapper.innerHTML = li.innerHTML;
				processInlineChildren(wrapper);
				pushInsertText('\n');
			});
		} else if (tag === 'table') {
			// fallback: insert plain text table representation
			const rows = Array.from(el.querySelectorAll('tr'));
			rows.forEach((tr) => {
				const cols = Array.from(tr.querySelectorAll('td,th')).map((td) =>
					(td.textContent ?? '').trim()
				);
				pushInsertText(cols.join('\t') + '\n');
			});
		} else {
			// generic element: insert text + newline
			processInlineChildren(el);
			pushInsertText('\n');
		}
	});

	return requests;
}

function mdParser(html: string, placeholder: string): docs_v1.Schema$Request[] {
	const requests: docs_v1.Schema$Request[] = [];

	if (html == '') return requests;

	html.split('').forEach((char, i) => {
		if (i === 0) {
			requests.push({
				replaceAllText: {
					containsText: { matchCase: true, text: placeholder },
					replaceText: char
				}
			});
		} else {
			requests.push({
				insertText: {
					location: { index: i },
					text: char
				}
			});
		}
	});

	return requests;
}

export { SPREADSHEET_ID, DDE_TICKETS_RANGE, DDE_RANGE, googleApi, htmlToDocsRequests, mdParser };
