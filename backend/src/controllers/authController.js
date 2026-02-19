import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { sendEmail } from "../utils/email.js";

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, bloodGroup, role, aadhaarNumber, address, lat, lng } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Handle file uploads
        const aadhaarImage = req.files['aadhaarImage'] ? req.files['aadhaarImage'][0].path : null;
        const medicalCertificate = req.files['medicalCertificate'] ? req.files['medicalCertificate'][0].path : null;
        const profilePicture = req.files['profilePicture'] ? req.files['profilePicture'][0].path : null;

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        const user = await User.create({
            name,
            email,
            password,
            phone,
            bloodGroup,
            role,
            aadhaarNumber,
            address,
            location: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
            aadhaarImage,
            medicalCertificate,
            profilePicture,
            otp,
            otpExpires
        });

        if (user) {
            // Send OTP Email
            await sendEmail(
                user.email,
                "Your BloodConnect Verification Code",
                `Your OTP is ${otp}`,
                `<h1>Welcome to BloodConnect</h1><p>Your verification code is: <strong>${otp}</strong></p>`
            );

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                message: "Registration successful. Please verify OTP."
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        if (!user.isVerified) {
            // Optional: Resend OTP here if needed, but for now just block
            return res.status(401).json({ message: "Account not verified. Please verify OTP." });
        }

        generateToken(res, user._id);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            aadhaarLast4: user.aadhaarNumber.slice(-4),
        });
    } else {
        res.status(401).json({ message: "Invalid email or password" });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/v1/auth/logout
// @access  Public
const logoutUser = (req, res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: "Logged out successfully" });
};

// @desc    Verify OTP
// @route   POST /api/v1/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (user && user.otp === otp && user.otpExpires > Date.now()) {
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        generateToken(res, user._id);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            message: "Account verified successfully"
        });
    } else {
        res.status(400).json({ message: "Invalid or expired OTP" });
    }
};

// @desc    Get user profile
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            bloodGroup: user.bloodGroup,
            phone: user.phone,
            address: user.address,
            isVerified: user.isVerified,
            availability: user.availability
        });
    } else {
        res.status(404).json({ message: "User not found" });
    }
};

export { registerUser, loginUser, logoutUser, verifyOtp, getMe };
