import Notification from '../models/NotificationSchema.mjs';
import { asyncHandler } from '../middleware/asyncHandler.mjs';
import ErrorResponse from '../models/ErrorResponseModel.mjs';

export const getRequests = asyncHandler(async (req, res, next) => {

    const requests = await Notification.find({}).sort({ createdAt: 1 });

    res.status(200).json({
        success: true,
        data: requests
    });
});

export const getRequestInfo = asyncHandler(async (req, res, next) => {
    const { requestId } = req.params;

    // Fetch the request from the database
    const request = await Notification.findById(requestId);

    if (!request) {
        return next(new ErrorResponse("Request not found", 404));
    }

    // Check if the logged-in user is the owner of the request
    const isOwner = req.user && req.user.id === request.user.toString();
    

    // Conditionally set data to return full or limited information
    const data = isOwner
        ? {  // Full details if user is the owner
            message: request.message,
            user: request.user,
            requestId: request._id,
            transactionHash: request.transactionHash,
            name: request.name,
            lastName: request.lastName,
            licenseType: request.licenseType,
            status: request.status,
            createdAt: request.createdAt
        }
        : {  // Limited details for non-owners
            message: request.message,
            status: request.status,
        };

    res.status(200).json({
        success: true,
        data
    });
});
