import { NextRequest, NextResponse } from 'next/server'
import { Params } from '@/dto/RequestDTO'
import { deleteTechnology, getTechnologyById, updateTechnology } from '@/lib/dal/technologyDal'
import logger from '@/utils/logger'
import {isCurrentUserAdmin} from "@/lib/dal/currentSessionDal";

const isNumericId = (id: string) => /^-?\d+$/.test(id)

export const GET = async (_req: NextRequest, { params }: { params: Params }) => {
    const { id } = params
    if (!isNumericId(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    try {
        const item = await getTechnologyById(id)
        if (!item) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
        return NextResponse.json(item)
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export const PUT = async (req: NextRequest, { params }: { params: Params }) => {
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

    const data: any = {}
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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export const DELETE = async (_req: NextRequest, { params }: { params: Params }) => {
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
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}