// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            uid: string
            role: string
            username: string
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        uid: string
        role: string
        username: string
    }
}

