'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import '../../users.css'

interface SystemStats {
  totalUsers: number
  totalExperiences: number
  serverUptime: string
  lastUpdated: string
}

export default function AdminInfoPage() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSystemStats()
  }, [])

  const fetchSystemStats = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API calls to get system statistics
      const [usersResponse, experiencesResponse] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/experience')
      ])

      const users = usersResponse.ok ? await usersResponse.json() : []
      const experiences = experiencesResponse.ok ? await experiencesResponse.json() : []

      setStats({
        totalUsers: Array.isArray(users) ? users.length : 0,
        totalExperiences: Array.isArray(experiences) ? experiences.length : 0,
        serverUptime: formatUptime(Date.now() - (Date.now() - 3600000)), // Mock uptime
        lastUpdated: new Date().toLocaleString()
      })
    } catch (error) {
      console.error('Error fetching system stats:', error)
      setError('Failed to load system statistics')
    } finally {
      setLoading(false)
    }
  }

  const formatUptime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  const refreshStats = () => {
    fetchSystemStats()
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Admin Dashboard</h1>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <Button onClick={refreshStats} className="btn-primary">
          Refresh Stats
        </Button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <Button onClick={refreshStats} className="btn-secondary">
            Retry
          </Button>
        </div>
      )}

      <div className="content-section">
        {/* System Overview */}
        <div className="info-section">
          <h2 className="section-title">System Overview</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>Portfolio Admin Panel</h3>
              <p>Comprehensive management system for portfolio content and user administration.</p>
              <div className="info-details">
                <span className="info-label">Version:</span>
                <span className="info-value">1.0.0</span>
              </div>
              <div className="info-details">
                <span className="info-label">Environment:</span>
                <span className="info-value">Development</span>
              </div>
              <div className="info-details">
                <span className="info-label">Last Updated:</span>
                <span className="info-value">{stats?.lastUpdated || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Statistics */}
        <div className="info-section">
          <h2 className="section-title">System Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats?.totalUsers || 0}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats?.totalExperiences || 0}</div>
              <div className="stat-label">Total Experiences</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats?.serverUptime || 'N/A'}</div>
              <div className="stat-label">Server Uptime</div>
            </div>
          </div>
        </div>

        {/* Admin Sections */}
        <div className="info-section">
          <h2 className="section-title">Admin Sections</h2>
          <div className="admin-links">
            <div className="admin-link-card">
              <h3>User Management</h3>
              <p>Manage user accounts, permissions, and authentication settings.</p>
              <Button 
                onClick={() => window.location.href = '/admin/users'}
                className="btn-primary"
              >
                Go to Users
              </Button>
            </div>
            <div className="admin-link-card">
              <h3>Experience Management</h3>
              <p>Manage professional experiences, job history, and portfolio content.</p>
              <Button 
                onClick={() => window.location.href = '/admin/experience'}
                className="btn-primary"
              >
                Go to Experiences
              </Button>
            </div>
            <div className="admin-link-card">
              <h3>Projects Management</h3>
              <p>Manage portfolio projects, technologies used, and project links.</p>
              <Button 
                onClick={() => window.location.href = '/admin/projects'}
                className="btn-primary"
              >
                Go to Projects
              </Button>
            </div>
            <div className="admin-link-card">
              <h3>Technology Management</h3>
              <p>Manage technology stack, skills, and technical expertise information.</p>
              <Button 
                onClick={() => window.location.href = '/admin/technology'}
                className="btn-primary"
              >
                Go to Technologies
              </Button>
            </div>
            <div className="admin-link-card">
              <h3>Message Management</h3>
              <p>View and manage contact messages, inquiries, and communications.</p>
              <Button 
                onClick={() => window.location.href = '/admin/message'}
                className="btn-primary"
              >
                Go to Messages
              </Button>
            </div>
            <div className="admin-link-card">
              <h3>Personal Information</h3>
              <p>Manage personal details, contact information, and profile settings.</p>
              <Button 
                onClick={() => window.location.href = '/admin/info'}
                className="btn-primary"
              >
                Go to Info
              </Button>
            </div>
          </div>
        </div>

        {/* Technical Information */}
        <div className="info-section">
          <h2 className="section-title">Technical Information</h2>
          <div className="tech-info">
            <div className="tech-item">
              <span className="tech-label">Framework:</span>
              <span className="tech-value">Next.js 14</span>
            </div>
            <div className="tech-item">
              <span className="tech-label">Database:</span>
              <span className="tech-value">PostgreSQL with Prisma ORM</span>
            </div>
            <div className="tech-item">
              <span className="tech-label">Authentication:</span>
              <span className="tech-value">NextAuth.js</span>
            </div>
            <div className="tech-item">
              <span className="tech-label">Styling:</span>
              <span className="tech-value">CSS Modules</span>
            </div>
            <div className="tech-item">
              <span className="tech-label">TypeScript:</span>
              <span className="tech-value">Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}