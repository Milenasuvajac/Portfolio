'use client'

import { useState, useCallback } from 'react'
import { ExperienceDTO } from '@/dto/ExperienceDTO'

interface UseExperienceReturn {
  experiences: ExperienceDTO[]
  loading: boolean
  error: string | null
  createExperience: (data: Omit<ExperienceDTO, 'EID'>) => Promise<void>
  updateExperience: (id: number, data: Partial<Omit<ExperienceDTO, 'EID'>>) => Promise<void>
  deleteExperience: (id: number) => Promise<void>
  refreshExperiences: () => Promise<void>
}

export const useExperience = (): UseExperienceReturn => {
  const [experiences, setExperiences] = useState<ExperienceDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApiError = (error: any, defaultMessage: string) => {
    console.error('API Error:', error)
    if (error.message) {
      setError(error.message)
    } else {
      setError(defaultMessage)
    }
  }

  const refreshExperiences = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/experience')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setExperiences(data)
    } catch (error) {
      handleApiError(error, 'Error loading experiences')
    } finally {
      setLoading(false)
    }
  }, [])

  const createExperience = useCallback(async (data: Omit<ExperienceDTO, 'EID'>) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/experience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const newExperience = await response.json()
      setExperiences(prev => [...prev, newExperience])
    } catch (error) {
      handleApiError(error, 'Error creating experience')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const updateExperience = useCallback(async (id: number, data: Partial<Omit<ExperienceDTO, 'EID'>>) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/experience/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const updatedExperience = await response.json()
      setExperiences(prev => 
        prev.map(exp => exp.EID === id ? updatedExperience : exp)
      )
    } catch (error) {
      handleApiError(error, 'Error updating experience')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteExperience = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/experience/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      setExperiences(prev => prev.filter(exp => exp.EID !== id))
    } catch (error) {
      handleApiError(error, 'Error deleting experience')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    experiences,
    loading,
    error,
    createExperience,
    updateExperience,
    deleteExperience,
    refreshExperiences
  }
}