import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import P2PTransaction from "../models/p2p.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

const validateReceiverDetails = (paymentMethod, receiverDetails) => {
    if (paymentMethod === "BANK") {
        const { bankAccountNumber, bankSwiftCode, bankHolderName } = receiverDetails;
        if (!bankAccountNumber || !bankSwiftCode || !bankHolderName) {
            throw new ApiError(400, "Bank details are required");
        }
        return { bankAccountNumber, bankSwiftCode, bankHolderName };
    }
    else if (paymentMethod === "UPI") {
        const { upiId } = receiverDetails;
        if (!upiId) {
            throw new ApiError(400, "UPI ID is required");
        }
        return { upiId };
    }
    else if (paymentMethod === "PAYPAL") {
        const { paypalId } = receiverDetails;
        if (!paypalId) {
            throw new ApiError(400, "PayPal ID is required");
        }
        return { paypalId };
    }
    throw new ApiError(400, "Invalid payment method");
};

const cleanupOldTransactions = async (userId) => {

    const userTx = await P2PTransaction.find({ userId })
        .sort({ createdAt: -1 });


    if (userTx.length > 10) {
        const deleteItems = userTx.slice(10);
        await P2PTransaction.deleteMany({
            _id: { $in: deleteItems.map(tx => tx._id) }
        });
    }
};

const getAdminAddress = () => {
    const walletList = process.env.P2P_ADMIN_WALLETS?.split(",") || [];

    if (walletList.length === 0) {
        throw new Error("Admin TRC20 wallet list not configured");
    }


    const randomIndex = Math.floor(Math.random() * walletList.length);

    return walletList[randomIndex];
}

const getAdminPaymentDetails = (paymentMethod) => {

    if (paymentMethod === "BANK") {
        try {
            const bankList = JSON.parse(process.env.P2P_ADMIN_BANKS || "[]");
            if (bankList.length === 0) throw new Error("Bank list empty");

            const randomBank = bankList[Math.floor(Math.random() * bankList.length)];
            return randomBank;

        } catch (err) {
            throw new Error("Invalid BANK JSON format in .env");
        }
    }


    if (paymentMethod === "UPI") {
        const upiList = process.env.P2P_ADMIN_UPI_IDS?.split(",") || [];
        if (upiList.length === 0) throw new Error("UPI list empty");

        const randomUpi = upiList[Math.floor(Math.random() * upiList.length)];
        return { upiId: randomUpi };
    }

    if (paymentMethod === "PAYPAL") {
        const paypalList = process.env.P2P_ADMIN_PAYPAL_IDS?.split(",") || [];
        if (paypalList.length === 0) throw new Error("PayPal list empty");

        const randomPaypal = paypalList[Math.floor(Math.random() * paypalList.length)];
        return { paypalId: randomPaypal };
    }

    throw new Error("Invalid payment method");
};


const getFiatPairs = asyncHandler(async (req, res) => {
    const fiatPairs = [
        { country: "India", currency: "INR", pair: "INR/USDT" },
        { country: "United States", currency: "USD", pair: "USD/USDT" },
        { country: "European Union", currency: "EUR", pair: "EUR/USDT" },
        { country: "United Kingdom", currency: "GBP", pair: "GBP/USDT" },
        { country: "Australia", currency: "AUD", pair: "AUD/USDT" },
        { country: "United Arab Emirates", currency: "AED", pair: "AED/USDT" },
        { country: "Saudi Arabia", currency: "SAR", pair: "SAR/USDT" },
        { country: "Canada", currency: "CAD", pair: "CAD/USDT" },
        { country: "Pakistan", currency: "PKR", pair: "PKR/USDT" },
        { country: "Turkey", currency: "TRY", pair: "TRY/USDT" },
        { country: "Nigeria", currency: "NGN", pair: "NGN/USDT" },
        { country: "Kenya", currency: "KES", pair: "KES/USDT" },
        { country: "Singapore", currency: "SGD", pair: "SGD/USDT" },
        { country: "Thailand", currency: "THB", pair: "THB/USDT" },
        { country: "Malaysia", currency: "MYR", pair: "MYR/USDT" }
    ];

    return res.status(200).json(
        new ApiResponse(200, fiatPairs, "Fiat currency list fetched")
    );
});

