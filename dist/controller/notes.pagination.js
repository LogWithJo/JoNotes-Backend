export const DEFAULT_NOTE_PAGE_LIMIT = 10;
export const MAX_NOTE_PAGE_LIMIT = 50;
export class PaginationValidationError extends Error {
}
function getSingleQueryValue(value, name) {
    if (value === undefined) {
        return undefined;
    }
    if (typeof value !== "string") {
        throw new PaginationValidationError(`Invalid ${name}`);
    }
    return value;
}
function parsePositiveInteger(value, defaultValue, max, name) {
    if (value === undefined) {
        return defaultValue;
    }
    if (!/^[1-9]\d*$/.test(value)) {
        throw new PaginationValidationError(`Invalid ${name}`);
    }
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || (max !== undefined && parsed > max)) {
        throw new PaginationValidationError(`Invalid ${name}`);
    }
    return parsed;
}
export function parseOffsetPagination(pageValue, limitValue) {
    const page = getSingleQueryValue(pageValue, "page");
    const limit = getSingleQueryValue(limitValue, "limit");
    if (page === undefined && limit === undefined) {
        return undefined;
    }
    const parsedPage = parsePositiveInteger(page, 1, undefined, "page");
    const parsedLimit = parsePositiveInteger(limit, DEFAULT_NOTE_PAGE_LIMIT, MAX_NOTE_PAGE_LIMIT, "limit");
    return {
        page: parsedPage,
        limit: parsedLimit,
        skip: (parsedPage - 1) * parsedLimit,
    };
}
export function parseFeedLimit(limitValue) {
    return parsePositiveInteger(getSingleQueryValue(limitValue, "limit"), DEFAULT_NOTE_PAGE_LIMIT, MAX_NOTE_PAGE_LIMIT, "limit");
}
export function encodeNoteCursor(cursor) {
    return Buffer.from(JSON.stringify({ createdAt: cursor.createdAt.toISOString(), id: cursor.id })).toString("base64url");
}
export function decodeNoteCursor(value) {
    const cursor = getSingleQueryValue(value, "cursor");
    if (cursor === undefined) {
        return undefined;
    }
    try {
        const decoded = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
        if (typeof decoded !== "object" ||
            decoded === null ||
            typeof decoded.createdAt !== "string" ||
            typeof decoded.id !== "number" ||
            !Number.isSafeInteger(decoded.id) ||
            decoded.id < 1) {
            throw new Error("Invalid cursor");
        }
        const createdAt = new Date(decoded.createdAt);
        if (Number.isNaN(createdAt.getTime()) || createdAt.toISOString() !== decoded.createdAt) {
            throw new Error("Invalid cursor");
        }
        return { createdAt, id: decoded.id };
    }
    catch {
        throw new PaginationValidationError("Invalid cursor");
    }
}
export function buildOffsetPaginationResponse(items, total, page, limit) {
    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}
export function buildCursorPaginationResponse(rows, limit) {
    const hasNextPage = rows.length > limit;
    const items = hasNextPage ? rows.slice(0, limit) : rows;
    const lastItem = items.at(-1);
    return {
        items,
        nextCursor: hasNextPage && lastItem !== undefined
            ? encodeNoteCursor(lastItem)
            : null,
    };
}
//# sourceMappingURL=notes.pagination.js.map