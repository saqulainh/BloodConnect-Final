import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number.parseInt(process.env.SMTP_PORT || "587", 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const emailFrom = process.env.EMAIL_FROM;

if (!smtpHost || !smtpUser || !smtpPass || !emailFrom) {
    throw new Error("SMTP configuration is incomplete. Set SMTP_HOST, SMTP_USER, SMTP_PASS, and EMAIL_FROM.");
}

const transporter = nodemailer.createTransport({
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

export const sendEmail = async (to, subject, text, html) => {
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
        console.error("Error sending email:", error);
        throw error;
    }
};
