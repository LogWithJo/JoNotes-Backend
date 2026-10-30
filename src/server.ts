import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { runtimeConfig } from "./config/runtime.js";
import { getMe, refresh, revokeToken } from "./controller/auth.controller.js";
import { requireAuth } from "./middleware/requireAuth.js";
import authRoutes from "./routes/auth.routes.js";
import notesRoutes from "./routes/notes.routes.js";

const app = express();

app.set("trust proxy", 1);

app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin) {
				return callback(null, true);
			}

			if (runtimeConfig.allowedOrigins.includes(origin)) {
				return callback(null, true);
			}

			return callback(new Error("Not allowed by CORS"));
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	}),
);

app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);
app.use("/notes", notesRoutes);

// Top-level aliases for /me, /refresh-token, and /revoke-token
app.get("/me", requireAuth, getMe);
app.post("/refresh-token", refresh);
app.post("/revoke-token", revokeToken);

app.get("/", (_req, res) => {
	res.status(200).json({ message: "Server is alive!" });
});

app.get("/health", (_req, res) => {
	res.status(200).json({ ok: true, environment: runtimeConfig.nodeEnv });
});

export function startServer() {
	return app.listen(runtimeConfig.port, "0.0.0.0", () => {
		console.log(`Server running on port ${runtimeConfig.port}`);
	});
}

export { app };

const isDirectRun =
	process.argv[1] !== undefined &&
	fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
	startServer();
}

export default app;
