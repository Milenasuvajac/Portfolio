'use client'

import { useState, useEffect } from 'react'
import './public.css'

interface InfoData {
  id: number
  photo?: string
  text: string
  visibility: boolean
  contact: string
  cv?: string
}

export default function PublicPage() {
  const [publicInfo, setPublicInfo] = useState<InfoData[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeSection, setActiveSection] = useState('about')
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

  useEffect(() => {
    fetchPublicInfo()
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
      
      setSubmitMessage('Message sent successfully! I will get back to you soon.')
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

  const fetchPublicInfo = async () => {
    try {
      const response = await fetch('/api/info')
      if (response.ok) {
        const data = await response.json()
        // Filter only public information
        const publicData = data.filter((info: InfoData) => info.visibility === true)
        setPublicInfo(publicData)
      }
    } catch (error) {
      console.error('Error fetching public info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = () => {
    setIsLoggedIn(!isLoggedIn)
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading public information...</p>
        </div>
      )
    }

    switch (activeSection) {
      case 'about':
        return (
          <div className="content-section">
            <h2>About</h2>
            {publicInfo.length > 0 ? (
              publicInfo.map((info) => (
                <div key={info.id} className="info-card">
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
              <p>No public information available.</p>
            )}
          </div>
        )
      case 'contact':
        return (
          <div className="content-section">
            <h2>Contact Information</h2>
            {publicInfo.length > 0 ? (
              publicInfo.map((info) => (
                <div key={info.id} className="contact-card">
                  <h3>Get in Touch</h3>
                  <p>{info.contact}</p>
                </div>
              ))
            ) : (
              <p>No contact information available.</p>
            )}
          </div>
        )
      case 'cv':
        return (
          <div className="content-section">
            <h2>CV / Resume</h2>
            {publicInfo.length > 0 ? (
              publicInfo.map((info) => (
                <div key={info.id} className="cv-card">
                  {info.cv ? (
                    <div>
                      <h3>Resume Information</h3>
                      <p>{info.cv}</p>
                    </div>
                  ) : (
                    <p>No CV information available.</p>
                  )}
                </div>
              ))
            ) : (
              <p>No CV information available.</p>
            )}
          </div>
        )
      default:
        return <div>Select a section from the menu</div>
    }
  }

  return (
    <div className="app-container">
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
          <h3 className="nav-title">Public Information</h3>
          <ul className="nav-list">
            <li key="about">
              <button 
                className={`nav-item ${activeSection === 'about' ? 'active' : ''}`}
                onClick={() => setActiveSection('about')}
              >
                <span className="nav-icon">👤</span>
                About Me
              </button>
            </li>
            <li key="contact">
              <button 
                className={`nav-item ${activeSection === 'contact' ? 'active' : ''}`}
                onClick={() => setActiveSection('contact')}
              >
                <span className="nav-icon">📧</span>
                Contact
              </button>
            </li>
            <li key="cv">
              <button 
                className={`nav-item ${activeSection === 'cv' ? 'active' : ''}`}
                onClick={() => setActiveSection('cv')}
              >
                <span className="nav-icon">📄</span>
                CV / Resume
              </button>
            </li>
          </ul>
        </nav>

        {/* Route Navigation */}
        <div className="route-nav">
          <h4>Navigate</h4>
          <a href="/public" className="route-link active">🌍 Public</a>
          <a href="/private" className="route-link">🔐 Private</a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="content-header">
          <h1>Public Information Portal</h1>
          <p>Welcome to the public information section</p>
        </header>
        <main className="content-body">
          {renderContent()}
        </main>
        
        {/* Contact Form */}
        <section className="contact-form-section">
          <div className="contact-form-container">
            <h2>Contact Me</h2>
            <p>Have a question or suggestion? Send me a message!</p>
            
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
                {isSubmitting ? 'Sending...' : 'Send Message'}
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