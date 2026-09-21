import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  User, 
  Settings,
  LogOut, 
  ChevronDown, 
  LogIn, 
  UserPlus, 
  Menu, 
  X, 
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

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#080c14]/90 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Left: Mobile menu toggle + Brand / Breadcrumb */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            aria-label="Open mobile navigation menu"
            className="md:hidden p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            onClick={() => onSwitchView && onSwitchView('home')}
            className="flex md:hidden items-center space-x-2.5 cursor-pointer shrink-0"
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md shadow-cyan-500/15 shrink-0 border border-white/10 bg-white/5 flex items-center justify-center p-1">
              <img 
                src="/logo.svg" 
                alt="PadhAI Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            <span className="text-base font-black text-white tracking-tight">
              Padh<span className="text-indigo-400">AI</span>
            </span>
          </div>

          {/* Desktop Top Breadcrumbs */}
          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400 min-w-0">
            <span className="capitalize text-slate-400 font-medium whitespace-nowrap">
              {currentView === 'home' ? 'Platform Overview' : currentView.replace('-', ' ')}
            </span>
            {activeCourse && (
              <>
                <span className="text-slate-600">/</span>
                <span className="text-indigo-300 font-bold max-w-[220px] truncate">
                  {activeCourse.title}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Center / Navigation Quick Links for Landing Page */}
        {currentView === 'home' && (
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-semibold text-slate-300">
            <button onClick={() => onSwitchView('home')} className="hover:text-white transition-colors">
              Home
            </button>
            <button onClick={() => onSwitchView('course-wizard')} className="hover:text-white transition-colors">
              Create Course
            </button>
            <button onClick={() => onSwitchView('planner')} className="hover:text-white transition-colors">
              Study Planner
            </button>
            <button onClick={() => onSwitchView('progress')} className="hover:text-white transition-colors">
              Progress
            </button>
          </nav>
        )}

        {/* Right Section: User Profile / Auth Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {isAuthenticated && currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-label="User profile menu"
                className="flex items-center space-x-2 p-1.5 sm:pl-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left min-h-[36px]"
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-xl object-cover border border-indigo-400/50"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center">
                    {getInitials(currentUser.name)}
                  </div>
                )}
                <span className="hidden sm:inline text-xs font-semibold text-slate-200 max-w-[100px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl p-2 border border-white/10 bg-[#0d121f] shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2.5 border-b border-white/5 mb-1">
                    <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    <div className="mt-1 flex items-center space-x-1.5">
                      <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {currentUser.authProvider === 'google' ? 'Google Account' : 'Verified Learner'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onSwitchView('progress');
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>My Learning Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onSwitchView('settings');
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Settings & API Key</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center space-x-1.5 min-h-[36px]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>

              <button
                onClick={() => openAuthModal('signup')}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/25 transition-all flex items-center space-x-1.5 min-h-[36px]"
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
