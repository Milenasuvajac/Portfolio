import { NextRequest, NextResponse } from 'next/server'
import { createDocument, getAllDocuments } from '@/lib/dal/documentDal'
import logger from '@/utils/logger'

export const GET = async (): Promise<NextResponse> => {
  try {
    const items = await getAllDocuments()
    return NextResponse.json(items)
  } catch (e) {
    logger.error(e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const body = await request.json()
    const {
      name,
      year,
      document,
      issuer,
      language,
      comment,
    } = body || {}

    if (!name || year === undefined || !document || !issuer || !language) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const yearNumber = typeof year === 'string' ? parseInt(year, 10) : year
    if (!Number.isFinite(yearNumber)) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 })
    }

    const created = await createDocument(name, yearNumber, document, issuer, language, comment)
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    logger.error(e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}