import { env } from '$env/dynamic/private';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';
import { google } from 'googleapis';

const {
	/** GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI,  */
	GOOGLE_DRIVE_FOLDER_ID,
	GOOGLE_API_KEY
} = env;

// GDRIVE PUBLIC FOLDER
export const load: PageServerLoad = async ({ /** cookies, */ params }) => {
	if (params.slug !== 'dataon') {
		throw redirect(302, '/');
	}

	if (!GOOGLE_DRIVE_FOLDER_ID) {
		throw error(500, 'Missing GOOGLE_DRIVE_FOLDER_ID');
	}

	const oauth2client = new google.auth.OAuth2({
		apiKey: GOOGLE_API_KEY
	});

	const drive = google.drive({ version: 'v3', auth: oauth2client });

	try {
		const res = await drive.files.list({
			q: `'${GOOGLE_DRIVE_FOLDER_ID}' in parents`,
			fields: 'files(id,name,mimeType,webViewLink)'
		});

		const files = res.data.files;

		if (files && files.length < 1) {
			return error(404, 'not found');
		}

		return {
			data: files,
			status: res.status,
			message: res.statusText
		};
	} catch (err) {
		throw error(500, (err as Error).message);
	}
};

// PRIVATE ACCESS
// export const load: PageServerLoad = async ({ cookies, params }) => {
// 	if (params.slug !== 'dataon') {
// 		throw redirect(302, '/');
// 	}
// 	const access_token = cookies.get('google_access_token');
// 	const refresh_token = cookies.get('google_refresh_token');

// 	if (!access_token && !refresh_token) {
// 		return {
// 			authRequired: true
// 		};
// 	}

// 	if (!GOOGLE_DRIVE_FOLDER_ID) {
// 		throw error(500, 'Missing GOOGLE_DRIVE_FOLDER_ID');
// 	}

// 	const oauth2client = new google.auth.OAuth2(
// 		GOOGLE_CLIENT_ID,
// 		GOOGLE_CLIENT_SECRET,
// 		GOOGLE_REDIRECT_URI
// 	);

// 	oauth2client.setCredentials({
// 		access_token,
// 		refresh_token
// 	});

// 	oauth2client.on('tokens', (tokens) => {
// 		if (tokens.access_token) {
// 			cookies.set('google_access_token', tokens.access_token, {
// 				httpOnly: true,
// 				path: '/',
// 				maxAge: 3600
// 			});
// 		}
// 	});

// 	const drive = google.drive({ version: 'v3', auth: oauth2client });

// 	try {
// 		const res = await drive.files.list({
// 			q: `'${GOOGLE_DRIVE_FOLDER_ID}' in parents`,
// 			fields: 'files(id,name,mimeType,webViewLink)'
// 		});

// 		const files = res.data.files;

// 		if (files && files.length < 1) {
// 			return error(404, 'not found');
// 		}

// 		return {
// 			data: files,
// 			status: res.status,
// 			message: res.statusText
// 		};
// 	} catch (err) {
// 		// console.error(err);
// 		throw error(500, (err as Error).message);
// 	}
// };
