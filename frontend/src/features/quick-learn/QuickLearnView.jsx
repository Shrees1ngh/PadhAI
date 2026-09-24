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
  Plus,
  Zap,
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

const getDomainBadgeStyle = (domain = '') => {
  const d = domain.toLowerCase();
  if (d.includes('bio') || d.includes('life')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  if (d.includes('comp') || d.includes('cs') || d.includes('code') || d.includes('tech')) return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
  if (d.includes('econ') || d.includes('fin') || d.includes('market')) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  if (d.includes('phys') || d.includes('chem') || d.includes('sci')) return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
  if (d.includes('hist') || d.includes('law') || d.includes('polit')) return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
  return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
};

export const QuickLearnView = ({
  topic: propTopic,
  initialLevel = 'Beginner',
  onBack,
  onOpenTutor,
}) => {
  const params = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const currentUserId = currentUser?._id || currentUser?.id || currentUser?.email || 'guest';
  const userTopicsKey = `padhai_saved_topics_${currentUserId}`;

  // Active topic state
  const rawTopic = propTopic || (params?.topic ? decodeURIComponent(params.topic) : '');
  const [activeTopic, setActiveTopic] = useState(rawTopic);
  const [viewMode, setViewMode] = useState(rawTopic ? 'topic' : 'dashboard');
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

  // Filters for Topics Dashboard
  const [topicSearchQuery, setTopicSearchQuery] = useState('');
  const [topicLevelFilter, setTopicLevelFilter] = useState('All');

  // Saved topics collection scoped to user
  const [savedTopicsList, setSavedTopicsList] = useState(() => {
    try {
      const stored = localStorage.getItem(`padhai_saved_topics_${currentUserId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });
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

  // Load saved topics list on mount or user switch
  useEffect(() => {
    try {
      const local = localStorage.getItem(userTopicsKey);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          setSavedTopicsList(parsed);
        }
      } else {
        setSavedTopicsList([]);
      }
    } catch (e) {}

    if (isAuthenticated) {
      setLoadingSaved(true);
      fetchSavedTopics()
        .then((res) => {
          if (res?.success && Array.isArray(res.topics)) {
            setSavedTopicsList((prev) => {
              const map = new Map();
              prev.forEach((t) => map.set((t.topic || t.title || '').toLowerCase(), t));
              res.topics.forEach((t) => map.set((t.topic || t.title || '').toLowerCase(), t));
              const merged = Array.from(map.values());
              try {
                localStorage.setItem(userTopicsKey, JSON.stringify(merged));
              } catch (e) {}
              return merged;
            });
          }
        })
        .catch((err) => console.warn('Could not fetch saved topics:', err.message))
        .finally(() => setLoadingSaved(false));
    }
  }, [userTopicsKey, isAuthenticated]);

  // Sync propTopic or URL changes
  useEffect(() => {
    if (rawTopic && rawTopic !== activeTopic) {
      setActiveTopic(rawTopic);
      setViewMode('topic');
    } else if (!rawTopic) {
      setViewMode('dashboard');
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
          setSaved(true);
          setViewMode('topic');

          // Auto-save topic to user's collection just like My Courses!
          const newEntry = {
            _id: res.topic._id || `topic_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            topic: res.topic.topic || topicToFetch.trim(),
            title: res.topic.title || topicToFetch.trim(),
            domain: res.topic.domain || 'general',
            level: selectedLvl,
            language: selectedLang,
            visualizationType: res.topic.visualizationType || 'none',
            content: res.topic,
            updatedAt: new Date().toISOString(),
          };

          setSavedTopicsList((prev) => {
            const existingIdx = prev.findIndex(
              (item) => (item.topic || item.title || '').toLowerCase() === topicToFetch.trim().toLowerCase()
            );
            let updated;
            if (existingIdx >= 0) {
              updated = [...prev];
              updated[existingIdx] = { ...updated[existingIdx], ...newEntry };
            } else {
              updated = [newEntry, ...prev];
            }
            try {
              localStorage.setItem(userTopicsKey, JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });

          // Also persist to backend if authenticated
          if (isAuthenticated) {
            saveTopic({
              topic: res.topic.topic || topicToFetch.trim(),
              title: res.topic.title || topicToFetch.trim(),
              level: selectedLvl,
              language: selectedLang,
              content: res.topic,
              visualizationType: res.topic.visualizationType || 'none',
              progressPercent: 100,
            }).catch(() => {});
          }

          // Broadcast to Hero / App
          window.dispatchEvent(new Event('padhai_topics_updated'));
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
    [level, language, userTopicsKey, isAuthenticated]
  );

  useEffect(() => {
    if (activeTopic && activeTopic.trim()) {
      fetchQuickLearnData(activeTopic, level, language, false);
    }
  }, [activeTopic, level, language]);

  // Ensure contentBlocks has active recall Q&A self-check cards
  const contentBlocks = useMemo(() => {
    if (!topicData?.blocks || !Array.isArray(topicData.blocks)) return [];
    const blocks = [...topicData.blocks];
    if (!blocks.some((b) => b && b.type === 'qna')) {
      const defBlock = blocks.find((b) => b && b.type === 'definition');
      const mistBlock = blocks.find((b) => b && b.type === 'common_mistakes');

      blocks.push({
        type: 'qna',
        title: `Active Recall & Self-Check Cards`,
        items: [
          {
            question: `How would you explain the core mechanism of ${topicData.title || activeTopic} in your own words?`,
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
            concept: 'Key Pitfall',
          },
        ],
      });
    }
    return blocks;
  }, [topicData, activeTopic]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const clean = searchInput.trim();
    if (!clean) return;
    setActiveTopic(clean);
    setViewMode('topic');
    navigate(`/learn/${encodeURIComponent(clean)}`, { replace: true });
  };

  const handlePresetSelect = (preset) => {
    setSearchInput(preset);
    setActiveTopic(preset);
    setViewMode('topic');
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

  // Delete saved topic from collection (matching My Courses delete behavior)
  const handleDeleteTopic = async (topicId, topicTitle, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const confirmed = window.confirm(`Are you sure you want to delete "${topicTitle || 'this topic'}" from your Quick Learn topics?`);
    if (!confirmed) return;

    setSavedTopicsList((prev) => {
      const filtered = prev.filter(
        (item) => item._id !== topicId && item.id !== topicId && (item.topic || item.title || '').toLowerCase() !== (topicTitle || '').toLowerCase()
      );
      try {
        localStorage.setItem(userTopicsKey, JSON.stringify(filtered));
      } catch (err) {}
      return filtered;
    });

    // If currently viewing the deleted topic, clear activeTopic and return to dashboard
    if (activeTopic && activeTopic.toLowerCase() === (topicTitle || '').toLowerCase()) {
      setActiveTopic('');
      setTopicData(null);
      setViewMode('dashboard');
      navigate('/learn', { replace: true });
    }

    if (topicId && !String(topicId).startsWith('topic_')) {
      try {
        await deleteSavedTopic(topicId);
      } catch (err) {
        console.warn('Backend deleteSavedTopic failed:', err);
      }
    }

    window.dispatchEvent(new Event('padhai_topics_updated'));
    window.showToast?.({
      title: 'Topic Removed',
      description: `"${topicTitle}" deleted from Quick Learn.`,
    });
  };

  const handleExportPDF = () => {
    window.print();
  };

  const loadingStages = [
    'Classifying domain & identifying visual components...',
    'Structuring intuitive explanations & real-world analogies...',
    'Synthesizing formulas, diagrams, tables & practice quizzes...',
  ];

  // Filtered topics for dashboard
  const filteredSavedTopics = useMemo(() => {
    return savedTopicsList.filter((item) => {
      const title = (item.title || item.topic || '').toLowerCase();
      const domain = (item.domain || '').toLowerCase();
      const q = topicSearchQuery.toLowerCase().trim();
      const matchesSearch = !q || title.includes(q) || domain.includes(q);

      const lvl = (item.level || 'Beginner').toLowerCase();
      const matchesLevel =
        topicLevelFilter === 'All' || lvl === topicLevelFilter.toLowerCase();

      return matchesSearch && matchesLevel;
    });
  }, [savedTopicsList, topicSearchQuery, topicLevelFilter]);

  const hasInteractiveVisualizer =
    topicData?.visualizationType && topicData.visualizationType !== 'none';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 print:p-0 print:space-y-4">
      {/* Print-specific style */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; font-size: 11pt; }
          .print\\:hidden { display: none !important; }
          .print\\:break-inside-avoid { break-inside: avoid !important; }
        }
      `}</style>

      {/* Top Header Mode Switcher (Matching My Courses Dashboard / Roadmap toggle) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10 print:hidden">
        <div className="flex items-center gap-1.5 p-1 bg-[#161b22] border border-[#30363d] rounded-xl shadow-inner">
          <button
            onClick={() => {
              setViewMode('dashboard');
              if (!activeTopic) navigate('/learn', { replace: true });
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'dashboard' || !activeTopic
                ? 'bg-[#1f6feb] text-white shadow-sm'
                : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Topics ({savedTopicsList.length})</span>
          </button>

          {activeTopic && (
            <button
              onClick={() => setViewMode('topic')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all max-w-[220px] truncate cursor-pointer ${
                viewMode === 'topic'
                  ? 'bg-[#1f6feb] text-white shadow-sm'
                  : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 shrink-0 text-amber-300" />
              <span className="truncate">{topicData?.title || activeTopic}</span>
            </button>
          )}
        </div>

        <button
          onClick={() => {
            setViewMode('dashboard');
            setActiveTopic('');
            setTopicData(null);
            navigate('/learn', { replace: true });
            setTimeout(() => {
              document.getElementById('quick-learn-search-input')?.focus();
            }, 100);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Topic</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. DASHBOARD VIEW (Shown when in dashboard mode or no active topic)       */}
      {/* ========================================================================= */}
      {(viewMode === 'dashboard' || !activeTopic) && (
        <div className="space-y-6">
          {/* Dashboard Header */}
          <div className="pb-1">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Quick Learn Topics</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono font-medium">
                {savedTopicsList.length}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a topic to open guide, revise active recall cards, or learn a new subject with AI.
            </p>
          </div>

          {/* Search Box & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="quick-learn-search-input"
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setTopicSearchQuery(e.target.value);
                }}
                placeholder="Search saved topics or enter a new topic..."
                className="w-full bg-[#0d1322] border border-white/10 rounded-xl pl-10 pr-24 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors min-h-[38px]"
              />
              <button
                type="submit"
                disabled={!searchInput.trim()}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold transition-all"
              >
                Learn
              </button>
            </form>

            {/* Level Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {['All', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setTopicLevelFilter(lvl)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer min-h-[32px] ${
                    topicLevelFilter === lvl
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Topics Grid (Matching CoursesDashboard structure) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Action Card: Generate New Topic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
              role="button"
              tabIndex={0}
              onClick={() => {
                document.getElementById('quick-learn-search-input')?.focus();
              }}
              className="rounded-3xl p-6 border-2 border-dashed border-white/15 hover:border-indigo-500/60 bg-[#0d1322]/40 hover:bg-[#0d1322] transition-all duration-300 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer min-h-[260px] group shadow-lg select-none"
            >
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-6 h-6" />
              </div>

              <div className="space-y-1 max-w-xs">
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Learn New Topic
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  Type any subject in Economics, Biology, CS, Physics, or Law to synthesize an interactive guide.
                </p>
              </div>

              <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5">
                <span>Enter Topic Name</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </span>
            </motion.div>

            {/* Saved Topics Cards */}
            {filteredSavedTopics.map((item) => (
              <motion.div
                key={item._id || item.id || item.topic}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                onClick={() => {
                  setActiveTopic(item.topic);
                  setLevel(item.level || 'Beginner');
                  setLanguage(item.language || 'english');
                  setTopicData(item.content || null);
                  setViewMode('topic');
                  navigate(`/learn/${encodeURIComponent(item.topic)}`, { replace: true });
                }}
                className="p-5 rounded-3xl bg-[#0d1322] hover:bg-[#121a30] border border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer group flex flex-col justify-between shadow-lg relative min-h-[260px]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold border ${getDomainBadgeStyle(
                        item.domain || item.content?.domain || 'general'
                      )}`}
                    >
                      {(item.domain || item.content?.domain || 'General').replace('_', ' ')}
                    </span>

                    <button
                      onClick={(e) => handleDeleteTopic(item._id || item.id, item.title || item.topic, e)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                      title="Delete topic from collection"
                      aria-label="Delete topic"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {item.title || item.topic}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                      {item.content?.simpleExplanation ||
                        item.content?.blocks?.find((b) => b.type === 'definition' || b.type === 'simple_explanation')?.text ||
                        'Comprehensive pedagogical guide with visual workflows, diagrams, and quizzes.'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span className="px-2 py-0.5 rounded-md bg-white/5 font-medium">
                    {item.level || 'Beginner'}
                  </span>
                  <span className="text-indigo-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Open Guide →
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Popular Subjects Presets */}
          <div className="rounded-3xl p-6 bg-[#0d1322]/60 border border-white/5 space-y-3 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Popular Topics to Learn Instantly
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
              {PRESET_TOPICS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetSelect(preset)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-indigo-600/20 border border-white/10 hover:border-indigo-500/40 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TOPIC GUIDE VIEW (Shown when viewMode === 'topic' and activeTopic)      */}
      {/* ========================================================================= */}
      {viewMode === 'topic' && activeTopic && (
        <div className="space-y-6">
          {/* Top Header / Navigation Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5 print:border-b-2 print:border-black print:pb-3">
            <div>
              <button
                onClick={() => {
                  setViewMode('dashboard');
                  navigate('/learn', { replace: true });
                }}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 mb-2 transition-colors print:hidden cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to All Topics</span>
              </button>

              <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight print:text-black">
                  {topicData?.title || activeTopic}
                </h1>
                {topicData?.domain && (
                  <span className={`text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getDomainBadgeStyle(topicData.domain)}`}>
                    {topicData.domain.replace('_', ' ')}
                  </span>
                )}
                {saved && (
                  <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 print:hidden">
                    <Check className="w-3 h-3" />
                    Saved in Collection
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-400 mt-1 print:text-slate-700">
                Interactive Pedagogical Guide • {level} Level • {language.toUpperCase()}
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer ${
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
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center space-x-1.5 cursor-pointer"
                title="Switch Language"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>{language === 'english' ? 'English' : 'Hinglish'}</span>
              </button>

              {/* Regenerate Button */}
              <button
                onClick={handleRegenerate}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center space-x-1.5 disabled:opacity-40 cursor-pointer"
                title="Regenerate with fresh AI content"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Regenerate</span>
              </button>

              {/* Delete Topic Button */}
              <button
                onClick={(e) => handleDeleteTopic(topicData?._id, topicData?.title || activeTopic, e)}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                title="Delete this topic from collection"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Delete</span>
              </button>

              {/* PDF Export Button */}
              <button
                onClick={handleExportPDF}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center space-x-1.5 cursor-pointer"
                title="Print or Export PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>
          </div>

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
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg flex items-center space-x-2 mx-auto cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
            </div>
          )}

          {/* Main Content Area */}
          {!loading && topicData && (
            <div className="space-y-8 print:space-y-4">
              {/* Quick Nav Tools Bar */}
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

              {/* Interactive DSA Visualizer */}
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

              {/* Block-Based Content Grid */}
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

              {/* YouTube Recommended Video Resources */}
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
        </div>
      )}

      {/* Modal: Cheatsheet Viewer */}
      {activeModal === 'cheatsheet' && (
        <div className="fixed inset-0 z-[10100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0b0f19] border border-white/15 rounded-3xl p-6 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
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
        <div className="fixed inset-0 z-[10100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0b0f19] border border-white/15 rounded-3xl p-6 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
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
