import NextAuth from 'next-auth'
import authConfig from './auth.config'
import logger from "@/utils/logger";


export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {

    jwt: async ({ token, user }) => {
      if (user) {
        token.uid = user.uid
        token.role = user.role
      }
      logger.log('JWToken after setting values:', token)
      return token
    },

    session: async ({ session, token }) => {
      if (token) {
        session.user.uid = token.uid as string
        session.user.role = token.role as string
      }
      logger.log('Session after setting values:', session)
      return session
    },
  },

  // Enable debug mode to log information during authentication
  debug: true,

  // Custom authentication pages.
  pages: {
    signIn: '/auth/login', // Custom sign-in page
  },

  secret: process.env.AUTH_SECRET,

  // Spread the authentication configuration
  session: {

    maxAge: 30 * 24 * 60 * 60,
    // Store sessions as JWTs instead of the default database strategy
    strategy: 'jwt', // 30 days expiration
  },
})
