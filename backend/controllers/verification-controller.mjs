import { asyncHandler } from "../middleware/asyncHandler.mjs"; // Import the asyncHandler for error handling
import ErrorResponse from "../models/ErrorResponseModel.mjs"; // Custom error handling class
import DriverLicense from "../models/DriverLicenseSchema.mjs"; // DriverLicense schema/model for interacting with licenses
import Notification from "../models/NotificationSchema.mjs"; // Notification schema/model for sending license verification requests

export const recordVerification = async (req, res) => {
    const { requestId, userAddress, licenseType, isVerified } = req.body;
    try {
        const tx = await contract.recordVerification(requestId, userAddress, licenseType, isVerified);
        const receipt = await tx.wait();
        const transactionHash = receipt.hash;
        
        await Notification.findByIdAndUpdate(requestId, { transactionHash });
        res.status(200).json({ success: true, message: "Verification recorded on-chain", transactionHash });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getVerificationStatus = async (req, res) => {
    const { requestId } = req.params;
    try {
        const [isVerified, licenseType, timestamp, userAddress] = await contract.getVerificationStatus(requestId);

        const notification = await Notification.findById(requestId);
        const transactionHash = notification.transactionHash || "Not available";

        res.status(200).json({ isVerified, licenseType, timestamp: timestamp.toString(), userAddress, transactionHash });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// This function verifies if a driver's license exists and creates a verification request if it does.
export const verifyDriverLicense = asyncHandler(async (req, res, next) => {
    const { lastName, name, licenseType } = req.body; // Extract details from request body

    console.log("Querying for license with:", { lastName, name });

    const license = await DriverLicense.findOne({ lastName, name });
    if (!license) {
        return next(new ErrorResponse("User not found", 404));
    }

    const notification = await Notification.create({
        user: license.user, // The user to whom the license belongs
        message: `Verification request for ${licenseType} license. Do you want to share your information?`,
        requestId: license._id, // ID of the license for tracking the request
        name,
        lastName,  // Add lastName to the notification
        licenseType,  // Add licenseType to the notification
        status: "pending" // Set status to pending while awaiting response
    });

    // Respond to the client that the verification request was successfully sent
    res.status(200).json({
        success: true,
        message: "Verification request sent. Awaiting approval.",
        requestId: notification._id // Send the notification request ID to the client
    });
});

// This function handles the approval of a driver's license verification request.
export const approveLicenseVerification = asyncHandler(async (req, res, next) => {
    const requestId = req.params.requestId; // Extract the requestId from URL params
    console.log(requestId);
    const { lastName, licenseType } = req.body;
    console.log(lastName, licenseType);
    
    if (!requestId) {
        // If no requestId is provided, return an error
        return next(new ErrorResponse("No request ID provided.", 400));
    }

    console.log("Approving verification for requestId:", requestId);

    // Find the notification by its requestId
    const notification = await Notification.findById(requestId);
    if (!notification) {
        // If no matching notification is found, return an error
        return next(new ErrorResponse("No verification request found for this ID.", 404));
    }

    // Find the driver's license associated with the notification's requestId
    const license = await DriverLicense.findOne({ _id: notification.requestId });
    if (!license) {
        // If no driver's license is found for the request, return an error
        return next(new ErrorResponse("No driver's license found for this ID.", 404));
    }

    if (license.lastName !== lastName || license.licenseType !== licenseType) {
        return next(new ErrorResponse("You do not possess the requested license type. Verification failed.", 400));
    }

    // Set the license verification to approved
    license.isApproved = true;
    await license.save(); // Save the updated license status

    // Update the notification status to 'approved'
    notification.status = "approved";
    await notification.save(); // Save the updated notification status

    // Respond to the client that the verification was approved
    res.status(200).json({
        success: true,
        message: "Driver's license verification approved."
    });
});

// This function handles the decline of a driver's license verification request.
export const declineLicenseVerification = asyncHandler(async (req, res, next) => {
    const requestId = req.params.requestId; // Extract the requestId from URL params

    // Update the notification status to "declined"
    const notification = await Notification.findByIdAndUpdate(
        requestId,
        { status: "declined" }, // Update the status to declined
        { new: true } // Return the updated document
    );

    if (!notification) {
        // If no matching notification is found, return an error
        return next(new ErrorResponse("No verification request found with this ID.", 404));
    }

    // Respond to the client that the verification request was declined
    res.status(200).json({
        success: true,
        message: "Verification request has been declined."
    });
});