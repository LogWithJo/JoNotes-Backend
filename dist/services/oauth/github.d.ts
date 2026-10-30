interface GitHubTokenResponse {
    access_token: string;
    scope: string;
    token_type: string;
}
interface GitHubUser {
    id: number;
    login: string;
    name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
}
export declare function exchangeGitHubCode(code: string): Promise<GitHubTokenResponse>;
export declare function fetchGitHubUser(accessToken: string): Promise<GitHubUser>;
export {};
//# sourceMappingURL=github.d.ts.map