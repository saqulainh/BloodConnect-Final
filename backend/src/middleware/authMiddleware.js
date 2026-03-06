import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
    let token;

    if (req.cookies.jwt) {
        token = req.cookies.jwt;
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            const user = await User.findById(decoded.userId).select("-password");

            // 🔒 User no longer exists (deleted by admin)
            if (!user) {
                return res.status(401).json({ success: false, message: "Account no longer exists." });
            }

            // 🔒 User is banned — reject immediately
            if (user.isBanned) {
                return res.status(403).json({ success: false, message: "Account suspended. Contact support." });
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(401).json({ success: false, message: "Not authorized, token failed." });
        }
    } else {
        res.status(401).json({ success: false, message: "Not authorized, no token." });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: "Not authorized as an admin" });
    }
};

export { protect, admin };
