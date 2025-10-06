import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import logger from '@/utils/logger'

// Force Node runtime for Prisma
export const runtime = 'nodejs'

export const GET = async (): Promise<NextResponse> => {
    try {
        logger.log('Debug endpoint: Starting database tests')
        
        // Test 1: Raw SQL query to count Technology records
        const rawTechCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Technology"`
        logger.log('Raw Technology count query result:', rawTechCount)
        
        // Test 2: Prisma ORM query to get Technology records
        const prismatech = await prisma.technology.findMany()
        logger.log(`Prisma Technology query result: ${prismatech?.length || 0} items`)
        
        // Test 3: Raw SQL query to get all Technology records
        const rawTechs = await prisma.$queryRaw`SELECT * FROM "Technology"`
        logger.log('Raw Technology select query result:', rawTechs)
        
        // Test 4: Raw SQL query to count Info records
        const rawInfoCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Info"`
        logger.log('Raw Info count query result:', rawInfoCount)
        
        // Test 5: Prisma ORM query to get Info records
        const prismaInfos = await prisma.info.findMany()
        logger.log(`Prisma Info query result: ${prismaInfos?.length || 0} items`)
        
        // Test 6: Raw SQL query to get public Info records
        const rawPublicInfos = await prisma.$queryRaw`SELECT * FROM "Info" WHERE visibility = true`
        logger.log('Raw public Info select query result:', rawPublicInfos)
        
        return NextResponse.json({
            message: 'Debug queries completed',
            technology: {
                rawCount: rawTechCount,
                prismaCount: prismatech?.length || 0,
                rawData: rawTechs,
                prismaData: prismatech
            },
            info: {
                rawCount: rawInfoCount,
                prismaCount: prismaInfos?.length || 0,
                rawPublicData: rawPublicInfos,
                prismaData: prismaInfos
            }
        })
    } catch (e) {
        logger.error('Debug endpoint error:', e)
        const message = e instanceof Error ? e.message : 'Internal Server Error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}