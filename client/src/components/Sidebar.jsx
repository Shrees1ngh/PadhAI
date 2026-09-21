import React from 'react';
import { 
  Sparkles, 
  Home, 
  BookOpen, 
  Calendar, 
  FileUp, 
  Layers,
  FileCode2,
  TrendingUp, 
  Settings,
  GraduationCap,
  X
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';

export const Sidebar = ({ 
  currentView = 'home', 
  onSelectView, 
  activeCourse = null,
  isMobile = false,
  onClose
}) => {
  const { currentUser, isAuthenticated, openAuthModal } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'my-learning', label: 'My Courses', icon: BookOpen, badge: activeCourse ? 'Active' : null },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'cheatsheets', label: 'Cheatsheets', icon: FileCode2 },
    { id: 'planner', label: 'Study Planner', icon: Calendar },
    { id: 'upload-material', label: 'Upload Material', icon: FileUp },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleItemClick = (viewId) => {
    onSelectView(viewId);
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <aside 
      className={`${
        isMobile 
          ? 'flex flex-col w-full h-full bg-[#0b0f19] select-none z-50'
          : 'w-64 shrink-0 hidden md:flex flex-col bg-[#0b0f19] border-r border-white/5 min-h-screen select-none sticky top-0 h-screen z-40'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-white/[0.01]">
        <div 
          onClick={() => handleItemClick('home')}
          className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-cyan-500/15 shrink-0 border border-white/10 bg-white/5 flex items-center justify-center p-1">
            <img 
              src="/logo.svg" 
              alt="PadhAI Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-lg font-black tracking-tight text-white">
              Padh<span className="text-indigo-400">AI</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              AI
            </span>
          </div>
        </div>

        {/* Mobile Close Button */}
        {isMobile && onClose && (
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || 
            (item.id === 'my-learning' && (currentView === 'course-wizard' || currentView === 'roadmap' || currentView === 'lessons' || currentView === 'quiz' || currentView === 'cheatsheet' || currentView === 'flashcards'));

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all group min-h-[44px] ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/25 to-purple-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 shrink-0 ${
                  isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                }`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  {item.badge}
                </span>
              )}

              {item.highlight && !item.badge && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Pro / User card */}
      <div className="p-4 border-t border-white/5">
        {isAuthenticated && currentUser ? (
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center space-x-3">
            {currentUser.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-8 h-8 rounded-xl object-cover border border-indigo-400/40 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser.name ? currentUser.name.substring(0, 2).toUpperCase() : 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => {
              if (isMobile && onClose) onClose();
              openAuthModal('signup');
            }}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-transparent border border-indigo-500/20 cursor-pointer hover:border-indigo-500/40 transition-all text-center"
          >
            <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-indigo-300 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Unlock 24/7 AI Tutor</span>
            </div>
            <p className="text-[10px] text-slate-400 mb-2">Sign in to save your personalized courses & progress.</p>
            <button className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-md shadow-indigo-600/30 transition-all min-h-[36px]">
              Sign Up Free
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
