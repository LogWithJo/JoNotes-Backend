import type { Response } from "express";
import type { AuthRequest } from "../middleware/requireAuth.js";
export declare function createNote(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getNotes(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getNoteById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateNote(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteNote(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function togglePin(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=notes.controller.d.ts.map