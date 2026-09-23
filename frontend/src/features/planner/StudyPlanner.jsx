import React from 'react';
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
  PlayCircle,
  Plus,
  Check
} from 'lucide-react';

export const StudyPlanner = ({
  activeCourse = null,
  onSelectTopic,
  onCreateCourse,
  onSelectLesson,
}) => {
  // Derive days directly from activeCourse.days or fallback to sequential module lessons
  const planDays = [];
  if (activeCourse?.days && activeCourse.days.length > 0) {
    activeCourse.days.forEach((d) => {
      planDays.push({
        day: d.day,
        title: d.title,
        moduleTitle: d.moduleTitle || 'Core Curriculum',
        objective: d.learningObjective,
        lessons: d.lessons || [],
      });
    });
  } else if (activeCourse?.modules) {
    let dayCount = 1;
    activeCourse.modules.forEach((mod) => {
      mod.lessons?.forEach((less) => {
        planDays.push({
          day: dayCount++,
          title: less.title,
          moduleTitle: mod.title,
          objective: less.learningObjective,
          lessons: [less],
        });
      });
    });
  }

  if (!activeCourse || planDays.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="rounded-3xl p-10 bg-[#0d1322] border border-white/10 shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">No Active Study Plan</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Create a personalized multi-day course to automatically generate a day-by-day study roadmap.
            </p>
          </div>
          <button
            onClick={onCreateCourse}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-600/30 inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create a Course</span>
          </button>
        </div>
      </div>
    );
  }

  const durationDays = activeCourse?.durationDays || activeCourse?.setupParams?.durationDays || planDays.length;
  const pace = activeCourse?.setupParams?.dailyStudyTime || '2 hours/day';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Container */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[#0d1322] border border-white/10 shadow-2xl space-y-6">
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div>
            <span className="text-sm font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {activeCourse.setupParams?.currentLevel || 'Beginner'} • {durationDays} Days Pace
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2 flex items-center space-x-2.5">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <span>{activeCourse.title || activeCourse.topic} — Day-Wise Schedule</span>
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Target Duration: {durationDays} Days • Daily Commitment: {pace}
            </p>
          </div>

          <span className="text-sm font-bold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 self-start sm:self-auto">
            {planDays.length} Days Planned
          </span>
        </div>

        {/* Schedule List */}
        <div className="space-y-3">
          {planDays.map((item, dIdx) => (
            <div
              key={item.day || dIdx}
              onClick={() => {
                if (onSelectLesson) {
                  onSelectLesson(0, 0); // Open active lesson viewer
                } else if (onSelectTopic) {
                  onSelectTopic(item.title);
                }
              }}
              className="p-4 rounded-2xl border border-white/5 hover:border-indigo-500/40 bg-[#080c14] hover:bg-[#0e1424] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
            >
              <div className="flex items-start space-x-3.5 min-w-0">
                <span className="px-2.5 py-1 rounded-xl text-sm font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0 mt-0.5">
                  Day {item.day}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                    {item.title}
                  </p>
                  {item.objective && (
                    <p className="text-sm text-slate-400 truncate mt-0.5">
                      {item.objective}
                    </p>
                  )}
                  {item.lessons?.length > 1 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.lessons.map((les, lIdx) => (
                        <span key={lIdx} className="text-sm px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-300">
                          {les.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                <span className="text-sm text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Start Day {item.day}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyPlanner;


