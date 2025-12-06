import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateReferralCode } from "../utils/referral.js";

const genearteAccessTokenAndRefreshToken = async (userID) => {
    try {
        const user = await User.findById(userID)
        const accessToken = await user.genearteAccessToken();
        // console.log("Access Token:", accessToken);
        const refreshToken = await user.refreshAccessToken();
        // console.log("Refresh Token:", refreshToken);
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Error generating tokens");

    }
}
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, referral } = req.body;
    if (
        [name, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }
    const existingUser = await User.findOne({ email })
    if (existingUser) {
        throw new ApiError(400, "User already exists with this email");
    }


    let referralCode = generateReferralCode();
    while (await User.findOne({ referralCode })) {
        referralCode = generateReferralCode();
    }

    const user = await User.create({
        name,
        email,
        password,
        role: role || "user",
        referralCode
    })


    if (referral) {
        const referrer = await User.findOne({ referralCode: referral });
        if (referrer && String(referrer._id) !== String(user._id)) {
            user.referredBy = referrer._id;
            // award points to referrer (atomic-ish)
            referrer.points += 10; // change reward as needed
            await referrer.save();
            await user.save({ validateBeforeSave: false });
        }
    }

    const { accessToken, refreshToken } = await genearteAccessTokenAndRefreshToken(user._id)
    const createdUser = await User.findById(user._id).select("-password");
    if (!createdUser) {
        throw new ApiError(500, "User creation failed");
    }
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    res.status(201).json(
        new ApiResponse(201, { user: createdUser, accessToken, refreshToken }, "User registered successfully", createdUser, "User registered successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if ((!email && !password)) {
        throw new ApiError(400, "Email and Password are required");
    }
    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(401, "User not found with this email");
    }
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Incorrect password");
    }
    const { accessToken, refreshToken } = await genearteAccessTokenAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
                "User logged in successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true,
        })
    const options = {
        httpOnly: true,
        secure: true,
        expires: new Date(0)
    }
    return res
        .status(200)
        .cookie("accessToken", "", options)
        .cookie("refreshToken", "", options)
        .json(
            new ApiResponse(200, {}, "User logged out successfully")
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const instantRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!instantRefreshToken) {
        throw new ApiError(403, "Unauthorized Request")
    }
    try {
        const decodedToken = jwt.verify(instantRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        // console.log(user)
        if (!user) {
            throw new ApiError(400, "Invalid Refresh Token")
        }

        console.log(instantRefreshToken, "refresh:", user?.refreshToken)

        if (instantRefreshToken !== user?.refreshToken) {
            throw new ApiError(403, "Refresh Token invalid or expired ")
        }
        const options = {
            httpOnly: true,
            secure: true,
        }
        const { accessToken, refreshToken: newRefreshToken } = await genearteAccessTokenAndRefreshToken(user._id)
        console.log(newRefreshToken)
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access Token Refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(405, error?.message || "Invalid Refresh Token")
    }
})

const changePassword = asyncHandler(async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const user = await User.findById(req.user?._id)
        const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword)
        if (!isOldPasswordCorrect) {
            throw new ApiError(400, "Wrong Old Password")
        }
        user.password = newPassword;
        await user.save({ validateBeforeSave: false })
        return res.
            status(201)
            .json(
                new ApiResponse(201, {}, "Password Changed Succesfully")
            )
    } catch (error) {
        throw new ApiError(400, error?.message || "Something went wrong")
    }

})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { name, email } = req.body
    if (!name || !email) {
        throw new ApiError(400, "All fields are required")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                name,
                email
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
        .status(201)
        .json(
            new ApiResponse(201, user, "Account Details Updated Successfully")
        )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized: No user ID found");
    }

    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return res
        .status(201)
        .json(
            new ApiResponse(201, user, "Current User Fetched Successfully")
        )
})

// added by farman
const getReferralLink = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) throw new ApiError(401, "Unauthorized");

    const user = await User.findById(userId).select("referralCode");
    if (!user) throw new ApiError(404, "User not found");

    if (!user.referralCode) {
        throw new ApiError(500, "Referral code not found for this user");
    }

    // frontend URL where users will land (set this in .env)
    const baseUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get("host")}`;

    const referralLink = `${baseUrl}/signup?referral=${user.referralCode}`;

    return res.status(200).json(
        new ApiResponse(200,
            { referralCode: user.referralCode, referralLink },
            "Referral link generated successfully"
        )
    );
});


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    getReferralLink
};