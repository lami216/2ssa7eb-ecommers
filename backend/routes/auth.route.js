import express from "express";
import {
	login,
	logout,
	signup,
	refreshToken,
	getProfile,
	verifyEmail,
	resendVerificationCode,
	googleLogin,
	forgotPassword,
	verifyResetCode,
	resetPassword,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const forgotPasswordLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 5, // limit each IP to 5 forgot password requests per windowMs
	message: "Too many forgot password attempts, please try again after 15 minutes",
	standardHeaders: true,
	legacyHeaders: false,
});

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);

router.post("/verify-email", protectRoute, verifyEmail);
router.post("/resend-verification-code", protectRoute, resendVerificationCode);
router.post("/google-login", googleLogin);

router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);

export default router;
