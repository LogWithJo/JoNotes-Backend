import { Router } from "express";
import { createNote, deleteNote, getNoteById, getNotes, togglePin, updateNote, } from "../controller/notes.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
const router = Router();
router.get("/", requireAuth, getNotes);
router.post("/", requireAuth, createNote);
router.patch("/", requireAuth, updateNote);
router.delete("/", requireAuth, deleteNote);
router.get("/:id", requireAuth, getNoteById);
router.patch("/:id", requireAuth, updateNote);
router.delete("/:id", requireAuth, deleteNote);
router.patch("/:id/pin", requireAuth, togglePin);
export default router;
//# sourceMappingURL=notes.routes.js.map