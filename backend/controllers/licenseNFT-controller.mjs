import DriversLicense from '../models/DriverLicenseSchema.mjs';
import { asyncHandler } from '../middleware/asyncHandler.mjs';

export const updateLicenseNFT = asyncHandler(async (req, res, next) => {
	const { licenseId } = req.params;
	const { uniqueHash, nftMetadataUri, nftTransactionHash } = req.body;

	console.log('💡 Incoming PATCH /update-nft/:licenseId');
	console.log('➡️ licenseId:', licenseId);
	console.log('➡️ userId:', req.user?._id);
	console.log('➡️ Request body:', req.body);

	try {
		const license = await DriversLicense.findOne({
			_id: licenseId,
			user: req.user._id,
		});

		if (!license) {
			console.log('⚠️ License not found for user.');
			return next(new ErrorResponse('License not found', 404));
		}

		license.uniqueHash = uniqueHash;
		license.nftMetadataUri = nftMetadataUri;
		license.nftTransactionHash = nftTransactionHash;

		await license.save();

		console.log('License NFT fields updated and saved');
		res.status(200).json({ success: true, data: license });
	} catch (err) {
		console.error(`Error updating license NFT data:`, err);
		res.status(500).json({
			success: false,
			error: 'Failed to update license NFT data.',
		});
	}
});

export const verifyLicense = async (req, res) => {
	const { hash } = req.params;
	const license = await DriversLicense.findOne({ uniqueHash: hash });

	try {
		if (!license) {
			return res.status(404).json({
				valid: false,
				message: 'License not found or invalid',
			});
		}

		res.status(200).json({
			valid: true,
			firstName: license.firstName,
			lastName: license.lastName,
			birthDate: license.birthDate,
			referenceNumber: license.referenceNumber,
		});
	} catch (error) {
		res.status(500).json({ valid: false, error: error.message });
	}
};
