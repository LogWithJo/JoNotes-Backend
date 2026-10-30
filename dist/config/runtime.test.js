import assert from "node:assert/strict";
import test from "node:test";
import { buildRuntimeConfig, parseAllowedOrigins } from "./runtime.js";
test("parseAllowedOrigins trims and ignores blanks", () => {
    assert.deepEqual(parseAllowedOrigins(" https://a.example.com , , http://localhost:3000 "), ["https://a.example.com", "http://localhost:3000"]);
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
//# sourceMappingURL=runtime.test.js.map