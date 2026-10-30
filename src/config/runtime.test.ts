import assert from "node:assert/strict";
import test from "node:test";
import { buildRuntimeConfig, parseAllowedOrigins } from "./runtime.js";

test("parseAllowedOrigins trims and ignores blanks", () => {
	assert.deepEqual(
		parseAllowedOrigins(" https://a.example.com , , http://localhost:3000 "),
		["https://a.example.com", "http://localhost:3000"],
	);
});

test("development config allows localhost defaults", () => {
	const config = buildRuntimeConfig({
		NODE_ENV: "development",
		PORT: "4000",
		FRONTEND_URL: "",
		JWT_SECRET: "dev-secret",
	});

	assert.equal(config.port, 4000);
	assert.equal(config.nodeEnv, "development");
	assert.ok(config.allowedOrigins.includes("http://localhost:3000"));
	assert.equal(config.jwtSecret, "dev-secret");
	assert.equal(config.jwtRefreshSecret, "dev-secret_refresh");
	assert.equal(config.accessTokenExpiresIn, "15m");
	assert.equal(config.refreshTokenExpiresIn, "7d");
	assert.equal(config.refreshTokenExpiresInDays, 7);
});

test("custom refresh token settings are respected", () => {
	const config = buildRuntimeConfig({
		NODE_ENV: "development",
		JWT_SECRET: "my-secret",
		JWT_REFRESH_SECRET: "custom-refresh-secret",
		ACCESS_TOKEN_EXPIRES_IN: "30m",
		REFRESH_TOKEN_EXPIRES_IN: "14d",
		REFRESH_TOKEN_EXPIRES_IN_DAYS: "14",
	});

	assert.equal(config.jwtRefreshSecret, "custom-refresh-secret");
	assert.equal(config.accessTokenExpiresIn, "30m");
	assert.equal(config.refreshTokenExpiresIn, "14d");
	assert.equal(config.refreshTokenExpiresInDays, 14);
});

test("production config requires frontend url", () => {
	assert.throws(() => {
		buildRuntimeConfig({
			NODE_ENV: "production",
			PORT: "3000",
			JWT_SECRET: "prod-secret",
			FRONTEND_URL: "",
		});
	});
});
