import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  BookOpen, 
  User, 
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
  health, 
  onRefreshHealth, 
  isRefreshing, 
  activeCourse, 
  currentView = 'home', 
  onSwitchView,
  onToggleMobileSidebar
}) => {
  const isHealthy = health?.status === 'ok';
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
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#080c14]/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Mobile menu toggle + Brand / Breadcrumb */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            onClick={() => onSwitchView && onSwitchView('home')}
            className="flex md:hidden items-center space-x-2.5 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold text-white">
              Learn<span className="text-indigo-400">AI</span>
            </span>
          </div>

          {/* Desktop Top Breadcrumbs */}
          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400">
            <span className="capitalize text-slate-400 font-medium">
              {currentView === 'home' ? 'Platform Overview' : currentView.replace('-', ' ')}
            </span>
            {activeCourse && (
              <>
                <span className="text-slate-600">/</span>
                <span className="text-indigo-300 font-bold max-w-[200px] truncate">
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
              Features
            </button>
            <button onClick={() => onSwitchView('planner')} className="hover:text-white transition-colors">
              How it works
            </button>
            <button onClick={() => onSwitchView('progress')} className="hover:text-white transition-colors">
              Dashboard
            </button>
          </nav>
        )}

        {/* Right Section: Live API indicator & User Profile */}
        <div className="flex items-center space-x-3">
          
          {/* Health Status Indicator */}
          <div 
            onClick={onRefreshHealth}
            title="Click to check backend status"
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium cursor-pointer transition-all ${
              isHealthy 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isHealthy ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <span className="hidden sm:inline">
              {isHealthy ? 'API Ready' : 'Connecting'}
            </span>
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </div>

          {/* User Auth Section */}
          {isAuthenticated && currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-1 pl-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left"
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-indigo-400/50"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center">
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
                <div className="absolute right-0 mt-2 w-64 rounded-2xl p-2 border border-white/10 bg-[#0d121f] shadow-2xl z-50">
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
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>My Learning Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
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
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center space-x-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => openAuthModal('signup')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/25 transition-all flex items-center space-x-1.5"
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
