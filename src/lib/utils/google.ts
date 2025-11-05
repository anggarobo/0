import { OAuth2Client } from 'google-auth-library';

const oauth2client = new OAuth2Client({
	client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
	client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
	redirect_uris: import.meta.env.VITE_GOOGLE_REDIRECT_URI
});

export { oauth2client };
