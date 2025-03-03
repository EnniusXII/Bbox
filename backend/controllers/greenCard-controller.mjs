import { asyncHandler } from '../middleware/asyncHandler.mjs';
import crypto from 'crypto';
import GreenCard from '../models/GreenCardSchema.mjs';
import { createGreenCard } from '../utils/createPDF.mjs';
import { getCountryCode } from '../utils/countryUtils.mjs';
import mongoose from 'mongoose';
import { v4 as uuid } from 'uuid';

export const addGreenCard = asyncHandler(async (req, res, next) => {
	try {
		const { insured, vehicle, insurance, validity, countriesCovered } =
			req.body;

		if (
			!insured ||
			!vehicle ||
			!insurance ||
			!validity ||
			!countriesCovered
		) {
			return res
				.status(400)
				.json({ success: false, message: 'Missing required fields' });
		}

		const referenceId = uuid();
		const userId = req.user._id;
		const hash = generateHash(req.body);

		const fileName = `green_card_${hash.slice(0, 8)}.pdf`;
		const result = await createGreenCard(req.body, hash, req.gfs, fileName);

		if (!result.fileId)
			return res.status(500).json({
				success: false,
				message: 'Failed to create PDF and store in database',
			});

		const formattedCountries = Array.isArray(countriesCovered)
			? countriesCovered.map((c) => c.trim())
			: [];

		const countryCodes = formattedCountries
			.map((country) => getCountryCode(country))
			.filter(Boolean); // Remove undefined values

		const greenCard = new GreenCard({
			user: userId,
			insured: { name: insured.name, address: insured.address },
			vehicle: {
				registrationNumber: vehicle.registrationNumber,
				category: vehicle.category,
			},
			insurance: { companyName: insurance.companyName },
			validity: {
				from: new Date(validity.from).toISOString().split('T')[0],
				to: new Date(validity.to).toISOString().split('T')[0],
			},
			countriesCovered: countryCodes,
			hash,
			fileId: result.fileId,
			referenceId,
			transactionHash: null,
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

export const confirmGreenCard = asyncHandler(async (req, res) => {
	try {
		const { referenceId, transactionHash } = req.body;

		if (!referenceId || !transactionHash) {
			console.error(
				'❌ Missing required fields in confirmation request.'
			);
			return res.status(400).json({
				success: false,
				message:
					'Missing required fields: referenceId or transactionHash.',
			});
		}

		const greenCard = await GreenCard.findOne({ referenceId });

		if (!greenCard) {
			console.error(
				'❌ Green Card not found for reference ID:',
				referenceId
			);
			return res
				.status(404)
				.json({ success: false, message: 'Green Card not found.' });
		}

		greenCard.transactionHash = transactionHash;
		await greenCard.save();

		res.json({
			success: true,
			message: 'Green Card confirmed successfully.',
			greenCard,
		});
	} catch (error) {
		console.error('❌ Error confirming Green Card:', error);
		res.status(500).json({
			success: false,
			message: 'Confirmation failed.',
		});
	}
});

export async function downloadGreenCard(req, res) {
	const { fileId } = req.params;

	try {
		const gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
			bucketName: 'greenCards',
		});

		const readStream = gfs.openDownloadStream(
			new mongoose.Types.ObjectId(fileId)
		);

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
		res.status(500).json({
			success: false,
			message: 'Failed to retrieve file',
		});
	}
}

export const getGreenCard = asyncHandler(async (req, res, next) => {
	if (!req.user)
		return next(new ErrorResponse('User not authenticated', 401));

	const greenCards = await GreenCard.find({ user: req.user._id });

	if (!greenCards.length)
		return res.status(200).json({ success: true, data: [] });

	res.status(200).json({ success: true, data: greenCards });
});

const generateHash = (data) => {
	const jsonData = JSON.stringify(data);
	return crypto.createHash('sha256').update(jsonData).digest('hex');
};
