import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

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

function issueTokenAndRespond(
	res: Response,
	user: {
		id: number;
		email: string;
		name?: string | null;
		avatar?: string | null;
	},
	statusCode: number,
) {
	const jwtSecret = process.env.JWT_SECRET;
	if (!jwtSecret) {
		console.error("JWT_SECRET is not defined in the environment");
		return res
			.status(500)
			.json({ error: "Server authentication is not configured" });
	}

	const token = jwt.sign({ userId: user.id }, jwtSecret, {
		expiresIn: "7d",
	});

	return res.status(statusCode).json({
		token,
		user: {
			id: user.id,
			email: user.email,
			name: user.name ?? null,
			avatar: user.avatar ?? null,
		},
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

			return issueTokenAndRespond(res, existingUser, 200);
		}

		const hashedPassword = await bcrypt.hash(password, 12);

		try {
			const newUser = await prisma.user.create({
				data: {
					email: normalizedEmail,
					password: hashedPassword,
				},
			});

			return issueTokenAndRespond(res, newUser, 201);
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

			return issueTokenAndRespond(res, concurrentUser, 200);
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
