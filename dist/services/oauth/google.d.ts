interface GoogleTokenResponse {
    access_token: string;
    id_token: string;
    expires_in: number;
    token_type: string;
}
interface GoogleProfile {
    sub: string;
    email: string;
    email_verified: boolean;
    name: string;
    picture: string;
}
export declare function exchangeGoogleCode(code: string): Promise<GoogleTokenResponse>;
export declare function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile>;
export {};
//# sourceMappingURL=google.d.ts.map