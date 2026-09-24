import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Search,
  BookOpen,
  Calendar,
  FileUp,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Layers,
  GraduationCap,
  Play,
  RotateCcw,
  Zap,
  Tag,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { HeroBackground } from './HeroBackground';

const POPULAR_SUGGESTIONS = [
  'Binary Tree',
  'Operating System',
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
  const [searchInput, setSearchInput] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('Beginner');

  const handleQuickLearnSubmit = (e) => {
    e?.preventDefault();
    const topicToLearn = searchInput.trim() || 'Binary Tree';
    if (!isAuthenticated) {
      openAuthModal('signup');
      return;
    }
    if (onStartQuickLearn) {
      onStartQuickLearn(topicToLearn, selectedLevel);
    }
  };

  const handleChipClick = (topicName) => {
    setSearchInput(topicName);
    if (!isAuthenticated) {
      openAuthModal('signup');
      return;
    }
    if (onStartQuickLearn) {
      onStartQuickLearn(topicName, selectedLevel);
    }
  };

  const handleProtectedAction = (actionCallback) => {
    if (!isAuthenticated) {
      openAuthModal('signup');
      return;
    }
    if (actionCallback) actionCallback();
  };

  return (
    <section className="relative pt-2 sm:pt-4 pb-12 sm:pb-16 space-y-10 sm:space-y-12 overflow-hidden select-none">
      
      <HeroBackground />

      {/* Main Learning Search Hub Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 sm:space-y-8 relative z-10">

        {/* Hero Title */}
        <div className="space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#e6edf3] tracking-tight leading-tight"
          >
            Master any CS concept, algorithm, or technology
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#8b949e] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
          >
            Search for any programming topic. PadhAI instantly generates clear explanations, code examples, and interactive visualizations to help you understand complex concepts.
          </motion.p>
        </div>

        {/* Big Search / Input Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <form
            onSubmit={handleQuickLearnSubmit}
            className="p-1.5 rounded-md bg-[#161b22] border border-[#30363d] flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            <div className="flex-1 flex items-center space-x-3 px-3 py-1 w-full min-w-0">
              <Search className="w-4 h-4 text-[#58a6ff] shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search for a concept, algorithm, or technology..."
                className="w-full bg-transparent text-sm sm:text-base text-[#e6edf3] placeholder-[#6e7681] focus:outline-none py-2 px-1 min-h-[44px]"
              />
            </div>

            {/* Level Pill in Search */}
            <div className="flex items-center justify-center gap-1 bg-[#0d1117] border border-[#30363d] p-1 rounded shrink-0">
              {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1.5 rounded text-sm sm:text-sm font-medium transition-all min-h-[36px] ${
                    selectedLevel === lvl
                      ? 'bg-[#1f6feb] text-white'
                      : 'text-[#8b949e] hover:text-[#e6edf3]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-[#1f6feb] hover:bg-[#388bfd] text-white text-sm sm:text-base font-medium transition-colors flex items-center justify-center space-x-2 shrink-0 min-h-[44px] border border-[rgba(240,246,252,0.1)]"
            >
              <span>Start Learning</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Popular Suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-3 text-sm">
            <span className="text-[#6e7681] font-medium mr-1 text-sm">Popular:</span>
            {POPULAR_SUGGESTIONS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => handleChipClick(topic)}
                className="px-4 py-1.5 rounded-full bg-[#161b22] hover:bg-[#1f6feb]/10 border border-[#30363d] hover:border-[#1f6feb]/50 text-[#8b949e] hover:text-[#58a6ff] transition-all text-sm font-medium min-h-[32px]"
              >
                {topic}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Secondary Major Actions: [ Create a Course ] & [ Study My Notes ] */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
          <button
            onClick={() => handleProtectedAction(onCreateCourse)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] hover:border-[#8b949e] text-[#e6edf3] text-sm sm:text-sm font-semibold transition-all flex items-center justify-center space-x-2 group min-h-[40px]"
          >
            <div className="w-6 h-6 rounded bg-[#1f6feb]/10 text-[#58a6ff] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <span>Generate Curriculum</span>
          </button>

          <button
            onClick={() => handleProtectedAction(onStudyNotes)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] hover:border-[#8b949e] text-[#e6edf3] text-sm sm:text-sm font-semibold transition-all flex items-center justify-center space-x-2 group min-h-[40px]"
          >
            <div className="w-6 h-6 rounded bg-[#3fb950]/10 text-[#3fb950] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <FileUp className="w-3.5 h-3.5" />
            </div>
            <span>Upload Study Material</span>
          </button>
        </div>

      </div>

      {/* ======================================================== */}
      {/* DASHBOARD SECTIONS BELOW HERO SEARCH (AUTHENTICATED DATA ONLY) */}
      {/* ======================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-4">
        
        {/* If user is not authenticated: Show Sign In CTA */}
        {!isAuthenticated && (
          <div className="rounded-md p-6 sm:p-10 bg-[#161b22] border border-[#30363d] text-center space-y-4">
            <div className="w-10 h-10 rounded-md bg-[#1f6feb]/10 border border-[#1f6feb]/30 text-[#58a6ff] flex items-center justify-center mx-auto">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1 max-w-lg mx-auto">
              <h3 className="text-lg sm:text-xl font-semibold text-[#e6edf3]">Sign In to Track Progress</h3>
              <p className="text-sm sm:text-sm text-[#8b949e]">
                Save topics, track your learning journey, and generate personalized study paths.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => openAuthModal('signup')}
                className="px-5 py-2 rounded-md bg-[#1f6feb] hover:bg-[#388bfd] text-white text-sm font-semibold transition-colors border border-[rgba(240,246,252,0.1)] min-h-[36px]"
              >
                Create Free Account
              </button>
              <button
                onClick={() => openAuthModal('login')}
                className="px-5 py-2 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#e6edf3] text-sm font-semibold transition-colors min-h-[36px]"
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {/* Section 1: Continue Learning (Real Active Course) */}
        {isAuthenticated && activeCourse && (
          <div className="rounded-md p-5 sm:p-7 bg-[#161b22] border border-[#30363d] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-md bg-[#1f6feb] text-white flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold uppercase tracking-wider text-[#58a6ff]">
                      Active Course
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]" />
                    <span className="text-sm text-[#3fb950] font-semibold">In Progress</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-[#e6edf3] truncate">
                    {activeCourse.title || activeCourse.topic}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => onSelectCourse && onSelectCourse(activeCourse)}
                className="px-4 py-2 rounded-md bg-[#1f6feb] hover:bg-[#388bfd] text-white text-sm font-semibold transition-colors flex items-center justify-center space-x-2 shrink-0 min-h-[36px] border border-[rgba(240,246,252,0.1)]"
              >
                <span>Resume Course</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Section 2: Saved Topics & Activity (Clean Slate) */}
        {isAuthenticated && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Recently Learned & Saved Topics (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-md p-5 sm:p-6 bg-[#161b22] border border-[#30363d] space-y-4">
                <div className="flex items-center justify-between border-b border-[#21262d] pb-3">
                  <h3 className="text-sm font-semibold text-[#e6edf3] flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-[#58a6ff]" />
                    <span>My Saved Topics</span>
                  </h3>
                  <span className="text-sm text-[#6e7681]">
                    {savedTopics.length} Saved
                  </span>
                </div>

                {savedTopics.length === 0 ? (
                  <div className="p-8 text-center space-y-2 rounded bg-[#0d1117] border border-[#21262d]">
                    <BookOpen className="w-7 h-7 text-[#30363d] mx-auto" />
                    <p className="text-sm font-semibold text-[#8b949e]">No saved topics yet</p>
                    <p className="text-sm text-[#6e7681] max-w-xs mx-auto">
                      Search any concept above and click "Save Topic" to build your personalized library.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedTopics.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => onSelectTopic && onSelectTopic(item.topic || item.title)}
                        className="p-3 rounded bg-[#0d1117] border border-[#21262d] hover:border-[#1f6feb] hover:bg-[#161b22] transition-all flex items-center justify-between cursor-pointer group min-h-[44px]"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-8 h-8 rounded bg-[#1f6feb]/10 text-[#58a6ff] border border-[#1f6feb]/20 flex items-center justify-center text-sm font-semibold shrink-0">
                            <BookOpen className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#e6edf3] group-hover:text-[#58a6ff] transition-colors truncate">
                              {item.topic || item.title}
                            </p>
                            <p className="text-sm text-[#6e7681]">
                              {item.level || 'Beginner'} • Saved
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0 ml-2">
                          <ArrowRight className="w-3.5 h-3.5 text-[#30363d] group-hover:text-[#58a6ff] transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Courses Overview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-md p-5 sm:p-6 bg-[#161b22] border border-[#30363d] space-y-4">
                <div className="flex items-center justify-between border-b border-[#21262d] pb-3">
                  <h3 className="text-sm font-semibold text-[#e6edf3] flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-[#58a6ff]" />
                    <span>My Courses</span>
                  </h3>
                  <span className="text-sm text-[#6e7681]">
                    {savedCourses.length} Created
                  </span>
                </div>

                {savedCourses.length === 0 ? (
                  <div className="p-8 text-center space-y-3 rounded bg-[#0d1117] border border-[#21262d]">
                    <Calendar className="w-7 h-7 text-[#30363d] mx-auto" />
                    <p className="text-sm font-semibold text-[#8b949e]">No curriculum generated yet</p>
                    <p className="text-sm text-[#6e7681]">
                      Generate a structured curriculum to master any concept.
                    </p>
                    <button
                      onClick={onCreateCourse}
                      className="px-4 py-1.5 rounded-md bg-[#1f6feb] hover:bg-[#388bfd] text-white text-sm font-semibold transition-colors min-h-[32px] border border-[rgba(240,246,252,0.1)]"
                    >
                      Create First Course
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedCourses.map((c, idx) => (
                      <div
                        key={idx}
                        onClick={() => onSelectCourse && onSelectCourse(c)}
                        className="p-3 rounded bg-[#0d1117] border border-[#21262d] hover:border-[#1f6feb] hover:bg-[#161b22] transition-all flex items-center justify-between cursor-pointer group min-h-[44px]"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-sm font-semibold text-[#e6edf3] group-hover:text-[#58a6ff] transition-colors truncate">
                            {c.title || c.topic}
                          </p>
                          <p className="text-sm text-[#6e7681]">
                            {c.modules?.length || 0} Modules • {c.level || 'Beginner'}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#30363d] group-hover:text-[#58a6ff] transition-colors shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};

export default Hero;
