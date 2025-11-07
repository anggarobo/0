// src/routes/api/sheets/download/+server.ts
import { type RequestHandler } from '@sveltejs/kit';
import { googleApi } from '$lib/utils/google';
import { env } from '$env/dynamic/private';
import type { docs_v1 } from 'googleapis';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const documentId = env.DDE_TEMPLETE_DOCUMENT_ID;
		const { ticket, content, meta = {} }: SheetRow = await request.json();

		if (!ticket || !documentId || !content) {
			return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
		}

		const template = {
			...meta,
			process_flow: content.process_flow
		};

		const placeholders: Record<string, string> = {
			'{{ticket}}': ticket
		};

		Object.entries(template).forEach(([key, value]) => {
			const excList = ['revision_no', 'revision_date', 'assignee', 'project'];
			if (value && !excList.includes(key)) {
				placeholders[`{{${key}}}`] = `${value}`;
			}
			if (content.description?.brief) {
				placeholders['{{brief_description}}'] = content.description.brief;
			}
			if (content.description?.detail) {
				placeholders['{{detail_description}}'] = content.description.detail;
			}
		});

		const resetPlaceHolders = Object.entries(placeholders).reduce((acc, [key, value]) => {
			let reduce = { ...acc };
			if (value) {
				reduce = { ...acc, [value]: key };
			}

			return reduce;
		}, {});

		const requests = Object.entries(placeholders).map(([text, replaceText = '']) => ({
			replaceAllText: {
				containsText: { matchCase: true, text },
				replaceText
			}
		}));

		const resetRequests: docs_v1.Schema$Request[] = Object.entries(resetPlaceHolders).map(
			([text, replaceText = '']) => ({
				replaceAllText: {
					containsText: { matchCase: true, text },
					replaceText: replaceText as string
				}
			})
		);

		const { docs, drive } = await googleApi();

		await docs.documents.batchUpdate({
			documentId,
			requestBody: { requests }
		});

		const res = await drive.files.export(
			{ fileId: documentId, mimeType: 'application/pdf' },
			{ responseType: 'arraybuffer' }
		);

		if (!(res.data instanceof ArrayBuffer)) {
			throw new Error('Invalid response type from Google Drive export');
		}

		await docs.documents.batchUpdate({
			documentId,
			requestBody: { requests: resetRequests }
		});

		return new Response(Buffer.from(res.data), {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `attachment; filename="${ticket}.pdf"`
			}
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: (err as Error)?.message }), { status: 500 });
	}
};
