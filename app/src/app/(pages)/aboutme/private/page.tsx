'use client'

import { useState, useEffect } from 'react'
import NavigationMenu from '@/components/NavigationMenu'
import ContactForm from '@/components/ContactForm'
import '../styles.css'

interface PrivateInfo {
  id: number
  text: string
  photo?: string
  contact?: string
  cv?: string
}

export default function AboutMePrivate() {
  const [privateInfo, setPrivateInfo] = useState<PrivateInfo[]>([])

  useEffect(() => {
    fetchPrivateInfo()
  }, [])

  const fetchPrivateInfo = async () => {
    try {
      const response = await fetch('/api/aboutme/private')
      if (response.ok) {
        const text = await response.text()
        if (text) {
          try {
            const data = JSON.parse(text)
            setPrivateInfo(data)
          } catch (parseError) {
            console.error('JSON parsing error:', parseError)
            console.error('Response text:', text)
          }
        }
      } else {
        console.error('Response not ok:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching private info:', error)
    }
  }

  return (
    <div className="app-container">
      <NavigationMenu isPrivate={true} />

      <div className="main-content">
        <div className="content-wrapper">
          <div className="page-header">
            <h1>Welcome to my profile! </h1>
            <p>I’m excited to share more about my skills and experience with you</p>
          </div>
          
          {/* About Section */}
          <section id="about" className="content-section">
            <h2>About me</h2>
            {privateInfo.length > 0 ? (
              privateInfo.map((info) => (
                <div key={`about-${info.id}`} className="info-card private">
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
              <div className="info-card">
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
          </section>

          {/* CV Section */}
          <section id="cv" className="content-section">
            <h2>CV</h2>
            {privateInfo.length > 0 ? (
              privateInfo.map((info) => (
                <div key={`cv-${info.id}`} className="info-card private">
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
              <div className="info-card">
                <h3>CV / Resume</h3>
                <p>My detailed professional resume with confidential information will be available here.</p>
              </div>
            )}
          </section>

          {/* Technologies Section */}
          <section id="technologies" className="content-section">
            <h2>Technologies</h2>
            <div className="info-card">
              <h3>Technical Skills & Tools</h3>
              <p>Detailed information about technologies, frameworks, and tools I work with professionally.</p>
            </div>
          </section>

          {/* Work Experience Section */}
          <section id="experience" className="content-section">
            <h2>Work experience</h2>
            <div className="info-card">
              <h3>Professional Experience</h3>
              <p>Comprehensive details about my work experience, roles, and professional achievements.</p>
            </div>
          </section>

          {/* Documents Section */}
          <section id="documents" className="content-section">
            <h2>Documents</h2>
            {privateInfo.length > 0 ? (
              privateInfo.map((info) => (
                <div key={`documents-${info.id}`} className="info-card private">
                  <div className="private-badge">🔐 Private</div>
                  {info.cv ? (
                    <div>
                      <h3>Confidential Documents</h3>
                      {info.cv.startsWith('http') ? (
                        <a href={info.cv} target="_blank" rel="noopener noreferrer" className="cv-link">
                          📄 View Private Documents
                        </a>
                      ) : (
                        <p>{info.cv}</p>
                      )}
                    </div>
                  ) : (
                    <p>No private documents available.</p>
                  )}
                </div>
              ))
            ) : (
              <div className="info-card">
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
          </section>

          {/* Projects Section */}
          <section id="projects" className="content-section">
            <h2>My projects</h2>
            <div className="info-card">
              <h3>Private Projects Portfolio</h3>
              <p>Confidential and proprietary projects that showcase my professional capabilities.</p>
            </div>
          </section>

          {/* Contact Section - Moved to last */}
          <section id="contact" className="content-section">
            <h2>Contact</h2>
            {privateInfo.length > 0 ? (
              privateInfo.map((info) => (
                <div key={`contact-${info.id}`} className="info-card private">
                  <div className="private-badge">🔐 Private</div>
                  <h3>Confidential Contact Details</h3>
                  <p>{info.contact}</p>
                </div>
              ))
            ) : (
              <div className="info-card">
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
            
            {/* Contact Form */}
            <ContactForm isPrivate={true} />
          </section>
        </div>
      </div>
    </div>
  )
}