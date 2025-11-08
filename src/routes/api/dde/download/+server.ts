import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { json, type RequestHandler } from '@sveltejs/kit';
import pdf from 'html-pdf';

export const POST: RequestHandler = async ({ request }) => {
	try {
		// Ambil data JSON dari request body
		const { content: description, ...data }: DDE & StaticDataDDE = await request.json();
		const payload = {
			...data,
			...description
		};

		// Path ke file template DOCX yang sudah ada
		const templatePath = path.resolve('tmp', 'template_document.docx');

		if (!fs.existsSync(templatePath)) {
			return json({ error: 'file not found' }, { status: 404 });
		}

		// Membaca file template DOCX
		console.log(templatePath);
		const tempDocxPath = path.resolve('tmp', `${data.ticket}_temp.docx`);
		fs.copyFileSync(templatePath, tempDocxPath);

		const contentBuffer = fs.readFileSync(tempDocxPath, 'binary');
		console.log(contentBuffer);

		// Menggunakan Mammoth untuk mengonversi DOCX ke HTML
		const { value: htmlContent } = await mammoth.convertToHtml({
			buffer: Buffer.from(contentBuffer, 'binary')
		});

		// Gantikan placeholder di HTML dengan data
		let modifiedHtml = htmlContent;
		Object.entries(payload).forEach(([key, value]) => {
			const regex = new RegExp(`{{${key}}}`, 'g');
			modifiedHtml = modifiedHtml.replace(regex, `${value || '-'}`);
		});

		// Konversi HTML ke PDF menggunakan html-pdf
		const pdfOutputPath = path.join('static', `${data.ticket}.pdf`);

		await new Promise((resolve, reject) => {
			pdf.create(modifiedHtml).toFile(pdfOutputPath, (err) => {
				if (err) reject(err);
				else resolve(true);
			});
		});

		// Hapus file sementara
		await fs.promises.unlink(tempDocxPath);

		return json({ message: 'success', pdfUrl: `/${data.ticket}.pdf` });
	} catch (error) {
		console.error(error);
		return json({ error: 'internal server error' }, { status: 500 });
	}
};
