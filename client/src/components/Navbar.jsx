import React, { useState, useRef, useEffect } from 'react';
import { 
  Search,
  Sparkles, 
  BookOpen, 
  User, 
  Settings,
  LogOut, 
  ChevronDown, 
  ChevronRight,
  LogIn, 
  UserPlus, 
  Menu, 
  Plus,
  Compass,
  Layers,
  GraduationCap
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

  // Keyboard shortcut for Cmd+K / Ctrl+K search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onSwitchView('learn');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSwitchView]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getViewTitle = (view) => {
    switch (view) {
      case 'home': return 'Platform Overview';
      case 'my-learning': return 'My Learning';
      case 'course-wizard': return 'Course Studio';
      case 'roadmap': return 'Course Roadmap';
      case 'lessons': return 'Interactive Lessons';
      case 'quiz': return 'Quiz & Assessment';
      case 'cheatsheets': return 'Revision Cheatsheets';
      case 'flashcards': return 'Flashcard Decks';
      case 'planner': return 'Study Planner';
      case 'upload-material': return 'Material Analyzer';
      case 'progress': return 'Mastery Analytics';
      case 'settings': return 'Preferences & Keys';
      case 'learn': return 'Quick Learn Search';
      default: return view.replace('-', ' ');
    }
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-2xl bg-[#080d1a]/80 border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Left Section: Mobile Menu + Breadcrumbs Capsule */}
        <div className="flex items-center space-x-3 min-w-0">
          {/* Mobile Hamburger Toggle */}
          <button
            onClick={onToggleMobileSidebar}
            aria-label="Open mobile navigation menu"
            className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Brand Logo */}
          <div 
            onClick={() => onSwitchView && onSwitchView('home')}
            className="flex md:hidden items-center space-x-2.5 cursor-pointer shrink-0 group"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-cyan-500/20 shrink-0 border border-cyan-500/30 bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center p-1.5 transition-transform group-hover:scale-105">
              <img 
                src="/logo.svg" 
                alt="PadhAI Logo" 
                className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(6,182,212,0.3)]" 
              />
            </div>
            <span className="text-lg font-black text-white tracking-tight">
              Padh<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">AI</span>
            </span>
          </div>

          {/* Desktop Breadcrumbs Capsule */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs min-w-0 shadow-sm">
            <button 
              onClick={() => onSwitchView('home')}
              className="flex items-center space-x-1.5 text-slate-400 hover:text-slate-200 transition-colors font-medium shrink-0"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Platform</span>
            </button>

            <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />

            <span className="font-semibold text-slate-200 capitalize truncate max-w-[140px]">
              {getViewTitle(currentView)}
            </span>

            {activeCourse && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                <button
                  onClick={() => onSwitchView('my-learning')}
                  className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 hover:bg-cyan-500/20 transition-all font-semibold max-w-[200px] truncate group"
                  title={activeCourse.title}
                >
                  <BookOpen className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">{activeCourse.title}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Center: Command / Quick AI Search Bar (Modern Spotlight Capsule) */}
        <div className="hidden sm:flex flex-1 max-w-md mx-2">
          <button
            onClick={() => onSwitchView('learn')}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] hover:border-cyan-500/30 text-xs text-slate-400 hover:text-slate-200 transition-all shadow-sm group"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" />
              <span className="truncate">Search any topic, notes, or concept...</span>
            </div>
            <div className="flex items-center space-x-1 shrink-0 ml-2">
              <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono rounded bg-white/10 border border-white/10 text-slate-400 group-hover:text-slate-200">
                ⌘K
              </kbd>
            </div>
          </button>
        </div>

        {/* Right Section: Quick Action + Online Status + Profile Pill */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
          
          {/* Quick Action: New Course Button */}
          <button
            onClick={() => onSwitchView('course-wizard')}
            className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-300 bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 hover:from-cyan-500/25 hover:to-indigo-500/25 border border-cyan-500/30 hover:border-cyan-500/50 shadow-sm shadow-cyan-500/10 transition-all group"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-90 transition-transform duration-200" />
            <span>Create Course</span>
          </button>

          {/* AI Tutor Live Indicator */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-300 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI Ready</span>
          </div>

          {/* Authentication State */}
          {isAuthenticated && currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-label="User profile menu"
                className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-cyan-500/30 transition-all text-left shadow-sm group min-h-[38px]"
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-xl object-cover border border-cyan-400/40 shadow-sm shadow-cyan-500/20 shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                    {getInitials(currentUser.name)}
                  </div>
                )}
                <div className="hidden sm:flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate max-w-[100px] leading-tight">
                    {currentUser.name ? currentUser.name.split(' ')[0] : 'Learner'}
                  </span>
                  <span className="text-[9px] font-semibold text-cyan-400/90 leading-tight">
                    Active
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-64 rounded-2xl p-2 border border-white/[0.1] bg-[#0c1222]/95 backdrop-blur-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3.5 py-3 border-b border-white/[0.08] mb-1.5">
                    <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{currentUser.email}</p>
                    <div className="mt-2 flex items-center space-x-1.5">
                      <span className="text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {currentUser.authProvider === 'google' ? 'Google Account' : 'Verified Learner'}
                      </span>
                    </div>
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
                    <span>Settings & Preferences</span>
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
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-all flex items-center space-x-1.5 min-h-[36px]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>

              <button
                onClick={() => openAuthModal('signup')}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-md shadow-cyan-500/20 transition-all flex items-center space-x-1.5 min-h-[36px]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
