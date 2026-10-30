import type { Request, Response } from "express";
export declare function redirectToGoogle(_req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
export declare function handleGoogleCallback(req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
export declare function redirectToGitHub(_req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
export declare function handleGitHubCallback(req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=oauth.controller.d.ts.map