'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import '../../../users.css'

interface Message {
  MID: number
  name: string
  company: string
  message: string
  contact: string
  content?: string
}

export default function AdminMessagePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    message: '',
    contact: '',
  })

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/message')
      if (!response.ok) throw new Error('Failed to fetch messages')
      const data = await response.json()
      setMessages(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingMessage ? `/api/message/${editingMessage.MID}` : '/api/message'
      const method = editingMessage ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to save message')
      
      await fetchMessages()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save message')
    }
  }

  // Delete message
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return
    
    try {
      const response = await fetch(`/api/message/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete message')
      await fetchMessages()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message')
    }
  }

  // Reset form
  const resetForm = () => {
    setEditingMessage(null)
    setShowForm(false)
    setFormData({
      name: '',
      company: '',
      message: '',
      contact: '',
    })
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <div className="admin-header-nav">
        <Link href="/admin" className="nav-link">← Back to Admin Dashboard</Link>
      </div>
      
      <div className="admin-header">
        <h1>Message Management</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : 'Add New Message'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {showForm && (
        <div className="form-container">
          <h2>{editingMessage ? 'Edit Message' : 'Add New Message'}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="company">Company *</label>
              <input
                type="text"
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact">Contact *</label>
              <input
                type="text"
                id="contact"
                value={formData.contact}
                onChange={(e) => setFormData({...formData, contact: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                rows={4}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingMessage ? 'Update Message' : 'Create Message'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="messages-container">
        <h2>Messages ({messages.length})</h2>
        
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>No messages found</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              Add First Message
            </button>
          </div>
        ) : (
          <div className="messages-grid">
            {messages.map((message) => (
              <div key={message.MID} className="message-card">
                <div className="message-header">
                  <h3>{message.name}</h3>
                  <span className="company-badge">{message.company}</span>
                </div>
                
                <div className="message-content">
                  <p><strong>Contact:</strong> {message.contact}</p>
                  <p><strong>Message:</strong></p>
                  <div className="message-text">{message.message}</div>
                </div>

                <div className="message-actions">
                  <button 
                    onClick={() => handleDelete(message.MID)}
                    className="btn btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}