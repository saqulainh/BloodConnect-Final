import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

let razorpayInstance = null;

const getRazorpay = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required for payment flows.");
    }

    if (!razorpayInstance) {
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }

    return razorpayInstance;
};

const razorpay = new Proxy({}, {
    get: (_, prop) => {
        const client = getRazorpay();
        const value = client[prop];
        return typeof value === "function" ? value.bind(client) : value;
    },
});

export default razorpay;
