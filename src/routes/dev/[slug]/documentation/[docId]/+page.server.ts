import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
// import { google } from 'googleapis';
import { error } from '@sveltejs/kit';
import TurndownService from 'turndown';
import { google } from 'googleapis';

const {
	/** GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, */
	GOOGLE_API_KEY
} = env;

export const load: PageServerLoad = async ({ /** cookies, */ params }) => {
	// const access_token = cookies.get('google_access_token');
	// const refresh_token = cookies.get('google_refresh_token');

	// if (!access_token && !refresh_token) {
	// 	return {
	// 		authRequired: true
	// 	};
	// }

	// const oauth2client = new google.auth.OAuth2(
	// 	GOOGLE_CLIENT_ID,
	// 	GOOGLE_CLIENT_SECRET,
	// 	GOOGLE_REDIRECT_URI
	// );

	// oauth2client.setCredentials({
	// 	access_token,
	// 	refresh_token
	// });

	// oauth2client.on('tokens', (tokens) => {
	// 	if (tokens.access_token) {
	// 		cookies.set('google_access_token', tokens.access_token, {
	// 			httpOnly: true,
	// 			path: '/',
	// 			maxAge: 3600
	// 		});
	// 	}
	// });

	// const oauth2client = new google.auth.OAuth2({
	//     apiKey: GOOGLE_API_KEY
	// })

	try {
		const drive = google.drive({ version: 'v3', auth: GOOGLE_API_KEY });

		// Ambil metadata dokumen
		const meta = await drive.files.get({
			fileId: params.docId,
			fields: 'id, name, mimeType, modifiedTime, owners, webViewLink'
		});
		// const meta: MetaDoc = await metares.json();
		const res = await fetch(
			`https://docs.google.com/document/d/${params.docId}/export?format=html`
		);

		if (!res.ok) {
			throw error(res.status, `Failed to fetch document: ${res.statusText}`);
		}

		console.log(meta.data);

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
