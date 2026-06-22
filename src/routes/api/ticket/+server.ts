import { json, type RequestHandler } from '@sveltejs/kit';
import { googleApi, SPREADSHEET_ID } from '$lib/utils/google';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const { sheets } = await googleApi();
		const rowParam = url.searchParams.get('row') || '';
		let RANGE = `DDE!A6:O`;

		if (rowParam) {
			RANGE = `DDE!A${rowParam}:O${rowParam}`;
		}
		const res = await sheets.spreadsheets.values.get({
			spreadsheetId: SPREADSHEET_ID,
			range: RANGE
		});

		const values = res.data.values || [];
		let data: DDE[] = [];
		const nSlice = !rowParam ? 1 : 0;
		data = values.slice(nSlice).map((row) => ({
			id: row[0],
			ticket: row[1],
			document_no: row[2],
			task_name: row[3],
			revision_no: row[4],
			budget_days: row[5],
			date: row[6],
			revision_date: row[7],
			target_release: row[8],
			release_date: row[9],
			content: {
				brief_description: row[10],
				process_flow: row[11],
				detail_description: row[12],
				ui_design: row[13],
				db_design: row[13]
			}
		}));

		return json({ data });
	} catch (err) {
		console.error(err);
		return json({ error: err });
	}
};
