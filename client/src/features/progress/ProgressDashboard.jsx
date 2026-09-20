import React, { useState } from 'react';
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
  Target
} from 'lucide-react';

export const ProgressDashboard = ({ onContinueLearning }) => {
  const [goals, setGoals] = useState([
    { id: 1, text: 'Complete Arrays lesson', done: true },
    { id: 2, text: 'Solve 5 quiz questions', done: false },
    { id: 3, text: 'Watch recommended video', done: false },
    { id: 4, text: 'Revise key points', done: false },
  ]);

  const toggleGoal = (id) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g))
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          My Progress
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Keep going! You're doing great.
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Circular Progress Gauge */}
        <div className="rounded-3xl p-5 bg-[#0d1322] border border-white/10 flex items-center space-x-4 shadow-xl">
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/5"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-cyan-400"
                strokeDasharray="72, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-black text-white">72%</span>
          </div>
          <div>
            <p className="text-lg font-black text-white">72%</p>
            <p className="text-[11px] text-slate-400 font-semibold">Overall Progress</p>
          </div>
        </div>

        {/* Metric 2: Lessons Completed */}
        <div className="rounded-3xl p-5 bg-[#0d1322] border border-white/10 flex items-center space-x-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-lg font-black text-white">8/12</p>
            <p className="text-[11px] text-slate-400 font-semibold">Lessons Completed</p>
          </div>
        </div>

        {/* Metric 3: Questions Solved */}
        <div className="rounded-3xl p-5 bg-[#0d1322] border border-white/10 flex items-center space-x-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-lg font-black text-white">32</p>
            <p className="text-[11px] text-slate-400 font-semibold">Questions Solved</p>
          </div>
        </div>

        {/* Metric 4: Day Streak */}
        <div className="rounded-3xl p-5 bg-[#0d1322] border border-white/10 flex items-center space-x-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-lg font-black text-white">12</p>
            <p className="text-[11px] text-slate-400 font-semibold">Day Streak 🔥</p>
          </div>
        </div>

      </div>

      {/* Main 2-Column Split: Learning Health & Today's Goal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Learning Health Analysis (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl p-6 sm:p-8 bg-[#0d1322] border border-white/10 shadow-xl space-y-6">
            
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Learning Health</h3>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Optimal Retention
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
                      strokeDasharray="78, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-sm font-black text-white">78%</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Mastery Index</p>
                  <p className="text-[11px] text-slate-400">Based on quiz attempts & completion speed</p>
                </div>
              </div>

              {/* Strong vs Needs Revision breakdown */}
              <div className="space-y-3 bg-[#080c14] p-4 rounded-2xl border border-white/5 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Strong
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="flex items-center space-x-1 text-slate-200">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Arrays</span>
                    </span>
                    <span className="flex items-center space-x-1 text-slate-200">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Linked Lists</span>
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Needs Revision
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="flex items-center space-x-1 text-slate-200">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>Recursion</span>
                    </span>
                    <span className="flex items-center space-x-1 text-slate-200">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>Complexity</span>
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* AI Recommendation Alert */}
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center space-x-3 text-xs">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="font-bold text-indigo-300">AI Recommendation: </span>
                <span className="text-slate-300">"Revise recursion and tree traversal before starting non-linear structures."</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Today's Goal Checklist (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl p-6 sm:p-8 bg-[#0d1322] border border-white/10 shadow-xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-bold text-white">Today's Goal</h3>
              <span className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-indigo-400" />
                <span>Mon, 20 Sep</span>
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
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-300 line-through opacity-80'
                      : 'bg-[#080c14] border-white/5 text-white hover:border-white/15'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                      g.done
                        ? 'bg-emerald-500 border-emerald-400 text-slate-900'
                        : 'border-slate-400'
                    }`}
                  >
                    {g.done && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="truncate">{g.text}</span>
                </div>
              ))}
            </div>

            {/* Action CTA */}
            <button
              onClick={onContinueLearning}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 mt-4"
            >
              <span>Continue Learning</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        </div>

      </div>

    </div>
  );
};

export default ProgressDashboard;
