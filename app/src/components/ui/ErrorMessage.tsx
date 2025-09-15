'use client'

import { Button } from './Button'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorMessage({ message, onRetry, className = '' }: ErrorMessageProps) {
  const classes = [
    'error-message',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <div className="error-message__content">
        <div className="error-message__icon">⚠️</div>
        <div className="error-message__text">
          <p className="error-message__title">Something went wrong</p>
          <p className="error-message__description">{message}</p>
        </div>
      </div>
      {onRetry && (
        <div className="error-message__actions">
          <Button variant="secondary" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}