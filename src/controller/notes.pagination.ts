export const DEFAULT_NOTE_PAGE_LIMIT = 10;
export const MAX_NOTE_PAGE_LIMIT = 50;

export class PaginationValidationError extends Error {}

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

function getSingleQueryValue(value: unknown, name: string): string | undefined {
	if (value === undefined) {
		return undefined;
	}

	if (typeof value !== "string") {
		throw new PaginationValidationError(`Invalid ${name}`);
	}

	return value;
}

function parsePositiveInteger(
	value: string | undefined,
	defaultValue: number,
	max: number | undefined,
	name: string,
): number {
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

export function parseOffsetPagination(
	pageValue: unknown,
	limitValue: unknown,
): OffsetPagination | undefined {
	const page = getSingleQueryValue(pageValue, "page");
	const limit = getSingleQueryValue(limitValue, "limit");

	if (page === undefined && limit === undefined) {
		return undefined;
	}

	const parsedPage = parsePositiveInteger(page, 1, undefined, "page");
	const parsedLimit = parsePositiveInteger(
		limit,
		DEFAULT_NOTE_PAGE_LIMIT,
		MAX_NOTE_PAGE_LIMIT,
		"limit",
	);

	return {
		page: parsedPage,
		limit: parsedLimit,
		skip: (parsedPage - 1) * parsedLimit,
	};
}

export function parseFeedLimit(limitValue: unknown): number {
	return parsePositiveInteger(
		getSingleQueryValue(limitValue, "limit"),
		DEFAULT_NOTE_PAGE_LIMIT,
		MAX_NOTE_PAGE_LIMIT,
		"limit",
	);
}

export function encodeNoteCursor(cursor: NoteCursor): string {
	return Buffer.from(
		JSON.stringify({ createdAt: cursor.createdAt.toISOString(), id: cursor.id }),
	).toString("base64url");
}

export function decodeNoteCursor(value: unknown): NoteCursor | undefined {
	const cursor = getSingleQueryValue(value, "cursor");
	if (cursor === undefined) {
		return undefined;
	}

	try {
		const decoded = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
		if (
			typeof decoded !== "object" ||
			decoded === null ||
			typeof decoded.createdAt !== "string" ||
			typeof decoded.id !== "number" ||
			!Number.isSafeInteger(decoded.id) ||
			decoded.id < 1
		) {
			throw new Error("Invalid cursor");
		}

		const createdAt = new Date(decoded.createdAt);
		if (Number.isNaN(createdAt.getTime()) || createdAt.toISOString() !== decoded.createdAt) {
			throw new Error("Invalid cursor");
		}

		return { createdAt, id: decoded.id };
	} catch {
		throw new PaginationValidationError("Invalid cursor");
	}
}

export function buildOffsetPaginationResponse<T>(
	items: T[],
	total: number,
	page: number,
	limit: number,
) {
	return {
		items,
		total,
		page,
		limit,
		totalPages: Math.ceil(total / limit),
	};
}

export function buildCursorPaginationResponse<T extends CursorPageItem>(
	rows: T[],
	limit: number,
) {
	const hasNextPage = rows.length > limit;
	const items = hasNextPage ? rows.slice(0, limit) : rows;
	const lastItem = items.at(-1);

	return {
		items,
		nextCursor:
			hasNextPage && lastItem !== undefined
				? encodeNoteCursor(lastItem)
				: null,
	};
}
