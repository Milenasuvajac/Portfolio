'use server'

import {signOut} from "@/auth";

/**
 * Logs out the current user from the application.
 *
 * @returns {Promise<void>} - A promise that resolves when the user is logged out.
 */
const logout = async (): Promise<void> => {
  await signOut({ redirect: true, redirectTo: '/auth/login' })
}

export { logout }
