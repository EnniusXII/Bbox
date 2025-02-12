import mongoose from 'mongoose';

const greenCardNotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    requestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GreenCard',
        required: true
    },
    referenceId: {
      type: String,
      required: true,
    },
    isRead: {
        type: Boolean,
        default: false  // Unread by default
    },
    status: {
        type: String,
        enum: ["pending", "approved", "declined"],
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    transactionHash: {
        type: String,
        default: null  // Field to store transaction hash
    },
});

export default mongoose.model('GreenCardNotification', greenCardNotificationSchema);