import { NextRequest, NextResponse } from 'next/server'
import { createTechnology, getAllTechnologies } from '@/lib/dal/technologyDal'
import logger from '@/utils/logger'
import {isCurrentUserAdmin} from "@/lib/dal/currentSessionDal";

export const GET = async (): Promise<NextResponse> => {
  try {
    const items = await getAllTechnologies()
    return NextResponse.json(items)
  } catch (e) {
    logger.error(e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export const POST = async (request: NextRequest): Promise<NextResponse> => {

    const isAdmin = await isCurrentUserAdmin()
    if (!isAdmin) {
        return new NextResponse('Forbidden', {
            headers: { 'Content-Type': 'text/plain' },
            status: 403,
        })
    }

    try {
        const body = await request.json()
        const { name, description, icon } = body || {}

        if (!name || !description) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const created = await createTechnology(name, description, icon)
        return NextResponse.json(created, { status: 201 })
  } catch (e) {
        logger.error(e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}