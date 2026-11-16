import assert from "node:assert/strict";
import test from "node:test";
import {
	PaginationValidationError,
	buildCursorPaginationResponse,
	buildOffsetPaginationResponse,
	decodeNoteCursor,
	parseFeedLimit,
	parseOffsetPagination,
} from "./notes.pagination.js";

const notes = Array.from({ length: 11 }, (_, index) => ({
	id: 11 - index,
	createdAt: new Date(`2026-11-${String(11 - index).padStart(2, "0")}T00:00:00.000Z`),
}));

test("offset pagination returns the first page response shape", () => {
	const pagination = parseOffsetPagination("1", "10");
	assert.deepEqual(pagination, { page: 1, limit: 10, skip: 0 });

	assert.deepEqual(
		buildOffsetPaginationResponse(notes.slice(0, 10), 11, 1, 10),
		{ items: notes.slice(0, 10), total: 11, page: 1, limit: 10, totalPages: 2 },
	);
});

test("offset pagination returns the final page and empty out-of-range results", () => {
	assert.deepEqual(
		buildOffsetPaginationResponse(notes.slice(10), 11, 2, 10),
		{ items: notes.slice(10), total: 11, page: 2, limit: 10, totalPages: 2 },
	);
	assert.deepEqual(buildOffsetPaginationResponse([], 11, 3, 10), {
		items: [],
		total: 11,
		page: 3,
		limit: 10,
		totalPages: 2,
	});
});

test("cursor pagination returns a next cursor only when another page exists", () => {
	const firstPage = buildCursorPaginationResponse(notes, 10);
	assert.equal(firstPage.items.length, 10);
	assert.deepEqual(decodeNoteCursor(firstPage.nextCursor), {
		id: 2,
		createdAt: new Date("2026-11-02T00:00:00.000Z"),
	});

	assert.deepEqual(buildCursorPaginationResponse(notes.slice(10), 10), {
		items: notes.slice(10),
		nextCursor: null,
	});
	assert.deepEqual(buildCursorPaginationResponse([], 10), {
		items: [],
		nextCursor: null,
	});
});

test("pagination rejects malformed, empty, and oversized inputs", () => {
	for (const [page, limit] of [
		["", undefined],
		["0", undefined],
		["1.5", undefined],
		[undefined, ""],
		[undefined, "51"],
	]) {
		assert.throws(
			() => parseOffsetPagination(page, limit),
			PaginationValidationError,
		);
	}

	assert.throws(() => parseFeedLimit(""), PaginationValidationError);
	assert.throws(() => decodeNoteCursor("not-a-cursor"), PaginationValidationError);
});
