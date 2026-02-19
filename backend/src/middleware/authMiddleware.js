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
            req.user = await User.findById(decoded.userId).select("-password");
            next();
        } catch (error) {
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    } else {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};

export { protect };
