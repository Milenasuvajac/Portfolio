import { NextResponse } from 'next/server'
import NextAuth from 'next-auth'
import { getToken } from 'next-auth/jwt'

import authConfig from './auth.config'
import {
  authRoutes,
  DEFAULT_ADMIN_REDIRECT_URL,
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
  const isAdminPage = nextUrl.pathname.startsWith('/admin')

  if (isAuthPage) {
    if (isLoggedIn) {
      return isUserAdmin
        ? NextResponse.redirect(new URL(DEFAULT_ADMIN_REDIRECT_URL, nextUrl))
        : NextResponse.redirect(new URL(DEFAULT_USER_REDIRECT_URL, nextUrl))
    }
    return undefined
  }

  if (!isLoggedIn && !isAuthPage) {
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
