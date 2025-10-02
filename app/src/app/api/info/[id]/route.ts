import { NextResponse } from 'next/server'
import { deleteInfo, getInfoById, updateInfo } from '@/lib/dal/infoDal'
import logger from '@/utils/logger'
import {isCurrentUserAdmin} from "@/lib/dal/currentSessionDal";

const isNumericId = (id: string) => /^-?\d+$/.test(id)

export const GET = async (
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
    const item = await getInfoById(id)
    if (!item) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    return NextResponse.json(item)
    } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
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
    const { photo, text, visibility, contact, cv } = body || {}

  const data: Record<string, unknown> = {}
    if (photo !== undefined) data.photo = photo
    if (text !== undefined) data.text = text
    if (visibility !== undefined) data.visibility = Boolean(visibility)
    if (contact !== undefined) data.contact = contact
    if (cv !== undefined) data.cv = cv

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const updated = await updateInfo(id, data)
    return NextResponse.json(updated)
    } catch (e) {
        logger.error(e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
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
        const deleted = await deleteInfo(id)
        return NextResponse.json(deleted)
    } catch (e) {
        logger.error(e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}