import { json, type RequestHandler } from '@sveltejs/kit';
import { googleApi, SPREADSHEET_ID } from '$lib/utils/google';

export const GET: RequestHandler = async () => {
	const { sheets } = await googleApi();
	const RANGE = 'Static!A6:M6';
	const res = await sheets.spreadsheets.values.get({
		spreadsheetId: SPREADSHEET_ID,
		range: RANGE
	});

	const values = res.data.values || [];
	let data: StaticDataDDE[] = [];
	data = values.slice(0).map((row) => ({
		logo: row[0],
		document_type: row[1],
		assignee: row[2],
		prepared_by: row[3],
		sign_prepared_by: row[4],
		position_prepared_by: row[5],
		approver1: row[6],
		sign_approver1: row[7],
		position_approver1: row[8],
		approver2: row[9],
		sign_approver2: row[10],
		position_approver2: row[11],
		project: row[12]
	}));

	return json({
		data,
		status: 200
	});
};
