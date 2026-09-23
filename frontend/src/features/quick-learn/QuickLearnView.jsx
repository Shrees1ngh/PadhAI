import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Search,
  BookOpen,
  HelpCircle,
  FileText,
  Layers,
  Save,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Share2,
  Trash2,
  Cpu,
  Clock,
  Check,
  X,
  Bot,
  Globe,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import BlockRenderer from '../cheatsheets/BlockRenderer';
import VisualizerHost, { detectVisualizationType } from '../visualizations/VisualizerHost';
import RecommendedVideos from '../youtube/RecommendedVideos';
import CheatsheetViewer from '../cheatsheets/CheatsheetViewer';
import QuizRunner from '../quizzes/QuizRunner';
import AITutorDrawer from '../ai-tutor/AITutorDrawer';
import {
  generateQuickLearnTopic,
  saveTopic,
  fetchSavedTopics,
  deleteSavedTopic,
} from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const PRESET_TOPICS = [
  'Marginal Utility',
  'Binary Search Tree',
  'French Revolution',
  'Photosynthesis',
  'Capital Market',
  'Inflation',
  "Ohm's Law",
  'Plate Tectonics',
  'Neural Networks',
];

export const QuickLearnView = ({
  topic: propTopic,
  initialLevel = 'Beginner',
  onBack,
  onOpenTutor,
}) => {
  const params = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();

  // Active topic state
  const rawTopic = propTopic || (params?.topic ? decodeURIComponent(params.topic) : '');
  const [activeTopic, setActiveTopic] = useState(rawTopic);
  const [searchInput, setSearchInput] = useState('');
  const [level, setLevel] = useState(initialLevel);
  const [language, setLanguage] = useState('english'); // 'english' | 'hinglish'

  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [error, setError] = useState(null);
  const [topicData, setTopicData] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // Saved topics collection for empty state
  const [savedTopicsList, setSavedTopicsList] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Sub-modals: 'cheatsheet' | 'flashcards' | 'quiz' | null
  const [activeModal, setActiveModal] = useState(null);
  const [tutorOpen, setTutorOpen] = useState(false);

  // Request ID to avoid race conditions
  const requestIdRef = useRef(0);

  // Staged loading effect
  useEffect(() => {
    let timer;
    if (loading) {
      setLoadingStage(0);
      timer = setInterval(() => {
        setLoadingStage((prev) => (prev < 2 ? prev + 1 : prev));
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [loading]);

  // Load saved topics list for empty state
  useEffect(() => {
    if (isAuthenticated) {
      setLoadingSaved(true);
      fetchSavedTopics()
        .then((res) => {
          if (res?.success && Array.isArray(res.topics)) {
            setSavedTopicsList(res.topics);
          }
        })
        .catch((err) => console.warn('Could not fetch saved topics:', err.message))
        .finally(() => setLoadingSaved(false));
    }
  }, [isAuthenticated]);

  // Sync propTopic or URL changes
  useEffect(() => {
    if (rawTopic && rawTopic !== activeTopic) {
      setActiveTopic(rawTopic);
    }
  }, [rawTopic]);

  const fetchQuickLearnData = useCallback(
    async (topicToFetch, selectedLvl = level, selectedLang = language, isRegenerate = false) => {
      if (!topicToFetch || !topicToFetch.trim()) {
        setTopicData(null);
        setLoading(false);
        return;
      }

      const currentReqId = ++requestIdRef.current;
      setLoading(true);
      setError(null);
      setSaved(false);
      setSaveMessage(null);

      try {
        const res = await generateQuickLearnTopic({
          topic: topicToFetch.trim(),
          level: selectedLvl,
          currentLevel: selectedLvl,
          language: selectedLang,
          regenerate: isRegenerate,
        });

        if (currentReqId !== requestIdRef.current) return;

        if (res?.success && res.topic) {
          setTopicData(res.topic);
        } else {
          throw new Error(res?.message || "Couldn't generate learning material for this topic.");
        }
      } catch (err) {
        if (currentReqId !== requestIdRef.current) return;
        console.error('Quick Learn fetch error:', err.message);
        setError(err.message || 'Error generating topic material. Please try again.');
        setTopicData(null);
      } finally {
        if (currentReqId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [level, language]
  );

  useEffect(() => {
    if (activeTopic && activeTopic.trim()) {
      fetchQuickLearnData(activeTopic, level, language, false);
    }
  }, [activeTopic, level, language]);

  // Ensure contentBlocks has active recall Q&A self-check cards (even for previously saved/demo topics)
  const contentBlocks = useMemo(() => {
    if (!topicData?.blocks || !Array.isArray(topicData.blocks)) return [];
    const blocks = [...topicData.blocks];
    if (!blocks.some((b) => b && b.type === 'qna')) {
      const defBlock = blocks.find((b) => b && b.type === 'definition');
      const mistBlock = blocks.find((b) => b && b.type === 'common_mistakes');
      const takeBlock = blocks.find((b) => b && b.type === 'takeaways');

      blocks.push({
        type: 'qna',
        title: `Active Recall & Self-Check Cards`,
        items: [
          {
            question: `How would you explain the core mechanism and primary definition of ${topicData.title || activeTopic} in your own words?`,
            hint: `Focus on what it accomplishes and its essential properties.`,
            answer: defBlock && typeof defBlock.text === 'string'
              ? defBlock.text.replace(/\*\*/g, '')
              : `Foundational concepts and principles of ${topicData.title || activeTopic}.`,
            concept: 'Core Mechanism',
          },
          {
            question: `What is a common trap, misconception, or mistake when working with ${topicData.title || activeTopic}?`,
            hint: `Consider edge cases and typical misunderstandings.`,
            answer: mistBlock?.items?.[0]
              ? `${mistBlock.items[0].mistake} (Resolution: ${mistBlock.items[0].fix})`
              : `Failing to check preconditions and system invariants.`,
            concept: 'Common Pitfalls',
          },
          {
            question: `What is the most critical practical takeaway for ${topicData.title || activeTopic}?`,
            hint: `Focus on real-world engineering or practical application.`,
            answer: takeBlock?.items?.[0] || `Always test assumptions and verify core behavior under realistic constraints.`,
            concept: 'Key Takeaway',
          },
        ],
      });
    }
    return blocks;
  }, [topicData, activeTopic]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (!searchInput.trim()) return;
    const clean = searchInput.trim();
    setActiveTopic(clean);
    navigate(`/learn/${encodeURIComponent(clean)}`, { replace: true });
  };

  const handlePresetSelect = (preset) => {
    setSearchInput(preset);
    setActiveTopic(preset);
    navigate(`/learn/${encodeURIComponent(preset)}`, { replace: true });
  };

  const handleLevelChange = (newLvl) => {
    if (newLvl === level || loading) return;
    setLevel(newLvl);
  };

  const handleLanguageToggle = () => {
    if (loading) return;
    const nextLang = language === 'english' ? 'hinglish' : 'english';
    setLanguage(nextLang);
  };

  const handleRegenerate = () => {
    if (loading || !activeTopic) return;
    fetchQuickLearnData(activeTopic, level, language, true);
  };

  const handleSaveTopic = async () => {
    if (!topicData || saving) return;
    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await saveTopic({
        topic: topicData.topic || activeTopic,
        title: topicData.title || activeTopic,
        level: topicData.level || level,
        language: topicData.language || language,
        content: topicData,
        visualizationType: topicData.visualizationType || 'none',
        progressPercent: 100,
      });

      if (res?.success && !res.mongoUnavailable) {
        setSaved(true);
        setSaveMessage({ type: 'success', text: 'Topic saved successfully to your collection!' });
        // Refresh saved list
        fetchSavedTopics()
          .then((r) => r?.success && setSavedTopicsList(r.topics))
          .catch(() => {});
      } else if (res?.mongoUnavailable) {
        setSaved(false);
        setSaveMessage({
          type: 'error',
          text: res.message || 'Database offline. Topic could not be saved to server.',
        });
      } else {
        throw new Error(res?.message || 'Failed to save topic.');
      }
    } catch (err) {
      console.error('Save topic error:', err.message);
      setSaved(false);
      setSaveMessage({
        type: 'error',
        text: err.message || 'Failed to save topic. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSaved = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteSavedTopic(id);
      setSavedTopicsList((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error('Failed to delete saved topic:', err);
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const loadingStages = [
    'Classifying domain & identifying visual components...',
    'Structuring intuitive explanations & real-world analogies...',
    'Synthesizing formulas, diagrams, tables & practice quizzes...',
  ];

  // Visualizer determination
  const hasInteractiveVisualizer =
    topicData?.visualizationType && topicData.visualizationType !== 'none';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 print:p-0 print:space-y-4">
      {/* Print-specific style */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; font-size: 11pt; }
          .print\\:hidden { display: none !important; }
          .print\\:break-inside-avoid { break-inside: avoid !important; }
        }
      `}</style>

      {/* Top Header / Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5 print:border-b-2 print:border-black print:pb-3">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 mb-2 transition-colors print:hidden"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight print:text-black">
              {topicData?.title || activeTopic || 'Quick Learn'}
            </h1>
            {topicData?.domain && (
              <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 print:border-black print:text-black">
                {topicData.domain.replace('_', ' ')}
              </span>
            )}
            {topicData?.cached && (
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 print:hidden">
                Cached ⚡
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-400 mt-1 print:text-slate-700">
            Domain-Adaptive Pedagogical Learning Guide • {level} Level • {language.toUpperCase()}
          </p>
        </div>

        {/* Action Buttons & Switches (Hidden on Print) */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {/* Level Switcher */}
          <div className="flex items-center rounded-xl bg-[#080c14] border border-white/10 p-1">
            {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
              <button
                key={lvl}
                disabled={loading}
                onClick={() => handleLevelChange(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                  level === lvl
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Language Toggle (English / Hinglish) */}
          <button
            onClick={handleLanguageToggle}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center space-x-1.5"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === 'english' ? 'English' : 'Hinglish'}</span>
          </button>

          {/* Regenerate Button */}
          {activeTopic && (
            <button
              onClick={handleRegenerate}
              disabled={loading}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all disabled:opacity-40"
              title="Regenerate with fresh AI response"
            >
              <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          )}

          {/* Save Button */}
          {activeTopic && (
            <button
              onClick={handleSaveTopic}
              disabled={saving || saved || loading || !topicData || Boolean(topicData?.isDemo)}
              title={topicData?.isDemo ? 'Demo data cannot be saved' : 'Save Topic'}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 ${
                saved
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : topicData?.isDemo
                  ? 'bg-white/5 border-white/10 text-slate-500 opacity-50 cursor-not-allowed'
                  : 'bg-indigo-600/30 border-indigo-500/40 hover:bg-indigo-600 text-white disabled:opacity-40'
              }`}
            >
              {saving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-300" />
              ) : saved ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>
                {saving
                  ? 'Saving...'
                  : saved
                  ? 'Saved'
                  : topicData?.isDemo
                  ? 'Save (Demo)'
                  : 'Save'}
              </span>
            </button>
          )}

          {/* Export PDF Button */}
          {activeTopic && (
            <button
              onClick={handleExportPDF}
              disabled={loading || !topicData}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center space-x-1.5 disabled:opacity-40"
              title="Print or Export PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Save Notification Banner */}
      {saveMessage && (
        <div
          className={`p-3 rounded-2xl border text-xs flex items-center justify-between print:hidden ${
            saveMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {saveMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{saveMessage.text}</span>
          </div>
          <button
            onClick={() => setSaveMessage(null)}
            className="text-xs opacity-60 hover:opacity-100 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Demo Banner */}
      {topicData?.isDemo && !loading && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2 print:hidden">
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 font-bold uppercase text-xs">
            Demo Mode
          </span>
          <span>Offline mock data. Configure a real Gemini API Key in Settings to persist topics.</span>
        </div>
      )}

      {/* SEARCH / EMPTY STATE (Shown when no topic is selected or on search) */}
      {!activeTopic && (
        <div className="space-y-8">
          <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-b from-[#0d1322] to-[#080c14] border border-white/10 text-center space-y-6 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Learn Any Topic in Minutes
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
                Type any subject across Economics, CS, History, Biology, Physics, Finance, or Law.
                PadhAI automatically adapts the mental models, charts, formulas, and visualizers to
                the discipline.
              </p>
            </div>

            {/* Search Input Box */}
            <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="e.g. Marginal Utility, Photosynthesis, Binary Search Tree..."
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#0b0f19] border border-white/15 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={!searchInput.trim()}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 shrink-0"
              >
                Learn Now
              </button>
            </form>

            {/* Preset Subject Pills */}
            <div className="space-y-2.5 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Explore Popular Subjects
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                {PRESET_TOPICS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePresetSelect(preset)}
                    className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/40 text-xs text-slate-300 hover:text-white transition-all"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Saved Topics Collection */}
          {isAuthenticated && savedTopicsList.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Your Saved Quick Learn Topics ({savedTopicsList.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedTopicsList.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => {
                      setActiveTopic(item.topic);
                      setLevel(item.level || 'Beginner');
                      setLanguage(item.language || 'english');
                      setTopicData(item.content || null);
                      navigate(`/learn/${encodeURIComponent(item.topic)}`, { replace: true });
                    }}
                    className="p-5 rounded-2xl bg-[#0d1322] hover:bg-[#121a30] border border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                          {item.domain || 'general'}
                        </span>
                        <button
                          onClick={(e) => handleDeleteSaved(item._id, e)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          title="Remove saved topic"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {item.title || item.topic}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {item.content?.simpleExplanation ||
                          item.content?.blocks?.[0]?.text ||
                          'Comprehensive quick learning guide.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                      <span>{item.level || 'Beginner'}</span>
                      <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                        Open Guide →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State with Stage Indicators */}
      {loading && (
        <div className="rounded-3xl p-12 sm:p-16 bg-[#0d1322] border border-white/10 text-center space-y-4 shadow-2xl">
          <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
          <h3 className="text-base font-bold text-white">Synthesizing Topic Guide</h3>
          <p className="text-xs text-indigo-300 font-semibold">{loadingStages[loadingStage]}</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Adapting explanations, KaTeX formulas, interactive visualizers, and quizzes for{' '}
            <span className="text-white font-bold">{activeTopic}</span>.
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && !topicData && (
        <div className="rounded-3xl p-12 bg-[#0d1322] border border-rose-500/20 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Topic Generation Failed</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">{error}</p>
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg flex items-center space-x-2 mx-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Main Content Area (Rendered via BlockRenderer) */}
      {!loading && topicData && (
        <div className="space-y-8 print:space-y-4">
          {/* Quick Nav Tools Bar (Hidden on Print) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 print:hidden">
            <button
              onClick={() => setActiveModal('cheatsheet')}
              className="p-4 rounded-2xl bg-[#0d1322] hover:bg-[#121a30] border border-white/10 hover:border-indigo-500/40 transition-all text-left group flex items-center space-x-3 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Cheatsheet</p>
                <p className="text-xs text-slate-400">Quick Reference</p>
              </div>
            </button>

            <button
              onClick={() => setActiveModal('quiz')}
              className="p-4 rounded-2xl bg-[#0d1322] hover:bg-[#121a30] border border-white/10 hover:border-cyan-500/40 transition-all text-left group flex items-center space-x-3 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Full Quiz</p>
                <p className="text-xs text-slate-400">Knowledge Check</p>
              </div>
            </button>

            <button
              onClick={() => {
                setTutorOpen(true);
                if (onOpenTutor) onOpenTutor();
              }}
              className="p-4 rounded-2xl bg-gradient-to-tr from-indigo-900/40 via-purple-900/30 to-[#0d1322] border border-indigo-500/30 hover:border-indigo-500/60 transition-all text-left group flex items-center space-x-3 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">AI Tutor</p>
                <p className="text-xs text-indigo-300">Ask Doubts</p>
              </div>
            </button>
          </div>

          {/* Interactive DSA Visualizer (Only when domain is CS and matching visualizer exists) */}
          {hasInteractiveVisualizer && (
            <div className="space-y-3 print:hidden">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-400 px-1">
                <Cpu className="w-4 h-4" />
                <span>Interactive Algorithm Visualizer</span>
              </div>
              <VisualizerHost
                visualizationType={topicData.visualizationType}
                topic={topicData.topic || activeTopic}
              />
            </div>
          )}

          {/* Block-Based Content Grid (Using Universal BlockRenderer) */}
          {Array.isArray(contentBlocks) && contentBlocks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:grid-cols-1 print:gap-3">
              {contentBlocks.map((block, idx) => (
                <BlockRenderer key={idx} block={block} isPaper={false} />
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-[#0d1322] border border-white/10 text-center text-slate-400 text-xs">
              No content blocks found for this topic.
            </div>
          )}

          {/* YouTube Recommended Video Resources (Hidden on Print) */}
          <div className="print:hidden">
            <RecommendedVideos
              courseTopic={topicData.topic || activeTopic}
              lessonTitle={topicData.title || activeTopic}
              learningObjective={
                topicData.blocks?.find((b) => b.type === 'definition')?.text?.slice(0, 100) ||
                topicData.title
              }
            />
          </div>
        </div>
      )}

      {/* Modal: Cheatsheet Viewer */}
      {activeModal === 'cheatsheet' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0b0f19] border border-white/15 rounded-3xl p-6 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <CheatsheetViewer
              lessonTitle={topicData?.title || activeTopic}
              courseTopic={topicData?.topic || activeTopic}
              lessonContent={
                topicData?.blocks?.find((b) => b.type === 'definition')?.text || activeTopic
              }
              currentLevel={level}
              sourceType="lesson"
              onBack={() => setActiveModal(null)}
            />
          </div>
        </div>
      )}

      {/* Modal: Full Quiz Runner */}
      {activeModal === 'quiz' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0b0f19] border border-white/15 rounded-3xl p-6 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <QuizRunner
              lessonTitle={topicData?.title || activeTopic}
              courseTopic={topicData?.topic || activeTopic}
              currentLevel={level}
              lessonContent={
                topicData?.blocks?.find((b) => b.type === 'definition')?.text || activeTopic
              }
              onBack={() => setActiveModal(null)}
            />
          </div>
        </div>
      )}

      {/* Grounded AI Tutor Drawer */}
      <AITutorDrawer
        isOpen={tutorOpen}
        onClose={() => setTutorOpen(false)}
        courseTitle={topicData?.topic || activeTopic}
        moduleTitle="Quick Learn"
        lessonTitle={topicData?.title || activeTopic}
        learningObjective={
          topicData?.blocks?.find((b) => b.type === 'definition')?.text?.slice(0, 200) || ''
        }
        lessonContent={topicData || {}}
        learnerLevel={level}
        lessonKey={`${activeTopic}_${level}`}
      />
    </div>
  );
};

export default QuickLearnView;
