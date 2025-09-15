'use client'

import { UserDTO } from '@/dto/UserDTO'
import { Button } from './Button'
import { LoadingSpinner } from './LoadingSpinner'

interface UserTableProps {
  users: UserDTO[]
  onEdit: (user: UserDTO) => void
  onDelete: (userId: number) => void
  deletingUserId?: number | null
  className?: string
}

export function UserTable({
  users,
  onEdit,
  onDelete,
  deletingUserId,
  className = ''
}: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className={`user-table-empty ${className}`}>
        <p className="user-table-empty__message">No users found</p>
      </div>
    )
  }

  return (
    <div className={`user-table ${className}`}>
      <div className="user-table__container">
        <table className="user-table__table">
          <thead className="user-table__header">
            <tr>
              <th className="user-table__header-cell">ID</th>
              <th className="user-table__header-cell">Username</th>
              <th className="user-table__header-cell">Company</th>
              <th className="user-table__header-cell">Actions</th>
            </tr>
          </thead>
          <tbody className="user-table__body">
            {users.map((user) => (
              <tr key={user.UID} className="user-table__row">
                <td className="user-table__cell">
                  {user.UID}
                </td>
                <td className="user-table__cell">
                  <span className="user-table__username">
                    {user.username}
                  </span>
                </td>
                <td className="user-table__cell">
                  <span className="user-table__company">
                    {user.companyName || 'N/A'}
                  </span>
                </td>
                <td className="user-table__cell">
                  <div className="user-table__actions">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => onEdit(user)}
                      className="user-table__action-btn"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => user.UID && onDelete(user.UID)}
                      disabled={deletingUserId === user.UID}
                      className="user-table__action-btn"
                    >
                      {deletingUserId === user.UID ? (
                        <LoadingSpinner size="small" />
                      ) : (
                        'Delete'
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}