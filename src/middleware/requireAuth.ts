import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
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
	const authHeader = req.headers.authorization;

	if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ error: "Missing or invalid token" });
	}

	const token = authHeader.slice("Bearer ".length).trim();

	if (!token) {
		return res.status(401).json({ error: "Missing or invalid token" });
	}

	const jwtSecret = process.env.JWT_SECRET;
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
		return res.status(401).json({ error: "Invalid or expired token" });
	}
}
