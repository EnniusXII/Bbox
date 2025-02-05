import {asyncHandler} from '../middleware/asyncHandler.mjs';
import crypto from 'crypto';
import GreenCard from '../models/GreenCardSchema.mjs';
import { createGreenCard } from '../utils/createPDF.mjs';
import mongoose from 'mongoose';
import { v4 as uuid} from 'uuid';

export const confirmGreenCard = asyncHandler(async (req, res) => {
  try {
    console.log("📌 Incoming confirmation request:", req.body);

    const { referenceId, transactionHash } = req.body;
    
    if (!referenceId || !transactionHash) {
      console.error("❌ Missing required fields in confirmation request");
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Find the Green Card entry in MongoDB by referenceId
    const greenCard = await GreenCard.findOne({ referenceId });

    if (!greenCard) {
      console.error(`❌ No Green Card found with referenceId: ${referenceId}`);
      return res.status(404).json({ success: false, message: "Green Card not found" });
    }

    // Update the Green Card with the transactionHash
    greenCard.transactionHash = transactionHash;
    await greenCard.save();

    console.log(`✅ Green Card ${referenceId} confirmed on-chain with tx: ${transactionHash}`);

    res.status(200).json({
      success: true,
      message: "Green Card confirmed successfully",
      greenCard,
    });

  } catch (error) {
    console.error("❌ Error confirming Green Card:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
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
      insured: { name: insured.name },
      validity: {
        from: validity.from,
        to: validity.to,
      },
      insurance: { companyName: insurance.companyName },
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

    // Retrieve Green Card from MongoDB
    const greenCard = await GreenCard.findOne({ referenceId });

    if (!greenCard) {
      console.error("❌ Green Card not found in database.");
      return res.status(404).json({ success: false, message: "Green Card not found." });
    }

    console.log("✅ Green Card found:", greenCard);

    // Return only the stored hash; the frontend will handle blockchain verification
    res.json({
      success: true,
      storedHash: greenCard.hash,
      message: "✅ Hash retrieved successfully. Perform verification in frontend.",
    });

  } catch (error) {
    console.error("❌ Error retrieving stored Green Card hash:", error);
    res.status(500).json({ success: false, message: "Error retrieving stored Green Card hash." });
  }
});

const generateHash = (data) => {
  const jsonData = JSON.stringify(data);
  return crypto.createHash('sha256').update(jsonData).digest('hex');
}