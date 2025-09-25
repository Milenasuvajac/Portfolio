import { NextRequest, NextResponse } from 'next/server'
import { createProject, getAllProjects } from '@/lib/dal/projectDal'
import logger from '@/utils/logger'
import {getCurrentUser, isCurrentUserAdmin} from "@/lib/dal/currentSessionDal";

export const GET = async (): Promise<NextResponse> => {

    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse('Forbidden', {
            headers: {'Content-Type': 'text/plain'},
            status: 403,
        })
    }
    try {
        const items = await getAllProjects()
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
        const { technologies, description, link, links } = body || {}
        const finalLink = link ?? links

        if (!technologies || !description) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const created = await createProject(technologies, description, finalLink)
        return NextResponse.json(created, { status: 201 })
      } catch (e) {
        logger.error(e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
      }
}