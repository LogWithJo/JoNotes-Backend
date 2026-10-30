import type { Request, Response } from "express";
export declare function getCookieOptions(): {
    readonly httpOnly: true;
    readonly secure: boolean;
    readonly sameSite: "none" | "lax";
    readonly path: "/";
    readonly maxAge: number;
};
export declare function issueTokenAndRespond(res: Response, user: {
    id: number;
    email: string;
    name?: string | null;
    avatar?: string | null;
}, statusCode: number): Response<any, Record<string, any>>;
export declare function continueAuth(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function register(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function login(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function logout(_req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.controller.d.ts.map