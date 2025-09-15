'use client'

import React, { useState, useEffect } from 'react'
import { ExperienceDTO } from '@/dto/ExperienceDTO'
import { Button } from './Button'
import { Input } from './Input'

interface ExperienceFormProps {
  experience?: ExperienceDTO | null
  onSubmit: (data: Omit<ExperienceDTO, 'EID'>) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export const ExperienceForm: React.FC<ExperienceFormProps> = ({
  experience,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState({
    company: '',
    description: '',
    myResp: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (experience) {
      setFormData({
        company: experience.company || '',
        description: experience.description || '',
        myResp: experience.myResp || ''
      })
    } else {
      setFormData({
        company: '',
        description: '',
        myResp: ''
      })
    }
    setErrors({})
  }, [experience])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.myResp.trim()) {
      newErrors.myResp = 'Responsibilities are required'
    }

    // Validation for length
    if (formData.company.length > 100) {
      newErrors.company = 'Company name cannot be longer than 100 characters'
    }

    if (formData.description.length > 500) {
      newErrors.description = 'Description cannot be longer than 500 characters'
    }

    if (formData.myResp.length > 500) {
      newErrors.myResp = 'Responsibilities cannot be longer than 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    onSubmit({
      company: formData.company.trim(),
      description: formData.description.trim(),
      myResp: formData.myResp.trim()
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="form-group">
        <label htmlFor="company" className="form-label">
          Company *
        </label>
        <Input
          id="company"
          type="text"
          value={formData.company}
          onChange={(value) => handleInputChange('company', value)}
          placeholder="Enter company name"
          className={errors.company ? 'input-error' : ''}
          disabled={isSubmitting}
          maxLength={100}
        />
        {errors.company && (
          <span className="error-text">{errors.company}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Position Description *
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
          placeholder="Describe the position and main activities"
          className={`form-textarea ${errors.description ? 'input-error' : ''}`}
          disabled={isSubmitting}
          rows={4}
          maxLength={500}
        />
        <div className="character-count">
          {formData.description.length}/500
        </div>
        {errors.description && (
          <span className="error-text">{errors.description}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="myResp" className="form-label">
          My Responsibilities *
        </label>
        <textarea
          id="myResp"
          value={formData.myResp}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('myResp', e.target.value)}
          placeholder="Describe your responsibilities and achievements in detail"
          className={`form-textarea ${errors.myResp ? 'input-error' : ''}`}
          disabled={isSubmitting}
          rows={4}
          maxLength={500}
        />
        <div className="character-count">
          {formData.myResp.length}/500
        </div>
        {errors.myResp && (
          <span className="error-text">{errors.myResp}</span>
        )}
      </div>

      <div className="form-actions">
        <Button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : experience ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  )
}