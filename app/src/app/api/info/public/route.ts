import { NextResponse } from "next/server";
import {getPublicInfos} from "@/lib/dal/infoDal";
import logger from "@/utils/logger";

export const GET = async (): Promise<NextResponse> => {
    try {
        const items = await getPublicInfos()
        return NextResponse.json(items)
    } catch (e) {
        logger.error(e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}