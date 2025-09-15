'use client'

import React from 'react'
import { ExperienceDTO } from '@/dto/ExperienceDTO'
import { Button } from './Button'
import { LoadingSpinner } from './LoadingSpinner'

interface ExperienceTableProps {
  experiences: ExperienceDTO[]
  onEdit: (experience: ExperienceDTO) => void
  onDelete: (id: number) => void
  loading?: boolean
}

export const ExperienceTable: React.FC<ExperienceTableProps> = ({
  experiences,
  onEdit,
  onDelete,
  loading = false
}) => {
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Company</th>
            <th>Position Description</th>
            <th>Responsibilities</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && experiences.length === 0 ? (
            <tr>
              <td colSpan={5} className="loading-cell">
                <LoadingSpinner />
              </td>
            </tr>
          ) : experiences.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty-cell">
                No experiences found
              </td>
            </tr>
          ) : (
            experiences.map((experience) => (
              <tr key={experience.EID}>
                <td>{experience.EID}</td>
                <td>
                  <div className="cell-content">
                    <strong>{experience.company}</strong>
                  </div>
                </td>
                <td>
                  <div className="cell-content" title={experience.description}>
                    {truncateText(experience.description, 80)}
                  </div>
                </td>
                <td>
                  <div className="cell-content" title={experience.myResp}>
                    {truncateText(experience.myResp, 80)}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <Button
                      onClick={() => onEdit(experience)}
                      className="btn-edit"
                      size="small"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => onDelete(experience.EID)}
                      className="btn-delete"
                      size="small"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      {loading && experiences.length > 0 && (
        <div className="table-loading-overlay">
          <LoadingSpinner />
        </div>
      )}
    </div>
  )
}