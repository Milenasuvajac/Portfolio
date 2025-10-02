import { NextResponse } from 'next/server'
import NextAuth from 'next-auth'
import { getToken } from 'next-auth/jwt'

import authConfig from './auth.config.edge'

const authRoutes: string[] = ['/auth/login']
const publicRoutes: string[] = ['/', '/aboutme/public']
const DEFAULT_USER_REDIRECT_URL = '/aboutme/private'

// Get the authentication secret from environment variables
const secret = process.env.AUTH_SECRET
if (!secret) {
    throw new Error('Secret is missing')
}

// Initialize NextAuth with the lightweight edge configuration
const { auth } = NextAuth(authConfig)

export default auth(async req => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth
    const token = await getToken({ req, secret })
    const isUserAdmin = token?.role === 'ADMIN'

    // Avoid HTML redirects for API requests so clients can get proper JSON responses
    // Let API routes handle their own authorization (most already do)
    const isApiRequest = nextUrl.pathname.startsWith('/api')
    if (isApiRequest) {
        return NextResponse.next()
    }

    const isAuthPage = authRoutes.includes(nextUrl.pathname)
    const isAdminPage = nextUrl.pathname.includes('/admin')
    const isPublicPage = publicRoutes.includes(nextUrl.pathname)

    if(isAuthPage && isLoggedIn) {
        return NextResponse.redirect(new URL(DEFAULT_USER_REDIRECT_URL, nextUrl))
    }

    if (!isLoggedIn && !isAuthPage && !isPublicPage) {
        return NextResponse.redirect(new URL('/auth/login', nextUrl))
    }
    if(isLoggedIn && nextUrl.pathname.includes('aboutme/public')) {
        return NextResponse.redirect(new URL('/aboutme/private', nextUrl))

    }

    if (isAdminPage && !isUserAdmin) {
        return NextResponse.redirect(new URL(DEFAULT_USER_REDIRECT_URL, nextUrl))
    }
    // Explicitly continue the request when no redirect was made
    return NextResponse.next()
})
// Configuration for the middleware, specifying which paths to match
// @ts-ignore
export const config = {
    // Apply middleware to application pages only (exclude API routes)
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/'],
}
