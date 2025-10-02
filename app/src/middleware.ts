import NextAuth from 'next-auth'

import authConfig from './auth.config'


// Get the authentication secret from environment variables
const secret = process.env.AUTH_SECRET
if (!secret) {
  throw new Error('Secret is missing')
}

// Initialize NextAuth with the configuration
const { auth } = NextAuth(authConfig)


export default auth(async req => {


    return undefined
})
// Configuration for the middleware, specifying which paths to match
export const config = {
    // every single page except _next static files are going to invoke middleware
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
