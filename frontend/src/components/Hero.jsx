import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  BookOpen,
  Calendar,
  FileUp,
  ArrowRight,
  Layers,
  FileText,
  TrendingUp,
  HelpCircle,
  Bot,
  Zap,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { HeroBackground } from './HeroBackground';

const POPULAR_TOPICS = [
  'Binary Search Tree',
  'Operating Systems',
  'DBMS Normalization',
  'Pointers in C++',
  'Recursion & DP',
  'SQL Joins',
];

export const Hero = ({
  onStartQuickLearn,
  onCreateCourse,
  onStudyNotes,
  activeCourse = null,
  savedTopics = [],
  savedCourses = [],
  onSelectTopic,
  onSelectCourse,
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [searchInput, setSearchInput] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('Beginner');

  const handleQuickLearnSubmit = (e) => {
    e?.preventDefault();
    const topicToLearn = searchInput.trim() || 'Binary Search Tree';
    if (!isAuthenticated) {
      openAuthModal('signup');
      return;
    }
    if (onStartQuickLearn) {
      onStartQuickLearn(topicToLearn, selectedLevel);
    }
  };

  const handleTopicClick = (topicName) => {
    setSearchInput(topicName);
    if (!isAuthenticated) {
      openAuthModal('signup');
      return;
    }
    if (onStartQuickLearn) {
      onStartQuickLearn(topicName, selectedLevel);
    }
  };

  const handleProtectedNavigation = (path, fallbackAction) => {
    if (!isAuthenticated) {
      openAuthModal('signup');
      return;
    }
    if (fallbackAction) {
      fallbackAction();
    } else if (path) {
      navigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFocusSearch = () => {
    searchInputRef.current?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Real features built into PadhAI
  const platformFeatures = [
    {
      title: 'Quick Learn',
      description: 'Search any CS concept to get step-by-step conceptual explanations, code implementations, and key takeaways.',
      icon: Zap,
      actionText: 'Search Concept',
      onClick: handleFocusSearch,
    },
    {
      title: 'AI Course Wizard',
      description: 'Generate multi-module course curriculums customized to your level, complete with interactive roadmaps.',
      icon: BookOpen,
      actionText: 'Generate Course',
      onClick: () => handleProtectedNavigation('/course-wizard', onCreateCourse),
    },
    {
      title: 'Study Material & PDF Notes',
      description: 'Upload syllabus PDFs or lecture notes to automatically extract core topics, summaries, and practice materials.',
      icon: FileUp,
      actionText: 'Upload Notes',
      onClick: () => handleProtectedNavigation('/upload-material', onStudyNotes),
    },
    {
      title: 'Flashcard Decks',
      description: 'Review key definitions, algorithms, and concepts with flashcard decks built for active recall revision.',
      icon: Layers,
      actionText: 'Open Flashcards',
      onClick: () => handleProtectedNavigation('/flashcards'),
    },
    {
      title: 'Revision Cheatsheets',
      description: 'Access compact reference sheets with syntax, time complexities, common design patterns, and formulas.',
      icon: FileText,
      actionText: 'View Cheatsheets',
      onClick: () => handleProtectedNavigation('/cheatsheets'),
    },
    {
      title: 'Interactive Quizzes',
      description: 'Test your understanding on course topics with AI-generated multiple choice quizzes and immediate answer review.',
      icon: HelpCircle,
      actionText: 'Take a Quiz',
      onClick: () => handleProtectedNavigation('/quiz'),
    },
    {
      title: 'Study Planner',
      description: 'Create a tailored study schedule by setting your target exam dates and daily hours available.',
      icon: Calendar,
      actionText: 'Build Schedule',
      onClick: () => handleProtectedNavigation('/planner'),
    },
    {
      title: '24/7 AI Tutor',
      description: 'Ask questions, debug tricky code, and get explanations on difficult computer science concepts anytime.',
      icon: Bot,
      actionText: 'Ask AI Tutor',
      onClick: () => handleProtectedNavigation('/ai-tutor'),
    },
    {
      title: 'Progress Tracking',
      description: 'Keep track of completed lessons, quiz scores, and study consistency across all your courses.',
      icon: TrendingUp,
      actionText: 'View Progress',
      onClick: () => handleProtectedNavigation('/progress'),
    },
  ];

  return (
    <section className="relative pt-6 sm:pt-10 pb-20 sm:pb-24 space-y-16 overflow-hidden select-none">
      
      <HeroBackground />

      {/* Main Search & Hero Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">

        {/* Hero Title */}
        <div className="space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#e6edf3] tracking-tight leading-tight"
          >
            Master Any Computer Science Concept
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-[#8b949e] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
          >
            Search any programming topic for clear explanations and code, generate custom courses, practice with flashcards and quizzes, or analyze your study notes.
          </motion.p>
        </div>

        {/* Search Bar Container */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="max-w-2xl mx-auto"
        >
          <form
            onSubmit={handleQuickLearnSubmit}
            className="p-1.5 rounded-lg bg-[#161b22] border border-[#30363d] focus-within:border-[#58a6ff] flex flex-col sm:flex-row items-stretch sm:items-center gap-2 transition-all shadow-lg"
          >
            <div className="flex-1 flex items-center space-x-2.5 px-3 py-1 w-full min-w-0">
              <Search className="w-4 h-4 text-[#58a6ff] shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search a concept, algorithm, or topic..."
                className="w-full bg-transparent text-sm sm:text-base text-[#e6edf3] placeholder-[#6e7681] focus:outline-none py-2 px-1 min-h-[42px]"
              />
            </div>

            {/* Level Selector */}
            <div className="flex items-center justify-center gap-1 bg-[#0d1117] border border-[#30363d] p-1 rounded-md shrink-0">
              {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all min-h-[30px] cursor-pointer ${
                    selectedLevel === lvl
                      ? 'bg-[#1f6feb] text-white'
                      : 'text-[#8b949e] hover:text-[#e6edf3]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-md bg-[#1f6feb] hover:bg-[#388bfd] text-white text-sm font-semibold transition-colors flex items-center justify-center space-x-1.5 shrink-0 min-h-[42px] cursor-pointer"
            >
              <span>Learn</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Popular Topics */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-xs">
            <span className="text-[#6e7681] font-medium">Popular:</span>
            {POPULAR_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => handleTopicClick(topic)}
                className="px-2.5 py-1 rounded-md bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] hover:border-[#58a6ff] text-[#8b949e] hover:text-[#e6edf3] transition-all cursor-pointer"
              >
                {topic}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Quick Primary Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button
            onClick={() => handleProtectedNavigation('/course-wizard', onCreateCourse)}
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] hover:border-[#8b949e] text-[#e6edf3] text-xs sm:text-sm font-semibold transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#58a6ff]" />
            <span>Create a Course</span>
          </button>

          <button
            onClick={() => handleProtectedNavigation('/upload-material', onStudyNotes)}
            className="w-full sm:w-auto px-4 py-2 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] hover:border-[#8b949e] text-[#e6edf3] text-xs sm:text-sm font-semibold transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <FileUp className="w-4 h-4 text-[#3fb950]" />
            <span>Upload Study Material</span>
          </button>
        </div>

      </div>

      {/* Authenticated User Dashboard: Active Course & Saved Content */}
      {isAuthenticated && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6 relative z-10">
          
          {/* Active Course Card */}
          {activeCourse && (
            <div className="rounded-lg p-5 bg-[#161b22] border border-[#30363d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-9 h-9 rounded-md bg-[#1f6feb] text-white flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-[#58a6ff]">Active Course</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]" />
                    <span className="text-xs text-[#3fb950]">In Progress</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-[#e6edf3] truncate">
                    {activeCourse.title || activeCourse.topic}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => onSelectCourse && onSelectCourse(activeCourse)}
                className="px-4 py-2 rounded-md bg-[#1f6feb] hover:bg-[#388bfd] text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center space-x-1.5 shrink-0 cursor-pointer"
              >
                <span>Resume Course</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Saved Topics and Courses */}
          {(savedTopics.length > 0 || savedCourses.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Saved Topics */}
              {savedTopics.length > 0 && (
                <div className="rounded-lg p-4 bg-[#161b22] border border-[#30363d] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#21262d] pb-2">
                    <h4 className="text-xs font-semibold text-[#e6edf3] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#58a6ff]" />
                      <span>My Saved Topics</span>
                    </h4>
                    <span className="text-xs text-[#6e7681]">{savedTopics.length} saved</span>
                  </div>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {savedTopics.slice(0, 5).map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => onSelectTopic && onSelectTopic(item.topic || item.title)}
                        className="p-2 rounded bg-[#0d1117] border border-[#21262d] hover:border-[#1f6feb] hover:bg-[#161b22] transition-all flex items-center justify-between cursor-pointer group"
                      >
                        <span className="text-xs text-[#e6edf3] group-hover:text-[#58a6ff] truncate">
                          {item.topic || item.title}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#6e7681] group-hover:text-[#58a6ff] shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Saved Courses */}
              {savedCourses.length > 0 && (
                <div className="rounded-lg p-4 bg-[#161b22] border border-[#30363d] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#21262d] pb-2">
                    <h4 className="text-xs font-semibold text-[#e6edf3] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#58a6ff]" />
                      <span>My Courses</span>
                    </h4>
                    <span className="text-xs text-[#6e7681]">{savedCourses.length} created</span>
                  </div>
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {savedCourses.slice(0, 5).map((c, idx) => (
                      <div
                        key={idx}
                        onClick={() => onSelectCourse && onSelectCourse(c)}
                        className="p-2 rounded bg-[#0d1117] border border-[#21262d] hover:border-[#1f6feb] hover:bg-[#161b22] transition-all flex items-center justify-between cursor-pointer group"
                      >
                        <span className="text-xs text-[#e6edf3] group-hover:text-[#58a6ff] truncate">
                          {c.title || c.topic}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#6e7681] group-hover:text-[#58a6ff] shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Real Tools & Features of PadhAI */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center space-y-2 border-b border-[#21262d] pb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-[#e6edf3]">
            PadhAI Learning Tools
          </h2>
          <p className="text-xs sm:text-sm text-[#8b949e] max-w-lg mx-auto">
            Everything you need to understand, practice, and prepare for Computer Science exams and interviews.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {platformFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-5 rounded-lg bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff]/60 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2.5">
                  <div className="w-8 h-8 rounded-md bg-[#0d1117] border border-[#30363d] text-[#58a6ff] flex items-center justify-center group-hover:border-[#58a6ff]/50 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#e6edf3] group-hover:text-[#58a6ff] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-[#8b949e] leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#21262d]">
                  <button
                    onClick={feat.onClick}
                    className="text-xs font-semibold text-[#58a6ff] hover:text-[#79c0ff] flex items-center space-x-1 cursor-pointer"
                  >
                    <span>{feat.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Unauthenticated Sign In Banner */}
      {!isAuthenticated && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="rounded-lg p-6 bg-[#161b22] border border-[#30363d] text-center space-y-3">
            <h3 className="text-base font-semibold text-[#e6edf3]">
              Track Your Learning Progress
            </h3>
            <p className="text-xs text-[#8b949e] max-w-md mx-auto">
              Create a free account to save your generated courses, track quiz scores, review flashcards, and customize study plans.
            </p>
            <div className="flex items-center justify-center gap-2.5 pt-1">
              <button
                onClick={() => openAuthModal('signup')}
                className="px-4 py-2 rounded-md bg-[#1f6feb] hover:bg-[#388bfd] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Create Account
              </button>
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#e6edf3] text-xs font-semibold transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default Hero;
