export type RuntimeEnv = Record<string, string | undefined>;

export interface RuntimeConfig {
	nodeEnv: "development" | "production" | "test";
	port: number;
	frontendUrl: string;
	allowedOrigins: string[];
	jwtSecret: string;
	jwtRefreshSecret: string;
	accessTokenExpiresIn: string;
	refreshTokenExpiresIn: string;
	refreshTokenExpiresInDays: number;
}

export function parseAllowedOrigins(input?: string): string[] {
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

export function buildRuntimeConfig(
	env: RuntimeEnv = process.env,
): RuntimeConfig {
	const nodeEnv = (env.NODE_ENV ?? "development") as RuntimeConfig["nodeEnv"];
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

	const resolvedJwtSecret = jwtSecret ?? "development-jwt-secret-change-me";
	const jwtRefreshSecret =
		env.JWT_REFRESH_SECRET?.trim() || `${resolvedJwtSecret}_refresh`;
	const accessTokenExpiresIn = env.ACCESS_TOKEN_EXPIRES_IN?.trim() || "15m";
	const refreshTokenExpiresIn = env.REFRESH_TOKEN_EXPIRES_IN?.trim() || "7d";
	const parsedRefreshDays = Number.parseInt(
		env.REFRESH_TOKEN_EXPIRES_IN_DAYS ?? "7",
		10,
	);
	const refreshTokenExpiresInDays = Number.isFinite(parsedRefreshDays)
		? parsedRefreshDays
		: 7;

	return {
		nodeEnv,
		port: Number.isFinite(port) ? port : 3000,
		frontendUrl,
		allowedOrigins,
		jwtSecret: resolvedJwtSecret,
		jwtRefreshSecret,
		accessTokenExpiresIn,
		refreshTokenExpiresIn,
		refreshTokenExpiresInDays,
	};
}

export const runtimeConfig = buildRuntimeConfig();

export function getPrimaryFrontendUrl(): string {
	if (runtimeConfig.frontendUrl) {
		return (
			runtimeConfig.frontendUrl.split(",")[0]?.trim() ??
			runtimeConfig.frontendUrl
		);
	}

	return runtimeConfig.allowedOrigins[0] ?? "http://localhost:3000";
}
