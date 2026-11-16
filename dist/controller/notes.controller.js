import { PrismaClient } from "../generated/prisma/client.js";
import { PaginationValidationError, buildCursorPaginationResponse, buildOffsetPaginationResponse, decodeNoteCursor, parseFeedLimit, parseOffsetPagination, } from "./notes.pagination.js";
const prisma = new PrismaClient();
export async function createNote(req, res) {
    const { title, category, content } = req.body;
    const userId = req.userId;
    if (userId === undefined) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (!title || !category) {
        return res.status(400).json({ error: "Title and category are required" });
    }
    const note = await prisma.note.create({
        data: {
            title,
            category,
            content: content || "",
            userId,
        },
    });
    res.status(201).json(note);
}
export async function getNotes(req, res) {
    const { category, search, sort, id, page, limit } = req.query;
    const userId = req.userId;
    if (userId === undefined) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (id !== undefined) {
        const noteId = Number(id);
        if (Number.isNaN(noteId)) {
            return res.status(400).json({ error: "Invalid note id" });
        }
        const note = await prisma.note.findFirst({
            where: { id: noteId, userId },
        });
        if (!note) {
            return res.status(404).json({ error: "Note not found" });
        }
        return res.status(200).json(note);
    }
    const where = { userId };
    if (category && category !== "all") {
        where.category = category;
    }
    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
        ];
    }
    let orderBy = { createdAt: "desc" };
    if (sort === "oldest")
        orderBy = { createdAt: "asc" };
    if (sort === "az")
        orderBy = { title: "asc" };
    if (sort === "za")
        orderBy = { title: "desc" };
    let pagination;
    try {
        pagination = parseOffsetPagination(page, limit);
    }
    catch (error) {
        if (error instanceof PaginationValidationError) {
            return res.status(400).json({ error: error.message });
        }
        throw error;
    }
    if (pagination !== undefined) {
        const [items, total] = await prisma.$transaction([
            prisma.note.findMany({
                where,
                orderBy: [{ createdAt: "desc" }, { id: "desc" }],
                skip: pagination.skip,
                take: pagination.limit,
            }),
            prisma.note.count({ where }),
        ]);
        return res.status(200).json(buildOffsetPaginationResponse(items, total, pagination.page, pagination.limit));
    }
    const notes = await prisma.note.findMany({ where, orderBy });
    res.status(200).json(notes);
}
export async function getNotesFeed(req, res) {
    const userId = req.userId;
    if (userId === undefined) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    let limit;
    let cursor;
    try {
        limit = parseFeedLimit(req.query.limit);
        cursor = decodeNoteCursor(req.query.cursor);
    }
    catch (error) {
        if (error instanceof PaginationValidationError) {
            return res.status(400).json({ error: error.message });
        }
        throw error;
    }
    const notes = await prisma.note.findMany({
        where: {
            userId,
            ...(cursor === undefined
                ? {}
                : {
                    OR: [
                        { createdAt: { lt: cursor.createdAt } },
                        { createdAt: cursor.createdAt, id: { lt: cursor.id } },
                    ],
                }),
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit + 1,
    });
    res.status(200).json(buildCursorPaginationResponse(notes, limit));
}
export async function getNoteById(req, res) {
    const id = Number(req.params.id);
    const userId = req.userId;
    if (userId === undefined) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const note = await prisma.note.findFirst({
        where: { id, userId },
    });
    if (!note) {
        return res.status(404).json({ error: "Note not found" });
    }
    res.status(200).json(note);
}
export async function updateNote(req, res) {
    const idFromParams = Number(req.params.id);
    const idFromQuery = Number(req.query.id);
    const id = Number.isNaN(idFromParams) ? idFromQuery : idFromParams;
    const userId = req.userId;
    const { title, content, category } = req.body;
    if (userId === undefined) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (Number.isNaN(id)) {
        return res.status(400).json({ error: "Invalid note id" });
    }
    const existingNote = await prisma.note.findFirst({
        where: { id, userId },
    });
    if (!existingNote) {
        return res.status(404).json({ error: "Note not found" });
    }
    const updatedNote = await prisma.note.update({
        where: { id },
        data: { title, content, category },
    });
    res.status(200).json(updatedNote);
}
export async function deleteNote(req, res) {
    const idFromParams = Number(req.params.id);
    const idFromQuery = Number(req.query.id);
    const id = Number.isNaN(idFromParams) ? idFromQuery : idFromParams;
    const userId = req.userId;
    if (userId === undefined) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (Number.isNaN(id)) {
        return res.status(400).json({ error: "Invalid note id" });
    }
    const existingNote = await prisma.note.findFirst({
        where: { id, userId },
    });
    if (!existingNote) {
        return res.status(404).json({ error: "Note not found" });
    }
    await prisma.note.delete({ where: { id } });
    res.status(200).json({ success: true });
}
export async function togglePin(req, res) {
    const id = Number(req.params.id);
    const userId = req.userId;
    if (userId === undefined) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const existingNote = await prisma.note.findFirst({
        where: { id, userId },
    });
    if (!existingNote) {
        return res.status(404).json({ error: "Note not found" });
    }
    if (!existingNote.isPin) {
        const pinnedCount = await prisma.note.count({
            where: { userId, isPin: true },
        });
        if (pinnedCount >= 3) {
            return res.status(409).json({ error: "You can only pin up to 3 notes" });
        }
    }
    const updatedNote = await prisma.note.update({
        where: { id },
        data: { isPin: !existingNote.isPin },
    });
    res.status(200).json(updatedNote);
}
//# sourceMappingURL=notes.controller.js.map