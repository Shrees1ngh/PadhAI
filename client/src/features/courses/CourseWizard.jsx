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
  Save,
  AlertCircle,
  Database,
  Check,
  ChevronDown,
  Info,
  Calendar,
  Target,
  GraduationCap,
  Play
} from 'lucide-react';
import { generateCourseOutline, modifyCourseOutline, saveCourse } from '../../services/api';

const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];

const GOAL_OPTIONS = [
  'Placement / Job Preparation',
  'College / University Exams',
  'Competitive Coding Mastery',
  'Career Transition / Upskilling',
  'Deep Conceptual Foundations',
];

const DURATION_OPTIONS = [
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
];

const DAILY_TIME_OPTIONS = [
  '1 hour',
  '2 hours',
  '3 hours',
  '4+ hours',
];

const PREFERENCE_PILLS = [
  { id: 'video', label: 'Video learning' },
  { id: 'hands-on', label: 'Hands-on practice' },
  { id: 'detailed', label: 'Detailed explanation' },
  { id: 'concise', label: 'Short & concise' },
];

export const CourseWizard = ({ onCourseSaved, onStartLearning }) => {
  // Stepper state: 1 = Setup (Screen 2), 2 = Review Outline
  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    topic: 'Data Structures and Algorithms',
    learningGoal: 'Placement / Job Preparation',
    currentLevel: 'Beginner',
    durationDays: 30,
    dailyStudyTime: '2 hours',
    learningPreferences: ['video', 'hands-on', 'detailed'],
  });

  const [outline, setOutline] = useState(null);
  const [modificationPrompt, setModificationPrompt] = useState('');
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);

  // Status
  const [loading, setLoading] = useState(false);
  const [modifying, setModifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveResult, setSaveResult] = useState(null);

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

  // Generate Course Outline
  const handleGenerateOutline = async (e) => {
    e?.preventDefault();
    if (!formData.topic.trim()) {
      setError('Please enter what you want to learn.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      topic: formData.topic.trim(),
      learningGoal: formData.learningGoal,
      currentLevel: formData.currentLevel,
      durationDays: Number(formData.durationDays),
      dailyStudyTime: formData.dailyStudyTime,
      learningPreference: formData.learningPreferences.join(', '),
    };

    try {
      const res = await generateCourseOutline(payload);
      if (res?.success && res.outline) {
        setOutline(res.outline);
        setStep(2);
      } else {
        throw new Error(res?.message || 'Failed to generate course structure.');
      }
    } catch (err) {
      console.error('Course generation error:', err);
      setError(err.message || 'Error communicating with AI service. Please check your network or try again.');
    } finally {
      setLoading(false);
    }
  };

  // Modify outline with natural language prompt
  const handleModifyOutline = async (e) => {
    e?.preventDefault();
    if (!modificationPrompt.trim() || !outline) return;

    setModifying(true);
    setError(null);

    try {
      const res = await modifyCourseOutline({
        currentOutline: outline,
        instruction: modificationPrompt.trim(),
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

  // Save Course to MongoDB
  const handleSaveCourse = async () => {
    if (!outline) return;

    setSaving(true);
    setError(null);

    try {
      const coursePayload = {
        title: outline.title || formData.topic,
        topic: formData.topic,
        level: formData.currentLevel,
        durationWeeks: Math.ceil(formData.durationDays / 7),
        overview: outline.overview || '',
        prerequisites: outline.prerequisites || [],
        targetAudience: outline.targetAudience || '',
        modules: outline.modules || [],
        setupParams: {
          topic: formData.topic,
          learningGoal: formData.learningGoal,
          currentLevel: formData.currentLevel,
          durationDays: formData.durationDays,
          dailyStudyTime: formData.dailyStudyTime,
          learningPreference: formData.learningPreferences.join(', '),
        },
      };

      const res = await saveCourse(coursePayload);
      if (res?.success) {
        setSaveResult({
          saved: true,
          courseId: res.course?._id,
        });
        if (onCourseSaved) onCourseSaved(res.course);
      } else {
        throw new Error(res?.message || 'Could not save to database.');
      }
    } catch (err) {
      console.warn('Save course notice:', err);
      // Still allow learning even if offline
      setSaveResult({ saved: false, message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        
        {/* ======================================================== */}
        {/* SCREEN 2: CREATE LEARNING PLAN */}
        {/* ======================================================== */}
        {step === 1 && (
          <motion.div
            key="create-plan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-4xl mx-auto"
          >
            {/* Form Container */}
            <div className="rounded-3xl p-6 sm:p-10 bg-[#0d1322] border border-white/10 shadow-2xl relative overflow-hidden">
              
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Create Your Learning Plan
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1.5 font-normal">
                  Tell us about your goals and let AI create a personalized course just for you.
                </p>
              </div>

              {/* Error display */}
              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-3">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Notice: </span>
                    {error}
                  </div>
                </div>
              )}

              <form onSubmit={handleGenerateOutline} className="space-y-6">
                
                {/* 1. What do you want to learn? */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    What do you want to learn?
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g. Data Structures and Algorithms, React & Node.js, Quantum Computing"
                    className="w-full bg-[#080c14] border border-white/10 rounded-2xl px-4 py-3.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                  />
                </div>

                {/* 2. Your current level */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Your current level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {LEVEL_OPTIONS.map((lvl) => {
                      const isSelected = formData.currentLevel === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setFormData({ ...formData, currentLevel: lvl })}
                          className={`py-3 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-2 border ${
                            isSelected
                              ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/50 shadow-md shadow-indigo-600/20'
                              : 'bg-[#080c14] text-slate-400 border-white/5 hover:border-white/15 hover:text-white'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center ${
                            isSelected ? 'bg-indigo-500 border-indigo-400 text-white' : 'border-slate-400'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                          </div>
                          <span>{lvl}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Row: Goal & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Your Goal */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Your goal
                    </label>
                    <div className="relative">
                      <select
                        value={formData.learningGoal}
                        onChange={(e) => setFormData({ ...formData, learningGoal: e.target.value })}
                        className="w-full bg-[#080c14] border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-indigo-500 appearance-none pr-10 cursor-pointer"
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

                  {/* How much time do you have? */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      How much time do you have?
                    </label>
                    <div className="relative">
                      <select
                        value={formData.durationDays}
                        onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                        className="w-full bg-[#080c14] border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-indigo-500 appearance-none pr-10 cursor-pointer"
                      >
                        {DURATION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-[#0b0f19] text-white">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                </div>

                {/* 4. Row: Daily Study Time & Preferences */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Daily Study Time */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Daily study time
                    </label>
                    <div className="relative">
                      <select
                        value={formData.dailyStudyTime}
                        onChange={(e) => setFormData({ ...formData, dailyStudyTime: e.target.value })}
                        className="w-full bg-[#080c14] border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-indigo-500 appearance-none pr-10 cursor-pointer"
                      >
                        {DAILY_TIME_OPTIONS.map((opt) => (
                          <option key={opt} value={opt} className="bg-[#0b0f19] text-white">
                            {opt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Learning Preferences */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Learning preference (optional)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PREFERENCE_PILLS.map((pref) => {
                        const isChecked = formData.learningPreferences.includes(pref.id);
                        return (
                          <button
                            key={pref.id}
                            type="button"
                            onClick={() => togglePreference(pref.id)}
                            className={`px-3 py-2 rounded-xl text-[11px] font-bold border text-left transition-all flex items-center space-x-2 ${
                              isChecked
                                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                                : 'bg-[#080c14] border-white/5 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isChecked ? 'bg-indigo-400' : 'bg-slate-400'}`} />
                            <span className="truncate">{pref.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Primary CTA: Generate My Course -> */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.99]"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Designing Pedagogical Plan with AI...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate My Course</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: OUTLINE REVIEW & START LEARNING */}
        {/* ======================================================== */}
        {step === 2 && outline && (
          <motion.div
            key="review-outline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Header / Actions */}
            <div className="rounded-3xl p-6 bg-[#0d1322] border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {formData.currentLevel} • {formData.durationDays} Days • {formData.dailyStudyTime}/day
                </span>
                <h2 className="text-2xl font-black text-white mt-2">{outline.title || formData.topic}</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">{outline.overview}</p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 transition-all"
                >
                  Edit Inputs
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleSaveCourse();
                    onStartLearning(outline, formData);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-black text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
                >
                  <span>Start Learning Course</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modules Scaffolding Preview */}
            <div className="space-y-4">
              {outline.modules?.map((mod, mIdx) => (
                <div key={mIdx} className="rounded-2xl p-5 bg-[#0b0f19] border border-white/5 hover:border-indigo-500/30 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-black border border-indigo-500/30">
                        {mIdx + 1}
                      </div>
                      <h4 className="text-sm font-bold text-white">{mod.title}</h4>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {mod.lessons?.length || 0} Lessons
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    {mod.lessons?.map((les, lIdx) => (
                      <div key={lIdx} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center space-x-2 text-xs text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        <span className="truncate">{les.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Natural language modifier bar */}
            <div className="rounded-2xl p-4 bg-[#0b0f19] border border-white/10 flex items-center gap-3">
              <input
                type="text"
                value={modificationPrompt}
                onChange={(e) => setModificationPrompt(e.target.value)}
                placeholder="Want changes? e.g., 'Add a deep dive on Graph Algorithms and AVL Trees'..."
                className="flex-1 bg-[#080c14] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleModifyOutline}
                disabled={modifying || !modificationPrompt.trim()}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shrink-0 flex items-center space-x-2"
              >
                {modifying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Edit3 className="w-3.5 h-3.5" />}
                <span>Update Course</span>
              </button>
            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default CourseWizard;
