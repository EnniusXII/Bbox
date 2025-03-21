import { asyncHandler } from '../middleware/asyncHandler.mjs';

export const updateLicenseNFT = asyncHandler(async (req, res, next) => {
	const { licenseId } = req.params;
	const { uniqueHash, nftMetadataUri, nftTransactionHash } = req.body;

	try {
		const license = await DriversLicense.findOne({
			_id: licenseId,
			user: req.user._id,
		});
		if (!license) {
			return next(new ErrorResponse('License not found', 404));
		}

		license.uniqueHash = uniqueHash;
		license.nftMetadataUri = nftMetadataUri;
		license.nftTransactionHash = nftTransactionHash;

		await license.save();

		res.status(200).json({ success: true, data: license });
	} catch (err) {
		console.error(`❌ Error updating license NFT data:`, err);
		res.status(500).json({
			success: false,
			error: 'Failed to update license NFT data.',
		});
	}
});
