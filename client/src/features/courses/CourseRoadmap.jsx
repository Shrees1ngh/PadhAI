import React, { useState, useEffect, useMemo } from 'react';
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
  Calendar,
  Check,
  Target
} from 'lucide-react';
import { fetchCourseProgress } from '../../services/api';

export const CourseRoadmap = ({
  course,
  onSelectLesson,
  onEditPlan,
  onOpenStudyPlan,
  onOpenResources,
}) => {
  const [activeTab, setActiveTab] = useState('days'); // 'days' | 'modules' | 'resources'
  const [expandedItems, setExpandedItems] = useState({ 0: true, 1: true });
  const [progressData, setProgressData] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // Fetch real progress from backend
  useEffect(() => {
    const loadProgress = async () => {
      const courseId = course?._id || course?.id;
      if (!courseId) return;

      try {
        setLoadingProgress(true);
        const res = await fetchCourseProgress(courseId);
        if (res?.success && res.data) {
          setProgressData(res.data);
        }
      } catch (err) {
        console.warn('Could not fetch course progress:', err.message);
      } finally {
        setLoadingProgress(false);
      }
    };

    loadProgress();
  }, [course?._id, course?.id]);

  // Set of completed lesson keys: `${moduleIndex}_${lessonIndex}`
  const completedKeys = useMemo(() => {
    const set = new Set();
    (progressData?.completedLessons || []).forEach((l) => {
      set.add(`${l.moduleIndex}_${l.lessonIndex}`);
    });
    return set;
  }, [progressData]);

  if (!course) {
    return (
      <div className="rounded-3xl p-8 sm:p-12 bg-[#0d1322] border border-white/10 text-center max-w-2xl mx-auto my-8 sm:my-12">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No Active Course Selected</h3>
        <p className="text-xs text-slate-400 mb-6">Create a personalized course outline to unlock your full learning roadmap.</p>
        <button
          onClick={onEditPlan}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 min-h-[44px]"
        >
          Create New Course Plan
        </button>
      </div>
    );
  }

  const toggleItem = (idx) => {
    setExpandedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const modules = course.modules || [];
  const days = course.days || [];
  const durationDays = course.durationDays || course.setupParams?.durationDays || days.length || 10;
  const level = course.level || course.setupParams?.currentLevel || 'Beginner';
  const duration = `${durationDays} Days`;
  const dailyTime = course.setupParams?.dailyStudyTime || '2 hours/day';

  // Calculate total lessons and real completion
  let totalLessonsCount = 0;
  modules.forEach((m) => {
    totalLessonsCount += (m.lessons || []).length;
  });
  if (totalLessonsCount === 0 && days.length > 0) {
    days.forEach((d) => {
      totalLessonsCount += (d.lessons || []).length;
    });
  }

  const completedCount = completedKeys.size;
  const completionPercentage = totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;

  // Map lesson title to module & lesson index
  const findLessonCoordinates = (lessonTitle, fallbackModIdx = 0, fallbackLessIdx = 0) => {
    for (let m = 0; m < modules.length; m++) {
      const lessons = modules[m].lessons || [];
      for (let l = 0; l < lessons.length; l++) {
        if (lessons[l].title === lessonTitle) {
          return { modIdx: m, lessIdx: l };
        }
      }
    }
    return { modIdx: fallbackModIdx, lessIdx: fallbackLessIdx };
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Container */}
      <div className="rounded-3xl p-5 sm:p-8 bg-[#0d1322] border border-white/10 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {level} • {duration} • {dailyTime}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2">
              {course.title || course.topic || 'Personalized Learning Course'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {course.description || `Structured ${durationDays}-day mastery roadmap designed for ${level} learners.`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={onEditPlan}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center space-x-1.5 min-h-[36px]"
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
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center space-x-1.5 min-h-[36px]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="p-4 rounded-2xl bg-[#080c14] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200">Course Progress</span>
            <span className="font-mono text-indigo-300 font-bold">
              {completedCount} / {totalLessonsCount} Lessons ({completionPercentage}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, completionPercentage)}%` }}
            />
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 border-b border-white/5 pb-2">
          <button
            onClick={() => setActiveTab('days')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 min-h-[36px] ${
              activeTab === 'days'
                ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Day-Wise Plan ({days.length || durationDays} Days)</span>
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 min-h-[36px] ${
              activeTab === 'modules'
                ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Modules & Chapters ({modules.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('resources');
              if (onOpenResources) onOpenResources();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 min-h-[36px] ${
              activeTab === 'resources'
                ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Resources</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: DAY-WISE SCHEDULE */}
      {activeTab === 'days' && (
        <div className="space-y-4">
          {(days.length > 0 ? days : Array.from({ length: durationDays })).map((dayItem, dIdx) => {
            const dayNum = dayItem?.day || dIdx + 1;
            const isExpanded = !!expandedItems[`day_${dIdx}`];
            const dayLessons = dayItem?.lessons || [];
            
            // Calculate completed lessons for this day
            let dayCompletedCount = 0;
            dayLessons.forEach((l, lIdx) => {
              const coords = findLessonCoordinates(l.title, 0, lIdx);
              if (completedKeys.has(`${coords.modIdx}_${coords.lessIdx}`)) {
                dayCompletedCount++;
              }
            });

            const isDayCompleted = dayLessons.length > 0 && dayCompletedCount === dayLessons.length;
            const isDayInProgress = !isDayCompleted && dayCompletedCount > 0;

            return (
              <div
                key={dIdx}
                className="rounded-2xl bg-[#0b0f19] border border-white/5 overflow-hidden transition-all hover:border-white/10"
              >
                {/* Day Header Bar */}
                <div
                  onClick={() => toggleItem(`day_${dIdx}`)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] select-none min-h-[56px]"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                        isDayCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isDayInProgress
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                      }`}
                    >
                      {isDayCompleted ? <Check className="w-4 h-4" /> : dayNum}
                    </div>

                    <div className="min-w-0 pr-2">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                        {dayItem?.title || `Day ${dayNum}: Core Concepts & Practice`}
                      </h4>
                      {dayItem?.learningObjective && (
                        <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">
                          {dayItem.learningObjective}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 ml-1">
                    <span
                      className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isDayCompleted
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : isDayInProgress
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          : 'bg-white/5 text-slate-400 border border-white/10'
                      }`}
                    >
                      {dayCompletedCount}/{dayLessons.length || 1} done
                    </span>

                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Day Lessons List */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 px-4 sm:px-5 py-3 space-y-2 bg-[#080c14]/40"
                    >
                      {(dayLessons.length > 0 ? dayLessons : [{ title: dayItem?.title || `Day ${dayNum} Lesson`, learningObjective: dayItem?.learningObjective }]).map((lesson, lIdx) => {
                        const coords = findLessonCoordinates(lesson.title, 0, lIdx);
                        const isCompleted = completedKeys.has(`${coords.modIdx}_${coords.lessIdx}`);

                        return (
                          <div
                            key={lIdx}
                            onClick={() => onSelectLesson(coords.modIdx, coords.lessIdx)}
                            className="p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 text-slate-300 hover:text-white min-h-[44px]"
                          >
                            <div className="flex items-center space-x-3 min-w-0 pr-2">
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                  isCompleted
                                    ? 'text-emerald-400 bg-emerald-500/20'
                                    : 'text-slate-400 bg-white/5'
                                }`}
                              >
                                {isCompleted ? <Check className="w-3 h-3" /> : `${lIdx + 1}`}
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-semibold truncate block">{lesson.title}</span>
                                {lesson.learningObjective && (
                                  <span className="text-[10px] text-slate-400 truncate block">{lesson.learningObjective}</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 shrink-0 ml-1">
                              {isCompleted && (
                                <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                  Completed
                                </span>
                              )}
                              <ArrowRight className="w-3.5 h-3.5 text-slate-500 hover:text-white" />
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
      )}

      {/* VIEW 2: MODULES & CHAPTERS */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          {modules.map((module, mIdx) => {
            const isExpanded = !!expandedItems[`mod_${mIdx}`];
            const lessons = module.lessons || [];
            
            // Calculate completed lessons for this module
            let modCompletedCount = 0;
            lessons.forEach((_, lIdx) => {
              if (completedKeys.has(`${mIdx}_${lIdx}`)) {
                modCompletedCount++;
              }
            });

            const isModuleCompleted = lessons.length > 0 && modCompletedCount === lessons.length;
            const isInProgress = !isModuleCompleted && modCompletedCount > 0;

            return (
              <div
                key={mIdx}
                className="rounded-2xl bg-[#0b0f19] border border-white/5 overflow-hidden transition-all hover:border-white/10"
              >
                {/* Module Header Bar */}
                <div
                  onClick={() => toggleItem(`mod_${mIdx}`)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] select-none min-h-[56px]"
                >
                  <div className="flex items-center space-x-3.5 min-w-0 pr-2">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                        isModuleCompleted
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isInProgress
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-white/5 text-slate-400 border border-white/10'
                      }`}
                    >
                      {isModuleCompleted ? <Check className="w-4 h-4" /> : mIdx + 1}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                        Module {mIdx + 1}: {module.title}
                      </h4>
                      {module.description && (
                        <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mt-0.5">{module.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 ml-1">
                    <span
                      className={`text-[9px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isModuleCompleted
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : isInProgress
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {modCompletedCount}/{lessons.length} done
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
                      className="border-t border-white/5 px-4 sm:px-5 py-3 space-y-2 bg-[#080c14]/40"
                    >
                      {lessons.map((lesson, lIdx) => {
                        const isCompleted = completedKeys.has(`${mIdx}_${lIdx}`);

                        return (
                          <div
                            key={lIdx}
                            onClick={() => onSelectLesson(mIdx, lIdx)}
                            className="p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 text-slate-300 hover:text-white min-h-[44px]"
                          >
                            <div className="flex items-center space-x-3 min-w-0 pr-2">
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                  isCompleted
                                    ? 'text-emerald-400 bg-emerald-500/20'
                                    : 'text-slate-400 bg-white/5'
                                }`}
                              >
                                {isCompleted ? <Check className="w-3 h-3" /> : `${lIdx + 1}`}
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-semibold block truncate">{lesson.title}</span>
                                {lesson.learningObjective && (
                                  <span className="text-[10px] text-slate-400 block truncate">{lesson.learningObjective}</span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 shrink-0 ml-1">
                              {isCompleted && (
                                <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                  Done
                                </span>
                              )}
                              <ArrowRight className="w-3.5 h-3.5 text-slate-500 hover:text-white" />
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
      )}

    </div>
  );
};

export default CourseRoadmap;
