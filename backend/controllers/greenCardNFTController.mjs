import GreenCard from '../models/GreenCardSchema.mjs';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import crypto from 'crypto';
import QRCode from 'qrcode';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

dotenv.config();

const URL = process.env.WEBSITE_URL;

const contractABI = JSON.parse(
	fs.readFileSync(path.resolve('./GcNftContractAbi.json'), 'utf-8')
);
const contractAddress = '0x376A3BceCD373be36639CB9069f40ad149D079BA';
const walletAddress = '0x3f3ca9A42a0d288106573A2A3c8C842b1456425B';

// (Optional) In case you still need to generate a hash manually, you can use this function.
// But for NFT generation, we'll use the "hash" field from the schema.
// function generateUniqueHash(data) {
//   const hashData = `${data.insured.name}${data.vehicle.registrationNumber}${data.insurance.companyName}${data.validity.from}${data.validity.to}`;
//   return crypto.createHash("sha256").update(hashData).digest("hex");
// }

// Upload Image to IPFS
async function uploadToIPFS(imageBase64) {
	const buffer = Buffer.from(imageBase64.split(',')[1], 'base64');
	const formData = new FormData();
	formData.append('file', buffer, { filename: 'qrCode.png' });

	try {
		const response = await axios.post(
			'https://api.pinata.cloud/pinning/pinFileToIPFS',
			formData,
			{
				headers: {
					pinata_api_key: process.env.PINATA_API_KEY,
					pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
					...formData.getHeaders(),
				},
			}
		);
		return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
	} catch (error) {
		console.error('Error uploading to IPFS:', error);
		return null;
	}
}

// Upload JSON Metadata to IPFS
async function uploadJsonToIPFS(jsonData) {
	try {
		const response = await axios.post(
			'https://api.pinata.cloud/pinning/pinJSONToIPFS',
			jsonData,
			{
				headers: {
					pinata_api_key: process.env.PINATA_API_KEY,
					pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
					'Content-Type': 'application/json',
				},
			}
		);
		return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
	} catch (error) {
		console.error('Error uploading JSON to IPFS:', error);
		return null;
	}
}

// Mint NFT Function
async function mintNft(hashValue, metadataUrl, recipientAddress) {
	try {
		const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
		const signer = new ethers.Wallet(
			process.env.OWNER_PRIVATE_KEY,
			provider
		);
		const contract = new ethers.Contract(
			contractAddress,
			contractABI,
			signer
		);

		const tx = await contract.mintNFT(
			recipientAddress,
			metadataUrl,
			hashValue
		);
		await tx.wait();

		return tx.hash;
	} catch (error) {
		console.error('Error minting NFT:', error);

		let errorMessage = 'NFT Minting Failed';
		if (error.reason) {
			errorMessage = error.reason;
		} else if (error.data?.message) {
			errorMessage = error.data.message;
		} else if (error.message.includes('revert')) {
			errorMessage = `Transaction reverted: ${
				error.message.split('revert')[1]
			}`;
		}

		throw new Error(errorMessage);
	}
}

// Generate NFT for Green Card
export const generateGreenCardNFT = async (req, res) => {
	const { greenCardId } = req.params;

	try {
		const greenCard = await GreenCard.findById(greenCardId);
		if (!greenCard)
			return res.status(404).json({ error: 'Green Card not found' });

		// Use the existing "hash" value from the schema
		const hashValue = greenCard.hash;

		// Generate QR Code pointing to a verification URL that includes the hash
		const qrCodeData = `${URL}/green-card-nft-verification/${hashValue}`;
		const qrCodeImage = await QRCode.toDataURL(qrCodeData);
		const qrIpfsUrl = await uploadToIPFS(qrCodeImage);
		if (!qrIpfsUrl) throw new Error('QR Code upload failed');

		// Create Metadata using main branch field names
		const metadata = {
			name: 'Green Card NFT',
			description: 'This NFT verifies the authenticity of a Green Card.',
			image: qrIpfsUrl,
			document_hash: hashValue,
			insured: greenCard.insured.name,
			vehicle: greenCard.vehicle.registrationNumber,
			insurance: greenCard.insurance.companyName,
			validity: greenCard.validity,
		};

		// Upload Metadata to IPFS
		const metadataIpfsUrl = await uploadJsonToIPFS(metadata);
		if (!metadataIpfsUrl) throw new Error('Metadata upload failed');

		// Mint NFT using the walletAddress (or replace with the insured’s wallet address if available)
		const transactionHash = await mintNft(
			hashValue,
			metadataIpfsUrl,
			walletAddress
		);
		if (!transactionHash) throw new Error('NFT Minting failed');

		// Update Green Card with NFT transaction hash using the schema's "transactionHash" field
		greenCard.transactionHash = transactionHash;
		greenCard.nftMetadataUrl = metadataIpfsUrl;
		await greenCard.save();

		res.status(200).json({
			success: true,
			transactionHash,
			metadataIpfsUrl,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Verify Green Card by hash value
export const verifyGreenCard = async (req, res) => {
	const { hash } = req.params;

	try {
		// Find Green Card by the hash value from the schema
		const greenCard = await GreenCard.findOne({ hash });
		if (!greenCard) {
			return res.status(404).json({
				valid: false,
				message: 'Green Card not found or invalid',
			});
		}

		res.status(200).json({
			valid: true,
			insured: greenCard.insured.name,
			vehicle: greenCard.vehicle,
		});
	} catch (error) {
		res.status(500).json({ valid: false, error: error.message });
	}
};
