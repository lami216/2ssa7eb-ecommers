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

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);

router.post("/verify-email", protectRoute, verifyEmail);
router.post("/resend-verification-code", protectRoute, resendVerificationCode);
router.post("/google-login", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);

export default router;