const createSellOrder = asyncHandler(async (req, res) => {
    const { usdtAmount, fiatAmount, paymentMethod, receiverDetails, country } = req.body;


    if (!usdtAmount || !fiatAmount || !paymentMethod || !receiverDetails || !country) {
        throw new ApiError(400, "All fields are required");
    }

    const receiverDetailsData = validateReceiverDetails(paymentMethod, receiverDetails);

    const depositUsdtAddress = getAdminAddress();

    if (!depositUsdtAddress) {
        throw new ApiError(500, "USDT deposit address not configured");
    }

    // save transaction
    const newTx = await P2PTransaction.create({
        userId: req.user._id,
        type: "SELL",
        country,
        usdtAmount,
        fiatAmount,
        paymentMethod,
        receiverDetails: receiverDetailsData,
        usdtWalletAddress: depositUsdtAddress, // system-generated
        status: "PENDING"
    });

    await cleanupOldTransactions(req.user._id);

    return res.status(201).json(
        new ApiResponse(201, {
            order: newTx,
            orderId: newTx._id,
            depositAddress: depositUsdtAddress
        }, "Sell order created successfully") // Current sattus is pending need to confirm
    );
});

const createBuyOrder = asyncHandler(async (req, res) => {
    const { usdtAmount, fiatAmount, paymentMethod, country, usdtWalletAddress } = req.body;
    if (!usdtAmount || !fiatAmount || !paymentMethod || !country || !usdtWalletAddress) {
        throw new ApiError(400, "All fields are required");
    }
    const paymentDetails = getAdminPaymentDetails(paymentMethod);
    const newTx = await P2PTransaction.create({
        userId: req.user._id,
        type: "BUY",
        country,
        usdtAmount,
        fiatAmount,
        paymentMethod,
        receiverDetails: paymentDetails,
        usdtWalletAddress,
        status: "PENDING"
    });

    await cleanupOldTransactions(req.user._id);
    return res.status(201).json(
        new ApiResponse(201, {
            order: newTx,
            orderId: newTx._id,
            payto: paymentDetails
        }, "Buy order created successfully") // Current sattus is pending need to confirm
    );

});

const confirmSellOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { txnHash } = req.body;
    if (!txnHash || !orderId) {
        throw new ApiError(400, "transaction hash and order id are required");
    }
    let proofUrl = null;
    if (req.file) {
        const upload = await uploadOnCloudinary(req.file.buffer);
        proofUrl = upload.secure_url;
    }
    const order = await P2PTransaction.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }
    if (order.status !== "PENDING") {
        throw new ApiError(400, "Order is not pending");
    }
    order.proofImage = proofUrl;
    order.txnHash = txnHash;
    order.status = "AWAITING_CONFIRMATION";
    await order.save({ validateBeforeSave: false });
    return res.status(200).json(
        new ApiResponse(200, {
            order
        }, "Order confirmed successfully")
    );
});

const confirmBuyOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    if (!orderId) {
        throw new ApiError(400, "order id is required");
    }
    let proofUrl = null;
    if (!req.file) {
        throw new ApiError(400, "Proof image is required");
    }
    const upload = await uploadOnCloudinary(req.file.buffer);
    proofUrl = upload.secure_url;
    const order = await P2PTransaction.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }
    if (order.status !== "PENDING") {
        throw new ApiError(400, "Order is not pending");
    }
    order.proofImage = proofUrl;
    order.status = "AWAITING_CONFIRMATION";
    await order.save({ validateBeforeSave: false });
    return res.status(200).json(
        new ApiResponse(200, {
            order
        }, "Order confirmed successfully")
    );
});

const getPendingOrders = asyncHandler(async (req, res) => {

    const orders = await P2PTransaction.find({
        status: { $in: ["PENDING", "AWAITING_CONFIRMATION"] }
    }).sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, orders, "Pending orders fetched")
    );
});

const adminApproveOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await P2PTransaction.findById(orderId);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.status === "COMPLETED") {
        throw new ApiError(400, "Order already completed");
    }

    if (order.status === "CANCELLED") {
        throw new ApiError(400, "Order already cancelled");
    }

    order.status = "COMPLETED";
    order.completedAt = new Date();

    await order.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, order, "Order approved successfully")
    );
});

const adminRejectOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await P2PTransaction.findById(orderId);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.status === "COMPLETED") {
        throw new ApiError(400, "Cannot cancel a completed order");
    }

    order.status = "CANCELLED";
    order.cancelledAt = new Date();

    await order.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, order, "Order cancelled successfully")
    );
});

const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await P2PTransaction.find()
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, orders, "All orders fetched")
    );
});

const findAllOrdersByUser = asyncHandler(async (req, res) => {
    const orders = await P2PTransaction.find({ userId: req.user._id })
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, orders, "All orders fetched")
    );
});

const findOrdersbyuseridforAdmin = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const orders = await P2PTransaction.find({ userId })
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, orders, "All orders fetched")
    );
});




export {
    createSellOrder,
    getFiatPairs,
    createBuyOrder,
    confirmSellOrder,
    confirmBuyOrder,
    getPendingOrders,
    adminApproveOrder,
    adminRejectOrder,
    getAllOrders,
    findAllOrdersByUser,
    findOrdersbyuseridforAdmin
};