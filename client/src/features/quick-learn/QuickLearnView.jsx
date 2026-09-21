import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
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
  Lightbulb,
  Building,
  Target,
  Cpu,
  Clock,
  Code2,
  Check,
  X,
  Bot,
  Globe,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import VisualizerHost, { detectVisualizationType } from '../visualizations/VisualizerHost';
import RecommendedVideos from '../youtube/RecommendedVideos';
import CheatsheetViewer from '../cheatsheets/CheatsheetViewer';
import FlashcardDeck from '../flashcards/FlashcardDeck';
import QuizRunner from '../quizzes/QuizRunner';
import AITutorDrawer from '../ai-tutor/AITutorDrawer';
import { generateQuickLearnTopic, saveTopic } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export const QuickLearnView = ({
  topic: propTopic,
  initialLevel = 'Beginner',
  onBack,
  onOpenTutor,
}) => {
  const params = useParams();
  const navigate = useNavigate();
  const topic = propTopic || (params?.topic ? decodeURIComponent(params.topic) : 'Binary Tree');

  const { isAuthenticated, openAuthModal } = useAuth();
  const [level, setLevel] = useState(initialLevel);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topicData, setTopicData] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null); // { type: 'success' | 'error', text: string }
  const [tutorOpen, setTutorOpen] = useState(false);

  // Active sub-modals: 'cheatsheet' | 'flashcards' | 'quiz' | null
  const [activeModal, setActiveModal] = useState(null);

  // Mini Quiz inline state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Request ID to prevent race conditions from rapid topic switching
  const requestIdRef = useRef(0);

  const fetchQuickLearnData = useCallback(async (selectedLvl = level) => {
    if (!topic || !topic.trim()) return;

    const currentReqId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    setSaved(false);
    setSaveMessage(null);
    setQuizAnswers({});
    setQuizSubmitted(false);

    try {
      const res = await generateQuickLearnTopic({
        topic: topic.trim(),
        currentLevel: selectedLvl,
        level: selectedLvl,
      });

      // Ignore stale responses if a newer request was dispatched
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
  }, [topic, level]);

  useEffect(() => {
    fetchQuickLearnData(level);
  }, [topic]);

  const handleLevelChange = (newLevel) => {
    if (newLevel === level || loading) return;
    setLevel(newLevel);
    fetchQuickLearnData(newLevel);
  };

  const handleSaveTopic = async () => {
    if (!topicData || saving) return;
    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await saveTopic({
        topic: topicData.topic || topic,
        title: topicData.title || topic,
        currentLevel: level,
        level,
        content: topicData,
        visualizationType: topicData.visualizationType || 'none',
        progressPercent: 100,
      });

      if (res?.success && !res.mongoUnavailable) {
        setSaved(true);
        setSaveMessage({ type: 'success', text: 'Topic saved successfully to your collection!' });
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

  const handleExportPDF = () => {
    window.print();
  };

  const handleSelectQuizOption = (qIdx, optIdx) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const calculateQuizScore = () => {
    if (!topicData?.miniQuiz) return 0;
    let score = 0;
    topicData.miniQuiz.forEach((q, idx) => {
      const correctIdx = q.correctOptionIndex !== undefined ? q.correctOptionIndex : q.correctAnswer;
      if (quizAnswers[idx] === correctIdx) {
        score++;
      }
    });
    return score;
  };

  const visType = topicData ? detectVisualizationType(topicData.visualizationType, topicData.topic || topic) : 'none';
  const hasVisualizer = visType !== 'none';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 print:p-0 print:space-y-6">
      
      {/* Top Header Bar & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6 print:border-b-2 print:border-black print:pb-4">
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
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight print:text-black print:text-2xl">
              {topicData?.title || topic}
            </h1>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 print:border-black print:text-black">
              Quick Learn
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 print:text-slate-700">
            Personalized comprehensive learning package • {level} Level • Est. {topicData?.estimatedReadingTime || '6 mins'} read
          </p>
        </div>

        {/* Action Buttons Toolbar (Hidden on Print) */}
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

          {/* Save Button */}
          <button
            onClick={handleSaveTopic}
            disabled={saving || saved || loading || !topicData || Boolean(topicData?.isDemo)}
            title={topicData?.isDemo ? 'Demo data cannot be saved' : 'Save Topic'}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 ${
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
            <span>{saving ? 'Saving...' : saved ? 'Saved' : topicData?.isDemo ? 'Save (Disabled in Demo)' : 'Save Topic'}</span>
          </button>

          {/* PDF Export Button */}
          <button
            onClick={handleExportPDF}
            disabled={loading || !topicData}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center space-x-1.5 disabled:opacity-40"
            title="Print or Save as PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      {/* Save Status Notification Banner */}
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

      {/* Loading State */}
      {loading && (
        <div className="rounded-3xl p-16 bg-[#0d1322] border border-white/10 text-center space-y-4 shadow-2xl">
          <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
          <h3 className="text-base font-bold text-white">Generating Personalized Learning Experience...</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Structuring simple explanations, intuitive analogies, interactive visualizers, code examples, and practice quizzes for{' '}
            <span className="text-indigo-300 font-bold">{topic}</span> at the {level} level.
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && !topicData && (
        <div className="rounded-3xl p-12 bg-[#0d1322] border border-rose-500/20 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Generation Failed</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => fetchQuickLearnData(level)}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg flex items-center space-x-2 mx-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Demo Banner */}
      {topicData?.isDemo && !loading && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 font-bold uppercase text-[10px]">Demo Data</span>
          <span>Generated in developer demo mode. Saving is disabled for demo topics.</span>
        </div>
      )}

      {/* Main Content Area */}
      {!loading && topicData && (
        <div className="space-y-8 print:space-y-6">
          
          {/* Quick Nav Tools Bar: Cheatsheet | Flashcards | Quiz | AI Tutor (Hidden on Print) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:hidden">
            <button
              onClick={() => setActiveModal('cheatsheet')}
              className="p-4 rounded-2xl bg-[#0d1322] hover:bg-[#121a30] border border-white/10 hover:border-indigo-500/40 transition-all text-left group flex items-center space-x-3"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Cheatsheet</p>
                <p className="text-[10px] text-slate-400">Quick Reference</p>
              </div>
            </button>

            <button
              onClick={() => setActiveModal('flashcards')}
              className="p-4 rounded-2xl bg-[#0d1322] hover:bg-[#121a30] border border-white/10 hover:border-purple-500/40 transition-all text-left group flex items-center space-x-3"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Flashcards</p>
                <p className="text-[10px] text-slate-400">Active Recall</p>
              </div>
            </button>

            <button
              onClick={() => setActiveModal('quiz')}
              className="p-4 rounded-2xl bg-[#0d1322] hover:bg-[#121a30] border border-white/10 hover:border-cyan-500/40 transition-all text-left group flex items-center space-x-3"
            >
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Full Quiz</p>
                <p className="text-[10px] text-slate-400">Knowledge Check</p>
              </div>
            </button>

            <button
              onClick={() => {
                setTutorOpen(true);
                if (onOpenTutor) onOpenTutor();
              }}
              className="p-4 rounded-2xl bg-gradient-to-tr from-indigo-900/40 via-purple-900/30 to-[#0d1322] border border-indigo-500/30 hover:border-indigo-500/60 transition-all text-left group flex items-center space-x-3"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">AI Tutor 24/7</p>
                <p className="text-[10px] text-indigo-300">Ask Doubts</p>
              </div>
            </button>
          </div>

          {/* 1. Simple Explanation Card */}
          {topicData.simpleExplanation && (
            <div className="rounded-3xl p-6 sm:p-8 bg-[#0d1322] border border-white/10 shadow-2xl space-y-4 print:bg-white print:text-black print:border-slate-300 print:shadow-none">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-wider print:text-indigo-800">
                <BookOpen className="w-4 h-4" />
                <span>1. Simple Explanation</span>
              </div>
              <div className="text-sm sm:text-base text-slate-200 leading-relaxed print:text-black">
                <MarkdownRenderer content={topicData.simpleExplanation} />
              </div>
            </div>
          )}

          {/* 2 & 3. Why It Matters & Real-Life Analogy (2 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-1 print:gap-4">
            
            {/* Why It Matters */}
            {topicData.whyItMatters && (
              <div className="rounded-3xl p-6 bg-[#0d1322] border border-white/10 shadow-2xl space-y-3 print:bg-white print:text-black print:border-slate-300 print:shadow-none">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider print:text-cyan-800">
                  <Target className="w-4 h-4" />
                  <span>2. Why This Concept Matters</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed print:text-black">
                  <MarkdownRenderer content={topicData.whyItMatters} />
                </div>
              </div>
            )}

            {/* Real-Life Analogy */}
            {topicData.realLifeAnalogy && (
              <div className="rounded-3xl p-6 bg-[#0d1322] border border-white/10 shadow-2xl space-y-3 print:bg-white print:text-black print:border-slate-300 print:shadow-none">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider print:text-amber-800">
                  <Lightbulb className="w-4 h-4" />
                  <span>3. Real-Life Analogy</span>
                </div>
                <div className="text-xs sm:text-sm text-slate-300 leading-relaxed print:text-black">
                  <MarkdownRenderer content={topicData.realLifeAnalogy} />
                </div>
              </div>
            )}

          </div>

          {/* 4. Real-World Applications */}
          {topicData.realWorldApplications && topicData.realWorldApplications.length > 0 && (
            <div className="rounded-3xl p-6 sm:p-8 bg-[#0d1322] border border-white/10 shadow-2xl space-y-4 print:bg-white print:text-black print:border-slate-300 print:shadow-none">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider print:text-emerald-800">
                <Globe className="w-4 h-4" />
                <span>4. Real-World Applications</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topicData.realWorldApplications.map((app, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#080c14] border border-white/5 text-xs text-slate-300 leading-relaxed print:bg-slate-50 print:text-black print:border-slate-200"
                  >
                    <MarkdownRenderer content={typeof app === 'string' ? app : app?.title || ''} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Interactive Visualization System (Rendered ONLY if Supported) */}
          {hasVisualizer && (
            <div className="space-y-3 print:hidden">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-400 px-1">
                <Cpu className="w-4 h-4" />
                <span>Interactive Concept Visualizer</span>
              </div>
              <VisualizerHost
                visualizationType={visType}
                topic={topicData.topic || topic}
              />
            </div>
          )}

          {/* 6. Core Concepts */}
          {topicData.coreConcepts && topicData.coreConcepts.length > 0 && (
            <div className="rounded-3xl p-6 sm:p-8 bg-[#0d1322] border border-white/10 shadow-2xl space-y-4 print:bg-white print:text-black print:border-slate-300 print:shadow-none">
              <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs uppercase tracking-wider print:text-purple-800">
                <Sparkles className="w-4 h-4" />
                <span>5. Core Concepts & Invariants</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:grid-cols-1">
                {topicData.coreConcepts.map((concept, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#080c14] border border-white/5 space-y-1.5 print:bg-slate-50 print:text-black print:border-slate-200">
                    <h4 className="text-xs font-bold text-white print:text-black">
                      {typeof concept === 'string' ? concept : concept.title}
                    </h4>
                    {typeof concept === 'object' && concept.description && (
                      <p className="text-[11px] text-slate-400 leading-relaxed print:text-slate-700">
                        {concept.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Step-by-Step Breakdown */}
          {topicData.stepByStepBreakdown && topicData.stepByStepBreakdown.length > 0 && (
            <div className="rounded-3xl p-6 sm:p-8 bg-[#0d1322] border border-white/10 shadow-2xl space-y-4 print:bg-white print:text-black print:border-slate-300 print:shadow-none">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-wider print:text-indigo-800">
                <CheckCircle2 className="w-4 h-4" />
                <span>6. Step-by-Step Breakdown</span>
              </div>
              <div className="space-y-3">
                {topicData.stepByStepBreakdown.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#080c14] border border-white/5 flex items-start space-x-3.5 print:bg-slate-50 print:border-slate-200">
                    <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-300 font-black text-xs flex items-center justify-center shrink-0 border border-indigo-500/30 print:border-slate-400 print:text-black">
                      {item.step || idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white print:text-black">{item.title}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed print:text-slate-800">{item.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. Code & Analytical Examples */}
          {topicData.examples && topicData.examples.length > 0 && (
            <div className="rounded-3xl p-6 sm:p-8 bg-[#0d1322] border border-white/10 shadow-2xl space-y-4 print:bg-white print:text-black print:border-slate-300 print:shadow-none">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider print:text-emerald-800">
                <Code2 className="w-4 h-4" />
                <span>7. Concrete Code & Implementation</span>
              </div>
              {topicData.examples.map((ex, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="p-4 rounded-2xl bg-[#080c14] border border-white/10 font-mono text-xs text-slate-200 overflow-x-auto shadow-inner print:bg-slate-100 print:text-black print:border-slate-300">
                    <pre className="text-indigo-300 print:text-indigo-900">{typeof ex === 'string' ? ex : ex.code}</pre>
                  </div>
                  {typeof ex === 'object' && ex.explanation && (
                    <p className="text-xs text-slate-400 italic px-1 print:text-slate-700">{ex.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 9 & 10. Common Mistakes & Important Takeaways */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-1 print:gap-4">
            
            {/* Common Mistakes */}
            {topicData.commonMistakes && topicData.commonMistakes.length > 0 && (
              <div className="rounded-3xl p-6 bg-[#0d1322] border border-white/10 shadow-2xl space-y-3 print:bg-white print:text-black print:border-slate-300 print:shadow-none">
                <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs uppercase tracking-wider print:text-rose-800">
                  <AlertCircle className="w-4 h-4" />
                  <span>8. Common Mistakes to Avoid</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 print:text-black">
                  {topicData.commonMistakes.map((mistake, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-rose-400 font-bold shrink-0 mt-0.5 print:text-rose-700">✕</span>
                      <MarkdownRenderer content={typeof mistake === 'string' ? mistake : mistake?.mistake || ''} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Important Takeaways */}
            {topicData.importantTakeaways && topicData.importantTakeaways.length > 0 && (
              <div className="rounded-3xl p-6 bg-[#0d1322] border border-white/10 shadow-2xl space-y-3 print:bg-white print:text-black print:border-slate-300 print:shadow-none">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider print:text-emerald-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>9. Important Takeaways</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300 print:text-black">
                  {topicData.importantTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-emerald-400 font-bold shrink-0 mt-0.5 print:text-emerald-700">✓</span>
                      <MarkdownRenderer content={typeof takeaway === 'string' ? takeaway : takeaway?.takeaway || ''} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>

          {/* 11. Mini Quiz Knowledge Check */}
          {topicData.miniQuiz && topicData.miniQuiz.length > 0 && (
            <div className="rounded-3xl p-6 sm:p-8 bg-[#0d1322] border border-white/10 shadow-2xl space-y-6 print:hidden">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4" />
                  <span>10. Quick Knowledge Check (Mini Quiz)</span>
                </div>
                {quizSubmitted && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Score: {calculateQuizScore()} / {topicData.miniQuiz.length}
                  </span>
                )}
              </div>

              <div className="space-y-6">
                {topicData.miniQuiz.map((q, qIdx) => {
                  const selectedOpt = quizAnswers[qIdx];
                  const correctIdx = q.correctOptionIndex !== undefined ? q.correctOptionIndex : q.correctAnswer;
                  const isCorrect = selectedOpt === correctIdx;

                  return (
                    <div key={qIdx} className="p-4 sm:p-5 rounded-2xl bg-[#080c14] border border-white/5 space-y-3">
                      <p className="text-xs sm:text-sm font-bold text-white">
                        {qIdx + 1}. {q.question}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options?.map((opt, optIdx) => {
                          const isPicked = selectedOpt === optIdx;
                          let btnClass = 'bg-[#0d1322] border-white/5 text-slate-300 hover:border-white/15';

                          if (quizSubmitted) {
                            if (optIdx === correctIdx) {
                              btnClass = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold';
                            } else if (isPicked) {
                              btnClass = 'bg-rose-500/20 border-rose-500/50 text-rose-300 line-through';
                            }
                          } else if (isPicked) {
                            btnClass = 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold shadow-md';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectQuizOption(qIdx, optIdx)}
                              className={`p-3 rounded-xl border text-xs text-left transition-all ${btnClass}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400">
                          <span className="font-bold text-cyan-300">Explanation: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}

                {!quizSubmitted ? (
                  <button
                    onClick={() => setQuizSubmitted(true)}
                    disabled={Object.keys(quizAnswers).length < topicData.miniQuiz.length}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20"
                  >
                    Check Answers
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setQuizAnswers({});
                      setQuizSubmitted(false);
                    }}
                    className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all flex items-center space-x-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Mini Quiz</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 12. Recommended YouTube Resources (Hidden on Print) */}
          <div className="print:hidden">
            <RecommendedVideos
              courseTopic={topicData.topic || topic}
              lessonTitle={topicData.title || topic}
              learningObjective={topicData.simpleExplanation?.slice(0, 100)}
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
              lessonTitle={topicData?.title || topic}
              courseTopic={topicData?.topic || topic}
              lessonContent={topicData?.simpleExplanation || ''}
              currentLevel={level}
              sourceType="lesson"
              onBack={() => setActiveModal(null)}
            />
          </div>
        </div>
      )}

      {/* Modal: Flashcards Deck */}
      {activeModal === 'flashcards' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#0b0f19] border border-white/15 rounded-3xl p-6 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <FlashcardDeck
              lessonTitle={topicData?.title || topic}
              courseTopic={topicData?.topic || topic}
              lessonContent={topicData?.simpleExplanation || ''}
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
              lessonTitle={topicData?.title || topic}
              courseTopic={topicData?.topic || topic}
              currentLevel={level}
              lessonContent={topicData?.simpleExplanation || ''}
              onBack={() => setActiveModal(null)}
            />
          </div>
        </div>
      )}

      {/* Grounded AI Tutor Drawer for Quick Learn */}
      <AITutorDrawer
        isOpen={tutorOpen}
        onClose={() => setTutorOpen(false)}
        courseTitle={topicData?.topic || topic}
        moduleTitle="Quick Learn"
        lessonTitle={topicData?.title || topic}
        learningObjective={topicData?.simpleExplanation?.slice(0, 200) || ''}
        lessonContent={topicData || {}}
        learnerLevel={level}
        lessonKey={`${topic}_${level}`}
      />

    </div>
  );
};

export default QuickLearnView;
