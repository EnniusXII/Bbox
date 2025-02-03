import {asyncHandler} from '../middleware/asyncHandler.mjs';
import crypto from 'crypto';
import GreenCard from '../models/GreenCardSchema.mjs';
import { createGreenCard } from '../utils/createPDF.mjs';
import mongoose from 'mongoose';
import { v4 as uuid} from 'uuid';

export const confirmGreenCard = asyncHandler(async (req, res, next)=>{
  try {
    const {insuranceId, transactionHash, insured, validity, hash} = req.body;

    if(!insuranceId || !transactionHash || !hash) {
      return res.status(400).json({ success: false, message: '`insuranceId`, `transactionHash`, and `hash` are required.'})
    }

    const existingCard = await GreenCard.findOne({referenceId: insuranceId});
    if(existingCard) {
      return res.status(400).json({success:false, message: 'Green Card already exists for this insurance id.'})
    }

    const fileName = `green_card_${hash.slice(0, 8)}.pdf`;
    const result = await createGreenCard(req.body, hash, req.gfs, fileName);

    const greenCard = new GreenCard({referenceId: insuranceId, insured, validity, hash, transactionHash, fileId: result.fileId})
    await greenCard.save();

    res.status(201).json({success:true, message: 'Green Card stored successfully!', greenCard})
  } catch (err) {
    console.error('Error confirming Green Card: ', err);
    res.status(500).json({success:false, error: 'Error confirming Green Card: ', details: err.message})
  }
})

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

    const hash = generateHash({ insuranceId, insured, validity });

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

export const verifyGreenCard = asyncHandler(async(req, res, next) => {
  try {
    const {insuranceId} = req.params;

    if(!insuranceId) {
      return res.status(400).json({success:false, message: "`insuranceId` is required."})
    }

    const greenCard = await GreenCard.findOne({referenceId: insuranceId});

    if(!greenCard) {
      return res.status(400).json({success: false, message: 'Green Card not found.'});
    }

    res.status(200).json({success: true, hash: greenCard.hash});
  } catch (err) {
    console.error('Error verifying Green Card: ', err);
    res.status(500).json({success: false, error: 'Error verifying Green Card.', details: err.message})
  }
})

const generateHash = (data) => {
  const jsonData = JSON.stringify(data);
  return crypto.createHash('sha256').update(jsonData).digest('hex');
}