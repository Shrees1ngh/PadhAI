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
  Zap,
  X
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import BranchedMenu from './BranchedMenu';

export const Sidebar = ({ 
  currentView = 'home', 
  onSelectView, 
  activeCourse = null,
  isMobile = false,
  onClose
}) => {
  const { currentUser, isAuthenticated, openAuthModal } = useAuth();

  const menuSections = [
    {
      label: 'Learning Hub',
      children: [
        { value: 'home', label: 'Home', icon: Home },
        { value: 'quick-learn', label: 'Quick Learn', icon: Zap },
        { value: 'my-learning', label: 'My Courses', icon: BookOpen },
      ]
    },
    {
      label: 'AI Study Tools',
      children: [
        { value: 'flashcards', label: 'Flashcards', icon: Layers },
        { value: 'cheatsheets', label: 'Cheatsheets', icon: FileCode2 },
        { value: 'planner', label: 'Study Planner', icon: Calendar },
        { value: 'upload-material', label: 'Upload Material', icon: FileUp },
      ]
    },
    {
      label: 'Analytics & System',
      children: [
        { value: 'progress', label: 'Progress', icon: TrendingUp },
        { value: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  const currentActiveValue = (
    currentView === 'course-wizard' || 
    currentView === 'roadmap' || 
    currentView === 'lessons' || 
    currentView === 'quiz' || 
    currentView === 'cheatsheet'
  ) ? 'my-learning' : currentView;

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
          ? 'flex flex-col w-full h-full bg-[#0d1117] select-none z-50'
          : 'w-60 shrink-0 hidden md:flex flex-col bg-[#0d1117] border-r border-[#21262d] select-none sticky top-[64px] h-[calc(100vh-64px)] z-20'
      }`}
    >
      {/* Mobile Drawer Header Only (Desktop uses the Top-Level Navbar) */}
      {isMobile && (
        <div className="h-14 flex items-center justify-between px-4 border-b border-[#21262d]">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-md overflow-hidden border border-[#30363d] bg-[#161b22] p-1 flex items-center justify-center">
              <img src="/logo.svg" alt="PadhAI" className="w-full h-full object-contain" />
            </div>
            <span className="text-sm font-bold tracking-tight text-[#e6edf3]">
              Padh<span className="text-[#58a6ff]">AI</span>
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close navigation menu"
              className="p-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Navigation Section via BranchedMenu */}
      <div className="flex-1 py-4 px-3 overflow-y-auto">
        <BranchedMenu
          items={menuSections}
          defaultOpen={[0, 1, 2]}
          activeValue={currentActiveValue}
          onSelect={(value) => handleItemClick(value)}
          color="#8b949e"
          accentColor="#58a6ff"
          lineColor="#21262d"
          width={224}
          rowHeight={36}
          indent={32}
          trunk={12}
          radius={8}
          lineWidth={1}
          fontSize={13}
          drawDuration={300}
          foldDuration={200}
        />
      </div>

      {/* Bottom User Profile or Sign Up Banner */}
      <div className="p-3 border-t border-[#21262d]">
        {isAuthenticated && currentUser ? (
          <div className="p-2.5 rounded-md bg-[#161b22] border border-[#30363d] flex items-center space-x-2.5 transition-colors hover:border-[#8b949e]">
            {currentUser.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-7 h-7 rounded-full object-cover border border-[#30363d] shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#1f6feb] text-white font-bold text-sm flex items-center justify-center shrink-0">
                {currentUser.name ? currentUser.name.substring(0, 2).toUpperCase() : 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#e6edf3] truncate">{currentUser.name}</p>
              <p className="text-sm text-[#6e7681] truncate">{currentUser.email}</p>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => {
              if (isMobile && onClose) onClose();
              openAuthModal('signup');
            }}
            className="group p-3 rounded-md bg-[#161b22] border border-[#30363d] hover:border-[#1f6feb] cursor-pointer transition-all text-center"
          >
            <div className="flex items-center justify-center space-x-1.5 text-sm font-semibold text-[#58a6ff] mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Unlock AI Tutor</span>
            </div>
            <p className="text-sm text-[#8b949e] mb-2">Sign in to save courses &amp; progress.</p>
            <button className="w-full py-1.5 rounded-md bg-[#1f6feb] hover:bg-[#388bfd] text-white text-sm font-semibold transition-colors min-h-[30px]">
              Sign Up Free
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
