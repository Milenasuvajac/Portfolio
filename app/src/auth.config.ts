import { compare } from 'bcryptjs'
import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import {getUserByUsername} from "@/lib/dal/userDal";

// @ts-ignore
export default {
  providers: [
    Credentials({
      authorize: async credentials => {
        // Handle guest login by checking for 'guest' username

        const username = credentials?.username as string
        const password = credentials?.password as string

        // Check user in DB
        const user = await getUserByUsername(username)

        if (!user) return null

        const isMatch = await compare(password, user.password)
        if (!isMatch) return null

        let role = "user"
        if(user.username == 'milena'){
            role = "ADMIN"
        }

        // Return the user data to be stored in the session and JWT
        return {
          username: user.username,
          role: role,
          uid: user.UID.toString(),
        }
      },

      credentials: {
        username: { label: 'username', type: 'username' },
        password: { label: 'Password', type: 'password' },
      },

      name: 'Credentials',
    }),
  ],
} satisfies NextAuthConfig
