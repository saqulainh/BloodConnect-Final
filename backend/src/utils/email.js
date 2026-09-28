import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number.parseInt(process.env.SMTP_PORT || "587", 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const emailFrom = process.env.EMAIL_FROM;

let transporter = null;

if (!smtpHost || !smtpUser || !smtpPass || !emailFrom) {
    console.warn("⚠️ SMTP configuration is incomplete. Emails will be logged to console instead of sent.");
} else {
    try {
        transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: false, // true for 465, false for other ports
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });
    } catch (transportErr) {
        console.warn("⚠️ Failed to initialize email transporter:", transportErr.message);
        transporter = null;
    }
}

export const sendEmail = async (to, subject, text, html) => {
    if (!transporter) {
        console.log(`\n📨 [EMAIL SIMULATED / FALLBACK]`);
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${text || subject}`);
        console.log(`-----------------------------------------\n`);
        return { messageId: "dev-simulated-fallback", fallback: true };
    }

    try {
        const info = await transporter.sendMail({
            from: `"BloodConnect" <${emailFrom}>`,
            to,
            subject,
            text,
            html,
        });
        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error.message);
        console.log(`\n📨 [EMAIL LOGGED ON ERROR] To: ${to} | Subject: ${subject} | Content: ${text || subject}\n`);
        return { messageId: "error-fallback", fallback: true, error: error.message };
    }
};
