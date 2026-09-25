import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Printer,
  Copy,
  Check,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Save,
  Search,
  TrendingUp,
  Terminal,
  Calculator,
  Scale,
  Atom,
  Clock,
  Trash2,
  AlertCircle,
  BookOpen,
  Layers,
  Zap,
} from 'lucide-react';
import {
  generateCheatsheet,
  saveCheatsheet,
  fetchSavedCheatsheets,
  deleteSavedCheatsheet,
} from '../../services/api';
import BlockRenderer from './BlockRenderer';
import MarkdownRenderer from '../../components/MarkdownRenderer';

const PRESET_TOPICS = [
  { label: 'Marginal Utility & Consumer Equilibrium', domain: 'economics', icon: TrendingUp, level: 'Beginner' },
  { label: 'Binary Search & Complexity Analysis', domain: 'computer_science', icon: Terminal, level: 'Beginner' },
  { label: 'French Revolution & Fall of Bastille', domain: 'history', icon: Clock, level: 'Intermediate' },
  { label: 'Photosynthesis & Light-Independent Cycle', domain: 'biology', icon: Atom, level: 'Intermediate' },
  { label: 'Capital Market & Financial Instruments', domain: 'business_finance', icon: TrendingUp, level: 'Intermediate' },
  { label: 'Inflation & Monetary Policy Transmission', domain: 'economics', icon: TrendingUp, level: 'Beginner' },
  { label: "Ohm's Law & Circuit Resistance", domain: 'physics', icon: Calculator, level: 'Beginner' },
];

