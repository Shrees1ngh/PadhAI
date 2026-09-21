import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { useAuth } from '../features/auth/AuthContext'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronRight, User, ShieldCheck, LogOut, ChevronDown, Plus } from 'lucide-react'
import './Navbar.css'

gsap.registerPlugin(ScrollTrigger)

export default function Navbar({ currentView, onSwitchView, onToggleMobileSidebar }) {
  const { currentUser, isAuthenticated, logout, openAuthModal } = useAuth()
  const user = currentUser
  const navigate = useNavigate()
  const location = useLocation()
  
  const [navHidden, setNavHidden] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [portalContainer, setPortalContainer] = useState(null)

  const navRef = useRef(null)

  // Handle page routing navigation
  const handleNav = (href, viewId) => {
    setMobileOpen(false)
    if (onSwitchView && viewId) {
      onSwitchView(viewId)
    } else {
      navigate(href)
    }
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
        // Smart navbar hide on scroll down past 50px, reveal on scroll up or at top
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

  // Entrance slide animation on load
  useGSAP(() => {
    gsap.from(navRef.current, {
      y: -80,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    })
  }, { scope: navRef })

  // PadhAI Navigation Links
  const navLinks = [
    { label: 'Home', href: '/', id: 'home' },
    { label: 'Courses', href: '/my-learning', id: 'my-learning' },
    { label: 'Flashcards', href: '/flashcards', id: 'flashcards' },
    { label: 'Cheatsheets', href: '/cheatsheets', id: 'cheatsheets' },
    { label: 'Planner', href: '/planner', id: 'planner' },
    { label: 'Progress', href: '/progress', id: 'progress' },
  ]

  const isLinkActive = (link) => {
    if (location.pathname === link.href) return true
    if (link.href === '/my-learning' && ['/course-wizard', '/lessons', '/quiz'].includes(location.pathname)) return true
    if (currentView && currentView === link.id) return true
    return false
  }

  return (
    <>
      <nav
        ref={navRef}
        className={`navbar ${navHidden ? 'hidden' : ''}`}
      >
        <div className="nav-container">
          {/* Left Side: Brand Logo (PadhAI, Clean, No Chip Tags) */}
          <div className="nav-left">
            <button onClick={() => handleNav('/', 'home')} className="nav-logo" aria-label="Go to home">
              <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-cyan-500/20 shrink-0 border border-cyan-500/30 bg-gradient-to-br from-white/10 via-cyan-500/10 to-transparent flex items-center justify-center p-1.5 transition-transform hover:scale-105">
                <img 
                  src="/logo.svg" 
                  alt="PadhAI Logo" 
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(6,182,212,0.4)]" 
                />
              </div>
              <span className="text-xl font-black tracking-tight text-white select-none">
                Padh<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">AI</span>
              </span>
            </button>
          </div>

          {/* Center Side: Floating Pill Links Capsule */}
          <div className="nav-center">
            <div className="main-links">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNav(link.href, link.id)}
                  className={`nav-link ${isLinkActive(link) ? 'active' : ''}`}
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
                  className="flex items-center justify-center h-9 px-3.5 rounded-xl text-xs font-semibold text-[#8a8faa] hover:text-white hover:bg-white/[0.04] transition-all whitespace-nowrap cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="group flex items-center justify-center gap-1.5 px-5 h-9 rounded-full bg-gradient-to-r from-[#00f5ff] to-[#38bdf8] hover:from-[#7dd3fc] hover:to-[#00f5ff] text-[#020617] text-xs font-black transition-all duration-300 shadow-[0_0_22px_rgba(0,245,255,0.45)] hover:shadow-[0_0_30px_rgba(0,245,255,0.7)] hover:scale-105 whitespace-nowrap cursor-pointer"
                >
                  <span>Sign Up</span>
                  <ChevronRight size={13} strokeWidth={3} className="text-[#020617] group-hover:translate-x-0.5 transition-transform duration-300" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {/* New Course Action Pill */}
                <button
                  onClick={() => handleNav('/course-wizard', 'course-wizard')}
                  className="hidden sm:flex items-center justify-center gap-1.5 px-4 h-9 rounded-full bg-gradient-to-r from-[#00f5ff] to-[#38bdf8] hover:from-[#7dd3fc] hover:to-[#00f5ff] text-[#020617] text-xs font-black transition-all duration-300 shadow-[0_0_20px_rgba(0,245,255,0.35)] hover:shadow-[0_0_28px_rgba(0,245,255,0.6)] hover:scale-105 whitespace-nowrap cursor-pointer"
                >
                  <Plus size={13} strokeWidth={3} className="text-[#020617]" />
                  <span>New Course</span>
                  <ChevronRight size={13} strokeWidth={3} className="text-[#020617]" />
                </button>

                {/* User Dropdown Pill */}
                <div className="relative group">
                  <button className="flex items-center gap-2.5 px-3.5 h-10 rounded-full bg-[#080c14] border border-white/20 hover:bg-[#0e1422] hover:border-white/30 transition-all text-xs font-bold text-white shadow-xl cursor-pointer">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name || 'User'} className="w-6 h-6 rounded-full object-cover border border-cyan-400/50" />
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-gradient-to-r from-[#00f5ff] to-[#0284c7] flex items-center justify-center text-[10px] font-black uppercase text-[#020617] shadow-md shrink-0">
                        {(user.name || user.email || 'U').charAt(0)}
                      </span>
                    )}
                    <span className="font-bold text-white tracking-wide text-xs max-w-[100px] truncate">
                      {user.name ? user.name.split(' ')[0] : (user.email ? user.email.split('@')[0] : 'Account')}
                    </span>
                    <ChevronDown size={13} className="text-white/70 group-hover:text-white transition-transform duration-200 group-hover:rotate-180" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#080c14]/95 backdrop-blur-2xl border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.9)] p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-50">
                    <div className="px-3 py-2.5 border-b border-white/10 mb-1.5 bg-white/[0.03] rounded-xl">
                      <p className="text-[9px] text-[#8a8faa] font-bold uppercase tracking-wider">Signed in as</p>
                      <p className="text-xs font-bold text-white truncate mt-0.5">{user.email}</p>
                    </div>
                    <button
                      onClick={() => handleNav('/progress', 'progress')}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl text-white hover:bg-white/10 text-xs font-bold transition-colors cursor-pointer mb-1"
                    >
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                        <User size={13} className="text-indigo-400" />
                      </div>
                      <span>Learning Profile</span>
                    </button>
                    <button
                      onClick={() => handleNav('/settings', 'settings')}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl text-cyan-300 hover:bg-cyan-500/10 text-xs font-bold transition-colors cursor-pointer mb-1"
                    >
                      <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                        <ShieldCheck size={13} className="text-cyan-400" />
                      </div>
                      <span>Settings & API</span>
                    </button>
                    <button
                      onClick={() => {
                        logout()
                      }}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
                        <LogOut size={13} className="text-rose-400" />
                      </div>
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
              onClick={() => handleNav(link.href, link.id)}
              style={{ '--i': index }}
              className={`nav-link ${isLinkActive(link) ? 'active' : ''}`}
            >
              <span className="nav-text">{link.label}</span>
            </button>
          ))}
          
          {/* User Profile / Auth Links for Mobile */}
          <div className="w-[80%] h-px bg-white/10 my-2"></div>
          
          {isAuthenticated && user ? (
            <div className="flex flex-col items-center w-full gap-5 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
              <div className="text-center">
                <p className="text-[10px] text-[#8a8faa] uppercase tracking-wide">Signed in as</p>
                <p className="text-sm font-semibold text-white truncate max-w-[250px] mt-1">{user.email}</p>
              </div>
              
              <button
                onClick={() => handleNav('/course-wizard', 'course-wizard')}
                className="text-base font-bold text-cyan-300 hover:text-cyan-200 uppercase tracking-wider transition-colors flex items-center gap-2"
              >
                <Plus size={16} /> Create Course
              </button>

              <button
                onClick={() => handleNav('/progress', 'progress')}
                className="text-base font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider transition-colors flex items-center gap-2"
              >
                <User size={16} /> Learning Profile
              </button>
              
              <button
                onClick={() => handleNav('/settings', 'settings')}
                className="text-base font-bold text-slate-300 hover:text-white uppercase tracking-wider transition-colors flex items-center gap-2"
              >
                <ShieldCheck size={16} /> Settings
              </button>
              
              <button
                onClick={() => {
                  setMobileOpen(false)
                  logout()
                }}
                className="text-base font-bold text-rose-400 hover:text-rose-300 uppercase tracking-wider transition-colors flex items-center gap-2"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full gap-5 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
              <button
                onClick={() => {
                  setMobileOpen(false)
                  openAuthModal('login')
                }}
                className="text-lg font-bold text-white/70 hover:text-white uppercase tracking-wider transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileOpen(false)
                  openAuthModal('signup')
                }}
                className="text-lg font-bold text-[#00d4ff] hover:text-[#7dd3fc] uppercase tracking-wider transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>,
        portalContainer
      )}
    </>
  )
}
