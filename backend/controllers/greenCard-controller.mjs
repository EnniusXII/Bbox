import { asyncHandler } from "../middleware/asyncHandler.mjs";
import ErrorResponse from "../models/ErrorResponseModel.mjs";
import GreenCard from "../models/GreenCardSchema.mjs";

// Add a new Green Card
export const addGreenCard = asyncHandler(async (req, res, next) => {
    const { cardNumber, vehicleInfo, policyholder, insuranceCompany, validity, coveredCountries } = req.body;

    if (!req.user) {
        return next(new ErrorResponse("User not authenticated", 401));
    }

    // Create the Green Card and link it to the user
    const greenCard = await GreenCard.create({
        user: req.user._id,
        cardNumber,
        vehicleInfo,
        policyholder,
        insuranceCompany,
        validity,
        coveredCountries
    });

    res.status(201).json({
        success: true,
        data: greenCard
    });
});

// Get all Green Cards for a user
export const getGreenCards = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        return next(new ErrorResponse("User not authenticated", 401));
    }

    const greenCards = await GreenCard.find({ user: req.user._id });

    if (!greenCards.length) {
        return res.status(404).json({ success: false, message: "No Green Cards found" });
    }

    res.status(200).json({ success: true, data: greenCards });
});