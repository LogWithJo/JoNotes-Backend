interface OAuthProfile {
    provider: "google" | "github";
    providerAccountId: string;
    email: string;
    emailVerified: boolean;
    name?: string;
    avatar?: string;
}
export declare function findOrCreateUserFromOAuth(profile: OAuthProfile): Promise<{
    email: string;
    password: string | null;
    id: number;
    name: string | null;
    avatar: string | null;
    createdAt: Date;
}>;
export {};
//# sourceMappingURL=account-linking.d.ts.map