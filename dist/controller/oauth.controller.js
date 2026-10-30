import jwt from "jsonwebtoken";
import { getPrimaryFrontendUrl, runtimeConfig } from "../config/runtime.js";
import { findOrCreateUserFromOAuth } from "../services/oauth/account-linking.js";
import { exchangeGitHubCode, fetchGitHubUser } from "../services/oauth/github.js";
import { exchangeGoogleCode, fetchGoogleProfile } from "../services/oauth/google.js";
import { getCookieOptions } from "./auth.controller.js";
function setTokenCookie(res, userId) {
    const token = jwt.sign({ userId }, runtimeConfig.jwtSecret, {
        expiresIn: "7d",
    });
    res.cookie("token", token, getCookieOptions());
}
export async function redirectToGoogle(_req, res) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL;
    if (!clientId || !redirectUri) {
        return res.status(500).json({ error: "Google OAuth is not configured" });
    }
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        prompt: "consent",
    });
    return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
export async function handleGoogleCallback(req, res) {
    const code = typeof req.query.code === "string" ? req.query.code : "";
    if (!code) {
        return res.status(400).json({ error: "Missing Google OAuth code" });
    }
    try {
        const tokenResponse = await exchangeGoogleCode(code);
        const profile = await fetchGoogleProfile(tokenResponse.access_token);
        const user = await findOrCreateUserFromOAuth({
            provider: "google",
            providerAccountId: profile.sub,
            email: profile.email,
            emailVerified: profile.email_verified,
            name: profile.name,
            avatar: profile.picture,
        });
        setTokenCookie(res, user.id);
        return res.redirect(getPrimaryFrontendUrl());
    }
    catch (error) {
        console.error("Google OAuth failed:", error);
        return res.status(500).json({ error: "Unable to complete Google sign-in" });
    }
}
export async function redirectToGitHub(_req, res) {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = process.env.GITHUB_CALLBACK_URL;
    if (!clientId || !redirectUri) {
        return res.status(500).json({ error: "GitHub OAuth is not configured" });
    }
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: "read:user user:email",
        allow_signup: "true",
    });
    return res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}
export async function handleGitHubCallback(req, res) {
    const code = typeof req.query.code === "string" ? req.query.code : "";
    if (!code) {
        return res.status(400).json({ error: "Missing GitHub OAuth code" });
    }
    try {
        const tokenResponse = await exchangeGitHubCode(code);
        const profile = await fetchGitHubUser(tokenResponse.access_token);
        const user = await findOrCreateUserFromOAuth({
            provider: "github",
            providerAccountId: String(profile.id),
            email: profile.email ?? `${profile.login}@users.noreply.github.com`,
            emailVerified: true,
            name: profile.name ?? profile.login,
            avatar: profile.avatar_url ?? null,
        });
        setTokenCookie(res, user.id);
        return res.redirect(getPrimaryFrontendUrl());
    }
    catch (error) {
        console.error("GitHub OAuth failed:", error);
        return res.status(500).json({ error: "Unable to complete GitHub sign-in" });
    }
}
//# sourceMappingURL=oauth.controller.js.map