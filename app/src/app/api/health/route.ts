import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Force Node runtime for Prisma
export const runtime = 'nodejs'

export const GET = async (): Promise<NextResponse> => {
  try {
    // Minimal query to verify DB connectivity
    const result = await prisma.$queryRaw<any[]>`SELECT version()`

    // Redact DATABASE_URL but indicate if present
    const dbUrl = process.env.DATABASE_URL || ''
    const redactedDbUrl = dbUrl
      ? `${dbUrl.slice(0, 16)}...${dbUrl.slice(-8)}`
      : null

    return NextResponse.json({
      ok: true,
      databaseUrlPresent: !!dbUrl,
      databaseUrlRedacted: redactedDbUrl,
      neonVersion: Array.isArray(result) ? result[0]?.version ?? null : null,
    })
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      message: 'Database connectivity check failed',
      error: error?.message || String(error),
      code: error?.code || undefined,
    }, { status: 500 })
  }
}