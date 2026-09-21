import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  BookOpen, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  Plus,
  Compass,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';

export const Navbar = ({ 
  activeCourse, 
  currentView = 'home', 
  onSwitchView, 
  onToggleMobileSidebar 
}) => {
  const { currentUser, isAuthenticated, logout, openAuthModal } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Central floating island navigation tabs
  const navTabs = [
    { id: 'home', label: 'Home' },
    { id: 'my-learning', label: 'Courses' },
    { id: 'flashcards', label: 'Flashcards' },
    { id: 'cheatsheets', label: 'Cheatsheets' },
    { id: 'planner', label: 'Planner' },
    { id: 'progress', label: 'Progress' }
  ];

  // Map sub-views (like quiz, lessons, roadmap) to 'my-learning'
  const isTabActive = (tabId) => {
    if (currentView === tabId) return true;
    if (tabId === 'my-learning' && ['course-wizard', 'roadmap', 'lessons', 'quiz', 'cheatsheet'].includes(currentView)) {
      return true;
    }
    return false;
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-2xl bg-[#080d1a]/80 border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-2.5 flex items-center justify-between gap-4">
        
        {/* Left Section: Mobile Menu + Brand Logo & Context */}
        <div className="flex items-center space-x-3 min-w-0 shrink-0">
          {/* Mobile Menu Button */}
          <button
            onClick={onToggleMobileSidebar}
            aria-label="Open mobile navigation menu"
            className="md:hidden p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand Logo & Name */}
          <div 
            onClick={() => onSwitchView && onSwitchView('home')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-cyan-500/20 shrink-0 border border-cyan-500/30 bg-gradient-to-br from-white/10 via-cyan-500/10 to-transparent flex items-center justify-center p-1.5 transition-transform group-hover:scale-105">
              <img 
                src="/logo.svg" 
                alt="PadhAI Logo" 
                className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(6,182,212,0.4)]" 
              />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-black tracking-tight text-white">
                Padh<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">AI</span>
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/20 uppercase tracking-wider hidden sm:inline-block">
                AI
              </span>
            </div>
          </div>

          {/* Active Course Context Pill (Desktop) */}
          {activeCourse && (
            <div className="hidden xl:flex items-center space-x-1.5 pl-2 border-l border-white/10">
              <button
                onClick={() => onSwitchView('my-learning')}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 text-cyan-300 text-xs font-semibold max-w-[180px] truncate transition-all shadow-sm"
                title={activeCourse.title}
              >
                <BookOpen className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">{activeCourse.title}</span>
              </button>
            </div>
          )}
        </div>

        {/* Center: Floating Island Dock / Pill Capsule (Inspired by Hintify) */}
        <div className="hidden lg:flex items-center justify-center flex-1 max-w-2xl px-2">
          <nav className="p-1 rounded-full bg-[#0b101d]/90 border border-white/[0.12] shadow-2xl shadow-black/80 backdrop-blur-2xl flex items-center space-x-0.5 ring-1 ring-white/5">
            {navTabs.map((tab) => {
              const active = isTabActive(tab.id);
              return (
                <button
                  key={tab.id}
                  onClick={() => onSwitchView(tab.id)}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex flex-col items-center justify-center select-none ${
                    active
                      ? 'bg-white/[0.12] text-white font-bold shadow-inner border border-white/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="tracking-tight">{tab.label}</span>
                  {/* Glowing Cyan Active Dot */}
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] -mb-1 mt-0.5 animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Sign In + Electric Cyan Sign Up / Profile Pill */}
        <div className="flex items-center space-x-3 shrink-0">
          {isAuthenticated && currentUser ? (
            <div className="flex items-center space-x-3">
              {/* Quick Action Button */}
              <button
                onClick={() => onSwitchView('course-wizard')}
                className="hidden sm:inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_28px_rgba(6,182,212,0.55)] hover:scale-105 transition-all min-h-[34px]"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>New Course</span>
                <ChevronRight className="w-3 h-3 stroke-[3]" />
              </button>

              {/* User Dropdown Pill */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  aria-label="User profile menu"
                  className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-full bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.1] hover:border-cyan-500/30 transition-all text-left shadow-sm min-h-[36px]"
                >
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover border border-cyan-400/50 shadow-sm shadow-cyan-500/20 shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 text-white font-black text-[11px] flex items-center justify-center shadow-sm shrink-0">
                      {getInitials(currentUser.name)}
                    </div>
                  )}
                  <span className="hidden sm:inline text-xs font-bold text-white max-w-[100px] truncate">
                    {currentUser.name ? currentUser.name.split(' ')[0] : 'Account'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-64 rounded-2xl p-2 border border-white/[0.1] bg-[#0c1222]/95 backdrop-blur-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3.5 py-3 border-b border-white/[0.08] mb-1.5">
                      <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{currentUser.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onSwitchView('progress');
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>My Learning Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onSwitchView('settings');
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Settings & API Key</span>
                    </button>

                    <div className="my-1 border-t border-white/[0.06]" />

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              {/* Clean Text Sign In Button */}
              <button
                onClick={() => openAuthModal('login')}
                className="text-xs font-semibold text-slate-300 hover:text-white transition-colors px-2 py-1.5"
              >
                Sign In
              </button>

              {/* Electric Cyan Rounded Pill Sign Up Button with Chevron (Like Hintify) */}
              <button
                onClick={() => openAuthModal('signup')}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 text-slate-950 font-black text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_28px_rgba(6,182,212,0.6)] hover:scale-105 transition-all flex items-center space-x-1.5 min-h-[36px]"
              >
                <span>Sign Up</span>
                <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
