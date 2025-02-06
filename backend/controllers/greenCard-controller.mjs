import {asyncHandler} from '../middleware/asyncHandler.mjs';
import crypto from 'crypto';
import GreenCard from '../models/GreenCardSchema.mjs';
import { createGreenCard } from '../utils/createPDF.mjs';
import mongoose from 'mongoose';
import { v4 as uuid} from 'uuid';

export const confirmGreenCard = asyncHandler(async (req, res) => {
  try {
    const { referenceId, transactionHash } = req.body;
    console.log(`📌 Incoming confirmation request:`, req.body);

    // Ensure required fields are present
    if (!referenceId || !transactionHash) {
      console.error("❌ Missing required fields in confirmation request.");
      return res.status(400).json({ success: false, message: "Missing required fields: referenceId or transactionHash." });
    }

    // Find the Green Card in the database
    const greenCard = await GreenCard.findOne({ referenceId });

    if (!greenCard) {
      console.error("❌ Green Card not found for reference ID:", referenceId);
      return res.status(404).json({ success: false, message: "Green Card not found." });
    }

    // Update the Green Card with the transaction hash
    greenCard.transactionHash = transactionHash;
    await greenCard.save();

    console.log("✅ Green Card confirmed successfully!");
    res.json({ success: true, message: "Green Card confirmed successfully.", greenCard });
  } catch (error) {
    console.error("❌ Error confirming Green Card:", error);
    res.status(500).json({ success: false, message: "Confirmation failed." });
  }
});

export const addGreenCard = asyncHandler(async (req, res, next) => {
  try {
    console.log("📌 Incoming Green Card creation request:", req.body);

    const { insured, validity, insurance } = req.body;

    if (!insured || !insured.name) {
      return res.status(400).json({
        success: false,
        message: '`insured.name` is required.',
      });
    }

    if (!validity || !validity.from || !validity.to) {
      return res.status(400).json({
        success: false,
        message: '`validity` period is required and must include `from` and `to` dates.',
      });
    }

    if (!insurance || !insurance.companyName) {
      return res.status(400).json({
        success: false,
        message: '`insurance.compnayName` is required.',
      });
    }

    const referenceId = uuid(); // Generate unique reference ID
    const hash = generateHash(req.body); // Generate hash from Green Card data

    console.log("📌 Generating Green Card PDF...");
    const fileName = `green_card_${hash.slice(0, 8)}.pdf`;
    const result = await createGreenCard(req.body, hash, req.gfs, fileName);

    if (!result.fileId) {
      return res.status(500).json({
        success: false,
        message: "Failed to create PDF and store in database",
      });
    }

    console.log(`✅ PDF successfully stored in GridFS with fileId: ${result.fileId}`);

    // Create Green Card in MongoDB without transactionHash
    const greenCard = new GreenCard({
      insured: { name: insured.name, address: insured.address },
      vehicle: { registrationNumber: insured.registrationNumber, category: insured.category },
      insurance: { companyName: insurance.companyName },
      validity: {
        from: validity.from,
        to: validity.to,
      },
      contriesCovered: insured.countriesCovered,
      hash,
      fileId: result.fileId,
      referenceId, 
      transactionHash: null, // Will be updated later when confirmed on-chain
    });

    await greenCard.save();

    res.status(201).json({
      success: true,
      message: 'Green Card created successfully',
      referenceId,
      hash,
    });
  } catch (error) {
    console.error('❌ Error creating Green Card:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating Green Card',
      details: error.message,
    });
  }
});

export async function downloadGreenCard(req, res) {
  const { fileId } = req.params;

  try {
    const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'greenCards',
    });

    const readStream = gfs.openDownloadStream(new mongoose.Types.ObjectId(fileId));

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="green_card_${fileId}.pdf"`,
    });

    readStream.pipe(res);

    readStream.on('error', (error) => {
      console.error('Error retrieving file:', error);
      res.status(404).json({ success: false, message: 'File not found' });
    });
  } catch (error) {
    console.error('Error in file retrieval:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve file' });
  }
}

export const verifyGreenCard = asyncHandler(async (req, res) => {
  try {
    const { referenceId } = req.body;
    console.log(`📌 Incoming verification request for Reference ID: ${referenceId}`);

    if (!referenceId) {
      console.error("❌ Reference ID is missing.");
      return res.status(400).json({ success: false, message: "Reference ID is required." });
    }

    // Retrieve Green Card from MongoDB
    const greenCard = await GreenCard.findOne({ referenceId: referenceId });

    if (!greenCard) {
      console.error("❌ Green Card not found in database.");
      return res.status(404).json({ success: false, message: "Green Card not found." });
    }

    console.log("✅ Expected Hash from Database:", greenCard.hash);

    // Send the expected hash to the frontend
    res.json({
      success: true,
      hash: greenCard.hash
    });

  } catch (error) {
    console.error("❌ Error verifying Green Card:", error);
    res.status(500).json({ success: false, message: "Verification failed." });
  }
});

const generateHash = (data) => {
  const jsonData = JSON.stringify(data);
  return crypto.createHash('sha256').update(jsonData).digest('hex');
}