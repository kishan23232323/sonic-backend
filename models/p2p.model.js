import mongoose, { Schema } from "mongoose";

const receiverDetailsSchema = new Schema({
    // BANK TRANSFER
    bankAccountNumber: { type: String },
    bankSwiftCode: { type: String },
    bankHolderName: { type: String },

    // UPI
    upiId: { type: String },

    // PAYPAL
    paypalId: { type: String },
}, { _id: false });

const p2pSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ["BUY", "SELL"],
        required: true,
    },
    country: {
        type: String,
        required: true
    },
    usdtAmount: {
        type: Number,
        required: true,
    },
    fiatAmount: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ["BANK", "UPI", "PAYPAL"],
        required: true,
    },
    receiverDetails: receiverDetailsSchema,
    usdtWalletAddress: {
        type: String,
        
    },
    proofImage: {
        type: String,
        default: null,
    },
    txnHash: {
        type: String,
        default: null,
    },
    status: {
        type: String,
        enum: ["PENDING", "COMPLETED", "CANCELLED","AWAITING_CONFIRMATION"],
        default: "PENDING",
    }
}, { timestamps: true });

export default mongoose.model("P2PTransaction", p2pSchema);
