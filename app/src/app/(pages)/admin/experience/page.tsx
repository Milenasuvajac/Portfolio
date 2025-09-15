'use client'

import React, { useState, useEffect } from 'react'
import { ExperienceDTO } from '@/dto/ExperienceDTO'
import { useExperience } from '@/hooks/useExperience'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ExperienceTable } from '@/components/ui/ExperienceTable'
import { ExperienceForm } from '@/components/ui/ExperienceForm'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import '../../../users.css'

export default function ExperienceAdminPage() {
  const {
    experiences,
    loading,
    error,
    createExperience,
    updateExperience,
    deleteExperience,
    refreshExperiences
  } = useExperience()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExperience, setEditingExperience] = useState<ExperienceDTO | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    refreshExperiences()
  }, [refreshExperiences])

  const handleCreate = () => {
    setEditingExperience(null)
    setIsModalOpen(true)
  }

  const handleEdit = (experience: ExperienceDTO) => {
    setEditingExperience(experience)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this experience?')) {
      await deleteExperience(id)
    }
  }

  const handleSubmit = async (data: Omit<ExperienceDTO, 'EID'>) => {
    setIsSubmitting(true)
    try {
      if (editingExperience) {
        await updateExperience(editingExperience.EID, data)
      } else {
        await createExperience(data)
      }
      setIsModalOpen(false)
      setEditingExperience(null)
    } catch (error) {
      console.error('Error submitting experience:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingExperience(null)
  }

  if (loading && experiences.length === 0) {
    return (
      <div className="page-container">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Experience Management</h1>
        <Button 
          onClick={handleCreate}
          className="btn-primary"
        >
          Add New Experience
        </Button>
      </div>

      {error && (
        <ErrorMessage 
          message={error}
          onRetry={refreshExperiences}
        />
      )}

      <div className="content-section">
        {experiences.length === 0 && !loading ? (
          <div className="empty-state">
            <p>No experiences available.</p>
            <Button onClick={handleCreate} className="btn-primary">
              Add First Experience
            </Button>
          </div>
        ) : (
          <ExperienceTable
            experiences={experiences}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingExperience ? 'Edit Experience' : 'Add New Experience'}
      >
        <ExperienceForm
          experience={editingExperience}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  )
}