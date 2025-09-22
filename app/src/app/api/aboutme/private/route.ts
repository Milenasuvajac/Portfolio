import { NextResponse } from 'next/server'
import { getAllInfos } from '@/lib/dal/infoDal'
import logger from '@/utils/logger'

export const GET = async (): Promise<NextResponse> => {
  try {
    const items = await getAllInfos()
    const privateItems = items.filter(item => !item.visibility)
    return NextResponse.json(privateItems)
  } catch (e) {
    logger.error(e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}