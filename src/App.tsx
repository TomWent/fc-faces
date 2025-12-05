import { useState, useEffect, useMemo, useCallback } from 'react'
import confetti from 'canvas-confetti'
import './App.css'
import employeesData from './employees-data.json'
import shortlistData from './shortlist.json'
import Login from './Login'

type EmployeeProfile = {
  id: string
  name: string
  role: string
  team: string
  yearsAtFC: number
  office: string
  image: string
  endDate?: string
  born?: string
  livedIn?: string
  interests?: string
  funFacts?: string
}

const allEmployees: EmployeeProfile[] = (employeesData as EmployeeProfile[])
  // Omit anyone with an end date
  .filter((employee) => employee.endDate == null || employee.endDate === '')
  // Omit specific profiles
  .filter((employee) => employee.id !== 'felix-lepoutre')

const shortlistNames: string[] = shortlistData as string[]

function ProfileCard({
  employee,
  onKnow,
  onLearning
}: {
  employee: EmployeeProfile
  onKnow: () => void
  onLearning: () => void
}) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const [isLearningAnimating, setIsLearningAnimating] = useState(false)
  const [isKnowAnimating, setIsKnowAnimating] = useState(false)
  const flipCard = () => setIsFlipped((prev) => !prev)

  const triggerKnow = useCallback(() => {
    console.log('Know:', employee.name)
    setIsKnowAnimating(true)
    setSwipeDirection('right')
    // Wait for animation to complete before calling onKnow
    setTimeout(() => {
      onKnow() // Remove from rotation
      setSwipeDirection(null)
      setIsKnowAnimating(false)
    }, 500)
  }, [employee.name, onKnow])

  const triggerLearning = useCallback(() => {
    console.log('Learning:', employee.name)
    setIsLearningAnimating(true)
    setSwipeDirection('left')
    // Wait for animation to complete before calling onLearning
    setTimeout(() => {
      onLearning() // Keep in rotation and move to next
      setSwipeDirection(null)
      setIsLearningAnimating(false)
    }, 300)
  }, [employee.name, onLearning])

  const handleKnow = (e: React.MouseEvent) => {
    e.stopPropagation()
    triggerKnow()
  }

  const handleLearning = (e: React.MouseEvent) => {
    e.stopPropagation()
    triggerLearning()
  }

  // Keyboard shortcuts: A for left (learning), D for right (know)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return
      }

      // Prevent default only for our shortcut keys
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        triggerLearning()
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        triggerKnow()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [triggerKnow, triggerLearning])

  return (
    <div className="profile-card-wrapper">
      <button
        type="button"
        className={`profile-card ${isFlipped ? 'is-flipped' : ''} ${swipeDirection ? `swipe-${swipeDirection}` : ''}`}
        onClick={flipCard}
        aria-pressed={isFlipped}
        aria-label={`Flip profile card for ${employee.name}`}
      >
        <div className="card-inner">
          <article className="card-face card-front">
            <div className="front-photo">
              <img
                className="profile-photo"
                src={employee.image}
                alt={`${employee.name} portrait`}
                loading="lazy"
              />
            </div>
          </article>

          <article className="card-face card-back">
            <h3>{employee.name}</h3>
            <table className="profile-details">
              <tbody>
                {(employee.role != null && employee.role !== '') && (
                  <tr>
                    <td>Role</td>
                    <td>{employee.role}</td>
                  </tr>
                )}
                {(employee.team != null && employee.team !== '') && (
                  <tr>
                    <td>Team</td>
                    <td>{employee.team}</td>
                  </tr>
                )}
                {employee.yearsAtFC > 0 && (
                  <tr>
                    <td>Years @ FC</td>
                    <td>{employee.yearsAtFC}</td>
                  </tr>
                )}
                {(employee.office != null && employee.office !== '') && (
                  <tr>
                    <td>Office</td>
                    <td>{employee.office}</td>
                  </tr>
                )}
                {(employee.born != null && employee.born !== '') && (
                  <tr>
                    <td>Born</td>
                    <td>{employee.born}</td>
                  </tr>
                )}
                {(employee.livedIn != null && employee.livedIn !== '') && (
                  <tr>
                    <td>Lived In</td>
                    <td>{employee.livedIn}</td>
                  </tr>
                )}
                {(employee.interests != null && employee.interests !== '') && (
                  <tr>
                    <td>Interests</td>
                    <td>{employee.interests}</td>
                  </tr>
                )}
                {(employee.funFacts != null && employee.funFacts !== '') && (
                  <tr>
                    <td>Fun Facts</td>
                    <td>{employee.funFacts}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </article>
        </div>
      </button>

      <div className="card-actions">
        <button
          type="button"
          className="action-btn action-learning"
          onClick={handleLearning}
          aria-label="Mark as learning"
          title="Learning"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={isLearningAnimating ? 'learning-icon-animate' : ''}
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
        </button>
        <button
          type="button"
          className="action-btn action-know"
          onClick={handleKnow}
          aria-label="Mark as known"
          title="Know"
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={isKnowAnimating ? 'know-icon-animate' : ''}
          >
            <polyline 
              points="4 12 9 17 20 6"
              className={isKnowAnimating ? 'checkmark-path' : ''}
            ></polyline>
          </svg>
        </button>
      </div>
    </div>
  )
}

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user is already authenticated in this session
    return sessionStorage.getItem('fc-faces-authenticated') === 'true'
  })

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />
  }

  // Shortlist state
  const [isShortlistEnabled, setIsShortlistEnabled] = useState(false)
  
  // Get available employees based on shortlist state
  const availableEmployees = useMemo((): EmployeeProfile[] => {
    if (isShortlistEnabled) {
      return allEmployees.filter((employee) => 
        shortlistNames.some((name) => 
          employee.name.toLowerCase().includes(name.toLowerCase()) || 
          name.toLowerCase().includes(employee.name.toLowerCase())
        )
      )
    }
    return allEmployees
  }, [isShortlistEnabled])
  
  // Track which employees are still active in the rotation
  const [activeEmployees, setActiveEmployees] = useState<EmployeeProfile[]>(availableEmployees)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Update active employees when shortlist is toggled
  useEffect(() => {
    setActiveEmployees(availableEmployees)
    setCurrentIndex(0)
  }, [availableEmployees])

  // Trigger confetti when all profiles are known
  useEffect(() => {
    if (activeEmployees.length === 0) {
      // Full screen confetti celebration
      const duration = 3000 // 3 seconds
      const end = Date.now() + duration

      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE']

      const frame = () => {
        // Launch confetti from multiple points for full screen effect
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        })
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        })
        confetti({
          particleCount: 5,
          angle: 90,
          spread: 60,
          origin: { x: 0.5, y: 0 },
          colors: colors
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }

      frame()

      // Additional bursts from center
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.5, y: 0.5 },
          colors: colors
        })
      }, 500)

      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.5, y: 0.5 },
          colors: colors
        })
      }, 1500)
    }
  }, [activeEmployees.length])

  const handleKnow = () => {
    // Remove current employee from rotation
    const newActiveEmployees = activeEmployees.filter((_, index) => index !== currentIndex)
    setActiveEmployees(newActiveEmployees)

    // Adjust current index if needed
    if (newActiveEmployees.length > 0) {
      // If we removed the last card, go to the previous one
      if (currentIndex >= newActiveEmployees.length) {
        setCurrentIndex(newActiveEmployees.length - 1)
      }
      // Otherwise stay at the same index (which now shows the next card)
    } else {
      // No more cards left
      setCurrentIndex(0)
    }
  }

  const handleLearning = () => {
    // Keep in rotation and move to next card
    if (activeEmployees.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % activeEmployees.length)
    }
  }

  const goToNext = () => {
    if (activeEmployees.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % activeEmployees.length)
    }
  }

  const goToPrevious = () => {
    if (activeEmployees.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + activeEmployees.length) % activeEmployees.length)
    }
  }

  const handleRestart = () => {
    setActiveEmployees(availableEmployees)
    setCurrentIndex(0)
  }

  const toggleShortlist = () => {
    setIsShortlistEnabled((prev) => !prev)
  }

  // Show message when all cards are completed
  if (activeEmployees.length === 0) {
    return (
      <div className="app-shell">
        <header className="hero">
          <h1 className="app-title">
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
          <h2 className="hero-subtitle">🎉 All Done!</h2>
          <p className="hero-copy">
            You've learned all the faces! Great job memorizing your colleagues.
          </p>
          <button
            type="button"
            className="restart-btn"
            onClick={handleRestart}
            aria-label="Restart and practice again"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M3 21v-5h5"></path>
            </svg>
            Restart
          </button>
        </header>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <h1 className="app-title">
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
          <span className="title-row-bottom">
            <span className="fc-logo" aria-hidden="true" />
            <span className="sr-only">Fashion Cloud</span>
          </span>
        </h1>
        <h2 className="hero-subtitle">Learn the faces that power FC</h2>
        <p className="hero-copy">
          Tap through profiles to match names, teams, and stories. Memorize your
          colleagues so the next hallway hello feels effortless.
        </p>
      </header>

      <section className="cards-container">
        <div className="card-progress">
          <span className="progress-text">
            {currentIndex + 1} / {activeEmployees.length}
          </span>
        </div>

        <div className="single-card-view">
          <ProfileCard
            key={activeEmployees[currentIndex].id}
            employee={activeEmployees[currentIndex]}
            onKnow={handleKnow}
            onLearning={handleLearning}
          />
        </div>

        <div className="navigation-controls">
          <button
            type="button"
            className="nav-btn nav-prev"
            onClick={goToPrevious}
            aria-label="Previous card"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button
            type="button"
            className="nav-btn nav-next"
            onClick={goToNext}
            aria-label="Next card"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <div className="shortlist-control">
          <button
            type="button"
            className={`shortlist-toggle ${isShortlistEnabled ? 'active' : ''}`}
            onClick={toggleShortlist}
            aria-label={isShortlistEnabled ? 'Disable shortlist' : 'Enable shortlist'}
            title={isShortlistEnabled ? 'Show all employees' : 'Show shortlist only'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>{isShortlistEnabled ? 'Shortlist' : 'All'}</span>
          </button>
        </div>
      </section>
    </div>
  )
}

export default App
