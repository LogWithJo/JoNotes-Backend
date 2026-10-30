import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/requireAuth.js";
export declare function parseDurationToSeconds(duration: string, defaultSeconds?: number): number;
export declare function getAccessTokenCookieOptions(): {
    readonly httpOnly: true;
    readonly secure: boolean;
    readonly sameSite: "none" | "lax";
    readonly path: "/";
    readonly maxAge: number;
};
export declare function getRefreshTokenCookieOptions(): {
    readonly httpOnly: true;
    readonly secure: boolean;
    readonly sameSite: "none" | "lax";
    readonly path: "/";
    readonly maxAge: number;
};
export declare function getCookieOptions(): {
    readonly httpOnly: true;
    readonly secure: boolean;
    readonly sameSite: "none" | "lax";
    readonly path: "/";
    readonly maxAge: number;
};
export declare function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void;
export declare function clearAuthCookies(res: Response): void;
export declare function clearAuthCookie(res: Response): void;
export declare function generateAccessToken(userId: number): string;
export declare function generateRefreshToken(userId: number): string;
export declare function saveRefreshToken(userId: number, token: string): Promise<{
    token: string;
    id: number;
    createdAt: Date;
    userId: number;
    revoked: boolean;
    expiresAt: Date;
    updatedAt: Date;
}>;
export declare function issueTokens(res: Response, userId: number): Promise<{
    token: string;
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
}>;
export declare function issueTokenAndRespond(res: Response, user: {
    id: number;
    email: string;
}, statusCode: number): Promise<Response<any, Record<string, any>>>;
export declare function continueAuth(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function register(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function login(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getMe(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function refresh(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function revokeToken(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function logout(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.controller.d.ts.map