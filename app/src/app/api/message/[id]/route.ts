import { NextRequest, NextResponse } from 'next/server'
import { Params } from '@/dto/RequestDTO'
import { deleteMessage, getMessageById, updateMessage } from '@/lib/dal/messageDal'
import logger from '@/utils/logger'

const isNumericId = (id: string) => /^-?\d+$/.test(id)

export const GET = async (_req: NextRequest, { params }: { params: Params }) => {
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

export const PUT = async (req: NextRequest, { params }: { params: Params }) => {
  const { id } = params
  if (!isNumericId(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
  try {
    const body = await req.json()
    const { name, company, message, contact, content } = body || {}
    const finalContact = contact ?? content

    const data: any = {}
    if (name !== undefined) data.name = name
    if (company !== undefined) data.company = company
    if (message !== undefined) data.message = message
    if (finalContact !== undefined) data.contact = finalContact

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const updated = await updateMessage(id, data)
    return NextResponse.json(updated)
  } catch (e) {
    logger.error(e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export const DELETE = async (_req: NextRequest, { params }: { params: Params }) => {
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