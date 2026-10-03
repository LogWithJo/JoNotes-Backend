import { PrismaClient } from "../../generated/prisma/client.js";
const prisma = new PrismaClient();
export async function findOrCreateUserFromOAuth(profile) {
    const existingAccount = await prisma.account.findUnique({
        where: {
            provider_providerAccountId: {
                provider: profile.provider,
                providerAccountId: profile.providerAccountId,
            },
        },
        include: { user: true },
    });
    if (existingAccount) {
        return existingAccount.user;
    }
    if (profile.emailVerified) {
        const existingUser = await prisma.user.findUnique({
            where: { email: profile.email },
        });
        if (existingUser) {
            await prisma.account.create({
                data: {
                    provider: profile.provider,
                    providerAccountId: profile.providerAccountId,
                    userId: existingUser.id,
                },
            });
            return existingUser;
        }
    }
    const createdUser = await prisma.user.create({
        data: {
            email: profile.email,
            name: profile.name ?? null,
            avatar: profile.avatar ?? null,
        },
    });
    await prisma.account.create({
        data: {
            provider: profile.provider,
            providerAccountId: profile.providerAccountId,
            userId: createdUser.id,
        },
    });
    return createdUser;
}
//# sourceMappingURL=account-linking.js.map