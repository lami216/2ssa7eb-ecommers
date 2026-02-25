import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import Service from "../models/service.model.js";
import jwt from "jsonwebtoken";
import { sendVerificationEmail, sendWelcomeEmail } from "../lib/emails.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateTokens = (userId) => {
	const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: "15m",
	});

	const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: "7d",
	});

	return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
	await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7days
};

const setCookies = (res, accessToken, refreshToken) => {
	res.cookie("accessToken", accessToken, {
		httpOnly: true, // prevent XSS attacks, cross site scripting attack
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
		maxAge: 15 * 60 * 1000, // 15 minutes
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true, // prevent XSS attacks, cross site scripting attack
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
	});
};

export const signup = async (req, res) => {
	const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
	const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
	const password = typeof req.body.password === "string" ? req.body.password : "";

	try {
		const userExists = await User.findOne({ email });

		if (userExists) {
			return res.status(400).json({ message: "User already exists" });
		}

		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

		const user = await User.create({
			name,
			email,
			password,
			verificationToken,
			verificationTokenExpiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
		});

		// authenticate
		const { accessToken, refreshToken } = generateTokens(user._id);
		await storeRefreshToken(user._id, refreshToken);

		setCookies(res, accessToken, refreshToken);

		await sendVerificationEmail(user.email, verificationToken);

		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			isVerified: user.isVerified,
			hasServices: false,
		});
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ message: error.message });
	}
};

export const verifyEmail = async (req, res) => {
	const { code } = req.body;
	try {
		const user = await User.findOne({
			verificationToken: code,
			verificationTokenExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ message: "Invalid or expired verification code" });
		}

		user.isVerified = true;
		user.verificationToken = undefined;
		user.verificationTokenExpiresAt = undefined;
		await user.save();

		await sendWelcomeEmail(user.email, user.name);

		res.status(200).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			isVerified: user.isVerified,
		});
	} catch (error) {
		console.log("Error in verifyEmail controller", error.message);
		res.status(500).json({ message: "Server error" });
	}
};

export const resendVerificationCode = async (req, res) => {
	try {
		const userId = req.user._id;
		const rateLimitKey = `resend_code_limit:${userId}`;

		// Check rate limit in Redis
		const isRateLimited = await redis.get(rateLimitKey);
		if (isRateLimited) {
			return res.status(429).json({ message: "Please wait 1 minute before requesting another code" });
		}

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		if (user.isVerified) {
			return res.status(400).json({ message: "User is already verified" });
		}

		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
		user.verificationToken = verificationToken;
		user.verificationTokenExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
		await user.save();

		await sendVerificationEmail(user.email, verificationToken);

		// Set rate limit for 60 seconds
		await redis.set(rateLimitKey, "true", "EX", 60);

		res.json({ message: "Verification code resent successfully" });
	} catch (error) {
		console.log("Error in resendVerificationCode controller", error.message);
		res.status(500).json({ message: "Server error" });
	}
};

export const googleLogin = async (req, res) => {
	const { credential } = req.body;
	try {
		const ticket = await client.verifyIdToken({
			idToken: credential,
			audience: process.env.GOOGLE_CLIENT_ID,
		});
		const payload = ticket.getPayload();
		const { email, sub: googleId, name } = payload;

		let user = await User.findOne({ email });

		if (user) {
			if (!user.googleId) {
				user.googleId = googleId;
			}
			user.isVerified = true;
			await user.save();
		} else {
			user = await User.create({
				name,
				email,
				googleId,
				isVerified: true,
			});
		}

		const { accessToken, refreshToken } = generateTokens(user._id);
		await storeRefreshToken(user._id, refreshToken);
		setCookies(res, accessToken, refreshToken);

		const hasServices = await Service.exists({ email: user.email });

		res.status(200).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			isVerified: user.isVerified,
			hasServices: Boolean(hasServices),
		});
	} catch (error) {
		console.log("Error in googleLogin controller", error.message);
		res.status(500).json({ message: "Server error" });
	}
};

export const login = async (req, res) => {
        try {
                const email =
                        typeof req.body.email === "string"
                                ? req.body.email.trim().toLowerCase()
                                : "";
                const password = typeof req.body.password === "string" ? req.body.password : "";

                const user = await User.findOne({ email });

		if (user && (await user.comparePassword(password))) {
			const hasServices = await Service.exists({ email: user.email });
			const { accessToken, refreshToken } = generateTokens(user._id);
			await storeRefreshToken(user._id, refreshToken);
			setCookies(res, accessToken, refreshToken);

			res.json({
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				isVerified: user.isVerified,
				hasServices: Boolean(hasServices),
			});
		} else {
			res.status(400).json({ message: "Invalid email or password" });
		}
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ message: error.message });
	}
};

export const logout = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;
		if (refreshToken) {
			const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
			await redis.del(`refresh_token:${decoded.userId}`);
		}

		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");
		res.json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// this will refresh the access token
export const refreshToken = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;

		if (!refreshToken) {
			return res.status(401).json({ message: "No refresh token provided" });
		}

		const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
		const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

		if (storedToken !== refreshToken) {
			return res.status(401).json({ message: "Invalid refresh token" });
		}

		const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 15 * 60 * 1000,
		});

		res.json({ message: "Token refreshed successfully" });
	} catch (error) {
		console.log("Error in refreshToken controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getProfile = async (req, res) => {
	try {
		const hasServices = await Service.exists({ email: req.user.email });
		res.json({
			...req.user.toObject(),
			hasServices: Boolean(hasServices),
		});
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
