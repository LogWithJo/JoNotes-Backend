import type { NextFunction, Request, Response } from "express";
export interface AuthRequest extends Request {
    userId?: number;
}
export declare function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=requireAuth.d.ts.map