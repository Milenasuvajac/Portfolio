import { NextRequest, NextResponse } from 'next/server'
import { Params } from '@/dto/RequestDTO'
import { deleteProject, getProjectById, updateProject } from '@/lib/dal/projectDal'
import logger from '@/utils/logger'
import {getCurrentUser, isCurrentUserAdmin} from "@/lib/dal/currentSessionDal";

const isNumericId = (id: string) => /^-?\d+$/.test(id)

export const GET = async (_req: NextRequest, { params }: { params: Params }) => {

    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse('Forbidden', {
            headers: {'Content-Type': 'text/plain'},
            status: 403,
        })
    }

    const { id } = params
      if (!isNumericId(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
      try {
        const item = await getProjectById(id)
        if (!item) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
        return NextResponse.json(item)
      } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
      }
}

export const PUT = async (req: NextRequest, { params }: { params: Params }) => {
    const isAdmin = await isCurrentUserAdmin()
    if (!isAdmin) {
        return new NextResponse('Forbidden', {
            headers: { 'Content-Type': 'text/plain' },
            status: 403,
        })
    }

    const { id } = params
    if (!isNumericId(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    try {
        const body = await req.json()
        const { technologies, description, link, links } = body || {}
        const finalLink = link ?? links

        const data: any = {}
        if (technologies !== undefined) data.technologies = technologies
        if (description !== undefined) data.description = description
        if (finalLink !== undefined) data.link = finalLink

        if (Object.keys(data).length === 0) {
          return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
        }

        const updated = await updateProject(id, data)
        return NextResponse.json(updated)
      } catch (e) {
        logger.error(e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
      }
}

export const DELETE = async (_req: NextRequest, { params }: { params: Params }) => {
    const isAdmin = await isCurrentUserAdmin()
    if (!isAdmin) {
        return new NextResponse('Forbidden', {
            headers: { 'Content-Type': 'text/plain' },
            status: 403,
        })
    }
    const { id } = params
      if (!isNumericId(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
      try {
        const deleted = await deleteProject(id)
        return NextResponse.json(deleted)
      } catch (e) {
        logger.error(e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
      }
}