import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { sendEmail } from "../utils/email.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Returns true if an Aadhaar number is valid (12 digits, first digit ≠ 0 or 1) */
const isValidAadhaar = (num) => {
    const clean = num.replace(/\s/g, "");
    return /^[2-9]\d{11}$/.test(clean);
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─── Register ────────────────────────────────────────────────────────────────

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, bloodGroup, role, aadhaarNumber, address, lat, lng } = req.body;

        // Validate Aadhaar format
        if (!aadhaarNumber || !isValidAadhaar(aadhaarNumber)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Aadhaar number. Must be 12 digits and cannot start with 0 or 1."
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: "An account with this email already exists." });
        }

        const aadhaarExists = await User.findOne({ aadhaarNumber: aadhaarNumber.replace(/\s/g, "") });
        if (aadhaarExists) {
            return res.status(400).json({ success: false, message: "An account with this Aadhaar number already exists." });
        }

        // Handle file uploads
        const aadhaarImage = req.files?.['aadhaarImage']?.[0]?.path || null;
        const medicalCertificate = req.files?.['medicalCertificate']?.[0]?.path || null;
        const profilePicture = req.files?.['profilePicture']?.[0]?.path || null;

        const otp = generateOtp();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 min

        const user = await User.create({
            name,
            email,
            password,
            phone,
            bloodGroup,
            role: role || "donor",
            aadhaarNumber: aadhaarNumber.replace(/\s/g, ""),
            address,
            location: lat && lng
                ? { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] }
                : undefined,
            aadhaarImage,
            medicalCertificate,
            profilePicture,
            otp,
            otpExpires,
            aadhaarVerified: false, // Will be set to true after Aadhaar image review or on verify-aadhaar call
        });

        if (user) {
            // Send OTP email
            await sendEmail(
                user.email,
                "Your BloodConnect Verification Code",
                `Your OTP is ${otp}. It expires in 10 minutes.`,
                `
                <div style="font-family:Inter,sans-serif;max-width:500px;margin:0 auto">
                  <div style="background:#e53935;padding:24px;border-radius:12px 12px 0 0;text-align:center">
                    <h1 style="color:#fff;margin:0;font-size:22px">🩸 BloodConnect</h1>
                  </div>
                  <div style="background:#fff;padding:28px;border-radius:0 0 12px 12px;border:1px solid #f0f0f0">
                    <h2 style="color:#111;font-size:18px">Hi ${user.name}, verify your account</h2>
                    <p style="color:#666">Use the code below to verify your BloodConnect account:</p>
                    <div style="background:#f9f9f9;border:1.5px solid #eee;border-radius:10px;padding:20px;text-align:center;margin:20px 0">
                      <span style="font-size:36px;font-weight:900;letter-spacing:8px;color:#e53935">${otp}</span>
                    </div>
                    <p style="color:#aaa;font-size:13px">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
                  </div>
                </div>
                `
            );

            res.status(201).json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    aadhaarVerified: user.aadhaarVerified,
                    message: "Registration successful. Please check your email for the OTP."
                }
            });
        }
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ success: false, message: error.message || "Server error during registration." });
    }
};

// ─── Login ───────────────────────────────────────────────────────────────────

// @desc    Auth user & get token
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password, aadhaarLast4 } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required." });
        }

        const user = await User.findOne({ email });

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        if (!user.isVerified) {
            return res.status(401).json({
                success: false,
                message: "Account not verified. Please check your email for the OTP.",
                requiresOtp: true,
                email: user.email
            });
        }

        // ── Aadhaar last-4 check (optional 2FA layer) ──────────────────────
        if (aadhaarLast4) {
            if (aadhaarLast4.length !== 4 || !/^\d{4}$/.test(aadhaarLast4)) {
                return res.status(400).json({ success: false, message: "Aadhaar last 4 digits must be exactly 4 numbers." });
            }
            const storedLast4 = user.aadhaarNumber?.slice(-4);
            if (storedLast4 !== aadhaarLast4) {
                return res.status(403).json({
                    success: false,
                    message: "Aadhaar mismatch. The last 4 digits do not match our records.",
                    aadhaarMismatch: true
                });
            }
        }
        // ───────────────────────────────────────────────────────────────────

        const token = generateToken(res, user._id);

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                bloodGroup: user.bloodGroup || null,
                aadhaarVerified: user.aadhaarVerified,
                aadhaarLast4: user.aadhaarNumber?.slice(-4) || null,
                accessToken: token
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Server error during login. Please try again." });
    }
};

