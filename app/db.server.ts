import { PrismaClient } from "@prisma/client";
const globalForDb = global as unknown as { prisma?: PrismaClient };
export const prisma = globalForDb.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForDb.prisma = prisma;
