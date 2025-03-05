import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import GreenCard from "../models/GreenCardModel.mjs";
import { uploadToIPFS, uploadJsonToIPFS } from "./ipfsService.mjs";
import { mintNft } from "./blockchainService.mjs";
import crypto from 'crypto';

// Generate Unique Hash for NFT
function generateUniqueHash(data) {
    const hashData = `${data.policyholder.name}${data.vehicleInfo.registrationNumber}${data.insuranceCompany.name}${data.validity.from}${data.validity.to}`;
    return crypto.createHash('sha256').update(hashData).digest('hex');
}

// Generate PDF and Mint NFT
export async function createGreenCardNFT(greenCardId) {
    try {
        const greenCard = await GreenCard.findById(greenCardId);
        if (!greenCard) throw new Error('Green Card not found');

        const doc = new PDFDocument({ size: "A4", margin: 50 });
        const outputFilePath = `green-card-${greenCardId}.pdf`;
        doc.pipe(fs.createWriteStream(outputFilePath));

        // Add Green Card details to PDF
        doc.fontSize(20).text('Green Card for Vehicle Insurance', { align: 'center' }).moveDown();
        doc.fontSize(12).text(`Card Number: ${greenCard.cardNumber}`).moveDown();
        doc.text(`Registration Number: ${greenCard.vehicleInfo.registrationNumber}`);
        doc.text(`Category: ${greenCard.vehicleInfo.category}`).moveDown();
        doc.text(`Policyholder: ${greenCard.policyholder.name}`);
        doc.text(`Address: ${greenCard.policyholder.address}`).moveDown();
        doc.text(`Insurance Company: ${greenCard.insuranceCompany.name}`);
        doc.text(`Contact: ${greenCard.insuranceCompany.contact}`).moveDown();
        doc.text(`Validity: ${greenCard.validity.from.toDateString()} - ${greenCard.validity.to.toDateString()}`).moveDown();
        doc.text(`Covered Countries: ${greenCard.coveredCountries.join(", ")}`).moveDown();

        // Generate QR Code
        const uniqueHash = generateUniqueHash(greenCard);
        const qrCodeData = `https://example.com/verify/${uniqueHash}`;
        const qrCodeImage = await QRCode.toDataURL(qrCodeData);
        const qrBuffer = Buffer.from(qrCodeImage.split(',')[1], 'base64');
        doc.image(qrBuffer, doc.page.width - 100, doc.page.height - 100, { width: 80 });

        doc.end();
        console.log(`PDF generated: ${outputFilePath}`);

        // Upload QR to IPFS
        const qrIpfsUrl = await uploadToIPFS(qrCodeImage);
        if (!qrIpfsUrl) throw new Error("QR Code upload failed");

        // Upload Metadata to IPFS
        const metadata = {
            name: "Green Card NFT",
            description: "This NFT verifies a Green Card document.",
            image: qrIpfsUrl,
            document_hash: uniqueHash,
            policyholder: greenCard.policyholder.name
        };
        const metadataIpfsUrl = await uploadJsonToIPFS(metadata);
        if (!metadataIpfsUrl) throw new Error("Metadata upload failed");

        // Mint NFT
        return await mintNft(uniqueHash, metadataIpfsUrl, "0x3f3ca9A42a0d288106573A2A3c8C842b1456425B");
        
    } catch (error) {
        console.error("Error generating NFT:", error);
        throw error;
    }
}