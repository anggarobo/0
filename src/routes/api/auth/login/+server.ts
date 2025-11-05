import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI, GOOGLE_CLIENT_SECRET } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import { google } from 'googleapis';

export const GET = async () => {
	const oauth2client = new google.auth.OAuth2(
		GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET,
		GOOGLE_REDIRECT_URI
	);

	const url = oauth2client.generateAuthUrl({
		access_type: 'offline',
		scope: [
			'https://www.googleapis.com/auth/documents',
			'https://www.googleapis.com/auth/documents.readonly',
			'https://www.googleapis.com/auth/drive',
			'https://www.googleapis.com/auth/drive.file',
			'https://www.googleapis.com/auth/drive.readonly',
			'https://www.googleapis.com/auth/userinfo.profile'
		],
		prompt: 'consent'
	});

	throw redirect(302, url);
};
