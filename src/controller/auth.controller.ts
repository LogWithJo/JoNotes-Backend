import crypto from "node:crypto";
import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { runtimeConfig } from "../config/runtime.js";
import { PrismaClient } from "../generated/prisma/client.js";
import type { AuthRequest } from "../middleware/requireAuth.js";

const prisma = new PrismaClient();

function getRequestCookie(req: Request, name: string): string {
	const value = req.cookies[name];
	return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(email: unknown): string {
	return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function validateEmailAndPassword(email: string, password: unknown) {
	if (!email || !password || typeof password !== "string") {
		return "Email and password are required";
	}

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return "Please provide a valid email address";
	}

	if (password.length < 8 || password.length > 128) {
		return "Password must be between 8 and 128 characters";
	}

	return null;
}

export function parseDurationToSeconds(
	duration: string,
	defaultSeconds = 900,
): number {
	if (!duration || typeof duration !== "string") {
		return defaultSeconds;
	}

	const trimmed = duration.trim().toLowerCase();
	const match = trimmed.match(/^(\d+)([smhd])?$/);
	if (!match) {
		const parsed = Number.parseInt(trimmed, 10);
		return Number.isFinite(parsed) ? parsed : defaultSeconds;
	}

	const valueStr = match[1];
	if (!valueStr) {
		return defaultSeconds;
	}
	const value = Number.parseInt(valueStr, 10);
	const unit = match[2];

	switch (unit) {
		case "s":
			return value;
		case "m":
			return value * 60;
		case "h":
			return value * 3600;
		case "d":
			return value * 86400;
		default:
			return value;
	}
}

export function getAccessTokenCookieOptions() {
	const isProduction = runtimeConfig.nodeEnv === "production";
	const maxAgeSeconds = parseDurationToSeconds(
		runtimeConfig.accessTokenExpiresIn,
		900,
	);

	return {
		httpOnly: true,
		secure: isProduction,
		sameSite: isProduction ? "none" : "lax",
		path: "/",
		maxAge: maxAgeSeconds * 1000,
	} as const;
}

export function getRefreshTokenCookieOptions() {
	const isProduction = runtimeConfig.nodeEnv === "production";

	return {
		httpOnly: true,
		secure: isProduction,
		sameSite: isProduction ? "none" : "lax",
		path: "/",
		maxAge: runtimeConfig.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000,
	} as const;
}

export function getCookieOptions() {
	return getAccessTokenCookieOptions();
}

export function setAuthCookies(
	res: Response,
	accessToken: string,
	refreshToken: string,
) {
	const accessOpts = getAccessTokenCookieOptions();
	const refreshOpts = getRefreshTokenCookieOptions();

	res.cookie("token", accessToken, accessOpts);
	res.cookie("accessToken", accessToken, accessOpts);
	res.cookie("refreshToken", refreshToken, refreshOpts);
}

export function clearAuthCookies(res: Response) {
	const accessOpts = getAccessTokenCookieOptions();
	const refreshOpts = getRefreshTokenCookieOptions();

	res.clearCookie("token", {
		path: accessOpts.path,
		httpOnly: accessOpts.httpOnly,
		secure: accessOpts.secure,
		sameSite: accessOpts.sameSite,
	});
	res.clearCookie("accessToken", {
		path: accessOpts.path,
		httpOnly: accessOpts.httpOnly,
		secure: accessOpts.secure,
		sameSite: accessOpts.sameSite,
	});
	res.clearCookie("refreshToken", {
		path: refreshOpts.path,
		httpOnly: refreshOpts.httpOnly,
		secure: refreshOpts.secure,
		sameSite: refreshOpts.sameSite,
	});
}

export function clearAuthCookie(res: Response) {
	clearAuthCookies(res);
}

export function generateAccessToken(userId: number): string {
	const signOptions = {
		expiresIn: runtimeConfig.accessTokenExpiresIn,
	} as unknown as jwt.SignOptions;

	return jwt.sign({ userId }, runtimeConfig.jwtSecret, signOptions);
}

export function generateRefreshToken(userId: number): string {
	const signOptions = {
		expiresIn: runtimeConfig.refreshTokenExpiresIn,
	} as unknown as jwt.SignOptions;

	return jwt.sign(
		{ userId, jti: crypto.randomUUID() },
		runtimeConfig.jwtRefreshSecret,
		signOptions,
	);
}

export async function saveRefreshToken(userId: number, token: string) {
	const expiresAt = new Date(
		Date.now() + runtimeConfig.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000,
	);

	return prisma.refreshToken.create({
		data: {
			token,
			userId,
			expiresAt,
		},
	});
}

export async function issueTokens(res: Response, userId: number) {
	const accessToken = generateAccessToken(userId);
	const refreshToken = generateRefreshToken(userId);

	await saveRefreshToken(userId, refreshToken);
	setAuthCookies(res, accessToken, refreshToken);

	const expiresIn = parseDurationToSeconds(
		runtimeConfig.accessTokenExpiresIn,
		900,
	);

	return {
		token: accessToken,
		accessToken,
		refreshToken,
		tokenType: "Bearer",
		expiresIn,
	};
}

export async function issueTokenAndRespond(
	res: Response,
	user: {
		id: number;
		email: string;
	},
	statusCode: number,
) {
	const jwtSecret = runtimeConfig.jwtSecret;
	if (!jwtSecret) {
		console.error("JWT_SECRET is not defined in the environment");
		return res
			.status(500)
			.json({ error: "Server authentication is not configured" });
	}

	const tokens = await issueTokens(res, user.id);

	return res.status(statusCode).json({
		token: tokens.accessToken,
		accessToken: tokens.accessToken,
		refreshToken: tokens.refreshToken,
		tokenType: tokens.tokenType,
		expiresIn: tokens.expiresIn,
	});
}

export async function continueAuth(req: Request, res: Response) {
	const { email, password } = req.body;
	const normalizedEmail = normalizeEmail(email);
	const validationError = validateEmailAndPassword(normalizedEmail, password);

	if (validationError) {
		return res.status(400).json({ error: validationError });
	}

	try {
		const existingUser = await prisma.user.findUnique({
			where: { email: normalizedEmail },
		});

		if (existingUser) {
			if (!existingUser.password) {
				return res.status(401).json({ error: "Invalid credentials" });
			}

			const passwordMatches = await bcrypt.compare(
				password,
				existingUser.password,
			);
			if (!passwordMatches) {
				return res.status(401).json({ error: "Invalid credentials" });
			}

			return await issueTokenAndRespond(res, existingUser, 200);
		}

		const hashedPassword = await bcrypt.hash(password, 12);

		try {
			const newUser = await prisma.user.create({
				data: {
					email: normalizedEmail,
					password: hashedPassword,
				},
			});

			return await issueTokenAndRespond(res, newUser, 201);
		} catch (createError: unknown) {
			const error = createError as { code?: string };
			if (error.code !== "P2002") {
				throw createError;
			}

			const concurrentUser = await prisma.user.findUnique({
				where: { email: normalizedEmail },
			});

			if (!concurrentUser) {
				throw createError;
			}

			if (!concurrentUser.password) {
				return res.status(401).json({ error: "Invalid credentials" });
			}

			const passwordMatches = await bcrypt.compare(
				password,
				concurrentUser.password,
			);
			if (!passwordMatches) {
				return res.status(401).json({ error: "Invalid credentials" });
			}

			return await issueTokenAndRespond(res, concurrentUser, 200);
		}
	} catch (error) {
		console.error("Authentication continuation failed:", error);
		return res.status(500).json({
			error: "Authentication failed. Please try again later.",
		});
	}
}

export async function register(req: Request, res: Response) {
	return continueAuth(req, res);
}

export async function login(req: Request, res: Response) {
	return continueAuth(req, res);
}

export async function getMe(req: AuthRequest, res: Response) {
	const userId = req.userId;

	if (userId === undefined) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				name: true,
				avatar: true,
				createdAt: true,
			},
		});

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		return res.status(200).json({ user });
	} catch (error) {
		console.error("Failed to fetch current user profile:", error);
		return res.status(500).json({ error: "Failed to fetch user profile" });
	}
}

