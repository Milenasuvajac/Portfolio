import { NextResponse } from 'next/server'
import { deleteTechnology, getTechnologyById, updateTechnology } from '@/lib/dal/technologyDal'
import logger from '@/utils/logger'
import {isCurrentUserAdmin} from "@/lib/dal/currentSessionDal";

// Ensure Node.js runtime for Prisma
export const runtime = 'nodejs'

const isNumericId = (id: string) => /^-?\d+$/.test(id)

export const GET = async (
  _req: Request,
  context: unknown
) => {
  const { params } = context as { params: { id: string } };
    const { id } = params
    if (!isNumericId(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    try {
        const item = await getTechnologyById(id)
        if (!item) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
        return NextResponse.json(item)
    } catch (e) {
        logger.error(e)
        const message = e instanceof Error ? e.message : 'Internal Server Error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}

export const PUT = async (
  req: Request,
  context: unknown
) => {
  const { params } = context as { params: { id: string } };
    const isAdmin = await isCurrentUserAdmin()
    if (!isAdmin) {
        return new NextResponse('Forbidden', {
            headers: { 'Content-Type': 'text/plain' },
            status: 403,
        })
    }
  const { id } = params
  if (!isNumericId(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  try {
    const body = await req.json()
    const { icon, name, description } = body || {}

  const data: Record<string, unknown> = {}
    if (icon !== undefined) data.icon = icon
    if (name !== undefined) data.name = name
    if (description !== undefined) data.description = description

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const updated = await updateTechnology(id, data)
    return NextResponse.json(updated)
  } catch (e) {
    logger.error(e)
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export const DELETE = async (
  _req: Request,
  context: unknown
) => {
  const { params } = context as { params: { id: string } };
    const isAdmin = await isCurrentUserAdmin()
    if (!isAdmin) {
        return new NextResponse('Forbidden', {
            headers: { 'Content-Type': 'text/plain' },
            status: 403,
        })
    }

    const { id } = params
    if (!isNumericId(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    try {
        const deleted = await deleteTechnology(id)
        return NextResponse.json(deleted)
    } catch (e) {
        logger.error(e)
        const message = e instanceof Error ? e.message : 'Internal Server Error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}