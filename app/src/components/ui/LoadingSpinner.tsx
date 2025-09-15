'use client'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export function LoadingSpinner({ size = 'medium', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'spinner--small',
    medium: 'spinner--medium',
    large: 'spinner--large'
  }

  const classes = [
    'spinner',
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      <div className="spinner__circle"></div>
    </div>
  )
}