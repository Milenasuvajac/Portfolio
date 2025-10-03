import { NextRequest, NextResponse } from 'next/server'
import { createInfo, getAllInfos } from '@/lib/dal/infoDal'
import logger from '@/utils/logger'
import {isCurrentUserAdmin} from "@/lib/dal/currentSessionDal";

// Ensure Node.js runtime for Prisma
export const runtime = 'nodejs'

export const GET = async (): Promise<NextResponse> => {
    const isAdmin = await isCurrentUserAdmin()
    if (!isAdmin) {
        return new NextResponse('Forbidden', {
            headers: { 'Content-Type': 'text/plain' },
            status: 403,
        })
    }

    try {
    const items = await getAllInfos()
    return NextResponse.json(items)
  } catch (e) {
    logger.error(e)
    const message = e instanceof Error ? e.message : 'Internal Server Error'
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
        const { text, visibility, contact, cv, photo } = body || {}

        if (text === undefined || visibility === undefined || contact === undefined || cv === undefined) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const created = await createInfo(text, Boolean(visibility), contact, cv, photo)
        return NextResponse.json(created, { status: 201 })
    } catch (e) {
        logger.error(e)
        const message = e instanceof Error ? e.message : 'Internal Server Error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}