import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { PrismaClient } from "../generated/prisma/client.js";
import { app } from "../server.js";

const prisma = new PrismaClient();

test("Notes pagination endpoints", async (t) => {
	const server = app.listen(0);
	const port = (server.address() as AddressInfo).port;
	const baseUrl = `http://127.0.0.1:${port}`;
	const uniqueSuffix = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
	let userId: number | undefined;
	let accessToken = "";

	t.after(async () => {
		if (userId !== undefined) {
			await prisma.user.delete({ where: { id: userId } });
		}
		await prisma.$disconnect();
		await new Promise<void>((resolve) => server.close(() => resolve()));
	});

	const registration = await fetch(`${baseUrl}/auth/register`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			email: `pagination_test_${uniqueSuffix}@example.com`,
			password: "securePassword123!",
		}),
	});
	assert.equal(registration.status, 201);
	accessToken = ((await registration.json()) as { accessToken: string }).accessToken;

	const me = await fetch(`${baseUrl}/me`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	assert.equal(me.status, 200);
	userId = ((await me.json()) as { user: { id: number } }).user.id;

	await prisma.note.createMany({
		data: Array.from({ length: 11 }, (_, index) => ({
			title: `Pagination test note ${index + 1}`,
			content: "Cursor and offset pagination test data.",
			category: "testing",
			userId: userId as number,
			createdAt: new Date(
				`2026-11-${String(11 - index).padStart(2, "0")}T00:00:00.000Z`,
			),
		})),
	});

	const authHeaders = { Authorization: `Bearer ${accessToken}` };

	await t.test("keeps the legacy bare list response", async () => {
		const response = await fetch(`${baseUrl}/notes`, { headers: authHeaders });
		assert.equal(response.status, 200);
		assert.ok(Array.isArray(await response.json()));
	});

	await t.test("returns offset first page, last page, and empty out-of-range page", async () => {
		const firstPageResponse = await fetch(`${baseUrl}/notes?page=1&limit=10`, {
			headers: authHeaders,
		});
		assert.equal(firstPageResponse.status, 200);
		const firstPage = (await firstPageResponse.json()) as {
			items: Array<{ id: number }>;
			total: number;
			page: number;
			limit: number;
			totalPages: number;
		};
		assert.equal(firstPage.items.length, 10);
		assert.deepEqual(
			{ total: firstPage.total, page: firstPage.page, limit: firstPage.limit, totalPages: firstPage.totalPages },
			{ total: 11, page: 1, limit: 10, totalPages: 2 },
		);

		const lastPageResponse = await fetch(`${baseUrl}/notes?page=2&limit=10`, {
			headers: authHeaders,
		});
		const lastPage = (await lastPageResponse.json()) as { items: unknown[] };
		assert.equal(lastPageResponse.status, 200);
		assert.equal(lastPage.items.length, 1);

		const outOfRangeResponse = await fetch(`${baseUrl}/notes?page=3&limit=10`, {
			headers: authHeaders,
		});
		const outOfRange = (await outOfRangeResponse.json()) as { items: unknown[] };
		assert.equal(outOfRangeResponse.status, 200);
		assert.deepEqual(outOfRange.items, []);
	});

	await t.test("returns cursor pages and rejects invalid input", async () => {
		const firstPageResponse = await fetch(`${baseUrl}/notes/feed?limit=10`, {
			headers: authHeaders,
		});
		assert.equal(firstPageResponse.status, 200);
		const firstPage = (await firstPageResponse.json()) as {
			items: unknown[];
			nextCursor: string | null;
		};
		assert.equal(firstPage.items.length, 10);
		assert.equal(typeof firstPage.nextCursor, "string");

		const lastPageResponse = await fetch(
			`${baseUrl}/notes/feed?limit=10&cursor=${encodeURIComponent(firstPage.nextCursor as string)}`,
			{ headers: authHeaders },
		);
		assert.equal(lastPageResponse.status, 200);
		assert.deepEqual(await lastPageResponse.json(), {
			items: (await prisma.note.findMany({
				where: { userId },
				orderBy: [{ createdAt: "asc" }, { id: "asc" }],
				take: 1,
			})).map((note) => ({
				...note,
				createdAt: note.createdAt.toJSON(),
				updatedAt: note.updatedAt.toJSON(),
			})),
			nextCursor: null,
		});

		for (const path of ["/notes?page=", "/notes?limit=51", "/notes/feed?cursor=not-a-cursor"]) {
			const response = await fetch(`${baseUrl}${path}`, { headers: authHeaders });
			assert.equal(response.status, 400);
			assert.equal(typeof ((await response.json()) as { error: unknown }).error, "string");
		}
	});
});
