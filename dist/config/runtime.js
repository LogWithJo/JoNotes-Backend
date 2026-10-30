export function parseAllowedOrigins(input) {
    const values = (input ?? "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
    if (values.length > 0) {
        return values;
    }
    return [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ];
}
export function buildRuntimeConfig(env = process.env) {
    const nodeEnv = (env.NODE_ENV ?? "development");
    const port = Number.parseInt(env.PORT ?? "3000", 10);
    const frontendUrl = (env.FRONTEND_URL ?? "").trim();
    const allowedOrigins = parseAllowedOrigins(frontendUrl);
    if (nodeEnv === "production" && !frontendUrl) {
        throw new Error("FRONTEND_URL is required in production");
    }
    const jwtSecret = env.JWT_SECRET?.trim();
    if (nodeEnv === "production" && !jwtSecret) {
        throw new Error("JWT_SECRET is required in production");
    }
    return {
        nodeEnv,
        port: Number.isFinite(port) ? port : 3000,
        frontendUrl,
        allowedOrigins,
        jwtSecret: jwtSecret ?? "development-jwt-secret-change-me",
    };
}
export const runtimeConfig = buildRuntimeConfig();
export function getPrimaryFrontendUrl() {
    if (runtimeConfig.frontendUrl) {
        return runtimeConfig.frontendUrl.split(",")[0]?.trim() ?? runtimeConfig.frontendUrl;
    }
    return runtimeConfig.allowedOrigins[0] ?? "http://localhost:3000";
}
//# sourceMappingURL=runtime.js.map