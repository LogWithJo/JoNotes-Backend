import "dotenv/config";
import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import notesRoutes from "./routes/notes.routes.js";

const app = express();
const PORT = 3000;

app.use(
	cors({
		origin: "http://localhost:1999", // your frontend's URL during development
	}),
);

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/notes", notesRoutes);

app.get("/", (req, res) => {
	res.status(200).json({ message: "Server is alive!" });
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
