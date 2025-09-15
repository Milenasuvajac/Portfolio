'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import '../../../users.css'
import { UserDTO } from '@/dto/UserDTO'
import { UserTable } from '@/components/ui/UserTable'
import { UserForm } from '@/components/ui/UserForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useUsers } from '@/hooks/useUsers'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

export default function UsersPage() {
  const {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers
  } = useUsers()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  useEffect(() => {
    refreshUsers()
  }, [])

  const handleCreateUser = () => {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const handleEditUser = (user: UserDTO) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setIsDeleting(userId)
      try {
        await deleteUser(userId)
      } finally {
        setIsDeleting(null)
      }
    }
  }

  const handleFormSubmit = async (userData: Partial<UserDTO>) => {
    try {
      if (editingUser) {
        await updateUser(editingUser.UID!, userData)
      } else {
        await createUser(userData)
      }
      setIsModalOpen(false)
      setEditingUser(null)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  if (loading) {
    return (
      <div className="users-page">
        <div className="users-page__header">
          <h1 className="users-page__title">User Management</h1>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="users-page">
        <div className="users-page__header">
          <h1 className="users-page__title">User Management</h1>
        </div>
        <ErrorMessage message={error} onRetry={refreshUsers} />
      </div>
    )
  }

  return (
    <div className="users-page">
      <div className="users-page__header">
        <div className="admin-header-nav">
          <Link href="/admin" className="admin-back-button">
            ← Back to Admin Dashboard
          </Link>
        </div>
        <h1 className="users-page__title">User Management</h1>
        <Button
          variant="primary"
          onClick={handleCreateUser}
          className="users-page__create-btn"
        >
          Create New User
        </Button>
      </div>

      <div className="users-page__content">
        <UserTable
          users={users}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          deletingUserId={isDeleting}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingUser ? 'Edit User' : 'Create New User'}
      >
        <UserForm
          user={editingUser}
          onSubmit={handleFormSubmit}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  )
}