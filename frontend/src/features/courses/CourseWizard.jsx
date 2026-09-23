import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Edit3,
  AlertCircle,
  Check,
  ChevronDown,
  Calendar,
  Target,
  GraduationCap,
  Play,
  Video,
  Zap,
  Globe,
  Compass
} from 'lucide-react';
import { generateCourseOutline, modifyCourseOutline, saveCourse } from '../../services/api';

const UNIVERSAL_INSPIRATION_CHIPS = [
  'Data Structures & Algorithms',
  'System Design & Architecture',
  'Advanced React & Node.js',
  'Machine Learning & AI',
  'Cloud Native & Kubernetes',
  'SQL & Database Normalization',
  'Dynamic Programming',
  'Microservices in Go',
  'Python for Data Science',
  'Web Security & OWASP',
  'Operating Systems Concepts',
  'Computer Networks',
];

const LEVEL_OPTIONS = [
  { id: 'Beginner', label: 'Beginner', desc: 'No prior background required' },
  { id: 'Intermediate', label: 'Intermediate', desc: 'Familiar with core basics' },
  { id: 'Advanced', label: 'Advanced', desc: 'Deep dive, rigor & edge cases' },
];

const GOAL_OPTIONS = [
  'Academic / University Coursework',
  'Competitive Exam & Entrance Prep',
  'Job / Tech Interview Mastery',
  'Self-Directed Intellectual Curiosity',
  'Practical Project Building & Upskilling',
];

const DURATION_OPTIONS = [
  { value: 7, label: '7 Days', tag: 'Crash Sprint' },
  { value: 14, label: '14 Days', tag: 'Fast Track' },
  { value: 30, label: '30 Days', tag: 'Full Mastery' },
  { value: 60, label: '60 Days', tag: 'Deep Dive' },
  { value: 90, label: '90 Days', tag: 'Specialization' },
];

const DAILY_TIME_OPTIONS = ['1 hour', '2 hours', '3 hours', '4+ hours'];

const PREFERENCE_PILLS = [
  { id: 'hands-on', label: 'Hands-on Practice & Problems' },
  { id: 'detailed', label: 'Deep Conceptual Intuition' },
  { id: 'exam', label: 'Exam & High-Yield Focus' },
  { id: 'concise', label: 'Concise & Structured Notes' },
];

