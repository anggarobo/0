// src/routes/api/generate-pdf/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { TemplateHandler, type TemplateData } from 'easy-template-x';
import fs from 'fs';
import path from 'path';
import libre from 'libreoffice-convert';
import { z } from 'zod';

/**
 * Zod schema untuk validasi request body (ubah sesuai kebutuhan)
 */
const requestSchema = z.object({
	content: z.object({
		brief_description: z.string().optional().nullable()
	}),
	logo: z.string(),
	document_type: z.string().optional(),
	assignee: z.string().optional(),
	prepared_by: z.string().optional(),
	sign_prepared_by: z.string().optional().nullable(),
	position_prepared_by: z.string().optional(),
	approver1: z.string().optional(),
	sign_approver1: z.string().optional().nullable(),
	position_approver1: z.string().optional(),
	approver2: z.string().optional(),
	sign_approver2: z.string().optional().nullable(),
	position_approver2: z.string().optional(),
	project: z.string().optional(),
	ticket: z.string()
});

/**
 * Helper: detect image format from a base64 data URL OR from raw base64 by inspecting bytes
 */
// async function detectBase64Format(base64OrDataUrl: string): Promise<string | null> {
// 	if (!base64OrDataUrl) return null;

// 	// If there is a data URL prefix, extract mime type
// 	const match = base64OrDataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
// 	if (match) {
// 		const mime = match[1]; // e.g. image/png
// 		return mime.split('/')[1]; // png, jpeg, webp, gif
// 	}

// 	// Otherwise base64-only: try detect via file-type from buffer
// 	try {
// 		const buffer = Buffer.from(base64OrDataUrl, 'base64');
// 		const ft = await fileType.fromBuffer(buffer);
// 		if (ft && ft.ext) return ft.ext;
// 		// fallback to checking magic bytes (very simple)
// 		const start = buffer.toString('base64', 0, 12);
// 		if (start.startsWith('iVBOR')) return 'png';
// 		if (start.startsWith('/9j/')) return 'jpeg';
// 		if (start.startsWith('R0lGOD')) return 'gif';
// 		if (start.startsWith('UklGR')) return 'webp';
// 	} catch (e) {
// 		// ignore detection errors
//         console.error('Error detecting base64 format:', e);
// 	}

// 	return null;
// }

function getBase64ImageFormat(base64: string) {
	const match = base64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
	if (!match) return 'image/png';
	return `image/${match[1].split('/')[1]}`; // -> "png", "jpeg", "gif"
}

/**
 * Helper: build image object for easy-template-x
 * Throws error if base64 invalid.
 */
async function imageField(
	base64Value: string | undefined | null,
	altText = 'image',
	size: { width?: number; height?: number } = {}
) {
	if (!base64Value) throw new Error(`Missing image data for ${altText}`);

	// If data URL, split after comma; otherwise assume whole string is base64
	const maybeParts = base64Value.split(',');
	const rawBase64 = maybeParts.length > 1 ? maybeParts[1] : maybeParts[0];

	// Validate base64 -> produce buffer
	let buffer: Buffer;
	try {
		buffer = Buffer.from(rawBase64, 'base64');
		// quick sanity: buffer length
		if (buffer.length < 16) throw new Error('Image buffer too small / invalid');
	} catch (err) {
		console.error('Error parsing base64 image:', err);
		throw new Error(`Invalid base64 for ${altText}`);
	}

	// Detect format (try data url or magic bytes)
	const format = getBase64ImageFormat(base64Value);

	return {
		...size,
		_type: 'image' as const,
		altText,
		format,
		source: buffer
	};
}

/**
 * Helper: wrap libre.convert to Promise
 */
const convertAsync = (inputBuffer: Buffer, format: string): Promise<Buffer> => {
	return new Promise((resolve, reject) => {
		libre.convert(inputBuffer, format, undefined, (err, done) => {
			if (err) return reject(err);
			resolve(done);
		});
	});
};

/**
 * Ensure tmp dir exists (some environments may need it, but we keep I/O minimal)
 */
async function ensureTmpDir() {
	const tmpDir = path.resolve('tmp');
	try {
		await fs.promises.mkdir(tmpDir, { recursive: true });
	} catch (e) {
		console.error('Error ensuring tmp dir:', e);
		/* ignore */
	}
	return tmpDir;
}

/**
 * The POST handler
 */
export const POST: RequestHandler = async ({ request }) => {
	// validate JSON shape first
	let parsedBody;
	try {
		const raw = await request.json();
		parsedBody = requestSchema.parse(raw);
	} catch (err) {
		console.error('Request validation failed:', err);
		return json(
			{ error: 'Invalid request payload', details: (err as Error).message },
			{ status: 400 }
		);
	}

	// destructure typed variables
	const { content: description, ...data } = parsedBody as DDE & StaticDataDDE;

	// Path to template docx
	const templateDocxPath = path.resolve('tmp', 'docx-template.docx');
	if (!fs.existsSync(templateDocxPath)) {
		return json({ error: 'template not found' }, { status: 404 });
	}

	try {
		// build payload for easy-template-x
		// NOTE: imageField returns Promise so we await for each image
		const payload: TemplateData = {
			...data,
			brief_description: {
				_type: 'rawXml',
				xml: description?.brief_description ?? ''
			},
			logo: await imageField(data.logo, 'Logo', { width: 100, height: 43 }),
			sign_prepared_by: await imageField(data.sign_prepared_by, 'Sign Prepared By', {
				width: 150,
				height: 150
			}),
			sign_approver1: await imageField(data.sign_approver1, 'Sign Approver 1', {
				width: 150,
				height: 150
			}),
			sign_approver2: await imageField(data.sign_approver2, 'Sign Approver 2', {
				width: 150,
				height: 150
			})
		};

		// create handler & process template from memory (avoid extra disk I/O)
		const handler = new TemplateHandler();

		// read template (async)
		const templateBuffer = await fs.promises.readFile(templateDocxPath);

		// process -> produce docx buffer
		const docxBuffer = await handler.process(templateBuffer, payload);

		// convert docx buffer -> pdf buffer (in-memory)
		const pdfBuffer = await convertAsync(docxBuffer, '.pdf');

		// Return PDF as Response stream
		return new Response(pdfBuffer as unknown as BodyInit, {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `attachment; filename="${data.ticket ?? 'document'}.pdf"`
			}
		});
	} catch (err) {
		console.error('Error generating PDF:', err);
		// Distinguish known errors and return 400 where appropriate
		const message = (err as Error).message ?? 'Internal error';
		return json({ error: message }, { status: 500 });
	} finally {
		// no temp files are created in this flow; but ensure tmp exists for other workflows
		await ensureTmpDir();
	}
};
