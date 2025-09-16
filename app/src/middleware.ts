import { NextResponse } from 'next/server'
import NextAuth from 'next-auth'
import { getToken } from 'next-auth/jwt'

import authConfig from './auth.config'
import {
  authRoutes,
  DEFAULT_USER_REDIRECT_URL,
} from './routes'

// Get the authentication secret from environment variables
const secret = process.env.AUTH_SECRET
if (!secret) {
  throw new Error('Secret is missing')
}

// Initialize NextAuth with the configuration
const { auth } = NextAuth(authConfig)


export default auth(async req => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth
    const token = await getToken({ req, secret })
    const isUserAdmin = token?.role === 'ADMIN'

    const isAuthPage = authRoutes.includes(nextUrl.pathname)
    const isAdminPage = nextUrl.pathname.includes('/admin')
    const homePage = nextUrl.pathname === '/'

    if(isAuthPage && isLoggedIn) {
        return NextResponse.redirect(new URL(DEFAULT_USER_REDIRECT_URL, nextUrl))
    }

    if (!isLoggedIn && !isAuthPage && !homePage) {
        return NextResponse.redirect(new URL('/auth/login', nextUrl))
    }

    if (isAdminPage && !isUserAdmin) {
        return NextResponse.redirect(new URL(DEFAULT_USER_REDIRECT_URL, nextUrl))
    }
    return undefined
})
// Configuration for the middleware, specifying which paths to match
export const config = {
    // every single page except _next static files are going to invoke middleware
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
