import {NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/dal/currentSessionDal";
import {getPrivateInfos} from "@/lib/dal/infoDal";
import logger from "@/utils/logger";

export const GET = async (): Promise<NextResponse> => {
    const user = await getCurrentUser();
    if (!user) {
        return new NextResponse('Forbidden', {
            headers: {'Content-Type': 'text/plain'},
            status: 403,
        })
    }
    try {
        const items = await getPrivateInfos()
        return NextResponse.json(items)
    } catch (e) {
        logger.error(e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}