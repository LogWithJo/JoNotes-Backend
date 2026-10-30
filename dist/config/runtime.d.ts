export type RuntimeEnv = Record<string, string | undefined>;
export interface RuntimeConfig {
    nodeEnv: "development" | "production" | "test";
    port: number;
    frontendUrl: string;
    allowedOrigins: string[];
    jwtSecret: string;
}
export declare function parseAllowedOrigins(input?: string): string[];
export declare function buildRuntimeConfig(env?: RuntimeEnv): RuntimeConfig;
export declare const runtimeConfig: RuntimeConfig;
export declare function getPrimaryFrontendUrl(): string;
//# sourceMappingURL=runtime.d.ts.map