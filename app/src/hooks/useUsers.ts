'use client'

import { useState, useCallback } from 'react'
import { UserDTO, CreateUserBody, UpdateUserBody } from '@/dto/UserDTO'

interface UseUsersReturn {
  users: UserDTO[]
  loading: boolean
  error: string | null
  createUser: (userData: CreateUserBody) => Promise<void>
  updateUser: (userId: number, userData: Partial<UpdateUserBody>) => Promise<void>
  deleteUser: (userId: number) => Promise<void>
  refreshUsers: () => Promise<void>
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<UserDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApiError = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return 'An unexpected error occurred'
  }

  const refreshUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/users')
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`)
      }
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  const createUser = useCallback(async (userData: CreateUserBody) => {
    setError(null)
    
    try {
      const createData: CreateUserBody = {
        username: userData.username!,
        password: userData.password!,
        companyName: userData.companyName ?? null
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to create user: ${response.statusText}`)
      }

      const newUser = await response.json()
      setUsers(prev => [...prev, newUser])
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const updateUser = useCallback(async (userId: number, userData: Partial<UpdateUserBody>) => {
    setError(null)
    
    try {
      const updateData: UpdateUserBody = {
        username: userData.username,
        companyName: userData.companyName,
        ...(userData.password ? { password: userData.password } : {})
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to update user: ${response.statusText}`)
      }

      const updatedUser = await response.json()
      setUsers(prev => prev.map(user => 
        user.UID === userId ? updatedUser : user
      ))
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const deleteUser = useCallback(async (userId: number) => {
    setError(null)
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to delete user: ${response.statusText}`)
      }

      setUsers(prev => prev.filter(user => user.UID !== userId))
    } catch (err) {
      const errorMessage = handleApiError(err)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers
  }
}