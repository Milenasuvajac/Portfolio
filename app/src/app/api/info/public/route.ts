import {NextResponse} from "next/server";
import {isCurrentUserAdmin} from "@/lib/dal/currentSessionDal";
import {getAllInfos} from "@/lib/dal/infoDal";
import logger from "@/utils/logger";

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
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}