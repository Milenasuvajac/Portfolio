import { NextRequest, NextResponse } from 'next/server'
import { createTechnology, getAllTechnologies } from '@/lib/dal/technologyDal'
import logger from '@/utils/logger'
import {isCurrentUserAdmin} from "@/lib/dal/currentSessionDal";

// Ensure Node.js runtime for Prisma
export const runtime = 'nodejs'

export const GET = async (): Promise<NextResponse> => {
  try {
    const items = await getAllTechnologies()
    
    // Add debugging for production
    logger.log(`Technology API: Found ${items?.length || 0} items`)
    if (process.env.NODE_ENV !== 'production') {
      console.log('Technology items:', items)
    }
    
    return NextResponse.json(items)
  } catch (e) {
    logger.error('Technology API Error:', e)
    const message = e instanceof Error ? e.message : 'Internal Server Error'
    // Surface minimal error message for diagnosis without leaking sensitive data
    return NextResponse.json({ error: message }, { status: 500 })
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