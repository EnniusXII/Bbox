import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export const createGreenCard = async (data, hash, gfs, fileName) => {
  return new Promise(async (resolve, reject) => {
    try {
      let qrBuffer;
      try {
        qrBuffer = await QRCode.toBuffer(hash, { width: 150 });
      } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
      }

      const doc = new PDFDocument();
      const writeStream = gfs.openUploadStream(fileName);

      doc.pipe(writeStream);

      doc.fontSize(20).text('Grönt Kort för Fordonsförsäkring', { align: 'center' });
      doc.moveDown();

      doc.fontSize(12).text(`Försäkringstagare: ${data.insured.name}`);
      doc.text(`Adress: ${data.insured.address}`);
      doc.text(`Registreringsnummer: ${data.vehicle.registrationNumber}`);
      doc.text(`Fordonskategori: ${data.vehicle.category}`);
      doc.text(`Försäkringsbolag: ${data.insurance.companyName}`);
      doc.text(`Giltigt från: ${data.validity.from}`);
      doc.text(`Giltigt till: ${data.validity.to}`);
      doc.moveDown();

      doc.text('Gäller i följande länder:');
      data.countriesCovered.forEach((country) => {
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
        console.error('Error during GridFS upload:', error);
        reject({
          message: 'Error creating PDF',
          error,
        });
      });
    } catch (error) {
      reject({
        message: 'Error creating PDF',
        error,
      });
    }
  })
}