import mongoose from 'mongoose';

const GreenCardSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cardNumber: { type: String, required: true },
    vehicleInfo: {
        registrationNumber: { type: String, required: true },
        category: { type: String, required: true },
    },
    policyholder: {
        name: { type: String, required: true },
        address: { type: String, required: true },
    },
    insuranceCompany: {
        name: { type: String, required: true },
        address: { type: String, required: true },
        contact: { type: String, required: true },
        code: { type: String, required: true },
    },
    validity: {
        from: { type: Date, required: true },
        to: { type: Date, required: true },
    },
    coveredCountries: { type: [String], required: true },

    // Unique hash for verification
    uniqueHash: { type: String, unique: true },

    // NFT details
    nftMetadataUrl: { type: String, required: false }, // Store NFT Metadata URL
    nftTransactionHash: { type: String, required: false }, // Store Transaction Hash
});

export default mongoose.model("GreenCard", GreenCardSchema);

