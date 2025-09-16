'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import '../../../users.css'

interface Document {
  did: number
  name: string
  year: number
  document: string
  comment: string | null
  issuer: string
  language: string
}

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    year: new Date().getFullYear(),
    document: '',
    comment: '',
    issuer: '',
    language: ''
  })

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/document')
      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }
      const data = await response.json()
      setDocuments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingDocument ? `/api/document/${editingDocument.did}` : '/api/document'
      const method = editingDocument ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to save document')
      }

      await fetchDocuments()
      setShowForm(false)
      setEditingDocument(null)
      setFormData({
        name: '',
        year: new Date().getFullYear(),
        document: '',
        comment: '',
        issuer: '',
        language: ''
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleEdit = (document: Document) => {
    setEditingDocument(document)
    setFormData({
      name: document.name,
      year: document.year,
      document: document.document,
      comment: document.comment || '',
      issuer: document.issuer,
      language: document.language
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      setIsDeleting(id)
      const response = await fetch(`/api/document/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete document')
      }

      await fetchDocuments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingDocument(null)
    setFormData({
      name: '',
      year: new Date().getFullYear(),
      document: '',
      comment: '',
      issuer: '',
      language: ''
    })
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading documents...</p>
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
        <h1>Document Management</h1>
        <div className="admin-nav">
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : 'Add New Document'}
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
          <h2>{editingDocument ? 'Edit Document' : 'Add New Document'}</h2>
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
              <label htmlFor="year">Year *</label>
              <input
                type="number"
                id="year"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                min="1900"
                max="2100"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="document">Document URL *</label>
              <input
                type="url"
                id="document"
                value={formData.document}
                onChange={(e) => setFormData({...formData, document: e.target.value})}
                placeholder="https://example.com/document.pdf"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="issuer">Issuer *</label>
              <input
                type="text"
                id="issuer"
                value={formData.issuer}
                onChange={(e) => setFormData({...formData, issuer: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="language">Language *</label>
              <select
                id="language"
                value={formData.language}
                onChange={(e) => setFormData({...formData, language: e.target.value})}
                required
              >
                <option value="">Select Language</option>
                <option value="English">English</option>
                <option value="Serbian">Serbian</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="comment">Comment</label>
              <textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => setFormData({...formData, comment: e.target.value})}
                rows={3}
                placeholder="Optional comment about the document"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingDocument ? 'Update Document' : 'Create Document'}
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="content-section">
        {documents.length === 0 ? (
          <div className="empty-state">
            <p>No documents found.</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              Add First Document
            </button>
          </div>
        ) : (
          <div className="documents-grid">
            {documents.map((document) => (
              <div key={document.did} className="document-card">
                <div className="document-header">
                  <h3 className="document-name">{document.name}</h3>
                  <span className="document-year">{document.year}</span>
                </div>
                
                <div className="document-details">
                  <div className="document-detail">
                    <span className="detail-label">Issuer:</span>
                    <span className="detail-value">{document.issuer}</span>
                  </div>
                  <div className="document-detail">
                    <span className="detail-label">Language:</span>
                    <span className="detail-value">{document.language}</span>
                  </div>
                  {document.comment && (
                    <div className="document-detail">
                      <span className="detail-label">Comment:</span>
                      <span className="detail-value">{document.comment}</span>
                    </div>
                  )}
                </div>

                <div className="document-actions">
                  <a 
                    href={document.document} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-small"
                  >
                    View Document
                  </a>
                  <button
                    onClick={() => handleEdit(document)}
                    className="btn btn-secondary btn-small"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(document.did)}
                    className="btn btn-danger btn-small"
                    disabled={isDeleting === document.did}
                  >
                    {isDeleting === document.did ? 'Deleting...' : 'Delete'}
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