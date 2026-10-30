import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { fileURLToPath } from "node:url";
import { runtimeConfig } from "./config/runtime.js";
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
