'use client'

import { useState, useEffect } from 'react'
import NavigationMenu from '@/components/NavigationMenu'
import ContactForm from '@/components/ContactForm'
import { 
  fetchAllAboutMeData, 
  Info, 
  Technology, 
  Experience, 
  Document, 
  Project 
} from '@/lib/api'
import '../../styles.css'
import { useRouter } from 'next/navigation'

interface AboutMeData {
  info: Info[]
  technologies: Technology[]
  experiences: Experience[]
  documents: Document[]
  projects: Project[]
}

export default function AboutMePrivate() {
  const [data, setData] = useState<AboutMeData>({
    info: [],
    technologies: [],
    experiences: [],
    documents: [],
    projects: []
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      const allData = await fetchAllAboutMeData()
      setData(allData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <NavigationMenu isPrivate={true} />

      <div className="sticky-auth">
        <button onClick={() => router.push('/logout')} className="login-button">Logout</button>
      </div>

      <div className="main-content">
        <div className="content-wrapper">
          <div className="page-header">
            <h1>Welcome to my profile! </h1>
            <p>I’m excited to share more about my skills and experience with you</p>
          </div>
          
          {/* About Section */}
          <section id="about" className="content-section">
            <h2>About me</h2>
            {loading ? (
              <div className="info-card">
                <p>Loading...</p>
              </div>
            ) : data.info.length > 0 ? (
              data.info.map((info, idx) => (
                <div key={`about-${info.id}-${idx}`} className="info-card private">
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
            {loading ? (
              <div className="info-card">
                <p>Loading...</p>
              </div>
            ) : data.info.filter(info => info.cv).length > 0 ? (
              data.info.filter(info => info.cv).map((info, idx) => (
                <div key={`cv-${info.id}-${idx}`} className="info-card private">
                  <div>
                    {info.cv!.startsWith('http') ? (
                      <a href={info.cv} target="_blank" rel="noopener noreferrer" className="cv-link">
                        📄 View Private CV
                      </a>
                    ) : (
                      <p>{info.cv}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="info-card">
                <p>My detailed professional resume with confidential information will be available here.</p>
              </div>
            )}
          </section>

          {/* Technologies Section */}
          <section id="technologies" className="content-section">
            <h2>Technologies</h2>
            {loading ? (
              <div className="info-card">
                <p>Loading...</p>
              </div>
            ) : data.technologies.length > 0 ? (
              <div className="info-card private">
                <div className="technologies-grid">
                  {data.technologies.map((tech, idx) => (
                    <div key={`tech-${tech.id}-${idx}`} className="technology-item" title={tech.description}>
                      {tech.icon && (
                        <div className="tech-icon">
                          <img src={tech.icon} alt={tech.name} />
                        </div>
                      )}
                      <div className="tech-info">
                        <h4>{tech.name}</h4>
                        <p className="tech-description">{tech.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="info-card">
                <p>Detailed information about technologies, frameworks, and tools I work with professionally.</p>
              </div>
            )}
          </section>

          {/* Work Experience Section */}
          <section id="experience" className="content-section">
            <h2>Work experience</h2>
            {loading ? (
              <div className="info-card">
                <p>Loading...</p>
              </div>
            ) : data.experiences.length > 0 ? (
              data.experiences.map((experience, idx) => (
                <div key={`exp-${experience.id}-${idx}`} className="info-card private">
                  <h3>{experience.company}</h3>
                  <div className="experience-content">
                    <div className="experience-description">
                      <h4>Description</h4>
                      <p>{experience.description}</p>
                    </div>
                    <div className="experience-responsibilities">
                      <h4>My Responsibilities</h4>
                      <p>{experience.myResp}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="info-card">
                <h3>Professional Experience</h3>
                <p>Comprehensive details about my work experience, roles, and professional achievements.</p>
              </div>
            )}
          </section>

          {/* Documents Section */}
          <section id="documents" className="content-section">
            <h2>Documents</h2>
            {loading ? (
              <div className="info-card">
                <p>Loading...</p>
              </div>
            ) : data.documents.length > 0 ? (
              data.documents.map((document, idx) => (
                <div key={`doc-${document.id}-${idx}`} className="info-card private">
                  <div className="document-item">
                    <h3>{document.name}</h3>
                    <div className="document-details">
                      <p><strong>Year:</strong> {document.year}</p>
                      <p><strong>Issuer:</strong> {document.issuer}</p>
                      <p><strong>Language:</strong> {document.language}</p>
                      {document.comment && (
                        <p><strong>Comment:</strong> {document.comment}</p>
                      )}
                      {document.document.startsWith('http') ? (
                        <a href={document.document} target="_blank" rel="noopener noreferrer" className="cv-link">
                          📄 View Document
                        </a>
                      ) : (
                        <p><strong>Document:</strong> {document.document}</p>
                      )}
                    </div>
                  </div>
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
            {loading ? (
              <div className="info-card">
                <p>Loading...</p>
              </div>
            ) : data.projects.length > 0 ? (
              data.projects.map((project, idx) => (
                <div key={`project-${project.id}-${idx}`} className="info-card private">
                  <div className="project-item">
                    <div className="project-details">
                      <div className="project-technologies">
                        <h4>Project</h4>
                        <p>{project.technologies}</p>
                      </div>
                      <div className="project-description">
                        <h4>Description</h4>
                        <p>{project.description}</p>
                      </div>
                      {project.link && (
                        <div className="project-link">
                          <h4>Project Link</h4>
                          {project.link.startsWith('http') ? (
                            <a href={project.link} target="_blank" rel="noopener noreferrer" className="cv-link">
                              🔗 View Project
                            </a>
                          ) : (
                            <p>{project.link}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="info-card">
                <h3>Private Projects Portfolio</h3>
                <p>Confidential and proprietary projects that showcase my professional capabilities.</p>
              </div>
            )}
          </section>

          <section id="contact" className="content-section">
            <h2>Contact</h2>
            {loading ? (
              <div className="info-card">
                <p>Loading...</p>
              </div>
            ) : data.info.filter(info => info.contact).length > 0 ? (
              data.info.filter(info => info.contact).map((info, idx) => (
                <div key={`contact-${info.id}-${idx}`} className="info-card private">
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