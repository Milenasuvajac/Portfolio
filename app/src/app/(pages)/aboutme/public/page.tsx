'use client'

import { useState, useEffect } from 'react'
import NavigationMenu from '@/components/NavigationMenu'
import ContactForm from '@/components/ContactForm'
import '../../styles.css'
import { useRouter } from 'next/navigation'
import type { PublicInfo, Technology } from '@/dto/aboutme'

export default function AboutMePublic() {
  const [info, setInfo] = useState<PublicInfo[]>([])
  const [technologies, setTechnologies] = useState<Technology[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchInfo(),
        fetchTechnologies(),
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchInfo = async () => {
    try {
      console.log('Fetching info...')
      const response = await fetch('/api/info/public')
      console.log('Info response status:', response.status)
      if (response.ok) {
        const contentType = response.headers.get('content-type') || ''
        if (!contentType.includes('application/json')) {
          console.error('Info endpoint returned non-JSON content-type:', contentType)
          return
        }
        const raw = await response.json()
        const normalized = Array.isArray(raw)
          ? raw.map((i: any, idx: number) => ({
              id: i?.id ?? i?.IID ?? idx,
              text: i?.text ?? '',
              visibility: Boolean(i?.visibility),
            }))
          : []
        console.log('Info data (normalized):', normalized)
        setInfo(normalized)
      } else {
        console.error('Info response not ok:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching info:', error)
    }
  }

  const fetchTechnologies = async () => {
    try {
      console.log('Fetching technologies...')
      const response = await fetch('/api/technology')
      console.log('Technologies response status:', response.status)
      if (response.ok) {
        const contentType = response.headers.get('content-type') || ''
        if (!contentType.includes('application/json')) {
          console.error('Technology endpoint returned non-JSON content-type:', contentType)
          return
        }
        const raw = await response.json()
        const normalized = Array.isArray(raw)
          ? raw.map((t: any, idx: number) => ({
              id: t?.id ?? t?.TID ?? idx,
              name: t?.name ?? '',
              description: t?.description ?? '',
              icon: t?.icon ?? undefined,
            }))
          : []
        console.log('Technologies data (normalized):', normalized)
        setTechnologies(normalized)
      } else {
        console.error('Technologies response not ok:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching technologies:', error)
    }
  }

  if (loading) {
    return (
      <div className="app-container">
        <NavigationMenu isPrivate={false} />
        <div className="sticky-auth">
          <button onClick={() => router.push('/auth/login')} className="login-button">Login</button>
        </div>
        <div className="main-content">
          <div className="content-wrapper">
            <div className="page-header">
              <h1>Loading...</h1>
              <p>Please wait while we load the content.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <NavigationMenu isPrivate={false} />

      <div className="sticky-auth">
        <button onClick={() => router.push('/auth/login')} className="login-button">Login</button>
      </div>

      <div className="main-content">
        <div className="content-wrapper">
          <div className="page-header">
            <h1>Welcome to my public portfolio!</h1>
            <p>
              Here you can get a first impression of who I am.
              To see my full skills and experience, please{" "}
              <strong>log in</strong> or <strong>contact me directly</strong>.
            </p>
          </div>
          
          {/* About Section */}
          <section id="about" className="content-section">
            <h2>About me</h2>
            {info.length > 0 ? (
              info.map((item) => (
                <div key={`about-${item.id}`} className="info-card">
                  <div className="info-content">
                    <p>{item.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="info-card">
                <p>I'm a passionate developer with experience in modern web technologies. I love creating innovative solutions and learning new technologies.</p>
              </div>
            )}
          </section>

          {/* CV Section */}
          <section id="cv" className="content-section">
            <h2>CV</h2>
              <div className="info-card">
                <p><strong>My detailed CV with professional experience and achievements is available only to registered users.</strong></p>
              </div>
          </section>

          {/* Technologies Section */}
          <section id="technologies" className="content-section">
            <h2>Tech Stack</h2>
            {technologies.length > 0 ? (
              <div className="technologies-grid">
                {technologies.map((tech) => (
                  <div key={`tech-${tech.id}`} className="technology-item" title={tech.description}>
                      {tech.icon && (
                          <div className="tech-icon">
                              <img src={tech.icon} alt={tech.name} />
                          </div>
                      )}
                    <div className="tech-info">
                      <h3>{tech.name}</h3>
                      <p className="tech-description">{tech.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="info-card">
                <p><strong>Information about technologies, frameworks, and tools I work with professionally.</strong></p>
              </div>
            )}
          </section>

          {/* Work Experience Section */}
          <section id="experience" className="content-section">
            <h2>Work experience</h2>
              <div className="info-card">
                <p><strong>Detailed information about my work experience, roles, and professional achievements is available only to registered users.</strong></p>
              </div>
          </section>

          {/* Documents Section */}
          <section id="documents" className="content-section">
            <h2>Documents</h2>
              <div className="info-card">
                <p><strong>Important documents, certificates, and credentials related to my professional career are available only to authorized users.</strong></p>
              </div>
          </section>

          {/* Projects Section */}
          <section id="projects" className="content-section">
            <h2>My projects</h2>
              <div className="info-card">
                <p><strong>Detailed showcase of my personal and professional projects that demonstrate my skills and creativity is available only to registered users.</strong></p>
              </div>
          </section>

          <section id="contact" className="content-section">
            {/* Contact Form */}
            <ContactForm isPrivate={false} />
          </section>
        </div>
      </div>
    </div>
  )
}