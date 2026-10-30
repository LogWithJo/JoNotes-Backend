import assert from "node:assert/strict";
import test from "node:test";
import { PrismaClient } from "../generated/prisma/client.js";
import { app } from "../server.js";
import { parseDurationToSeconds } from "./auth.controller.js";
const prisma = new PrismaClient();
test("parseDurationToSeconds parses various formats accurately", () => {
    assert.equal(parseDurationToSeconds("30s"), 30);
    assert.equal(parseDurationToSeconds("15m"), 900);
    assert.equal(parseDurationToSeconds("2h"), 7200);
    assert.equal(parseDurationToSeconds("7d"), 604800);
    assert.equal(parseDurationToSeconds("120"), 120);
    assert.equal(parseDurationToSeconds("", 900), 900);
});
test("Authentication and Refresh Token Integration Suite", async (t) => {
    const server = app.listen(0);
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;
    const uniqueSuffix = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const testEmail = `auth_test_${uniqueSuffix}@example.com`;
    const testPassword = "securePassword123!";
    let currentAccessToken = "";
    let currentRefreshToken = "";
    let registeredUserId;
    t.after(async () => {
        if (registeredUserId) {
            try {
                await prisma.refreshToken.deleteMany({
                    where: { userId: registeredUserId },
                });
                await prisma.user.delete({
                    where: { id: registeredUserId },
                });
            }
            catch (err) {
                console.error("Cleanup error:", err);
            }
        }
        await prisma.$disconnect();
        await new Promise((resolve) => server.close(() => resolve()));
    });
    await t.test("POST /auth/register strips user profile and returns tokens", async () => {
        const res = await fetch(`${baseUrl}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword,
            }),
        });
        assert.equal(res.status, 201);
        const data = (await res.json());
        // User profile must NOT be returned in register response
        assert.equal(data.user, undefined, "Register payload must not contain user profile");
        // Strictly return authentication tokens and metadata
        assert.ok(typeof data.accessToken === "string" && data.accessToken.length > 0);
        assert.ok(typeof data.refreshToken === "string" && data.refreshToken.length > 0);
        assert.equal(data.tokenType, "Bearer");
        assert.equal(typeof data.expiresIn, "number");
        currentAccessToken = data.accessToken;
        currentRefreshToken = data.refreshToken;
        // Verify cookies are set
        const setCookie = res.headers.get("set-cookie") || "";
        assert.ok(setCookie.includes("refreshToken"));
        assert.ok(setCookie.includes("accessToken") || setCookie.includes("token"));
        assert.ok(setCookie.includes("HttpOnly"));
    });
    await t.test("POST /auth/login strips user profile and returns tokens", async () => {
        const res = await fetch(`${baseUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword,
            }),
        });
        assert.equal(res.status, 200);
        const data = (await res.json());
        // User profile must NOT be returned in login response
        assert.equal(data.user, undefined, "Login payload must not contain user profile");
        assert.ok(typeof data.accessToken === "string" && data.accessToken.length > 0);
        assert.ok(typeof data.refreshToken === "string" && data.refreshToken.length > 0);
        assert.equal(data.tokenType, "Bearer");
        currentAccessToken = data.accessToken;
        currentRefreshToken = data.refreshToken;
    });
    await t.test("GET /me rejects unauthenticated request", async () => {
        const res = await fetch(`${baseUrl}/me`);
        assert.equal(res.status, 401);
        const data = (await res.json());
        assert.ok(data.error);
    });
    await t.test("GET /auth/me rejects unauthenticated request", async () => {
        const res = await fetch(`${baseUrl}/auth/me`);
        assert.equal(res.status, 401);
    });
    await t.test("GET /me returns current authenticated user information via Bearer token", async () => {
        const res = await fetch(`${baseUrl}/me`, {
            headers: {
                Authorization: `Bearer ${currentAccessToken}`,
            },
        });
        assert.equal(res.status, 200);
        const data = (await res.json());
        assert.ok(data.user);
        assert.equal(data.user.email, testEmail);
        assert.equal(typeof data.user.id, "number");
        assert.equal(data.user.password, undefined, "Password must not be returned");
        registeredUserId = data.user.id;
    });
    await t.test("GET /auth/me works with cookie authentication", async () => {
        const res = await fetch(`${baseUrl}/auth/me`, {
            headers: {
                Cookie: `accessToken=${currentAccessToken}`,
            },
        });
        assert.equal(res.status, 200);
        const data = (await res.json());
        assert.equal(data.user.email, testEmail);
    });
    await t.test("POST /auth/refresh fails when refresh token is missing", async () => {
        const res = await fetch(`${baseUrl}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });
        assert.equal(res.status, 400);
        const data = (await res.json());
        assert.equal(data.error, "Refresh token is required");
    });
    await t.test("POST /auth/refresh fails with invalid refresh token", async () => {
        const res = await fetch(`${baseUrl}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: "invalid-token" }),
        });
        assert.equal(res.status, 401);
    });
    let rotatedRefreshToken = "";
    await t.test("POST /auth/refresh rotates token and issues new access token", async () => {
        const res = await fetch(`${baseUrl}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: currentRefreshToken }),
        });
        assert.equal(res.status, 200);
        const data = (await res.json());
        assert.ok(typeof data.accessToken === "string");
        assert.ok(typeof data.refreshToken === "string");
        assert.notEqual(data.refreshToken, currentRefreshToken);
        rotatedRefreshToken = data.refreshToken;
        currentAccessToken = data.accessToken;
        // Check new access token works with /me
        const meRes = await fetch(`${baseUrl}/me`, {
            headers: { Authorization: `Bearer ${currentAccessToken}` },
        });
        assert.equal(meRes.status, 200);
    });
    await t.test("Using rotated (old) refresh token fails due to revocation", async () => {
        const res = await fetch(`${baseUrl}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: currentRefreshToken }),
        });
        assert.equal(res.status, 401);
        const data = (await res.json());
        assert.equal(data.error, "Refresh token has been revoked");
    });
    await t.test("POST /refresh-token alias endpoint works via cookie", async () => {
        const res = await fetch(`${baseUrl}/refresh-token`, {
            method: "POST",
            headers: {
                Cookie: `refreshToken=${rotatedRefreshToken}`,
            },
        });
        assert.equal(res.status, 200);
        const data = (await res.json());
        assert.ok(typeof data.accessToken === "string");
        assert.ok(typeof data.refreshToken === "string");
        rotatedRefreshToken = data.refreshToken;
    });
    await t.test("POST /auth/revoke revokes refresh token", async () => {
        const revokeRes = await fetch(`${baseUrl}/auth/revoke`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: rotatedRefreshToken }),
        });
        assert.equal(revokeRes.status, 200);
        // Now refreshing with that token must fail
        const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: rotatedRefreshToken }),
        });
        assert.equal(refreshRes.status, 401);
        const data = (await refreshRes.json());
        assert.equal(data.error, "Refresh token has been revoked");
    });
    await t.test("POST /auth/logout revokes refresh token and clears cookies", async () => {
        // Log in again to get fresh tokens
        const loginRes = await fetch(`${baseUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword,
            }),
        });
        const loginData = (await loginRes.json());
        const logoutToken = loginData.refreshToken;
        // Logout with token in body
        const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: logoutToken }),
        });
        assert.equal(logoutRes.status, 200);
        // Verify token is revoked
        const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: logoutToken }),
        });
        assert.equal(refreshRes.status, 401);
        const refreshData = (await refreshRes.json());
        assert.equal(refreshData.error, "Refresh token has been revoked");
    });
});
//# sourceMappingURL=auth.controller.test.js.map