const DOMAIN_BADGES = {
  economics: { bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', label: 'Economics' },
  business_finance: { bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', label: 'Business & Finance' },
  accounting: { bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', label: 'Accounting' },
  computer_science: { bg: 'bg-sky-500/15 text-sky-400 border-sky-500/30', label: 'Computer Science' },
  programming: { bg: 'bg-sky-500/15 text-sky-400 border-sky-500/30', label: 'Programming' },
  mathematics: { bg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30', label: 'Mathematics' },
  statistics: { bg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30', label: 'Statistics' },
  physics: { bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30', label: 'Physics' },
  chemistry: { bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30', label: 'Chemistry' },
  biology: { bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', label: 'Biology' },
  history: { bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30', label: 'History' },
  law: { bg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30', label: 'Law & Civics' },
  geography: { bg: 'bg-sky-500/15 text-sky-400 border-sky-500/30', label: 'Geography' },
  political_science: { bg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30', label: 'Political Science' },
  general: { bg: 'bg-slate-500/15 text-slate-400 border-slate-500/30', label: 'General' },
};

export const CheatsheetViewer = ({
  lessonTitle = '',
  lessonContent = '',
  courseTopic = '',
  currentLevel = 'Beginner',
  courseId = '',
  moduleIndex = 0,
  lessonIndex = 0,
  sourceType = 'lesson',
  onBack,
}) => {
  const [activeTopic, setActiveTopic] = useState(lessonTitle || '');
  const [activeLevel, setActiveLevel] = useState(currentLevel || 'Beginner');
  const [activeLanguage, setActiveLanguage] = useState('english'); // 'english' | 'hinglish'
  const [customInput, setCustomInput] = useState('');

  const [cheatsheet, setCheatsheet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);
  const [savedCheatsheets, setSavedCheatsheets] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const abortControllerRef = useRef(null);

  // Staged loading feedback ticker
  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStage(0);
      interval = setInterval(() => {
        setLoadingStage((prev) => (prev < 3 ? prev + 1 : prev));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const loadSavedCheatsheets = useCallback(async () => {
    setLoadingSaved(true);
    try {
      const res = await fetchSavedCheatsheets();
      if (res?.success && Array.isArray(res.cheatsheets)) {
        setSavedCheatsheets(res.cheatsheets);
      }
    } catch (err) {
      console.warn('Could not fetch saved cheatsheets:', err.message);
    } finally {
      setLoadingSaved(false);
    }
  }, []);

  useEffect(() => {
    loadSavedCheatsheets();
  }, [loadSavedCheatsheets]);

  const handleGenerate = useCallback(
    async (topicToFetch, levelOverride, languageOverride, forceRegenerate = false) => {
      const targetTopic = (topicToFetch || activeTopic || '').trim();
      if (!targetTopic) return;

      const targetLevel = levelOverride || activeLevel;
      const targetLanguage = languageOverride || activeLanguage;

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);
      setSaveStatus(null);
      setSaveMessage(null);

      try {
        const payload = {
          topic: targetTopic,
          lessonTitle: targetTopic,
          lessonContent: lessonTitle ? lessonContent : '',
          courseTopic: courseTopic || '',
          currentLevel: targetLevel,
          language: targetLanguage,
          courseId: courseId || '',
          moduleIndex: Number(moduleIndex) || 0,
          lessonIndex: Number(lessonIndex) || 0,
          sourceType: sourceType || 'standalone',
          regenerate: Boolean(forceRegenerate),
        };

        const res = await generateCheatsheet(payload, null, {
          signal: controller.signal,
        });

        if (res?.success && res.cheatsheet) {
          setCheatsheet(res.cheatsheet);
          setActiveTopic(targetTopic);
          setActiveLevel(targetLevel);
          setActiveLanguage(targetLanguage);
        } else {
          throw new Error(res?.message || 'Failed to generate cheatsheet.');
        }
      } catch (err) {
        if (err.name === 'AbortError' || err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          return;
        }
        console.error('Cheatsheet fetch error:', err);
        setError(err.response?.data?.message || err.message || 'An error occurred while generating cheatsheet.');
      } finally {
        if (abortControllerRef.current === controller) {
          setLoading(false);
          abortControllerRef.current = null;
        }
      }
    },
    [activeTopic, activeLevel, activeLanguage, lessonTitle, lessonContent, courseTopic, courseId, moduleIndex, lessonIndex, sourceType]
  );

  // Auto-generate ONLY if mounted with an explicit lessonTitle from parent
  useEffect(() => {
    if (lessonTitle && lessonTitle.trim().length > 0) {
      handleGenerate(lessonTitle, currentLevel, 'english');
    }
  }, [lessonTitle, currentLevel]);

  const handleCustomSearchSubmit = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    setActiveTopic(customInput.trim());
    handleGenerate(customInput.trim(), activeLevel, activeLanguage);
  };

  const handleSelectPreset = (topicStr, levelStr) => {
    setActiveTopic(topicStr);
    setCustomInput(topicStr);
    if (levelStr) setActiveLevel(levelStr);
    handleGenerate(topicStr, levelStr || activeLevel, activeLanguage);
  };

  const handleLoadSaved = (item) => {
    setCheatsheet(item.cheatsheet || item);
    setActiveTopic(item.lessonTitle || item.title || item.topicKey);
    setActiveLevel(item.level || 'Beginner');
    setActiveLanguage(item.language || 'english');
    setError(null);
  };

  const handleDeleteSaved = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await deleteSavedCheatsheet(id);
      if (res?.success) {
        setSavedCheatsheets((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleSave = async () => {
    if (!cheatsheet || cheatsheet.isDemo) return;
    setSaving(true);
    setSaveStatus(null);
    setSaveMessage(null);

    try {
      const res = await saveCheatsheet({
        courseId: courseId || '',
        moduleIndex: Number(moduleIndex) || 0,
        lessonIndex: Number(lessonIndex) || 0,
        lessonTitle: activeTopic,
        topic: activeTopic,
        sourceType: sourceType || 'standalone',
        currentLevel: activeLevel,
        language: activeLanguage,
        domain: cheatsheet.domain || 'general',
        isDemo: Boolean(cheatsheet.isDemo),
        cheatsheet,
      });

      if (res?.success) {
        setSaveStatus('success');
        setSaveMessage('Cheatsheet saved to your collection!');
        loadSavedCheatsheets();
        setTimeout(() => setSaveStatus(null), 3500);
      } else {
        setSaveStatus('error');
        setSaveMessage(res?.message || 'Could not save cheatsheet.');
      }
    } catch (err) {
      setSaveStatus('error');
      setSaveMessage(err.response?.data?.message || err.message || 'Failed to save cheatsheet.');
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const domainInfo = DOMAIN_BADGES[cheatsheet?.domain] || DOMAIN_BADGES.general;
  const blocksList = Array.isArray(cheatsheet?.blocks) ? cheatsheet.blocks : [];

  const loadingStages = [
    'Analyzing topic and theoretical domain...',
    'Calibrating Bloom scaffolding and formulas...',
    'Synthesizing interactive graphs & diagrams...',
    'Drafting intuitive worked examples...',
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Print Stylesheet Overrides */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; font-size: 11pt; }
          .print\\:hidden { display: none !important; }
          .print\\:break-inside-avoid { break-inside: avoid !important; page-break-inside: avoid !important; }
          .print\\:shadow-none { box-shadow: none !important; border: 1px solid #CBD5E1 !important; }
        }
      `}</style>

      {/* Top Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-3">
          {onBack ? (
            <button
              onClick={onBack}
              type="button"
              className="p-2 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : null}
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-md bg-[#1f6feb]/15 border border-[#1f6feb]/30 flex items-center justify-center text-[#58a6ff]">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#e6edf3] tracking-tight">Cheatsheet Generator</h1>
              <p className="text-xs text-[#8b949e]">AI-powered revision blueprints</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {cheatsheet && (
            <>
              {/* Regenerate Button */}
              <button
                onClick={() => handleGenerate(activeTopic, activeLevel, activeLanguage, true)}
                disabled={loading}
                type="button"
                className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] text-xs font-semibold transition-colors flex items-center space-x-1.5"
                title="Regenerate with fresh AI response (bypasses cache)"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Regenerate</span>
              </button>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving || cheatsheet.isDemo}
                type="button"
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors border ${
                  cheatsheet.isDemo
                    ? 'bg-[#21262d] text-[#484f58] border-[#30363d] cursor-not-allowed opacity-60'
                    : 'bg-[#1f6feb] hover:bg-[#388bfd] text-white border-[rgba(240,246,252,0.1)]'
                }`}
              >
                <Save className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
                <span>{saving ? 'Saving...' : 'Save Sheet'}</span>
              </button>

              {/* Print Button */}
              <button
                onClick={handlePrint}
                type="button"
                className="px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] text-xs font-semibold transition-colors flex items-center space-x-1.5"
                title="Print or Save as PDF (Ctrl+P)"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Print</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Save feedback banner */}
      <AnimatePresence>
        {saveStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 rounded-md text-xs font-semibold flex items-center space-x-2 border ${
              saveStatus === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {saveStatus === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{saveMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Demo Mode Notice Banner */}
      {cheatsheet?.isDemo && (
        <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center space-x-2">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <span>
            <strong>Developer Demo Mode:</strong> Generated in offline demo mode. Configure your personal Gemini API key in Settings to generate 100% custom real-time curriculum.
          </span>
        </div>
      )}

      {/* Search & Topic Selector Bar (Always visible in standalone mode) */}
      {!lessonTitle && (
        <div className="p-5 rounded-md bg-[#161b22] border border-[#30363d] print:hidden">
          <form onSubmit={handleCustomSearchSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b949e]" />
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Enter ANY topic (e.g. Marginal Utility, Binary Search, French Revolution...)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-md text-sm font-medium bg-[#0d1117] border border-[#30363d] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:ring-2 focus:ring-[#1f6feb]/40 focus:border-[#1f6feb] transition-all"
                />
              </div>

              {/* Level Select */}
              <select
                value={activeLevel}
                onChange={(e) => {
                  setActiveLevel(e.target.value);
                  if (cheatsheet) handleGenerate(activeTopic, e.target.value, activeLanguage);
                }}
                className="px-3 py-2.5 rounded-md text-xs font-semibold bg-[#0d1117] border border-[#30363d] text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#1f6feb]/40 transition-all"
              >
                <option value="Beginner">Beginner Level</option>
                <option value="Intermediate">Intermediate Level</option>
                <option value="Advanced">Advanced Level</option>
              </select>

              {/* Language Toggle */}
              <div className="flex items-center p-1 rounded-md bg-[#0d1117] border border-[#30363d]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveLanguage('english');
                    if (cheatsheet) handleGenerate(activeTopic, activeLevel, 'english');
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                    activeLanguage === 'english'
                      ? 'bg-[#1f6feb] text-white'
                      : 'text-[#8b949e] hover:text-[#e6edf3]'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveLanguage('hinglish');
                    if (cheatsheet) handleGenerate(activeTopic, activeLevel, 'hinglish');
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                    activeLanguage === 'hinglish'
                      ? 'bg-amber-500 text-white'
                      : 'text-[#8b949e] hover:text-[#e6edf3]'
                  }`}
                  title="Generate explanations in conversational Hinglish"
                >
                  🇮🇳 Hinglish
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || !customInput.trim()}
                className="px-5 py-2.5 rounded-md bg-[#1f6feb] hover:bg-[#388bfd] text-white font-semibold text-xs transition-colors border border-[rgba(240,246,252,0.1)] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate</span>
              </button>
            </div>

            {/* Preset Subjects Pills */}
            <div className="pt-3 border-t border-[#21262d] flex items-center space-x-2 flex-wrap gap-y-2">
              <span className="text-xs font-semibold text-[#8b949e] mr-1 flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 text-[#58a6ff]" />
                <span>Popular:</span>
              </span>
              {PRESET_TOPICS.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(p.label, p.level)}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] flex items-center space-x-1.5 transition-colors"
                  >
                    <Icon className="w-3 h-3 text-[#58a6ff]" />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </form>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-12 rounded-md bg-[#161b22] border border-[#30363d] flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-[3px] border-[#30363d] border-t-[#1f6feb] animate-spin" />
            <Sparkles className="w-5 h-5 text-[#58a6ff] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#e6edf3]">Generating Cheatsheet</h3>
            <p className="text-xs text-[#58a6ff] font-mono mt-1 transition-all">
              {loadingStages[loadingStage]}
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-6 rounded-md bg-[#161b22] border border-rose-500/30 space-y-3">
          <div className="flex items-center space-x-2.5">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <h3 className="text-sm font-semibold text-[#e6edf3]">Failed to Generate Cheatsheet</h3>
          </div>
          <p className="text-xs text-[#8b949e] leading-relaxed">{error}</p>
          <button
            onClick={() => handleGenerate(activeTopic, activeLevel, activeLanguage, true)}
            type="button"
            className="px-4 py-2 rounded-md bg-[#1f6feb] hover:bg-[#388bfd] text-white font-semibold text-xs transition-colors inline-flex items-center space-x-1.5 border border-[rgba(240,246,252,0.1)]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Generation</span>
          </button>
        </div>
      )}

      {/* Main Cheatsheet Content */}
      {!loading && !error && cheatsheet && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="p-6 sm:p-8 rounded-md bg-[#161b22] border border-[#30363d] transition-colors"
        >
          {/* Cheatsheet Header */}
          <div className="border-b border-[#21262d] pb-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border uppercase tracking-wider ${domainInfo.bg}`}>
                    {domainInfo.label}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#21262d] text-[#8b949e] border border-[#30363d]">
                    {activeLevel} Level
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${
                      activeLanguage === 'hinglish'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-[#1f6feb]/15 text-[#58a6ff] border-[#1f6feb]/30'
                    }`}
                  >
                    {activeLanguage === 'hinglish' ? '🇮🇳 Hinglish Mode' : 'English'}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-[#e6edf3] tracking-tight">
                  {cheatsheet.title || activeTopic}
                </h2>
                <p className="text-xs sm:text-sm text-[#8b949e] mt-1">
                  {cheatsheet.subtitle || `High-Yield ${domainInfo.label} Revision Blueprint`}
                </p>
              </div>
            </div>
          </div>

          {/* Block Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {blocksList.map((block, idx) => (
              <BlockRenderer key={idx} block={block} isPaper={false} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty Standalone State: Saved Cheatsheets Collection */}
      {!loading && !cheatsheet && (
        <div className="space-y-6 print:hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold flex items-center space-x-2 text-[#e6edf3]">
              <Layers className="w-4 h-4 text-[#58a6ff]" />
              <span>Your Saved Cheatsheets</span>
            </h3>
            <span className="text-xs text-[#8b949e]">
              {savedCheatsheets.length} sheet{savedCheatsheets.length === 1 ? '' : 's'} saved
            </span>
          </div>

          {loadingSaved ? (
            <div className="p-8 text-center text-xs text-[#8b949e] font-mono">
              Loading saved collection...
            </div>
          ) : savedCheatsheets.length === 0 ? (
            <div className="p-10 rounded-md bg-[#161b22] border border-[#30363d] text-center space-y-3">
              <div className="w-12 h-12 rounded-md bg-[#1f6feb]/10 border border-[#1f6feb]/30 text-[#58a6ff] flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-[#e6edf3]">
                No Cheatsheets Saved Yet
              </h4>
              <p className="text-xs text-[#8b949e] max-w-sm mx-auto">
                Search any topic above or click one of the popular subjects to generate and save your first revision guide.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedCheatsheets.map((item) => {
                const itemDomain = DOMAIN_BADGES[item.domain] || DOMAIN_BADGES.general;
                return (
                  <div
                    key={item._id}
                    onClick={() => handleLoadSaved(item)}
                    className="p-5 rounded-md bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff] transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${itemDomain.bg}`}>
                          {itemDomain.label}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSaved(e, item._id)}
                          className="p-1.5 rounded-md text-[#484f58] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete cheatsheet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="text-sm font-semibold group-hover:text-[#58a6ff] transition-colors line-clamp-1 text-[#e6edf3]">
                        {item.lessonTitle || item.title || item.topicKey}
                      </h4>
                      <p className="text-xs text-[#8b949e] line-clamp-2">
                        {item.subtitle || `Comprehensive ${itemDomain.label} revision`}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#21262d] flex items-center justify-between text-xs text-[#8b949e]">
                      <span>{item.level || 'Beginner'}</span>
                      <span className="font-mono text-[#58a6ff] group-hover:translate-x-1 transition-transform">
                        Open →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CheatsheetViewer;
