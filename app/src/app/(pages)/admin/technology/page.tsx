'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import '../../../users.css'

interface Technology {
  TID: number
  name: string
  description: string
  icon?: string | null
}

export default function AdminTechnologyPage() {
  const [technologies, setTechnologies] = useState<Technology[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingTechnology, setEditingTechnology] = useState<Technology | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: ''
  })

  // Fetch technologies
  const fetchTechnologies = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/technology')
      if (!response.ok) throw new Error('Failed to fetch technologies')
      const data = await response.json()
      setTechnologies(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load technologies')
    } finally {
      setLoading(false)
    }
  }

  // Create or update technology
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingTechnology ? `/api/technology/${editingTechnology.TID}` : '/api/technology'
      const method = editingTechnology ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to save technology')
      
      await fetchTechnologies()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save technology')
    }
  }

  // Delete technology
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this technology?')) return
    
    try {
      const response = await fetch(`/api/technology/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete technology')
      await fetchTechnologies()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete technology')
    }
  }

  // Edit technology
  const handleEdit = (technology: Technology) => {
    setEditingTechnology(technology)
    setFormData({
      name: technology.name,
      description: technology.description,
      icon: technology.icon || ''
    })
    setShowForm(true)
  }

  // Reset form
  const resetForm = () => {
    setEditingTechnology(null)
    setShowForm(false)
    setFormData({
      name: '',
      description: '',
      icon: ''
    })
  }

  useEffect(() => {
    fetchTechnologies()
  }, [])

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading technologies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-header-nav">
          <Link href="/admin" className="admin-back-button">
            ← Back to Admin Dashboard
          </Link>
        </div>
        <h1>Technology Management</h1>
        <div className="admin-nav">
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : 'Add New Technology'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {showForm && (
        <div className="form-container">
          <h2>{editingTechnology ? 'Edit Technology' : 'Add New Technology'}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="E.g: React, TypeScript, Node.js"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                placeholder="Describe the technology, its purpose and characteristics..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="icon">Icon (optional)</label>
              <input
                type="text"
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                placeholder="Icon URL or emoji (e.g: ⚛️, 🟦, https://example.com/icon.svg)"
              />
              <small>You can use emoji or URL to icon</small>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingTechnology ? 'Update Technology' : 'Create Technology'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="technologies-container">
        <h2>Technologies ({technologies.length})</h2>
        
        {technologies.length === 0 ? (
          <div className="empty-state">
            <p>No technologies found</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              Add First Technology
            </button>
          </div>
        ) : (
          <div className="technologies-grid">
            {technologies.map((technology) => (
              <div key={technology.TID} className="technology-card">
                <div className="technology-header">
                  <div className="technology-title">
                    {technology.icon && (
                      <span className="technology-icon">
                        {technology.icon.startsWith('http') ? (
                          <img src={technology.icon} alt={technology.name} className="icon-image" />
                        ) : (
                          <span className="icon-emoji">{technology.icon}</span>
                        )}
                      </span>
                    )}
                    <h3>{technology.name}</h3>
                  </div>
                  <div className="technology-actions">
                    <button 
                      onClick={() => handleEdit(technology)}
                      className="btn btn-edit"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(technology.TID)}
                      className="btn btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="technology-content">
                  <div className="technology-id">
                    <span className="id-label">ID:</span>
                    <span className="id-value">#{technology.TID}</span>
                  </div>
                  
                  <div className="technology-description">
                    <p>{technology.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}