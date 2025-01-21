import mongoose from "mongoose";

const driverLicenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    lastName: {
        type: String,
        required: [true, "Please add your last name"]
    },
    name: {
        type: String,
        required: [true, "Please add your name"]
    },
    birthdate: {
        type: Date,
        required: [true, "Please add your birthdate"]
    },
    licenseType: {
        type: String,
        required: [true, "Please select a license type"],
        enum: ["AM", "A1", "A2", "A", "B1", "B", "C1", "C", "D1", "D", "BE", "C1E", "CE", "D1E", "DE"]
    },
    isApproved: {
        type: Boolean,
        default: false
    }
});

// Compound index to ensure uniqueness of licenseType per user
driverLicenseSchema.index({ user: 1, licenseType: 1 }, { unique: true });

export default mongoose.model("DriverLicense", driverLicenseSchema);