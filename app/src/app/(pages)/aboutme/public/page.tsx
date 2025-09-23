'use client'

import { useState, useEffect } from 'react'
import NavigationMenu from '@/components/NavigationMenu'
import ContactForm from '@/components/ContactForm'
import '../../styles.css'

interface PublicInfo {
  id: number
  text: string
  photo?: string
  contact?: string
  cv?: string
}

export default function AboutMePublic() {
  const [publicInfo, setPublicInfo] = useState<PublicInfo[]>([])

  useEffect(() => {
    fetchPublicInfo()
  }, [])

  const fetchPublicInfo = async () => {
    try {
      const response = await fetch('/api/aboutme/public')
      if (response.ok) {
        const text = await response.text()
        if (text) {
          try {
            const data = JSON.parse(text)
            setPublicInfo(data)
          } catch (parseError) {
            console.error('JSON parsing error:', parseError)
            console.error('Response text:', text)
          }
        }
      } else {
        console.error('Response not ok:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching public info:', error)
    }
  }

  return (
    <div className="app-container">
      <NavigationMenu isPrivate={false} />

      <div className="main-content">
        <div className="content-wrapper">
          <div className="page-header">
            <h1>Welcome to my public portfolio!</h1>
              Here you can get a first impression of who I am.
              To see my full skills and experience, please{" "}
              <strong>log in</strong> or <strong>contact me directly</strong>.
          </div>
          
          {/* About Section */}
          <section id="about" className="content-section">
            <h2>About me</h2>
            {publicInfo.length > 0 ? (
              publicInfo.map((info) => (
                <div key={`about-${info.id}`} className="info-card">
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
            <h2>Technologies</h2>
            <div className="info-card">
              <p><strong>Information about technologies, frameworks, and tools I work with professionally.</strong></p>
            </div>
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