import crypto from "crypto";
import razorpay from "../utils/razorpay.js";
import Donation from "../models/Donation.js";
import { generateReceiptPDF } from "../utils/ReceiptGenerator.js";

// CREATE ORDER
export const createOrder = async (req, res) => {
    try {
        const { amount, donorName, donorEmail, donorPhone } = req.body;

        if (!amount || amount < 10) {
            return res.status(400).json({ success: false, message: "Invalid donation amount (min ₹10)" });
        }

        const options = {
            amount: amount * 100, // Amount in paise
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        const donation = await Donation.create({
            userId: req.user?._id,
            orderId: order.id,
            amount,
            status: "created",
            donorName: donorName || "Anonymous",
            donorEmail: donorEmail || "",
            donorPhone: donorPhone || "",
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

        const donation = await Donation.findOneAndUpdate(
            { orderId: razorpay_order_id },
            {
                paymentId: razorpay_payment_id,
                status: "success",
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            data: { receiptNumber: donation?.receiptNumber, orderId: razorpay_order_id }
        });
    } catch (error) {
        console.error("Verify Payment Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// WEBHOOK HANDLER (receives raw body from express.raw middleware)
export const handleWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers["x-razorpay-signature"];

        // req.body is a Buffer because of express.raw() middleware
        const rawBody = req.body.toString("utf8");

        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(rawBody)
            .digest("hex");

        if (expectedSignature !== signature) {
            console.warn("⚠️ Invalid webhook signature received");
            return res.status(400).json({ success: false, message: "Invalid webhook signature" });
        }

        const event = JSON.parse(rawBody);
        const eventType = event.event;

        console.log(`✅ Razorpay Webhook Event: ${eventType}`);

        if (eventType === "payment.captured") {
            const payment = event.payload.payment.entity;
            await Donation.findOneAndUpdate(
                { orderId: payment.order_id },
                { status: "success", paymentId: payment.id }
            );
        }

        if (eventType === "payment.failed") {
            const payment = event.payload.payment.entity;
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

// DOWNLOAD RECEIPT — GET /payment/:orderId/receipt
export const downloadReceipt = async (req, res) => {
    try {
        const { orderId } = req.params;
        const donation = await Donation.findOne({ orderId, status: "success" });

        if (!donation) {
            return res.status(404).json({ success: false, message: "Successful donation not found for this order ID" });
        }

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="BloodConnect-Receipt-${donation.receiptNumber}.pdf"`
        );

        const pdfStream = generateReceiptPDF(donation);
        pdfStream.pipe(res);
    } catch (error) {
        console.error("Receipt Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
