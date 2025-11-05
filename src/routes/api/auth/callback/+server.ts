import { redirect, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { google } from 'googleapis';

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = env;

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	if (!code) throw redirect(302, '/');

	const oauth2client = new google.auth.OAuth2(
		GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET,
		GOOGLE_REDIRECT_URI
	);

	const { tokens } = await oauth2client.getToken(code);

	cookies.set('google_access_token', tokens.access_token ?? '', {
		path: '/',
		httpOnly: true,
		maxAge: 3600
	});

	if (tokens.refresh_token) {
		cookies.set('google_refresh_token', tokens.refresh_token, {
			path: '/',
			httpOnly: true,
			maxAge: 3600 * 24 * 30 // 30 hari
		});
	}

	throw redirect(302, '/dev/dataon/documentation');
};
