import { NextRequest, NextResponse } from 'next/server'
import { Params } from '@/dto/RequestDTO'
import { deleteDocument, getDocumentById, updateDocument } from '@/lib/dal/documentDal'
import logger from '@/utils/logger'
import {getCurrentUser, isCurrentUserAdmin} from "@/lib/dal/currentSessionDal";

const isNumericId = (id: string) => /^-?\d+$/.test(id)

export const GET = async (
  _req: NextRequest,
  { params }: { params: Params }
): Promise<NextResponse> => {
    const { id } = params
    if (!isNumericId(id)) {
    return NextResponse.json({ error: 'Invalid ID, must be a number' }, { status: 400 })
    }
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse('Forbidden', {
            headers: {'Content-Type': 'text/plain'},
            status: 403,
        })
    }
    try {
        const item = await getDocumentById(id)
        if (!item) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
        return NextResponse.json(item)
    } catch {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export const PUT = async (
  req: NextRequest,
  { params }: { params: Params }
): Promise<NextResponse> => {
    const { id } = params
    const isAdmin = await isCurrentUserAdmin()
    if (!isAdmin) {
        return new NextResponse('Forbidden', {
            headers: { 'Content-Type': 'text/plain' },
            status: 403,
        })
    }
    try {
        const body = await req.json()
        const { name, year, document, issuer, language, comment } = body || {}
        const data: any = {}
        if (name !== undefined) data.name = name
        if (year !== undefined) {
          const yearNum = typeof year === 'string' ? parseInt(year, 10) : year
          if (!Number.isFinite(yearNum)) {
            return NextResponse.json({ error: 'Invalid year' }, { status: 400 })
          }
          data.year = yearNum
        }
        if (document !== undefined) data.document = document
        if (issuer !== undefined) data.issuer = issuer
        if (language !== undefined) data.language = language
        if (comment !== undefined) data.comment = comment

        if (Object.keys(data).length === 0) {
          return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
        }

        const updated = await updateDocument(id, data)
        return NextResponse.json(updated)
    } catch (e) {
        logger.error(e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export const DELETE = async (
  _req: NextRequest,
  { params }: { params: Params }
): Promise<NextResponse> => {
    const { id } = params
    if (!isNumericId(id)) {
    return NextResponse.json({ error: 'Invalid ID, must be a number' }, { status: 400 })
    }
    try {
        const deleted = await deleteDocument(id)
        return NextResponse.json(deleted)
    } catch (e) {
        logger.error(e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}