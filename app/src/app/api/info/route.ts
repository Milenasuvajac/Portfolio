import { NextRequest, NextResponse } from 'next/server'
import { createInfo, getAllInfos } from '@/lib/dal/infoDal'
import logger from '@/utils/logger'

export const GET = async (): Promise<NextResponse> => {
  try {
    const items = await getAllInfos()
    return NextResponse.json(items)
  } catch (e) {
    logger.error(e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const body = await request.json()
    const { text, visibility, contact, cv, photo } = body || {}

    if (text === undefined || visibility === undefined || contact === undefined || cv === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const created = await createInfo(text, Boolean(visibility), contact, cv, photo)
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    logger.error(e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}