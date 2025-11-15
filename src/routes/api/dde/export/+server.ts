import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { json, type RequestHandler } from '@sveltejs/kit';
import libre from 'libreoffice-convert';
import ImageModule, { type ImageModuleOptions } from 'docxtemplater-image-module-free';
import sizeOf from 'image-size';
// import { Parser, XmlRenderer } from 'commonmark';

const convertAsync = (inputBuffer: Buffer, format: string): Promise<Buffer> => {
	return new Promise((resolve, reject) => {
		libre.convert(inputBuffer, format, undefined, (err, done) => {
			if (err) reject(err);
			else resolve(done);
		});
	});
};

function base64DataURLToArrayBuffer(tagValue: string): Buffer<ArrayBuffer> | null {
	const base64Regex = /^(?:data:)?image\/(png|jpg|jpeg|svg|svg\+xml);base64,/;

	const validBase64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

	if (typeof tagValue !== 'string' || !base64Regex.test(tagValue)) {
		return null;
	}

	const stringBase64 = tagValue.replace(base64Regex, '');

	if (!validBase64.test(stringBase64)) {
		throw new Error('Error parsing base64 data, your data contains invalid characters');
	}

	// For nodejs, return a Buffer
	if (typeof Buffer !== 'undefined' && Buffer.from) {
		return Buffer.from(stringBase64, 'base64');
	}

	return null;
}

export const POST: RequestHandler = async ({ request }) => {
	let tempPdfPath = '';
	let tempDocxPath = '';
	try {
		// const read = new Parser();
		// const write = new XmlRenderer({ sourcepos: true });
		const { content: description, ...data }: DDE & StaticDataDDE = await request.json();
		const payload = { ...data, ...description };
		// const brief_description = write.render(read.parse(description.brief_description))
		// payload.brief_description = write.render(brief_description);

		// Path ke template DOCX
		const templatePath = path.resolve('tmp', 'docxtemplater.docx');
		if (!fs.existsSync(templatePath)) {
			return json({ error: 'template not found' }, { status: 404 });
		}

		// Buat salinan file template agar file asli tidak rusak
		tempDocxPath = path.resolve('tmp', `${data.ticket}_temp.docx`);
		const tempPdfDir = path.resolve('tmp');
		fs.copyFileSync(templatePath, tempDocxPath);

		// Baca dan proses DOCX template
		const content = fs.readFileSync(tempDocxPath, 'binary');
		const zip = new PizZip(content);

		const imageOptions: ImageModuleOptions = {
			getImage: (tag) => base64DataURLToArrayBuffer(tag),
			getSize: (img: Buffer) => {
				const dimensions = sizeOf(img);
				return [dimensions.width || 100, dimensions.height || 100];
			},
			centered: true
		};

		const doc = new Docxtemplater(zip, {
			modules: [new ImageModule(imageOptions)],
			// delimiters: { start: '{{', end: '}}' },
			nullGetter: () => '-',
			linebreaks: true
		});

		// console.log(brief_description);

		// Isi placeholder
		doc.render(payload);
		// await doc.renderAsync(payload);

		// Simpan file hasil pengisian
		const output = doc.getZip().generate({ type: 'nodebuffer' });
		fs.writeFileSync(tempDocxPath, output);

		// Konversi DOCX → PDF dengan LibreOffice (headless)
		const pdfBuffer = await convertAsync(output, '.pdf');

		// Simpan PDF sementara
		tempPdfPath = path.join(tempPdfDir, `${data.ticket}_temp.pdf`);
		fs.writeFileSync(tempPdfPath, pdfBuffer);

		// Return PDF sebagai response
		return new Response(pdfBuffer as unknown as BodyInit, {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': `attachment; filename="${data.ticket}.pdf"`
			}
		});
	} catch (error) {
		console.error('Error generating PDF:', error);
		return json({ error: (error as Error).message }, { status: 500 });
	} finally {
		setTimeout(async () => {
			try {
				if (tempPdfPath && fs.existsSync(tempPdfPath)) {
					await fs.promises.unlink(tempPdfPath);
					console.log(`Temporary PDF deleted: ${tempPdfPath}`);
				}
				if (tempDocxPath && fs.existsSync(tempDocxPath)) {
					await fs.promises.unlink(tempDocxPath);
					console.log(`Temporary Docx deleted: ${tempDocxPath}`);
				}
			} catch (err) {
				console.warn(`Failed to delete temp PDF: ${err}`);
			}
		}, 2000);
	}
};
