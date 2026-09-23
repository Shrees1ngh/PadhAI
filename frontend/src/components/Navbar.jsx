import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { useAuth } from '../features/auth/AuthContext'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronRight, User, ShieldCheck, LogOut, ChevronDown } from 'lucide-react'
import './Navbar.css'

gsap.registerPlugin(ScrollTrigger)

export default function Navbar() {
  const { currentUser, isAuthenticated, logout, openAuthModal } = useAuth()
  const user = currentUser
  const navigate = useNavigate()
  const location = useLocation()
  
  const [navHidden, setNavHidden] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [portalContainer, setPortalContainer] = useState(null)

  const navRef = useRef(null)

  // Handle page routing navigation
  const handleNav = (href) => {
    setMobileOpen(false)
    navigate(href)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Create Portal target on mount
  useEffect(() => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    setPortalContainer(el)
    return () => {
      if (document.body.contains(el)) {
        document.body.removeChild(el)
      }
    }
  }, [])

  // Scroll tracking with GSAP + ScrollTrigger
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      start: "top+=50 top",
      onUpdate: (self) => {
        if (self.direction === 1 && self.scroll() > 60) {
          setNavHidden(true)
        } else if (self.direction === -1 || self.scroll() <= 30) {
          setNavHidden(false)
        }
      }
    })

    return () => {
      trigger.kill()
    }
  }, [])

  // Entrance slide animation removed to prevent stuck opacity:0 or y:-80

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Courses', href: '/my-learning' },
    { label: 'Flashcards', href: '/flashcards' },
    { label: 'Cheatsheets', href: '/cheatsheets' },
    { label: 'Planner', href: '/planner' },
    { label: 'Progress', href: '/progress' },
  ]

  const isLinkActive = (href) => {
    if (location.pathname === href) return true
    if (href === '/my-learning' && ['/course-wizard', '/lessons', '/quiz'].includes(location.pathname)) return true
    return false
  }

  return (
    <>
      <nav
        ref={navRef}
        className={`navbar ${navHidden ? 'hidden' : ''}`}
      >
        <div className="nav-container">
          {/* Left Side: Logo */}
          <div className="nav-left">
            <button onClick={() => handleNav('/')} className="nav-logo" aria-label="Go to home">
              <div className="relative group flex items-center gap-2">
                <div className="w-8 h-8 rounded-md overflow-hidden shrink-0 border border-[#30363d] bg-[#161b22] flex items-center justify-center p-1.5 transition-opacity hover:opacity-80">
                  <img 
                    src="/logo.svg" 
                    alt="PadhAI Logo" 
                    className="w-full h-full object-contain" 
                  />
                </div>
                <span className="text-base font-bold tracking-tight text-[#e6edf3] select-none">
                  Padh<span className="text-[#58a6ff]">AI</span>
                </span>
              </div>
            </button>
          </div>

          {/* Center Side: Pill Links */}
          <div className="nav-center">
            <div className="main-links">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNav(link.href)}
                  className={`nav-link ${isLinkActive(link.href) ? 'active' : ''}`}
                >
                  <span className="nav-text">{link.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: CTAs & Hamburger Toggle */}
          <div className="nav-right">
            {!isAuthenticated || !user ? (
              <>
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex items-center justify-center h-8 px-3 rounded-md text-sm font-semibold text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] border border-transparent hover:border-[#30363d] transition-all whitespace-nowrap cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="group flex items-center justify-center gap-1.5 px-4 h-8 rounded-md bg-[#1f6feb] hover:bg-[#388bfd] text-white text-sm font-semibold transition-all whitespace-nowrap cursor-pointer border border-[rgba(240,246,252,0.1)]"
                >
                  <span>Sign Up</span>
                  <ChevronRight size={12} strokeWidth={2.5} className="text-white group-hover:translate-x-0.5 transition-transform" />
                </button>
              </>
            ) : (
              <div className="relative group">
                <button className="flex items-center gap-2 px-2.5 h-8 rounded-md bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] hover:border-[#8b949e] transition-all text-sm font-semibold text-[#e6edf3] cursor-pointer">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name || 'User'} className="w-5 h-5 rounded-full object-cover border border-[#30363d]" />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-[#1f6feb] flex items-center justify-center text-sm font-bold uppercase text-white shrink-0">
                      {(user.name || user.email || 'U').charAt(0)}
                    </span>
                  )}
                  <span className="font-semibold text-[#e6edf3] text-sm max-w-[90px] truncate">{user.name ? user.name.split(' ')[0] : 'Account'}</span>
                  <ChevronDown size={12} className="text-[#8b949e] group-hover:text-[#e6edf3] transition-transform duration-200 group-hover:rotate-180" />
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-1 w-48 rounded-md bg-[#161b22] border border-[#30363d] shadow-[0_8px_24px_rgba(1,4,9,0.9)] p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 transform translate-y-0.5 group-hover:translate-y-0 z-50">
                  <div className="px-3 py-2 border-b border-[#21262d] mb-1">
                    <p className="text-sm text-[#6e7681] font-medium">Signed in as</p>
                    <p className="text-sm font-semibold text-[#e6edf3] truncate mt-0.5">{user.email}</p>
                  </div>
                  <button
                    onClick={() => handleNav('/progress')}
                    className="flex items-center gap-2 w-full text-left px-3 py-1.5 rounded text-[#e6edf3] hover:bg-[#1f6feb] text-sm font-medium transition-colors cursor-pointer"
                  >
                    <User size={12} className="text-[#8b949e]" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => handleNav('/settings')}
                    className="flex items-center gap-2 w-full text-left px-3 py-1.5 rounded text-[#e6edf3] hover:bg-[#1f6feb] text-sm font-medium transition-colors cursor-pointer"
                  >
                    <ShieldCheck size={12} className="text-[#8b949e]" />
                    <span>Settings</span>
                  </button>
                  <div className="border-t border-[#21262d] mt-1 pt-1">
                  <button
                    onClick={() => { logout() }}
                    className="flex items-center gap-2 w-full text-left px-3 py-1.5 rounded text-[#f85149] hover:bg-[#f8514915] text-sm font-medium transition-colors cursor-pointer"
                  >
                    <LogOut size={12} className="text-[#f85149]" />
                    <span>Sign Out</span>
                  </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button 
              className="hamburger-menu" 
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <span className={`hamburger-line ${mobileOpen ? 'open' : ''}`}></span>
              <span className={`hamburger-line ${mobileOpen ? 'open' : ''}`}></span>
              <span className={`hamburger-line ${mobileOpen ? 'open' : ''}`}></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Fullscreen Mobile Overlay (rendered via portal for clean stacking context) */}
      {(portalContainer && mobileOpen) && createPortal(
        <div className="main-links mobile-open" role="menu">
          {navLinks.map((link, index) => (
            <button
              key={link.label}
              onClick={() => handleNav(link.href)}
              style={{ '--i': index }}
              className={`nav-link ${isLinkActive(link.href) ? 'active' : ''}`}
            >
              <span className="nav-text">{link.label}</span>
            </button>
          ))}
          
          {/* User Profile / Auth Links for Mobile */}
          <div className="w-[80%] h-px bg-white/10 my-2"></div>
          
          {isAuthenticated && user ? (
            <div className="flex flex-col items-center w-full gap-4" style={{ animationDelay: '0.35s' }}>
              <div className="text-center">
                <p className="text-sm text-[#6e7681] uppercase tracking-wider">Signed in as</p>
                <p className="text-sm font-semibold text-[#e6edf3] truncate max-w-[250px] mt-1">{user.email}</p>
              </div>
              
              <button
                onClick={() => handleNav('/progress')}
                className="text-base font-semibold text-[#8b949e] hover:text-[#e6edf3] transition-colors flex items-center gap-2"
              >
                <User size={16} /> Profile
              </button>
              
              <button
                onClick={() => handleNav('/settings')}
                className="text-base font-semibold text-[#8b949e] hover:text-[#e6edf3] transition-colors"
              >
                Settings
              </button>
              
              <button
                onClick={() => { setMobileOpen(false); logout() }}
                className="text-base font-semibold text-[#f85149] hover:text-[#ff7b72] transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full gap-4" style={{ animationDelay: '0.35s' }}>
              <button
                onClick={() => { setMobileOpen(false); openAuthModal('login') }}
                className="text-base font-semibold text-[#8b949e] hover:text-[#e6edf3] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => { setMobileOpen(false); openAuthModal('signup') }}
                className="px-8 py-2 rounded-md bg-[#1f6feb] hover:bg-[#388bfd] text-white text-base font-semibold transition-colors"
              >
                Sign Up Free
              </button>
            </div>
          )}
        </div>,
        portalContainer
      )}
    </>
  )
}
