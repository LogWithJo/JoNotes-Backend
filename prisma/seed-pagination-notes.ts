import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient();
const rawUserId = process.env.SEED_USER_ID;

if (rawUserId === undefined || !/^[1-9]\d*$/.test(rawUserId)) {
	throw new Error("SEED_USER_ID must be a positive integer");
}

const userId = Number(rawUserId);
if (!Number.isSafeInteger(userId)) {
	throw new Error("SEED_USER_ID must be a safe integer");
}

const user = await prisma.user.findUnique({ where: { id: userId } });
if (user === null) {
	throw new Error(`User ${userId} does not exist`);
}

await prisma.note.createMany({
	data: Array.from({ length: 200 }, (_, index) => ({
		title: `Pagination seed note ${index + 1}`,
		content: `Generated solely by the pagination seed script (item ${index + 1}).`,
		category: "pagination-seed",
		userId,
	})),
});

await prisma.$disconnect();
console.log(`Created 200 pagination seed notes for user ${userId}.`);
