import axios from "axios";
import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const convertFiatUsdt = asyncHandler(async (req, res) => {
    const { amount, from, to } = req.query;

    if (!amount || !from || !to) {
        throw new ApiError(400, "amount, from & to fields are required");
    }

    // We treat USDT === USD
    const fromCurrency = from.toLowerCase() === "usdt" ? "usd" : from.toLowerCase();
    const toCurrency = to.toLowerCase() === "usdt" ? "usd" : to.toLowerCase();

    try {
        // Fetch conversion API
        const url = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromCurrency}.json`;
        const result = await axios.get(url);

        const rate = result.data[fromCurrency][toCurrency];

        if (!rate) {
            throw new ApiError(400, "Invalid currency pair");
        }

        const convertedValue = Number(amount) * rate;

        return res.status(200).json(
            new ApiResponse(200, {
                amount: Number(amount),
                from: from.toUpperCase(),
                to: to.toUpperCase(),
                rate,
                convertedAmount: convertedValue
            }, "Conversion successful")
        );

    } catch (error) {
        throw new ApiError(500, "Failed to convert currency");
    }
});
