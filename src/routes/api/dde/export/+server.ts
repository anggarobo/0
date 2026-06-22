import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { json, type RequestHandler } from '@sveltejs/kit';
import libre from 'libreoffice-convert';
import ImageModule, { type ImageModuleOptions } from 'docxtemplater-image-module-free';
import sizeOf from 'image-size';
import { type Node, Parser } from 'commonmark';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

const convertAsync = (inputBuffer: Buffer, format: string): Promise<Buffer> => {
	return new Promise((resolve, reject) => {
		libre.convert(inputBuffer, format, undefined, (err, done) => {
			if (err) reject(err);
			else resolve(done);
		});
	});
};

function base64DataURLToArrayBuffer(tagValue: string): Buffer<ArrayBuffer> | null {
	const base64Regex = /^(?:data:)?image\/(png|jpg|jpeg|svg|svg\+xml);base64,/;

	const validBase64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

	if (typeof tagValue !== 'string' || !base64Regex.test(tagValue)) {
		return null;
	}

	const stringBase64 = tagValue.replace(base64Regex, '');

	if (!validBase64.test(stringBase64)) {
		throw new Error('Error parsing base64 data, your data contains invalid characters');
	}

	// For nodejs, return a Buffer
	if (typeof Buffer !== 'undefined' && Buffer.from) {
		return Buffer.from(stringBase64, 'base64');
	}

	return null;
}

// XML Helpers

// Escape XML
const escapeXml = (text: string) =>
	text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function runProps(props: string[]) {
	return props.length ? `<w:rPr>${props.join('')}</w:rPr>` : '';
}

function textRun(text: string, props: string[] = []) {
	return `
		<w:r>
			${runProps(props)}
			<w:t xml:space="preserve">${escapeXml(text)}</w:t>
		</w:r>`;
}

function paragraph(
	runs: string[],
	style?: string,
	indent?: boolean,
	numId?: number,
	ilvl?: number
) {
	let pPr = '';
	if (style || indent || numId !== undefined) {
		pPr += '<w:pPr>';
		if (style) pPr += `<w:pStyle w:val="${style}"/>`;
		if (indent) pPr += `<w:ind w:left="720"/>`;
		if (numId !== undefined && ilvl !== undefined) {
			pPr += `<w:numPr><w:ilvl w:val="${ilvl}"/><w:numId w:val="${numId}"/></w:numPr>`;
		}
		pPr += '</w:pPr>';
	}

	return `<w:p>${pPr}${runs.join('')}</w:p>`;
}

// renderNode dengan list, inline code, link
// numId map: 1 = unordered, 2 = ordered
const LIST_NUM_ID = { bullet: 1, ordered: 2 };

function renderNode(node: Node, listLevel: number = 0): string {
	switch (node.type) {
		case 'heading': {
			const runs: string[] = [];
			let child = node.firstChild;
			while (child) {
				runs.push(...renderInline(child));
				child = child.next;
			}
			return paragraph(runs, `Heading${node.level}`);
		}
		case 'paragraph': {
			const runs: string[] = [];
			let child = node.firstChild;
			while (child) {
				runs.push(...renderInline(child));
				child = child.next;
			}
			return paragraph(runs);
		}
		case 'code_block': {
			return paragraph(
				[
					textRun(node.literal || '', [
						`<w:rFonts w:ascii="Consolas"/>`,
						`<w:color w:val="444444"/>`
					])
				],
				'CodeBlock'
			);
		}
		case 'block_quote': {
			const parts: string[] = [];
			let child = node.firstChild;
			while (child) {
				parts.push(renderNode(child, listLevel));
				child = child.next;
			}
			return parts
				.map((p) => p.replace('<w:p>', `<w:p><w:pPr><w:ind w:left="720"/></w:pPr>`))
				.join('');
		}
		case 'list': {
			const parts: string[] = [];
			let child = node.firstChild;
			const numId = node.listType === 'bullet' ? LIST_NUM_ID.bullet : LIST_NUM_ID.ordered;
			while (child) {
				parts.push(renderListItem(child, listLevel, numId));
				child = child.next;
			}
			return parts.join('');
		}
		default:
			return '';
	}
}

function renderListItem(node: Node, level = 0, numId = 1): string {
	let xml = '';
	let child = node.firstChild;

	while (child) {
		if (child.type === 'item') {
			const runs: string[] = [];
			let grand = child.firstChild;
			while (grand) {
				// gunakan renderInline untuk inline formatting
				runs.push(...renderInline(grand));
				grand = grand.next;
			}
			xml += `<w:p>
                <w:pPr>
                    <w:numPr>
                        <w:ilvl w:val="${level}"/>
                        <w:numId w:val="${numId}"/>
                    </w:numPr>
                </w:pPr>
                ${runs.join('')}
            </w:p>`;

			// handle nested list inside this item
			let nested = child.firstChild;
			while (nested) {
				if (nested.type === 'list') {
					xml += renderListItem(nested, level + 1, numId);
				}
				nested = nested.next;
			}
		}
		child = child.next;
	}

	return xml;
}

