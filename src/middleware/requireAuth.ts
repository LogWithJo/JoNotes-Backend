import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { runtimeConfig } from "../config/runtime.js";
import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
	userId?: number;
}

export async function requireAuth(
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) {
	const cookieToken = req.cookies.accessToken || req.cookies.token;
	const authHeader = req.headers.authorization;

	let token: string | null = null;

	if (typeof cookieToken === "string" && cookieToken.length > 0) {
		token = cookieToken;
	} else if (
		typeof authHeader === "string" &&
		authHeader.startsWith("Bearer ")
	) {
		token = authHeader.slice("Bearer ".length).trim();
	}

	if (!token) {
		return res.status(401).json({ error: "Missing or invalid session token" });
	}

	const jwtSecret = runtimeConfig.jwtSecret;
	if (!jwtSecret) {
		console.error("JWT_SECRET is not defined in the environment");
		return res
			.status(500)
			.json({ error: "Server authentication is not configured" });
	}

	try {
		const payload = jwt.verify(token, jwtSecret) as {
			userId: number;
		};

		const user = await prisma.user.findUnique({
			where: { id: payload.userId },
		});

		if (!user) {
			return res.status(401).json({ error: "User no longer exists" });
		}

		req.userId = user.id;
		next();
	} catch {
		return res.status(401).json({ error: "Invalid or expired session token" });
	}
}
