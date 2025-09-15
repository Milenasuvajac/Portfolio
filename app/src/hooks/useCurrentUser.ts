import { useSession } from 'next-auth/react'

export const useCurrentUser = (): object | undefined => {
  const session = useSession()

  // If there is no session data, reload the page to get the updated session
  if (!session.data) {
    window.location.reload()
  }

  // Return the user object from the session data, or undefined if not available
  return session.data?.user
}
