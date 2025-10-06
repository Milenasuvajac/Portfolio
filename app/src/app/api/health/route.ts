import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import {isCurrentUserAdmin} from "@/lib/dal/currentSessionDal";

// Force Node runtime for Prisma
export const runtime = 'nodejs'

export const GET = async (request: Request): Promise<NextResponse> => {

    const isAdmin = await isCurrentUserAdmin()
    if (!isAdmin) {
        return new NextResponse('Forbidden', {
            headers: { 'Content-Type': 'text/plain' },
            status: 403,
        })
    }

  try {
    // Minimal query to verify DB connectivity
    const result = await prisma.$queryRaw<any[]>`SELECT version()`

    // Optional deep diagnostics: list public tables
    const url = new URL(request.url)
    const deep = url.searchParams.get('deep')
    let tables: string[] | undefined
    if (deep) {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name`
      tables = Array.isArray(rows) ? rows.map(r => r.table_name) : undefined
    }

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
      tables,
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