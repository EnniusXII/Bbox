import mongoose from 'mongoose';

const driverLicenseSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	lastName: {
		type: String,
		required: [true, 'Please add your last name'],
	},
	firstName: {
		type: String,
		required: [true, 'Please add your name'],
	},
	birthDate: {
		type: Date,
		required: [true, 'Please add your birthdate'],
	},
	issueDate: {
		type: Date,
		required: [true, 'Please add the issue date of your license'],
	},
	expiryDate: {
		type: Date,
		required: [true, 'Please add the expiry date of your license'],
	},
	issuer: {
		type: String,
		required: [true, 'Please add the issuer of your license'],
	},
	referenceNumber: {
		type: String,
		required: [true, 'Please add the reference number of your license'],
	},
	licenseNumber: {
		type: String,
		required: [true, 'Please add the license number'],
	},
	licenseTypes: {
		type: [String],
		required: [true, 'Please select at least one license category'],
		enum: [
			'AM',
			'A1',
			'A2',
			'A',
			'B1',
			'B',
			'C1',
			'C',
			'D1',
			'D',
			'BE',
			'C1E',
			'CE',
			'D1E',
			'DE',
		],
	},
	uniqueHash: { type: String, unique: true },
	nftMetadataUri: { type: String, required: false },
	nftTransactionHash: { type: String, required: false },
	isApproved: {
		type: Boolean,
		default: false,
	},
});

// Compound index to ensure uniqueness of licenseType per user
driverLicenseSchema.index({ user: 1, licenseType: 1 }, { unique: true });

export default mongoose.model('DriverLicense', driverLicenseSchema);
