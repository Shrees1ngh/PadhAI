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
      {/* Ambient background glows */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-48 right-8 w-[350px] h-[350px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Learning Search Hub Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 sm:space-y-8 relative z-10">
        
        {/* Brand Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full bg-white/5 border border-cyan-500/30 backdrop-blur-md text-xs sm:text-sm text-slate-200 shadow-md shadow-cyan-500/10 hover:border-cyan-500/50 transition-colors"
        >
          <div className="w-7 h-7 rounded-lg overflow-hidden bg-white/5 border border-cyan-500/30 p-1 flex items-center justify-center shrink-0">
            <img src="/logo.svg" alt="PadhAI" className="w-full h-full object-contain filter drop-shadow-[0_1px_4px_rgba(6,182,212,0.4)]" />
          </div>
          <span className="font-bold tracking-tight text-white">Padh<span className="text-cyan-400">AI</span> Learning Platform</span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        </motion.div>

        {/* Hero Title */}
        <div className="space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight"
          >
            What do you want to learn?
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed"
          >
            Enter any topic or subject. PadhAI instantly generates clear explanations, real-world analogies, interactive visualizations, and curated video recommendations.
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
            className="p-2 sm:p-2.5 rounded-3xl bg-[#0d1322]/90 border border-indigo-500/30 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
          >
            <div className="flex-1 flex items-center space-x-3 px-3 py-1 w-full min-w-0">
              <Search className="w-5 h-5 text-indigo-400 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search any topic (e.g. Binary Tree, OS, DBMS)..."
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none py-2 min-h-[40px]"
              />
            </div>

            {/* Level Pill in Search */}
            <div className="flex items-center justify-center gap-1 bg-[#080c14] border border-white/10 p-1 rounded-2xl shrink-0">
              {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-2.5 py-1.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all min-h-[32px] ${
                    selectedLevel === lvl
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Primary Action Button: [ Quick Learn ] */}
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-black shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 shrink-0 active:scale-[0.98] min-h-[44px]"
            >
              <span>Quick Learn</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Popular Suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-3 text-xs">
            <span className="text-slate-400 font-medium mr-1 text-[11px]">Popular:</span>
            {POPULAR_SUGGESTIONS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => handleChipClick(topic)}
                className="px-3 py-1.5 rounded-full bg-white/[0.03] hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-200 transition-all text-[11px] font-medium min-h-[32px]"
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
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#0d1322] hover:bg-[#121a30] border border-white/10 hover:border-indigo-500/40 text-white text-xs sm:text-sm font-bold shadow-lg transition-all flex items-center justify-center space-x-2.5 group min-h-[44px]"
          >
            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <span>Create a Multi-Day Course</span>
          </button>

          <button
            onClick={() => handleProtectedAction(onStudyNotes)}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#0d1322] hover:bg-[#121a30] border border-white/10 hover:border-purple-500/40 text-white text-xs sm:text-sm font-bold shadow-lg transition-all flex items-center justify-center space-x-2.5 group min-h-[44px]"
          >
            <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <FileUp className="w-3.5 h-3.5" />
            </div>
            <span>Upload Professor Notes (PDF/PPT)</span>
          </button>
        </div>

      </div>

      {/* ======================================================== */}
      {/* DASHBOARD SECTIONS BELOW HERO SEARCH (AUTHENTICATED DATA ONLY) */}
      {/* ======================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-4">
        
        {/* If user is not authenticated: Show Sign In CTA */}
        {!isAuthenticated && (
          <div className="rounded-3xl p-6 sm:p-10 bg-gradient-to-tr from-[#0d1322] via-[#111827] to-[#0d1322] border border-indigo-500/20 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-lg mx-auto">
              <h3 className="text-lg sm:text-xl font-bold text-white">Sign In to Save Your Progress</h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Create custom study plans, bookmark topics, generate cheatsheets, and access 24/7 AI Tutor.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => openAuthModal('signup')}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 min-h-[40px]"
              >
                Create Free Account
              </button>
              <button
                onClick={() => openAuthModal('login')}
                className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold transition-all min-h-[40px]"
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {/* Section 1: Continue Learning (Real Active Course) */}
        {isAuthenticated && activeCourse && (
          <div className="rounded-3xl p-5 sm:p-7 bg-[#0d1322] border border-indigo-500/30 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      Active Course
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-emerald-400 font-bold">In Progress</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white truncate">
                    {activeCourse.title || activeCourse.topic}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => onSelectCourse && onSelectCourse(activeCourse)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 shrink-0 min-h-[40px]"
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
              <div className="rounded-3xl p-5 sm:p-6 bg-[#0d1322] border border-white/10 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>My Saved Topics</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {savedTopics.length} Saved
                  </span>
                </div>

                {savedTopics.length === 0 ? (
                  <div className="p-8 text-center space-y-2 rounded-2xl bg-[#080c14] border border-white/5">
                    <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-300">No saved topics yet</p>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                      Search any concept above and click "Save Topic" to build your personalized library.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedTopics.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => onSelectTopic && onSelectTopic(item.topic || item.title)}
                        className="p-3.5 rounded-2xl bg-[#080c14] border border-white/5 hover:border-indigo-500/40 hover:bg-[#0e1424] transition-all flex items-center justify-between cursor-pointer group min-h-[44px]"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-xs font-bold shrink-0 group-hover:scale-105 transition-transform">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                              {item.topic || item.title}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {item.level || 'Beginner'} • Saved
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0 ml-2">
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Courses Overview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-3xl p-5 sm:p-6 bg-[#0d1322] border border-white/10 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>My Courses</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    {savedCourses.length} Created
                  </span>
                </div>

                {savedCourses.length === 0 ? (
                  <div className="p-8 text-center space-y-3 rounded-2xl bg-[#080c14] border border-white/5">
                    <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-300">No courses generated yet</p>
                    <p className="text-[11px] text-slate-500">
                      Need to learn an entire subject? Generate a 7 to 30-day curriculum with one click.
                    </p>
                    <button
                      onClick={onCreateCourse}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md min-h-[36px]"
                    >
                      Create First Course
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedCourses.map((c, idx) => (
                      <div
                        key={idx}
                        onClick={() => onSelectCourse && onSelectCourse(c)}
                        className="p-3.5 rounded-2xl bg-[#080c14] border border-white/5 hover:border-indigo-500/40 hover:bg-[#0e1424] transition-all flex items-center justify-between cursor-pointer group min-h-[44px]"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                            {c.title || c.topic}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {c.modules?.length || 0} Modules • {c.level || 'Beginner'}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0" />
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
