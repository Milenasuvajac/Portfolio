import { NextResponse } from 'next/server'
import { deleteMessage, getMessageById } from '@/lib/dal/messageDal'
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
    if (!isNumericId(id)) return NextResponse.json({ error: 'Invalid ID', }, { status: 400 })
    try {
    const item = await getMessageById(id)
    if (!item) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    return NextResponse.json(item)
    } catch {
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
    if (!isNumericId(id)) return NextResponse.json({ error: 'Invalid ID.' }, { status: 400 })
    try {
    const deleted = await deleteMessage(id)
    return NextResponse.json(deleted)
    } catch (e) {
    logger.error(e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}