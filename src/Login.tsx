import { useState, type FormEvent } from 'react'
import './Login.css'

const CORRECT_PASSWORD = import.meta.env.VITE_APP_PASSWORD || 'fc2024'

function Login({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    // Small delay to prevent brute force attempts
    await new Promise(resolve => setTimeout(resolve, 300))

    if (password === CORRECT_PASSWORD) {
      // Store authentication in sessionStorage
      sessionStorage.setItem('fc-faces-authenticated', 'true')
      
      // Set auth token for API requests (protected images)
      // Only in production - API routes aren't available in Vite dev mode
      if (!import.meta.env.DEV) {
        try {
          await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authenticated: true })
          })
        } catch (err) {
          console.error('Failed to set auth cookie:', err)
          // Continue anyway - sessionStorage is still set
        }
      }
      
      onLogin()
    } else {
      setError('Incorrect password. Please try again.')
      setPassword('')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">
            <div className="title-row-top-wrapper">
              <span className="title-row-top">
                <span>F<span className="lowercase-match">a</span>CES OF</span>
              </span>
              <div className="fc-logo-wrapper">
                <img 
                  src="/fc-logo-copy.png" 
                  alt="Fashion Cloud" 
                  className="fc-logo-copy"
                />
              </div>
            </div>
          </h1>
          <h2 className="login-subtitle">Enter password to continue</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              placeholder="Enter password"
              className="password-input"
              autoFocus
              disabled={isSubmitting}
              autoComplete="current-password"
            />
            {error && <div className="error-message" role="alert">{error}</div>}
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isSubmitting || !password.trim()}
          >
            {isSubmitting ? 'Verifying...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login

