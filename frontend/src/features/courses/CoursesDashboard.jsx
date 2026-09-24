import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  PlayCircle,
  BookOpen,
  Sparkles,
  Clock,
  Layers,
  Award,
  CheckCircle2,
  ArrowRight,
  Search,
  Calendar,
  ChevronRight,
  TrendingUp,
  Target
} from 'lucide-react';
import { fetchCourseProgress } from '../../services/api';

/**
 * Individual Course Card with dynamic progress fetching and rich metadata
 */
const CourseCard = ({
  course,
  isActive,
  onSelect,
  onResume,
  onViewRoadmap,
}) => {
  const [progress, setProgress] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  const courseId = course?._id || course?.id;

  // Calculate total lessons from module structure
  const totalLessons = useMemo(() => {
    let count = 0;
    (course?.modules || []).forEach((m) => {
      count += (m?.lessons || []).length;
    });
    return count || (course?.days || []).length || 1;
  }, [course]);

  // Fetch real progress from backend
  useEffect(() => {
    let isMounted = true;
    if (!courseId) return;

    const loadProg = async () => {
      try {
        setLoadingProgress(true);
        const res = await fetchCourseProgress(courseId);
        if (isMounted && res?.success && res.data) {
          setProgress(res.data);
        }
      } catch (err) {
        // Fallback gracefully without breaking UI
      } finally {
        if (isMounted) setLoadingProgress(false);
      }
    };

    loadProg();
    return () => {
      isMounted = false;
    };
  }, [courseId]);

  const completedCount = progress?.completedLessons?.length || 0;
  const percentage = Math.min(100, Math.round((completedCount / totalLessons) * 100));

  const level = course?.setupParams?.currentLevel || course?.level || 'Beginner';
  const durationDays = course?.setupParams?.durationDays || course?.durationDays || (course?.days || []).length || 30;
  const dailyTime = course?.setupParams?.dailyStudyTime || course?.estimatedDuration || '1-2 Hours/day';
  const totalModules = (course?.modules || []).length || (course?.days ? Math.ceil(course.days.length / 5) : 6);

  const isCompleted = percentage === 100 && totalLessons > 0;
  const isInProgress = completedCount > 0 && !isCompleted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`rounded-3xl p-6 bg-[#0d1322] border transition-all duration-300 flex flex-col justify-between relative overflow-hidden group shadow-xl ${
        isActive
          ? 'border-indigo-500/50 shadow-indigo-500/10 ring-1 ring-indigo-500/30'
          : 'border-white/10 hover:border-white/20'
      }`}
    >
      {/* Active course ambient highlight */}
      {isActive && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      )}

      <div className="space-y-4">
        {/* Top Badges & Status */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              {level}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/5">
              {durationDays} Days
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isActive && (
              <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span>Active</span>
              </span>
            )}

            {isCompleted ? (
              <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>Completed</span>
              </span>
            ) : isInProgress ? (
              <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
                <Clock className="w-3 h-3" />
                <span>In Progress</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold">
                Not Started
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <h3
            onClick={() => onSelect && onSelect(course)}
            className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {course.title || course.topic || 'Custom Course'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 mt-1.5 leading-relaxed font-normal">
            {course.description || `Comprehensive ${durationDays}-day personalized curriculum structured for ${level} students.`}
          </p>
        </div>

        {/* Meta Pills (Modules & Commitment) */}
        <div className="flex items-center gap-3 text-xs text-slate-400 pt-1 border-t border-white/5">
          <div className="flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>{totalModules} Modules</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span>{dailyTime}</span>
          </div>
        </div>

        {/* Progress Bar & Counter */}
        <div className="p-3.5 rounded-2xl bg-[#080c14] border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300">Completion</span>
            <span className="text-indigo-300 font-mono">
              {completedCount} / {totalLessons} Lessons ({percentage}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="flex items-center gap-2 pt-5 mt-4 border-t border-white/5">
        <button
          onClick={() => {
            if (onSelect) onSelect(course);
            if (onResume) onResume(course);
          }}
          className="flex-1 py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer min-h-[38px]"
        >
          <PlayCircle className="w-4 h-4 shrink-0" />
          <span>{completedCount > 0 ? 'Resume Course' : 'Start Course'}</span>
        </button>

        <button
          onClick={() => {
            if (onSelect) onSelect(course);
            if (onViewRoadmap) onViewRoadmap(course);
          }}
          className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all flex items-center justify-center space-x-1 cursor-pointer min-h-[38px]"
          title="View Roadmap & Syllabus"
        >
          <span>Roadmap</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

/**
 * Main Courses Hub / Dashboard
 */
export const CoursesDashboard = ({
  courses = [],
  activeCourse = null,
  onSelectCourse,
  onCreateCourse,
  onCreateNew,
  onResumeCourse,
  onResumeLesson,
  onViewRoadmap,
  onDeleteCourse,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');

  const handleCreate = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (typeof onCreateCourse === 'function') {
      onCreateCourse();
    } else if (typeof onCreateNew === 'function') {
      onCreateNew();
    } else {
      navigate('/course-wizard');
    }
  };

  // Filter courses by search and level
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const title = (c.title || c.topic || '').toLowerCase();
      const desc = (c.description || '').toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || title.includes(query) || desc.includes(query);

      const level = (c.setupParams?.currentLevel || c.level || 'Beginner').toLowerCase();
      const matchesLevel =
        levelFilter === 'All' || level === levelFilter.toLowerCase();

      return matchesSearch && matchesLevel;
    });
  }, [courses, searchQuery, levelFilter]);

  return (
    <div className="w-full space-y-6">
      {/* Clean Top Header */}
      <div className="pb-1">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
          <span>My Courses</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono font-medium">
            {courses.length}
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Select a course to view roadmap, continue lessons, or generate a new AI curriculum.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your courses by title or topic..."
            className="w-full bg-[#0d1322] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors min-h-[38px]"
          />
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer min-h-[32px] ${
                levelFilter === lvl
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Action Card: Create New Course */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          role="button"
          tabIndex={0}
          onClick={handleCreate}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleCreate(e)}
          className="rounded-3xl p-6 border-2 border-dashed border-white/15 hover:border-indigo-500/60 bg-[#0d1322]/40 hover:bg-[#0d1322] transition-all duration-300 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer min-h-[300px] group shadow-lg select-none"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition-transform duration-300">
            <Plus className="w-7 h-7" />
          </div>

          <div className="space-y-1.5 max-w-xs">
            <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
              Generate New Course
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Enter any CS concept, exam syllabus, or programming language to create a custom interactive roadmap with AI.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5 cursor-pointer pointer-events-auto"
          >
            <span>Start Generator</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </button>
        </motion.div>

        {/* Saved Courses Cards */}
        {filteredCourses.map((c, idx) => {
          const isCurrentActive =
            (c._id && activeCourse?._id && c._id === activeCourse._id) ||
            (c.id && activeCourse?.id && c.id === activeCourse.id) ||
            c.title === activeCourse?.title;

          return (
            <CourseCard
              key={c._id || c.id || idx}
              course={c}
              isActive={isCurrentActive}
              onSelect={onSelectCourse}
              onResume={onResumeCourse}
              onViewRoadmap={onViewRoadmap}
            />
          );
        })}
      </div>

      {/* Empty State if filter yields no courses */}
      {filteredCourses.length === 0 && courses.length > 0 && (
        <div className="p-12 text-center rounded-3xl bg-[#0d1322] border border-white/10 space-y-3">
          <p className="text-base font-bold text-slate-300">No courses match your filter.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setLevelFilter('All');
            }}
            className="text-xs text-indigo-400 hover:underline font-semibold"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default CoursesDashboard;
