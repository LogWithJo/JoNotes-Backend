interface OAuthProfile {
    provider: "google" | "github";
    providerAccountId: string;
    email: string;
    emailVerified: boolean;
    name?: string;
    avatar?: string | null;
}
export declare function findOrCreateUserFromOAuth(profile: OAuthProfile): Promise<{
    id: number;
    email: string;
    password: string | null;
    name: string | null;
    avatar: string | null;
    createdAt: Date;
}>;
export {};
//# sourceMappingURL=account-linking.d.ts.map