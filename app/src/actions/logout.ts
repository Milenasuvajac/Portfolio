'use server'

import {signOut} from "@/auth";

const logout = async (): Promise<void> => {
  await signOut({ redirect: true, redirectTo: '/auth/login' })
}

export { logout }
