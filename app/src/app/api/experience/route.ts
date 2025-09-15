import { NextRequest, NextResponse } from 'next/server'
import { createExperience, getAllExperiences } from '@/lib/dal/experienceDal'
import logger from '@/utils/logger'

export const GET = async (): Promise<NextResponse> => {
  try {
    const items = await getAllExperiences()
    return NextResponse.json(items)
  } catch (e) {
    logger.error(e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const body = await request.json()
    const { description, myResp, company } = body || {}
    if (!description || !myResp || !company) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const created = await createExperience(description, myResp, company)
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    logger.error(e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}