// ─── Logout ───────────────────────────────────────────────────────────────────

// @desc    Logout user / clear cookie
// @route   POST /api/v1/auth/logout
// @access  Public
const logoutUser = (req, res) => {
    res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
    res.status(200).json({ success: true, message: "Logged out successfully." });
};

// ─── OTP Verify ───────────────────────────────────────────────────────────────

// @desc    Verify OTP sent after registration
// @route   POST /api/v1/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP are required." });

        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ success: false, message: "User not found." });
        if (user.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP." });
        if (user.otpExpires < Date.now()) return res.status(400).json({ success: false, message: "OTP has expired. Please register again." });

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = generateToken(res, user._id);

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                aadhaarVerified: user.aadhaarVerified,
                accessToken: token,
                message: "Account verified successfully. Welcome to BloodConnect!"
            }
        });
    } catch (error) {
        console.error("OTP verify error:", error);
        res.status(500).json({ success: false, message: "Server error during OTP verification." });
    }
};

// ─── Resend OTP ───────────────────────────────────────────────────────────────

// @desc    Resend OTP
// @route   POST /api/v1/auth/resend-otp
// @access  Public
const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: "Email is required." });

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found." });
        if (user.isVerified) return res.status(400).json({ success: false, message: "Account already verified." });

        const otp = generateOtp();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        await sendEmail(
            user.email,
            "Your BloodConnect Verification Code (Resent)",
            `Your new OTP is ${otp}. It expires in 10 minutes.`,
            `<div style="font-family:Inter,sans-serif;text-align:center;padding:30px">
              <h2 style="color:#e53935">BloodConnect OTP</h2>
              <div style="font-size:32px;font-weight:900;letter-spacing:8px;color:#e53935;margin:20px 0">${otp}</div>
              <p style="color:#aaa">Expires in 10 minutes</p>
            </div>`
        );

        res.status(200).json({ success: true, message: "OTP resent to your email." });
    } catch (error) {
        console.error("Resend OTP error:", error);
        res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
};

// ─── Verify Aadhaar ───────────────────────────────────────────────────────────

// @desc    Mark user's Aadhaar as verified (called after admin/auto review in dev)
// @route   POST /api/v1/auth/verify-aadhaar
// @access  Public in dev / Admin in prod
const verifyAadhaar = async (req, res) => {
    try {
        const { email, aadhaarNumber } = req.body;
        if (!email || !aadhaarNumber) {
            return res.status(400).json({ success: false, message: "Email and Aadhaar number are required." });
        }

        const clean = aadhaarNumber.replace(/\s/g, "");
        if (!isValidAadhaar(clean)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Aadhaar format. Must be 12 digits, first digit 2–9."
            });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        if (user.aadhaarNumber !== clean) {
            return res.status(403).json({ success: false, message: "Aadhaar number does not match our records." });
        }

        user.aadhaarVerified = true;
        user.aadhaarVerifiedAt = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Aadhaar verified successfully.",
            data: { aadhaarVerified: true, aadhaarLast4: clean.slice(-4) }
        });
    } catch (error) {
        console.error("Aadhaar verify error:", error);
        res.status(500).json({ success: false, message: "Server error during Aadhaar verification." });
    }
};

// ─── Get Me ───────────────────────────────────────────────────────────────────

// @desc    Get logged-in user profile
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ success: false, message: "User not found." });

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                bloodGroup: user.bloodGroup,
                phone: user.phone,
                address: user.address,
                isVerified: user.isVerified,
                aadhaarVerified: user.aadhaarVerified,
                aadhaarLast4: user.aadhaarNumber?.slice(-4) || null,
                availability: user.availability,
                profilePicture: user.profilePicture || null,
            }
        });
    } catch (error) {
        console.error("getMe error:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

export { registerUser, loginUser, logoutUser, verifyOtp, resendOtp, verifyAadhaar, getMe };
