import {asyncHandler} from '../middleware/asyncHandler.mjs';
import crypto from 'crypto';
import GreenCard from '../models/GreenCardSchema.mjs';
import { createGreenCard } from '../utils/createPDF.mjs';
import mongoose from 'mongoose';
import { v4 as uuid} from 'uuid';

export const addGreenCard = asyncHandler(async (req, res, next) => {
  try{
    const { insured, validity } = req.body;

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

    const insuranceId = uuid();

    const greenCardData = {
      insured: { name: insured.name },
      validity: {
        from: validity.from,
        to: validity.to,
      },
      hash: generateHash(insuranceId, req.body),
      fileId: null,
    };

    const fileName = `green_card_${greenCardData.hash.slice(0, 8)}.pdf`;
    const result = await createGreenCard(req.body, greenCardData.hash, req.gfs, fileName);

    greenCardData.fileId = result.fileId;

    const greenCard = new GreenCard(greenCardData);
    await greenCard.save();

    res.status(201).json({
      success: true,
      message: 'Green Card created successfully',
      insuranceId,
      hash,
    });
  } catch (error) {
    console.error('Error creating Green Card:', error);
    res.status(500).json({
      success: false,
      statusCode: 500,
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

const generateHash = (data) => {
  const jsonData = JSON.stringify(data);
  return crypto.createHash('sha256').update(jsonData).digest('hex');
}