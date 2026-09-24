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
  UserPlus,
  Terminal,
  Cpu,
  Brain,
  ShieldCheck,
  Compass,
  Star
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { HeroBackground } from './HeroBackground';
import PlatformShowcase from './PlatformShowcase';
import DomainExplorer from './DomainExplorer';
import BentoFeatures from './BentoFeatures';

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

  const handleChipClick = (topicName, level = selectedLevel) => {
    setSearchInput(topicName);
    if (!isAuthenticated) {
      openAuthModal('signup');
      return;
    }
    if (onStartQuickLearn) {
      onStartQuickLearn(topicName, level);
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
    <section className="relative pt-2 sm:pt-4 pb-20 sm:pb-24 space-y-16 sm:space-y-24 overflow-hidden select-none">
      
      <HeroBackground />

      {/* ======================================================== */}
      {/* 1. HERO TITLE & MAIN SEARCH BAR */}
      {/* ======================================================== */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 sm:space-y-8 relative z-10">

        {/* Glow Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#161b22] border border-[#30363d] shadow-inner text-xs font-semibold text-[#58a6ff] hover:border-[#58a6ff]/50 transition-all cursor-default"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#58a6ff] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1f6feb]"></span>
          </span>
          <span className="text-[#8b949e]">Powered by Next-Gen AI •</span>
          <span className="text-[#e6edf3]">Interactive Computer Science Lab</span>
        </motion.div>

        {/* Hero Title */}
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#e6edf3] tracking-tight leading-[1.15]"
          >
            Master Any CS Concept,{' '}
            <span className="bg-gradient-to-r from-[#58a6ff] via-[#79c0ff] to-[#a371f7] bg-clip-text text-transparent">
              Algorithm, or System
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#8b949e] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
          >
            Type any programming concept, data structure, or upload your syllabus PDF. PadhAI instantly generates visual mental models, live code dry-runs, 3D flashcards, and step-by-step intuition.
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
            className="p-2 rounded-xl bg-[#161b22] border border-[#30363d] focus-within:border-[#58a6ff] focus-within:ring-2 focus-within:ring-[#1f6feb]/20 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2 transition-all"
          >
            <div className="flex-1 flex items-center space-x-3 px-3 py-1 w-full min-w-0">
              <Search className="w-5 h-5 text-[#58a6ff] shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search any concept (e.g. Red-Black Tree, Paging, Raft Consensus)..."
                className="w-full bg-transparent text-sm sm:text-base text-[#e6edf3] placeholder-[#6e7681] focus:outline-none py-2 px-1 min-h-[44px]"
              />
            </div>

            {/* Level Pill in Search */}
            <div className="flex items-center justify-center gap-1 bg-[#0d1117] border border-[#30363d] p-1 rounded-lg shrink-0">
              {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all min-h-[34px] cursor-pointer ${
                    selectedLevel === lvl
                      ? 'bg-[#1f6feb] text-white shadow-sm'
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
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#1f6feb] hover:bg-[#388bfd] text-white text-sm sm:text-base font-semibold transition-all flex items-center justify-center space-x-2 shrink-0 min-h-[44px] shadow-[0_0_20px_rgba(31,111,235,0.4)] cursor-pointer"
            >
              <span>Learn Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Popular Suggestions */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-3 text-xs sm:text-sm">
            <span className="text-[#6e7681] font-medium mr-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#58a6ff]" />
              Trending:
            </span>
            {POPULAR_SUGGESTIONS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => handleChipClick(topic)}
                className="px-3 py-1 rounded-full bg-[#161b22] hover:bg-[#1f6feb]/15 border border-[#30363d] hover:border-[#58a6ff]/60 text-[#8b949e] hover:text-[#58a6ff] transition-all text-xs font-medium cursor-pointer"
              >
                {topic}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Secondary Major Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-1">
          <button
            onClick={() => handleProtectedAction(onCreateCourse)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] hover:border-[#8b949e] text-[#e6edf3] text-sm font-semibold transition-all flex items-center justify-center space-x-2 group cursor-pointer"
          >
            <div className="w-6 h-6 rounded bg-[#1f6feb]/10 text-[#58a6ff] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <span>Generate Full Curriculum</span>
          </button>

          <button
            onClick={() => handleProtectedAction(onStudyNotes)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] hover:border-[#8b949e] text-[#e6edf3] text-sm font-semibold transition-all flex items-center justify-center space-x-2 group cursor-pointer"
          >
            <div className="w-6 h-6 rounded bg-[#3fb950]/10 text-[#3fb950] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <FileUp className="w-3.5 h-3.5" />
            </div>
            <span>Upload Notes / Syllabus PDF</span>
          </button>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 2. AUTHENTICATED USER'S RECENT DASHBOARD (IF LOGGED IN) */}
      {/* ======================================================== */}
      {isAuthenticated && (activeCourse || savedTopics.length > 0 || savedCourses.length > 0) && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 relative z-10">
          
          {/* Active Course Resume Banner */}
          {activeCourse && (
            <div className="rounded-xl p-5 sm:p-6 bg-[#161b22] border border-[#30363d] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-[#1f6feb] text-white flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#58a6ff]">
                      Active Study Track
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]" />
                    <span className="text-xs text-[#3fb950] font-semibold">In Progress</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#e6edf3] truncate">
                    {activeCourse.title || activeCourse.topic}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => onSelectCourse && onSelectCourse(activeCourse)}
                className="px-5 py-2 rounded-lg bg-[#1f6feb] hover:bg-[#388bfd] text-white text-sm font-semibold transition-colors flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
              >
                <span>Resume Lesson</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Saved Topics & Saved Courses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Saved Topics */}
            {savedTopics.length > 0 && (
              <div className="rounded-xl p-5 bg-[#161b22] border border-[#30363d] space-y-3">
                <div className="flex items-center justify-between border-b border-[#21262d] pb-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8b949e] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#58a6ff]" />
                    <span>My Saved Topics ({savedTopics.length})</span>
                  </h4>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {savedTopics.slice(0, 5).map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => onSelectTopic && onSelectTopic(item.topic || item.title)}
                      className="p-2.5 rounded-lg bg-[#0d1117] border border-[#21262d] hover:border-[#1f6feb] hover:bg-[#161b22] transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <span className="text-xs font-semibold text-[#e6edf3] group-hover:text-[#58a6ff] truncate">
                        {item.topic || item.title}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#30363d] group-hover:text-[#58a6ff] shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Courses */}
            {savedCourses.length > 0 && (
              <div className="rounded-xl p-5 bg-[#161b22] border border-[#30363d] space-y-3">
                <div className="flex items-center justify-between border-b border-[#21262d] pb-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#8b949e] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#58a6ff]" />
                    <span>My Curriculums ({savedCourses.length})</span>
                  </h4>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {savedCourses.slice(0, 5).map((c, idx) => (
                    <div
                      key={idx}
                      onClick={() => onSelectCourse && onSelectCourse(c)}
                      className="p-2.5 rounded-lg bg-[#0d1117] border border-[#21262d] hover:border-[#1f6feb] hover:bg-[#161b22] transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <span className="text-xs font-semibold text-[#e6edf3] group-hover:text-[#58a6ff] truncate">
                        {c.title || c.topic}
                      </span>
                      <span className="text-[10px] text-[#6e7681] shrink-0 font-mono">
                        {c.modules?.length || 0} mods
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. INTERACTIVE PLATFORM SHOWCASE (LIVE DEMO TABS) */}
      {/* ======================================================== */}
      <div className="relative z-10">
        <PlatformShowcase
          onStartQuickLearn={(topic, lvl) => handleChipClick(topic, lvl)}
          onCreateCourse={() => handleProtectedAction(onCreateCourse)}
        />
      </div>

      {/* ======================================================== */}
      {/* 4. CURATED DOMAIN TRACKS EXPLORER */}
      {/* ======================================================== */}
      <div className="relative z-10">
        <DomainExplorer
          onSelectTopic={(topic, lvl) => handleChipClick(topic, lvl)}
        />
      </div>

      {/* ======================================================== */}
      {/* 5. BENTO GRID CAPABILITIES */}
      {/* ======================================================== */}
      <div className="relative z-10">
        <BentoFeatures
          onStartQuickLearn={(topic, lvl) => handleChipClick(topic, lvl)}
          onCreateCourse={() => handleProtectedAction(onCreateCourse)}
          onStudyNotes={() => handleProtectedAction(onStudyNotes)}
        />
      </div>

      {/* ======================================================== */}
      {/* 6. HOW PADHAI WORKS (3-STEP TIMELINE) */}
      {/* ======================================================== */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10 relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wide">
            <Compass className="w-3.5 h-3.5" />
            <span>The Mastery Loop</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#e6edf3]">
            How PadhAI Turns Confusion Into Clarity
          </h2>
          <p className="text-sm text-[#8b949e] max-w-xl mx-auto">
            Traditional rote learning fades in 48 hours. PadhAI's 3-step synthesis cements concepts in your long-term memory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] relative space-y-4 hover:border-[#58a6ff]/50 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-[#1f6feb]/20 text-[#58a6ff] border border-[#1f6feb]/40 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="text-base font-bold text-[#e6edf3] group-hover:text-[#58a6ff] transition-colors">
              Input Topic or Upload Notes
            </h3>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              Enter any concept from DP algorithms to distributed consensus, or drop your university PDF slides. PadhAI analyzes the core learning outcomes instantly.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] relative space-y-4 hover:border-[#a371f7]/50 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-[#a371f7]/20 text-[#d2a8ff] border border-[#a371f7]/40 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="text-base font-bold text-[#e6edf3] group-hover:text-[#d2a8ff] transition-colors">
              Multi-Modal Visual Synthesis
            </h3>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              PadhAI builds a step-by-step mental model, interactive code visualizer, dry-run stack trace, and practical real-world production analogies.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] relative space-y-4 hover:border-[#3fb950]/50 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-[#3fb950]/20 text-[#3fb950] border border-[#3fb950]/40 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="text-base font-bold text-[#e6edf3] group-hover:text-[#3fb950] transition-colors">
              Active Recall & Spaced Retention
            </h3>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              Cement your knowledge with 3D flashcards, socratic counter-questions, and rapid cheatsheets ready for your semester exams and interviews.
            </p>
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* 7. TRUST METRICS BAR */}
      {/* ======================================================== */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#161b22] border border-[#30363d] grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#58a6ff] font-mono">460+</div>
            <div className="text-xs text-[#8b949e] font-medium">CS Core Topics Indexed</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#7ee787] font-mono">&lt; 2.5s</div>
            <div className="text-xs text-[#8b949e] font-medium">Synthesis Latency</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#d2a8ff] font-mono">94.2%</div>
            <div className="text-xs text-[#8b949e] font-medium">Active Retention Rate</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">100%</div>
            <div className="text-xs text-[#8b949e] font-medium">Free for Students</div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 8. RADIANT BOTTOM CALL TO ACTION */}
      {/* ======================================================== */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#161b22] to-[#0d1117] border border-[#30363d] text-center space-y-6 overflow-hidden shadow-2xl">
          {/* Subtle Glow Backdrop */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#1f6feb]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1f6feb]/20 text-[#58a6ff] text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Ready to Level Up?</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#e6edf3]">
              Stop Memorizing. Start Understanding.
            </h2>
            <p className="text-sm sm:text-base text-[#8b949e] max-w-xl mx-auto">
              Join thousands of engineers and students mastering Computer Science concepts with interactive AI guidance.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-6 py-3 rounded-xl bg-[#1f6feb] hover:bg-[#388bfd] text-white text-sm sm:text-base font-bold transition-all shadow-[0_0_24px_rgba(31,111,235,0.4)] cursor-pointer"
                >
                  Create Free Account
                </button>
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-6 py-3 rounded-xl bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#e6edf3] text-sm sm:text-base font-semibold transition-all cursor-pointer"
                >
                  Sign In
                </button>
              </>
            ) : (
              <button
                onClick={() => handleProtectedAction(onCreateCourse)}
                className="px-6 py-3 rounded-xl bg-[#1f6feb] hover:bg-[#388bfd] text-white text-sm sm:text-base font-bold transition-all shadow-[0_0_24px_rgba(31,111,235,0.4)] cursor-pointer"
              >
                Generate New Curriculum
              </button>
            )}
          </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;
