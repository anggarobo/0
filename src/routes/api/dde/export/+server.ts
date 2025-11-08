import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { json, type RequestHandler } from '@sveltejs/kit';
import libre from 'libreoffice-convert';
import ImageModule from 'docxtemplater-image-module-free';
import sizeOf from 'image-size';

const convertAsync = (inputBuffer: Buffer, format: string): Promise<Buffer> => {
	return new Promise((resolve, reject) => {
		libre.convert(inputBuffer, format, undefined, (err, done) => {
			if (err) reject(err);
			else resolve(done);
		});
	});
};

export const POST: RequestHandler = async ({ request }) => {
	let tempPdfPath = '';
	let tempDocxPath = '';
	try {
		const { content: description, ...data }: DDE & StaticDataDDE = await request.json();
		const payload = { ...data, ...description };

		// Path ke template DOCX
		const templatePath = path.resolve('tmp', 'template_document.docx');
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
        const imageModule = new (ImageModule as any)({
			centered: true,
			getImage: async (tagValue: string) => {
                console.log({tagValue})
				if (!tagValue) return null;

				// Base64 data URI
				if (tagValue.startsWith('data:image')) {
					const base64 = tagValue.split(',')[1];
					return Buffer.from(base64, 'base64');
				}

				// URL eksternal (http / https)
				if (tagValue.startsWith('http')) {
					const res = await fetch(tagValue);
					if (!res.ok) throw new Error(`Failed to fetch image: ${tagValue}`);
					const arrayBuffer = await res.arrayBuffer();
					return Buffer.from(arrayBuffer);
				}

				// Kalau bukan base64 atau URL → skip
				return null;
			},
			getSize: (imgBuffer: Buffer) => {

                console.log({imgBuffer})
				try {
					const { width, height } = sizeOf(imgBuffer);
					const maxWidth = 120; // agar tabel tidak pecah
					const ratio = Math.min(maxWidth / width, 1);
					return [width * ratio, height * ratio];
				} catch {
					return [100, 60];
				}
			}
		});
		// const imageModule = new ImageModule({
		// 	getImage: (tagValue: string) => {
		// 		if (!tagValue) return null;
		// 		try {
		// 			const base64Data = tagValue.replace(/^data:image\/\w+;base64,/, '');
		// 			return Buffer.from(base64Data, 'base64');
		// 		} catch {
		// 			return null;
		// 		}
		// 	},
		// 	getSize: (img: Buffer) => {
		// 		const dimensions = sizeOf(img);
		// 		return [dimensions.width || 100, dimensions.height || 100];
		// 	},
		// 	centered: true
		// });

		const doc = new Docxtemplater(zip, {
			modules: [imageModule],
			delimiters: { start: '{{', end: '}}' },
			nullGetter: () => '-',
            parser
		});

		// Isi placeholder
		doc.render(payload);
		// doc.render();

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
