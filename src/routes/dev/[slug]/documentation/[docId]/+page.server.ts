import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import TurndownService from 'turndown';
import { google } from 'googleapis';

const { GOOGLE_API_KEY } = env;

export const load: PageServerLoad = async ({ /** cookies, */ params }) => {
	try {
		const drive = google.drive({ version: 'v3', auth: GOOGLE_API_KEY });

		const meta = await drive.files.get({
			fileId: params.docId,
			fields: 'id, name, mimeType, modifiedTime, owners, webViewLink'
		});
		const res = await fetch(
			`https://docs.google.com/document/d/${params.docId}/export?format=html`
		);

		if (!res.ok) {
			throw error(res.status, `Failed to fetch document: ${res.statusText}`);
		}

		const html = await res.text();
		const turndownService = new TurndownService({
			headingStyle: 'atx',
			codeBlockStyle: 'fenced'
		});
		const markdown = turndownService.turndown(html);

		return {
			status: 200,
			data: {
				docId: params.docId,
				html,
				meta: meta.data,
				markdown
			}
		};
	} catch (err) {
		throw error(500, (err as Error).message);
	}
};
