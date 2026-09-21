import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  BookOpen,
  CheckCircle2,
  Flame,
  Award,
  Sparkles,
  AlertTriangle,
  Check,
  ArrowRight,
  Clock,
  Calendar,
  Zap,
  Target,
  Loader2,
  PlayCircle,
  BarChart3,
  Layers,
  GraduationCap
} from 'lucide-react';
import { fetchEnrolledCoursesProgress } from '../../services/api';

export const ProgressDashboard = ({ onContinueLearning, onSelectCourse }) => {
  const [progressData, setProgressData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Daily study checklist with persistence
  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem('padhai_daily_goals');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 1, text: 'Complete 1 daily lesson', done: false },
      { id: 2, text: 'Take a lesson concept quiz', done: false },
      { id: 3, text: 'Review flashcard deck', done: false },
      { id: 4, text: 'Ask AI Tutor 1 deep-dive question', done: false },
    ];
  });

  const toggleGoal = (id) => {
    setGoals((prev) => {
      const updated = prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g));
      try {
        localStorage.setItem('padhai_daily_goals', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const loadProgress = async () => {
    try {
      setIsLoading(true);
      const result = await fetchEnrolledCoursesProgress();
      if (result?.success && result.data) {
        const {
          courses = [],
          totalLessonsCompleted = 0,
          totalLessonsInAllCourses = 0,
          totalQuestionsAnswered = 0,
          strongTopics = [],
          weakTopics = [],
          overallStreak = { current: 0 }
        } = result.data;

        const totalLessons = totalLessonsInAllCourses || courses.reduce((sum, c) => sum + (c.totalLessons || 0), 0);
        const completionPercentage = totalLessons > 0
          ? Math.round((totalLessonsCompleted / totalLessons) * 100)
          : 0;

        // Dynamic mastery index based on actual progress & quiz answers
        const masteryIndex = totalLessons > 0
          ? Math.min(100, Math.round(completionPercentage * 0.7 + Math.min(30, totalQuestionsAnswered * 3)))
          : (totalQuestionsAnswered > 0 ? Math.min(100, totalQuestionsAnswered * 10) : 0);

        setProgressData({
          completionPercentage,
          totalLessonsCompleted,
          totalLessonsCount: totalLessons,
          totalQuestionsAnswered,
          streak: overallStreak?.current || 0,
          strongTopics,
          weakTopics,
          masteryIndex,
          courses,
        });
      } else {
        setProgressData({
          completionPercentage: 0,
          totalLessonsCompleted: 0,
          totalLessonsCount: 0,
          totalQuestionsAnswered: 0,
          streak: 0,
          strongTopics: [],
          weakTopics: [],
          masteryIndex: 0,
          courses: [],
        });
      }
    } catch (err) {
      console.warn('Could not load user progress:', err);
      setProgressData({
        completionPercentage: 0,
        totalLessonsCompleted: 0,
        totalLessonsCount: 0,
        totalQuestionsAnswered: 0,
        streak: 0,
        strongTopics: [],
        weakTopics: [],
        masteryIndex: 0,
        courses: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const data = progressData || {
    completionPercentage: 0,
    totalLessonsCompleted: 0,
    totalLessonsCount: 0,
    totalQuestionsAnswered: 0,
    streak: 0,
    strongTopics: [],
    weakTopics: [],
    masteryIndex: 0,
    courses: [],
  };

  const overallPct = data.completionPercentage ?? 0;
  const lessonsText = data.totalLessonsCount > 0
    ? `${data.totalLessonsCompleted} / ${data.totalLessonsCount}`
    : `${data.totalLessonsCompleted}`;
  const questionsCount = data.totalQuestionsAnswered ?? 0;
  const streakCount = data.streak ?? 0;
  const masteryPct = data.masteryIndex ?? 0;
  const strongTopics = data.strongTopics || [];
  const weakTopics = data.weakTopics || [];
  const courses = data.courses || [];

  const retentionLabel = masteryPct >= 70
    ? 'High Mastery'
    : masteryPct >= 35
    ? 'Building Momentum'
    : 'Starting Out';

  const retentionColorClass = masteryPct >= 70
    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
    : masteryPct >= 35
    ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
    : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <span className="text-sm text-slate-400 ml-3 font-semibold">Aggregating real-time learning metrics...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Learning Progress & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time tracking of your courses, completed topics, quiz performance, and study streak.
          </p>
        </div>

        {onContinueLearning && (
          <button
            onClick={onContinueLearning}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2 shrink-0 self-start sm:self-auto"
          >
            <span>Create / Resume Course</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Overall Progress */}
        <div className="rounded-3xl p-5 bg-[#0d1322] border border-white/10 flex items-center space-x-4 shadow-xl">
          <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/5"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-400"
                strokeDasharray={`${overallPct}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-[11px] font-black text-white">{overallPct}%</span>
          </div>
          <div className="min-w-0">
            <p className="text-xl font-black text-white truncate">{overallPct}%</p>
            <p className="text-[11px] text-slate-400 font-medium">Curriculum Progress</p>
          </div>
        </div>

        {/* Metric 2: Lessons Completed */}
        <div className="rounded-3xl p-5 bg-[#0d1322] border border-white/10 flex items-center space-x-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-black text-white truncate">{lessonsText}</p>
            <p className="text-[11px] text-slate-400 font-medium">Lessons Finished</p>
          </div>
        </div>

        {/* Metric 3: Questions Solved */}
        <div className="rounded-3xl p-5 bg-[#0d1322] border border-white/10 flex items-center space-x-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-black text-white truncate">{questionsCount}</p>
            <p className="text-[11px] text-slate-400 font-medium">Quiz Questions Solved</p>
          </div>
        </div>

        {/* Metric 4: Day Streak */}
        <div className="rounded-3xl p-5 bg-[#0d1322] border border-white/10 flex items-center space-x-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-black text-white truncate">{streakCount} Days</p>
            <p className="text-[11px] text-slate-400 font-medium">Learning Streak 🔥</p>
          </div>
        </div>

      </div>

      {/* Main Row: Active Courses Breakdown */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[#0d1322] border border-white/10 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Your Enrolled Courses ({courses.length})</h3>
          </div>
          {courses.length > 0 && (
            <span className="text-xs text-slate-400 font-medium">
              {courses.filter(c => c.completionPercentage === 100).length} of {courses.length} Completed
            </span>
          )}
        </div>

        {courses.length === 0 ? (
          <div className="py-12 text-center rounded-2xl bg-[#080c14] border border-white/5 space-y-3">
            <GraduationCap className="w-10 h-10 text-indigo-400 mx-auto opacity-70" />
            <h4 className="text-sm font-bold text-white">No courses generated yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create your first course in any subject to start tracking real-time mastery and milestones.
            </p>
            {onContinueLearning && (
              <button
                onClick={onContinueLearning}
                className="mt-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all inline-flex items-center space-x-1.5"
              >
                <span>Create New Course</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((c, idx) => {
              const pct = c.completionPercentage || 0;
              const isDone = pct === 100;

              return (
                <div
                  key={c.courseId || idx}
                  className="p-5 rounded-2xl bg-[#080c14] border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {c.category || 'Course'}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1.5 truncate">
                          {c.courseTitle || c.courseTopic}
                        </h4>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isDone
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-white/5 text-slate-300 border border-white/10'
                      }`}>
                        {isDone ? 'Completed' : `${pct}%`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>{c.completedLessons || 0} / {c.totalLessons || 0} Lessons</span>
                      <span>{c.quizAttemptsCount || 0} Quizzes</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-end">
                    <button
                      onClick={() => {
                        if (onSelectCourse) onSelectCourse(c);
                        else if (onContinueLearning) onContinueLearning(c);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>{pct > 0 ? 'Resume' : 'Start'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main 2-Column Split: Learning Health & Today's Goal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Learning Health Analysis (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl p-6 sm:p-8 bg-[#0d1322] border border-white/10 shadow-xl space-y-6">
            
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Concept Retention & Health</h3>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${retentionColorClass}`}>
                {retentionLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              
              {/* Radial Score */}
              <div className="flex items-center space-x-4">
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-white/5"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-400"
                      strokeDasharray={`${masteryPct}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-sm font-black text-white">{masteryPct}%</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Mastery Index</p>
                  <p className="text-[11px] text-slate-400">Calculated from lesson completions and quiz accuracy</p>
                </div>
              </div>

              {/* Strong vs Needs Revision breakdown */}
              <div className="space-y-3 bg-[#080c14] p-4 rounded-2xl border border-white/5 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Strong Concepts
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {strongTopics.length > 0 ? strongTopics.map((topic, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] font-semibold flex items-center space-x-1">
                        <Check className="w-2.5 h-2.5" />
                        <span className="truncate max-w-[140px]">{topic}</span>
                      </span>
                    )) : (
                      <span className="text-slate-500 italic text-[11px]">Pass quizzes (score ≥75%) to record strong topics</span>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Needs Revision
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {weakTopics.length > 0 ? weakTopics.map((topic, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-semibold flex items-center space-x-1">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        <span className="truncate max-w-[140px]">{topic}</span>
                      </span>
                    )) : (
                      <span className="text-slate-500 italic text-[11px]">No revision flags detected</span>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* AI Recommendation Alert */}
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center space-x-3 text-xs">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="font-bold text-indigo-300">AI Learning Insight: </span>
                <span className="text-slate-300">
                  {weakTopics.length > 0
                    ? `Review flashcards and concept summaries for ${weakTopics.slice(0, 2).join(' and ')}.`
                    : data.totalLessonsCompleted > 0
                    ? 'Consistent daily pace detected! Continue completing your active modules.'
                    : 'Start by generating or picking a course to build your personalized mastery path.'}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Today's Goal Checklist (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl p-6 sm:p-8 bg-[#0d1322] border border-white/10 shadow-xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white">Daily Learning Routine</h3>
              <span className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-indigo-400" />
                <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              </span>
            </div>

            {/* Checklist items */}
            <div className="space-y-2.5">
              {goals.map((g) => (
                <div
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center space-x-3 text-xs select-none ${
                    g.done
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400 line-through opacity-80'
                      : 'bg-[#080c14] border-white/5 text-white hover:border-white/15'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                      g.done
                        ? 'bg-emerald-500 border-emerald-400 text-slate-900'
                        : 'border-slate-500'
                    }`}
                  >
                    {g.done && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="truncate">{g.text}</span>
                </div>
              ))}
            </div>

            {/* Action CTA */}
            {onContinueLearning && (
              <button
                onClick={onContinueLearning}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 mt-4"
              >
                <span>Continue Active Course</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};

export default ProgressDashboard;
