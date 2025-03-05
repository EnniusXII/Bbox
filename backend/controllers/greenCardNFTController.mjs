import GreenCard from "../models/GreenCardSchema.mjs";
import { ethers } from "ethers";
import dotenv from "dotenv";
import crypto from "crypto";
import QRCode from "qrcode";
import axios from "axios";
import FormData from "form-data";

dotenv.config();

import contractABI from "../contractAbi.json" assert { type: "json" };
const contractAddress = "0x376A3BceCD373be36639CB9069f40ad149D079BA";
const walletAddress = "0x3f3ca9A42a0d288106573A2A3c8C842b1456425B"

// Generate Unique Hash for Green Card
function generateUniqueHash(data) {
    const hashData = `${data.policyholder.name}${data.vehicleInfo.registrationNumber}${data.insuranceCompany.name}${data.validity.from}${data.validity.to}`;
    return crypto.createHash("sha256").update(hashData).digest("hex");
}

// Upload Image to IPFS
async function uploadToIPFS(imageBase64) {
    const buffer = Buffer.from(imageBase64.split(",")[1], "base64");
    const formData = new FormData();
    formData.append("file", buffer, { filename: "qrCode.png" });

    try {
        const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            headers: {
                pinata_api_key: process.env.PINATA_API_KEY,
                pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
                ...formData.getHeaders(),
            },
        });
        return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
    } catch (error) {
        console.error("Error uploading to IPFS:", error);
        return null;
    }
}

// Upload JSON Metadata to IPFS
async function uploadJsonToIPFS(jsonData) {
    try {
        const response = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", jsonData, {
            headers: {
                pinata_api_key: process.env.PINATA_API_KEY,
                pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
                "Content-Type": "application/json",
            },
        });
        return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
    } catch (error) {
        console.error("Error uploading JSON to IPFS:", error);
        return null;
    }
}

// Mint NFT Function
async function mintNft(uniqueHash, metadataUrl, policyholderAddress) {
    try {
        const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
        const signer = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY, provider);
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        const tx = await contract.mintNFT(policyholderAddress, metadataUrl, uniqueHash);
        await tx.wait();

        return tx.hash;
    } catch (error) {
        console.error("Error minting NFT:", error);

        let errorMessage = "NFT Minting Failed";
        
        if (error.reason) {
            errorMessage = error.reason; // Extract revert message
        } else if (error.data?.message) {
            errorMessage = error.data.message; // Some Ethereum errors use this
        } else if (error.message.includes("revert")) {
            errorMessage = `Transaction reverted: ${error.message.split("revert")[1]}`;
        }

        throw new Error(errorMessage); // Throw readable error
    }
}

// Generate NFT for Green Card
export const generateGreenCardNFT = async (req, res) => {
    const { greenCardId } = req.params;

    try {
        const greenCard = await GreenCard.findById(greenCardId);
        if (!greenCard) return res.status(404).json({ error: "Green Card not found" });

        // Generate Unique Hash
        const uniqueHash = generateUniqueHash(greenCard);
        greenCard.uniqueHash = uniqueHash;

        // Generate QR Code
        const qrCodeData = `http://localhost:5173/verification/${uniqueHash}`;
        const qrCodeImage = await QRCode.toDataURL(qrCodeData);
        const qrIpfsUrl = await uploadToIPFS(qrCodeImage);
        if (!qrIpfsUrl) throw new Error("QR Code upload failed");

        // Create Metadata
        const metadata = {
            name: "Green Card NFT",
            description: "This NFT verifies the authenticity of a Green Card.",
            image: qrIpfsUrl,
            document_hash: uniqueHash,
            policyholder: greenCard.policyholder.name,
        };

        // Upload Metadata to IPFS
        const metadataIpfsUrl = await uploadJsonToIPFS(metadata);
        if (!metadataIpfsUrl) throw new Error("Metadata upload failed");

        // Mint NFT
        const transactionHash = await mintNft(uniqueHash, metadataIpfsUrl, walletAddress);
        if (!transactionHash) throw new Error("NFT Minting failed");

        // Update Green Card
        greenCard.nftMetadataUrl = metadataIpfsUrl;
        greenCard.nftTransactionHash = transactionHash;
        await greenCard.save();

        res.status(200).json({ success: true, transactionHash, metadataIpfsUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const verifyGreenCard = async (req, res) => {
    const { hash } = req.params;

    try {
        // Find Green Card by unique hash
        const greenCard = await GreenCard.findOne({ uniqueHash: hash });

        if (!greenCard) {
            return res.status(404).json({ valid: false, message: "Green Card not found or invalid" });
        }

        res.status(200).json({
            valid: true,
            policyholder: greenCard.policyholder.name,
            vehicleInfo: greenCard.vehicleInfo,
        });
    } catch (error) {
        res.status(500).json({ valid: false, error: error.message });
    }
};