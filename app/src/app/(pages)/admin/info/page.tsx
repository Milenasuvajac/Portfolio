'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import '../../../users.css'

interface PersonalInfo {
  id?: number
  text: string
  visibility: boolean
  contact: string
  cv: string
  photo?: string
  createdAt?: string
  updatedAt?: string
}

export default function PersonalInfoPage() {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<PersonalInfo>>({
    text: '',
    visibility: true,
    contact: '',
    cv: '',
    photo: ''
  })

  useEffect(() => {
    fetchPersonalInfo()
  }, [])

  const fetchPersonalInfo = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/info')
      if (!response.ok) {
        throw new Error('Failed to fetch personal information')
      }
      const data = await response.json()
      setPersonalInfo(Array.isArray(data) ? data : [])
      
      // If there's existing data, populate the edit form with the first entry
      if (data && data.length > 0) {
        setEditForm(data[0])
      }
    } catch (error) {
      console.error('Error fetching personal info:', error)
      setError('Failed to load personal information')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (!response.ok) {
        throw new Error('Failed to save personal information')
      }

      await fetchPersonalInfo()
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving personal info:', error)
      setError('Failed to save personal information')
    }
  }

  const handleInputChange = (field: keyof PersonalInfo, value: string | boolean) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Personal Information</h1>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Personal Information</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button 
            onClick={() => setIsEditing(!isEditing)} 
            className={isEditing ? "btn-secondary" : "btn-primary"}
          >
            {isEditing ? 'Cancel' : 'Edit Info'}
          </Button>
          {isEditing && (
            <Button onClick={handleSave} className="btn-primary">
              Save Changes
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <Button onClick={fetchPersonalInfo} className="btn-secondary">
            Retry
          </Button>
        </div>
      )}

      <div className="content-section">
        {isEditing ? (
          /* Edit Form */
          <div className="info-section">
            <h2 className="section-title">Edit Personal Information</h2>
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  About Me Text:
                </label>
                <textarea
                  value={editForm.text || ''}
                  onChange={(e) => handleInputChange('text', e.target.value)}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                  placeholder="Write about yourself, your experience, skills, and interests..."
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Contact Information:
                </label>
                <input
                  type="text"
                  value={editForm.contact || ''}
                  onChange={(e) => handleInputChange('contact', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  placeholder="Email, phone, or other contact details"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  CV/Resume Link:
                </label>
                <input
                  type="url"
                  value={editForm.cv || ''}
                  onChange={(e) => handleInputChange('cv', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  placeholder="https://example.com/your-cv.pdf"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Photo URL (optional):
                </label>
                <input
                  type="url"
                  value={editForm.photo || ''}
                  onChange={(e) => handleInputChange('photo', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  placeholder="https://example.com/your-photo.jpg"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="visibility"
                  checked={editForm.visibility || false}
                  onChange={(e) => handleInputChange('visibility', e.target.checked)}
                  style={{ width: '1.2rem', height: '1.2rem' }}
                />
                <label htmlFor="visibility" style={{ fontWeight: '600' }}>
                  Make information publicly visible
                </label>
              </div>
            </div>
          </div>
        ) : (
          /* Display Information */
          <>
            {personalInfo.length > 0 ? (
              personalInfo.map((info, index) => (
                <div key={info.id || index} className="info-section">
                  <h2 className="section-title">About Me</h2>
                  
                  {info.photo && (
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                      <img
                        src={info.photo}
                        alt="Profile"
                        style={{
                          width: '150px',
                          height: '150px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '4px solid #667eea'
                        }}
                      />
                    </div>
                  )}

                  <div className="info-card">
                    <h3>Personal Description</h3>
                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                      {info.text || 'No description available.'}
                    </p>
                  </div>

                  <div className="info-card">
                    <h3>Contact Information</h3>
                    <p>{info.contact || 'No contact information available.'}</p>
                  </div>

                  {info.cv && (
                    <div className="info-card">
                      <h3>CV/Resume</h3>
                      <Button 
                        onClick={() => window.open(info.cv, '_blank')}
                        className="btn-primary"
                      >
                        View CV/Resume
                      </Button>
                    </div>
                  )}

                  <div className="info-card">
                    <h3>Visibility Status</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span 
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: info.visibility ? '#48bb78' : '#f56565'
                        }}
                      ></span>
                      <span>{info.visibility ? 'Publicly Visible' : 'Private'}</span>
                    </div>
                  </div>

                  {info.createdAt && (
                    <div className="tech-info">
                      <div className="tech-item">
                        <span className="tech-label">Created:</span>
                        <span className="tech-value">
                          {new Date(info.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {info.updatedAt && (
                        <div className="tech-item">
                          <span className="tech-label">Last Updated:</span>
                          <span className="tech-value">
                            {new Date(info.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <h3>No Personal Information</h3>
                <p>Click "Edit Info" to add your personal information.</p>
                <Button onClick={() => setIsEditing(true)} className="btn-primary">
                  Add Information
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}