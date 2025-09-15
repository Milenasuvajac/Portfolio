
export const authRoutes: string[] = [
  '/auth/login',
  '/auth/register',
  '/auth/login/guest',
]

// Redirect URL for regular users after login or access
export const DEFAULT_USER_REDIRECT_URL = '/'
// Redirect URL for admin users after login or access
export const DEFAULT_ADMIN_REDIRECT_URL = '/admin/start'
