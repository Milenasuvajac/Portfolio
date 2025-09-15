import { headers } from 'next/headers'

const windowSize = 60000 * 30
export const maxRequests = 3
export const ipRequests: { [key: string]: number[] } = {}

export const cleanupOldRequests = (timestamps: number[]): number[] => {
    const now = Date.now()
    return timestamps.filter(timestamp => now - timestamp < windowSize)
}

export const getIP = async (): Promise<string> => {
    const hdrs = await headers()
    const forwardedFor = hdrs.get('x-forwarded-for')
    // This header is another way that some proxies send the client’s original IP address.
    const realIp = hdrs.get('x-real-ip')

    // If 'x-forwarded-for' exists, return the first IP in the list because it’s usually the client’s actual (could be a chain of proxies)
    if (forwardedFor) return forwardedFor.split(',')[0].trim()
    if (realIp) return realIp.trim()
    return "unknown"
}
