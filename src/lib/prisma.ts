import { PrismaClient } from "@prisma/client"

type PrismaGlobal = typeof globalThis & { prisma?: PrismaClient }

const globalForPrisma = globalThis as PrismaGlobal

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
