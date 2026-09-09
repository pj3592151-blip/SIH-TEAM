import React, { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'

export function PasswordInput({ value, onChange, placeholder = 'Enter your password', disabled = false, error = false, id = 'password-input' }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={`auth-input-wrapper ${error ? 'has-error' : ''}`}>
      <Lock className="input-icon left-icon" size={18} aria-hidden="true" />
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="auth-input"
        autoComplete="current-password"
        required
      />
      <button
        type="button"
        className="input-action-btn"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        tabIndex={0}
      >
        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  )
}
