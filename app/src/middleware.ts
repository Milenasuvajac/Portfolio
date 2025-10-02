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
    return undefined
})
// Configuration for the middleware, specifying which paths to match
// @ts-ignore
export const config = {
    // every single page except _next static files are going to invoke middleware
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
