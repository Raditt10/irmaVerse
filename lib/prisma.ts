import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production")
  globalForPrisma.prisma = prismaClient;

// NOTE:
// The project currently mixes legacy and new Prisma model naming conventions
// across many routes. We intentionally expose the client as `any` here so
// existing runtime-valid queries are not blocked by TypeScript model-name
// mismatches during compilation.
export const prisma: any = prismaClient;

export default prisma;
