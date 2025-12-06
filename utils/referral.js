import crypto from "crypto";
export function generateReferralCode() {
    return crypto.randomBytes(3).toString("hex"); // 6 hex chars
}
