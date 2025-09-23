
export const authRoutes: string[] = [
  '/auth/login',
]
export const publicRoutes: string[] = [
    '/',
    '/aboutme/public'
]
// Redirect URL for regular users after login or access
export const DEFAULT_USER_REDIRECT_URL = '/aboutme/public'
// Redirect URL for admin users after login or access
export const DEFAULT_ADMIN_REDIRECT_URL = '/admin'