export const CourseWizard = ({ onCourseSaved, onStartLearning }) => {
  // Wizard steps: 1 = Direct Input, 2 = AI Architecture Review
  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    topic: 'Data Structures & Algorithms',
    learningGoal: 'Academic / University Coursework',
    currentLevel: 'Beginner',
    durationDays: 30,
    dailyStudyTime: '2 hours',
    includeVideos: true,
    includeVisualizers: true,
    learningPreferences: ['hands-on', 'detailed'],
  });

  const [outline, setOutline] = useState(null);
  const [modificationPrompt, setModificationPrompt] = useState('');
  const [activeModuleIndex, setActiveModuleIndex] = useState(-1); // -1 = Day plan, >= 0 = Modules

  // Loading & statuses
  const [loading, setLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [modifying, setModifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const PROGRESS_MESSAGES = [
    "Analyzing subject scope & pedagogical objectives...",
    "Scaffolding day-by-day progression with Bloom's Taxonomy...",
    "Structuring module milestones & daily lesson competencies...",
    "Synthesizing curriculum into production JSON outline..."
  ];

  const togglePreference = (prefId) => {
    setFormData((prev) => {
      const exists = prev.learningPreferences.includes(prefId);
      return {
        ...prev,
        learningPreferences: exists
          ? prev.learningPreferences.filter((p) => p !== prefId)
          : [...prev.learningPreferences, prefId],
      };
    });
  };

  // Generate Course Outline using real Gemini
  const handleGenerateOutline = async (e) => {
    if (e) e.preventDefault();
    if (!formData.topic.trim()) {
      setError('Please enter what you want to learn.');
      return;
    }

    setLoading(true);
    setProgressStep(0);
    setError(null);

    const progressTimer = setInterval(() => {
      setProgressStep((prev) => (prev + 1) % PROGRESS_MESSAGES.length);
    }, 4000);

    const payload = {
      topic: formData.topic.trim(),
      category: 'Universal Learning',
      learningGoal: formData.learningGoal,
      currentLevel: formData.currentLevel,
      durationDays: Number(formData.durationDays),
      dailyStudyTime: formData.dailyStudyTime,
      includeVideos: formData.includeVideos,
      learningPreference: formData.learningPreferences.join(', '),
    };

    try {
      const res = await generateCourseOutline(payload);
      if (res?.success && res.outline) {
        setOutline(res.outline);
        setStep(2);
      } else {
        throw new Error(res?.message || 'Failed to generate course structure with Gemini.');
      }
    } catch (err) {
      console.error('Course generation error:', err);
      setError(err.message || 'Failed to generate course outline. Please check your API key.');
    } finally {
      clearInterval(progressTimer);
      setLoading(false);
    }
  };

  // Modify outline with natural language prompt
  const handleModifyOutline = async (e) => {
    if (e) e.preventDefault();
    if (!modificationPrompt.trim() || !outline) return;

    setModifying(true);
    setError(null);

    const setupParams = {
      topic: formData.topic.trim(),
      learningGoal: formData.learningGoal,
      currentLevel: formData.currentLevel,
      durationDays: Number(formData.durationDays),
      dailyStudyTime: formData.dailyStudyTime,
      includeVideos: formData.includeVideos,
      learningPreference: formData.learningPreferences.join(', '),
    };

    try {
      const res = await modifyCourseOutline({
        currentOutline: outline,
        modifications: modificationPrompt.trim(),
        setupParams,
      });

      if (res?.success && res.outline) {
        setOutline(res.outline);
        setModificationPrompt('');
      } else {
        throw new Error(res?.message || 'Could not apply modifications.');
      }
    } catch (err) {
      console.error('Modification error:', err);
      setError(err.message || 'Error modifying outline.');
    } finally {
      setModifying(false);
    }
  };

  // Save and launch course
  const handleStartCourse = async () => {
    if (!outline) return;

    setSaving(true);
    setError(null);

    const setupParams = {
      topic: formData.topic.trim(),
      learningGoal: formData.learningGoal,
      currentLevel: formData.currentLevel,
      durationDays: Number(formData.durationDays),
      dailyStudyTime: formData.dailyStudyTime,
      includeVideos: formData.includeVideos,
      learningPreference: formData.learningPreferences.join(', '),
    };

    try {
      const res = await saveCourse({
        outline,
        setupParams,
      });

      if (res?.success && res.course) {
        if (onCourseSaved) onCourseSaved(res.course);
        if (onStartLearning) onStartLearning(res.course, formData);
      } else {
        if (onStartLearning) onStartLearning(outline, formData);
      }
    } catch (err) {
      console.warn('Save notice on launch:', err.message);
      if (onStartLearning) onStartLearning(outline, formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Error display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start justify-between space-x-3"
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">System Notice: </span>
              {error}
            </div>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-200 text-xs font-bold px-1.5 py-0.5 rounded transition-colors"
          >
            ✕
          </button>
        </motion.div>
      )}

      <AnimatePresence mode="wait">

        {/* ======================================================== */}
        {/* STEP 1: UNIVERSAL COURSE GENERATOR */}
        {/* ======================================================== */}
        {step === 1 && (
          <motion.div
            key="step-form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="rounded-3xl p-6 sm:p-10 bg-[#0d1322] border border-white/10 shadow-2xl space-y-7"
          >
            {/* Header */}
            <div>
              <div className="flex items-center space-x-2 text-indigo-400 text-sm font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>AI Course Studio</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                What do you want to master?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Enter any programming concept, technology stack, or computer science fundamental.
              </p>
            </div>

            <form onSubmit={handleGenerateOutline} className="space-y-6">
              
              {/* 1. What do you want to learn? */}
              <div className="space-y-3">
                <input
                  type="text"
                  required
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g. System Design, React & Node, Operating Systems, Dynamic Programming..."
                  className="w-full bg-[#080c14] border border-white/10 rounded-2xl px-5 py-4 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                />

                {/* Diverse universal inspiration chips */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-sm font-medium text-slate-400">Popular topics to explore:</span>
                  <div className="flex flex-wrap gap-2">
                    {UNIVERSAL_INSPIRATION_CHIPS.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setFormData({ ...formData, topic: item })}
                        className={`text-sm px-4 py-2 rounded-xl border transition-all ${
                          formData.topic === item
                            ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/60 font-semibold'
                            : 'bg-[#080c14] text-slate-400 border-white/5 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Your Current Level */}
              <div className="space-y-2.5">
                <label className="block text-sm font-medium text-slate-300">
                  Your Current Level
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {LEVEL_OPTIONS.map((lvl) => {
                    const isSelected = formData.currentLevel === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, currentLevel: lvl.id })}
                        className={`p-3.5 rounded-2xl text-left border transition-all ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/20 ring-1 ring-indigo-500/40'
                            : 'bg-[#080c14] border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`text-sm font-medium ${isSelected ? 'text-indigo-300' : 'text-slate-200'}`}>
                            {lvl.label}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                        </div>
                        <span className="text-sm text-slate-400 block">{lvl.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Goal & Duration Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Learning Goal */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Primary Goal / Outcome
                  </label>
                  <div className="relative">
                    <select
                      value={formData.learningGoal}
                      onChange={(e) => setFormData({ ...formData, learningGoal: e.target.value })}
                      className="w-full bg-[#080c14] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none pr-10 cursor-pointer"
                    >
                      {GOAL_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-[#0b0f19] text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Target Timeline
                  </label>
                  <div className="relative">
                    <select
                      value={formData.durationDays}
                      onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                      className="w-full bg-[#080c14] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none pr-10 cursor-pointer"
                    >
                      {DURATION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#0b0f19] text-white">
                          {opt.label} ({opt.tag})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

              </div>

              {/* 4. Daily Pace & Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Daily Commitment */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Daily Study Time
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {DAILY_TIME_OPTIONS.map((time) => {
                      const isSelected = formData.dailyStudyTime === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setFormData({ ...formData, dailyStudyTime: time })}
                          className={`py-2 px-1 text-center rounded-xl text-sm font-medium border transition-all ${
                            isSelected
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                              : 'bg-[#080c14] border-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Multimodal Switches */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    Integrated Tools
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, includeVideos: !formData.includeVideos })}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center space-x-2 ${
                        formData.includeVideos
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                          : 'bg-[#080c14] border-white/5 text-slate-500'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-sm font-medium truncate">YouTube Videos</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, includeVisualizers: !formData.includeVisualizers })}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center space-x-2 ${
                        formData.includeVisualizers
                          ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                          : 'bg-[#080c14] border-white/5 text-slate-500'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-sm font-medium truncate">Visualizers</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* 5. Pedagogical Style Pills */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Pedagogical Focus
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PREFERENCE_PILLS.map((pref) => {
                    const isChecked = formData.learningPreferences.includes(pref.id);
                    return (
                      <button
                        key={pref.id}
                        type="button"
                        onClick={() => togglePreference(pref.id)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border text-left transition-all flex items-center space-x-2 ${
                          isChecked
                            ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                            : 'bg-[#080c14] border-white/5 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isChecked ? 'bg-indigo-400' : 'bg-slate-500'}`} />
                        <span className="truncate">{pref.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.99]"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2.5">
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span className="text-xs sm:text-sm font-semibold">{PROGRESS_MESSAGES[progressStep]}</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate My Course</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: OUTLINE REVIEW & START LEARNING */}
        {/* ======================================================== */}
        {step === 2 && outline && (
          <motion.div
            key="step-review"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            {/* Header / Actions Card */}
            <div className="rounded-3xl p-6 sm:p-8 bg-[#0d1322] border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {formData.currentLevel} • {formData.durationDays} Days • {formData.dailyStudyTime}/day
                </span>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {outline.title || formData.topic}
                </h2>
                <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                  {outline.description || outline.overview || `Structured ${formData.durationDays}-day course designed for ${formData.currentLevel} learners.`}
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 transition-all"
                >
                  Adjust Inputs
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleStartCourse}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-xs sm:text-sm font-black text-white shadow-xl shadow-indigo-600/30 transition-all flex items-center space-x-2 disabled:opacity-50 active:scale-[0.99]"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving & Launching...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Learning Course</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* View Switcher: Day-Wise vs Module Chapters */}
            <div className="flex items-center space-x-3 border-b border-white/5 pb-2">
              <button
                type="button"
                onClick={() => setActiveModuleIndex(-1)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  activeModuleIndex === -1 || !outline.modules?.length
                    ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Day-Wise Plan ({outline.days?.length || formData.durationDays} Days)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModuleIndex(0)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  activeModuleIndex >= 0 && outline.modules?.length
                    ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Modules & Chapters ({outline.modules?.length || 0})</span>
              </button>
            </div>

            {/* Day Plan Preview */}
            {(activeModuleIndex === -1 || !outline.modules?.length) && (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {(outline.days && outline.days.length > 0 ? outline.days : []).map((dayItem, dIdx) => (
                  <div key={dIdx} className="rounded-2xl p-4 sm:p-5 bg-[#0b0f19] border border-white/5 hover:border-indigo-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-black border border-indigo-500/30 shrink-0">
                          {dayItem.day || dIdx + 1}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate">{dayItem.title}</h4>
                          {dayItem.learningObjective && (
                            <span className="text-xs text-slate-400 truncate block">{dayItem.learningObjective}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-medium shrink-0 ml-2">
                        {dayItem.lessons?.length || 0} Lessons
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                      {dayItem.lessons?.map((les, lIdx) => (
                        <div key={lIdx} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center space-x-2 text-xs text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                          <span className="truncate">{les.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modules Scaffolding Preview */}
            {activeModuleIndex >= 0 && outline.modules?.length > 0 && (
              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                {outline.modules.map((mod, mIdx) => (
                  <div key={mIdx} className="rounded-2xl p-5 bg-[#0b0f19] border border-white/5 hover:border-indigo-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-black border border-indigo-500/30">
                          {mIdx + 1}
                        </div>
                        <h4 className="text-sm font-bold text-white">{mod.title}</h4>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {mod.lessons?.length || 0} Lessons
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                      {mod.lessons?.map((les, lIdx) => (
                        <div key={lIdx} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center space-x-2 text-xs text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                          <span className="truncate">{les.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Natural language AI modifier bar */}
            <div className="rounded-2xl p-4 bg-[#0b0f19] border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                value={modificationPrompt}
                onChange={(e) => setModificationPrompt(e.target.value)}
                placeholder="Tweak curriculum? e.g., 'Add more practice on Day 4' or 'Make it deeper'..."
                className="flex-1 bg-[#080c14] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleModifyOutline}
                disabled={modifying || !modificationPrompt.trim()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shrink-0 flex items-center justify-center space-x-2 min-h-[40px]"
              >
                {modifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Edit3 className="w-3.5 h-3.5" />}
                <span>Refine with AI</span>
              </button>
            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default CourseWizard;
