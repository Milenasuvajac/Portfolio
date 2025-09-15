'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import '../../../users.css'

interface Project {
  PID: number
  technologies: string
  description: string
  link?: string | null
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    technologies: '',
    description: '',
    link: ''
  })

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/project')
      if (!response.ok) throw new Error('Failed to fetch projects')
      const data = await response.json()
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  // Create or update project
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingProject ? `/api/project/${editingProject.PID}` : '/api/project'
      const method = editingProject ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to save project')
      
      await fetchProjects()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project')
    }
  }

  // Delete project
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    
    try {
      const response = await fetch(`/api/project/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete project')
      await fetchProjects()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project')
    }
  }

  // Edit project
  const handleEdit = (project: Project) => {
    setEditingProject(project)
    setFormData({
      technologies: project.technologies,
      description: project.description,
      link: project.link || ''
    })
    setShowForm(true)
  }

  // Reset form
  const resetForm = () => {
    setEditingProject(null)
    setShowForm(false)
    setFormData({
      technologies: '',
      description: '',
      link: ''
    })
  }

  // Parse technologies string into array for display
  const parseTechnologies = (techString: string): string[] => {
    try {
      return JSON.parse(techString)
    } catch {
      return techString.split(',').map(tech => tech.trim())
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading projects...</p>
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
        <h1>Project Management</h1>
        <div className="admin-nav">
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : 'Add New Project'}
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
          <h2>{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="technologies">Technologies *</label>
              <input
                type="text"
                id="technologies"
                value={formData.technologies}
                onChange={(e) => setFormData({...formData, technologies: e.target.value})}
                placeholder='E.g: ["React", "TypeScript", "Next.js"] or React, TypeScript, Next.js'
                required
              />
              <small>Enter technologies as JSON array or comma-separated</small>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
                placeholder="Describe the project, its features and goals..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="link">Link (optional)</label>
              <input
                type="url"
                id="link"
                value={formData.link}
                onChange={(e) => setFormData({...formData, link: e.target.value})}
                placeholder="https://github.com/username/project or https://project-demo.com"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingProject ? 'Update Project' : 'Create Project'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="projects-container">
        <h2>Projects ({projects.length})</h2>
        
        {projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects found</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              Add First Project
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.PID} className="project-card">
                <div className="project-header">
                  <h3>Project #{project.PID}</h3>
                  <div className="project-actions">
                    <button 
                      onClick={() => handleEdit(project)}
                      className="btn btn-edit"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(project.PID)}
                      className="btn btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="project-content">
                  <div className="technologies-section">
                    <h4>Technologies:</h4>
                    <div className="tech-tags">
                      {parseTechnologies(project.technologies).map((tech, index) => (
                        <span key={index} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  </div>

                  <div className="description-section">
                    <h4>Description:</h4>
                    <p className="project-description">{project.description}</p>
                  </div>

                  {project.link && (
                    <div className="link-section">
                      <h4>Link:</h4>
                      <a 
                        href={project.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="project-link"
                      >
                        {project.link}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}