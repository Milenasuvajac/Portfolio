'use client'

import { useState, useEffect } from 'react'
import './private.css'

interface InfoData {
  id: number
  photo?: string
  text: string
  visibility: boolean
  contact: string
  cv?: string
}

export default function PrivatePage() {
  const [privateInfo, setPrivateInfo] = useState<InfoData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('about')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    fetchPrivateInfo()
  }, [])

  // Contact form handlers
  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSubmitMessage('Private message sent successfully! I will get back to you soon.')
      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
    } catch (error) {
      setSubmitMessage('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchPrivateInfo = async () => {
    try {
      const response = await fetch('/api/info')
      if (response.ok) {
        const data = await response.json()
        // Filter only private information
        const privateData = data.filter((info: InfoData) => info.visibility === false)
        setPrivateInfo(privateData)
      }
    } catch (error) {
      console.error('Error fetching private info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = () => {
    if (!isLoggedIn) {
      setIsAuthenticated(true)
    } else {
      setIsAuthenticated(false)
    }
    setIsLoggedIn(!isLoggedIn)
  }

  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <div className="auth-required">
          <div className="auth-card">
            <h2>🔐 Authentication Required</h2>
            <p>Please log in to access private information.</p>
            <div className="auth-illustration">
              <div className="lock-icon">🔒</div>
            </div>
          </div>
        </div>
      )
    }

    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading private information...</p>
        </div>
      )
    }

    switch (activeSection) {
      case 'about':
        return (
          <div className="content-section">
            <h2>Private About Information</h2>
            {privateInfo.length > 0 ? (
              privateInfo.map((info) => (
                <div key={info.id} className="info-card private">
                  <div className="private-badge">🔐 Private</div>
                  {info.photo && (
                    <div className="photo-container">
                      <img src={info.photo} alt="Profile" className="profile-photo" />
                    </div>
                  )}
                  <div className="info-content">
                    <p>{info.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="placeholder-card">
                <h3>Private Information</h3>
                <p>This section contains confidential personal information that is only accessible to authorized users.</p>
                <ul>
                  <li key="background">Personal background details</li>
                  <li key="achievements">Private achievements</li>
                  <li key="projects">Confidential projects</li>
                  <li key="notes">Internal notes</li>
                </ul>
              </div>
            )}
          </div>
        )
      case 'contact':
        return (
          <div className="content-section">
            <h2>Private Contact Information</h2>
            {privateInfo.length > 0 ? (
              privateInfo.map((info) => (
                <div key={info.id} className="contact-card private">
                  <div className="private-badge">🔐 Private</div>
                  <h3>Confidential Contact Details</h3>
                  <p>{info.contact}</p>
                </div>
              ))
            ) : (
              <div className="placeholder-card">
                <h3>Private Contact Information</h3>
                <p>This section contains sensitive contact information:</p>
                <ul>
                  <li key="phone">Personal phone numbers</li>
                  <li key="email">Private email addresses</li>
                  <li key="address">Home address</li>
                  <li key="emergency">Emergency contacts</li>
                </ul>
              </div>
            )}
          </div>
        )
      case 'documents':
        return (
          <div className="content-section">
            <h2>Private Documents & CV</h2>
            {privateInfo.length > 0 ? (
              privateInfo.map((info) => (
                <div key={info.id} className="cv-card private">
                  <div className="private-badge">🔐 Private</div>
                  {info.cv ? (
                    <div>
                      <h3>Confidential Resume</h3>
                      {info.cv.startsWith('http') ? (
                        <a href={info.cv} target="_blank" rel="noopener noreferrer" className="cv-link">
                          📄 View Private CV
                        </a>
                      ) : (
                        <p>{info.cv}</p>
                      )}
                    </div>
                  ) : (
                    <p>No private CV information available.</p>
                  )}
                </div>
              ))
            ) : (
              <div className="placeholder-card">
                <h3>Private Documents</h3>
                <p>This section contains confidential documents:</p>
                <ul>
                  <li key="cv-detailed">Detailed CV with salary information</li>
                  <li key="references">References and recommendations</li>
                  <li key="certificates">Certificates and credentials</li>
                  <li key="reviews">Performance reviews</li>
                </ul>
              </div>
            )}
          </div>
        )
      default:
        return <div>Select a section from the menu</div>
    }
  }

  return (
    <div className="app-container private-theme">
      {/* Left Sidebar */}
      <div className="sidebar">
        {/* Login/Logout Button */}
        <div className="auth-section">
          <button 
            className={`auth-button ${isLoggedIn ? 'logged-in' : 'logged-out'}`}
            onClick={handleLogin}
          >
            <span className="auth-icon">{isLoggedIn ? '🔓' : '🔒'}</span>
            <span className="auth-text">{isLoggedIn ? 'Logout' : 'Login'}</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="nav-menu">
          <h3 className="nav-title">Private Information</h3>
          <ul className="nav-list">
            <li key="about">
              <button 
                className={`nav-item ${activeSection === 'about' ? 'active' : ''}`}
                onClick={() => setActiveSection('about')}
                disabled={!isAuthenticated}
              >
                <span className="nav-icon">👤</span>
                Private About
              </button>
            </li>
            <li key="contact">
              <button 
                className={`nav-item ${activeSection === 'contact' ? 'active' : ''}`}
                onClick={() => setActiveSection('contact')}
                disabled={!isAuthenticated}
              >
                <span className="nav-icon">📧</span>
                Private Contact
              </button>
            </li>
            <li key="documents">
              <button 
                className={`nav-item ${activeSection === 'documents' ? 'active' : ''}`}
                onClick={() => setActiveSection('documents')}
                disabled={!isAuthenticated}
              >
                <span className="nav-icon">📄</span>
                Documents
              </button>
            </li>
          </ul>
        </nav>

        {/* Route Navigation */}
        <div className="route-nav">
          <h4>Navigate</h4>
          <a href="/public" className="route-link">🌍 Public</a>
          <a href="/private" className="route-link active">🔐 Private</a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="content-header">
          <h1>Private Information Portal</h1>
          <p>Secure access to confidential information</p>
          {isAuthenticated && (
            <div className="auth-status">
              <span className="status-indicator">🟢</span>
              Authenticated Access
            </div>
          )}
        </header>
        <main className="content-body">
          {renderContent()}
        </main>
        
        {/* Contact Form */}
        <section className="contact-form-section">
          <div className="contact-form-container">
            <h2>Private Contact</h2>
            <p>Send me a private message with confidential information</p>
            
            <form onSubmit={handleContactSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={contactForm.name}
                    onChange={handleContactInputChange}
                    required
                    placeholder="Your full name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactInputChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={contactForm.subject}
                  onChange={handleContactInputChange}
                  required
                  placeholder="What is this about?"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactInputChange}
                  required
                  rows={5}
                  placeholder="Write your message here..."
                />
              </div>
              
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Private Message'}
              </button>
              
              {submitMessage && (
                <div className={`submit-message ${submitMessage.includes('successfully') ? 'success' : 'error'}`}>
                  {submitMessage}
                </div>
              )}
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}