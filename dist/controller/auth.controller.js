import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { runtimeConfig } from "../config/runtime.js";
import { PrismaClient } from "../generated/prisma/client.js";
const prisma = new PrismaClient();
function normalizeEmail(email) {
    return typeof email === "string" ? email.trim().toLowerCase() : "";
}
function validateEmailAndPassword(email, password) {
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
export function getCookieOptions() {
    const isProduction = runtimeConfig.nodeEnv === "production";
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };
}
function setAuthCookie(res, token) {
    res.cookie("token", token, getCookieOptions());
}
function clearAuthCookie(res) {
    const options = getCookieOptions();
    res.clearCookie("token", {
        path: options.path,
        httpOnly: options.httpOnly,
        secure: options.secure,
        sameSite: options.sameSite,
    });
}
export function issueTokenAndRespond(res, user, statusCode) {
    const jwtSecret = runtimeConfig.jwtSecret;
    if (!jwtSecret) {
        console.error("JWT_SECRET is not defined in the environment");
        return res
            .status(500)
            .json({ error: "Server authentication is not configured" });
    }
    const token = jwt.sign({ userId: user.id }, jwtSecret, {
        expiresIn: "7d",
    });
    setAuthCookie(res, token);
    return res.status(statusCode).json({
        user: {
            id: user.id,
            email: user.email,
            name: user.name ?? null,
            avatar: user.avatar ?? null,
        },
    });
}
export async function continueAuth(req, res) {
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
            const passwordMatches = await bcrypt.compare(password, existingUser.password);
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
        }
        catch (createError) {
            const error = createError;
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
            const passwordMatches = await bcrypt.compare(password, concurrentUser.password);
            if (!passwordMatches) {
                return res.status(401).json({ error: "Invalid credentials" });
            }
            return issueTokenAndRespond(res, concurrentUser, 200);
        }
    }
    catch (error) {
        console.error("Authentication continuation failed:", error);
        return res.status(500).json({
            error: "Authentication failed. Please try again later.",
        });
    }
}
export async function register(req, res) {
    return continueAuth(req, res);
}
export async function login(req, res) {
    return continueAuth(req, res);
}
export async function logout(_req, res) {
    clearAuthCookie(res);
    return res.status(200).json({ message: "Logged out successfully" });
}
//# sourceMappingURL=auth.controller.js.map