import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const resolveAdminEmails = () =>
        (process.env.ADMIN_EMAILS || "")
                .split(",")
                .map((email) => email.trim().toLowerCase())
                .filter(Boolean);

export const protectRoute = async (req, res, next) => {
        try {
                const accessToken = req.cookies.accessToken;

                if (!accessToken) {
                        return res.status(401).json({ message: "Unauthorized - No access token provided" });
                }

                try {
                        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
                        const user = await User.findById(decoded.userId).select("-password");

                        if (!user) {
                                return res.status(401).json({ message: "User not found" });
                        }

                        req.user = user;

                        next();
                } catch (error) {
                        if (error.name === "TokenExpiredError") {
                                return res.status(401).json({ message: "Unauthorized - Access token expired" });
                        }
                        throw error;
                }
        } catch (error) {
                console.log("Error in protectRoute middleware", error.message);
                return res.status(401).json({ message: "Unauthorized - Invalid access token" });
        }
};

export const optionalAuth = async (req, res, next) => {
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
                return next();
        }

        try {
                const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
                const user = await User.findById(decoded.userId).select("-password");
                if (user) {
                        req.user = user;
                }
        } catch (error) {
                console.log("Optional auth failed", error.message);
        }

        return next();
};

export const adminRoute = (req, res, next) => {
        const adminEmails = resolveAdminEmails();
        const emailMatch = req.user?.email ? adminEmails.includes(req.user.email.toLowerCase()) : false;

        if (req.user && (req.user.role === "admin" || emailMatch)) {
                next();
        } else {
                return res.status(403).json({ message: "Access denied - Admin only" });
        }
};
