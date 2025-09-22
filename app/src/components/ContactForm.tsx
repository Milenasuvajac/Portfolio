'use client'

import { useState } from 'react'

interface ContactFormProps {
  isPrivate?: boolean
  onSubmitSuccess?: (message: string) => void
  onSubmitError?: (error: string) => void
}

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export default function ContactForm({ isPrivate = false, onSubmitSuccess, onSubmitError }: ContactFormProps) {
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

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
      const response = await fetch('/api/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactForm.name,
          company: '', // Optional field
          contact: contactForm.email,
          message: `Subject: ${contactForm.subject}\n\n${contactForm.message}`,
          isPrivate: isPrivate
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      //const result = await response.json()
      const successMessage = 'Message sent successfully! I will get back to you soon.'
      
      setSubmitMessage(successMessage)
      setContactForm({
        name: '',
        email: '',
        subject: '',
        message: ''
      })

      if (onSubmitSuccess) {
        onSubmitSuccess(successMessage)
      }
    } catch (error) {
      const errorMessage = 'An error occurred. Please try again.'
      setSubmitMessage(errorMessage)
      
      if (onSubmitError) {
        onSubmitError(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
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
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : (isPrivate ? 'Send Private Message' : 'Send Message')}
          </button>
          
          {submitMessage && (
            <div className={`submit-message ${submitMessage.includes('successfully') ? 'success' : 'error'}`}>
              {submitMessage}
            </div>
          )}
        </form>
      </div>
    </section>
  )
}