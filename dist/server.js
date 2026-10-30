import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import notesRoutes from "./routes/notes.routes.js";
const app = express();
const PORT = Number(process.env.PORT || 3000);
const NODE_ENV = process.env.NODE_ENV || "development";
const FRONTEND_URL = process.env.FRONTEND_URL;
if (NODE_ENV === "production" && !FRONTEND_URL) {
    throw new Error("FRONTEND_URL is required in production");
}
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
}
const allowedOrigins = FRONTEND_URL
    ? FRONTEND_URL.split(",").map((origin) => origin.trim())
    : [];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);
app.use("/notes", notesRoutes);
app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is alive!" });
});
app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map