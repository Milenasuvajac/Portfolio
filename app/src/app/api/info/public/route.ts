import { NextResponse } from "next/server";
import {getPublicInfos} from "@/lib/dal/infoDal";
import logger from "@/utils/logger";

// Ensure Node.js runtime for Prisma
export const runtime = 'nodejs'

export const GET = async (): Promise<NextResponse> => {
    try {
        const items = await getPublicInfos()
        
        // Add debugging for production
        logger.log(`Info/Public API: Found ${items?.length || 0} items`)
        if (process.env.NODE_ENV !== 'production') {
            console.log('Info/Public items:', items)
        }
        
        return NextResponse.json(items)
    } catch (e) {
        logger.error('Info/Public API Error:', e)
        const message = e instanceof Error ? e.message : 'Internal Server Error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}