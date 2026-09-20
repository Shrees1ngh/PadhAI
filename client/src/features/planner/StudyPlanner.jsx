import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Target,
  Sparkles,
  BookOpen,
  Circle,
  PlayCircle
} from 'lucide-react';

const SAMPLE_DAYS = [
  { day: 1, topic: 'Time and Space Complexity Analysis', status: 'completed' },
  { day: 2, topic: 'Arrays & Memory Layout Mechanics', status: 'in-progress' },
  { day: 3, topic: 'Singly and Doubly Linked Lists', status: 'not-started' },
  { day: 4, topic: 'Stacks: Monotonic Stack & Expression Parsing', status: 'not-started' },
  { day: 5, topic: 'Queues & Deques: Sliding Window Problems', status: 'not-started' },
  { day: 6, topic: 'Recursion Fundamentals & Call Stack Tracing', status: 'not-started' },
  { day: 7, topic: 'Backtracking: N-Queens & Subsets', status: 'not-started' },
  { day: 8, topic: 'Binary Search & Monotonic Search Spaces', status: 'not-started' },
  { day: 9, topic: 'Trees: Binary Trees & Tree Traversals', status: 'not-started' },
  { day: 10, topic: 'Binary Search Trees (BST) & Validation', status: 'not-started' },
];

export const StudyPlanner = ({ onSelectTopic }) => {
  const [days, setDays] = useState(SAMPLE_DAYS);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Container */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[#0d1322] border border-white/10 shadow-2xl space-y-6">
        
        {/* Title row */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span>30-Day Study Plan</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Data Structures and Algorithms • 2 hours/day Pace
            </p>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Day 2 of 30 (Today)
          </span>
        </div>

        {/* Schedule List */}
        <div className="space-y-3">
          {days.map((item) => (
            <div
              key={item.day}
              onClick={() => onSelectTopic && onSelectTopic(item.topic)}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                item.status === 'in-progress'
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-lg shadow-indigo-600/10'
                  : item.status === 'completed'
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-300'
                  : 'bg-[#080c14] border-white/5 text-slate-400 hover:border-white/15 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-12 text-center py-1 rounded-lg text-xs font-mono font-bold ${
                    item.status === 'in-progress'
                      ? 'bg-indigo-500 text-white'
                      : item.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/5 text-slate-400'
                  }`}
                >
                  Day {item.day}
                </div>

                <span className="text-xs sm:text-sm font-semibold">{item.topic}</span>
              </div>

              <div>
                {item.status === 'completed' && (
                  <span className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Completed</span>
                  </span>
                )}
                {item.status === 'in-progress' && (
                  <span className="flex items-center space-x-1.5 text-xs font-bold text-indigo-300">
                    <ArrowRight className="w-4 h-4" />
                    <span>In Progress</span>
                  </span>
                )}
                {item.status === 'not-started' && (
                  <span className="flex items-center space-x-1.5 text-xs font-medium text-slate-400">
                    <Circle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Not started</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Today's Goal Highlight Alert Box (Screen 10 footer) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 border border-amber-500/30 flex items-center space-x-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Today's goal
            </p>
            <p className="text-xs sm:text-sm font-bold text-white mt-0.5">
              Complete Arrays lesson + 5 quiz questions.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudyPlanner;
