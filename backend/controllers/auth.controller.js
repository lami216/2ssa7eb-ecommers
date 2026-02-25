import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import Service from "../models/service.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
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
	const { name, email, password } = req.body;

	if (typeof name !== "string" || name.trim() === "") {
		return res.status(400).json({ message: "Name is required and must be a string" });
	}

	if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
		return res.status(400).json({ message: "Valid email is required" });
	}

	if (typeof password !== "string" || password.length < 6) {
		return res.status(400).json({ message: "Password must be at least 6 characters long" });
	}

	const sanitizedName = name.trim();
	const sanitizedEmail = email.trim().toLowerCase();

	try {
		const userExists = await User.findOne({ email: sanitizedEmail });

		if (userExists) {
			return res.status(400).json({ message: "User already exists" });
		}

		const verificationToken = crypto.randomInt(100000, 1000000).toString();

		const user = await User.create({
			name: sanitizedName,
			email: sanitizedEmail,
			password: password,
			verificationToken,
			verificationTokenExpiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
		});

		// authenticate
		const { accessToken, refreshToken } = generateTokens(user._id);
		await storeRefreshToken(user._id, refreshToken);

		setCookies(res, accessToken, refreshToken);

		try {
			await sendVerificationEmail(user.email, verificationToken);
		} catch (emailError) {
			console.error("Error sending verification email on signup");
			// We continue because the user can request a resend from the verification page
		}

		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			isVerified: user.isVerified,
			hasServices: false,
		});
	} catch (error) {
		console.error("Error in signup controller");
		res.status(500).json({ message: "Server error" });
	}
};

export const verifyEmail = async (req, res) => {
	const { code } = req.body;

	if (typeof code !== "string" || code.length !== 6) {
		return res.status(400).json({ message: "Invalid verification code format" });
	}

	try {
		const user = await User.findOne({
			_id: req.user._id,
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
		console.error("Error in verifyEmail controller");
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

		const verificationToken = crypto.randomInt(100000, 1000000).toString();
		user.verificationToken = verificationToken;
		user.verificationTokenExpiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
		await user.save();

		await sendVerificationEmail(user.email, verificationToken);

		// Set rate limit for 60 seconds
		await redis.set(rateLimitKey, "true", "EX", 60);

		res.json({ message: "Verification code resent successfully" });
	} catch (error) {
		console.error("Error in resendVerificationCode controller");
		res.status(500).json({ message: "Server error" });
	}
};

export const googleLogin = async (req, res) => {
	const { credential } = req.body;

	if (typeof credential !== "string" || credential === "") {
		return res.status(400).json({ message: "Google credential is required" });
	}

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
		console.error("Error in googleLogin controller");
		res.status(500).json({ message: "Server error" });
	}
};

export const login = async (req, res) => {
	const { email, password } = req.body;

	if (typeof email !== "string" || typeof password !== "string") {
		return res.status(400).json({ message: "Invalid email or password" });
	}

	const sanitizedEmail = email.trim().toLowerCase();

	try {
		const user = await User.findOne({ email: sanitizedEmail });

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
		console.error("Error in login controller");
		res.status(500).json({ message: "Server error" });
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
		console.error("Error in logout controller");
		res.status(500).json({ message: "Server error" });
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
		console.error("Error in refreshToken controller");
		res.status(500).json({ message: "Server error" });
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
		console.error("Error in getProfile controller");
		res.status(500).json({ message: "Server error" });
	}
};
