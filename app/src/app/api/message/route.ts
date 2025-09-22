import { NextRequest, NextResponse } from 'next/server'
import { createMessage, getAllMessages } from '@/lib/dal/messageDal'
import logger from '@/utils/logger'

export const GET = async (): Promise<NextResponse> => {
  try {
    const items = await getAllMessages()
    return NextResponse.json(items)
  } catch (e) {
    logger.error(e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const body = await request.json()
    const { name, company, message, contact, isPrivate } = body || {}

    if (!name || !message || !contact ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // For private messages, company is optional
    const finalCompany = company || (isPrivate ? 'Private Message' : '')

    const created = await createMessage(name, finalCompany, message, contact)
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    logger.error(e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}