export async function refresh(req: Request, res: Response) {
	const rawToken = getRequestCookie(req, "refreshToken");

	if (!rawToken) {
		return res.status(400).json({ error: "Refresh token is required" });
	}

	try {
		jwt.verify(rawToken, runtimeConfig.jwtRefreshSecret);
	} catch (err: unknown) {
		const jwtError = err as { name?: string };
		if (jwtError.name === "TokenExpiredError") {
			return res.status(401).json({ error: "Refresh token has expired" });
		}
		return res.status(401).json({ error: "Invalid refresh token" });
	}

	try {
		const tokenRecord = await prisma.refreshToken.findUnique({
			where: { token: rawToken },
			include: { user: true },
		});

		if (!tokenRecord) {
			return res.status(401).json({ error: "Invalid refresh token" });
		}

		if (tokenRecord.revoked) {
			return res.status(401).json({ error: "Refresh token has been revoked" });
		}

		if (tokenRecord.expiresAt < new Date()) {
			return res.status(401).json({ error: "Refresh token has expired" });
		}

		if (!tokenRecord.user) {
			return res.status(401).json({ error: "User no longer exists" });
		}

		// Rotate token: revoke old token and create new pair
		await prisma.refreshToken.update({
			where: { id: tokenRecord.id },
			data: { revoked: true },
		});

		const newAccessToken = generateAccessToken(tokenRecord.userId);
		const newRefreshToken = generateRefreshToken(tokenRecord.userId);

		await saveRefreshToken(tokenRecord.userId, newRefreshToken);
		setAuthCookies(res, newAccessToken, newRefreshToken);

		const expiresIn = parseDurationToSeconds(
			runtimeConfig.accessTokenExpiresIn,
			900,
		);

		return res.status(200).json({
			token: newAccessToken,
			accessToken: newAccessToken,
			refreshToken: newRefreshToken,
			tokenType: "Bearer",
			expiresIn,
		});
	} catch (error) {
		console.error("Refresh token error:", error);
		return res.status(500).json({ error: "Failed to refresh token" });
	}
}

export async function revokeToken(req: Request, res: Response) {
	const rawToken =
		getRequestCookie(req, "refreshToken") ||
		(typeof req.body?.refreshToken === "string"
			? req.body.refreshToken.trim()
			: "");

	if (!rawToken) {
		return res.status(400).json({ error: "Refresh token is required" });
	}

	try {
		await prisma.refreshToken.updateMany({
			where: { token: rawToken },
			data: { revoked: true },
		});

		clearAuthCookies(res);
		return res.status(200).json({ message: "Token revoked successfully" });
	} catch (error) {
		console.error("Token revocation error:", error);
		return res.status(500).json({ error: "Failed to revoke token" });
	}
}

export async function logout(req: Request, res: Response) {
	const rawToken =
		getRequestCookie(req, "refreshToken") ||
		(typeof req.body?.refreshToken === "string"
			? req.body.refreshToken.trim()
			: "");

	if (rawToken) {
		try {
			await prisma.refreshToken.updateMany({
				where: { token: rawToken },
				data: { revoked: true },
			});
		} catch (error) {
			console.error("Failed to revoke refresh token during logout:", error);
		}
	}

	clearAuthCookies(res);
	return res.status(200).json({ message: "Logged out successfully" });
}
