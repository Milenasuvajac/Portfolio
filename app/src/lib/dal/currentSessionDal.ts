import { auth } from '@/auth'
import logger from '@/utils/logger'

export const getCurrentUser = async () => {
  const session = await auth()

  return session?.user
}

export const getCurrentRole = async (): Promise<string | undefined> => {
  const session = await auth()

  logger.log('Current User Role: ', session?.user?.role)
  return session?.user?.role
}

export const isCurrentUserAdmin = async () => {
  return (await getCurrentRole()) === 'ADMIN'
}
