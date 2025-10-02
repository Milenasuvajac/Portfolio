import { PrismaClient } from '@prisma/client'

// Ensure a single Prisma client instance across hot-reloads and serverless invocations
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// In non-production, preserve the client across module reloads
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma