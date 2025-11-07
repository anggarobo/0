import { docs_v1, drive_v3, google, sheets_v4 } from 'googleapis';
import { env } from '$env/dynamic/private';

const SPREADSHEET_ID = env.GOOGLE_SHEET_ID;
const DDE_TICKETS_RANGE = 'DDE!A:D';
const DDE_RANGE = 'DDE!A:X';

async function googleApi(): Promise<{
	docs: docs_v1.Docs;
	sheets: sheets_v4.Sheets;
	drive: drive_v3.Drive;
}> {
	const credentials = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT);
	const auth = new google.auth.GoogleAuth({
		credentials,
		scopes: [
			'https://www.googleapis.com/auth/documents',
			'https://www.googleapis.com/auth/drive',
			'https://www.googleapis.com/auth/drive.file'
		]
	});

	return {
		docs: google.docs({ version: 'v1', auth }),
		sheets: google.sheets({ version: 'v4', auth }),
		drive: google.drive({ version: 'v3', auth })
	};
}

export { SPREADSHEET_ID, DDE_TICKETS_RANGE, DDE_RANGE, googleApi };
