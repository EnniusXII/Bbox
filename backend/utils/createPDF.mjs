import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export const createGreenCard = async (data, hash, gfs, fileName) => {
	return new Promise(async (resolve, reject) => {
		try {
			let qrBuffer;
			try {
				qrBuffer = await QRCode.toBuffer(hash, { width: 150 });
				console.log('✅ QR Code generated successfully.');
			} catch (error) {
				console.error('❌ Error generating QR code:', error);
				return reject({ message: 'Failed to generate QR code', error });
			}

			const doc = new PDFDocument();
			const writeStream = gfs.openUploadStream(fileName);

			doc.pipe(writeStream);

			// ✅ Verify `data` structure before using it
			if (
				!data.insured ||
				!data.vehicle ||
				!data.insurance ||
				!data.validity
			) {
				console.error('❌ Missing required fields in `data`:', data);
				return reject({ message: 'Missing required data fields' });
			}

			// Add content to PDF
			doc.fontSize(20).text('Grönt Kort för Fordonsförsäkring', {
				align: 'center',
			});
			doc.moveDown();

			doc.fontSize(12).text(`Försäkringstagare: ${data.insured.name}`);
			doc.text(`Adress: ${data.insured.address || 'N/A'}`);
			doc.text(`Registreringsnummer: ${data.vehicle.registrationNumber}`);
			doc.text(`Fordonskategori: ${data.vehicle.category}`);
			doc.text(`Försäkringsbolag: ${data.insurance.companyName}`);
			doc.text(`Giltigt från: ${data.validity.from}`);
			doc.text(`Giltigt till: ${data.validity.to}`);
			doc.moveDown();

			doc.text('Gäller i följande länder:');
			(data.countriesCovered || []).forEach((country) => {
				doc.text(`- ${country}`);
			});

			doc.image(qrBuffer, 450, 700, { width: 100, height: 100 });

			doc.moveDown().text(`Hash: ${hash}`, { align: 'center' });

			doc.end();

			writeStream.on('finish', () => {
				resolve({
					message: 'PDF with QR code created and stored successfully',
					fileId: writeStream.id,
				});
			});

			writeStream.on('error', (error) => {
				console.error('❌ Error during GridFS upload:', error);
				reject({
					message: 'Error creating PDF',
					error,
				});
			});
		} catch (error) {
			console.error('❌ Unexpected error while creating PDF:', error);
			reject({
				message: 'Error creating PDF',
				error,
			});
		}
	});
};
