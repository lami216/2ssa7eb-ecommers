import { redisClient } from "../lib/redisClient.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateTokens = (userId) => {
	const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: "15m",
	});

	const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: "7d",
	});

	return { accessToken, refreshToken };
};

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

const storeRefreshToken = async (userId, refreshToken) => {
        if (!redisClient.isReady()) {
                if (redisClient.isEnabled()) {
                        console.log(
                                `[Redis] Cache not ready. Skipping refresh token store for user ${userId}.`
                        );
                }
                return;
        }

        try {
                await redisClient.setEx(`refresh_token:${userId}`, REFRESH_TOKEN_TTL, refreshToken);
                console.log(`[Redis] Stored refresh token for user ${userId}.`);
        } catch (error) {
                console.log(
                        `[Redis] Failed to store refresh token for user ${userId}: ${error.message}`
                );
        }
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
	const { email, password, name } = req.body;
	try {
		const userExists = await User.findOne({ email });

		if (userExists) {
			return res.status(400).json({ message: "User already exists" });
		}
		const user = await User.create({ name, email, password });

		// authenticate
		const { accessToken, refreshToken } = generateTokens(user._id);
		await storeRefreshToken(user._id, refreshToken);

		setCookies(res, accessToken, refreshToken);

		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
		});
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ message: error.message });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });

		if (user && (await user.comparePassword(password))) {
			const { accessToken, refreshToken } = generateTokens(user._id);
			await storeRefreshToken(user._id, refreshToken);
			setCookies(res, accessToken, refreshToken);

			res.json({
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
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

                        if (!redisClient.isReady()) {
                                if (redisClient.isEnabled()) {
                                        console.log(
                                                `[Redis] Cache not ready. Skipping refresh token removal for user ${decoded.userId}.`
                                        );
                                }
                        } else {
                                try {
                                        await redisClient.del(`refresh_token:${decoded.userId}`);
                                        console.log(
                                                `[Redis] Cleared refresh token cache for user ${decoded.userId}.`
                                        );
                                } catch (error) {
                                        console.log(
                                                `[Redis] Failed to clear refresh token for user ${decoded.userId}: ${error.message}`
                                        );
                                }
                        }
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
                let storedToken = null;
                let cacheVerified = false;

                if (!redisClient.isReady()) {
                        if (redisClient.isEnabled()) {
                                console.log(
                                        `[Redis] Cache not ready. Skipping refresh token validation for user ${decoded.userId}.`
                                );
                        }
                } else {
                        try {
                                storedToken = await redisClient.get(`refresh_token:${decoded.userId}`);
                                cacheVerified = true;
                        } catch (error) {
                                console.log(
                                        `[Redis] Failed to read refresh token for user ${decoded.userId}: ${error.message}`
                                );
                        }
                }

                if (cacheVerified && storedToken !== refreshToken) {
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
		res.json(req.user);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
