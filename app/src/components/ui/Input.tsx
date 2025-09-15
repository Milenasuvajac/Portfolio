'use client'

import { InputHTMLAttributes } from 'react'

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'className'> {
  label?: string
  error?: string
  onChange: (value: string) => void
  className?: string
}

export function Input({
  label,
  error,
  onChange,
  className = '',
  required,
  ...props
}: InputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const inputClasses = [
    'input__field',
    error && 'input__field--error',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className="input">
      {label && (
        <label className="input__label">
          {label}
          {required && <span className="input__required">*</span>}
        </label>
      )}
      <input
        className={inputClasses}
        onChange={handleChange}
        {...props}
      />
      {error && (
        <span className="input__error">{error}</span>
      )}
    </div>
  )
}