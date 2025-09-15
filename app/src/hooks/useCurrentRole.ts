import { useSession } from 'next-auth/react'


export const useCurrentRole = (): string | undefined => {
  const session = useSession()

  if (!session.data) {
    window.location.reload()
  }
  return session.data?.user?.role
}
