import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
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
  const [showFirstHint, setShowFirstHint] = useState(() => {
    const hasShownFirst = sessionStorage.getItem('fc-hints-first-shown') === 'true'
    return !hasShownFirst
  })
  const [showSecondHint, setShowSecondHint] = useState(false)
  const [secondHintState, setSecondHintState] = useState<'know' | 'learn'>('know')
  const [isFading, setIsFading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const cardInnerRef = useRef<HTMLDivElement>(null)
  
  const flipCard = () => {
    // Stop any running animations to ensure smooth transition
    if (cardInnerRef.current) {
      const cardInner = cardInnerRef.current
      cardInner.style.animation = 'none'
      // Force a reflow to ensure animation stops
      void cardInner.offsetHeight
      // Clear inline style after reflow so CSS can control transition
      requestAnimationFrame(() => {
        cardInner.style.animation = ''
      })
    }
    if (showFirstHint) {
      sessionStorage.setItem('fc-hints-first-shown', 'true')
    }
    setShowFirstHint(false)
    setShowSecondHint(false)
    setIsFlipped((prev) => !prev)
  }

  const triggerKnow = useCallback(() => {
    console.log('Know:', employee.name)
    if (showFirstHint) {
      sessionStorage.setItem('fc-hints-first-shown', 'true')
    }
    if (showSecondHint) {
      sessionStorage.setItem('fc-hints-second-shown', 'true')
    }
    setShowFirstHint(false)
    setShowSecondHint(false)
    setIsKnowAnimating(true)
    setSwipeDirection('right')
    // Wait for animation to complete before calling onKnow
    setTimeout(() => {
      onKnow() // Remove from rotation
      setSwipeDirection(null)
      setIsKnowAnimating(false)
    }, 500)
  }, [employee.name, onKnow, showFirstHint, showSecondHint])

  const triggerLearning = useCallback(() => {
    console.log('Learning:', employee.name)
    if (showFirstHint) {
      sessionStorage.setItem('fc-hints-first-shown', 'true')
    }
    if (showSecondHint) {
      sessionStorage.setItem('fc-hints-second-shown', 'true')
    }
    setShowFirstHint(false)
    setShowSecondHint(false)
    setIsLearningAnimating(true)
    setSwipeDirection('left')
    // Wait for animation to complete before calling onLearning
    setTimeout(() => {
      onLearning() // Keep in rotation and move to next
      setSwipeDirection(null)
      setIsLearningAnimating(false)
    }, 300)
  }, [employee.name, onLearning, showFirstHint, showSecondHint])

  const handleKnow = (e: React.MouseEvent) => {
    e.stopPropagation()
    triggerKnow()
  }

  const handleLearning = (e: React.MouseEvent) => {
    e.stopPropagation()
    triggerLearning()
  }

  // Hide hints when clicking outside the profile card wrapper
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        if (showFirstHint) {
          sessionStorage.setItem('fc-hints-first-shown', 'true')
        }
        if (showSecondHint) {
          sessionStorage.setItem('fc-hints-second-shown', 'true')
        }
        setShowFirstHint(false)
        setShowSecondHint(false)
      }
    }

    if (showFirstHint || showSecondHint) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showFirstHint, showSecondHint])

  // Show second hint after first hint is dismissed
  useEffect(() => {
    const hasShownSecond = sessionStorage.getItem('fc-hints-second-shown') === 'true'
    if (!hasShownSecond && !showFirstHint && !isFlipped) {
      // Small delay before showing second hint
      const timer = setTimeout(() => {
        setShowSecondHint(true)
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setShowSecondHint(false)
    }
  }, [showFirstHint, isFlipped])

  // Switch second hint state every 5 seconds with fade transition
  useEffect(() => {
    if (!showSecondHint) {
      return
    }

    const interval = setInterval(() => {
      setIsFading(true)
      // Change state after fade out
      setTimeout(() => {
        setSecondHintState((prev) => (prev === 'know' ? 'learn' : 'know'))
        setIsFading(false)
      }, 200) // Half of fade duration
    }, 5000) // 5000ms = 5 seconds

    return () => clearInterval(interval)
  }, [showSecondHint])

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
    <div className="profile-card-wrapper" ref={wrapperRef}>
      {showFirstHint && !isFlipped && (
        <div className="card-hint card-hint-first">
          <span className="hint-text">Tap to see more</span>
        </div>
      )}
      {showSecondHint && !isFlipped && (
        <div className={`card-hint card-hint-second ${secondHintState === 'know' ? 'hint-bump-right' : 'hint-bump-left'}`}>
          <span className="hint-text">
            <span className={`hint-content ${isFading ? 'hint-fade-out' : 'hint-fade-in'}`}>
              {secondHintState === 'know' ? (
                <>
                  If known
                  <svg 
                    className="hint-chevron" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </>
              ) : (
                <>
                  <svg 
                    className="hint-chevron" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                  If learning
                </>
              )}
            </span>
          </span>
        </div>
      )}
      <button
        type="button"
        className={`profile-card ${isFlipped ? 'is-flipped' : ''} ${swipeDirection ? `swipe-${swipeDirection}` : ''} ${showFirstHint && !isFlipped ? 'hint-flip' : ''}`}
        onClick={flipCard}
        aria-pressed={isFlipped}
        aria-label={`Flip profile card for ${employee.name}`}
      >
        <div className="card-inner" ref={cardInnerRef}>
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
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  // This ensures React can properly track hook order and state
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user is already authenticated in this session
    return sessionStorage.getItem('fc-faces-authenticated') === 'true'
  })

  // Menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Scroll collapse state
  const [isScrolled, setIsScrolled] = useState(false)

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
  // Initialize directly from availableEmployees to ensure content shows immediately after login
  const [activeEmployees, setActiveEmployees] = useState<EmployeeProfile[]>(availableEmployees)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Update active employees when availableEmployees changes (e.g., shortlist toggle)
  // This ensures proper sync when the available employees list changes
  useEffect(() => {
    setActiveEmployees(availableEmployees)
    setCurrentIndex(0)
  }, [availableEmployees])

  // Handle scroll to collapse header text
  useEffect(() => {
    let lastIsScrolled = false
    let rafId: number | null = null

    const handleScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId)
      }

      rafId = requestAnimationFrame(() => {
        const scrollY = window.scrollY || document.documentElement.scrollTop || 0
        const newIsScrolled = scrollY > 30
        
        if (newIsScrolled !== lastIsScrolled) {
          // Small delay to prevent jumping
          setTimeout(() => {
            setIsScrolled(newIsScrolled)
          }, 100)
          lastIsScrolled = newIsScrolled
        }
        rafId = null
      })
    }

    // Check initial scroll position
    const initialScrollY = window.scrollY || document.documentElement.scrollTop || 0
    if (initialScrollY > 30) {
      setIsScrolled(true)
      lastIsScrolled = true
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

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

  // Handler functions - defined after hooks but before conditional returns
  const handleLogin = () => {
    sessionStorage.setItem('fc-faces-authenticated', 'true')
    // Reset hint flags on login so hints show once per login session
    sessionStorage.removeItem('fc-hints-first-shown')
    sessionStorage.removeItem('fc-hints-second-shown')
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    // Clear authentication from sessionStorage
    sessionStorage.removeItem('fc-faces-authenticated')
    // Reset authentication state to show login screen
    setIsAuthenticated(false)
  }

  // Show login page if not authenticated
  // This conditional return is now AFTER all hooks
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

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

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
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
        
        {/* Menu Button */}
        <button
          type="button"
          className="menu-btn"
          onClick={toggleMenu}
          aria-label="Open menu"
          title="Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        {/* Bottom Menu Popup */}
        {isMenuOpen && (
          <>
            <div className="menu-overlay" onClick={closeMenu}></div>
            <div className="menu-popup">
              <div className="menu-popup-handle"></div>
              <div className="menu-popup-content">
                {activeEmployees.length > 0 && (
                  <div className="menu-navigation-controls">
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
                )}
                <button
                  type="button"
                  className={`shortlist-toggle ${isShortlistEnabled ? 'active' : ''}`}
                  onClick={() => {
                    toggleShortlist()
                    closeMenu()
                  }}
                  aria-label={isShortlistEnabled ? 'Disable shortlist' : 'Enable shortlist'}
                  title={isShortlistEnabled ? 'Show all employees' : 'Show shortlist only'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>{isShortlistEnabled ? 'Shortlist' : 'All'}</span>
                </button>
                <button
                  type="button"
                  className="logout-btn"
                  onClick={() => {
                    handleLogout()
                    closeMenu()
                  }}
                  aria-label="Logout"
                  title="Logout"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </>
        )}
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
        <div className={`hero-text-wrapper ${isScrolled ? 'collapsed' : ''}`}>
          <h2 className="hero-subtitle">Learn the faces that power FC</h2>
          <p className="hero-copy">
            Tap through profiles to match names, teams, and stories. Memorize your
            colleagues so the next hallway hello feels effortless.
          </p>
        </div>
      </header>

      <section className="cards-container">
        {activeEmployees.length > 0 ? (
          <>
            <div className="single-card-view">
              <ProfileCard
                key={activeEmployees[currentIndex].id}
                employee={activeEmployees[currentIndex]}
                onKnow={handleKnow}
                onLearning={handleLearning}
              />
            </div>

            <div className="card-progress">
              <span className="progress-text">
                {currentIndex + 1} / {activeEmployees.length}
              </span>
            </div>
          </>
        ) : (
          <div className="loading-state">
            <p>Loading profiles...</p>
          </div>
        )}

      </section>

      {/* Menu Button */}
      <button
        type="button"
        className="menu-btn"
        onClick={toggleMenu}
        aria-label="Open menu"
        title="Menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Bottom Menu Popup */}
      {isMenuOpen && (
        <>
          <div className="menu-overlay" onClick={closeMenu}></div>
          <div className="menu-popup">
              <div className="menu-popup-handle"></div>
              <div className="menu-popup-content">
                {activeEmployees.length > 0 && (
                  <div className="menu-navigation-controls">
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
                )}
                <button
                  type="button"
                  className={`shortlist-toggle ${isShortlistEnabled ? 'active' : ''}`}
                  onClick={() => {
                    toggleShortlist()
                    closeMenu()
                  }}
                  aria-label={isShortlistEnabled ? 'Disable shortlist' : 'Enable shortlist'}
                  title={isShortlistEnabled ? 'Show all employees' : 'Show shortlist only'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                  <span>{isShortlistEnabled ? 'Shortlist' : 'All'}</span>
                </button>
                <button
                  type="button"
                  className="logout-btn"
                  onClick={() => {
                    handleLogout()
                    closeMenu()
                  }}
                  aria-label="Logout"
                  title="Logout"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
          </div>
        </>
      )}
    </div>
  )
}

export default App
