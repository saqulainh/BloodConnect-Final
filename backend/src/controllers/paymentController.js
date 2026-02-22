import crypto from "crypto";
import razorpay from "../utils/razorpay.js";
import Donation from "../models/Donation.js";

// CREATE ORDER
export const createOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount < 10) {
            return res.status(400).json({ success: false, message: "Invalid donation amount (min ₹10)" });
        }

        const options = {
            amount: amount * 100, // Amount in paise
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        await Donation.create({
            userId: req.user?._id, // Link to user if logged in
            orderId: order.id,
            amount,
            status: "created",
        });

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// VERIFY PAYMENT
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }

        await Donation.findOneAndUpdate(
            { orderId: razorpay_order_id },
            {
                paymentId: razorpay_payment_id,
                status: "success",
            }
        );

        res.status(200).json({ success: true, message: "Payment verified successfully" });
    } catch (error) {
        console.error("Verify Payment Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// WEBHOOK HANDLER
export const handleWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers["x-razorpay-signature"];

        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(JSON.stringify(req.body))
            .digest("hex");

        if (expectedSignature !== signature) {
            return res.status(400).json({ success: false, message: "Invalid webhook signature" });
        }

        const event = req.body.event;

        if (event === "payment.captured") {
            const payment = req.body.payload.payment.entity;
            await Donation.findOneAndUpdate(
                { orderId: payment.order_id },
                { status: "success", paymentId: payment.id }
            );
        }

        if (event === "payment.failed") {
            const payment = req.body.payload.payment.entity;
            await Donation.findOneAndUpdate(
                { orderId: payment.order_id },
                { status: "failed" }
            );
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