function renderInline(node: Node): string[] {
	if (!node) return [];
	const runs: string[] = [];

	if (node.type === 'text') {
		runs.push(`<w:r><w:t xml:space="preserve">${escapeXml(node.literal || '')}</w:t></w:r>`);
	} else if (node.type === 'strong') {
		let child = node.firstChild;
		while (child) {
			runs.push(
				`<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${escapeXml(child.literal || '')}</w:t></w:r>`
			);
			child = child.next;
		}
	} else if (node.type === 'emph') {
		let child = node.firstChild;
		while (child) {
			runs.push(
				`<w:r><w:rPr><w:i/></w:rPr><w:t xml:space="preserve">${escapeXml(child.literal || '')}</w:t></w:r>`
			);
			child = child.next;
		}
	} else if (node.type === 'code') {
		let child = node.firstChild;
		while (child) {
			runs.push(
				`<w:r><w:rPr><w:rFonts w:ascii="Consolas"/><w:color w:val="444444"/></w:rPr><w:t xml:space="preserve">${escapeXml(child.literal || '')}</w:t></w:r>`
			);
			child = child.next;
		}
	} else if (node.type === 'link') {
		let child = node.firstChild;
		while (child) {
			runs.push(
				`<w:r><w:rPr><w:color w:val="0000FF"/><w:u w:val="single"/></w:rPr><w:t xml:space="preserve">${escapeXml(child.literal || '')}</w:t></w:r>`
			);
			child = child.next;
		}
	}

	return runs;
}

function mdToOoxml(md: string) {
	const reader = new Parser();
	const parsed = reader.parse(md);
	const ooxml: string[] = [];
	const walker = parsed.walker();
	let event;

	while ((event = walker.next())) {
		// console.log({
		// 	[event.node.type]: event.node.literal || event.node.type,
		// 	entering: event.entering
		// });
		// const e = event as unknown as CMWalkEvent;
		if (!event.entering) continue;
		const node = event.node;

		if (node.type === 'list') {
			ooxml.push(renderListItem(node, 0, node.listType === 'bullet' ? 1 : 2));
		} else if (
			node.type === 'paragraph' ||
			node.type === 'heading' ||
			node.type === 'code_block' ||
			node.type === 'block_quote'
		) {
			ooxml.push(renderNode(node));
		}
	}

	return ooxml.join('\n');
}

export const POST: RequestHandler = async ({ request }) => {
	let tempPdfPath = '';
	let tempDocxPath = '';
	try {
		const { content: description, ...data }: DDE & StaticDataDDE = await request.json();
		const payload = { ...data, ...description };

		// const brief_description = write.render(read.parse(description.brief_description))
		// payload.brief_description = write.render(brief_description);
		const markdown: string = description?.brief_description ?? '';
		if (!markdown || typeof markdown !== 'string') {
			throw new Error('brief_description harus berupa string markdown');
		}

		// const brief_description = mdToOoxml(markdown);
		const brief_description = await getRawXmlFromMd(description?.detail_description || '');

		// Path ke template DOCX
		const templatePath = path.resolve('tmp', 'docxtemplater.docx');
		if (!fs.existsSync(templatePath)) {
			return json({ error: 'template not found' }, { status: 404 });
		}

		// Buat salinan file template agar file asli tidak rusak
		tempDocxPath = path.resolve('tmp', `${data.ticket}_temp.docx`);
		const tempPdfDir = path.resolve('tmp');
		fs.copyFileSync(templatePath, tempDocxPath);

		// Baca dan proses DOCX template
		const content = fs.readFileSync(tempDocxPath, 'binary');
		const zip = new PizZip(content);

		const imageOptions: ImageModuleOptions = {
			getImage: (tag) => base64DataURLToArrayBuffer(tag),
			getSize: (img: Buffer) => {
				const dimensions = sizeOf(img);
				return [dimensions.width || 100, dimensions.height || 100];
			},
			centered: true
		};

		const doc = new Docxtemplater(zip, {
			modules: [new ImageModule(imageOptions)],
			// delimiters: { start: '{{', end: '}}' },
			nullGetter: () => '-',
			linebreaks: true
		});

		// Isi placeholder
		doc.render({ ...payload, brief_description });
		// await doc.renderAsync(payload);

		// Simpan file hasil pengisian
		const output = doc.getZip().generate({ type: 'nodebuffer' });
		fs.writeFileSync(tempDocxPath, output);

		// Konversi DOCX → PDF dengan LibreOffice (headless)
		const pdfBuffer = await convertAsync(output, '.pdf');

		// Simpan PDF sementara
		tempPdfPath = path.join(tempPdfDir, `${data.ticket}_temp.pdf`);
		fs.writeFileSync(tempPdfPath, pdfBuffer);

		// Return PDF sebagai response
		return new Response(pdfBuffer as unknown as BodyInit, {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `attachment; filename="${data.ticket}.pdf"`
			}
		});
	} catch (error) {
		console.error('Error generating PDF:', error);
		return json({ error: (error as Error).message }, { status: 500 });
	} finally {
		setTimeout(async () => {
			try {
				if (tempPdfPath && fs.existsSync(tempPdfPath)) {
					await fs.promises.unlink(tempPdfPath);
					console.log(`Temporary PDF deleted: ${tempPdfPath}`);
				}
				if (tempDocxPath && fs.existsSync(tempDocxPath)) {
					await fs.promises.unlink(tempDocxPath);
					console.log(`Temporary Docx deleted: ${tempDocxPath}`);
				}
			} catch (err) {
				console.warn(`Failed to delete temp PDF: ${err}`);
			}
		}, 2000);
	}
};

const getRawXmlFromMd = async (markdown: string): Promise<string> => {
	const xml = await unified()
		.use(remarkParse) // Markdown → MDAST
		.use(remarkRehype) // MDAST → HAST (HTML AST)
		.use(rehypeStringify, { allowDangerousHtml: true, closeSelfClosing: true })
		.process(markdown);
	return String(xml);
};
