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
  ChevronRight,
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
          ? 'flex flex-col w-full h-full bg-[#080d1a] select-none z-50'
          : 'w-64 shrink-0 hidden md:flex flex-col bg-[#080d1a]/95 backdrop-blur-2xl border-r border-white/[0.08] min-h-screen select-none sticky top-0 h-screen z-40 shadow-2xl'
      }`}
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-white/[0.08] bg-white/[0.01]">
        <div 
          onClick={() => handleItemClick('home')}
          className="flex items-center space-x-3 cursor-pointer hover:opacity-95 transition-all group"
        >
          {/* Logo Tile */}
          <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg shadow-cyan-500/20 shrink-0 border border-cyan-500/30 bg-gradient-to-br from-white/10 via-cyan-500/10 to-transparent flex items-center justify-center p-1.5 transition-transform group-hover:scale-105">
            <img 
              src="/logo.svg" 
              alt="PadhAI Logo" 
              className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(6,182,212,0.4)]" 
            />
          </div>
          
          {/* Brand Name & Pill */}
          <div className="flex items-center space-x-2">
            <span className="text-xl font-black tracking-tight text-white">
              Padh<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">AI</span>
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/20 uppercase tracking-wider">
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

      {/* Navigation Section */}
      <div className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            Platform Menu
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80 shadow-sm shadow-cyan-400 animate-pulse" />
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || 
            (item.id === 'my-learning' && ['course-wizard', 'roadmap', 'lessons', 'quiz', 'cheatsheet', 'flashcards'].includes(currentView));

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group min-h-[42px] ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/15 via-indigo-500/10 to-transparent text-white border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.05] border border-transparent'
              }`}
            >
              {/* Active Glow Accent Bar on Left */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-gradient-to-b from-cyan-400 to-indigo-500 shadow-sm shadow-cyan-400" />
              )}

              <div className="flex items-center space-x-3 min-w-0">
                <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 shrink-0 ${
                  isActive ? 'text-cyan-400 filter drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'text-slate-400 group-hover:text-slate-200'
                }`} />
                <span className="truncate tracking-tight">{item.label}</span>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                {item.badge && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className={`w-3 h-3 transition-all duration-200 ${
                  isActive ? 'text-cyan-400/80 opacity-100' : 'text-slate-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                }`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom User Profile or Pro AI Banner */}
      <div className="p-3.5 border-t border-white/[0.08] bg-gradient-to-b from-transparent to-black/30">
        {isAuthenticated && currentUser ? (
          <div className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] flex items-center space-x-3 transition-all shadow-sm">
            {currentUser.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-9 h-9 rounded-xl object-cover border border-cyan-400/40 shrink-0 shadow-sm shadow-cyan-500/20"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
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
            className="group relative p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-cyan-950/30 to-transparent border border-cyan-500/20 hover:border-cyan-500/40 cursor-pointer transition-all shadow-lg shadow-black/40 overflow-hidden text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-cyan-300 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Unlock 24/7 AI Tutor</span>
            </div>
            <p className="text-[10px] text-slate-400 mb-2.5">Sign in to save your personalized courses & progress.</p>
            <button className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-[11px] font-extrabold shadow-md shadow-cyan-500/25 transition-all min-h-[34px]">
              Sign Up Free
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
