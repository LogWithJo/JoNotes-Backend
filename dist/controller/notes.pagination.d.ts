export declare const DEFAULT_NOTE_PAGE_LIMIT = 10;
export declare const MAX_NOTE_PAGE_LIMIT = 50;
export declare class PaginationValidationError extends Error {
}
export interface OffsetPagination {
    page: number;
    limit: number;
    skip: number;
}
export interface NoteCursor {
    createdAt: Date;
    id: number;
}
export interface CursorPageItem {
    createdAt: Date;
    id: number;
}
export declare function parseOffsetPagination(pageValue: unknown, limitValue: unknown): OffsetPagination | undefined;
export declare function parseFeedLimit(limitValue: unknown): number;
export declare function encodeNoteCursor(cursor: NoteCursor): string;
export declare function decodeNoteCursor(value: unknown): NoteCursor | undefined;
export declare function buildOffsetPaginationResponse<T>(items: T[], total: number, page: number, limit: number): {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};
export declare function buildCursorPaginationResponse<T extends CursorPageItem>(rows: T[], limit: number): {
    items: T[];
    nextCursor: string | null;
};
//# sourceMappingURL=notes.pagination.d.ts.map