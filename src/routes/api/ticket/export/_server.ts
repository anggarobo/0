import { json, type RequestHandler } from '@sveltejs/kit';
import { TemplateHandler, type TemplateData } from 'easy-template-x';
import fs from 'fs';
import path, { format } from 'path';
import libre from 'libreoffice-convert';

export const POST: RequestHandler = async ({ request }) => {
	let tempPdfPath = '';
	let duplicatedDocx = '';
	try {
		const { content: description, ...data }: DDE & StaticDataDDE = await request.json();
		const payload: TemplateData = {
			...data,
			brief_description: {
				_type: 'rawXml',
				xml: description.brief_description
			},
			logo: imageField(data.logo, 'Logo'),
			sign_prepared_by: imageField(data.sign_prepared_by, 'Sign Prepared By'),
			sign_approver1: imageField(data.sign_approver1, 'Sign Approver 1'),
			sign_approver2: imageField(data.sign_approver2, 'Sign Approver 2')
		};

		const templateDocx = path.resolve('tmp', 'docx-template.docx');
		if (!fs.existsSync(templateDocx)) {
			return json({ error: 'template not found' }, { status: 404 });
		}

		duplicatedDocx = path.resolve('tmp', `${data.ticket}_tmp.docx`);
		const tempDir = path.resolve('tmp');
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir);
		}
		fs.copyFileSync(templateDocx, duplicatedDocx);

		const handler = new TemplateHandler();
		const docBuffer = await handler.process(fs.readFileSync(duplicatedDocx), payload);

		console.log({ docBuffer });

		// save as the generated docx to duplicatedDocx
		// fs.writeFileSync(duplicatedDocx, doc);
		// await fs.promises.writeFile(duplicatedDocx, docBuffer);
		const pdfBuffer = await convertAsync(fs.readFileSync(duplicatedDocx), '.pdf');

		// save pdf to tempPdfPath
		tempPdfPath = path.resolve(tempDir, `${data.ticket}_output.pdf`);
		fs.writeFileSync(tempPdfPath, pdfBuffer);

		// return the pdf as response
		const pdfData = fs.readFileSync(tempPdfPath);
		return new Response(pdfData, {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `attachment; filename=${data.ticket}.pdf`
			}
		});
	} catch (error) {
		console.error('Error generating PDF:', error);
		return json({ error: (error as Error).message }, { status: 500 });
	} finally {
		try {
			if (tempPdfPath && fs.existsSync(tempPdfPath)) {
				fs.unlinkSync(tempPdfPath);
			}
			if (duplicatedDocx && fs.existsSync(duplicatedDocx)) {
				fs.unlinkSync(duplicatedDocx);
			}
		} catch (err) {
			console.warn('Cleanup failed:', err);
		}
	}
};

function imageField(base64: string, altText: string) {
	return {
		_type: 'image',
		altText,
		format: getBase64ImageFormat(base64),
		source: Buffer.from(base64.split(',')[1], 'base64')
	};
}

function getBase64ImageFormat(base64: string) {
	const match = base64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
	if (!match) return 'image/png';
	return `image/${match[1].split('/')[1]}`; // -> "png", "jpeg", "gif"
}

const convertAsync = (inputBuffer: Buffer, format: string): Promise<Buffer> => {
	return new Promise((resolve, reject) => {
		libre.convert(inputBuffer, format, undefined, (err, done) => {
			if (err) reject(err);
			else resolve(done);
		});
	});
};
