import crypto from "crypto";
import "dotenv/config";

// We need a 32-byte key for aes-256-cbc. 
// If AADHAAR_ENCRYPTION_KEY is not set or not 32 bytes, we hash it to ensure it's exactly 32 bytes.
const getEncryptionKey = () => {
    const rawKey = process.env.AADHAAR_ENCRYPTION_KEY;
    if (!rawKey) {
        console.error("FATAL: AADHAAR_ENCRYPTION_KEY is not set in environment variables.");
        process.exit(1);
    }
    return crypto.createHash("sha256").update(String(rawKey)).digest("base64").substring(0, 32);
};

const ENCRYPTION_KEY = getEncryptionKey(); // Must be 256 bytes (32 characters)
const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

/**
 * Encrypts a plain text string (like an Aadhaar number)
 * Returns the format `iv:encryptedData`
 */
export const encryptAadhaar = (text) => {
    if (!text) return text;
    // Don't double-encrypt if it already looks like an encrypted payload
    if (text.includes(":") && text.length > 30) return text;

    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString("hex") + ":" + encrypted.toString("hex");
    } catch (error) {
        console.error("Encryption error:", error);
        return null;
    }
};

/**
 * Decrypts an encrypted string (format `iv:encryptedData`)
 */
export const decryptAadhaar = (text) => {
    if (!text) return text;
    // If it's not encrypted (legacy data), just return it
    if (!text.includes(":") || text.length < 30) return text;

    try {
        const textParts = text.split(":");
        const iv = Buffer.from(textParts.shift(), "hex");
        const encryptedText = Buffer.from(textParts.join(":"), "hex");
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error("Decryption error:", error);
        return null;
    }
};
