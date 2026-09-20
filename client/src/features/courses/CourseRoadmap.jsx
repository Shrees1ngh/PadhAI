import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  Edit3,
  Download,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  HelpCircle,
  FileText,
  Sparkles,
  Award,
  ArrowRight,
  Lock
} from 'lucide-react';

export const CourseRoadmap = ({
  course,
  onSelectLesson,
  onEditPlan,
  onOpenStudyPlan,
  onOpenResources,
}) => {
  const [activeTab, setActiveTab] = useState('roadmap'); // 'roadmap' | 'study-plan' | 'resources'
  const [expandedModules, setExpandedModules] = useState({ 0: true, 1: true });

  if (!course) {
    return (
      <div className="rounded-3xl p-12 bg-[#0d1322] border border-white/10 text-center max-w-2xl mx-auto my-12">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No Active Course Selected</h3>
        <p className="text-xs text-slate-400 mb-6">Create a personalized course outline to unlock your full learning roadmap.</p>
        <button
          onClick={onEditPlan}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
        >
          Create New Course Plan
        </button>
      </div>
    );
  }

  const toggleModule = (idx) => {
    setExpandedModules((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const modules = course.modules || [];
  const level = course.level || course.setupParams?.currentLevel || 'Beginner';
  const duration = course.durationWeeks ? `${course.durationWeeks * 7} Days` : (course.setupParams?.durationDays ? `${course.setupParams.durationDays} Days` : '30 Days');
  const dailyTime = course.setupParams?.dailyStudyTime || '2 hours/day';
  const goal = course.setupParams?.learningGoal || 'Placement Focus';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Container */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[#0d1322] border border-white/10 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Your Personalized Course
            </h2>
            <h3 className="text-base sm:text-lg font-bold text-indigo-300 mt-1">
              {course.title || course.topic || 'Data Structures and Algorithms'}
            </h3>

            {/* Badges line */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] font-semibold text-slate-300">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {level}
              </span>
              <span className="text-slate-400">•</span>
              <span>{duration}</span>
              <span className="text-slate-400">•</span>
              <span>{dailyTime}</span>
              <span className="text-slate-400">•</span>
              <span className="text-purple-300">{goal}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onEditPlan}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center space-x-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Plan</span>
            </button>

            <button
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(course, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `${(course.title || 'course').replace(/\s+/g, '_')}_plan.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Plan</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center space-x-2 mt-6 border-b border-white/5 pb-2">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'roadmap'
                ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Roadmap
          </button>
          <button
            onClick={() => {
              setActiveTab('study-plan');
              if (onOpenStudyPlan) onOpenStudyPlan();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'study-plan'
                ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Study Plan
          </button>
          <button
            onClick={() => {
              setActiveTab('resources');
              if (onOpenResources) onOpenResources();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'resources'
                ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Resources
          </button>
        </div>
      </div>

      {/* Module Tree / Roadmap View */}
      <div className="space-y-4">
        {modules.map((module, mIdx) => {
          const isExpanded = !!expandedModules[mIdx];
          const lessons = module.lessons || [];
          const completedLessons = lessons.filter((l) => l.isCompleted || mIdx === 0).length;
          const isModuleCompleted = completedLessons === lessons.length && lessons.length > 0;
          const isInProgress = mIdx === 1 || (!isModuleCompleted && completedLessons > 0);

          return (
            <div
              key={mIdx}
              className="rounded-2xl bg-[#0b0f19] border border-white/5 overflow-hidden transition-all hover:border-white/10"
            >
              {/* Module Header Bar */}
              <div
                onClick={() => toggleModule(mIdx)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] select-none"
              >
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isModuleCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isInProgress
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-white/5 text-slate-400 border border-white/10'
                    }`}
                  >
                    {isModuleCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : mIdx + 1}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>Module {mIdx + 1}: {module.title}</span>
                    </h4>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      isModuleCompleted
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : isInProgress
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {completedLessons}/{lessons.length} completed
                  </span>

                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Module Lessons List */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/5 px-5 py-3 space-y-2 bg-[#080c14]/40"
                  >
                    {lessons.map((lesson, lIdx) => {
                      const isCompleted = mIdx === 0 || (mIdx === 1 && lIdx < 2);
                      const isCurrent = mIdx === 1 && lIdx === 2;

                      return (
                        <div
                          key={lIdx}
                          onClick={() => onSelectLesson(mIdx, lIdx)}
                          className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                            isCurrent
                              ? 'bg-indigo-600/20 border border-indigo-500/40 text-white shadow-sm'
                              : 'bg-white/[0.02] border border-white/5 hover:border-white/15 text-slate-300 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isCompleted
                                  ? 'text-emerald-400 bg-emerald-500/20'
                                  : isCurrent
                                  ? 'text-indigo-300 bg-indigo-500/30'
                                  : 'text-slate-400 bg-white/5'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                `${lIdx + 1}`
                              )}
                            </div>
                            <span className="text-xs font-semibold">{lesson.title}</span>
                          </div>

                          <div className="flex items-center space-x-3">
                            {isCurrent && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300">
                                In Progress
                              </span>
                            )}
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseRoadmap;
