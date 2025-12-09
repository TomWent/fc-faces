import { useState, useEffect, type FormEvent } from 'react'
import './Login.css'

// Hash of the password (SHA-256) - prevents plain text exposure in source code
// This is still visible in the bundle, but better than plain text
// For production, consider using a backend API for authentication
// Password has been changed from the default - contact admin for access
const PASSWORD_HASH = 'b112c32a81545372dbc454f77e1d912024b26022799e04043a4f149dabb8e6cf' // SHA-256 hash

// Rate limiting: track failed attempts
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes in milliseconds
const ATTEMPTS_KEY = 'fc-faces-login-attempts'
const LOCKOUT_KEY = 'fc-faces-login-lockout'

// Hash function using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

function Login({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLockedOut, setIsLockedOut] = useState(false)
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0)

  // Check for lockout on mount
  useEffect(() => {
    const checkLockout = () => {
      const lockoutUntil = localStorage.getItem(LOCKOUT_KEY)
      if (lockoutUntil) {
        const lockoutTime = parseInt(lockoutUntil, 10)
        const now = Date.now()
        if (now < lockoutTime) {
          setIsLockedOut(true)
          const remaining = Math.ceil((lockoutTime - now) / 1000 / 60) // minutes
          setLockoutTimeRemaining(remaining)
          
          // Update countdown
          const interval = setInterval(() => {
            const remaining = Math.ceil((lockoutTime - Date.now()) / 1000 / 60)
            if (remaining <= 0) {
              setIsLockedOut(false)
              setLockoutTimeRemaining(0)
              localStorage.removeItem(LOCKOUT_KEY)
              localStorage.removeItem(ATTEMPTS_KEY)
              clearInterval(interval)
            } else {
              setLockoutTimeRemaining(remaining)
            }
          }, 60000) // Update every minute
          
          return () => clearInterval(interval)
        } else {
          // Lockout expired
          localStorage.removeItem(LOCKOUT_KEY)
          localStorage.removeItem(ATTEMPTS_KEY)
        }
      }
    }
    
    checkLockout()
    const interval = setInterval(checkLockout, 1000) // Check every second
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (isLockedOut) {
      setError(`Too many failed attempts. Please try again in ${lockoutTimeRemaining} minute(s).`)
      return
    }
    
    setError('')
    setIsSubmitting(true)

    // Progressive delay based on failed attempts
    const attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10)
    const delay = Math.min(300 + (attempts * 200), 2000) // 300ms to 2000ms
    await new Promise(resolve => setTimeout(resolve, delay))

    try {
      // Hash the input password and compare with stored hash
      const inputHash = await hashPassword(password)
      
      if (inputHash === PASSWORD_HASH) {
        // Successful login - clear failed attempts
        localStorage.removeItem(ATTEMPTS_KEY)
        localStorage.removeItem(LOCKOUT_KEY)
        
        // Store authentication in sessionStorage
        sessionStorage.setItem('fc-faces-authenticated', 'true')
        onLogin()
      } else {
        // Failed attempt
        const newAttempts = attempts + 1
        localStorage.setItem(ATTEMPTS_KEY, newAttempts.toString())
        
        if (newAttempts >= MAX_ATTEMPTS) {
          // Lockout user
          const lockoutUntil = Date.now() + LOCKOUT_DURATION
          localStorage.setItem(LOCKOUT_KEY, lockoutUntil.toString())
          setIsLockedOut(true)
          setLockoutTimeRemaining(Math.ceil(LOCKOUT_DURATION / 1000 / 60))
          setError(`Too many failed attempts. Account locked for 15 minutes.`)
        } else {
          const remaining = MAX_ATTEMPTS - newAttempts
          setError(`Incorrect password. ${remaining} attempt(s) remaining.`)
        }
        setPassword('')
        setIsSubmitting(false)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
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
              disabled={isSubmitting || isLockedOut}
              autoComplete="current-password"
            />
            {error && <div className="error-message" role="alert">{error}</div>}
            {isLockedOut && (
              <div className="error-message" role="alert">
                Account locked. Please try again in {lockoutTimeRemaining} minute(s).
              </div>
            )}
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isSubmitting || !password.trim() || isLockedOut}
          >
            {isSubmitting ? 'Verifying...' : isLockedOut ? 'Locked' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login

