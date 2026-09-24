import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { useAuth } from '../features/auth/AuthContext'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronRight, User, ShieldCheck, LogOut, ChevronDown, Settings } from 'lucide-react'
import GradientText from './GradientText'
import './Navbar.css'

gsap.registerPlugin(ScrollTrigger)

export default function Navbar({ currentView, onSwitchView }) {
  const { currentUser, logout, openAuthModal } = useAuth()
  const user = currentUser
  const navigate = useNavigate()
  const location = useLocation()
  
  const [navHidden, setNavHidden] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [portalContainer] = useState(() => (typeof document !== 'undefined' ? document.body : null))


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

  // Scroll tracking with GSAP + ScrollTrigger
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      start: "top+=50 top",
      onUpdate: (self) => {
        if (self.scroll() > 50) {
          setNavHidden(true)
        } else {
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
    if (navRef.current) {
      gsap.from(navRef.current, {
        y: -80,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        clearProps: 'transform,opacity'
      })
    }
  }, { scope: navRef })

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
    if (link.id && currentView === link.id) return true
    if (link.href === '/my-learning' && ['/course-wizard', '/lessons', '/quiz'].includes(location.pathname)) return true
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
            <button 
              onClick={() => handleNav('/')} 
              className="nav-logo" 
              aria-label="Go to home"
            >
              <div className="relative group flex items-center gap-3">
                <img 
                  src="/versionB.svg" 
                  alt="PadhAI Logo" 
                  className="h-11 sm:h-12 w-auto object-contain filter drop-shadow-[0_0_16px_rgba(0,245,255,0.4)] group-hover:scale-105 group-hover:drop-shadow-[0_0_25px_rgba(0,245,255,0.75)] transition-all duration-300 shrink-0" 
                />
                <span 
                  className="inline-flex items-center text-2xl sm:text-[27px] font-black tracking-[-0.03em] select-none transition-transform duration-300 group-hover:scale-[1.02]" 
                  style={{ fontFamily: "'Plus Jakarta Sans', 'Outfit', system-ui, sans-serif" }}
                >
                  <span className="text-white">Padh</span>
                  <GradientText
                    colors={["#00f5ff", "#38bdf8", "#818cf8", "#40ffaa", "#00f5ff"]}
                    animationSpeed={3}
                    showBorder={false}
                    className="inline-flex font-black tracking-[-0.03em] drop-shadow-[0_0_16px_rgba(0,245,255,0.6)]"
                  >
                    AI
                  </GradientText>
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
                  onClick={() => handleNav(link.href, link.id)}
                  className={`nav-link ${isLinkActive(link) ? 'active' : ''}`}
                >
                  <span className="nav-text">{link.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Side: CTAs & Hamburger Toggle */}
          <div className="nav-right flex items-center gap-3">

            {!user ? (
              <>
                <button
                  onClick={() => handleNav('/settings', 'settings')}
                  className="h-10 w-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-[#8a8faa] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0"
                  title="Settings & API Key"
                  aria-label="Settings"
                >
                  <Settings size={17} />
                </button>
                <button
                  onClick={() => (openAuthModal ? openAuthModal('login') : navigate('/signin'))}
                  className="h-10 px-4 rounded-xl text-sm font-semibold text-[#8a8faa] hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all whitespace-nowrap cursor-pointer flex items-center justify-center shrink-0"
                >
                  Sign In
                </button>
                <button
                  onClick={() => (openAuthModal ? openAuthModal('signup') : navigate('/signup'))}
                  className="group h-10 px-5 rounded-xl bg-gradient-to-r from-[#00f5ff] to-[#38bdf8] hover:from-[#7dd3fc] hover:to-[#00f5ff] text-[#020617] text-sm font-black transition-all duration-300 shadow-[0_0_22px_rgba(0,245,255,0.45)] hover:shadow-[0_0_30px_rgba(0,245,255,0.7)] whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                >
                  <span>Sign Up</span>
                  <ChevronRight size={14} strokeWidth={3} className="text-[#020617] group-hover:translate-x-0.5 transition-transform duration-300" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNav('/settings', 'settings')}
                  className="h-10 w-10 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-[#8a8faa] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0"
                  title="Settings & API Key"
                  aria-label="Settings"
                >
                  <Settings size={17} />
                </button>
                <div className="relative group">
                  <button className="flex items-center gap-2.5 px-3.5 h-10 rounded-xl bg-[#080c14] border border-white/20 hover:bg-[#0e1422] hover:border-white/30 transition-all text-xs font-bold text-white shadow-xl cursor-pointer">
                    <span className="w-6.5 h-6.5 rounded-full bg-gradient-to-r from-[#00f5ff] to-[#0284c7] flex items-center justify-center text-[10px] font-black uppercase text-[#020617] shadow-md shrink-0">
                      {(user.fullName || user.username || user.name || 'U').charAt(0)}
                    </span>
                    <span className="font-bold text-white tracking-wide text-xs">{user.fullName || user.username || user.name}</span>
                    <ChevronDown size={13} className="text-white/70 group-hover:text-white transition-transform duration-200 group-hover:rotate-180" />
                  </button>
                
                {/* Dropdown Menu - Opaque dark container */}
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#080c14] border border-white/20 shadow-[0_10px_40px_rgba(0,0,0,0.9)] p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 z-50">
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
                    <span>Profile</span>
                  </button>
                  {user.isAdmin && (
                    <button
                      onClick={() => handleNav('/admin')}
                      className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl text-[#00f5ff] hover:bg-[#00f5ff]/10 text-xs font-bold transition-colors cursor-pointer mb-1"
                    >
                      <div className="w-6 h-6 rounded-lg bg-[#00f5ff]/20 border border-[#00f5ff]/30 flex items-center justify-center shrink-0">
                        <ShieldCheck size={13} className="text-[#00f5ff]" />
                      </div>
                      <span>Admin Dashboard</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleNav('/settings', 'settings')}
                    className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl text-cyan-300 hover:bg-cyan-500/10 text-xs font-bold transition-colors cursor-pointer mb-1"
                  >
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                      <ShieldCheck size={13} className="text-cyan-400" />
                    </div>
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={logout}
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
          
          {user ? (
            <div className="flex flex-col items-center w-full gap-5 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
              <div className="text-center">
                <p className="text-[10px] text-[#8a8faa] uppercase tracking-wide">Signed in as</p>
                <p className="text-sm font-semibold text-white truncate max-w-[250px] mt-1">{user.email}</p>
              </div>
              
              <button
                onClick={() => handleNav('/progress', 'progress')}
                className="text-lg font-bold text-purple-400 hover:text-purple-300 uppercase tracking-wider transition-colors flex items-center gap-2"
              >
                <User size={18} /> Profile
              </button>
              
              {user.isAdmin && (
                <button
                  onClick={() => handleNav('/admin')}
                  className="text-lg font-bold text-[#00d4ff]/80 hover:text-[#00d4ff] uppercase tracking-wider transition-colors"
                >
                  Admin Dashboard
                </button>
              )}

              <button
                onClick={() => handleNav('/settings', 'settings')}
                className="text-lg font-bold text-cyan-400/80 hover:text-cyan-300 uppercase tracking-wider transition-colors flex items-center gap-2"
              >
                <ShieldCheck size={18} /> Settings
              </button>
              
              <button
                onClick={() => {
                  setMobileOpen(false)
                  logout()
                }}
                className="text-lg font-bold text-rose-400/80 hover:text-rose-400 uppercase tracking-wider transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full gap-5 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
              <button
                onClick={() => {
                  setMobileOpen(false)
                  if (openAuthModal) openAuthModal('login')
                  else navigate('/signin')
                }}
                className="text-lg font-bold text-white/70 hover:text-white uppercase tracking-wider transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileOpen(false)
                  if (openAuthModal) openAuthModal('signup')
                  else navigate('/signup')
                }}
                className="text-lg font-bold text-[#00d4ff]/80 hover:text-[#00d4ff] uppercase tracking-wider transition-colors"
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
