import { json, type RequestHandler } from '@sveltejs/kit';
import { googleApi, SPREADSHEET_ID, DDE_TICKETS_RANGE } from '$lib/utils/google';

export const GET: RequestHandler = async ({ url }) => {
	const { sheets } = await googleApi();
	const row = url.searchParams.get('row');
	let RANGE = DDE_TICKETS_RANGE;

	if (row !== null) {
		RANGE = `DDE!A${row}:X${row}`;
	}
	const res = await sheets.spreadsheets.values.get({
		spreadsheetId: SPREADSHEET_ID,
		range: RANGE
	});

	const values = res.data.values || [];
	let data: SheetRow[] = [];
	const nSlice = row !== null ? 0 : 1;
	data = values.slice(nSlice).map((row) => ({
		id: row[0],
		ticket: row[1],
		task_name: row[3],
		meta: {
			document_no: row[2],
			project: row[4],
			revision_no: row[5],
			budget_days: row[6],
			date: row[7],
			revision_date: row[8],
			assignee: row[9],
			target_release: row[10],
			release_date: row[22]
		},
		content: {
			description: {
				brief: row[11],
				detail: row[13]
			},
			process_flow: row[12],
			design: {
				ui: row[14],
				db: row[15]
			}
		},
		approvers: [
			{
				name: row[16],
				sign: row[18],
				position: row[20]
			},
			{
				name: row[17],
				sign: row[19],
				position: row[21]
			}
		]
	}));

	return json({
		data,
		status: 200
	});
};

// export const POST: RequestHandler = async ({ request }) => {
// 	const {
// 		ticket,
// 		doc_no,
// 		task_name,
// 		project,
// 		revision_no,
// 		budget_days,
// 		date,
// 		revision_date,
// 		assignee,
// 		target_release,
// 		brief_description,
// 		process_flow,
// 		detail_description,
// 		ui_design,
// 		db_design
// 	} = await request.json();
// 	if (!ticket) {
// 		return new Response(JSON.stringify({ error: 'Invalid data' }), { status: 400 });
// 	}

// 	const sheets = await getSheetsClient();
// 	await sheets.spreadsheets.values.append({
// 		spreadsheetId: SPREADSHEET_ID,
// 		range: DDE_TICKETS_RANGE,
// 		valueInputOption: 'USER_ENTERED',
// 		requestBody: {
// 			values: [
// 				[
// 					ticket,
// 					doc_no,
// 					task_name,
// 					project,
// 					revision_no,
// 					budget_days,
// 					date,
// 					revision_date,
// 					assignee,
// 					target_release,
// 					brief_description,
// 					process_flow,
// 					detail_description,
// 					ui_design,
// 					db_design
// 				]
// 			]
// 		}
// 	});

// 	return new Response(JSON.stringify({ message: 'Data added successfully' }), { status: 201 });
// };
