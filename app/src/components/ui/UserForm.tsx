'use client'

import { useState, useEffect } from 'react'
import { UserDTO, CreateUserBody, UpdateUserBody } from '@/dto/UserDTO'
import { Input } from './Input'
import { ErrorMessage } from './ErrorMessage'
import { Button } from './Button'

interface UserFormProps {
  user?: UserDTO | null
  onSubmit: (userData: CreateUserBody | UpdateUserBody) => Promise<void>
  onCancel: () => void
  className?: string
}

interface FormData {
  username: string
  password: string
  companyName: string
}

interface FormErrors {
  username?: string
  password?: string
  companyName?: string
  general?: string
}

export function UserForm({ user, onSubmit, onCancel, className = '' }: UserFormProps) {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    companyName: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!user

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        password: '', // Never pre-fill password
        companyName: user.companyName || ''
      })
    } else {
      setFormData({
        username: '',
        password: '',
        companyName: ''
      })
    }
    setErrors({})
  }, [user])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores'
    }

    // Password validation (required for new users, optional for updates)
    if (!isEditing && !formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long'
    } else if (formData.password && !/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter'
    } else if (formData.password && !/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number'
    } else if (formData.password && !/[\W_]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character'
    }

    // Company name validation (optional but must be valid if provided)
    if (formData.companyName && !/^[a-zA-Z0-9_\s]*$/.test(formData.companyName)) {
      newErrors.companyName = 'Company name can only contain letters, numbers, underscores, and spaces'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const userData = isEditing
        ? {
            username: formData.username,
            companyName: formData.companyName || null,
            ...(formData.password && { password: formData.password })
          } as UpdateUserBody
        : {
            username: formData.username,
            password: formData.password,
            companyName: formData.companyName || null
          } as CreateUserBody

      await onSubmit(userData)
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'An error occurred while saving the user'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`user-form ${className}`}>
      {errors.general && (
        <ErrorMessage message={errors.general} className="user-form__error" />
      )}

      <div className="user-form__field">
        <Input
          label="Username"
          type="text"
          value={formData.username}
          onChange={(value) => handleInputChange('username', value)}
          error={errors.username}
          required
          placeholder="Enter username"
        />
      </div>

      <div className="user-form__field">
        <Input
          label={isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
          type="password"
          value={formData.password}
          onChange={(value) => handleInputChange('password', value)}
          error={errors.password}
          required={!isEditing}
          placeholder={isEditing ? 'Enter new password' : 'Enter password'}
        />
      </div>

      <div className="user-form__field">
        <Input
          label="Company Name (Optional)"
          type="text"
          value={formData.companyName}
          onChange={(value) => handleInputChange('companyName', value)}
          error={errors.companyName}
          placeholder="Enter company name"
        />
      </div>

      <div className="user-form__actions">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          loading={isSubmitting}
        >
          {isEditing ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  )
}