import type { NextAuthConfig } from 'next-auth'

// Lightweight auth config for Edge Runtime (middleware)
// This config excludes heavy dependencies like bcryptjs and database access
export default {
  providers: [],
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      return true // Let middleware handle the logic
    },
  },
} satisfies NextAuthConfig