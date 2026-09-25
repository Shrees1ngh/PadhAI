import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Smile,
  Meh,
  Frown,
  Zap,
  RefreshCw,
  Save,
  Check,
  AlertTriangle,
  RotateCcw,
  Search,
} from 'lucide-react';
import { generateFlashcards, saveFlashcards } from '../../services/api';

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

export const FlashcardDeck = ({
  lessonTitle = '',
  lessonContent = '',
  courseTopic = '',
  currentLevel = 'Intermediate',
  courseId = '',
  moduleIndex = 0,
  lessonIndex = 0,
  sourceType = 'lesson',
  onBack,
}) => {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewStats, setReviewStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saved' | 'error' | null
  const [saveMessage, setSaveMessage] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  // Standalone input state — only used when no lessonTitle is provided from parent
  const isStandalone = !lessonTitle || lessonTitle === 'Lesson Flashcards';
  const [topicInput, setTopicInput] = useState('');
  const [activeTopic, setActiveTopic] = useState(lessonTitle || courseTopic || '');
  const [hasStarted, setHasStarted] = useState(!isStandalone);

  const fetchFlashcardDeck = useCallback(async (topicOverride) => {
    const targetTopic = topicOverride || activeTopic;
    if (!targetTopic) return;

    setLoading(true);
    setError(null);
    setSaveStatus(null);
    setSaveMessage(null);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
    setReviewStats({ again: 0, hard: 0, good: 0, easy: 0 });

    try {
      const res = await generateFlashcards({
        lessonTitle: targetTopic,
        lessonContent: typeof lessonContent === 'object' ? JSON.stringify(lessonContent) : (lessonContent || targetTopic),
        courseTopic: courseTopic || '',
        currentLevel: currentLevel || 'Intermediate',
        courseId: courseId || undefined,
        moduleIndex: moduleIndex !== undefined ? moduleIndex : undefined,
        lessonIndex: lessonIndex !== undefined ? lessonIndex : undefined,
        sourceType: sourceType || 'lesson',
      });

      const returnedCards = res?.deck?.cards || res?.cards || [];
      setIsDemo(Boolean(res?.isDemo || res?.deck?.isDemo || returnedCards.some(c => c.isDemo)));
      if (res?.success && Array.isArray(returnedCards) && returnedCards.length > 0) {
        setCards(returnedCards);
        setCurrentIndex(0);
        setHasStarted(true);
      } else {
        throw new Error(res?.message || "Couldn't generate this resource right now. Please try again.");
      }
    } catch (err) {
      console.error('Flashcard generation error:', err);
      setError(err?.message || "Couldn't generate this resource right now. Please try again.");
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, [activeTopic, lessonContent, courseTopic, currentLevel, courseId, moduleIndex, lessonIndex, sourceType]);

  // Auto-generate only when called from a lesson (not standalone)
  useEffect(() => {
    if (!isStandalone && activeTopic) {
      fetchFlashcardDeck(activeTopic);
    }
  }, []);

  const handleTopicSubmit = (e) => {
    e.preventDefault();
    if (!topicInput.trim()) return;
    setActiveTopic(topicInput.trim());
    fetchFlashcardDeck(topicInput.trim());
  };

  const handlePresetClick = (topic) => {
    setTopicInput(topic);
    setActiveTopic(topic);
    fetchFlashcardDeck(topic);
  };

  const currentCard = cards[currentIndex] || null;

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (isCompleted) {
      setIsCompleted(false);
      setCurrentIndex(cards.length - 1);
      return;
    }
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleReview = (type) => {
    setReviewStats((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    handleNext();
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
    setReviewStats({ again: 0, hard: 0, good: 0, easy: 0 });
  };

  const handleSave = async () => {
    if (!cards || cards.length === 0 || saving) return;
    setSaving(true);
    setSaveStatus(null);
    setSaveMessage(null);

    try {
      const res = await saveFlashcards({
        courseId: courseId || undefined,
        moduleIndex: moduleIndex !== undefined ? moduleIndex : undefined,
        lessonIndex: lessonIndex !== undefined ? lessonIndex : undefined,
        lessonTitle: activeTopic || courseTopic || 'Flashcard Deck',
        sourceType: sourceType || 'lesson',
        cards,
      });

      if (res?.success) {
        setSaveStatus('saved');
        setSaveMessage('Flashcard deck saved successfully!');
      } else if (res?.mongoUnavailable) {
        setSaveStatus('error');
        setSaveMessage(res.message || 'Database offline. Flashcards could not be saved to server.');
      } else {
        throw new Error(res?.message || 'Failed to save flashcards.');
      }
    } catch (err) {
      console.error('Save flashcards error:', err);
      setSaveStatus('error');
      setSaveMessage(err?.message || 'Failed to save flashcards.');
    } finally {
      setSaving(false);
    }
  };

  const totalReviews = reviewStats.again + reviewStats.hard + reviewStats.good + reviewStats.easy;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-md bg-[#1f6feb]/15 border border-[#1f6feb]/30 flex items-center justify-center text-[#58a6ff]">
              <Layers className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#e6edf3] tracking-tight">Flashcards</h2>
              <p className="text-xs text-[#8b949e]">{activeTopic || 'Generate flashcards for any topic'}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {cards.length > 0 && !loading && (
            <>
              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving || saveStatus === 'saved' || isDemo}
                title={isDemo ? 'Demo data cannot be saved' : 'Save flashcards'}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors border flex items-center space-x-1.5 ${
                  saveStatus === 'saved'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : isDemo
                    ? 'bg-[#21262d] text-[#484f58] border-[#30363d] cursor-not-allowed opacity-50'
                    : 'bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#e6edf3] border-[#30363d]'
                }`}
              >
                {saving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#58a6ff]" />
                ) : saveStatus === 'saved' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{saving ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : isDemo ? 'Demo' : 'Save'}</span>
              </button>

              {/* Counter Badge */}
              <div className="px-3 py-1.5 rounded-md bg-[#21262d] border border-[#30363d] text-xs font-mono font-semibold text-[#8b949e]">
                {isCompleted ? cards.length : currentIndex + 1} / {cards.length}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Demo Banner */}
      {isDemo && (
        <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 font-bold uppercase text-xs">Demo Data</span>
          <span>Flashcards generated in offline demo mode. Saving is disabled.</span>
        </div>
      )}

      {/* Save Notification banner */}
      {saveMessage && (
        <div
          className={`p-3 rounded-md border text-xs flex items-center justify-between ${
            saveStatus === 'saved'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <div className="flex items-center space-x-2">
            {saveStatus === 'saved' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{saveMessage}</span>
          </div>
          <button
            onClick={() => setSaveMessage(null)}
            className="text-xs opacity-60 hover:opacity-100 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Topic Input Section — Only shown in standalone mode before deck is generated */}
      {isStandalone && !hasStarted && !loading && cards.length === 0 && (
        <div className="p-6 rounded-md bg-[#161b22] border border-[#30363d] space-y-5">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-md bg-[#1f6feb]/10 border border-[#1f6feb]/30 text-[#58a6ff] flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[#e6edf3]">Generate Flashcard Deck</h3>
            <p className="text-xs text-[#8b949e] max-w-md mx-auto">
              Enter any topic below to generate AI-powered flashcards with active recall prompts, definitions, and progressive difficulty.
            </p>
          </div>

          <form onSubmit={handleTopicSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b949e]" />
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="Enter a topic (e.g. Photosynthesis, Binary Search, French Revolution...)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-md text-sm font-medium bg-[#0d1117] border border-[#30363d] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:ring-2 focus:ring-[#1f6feb]/40 focus:border-[#1f6feb] transition-all"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={!topicInput.trim()}
                className="px-5 py-2.5 rounded-md bg-[#1f6feb] hover:bg-[#388bfd] text-white font-semibold text-xs transition-colors border border-[rgba(240,246,252,0.1)] flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Deck</span>
              </button>
            </div>

            {/* Preset Topic Pills */}
            <div className="pt-3 border-t border-[#21262d] flex items-center space-x-2 flex-wrap gap-y-2">
              <span className="text-xs font-semibold text-[#8b949e] mr-1 flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 text-[#58a6ff]" />
                <span>Popular:</span>
              </span>
              {PRESET_TOPICS.map((topic, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetClick(topic)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] transition-colors"
                >
                  {topic}
                </button>
              ))}
            </div>
          </form>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="rounded-md p-16 bg-[#161b22] border border-[#30363d] text-center space-y-4">
          <div className="relative mx-auto w-fit">
            <div className="w-14 h-14 rounded-full border-[3px] border-[#30363d] border-t-[#1f6feb] animate-spin" />
            <Sparkles className="w-5 h-5 text-[#58a6ff] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-base font-semibold text-[#e6edf3]">Generating Flashcards...</h3>
          <p className="text-xs text-[#8b949e] max-w-md mx-auto">
            Structuring active recall prompts and progressive difficulties for{' '}
            <span className="text-[#58a6ff] font-semibold">{activeTopic || courseTopic}</span>.
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && cards.length === 0 && (
        <div className="rounded-md p-12 bg-[#161b22] border border-rose-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-[#e6edf3]">Flashcard Generation Failed</h3>
          <p className="text-xs text-[#8b949e] max-w-md mx-auto">{error}</p>
          <button
            onClick={() => fetchFlashcardDeck(activeTopic)}
            disabled={loading}
            className="px-6 py-2.5 rounded-md bg-[#1f6feb] hover:bg-[#388bfd] text-white text-xs font-semibold transition-colors border border-[rgba(240,246,252,0.1)]"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Deck Completion View */}
      {!loading && !error && cards.length > 0 && isCompleted && (
        <div className="rounded-md p-8 sm:p-12 bg-[#161b22] border border-[#30363d] text-center space-y-6">
          <div className="w-14 h-14 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <Award className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-[#e6edf3]">Deck Completed!</h3>
            <p className="text-xs text-[#8b949e] mt-1">
              You reviewed all {cards.length} flashcards for {activeTopic || courseTopic}.
            </p>
          </div>

          {/* Breakdown Stats */}
          <div className="grid grid-cols-4 gap-2.5 max-w-md mx-auto">
            <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-center">
              <span className="text-lg font-bold text-rose-400">{reviewStats.again}</span>
              <p className="text-xs text-rose-300 font-semibold uppercase">Again</p>
            </div>
            <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-lg font-bold text-amber-400">{reviewStats.hard}</span>
              <p className="text-xs text-amber-300 font-semibold uppercase">Hard</p>
            </div>
            <div className="p-3 rounded-md bg-[#1f6feb]/10 border border-[#1f6feb]/20 text-center">
              <span className="text-lg font-bold text-[#58a6ff]">{reviewStats.good}</span>
              <p className="text-xs text-[#58a6ff] font-semibold uppercase">Good</p>
            </div>
            <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span className="text-lg font-bold text-emerald-400">{reviewStats.easy}</span>
              <p className="text-xs text-emerald-300 font-semibold uppercase">Easy</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="px-6 py-2.5 rounded-md bg-[#1f6feb] hover:bg-[#388bfd] text-white text-xs font-semibold transition-colors border border-[rgba(240,246,252,0.1)] flex items-center space-x-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Review Deck Again</span>
            </button>
            {isStandalone && (
              <button
                onClick={() => {
                  setCards([]);
                  setHasStarted(false);
                  setTopicInput('');
                  setActiveTopic('');
                  setError(null);
                }}
                className="px-5 py-2.5 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] text-xs font-semibold transition-colors"
              >
                New Topic
              </button>
            )}
            {onBack && (
              <button
                onClick={onBack}
                className="px-5 py-2.5 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] text-xs font-semibold transition-colors"
              >
                Back to Lesson
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Flashcard View */}
      {!loading && !error && cards.length > 0 && !isCompleted && currentCard && (
        <>
          {/* Main Flip Card Container */}
          <div className="relative flex items-center justify-between gap-3">
            
            {/* Previous Arrow Button */}
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="w-10 h-10 rounded-md bg-[#21262d] hover:bg-[#30363d] disabled:opacity-20 disabled:hover:bg-[#21262d] border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] flex items-center justify-center shrink-0 transition-colors"
              title="Previous card"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* The Flip Card — Dark themed */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex-1 min-h-[300px] sm:min-h-[340px] rounded-md p-8 sm:p-12 bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff] cursor-pointer select-none flex flex-col items-center justify-center text-center relative overflow-hidden transition-all group"
            >
              {/* Top metadata indicator */}
              <div className="absolute top-4 left-6 flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8b949e]">
                  {isFlipped ? 'Answer' : 'Question'}
                </span>
                {currentCard.concept && (
                  <span className="text-xs px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[#8b949e] font-medium">
                    {currentCard.concept}
                  </span>
                )}
                {currentCard.difficulty && (
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold uppercase tracking-wider border ${
                    currentCard.difficulty === 'Easy'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : currentCard.difficulty === 'Hard'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}>
                    {currentCard.difficulty}
                  </span>
                )}
              </div>

              <div className="absolute top-4 right-6 text-[#484f58] group-hover:text-[#58a6ff] transition-colors">
                <RotateCw className="w-4 h-4" />
              </div>

              <div className="my-auto space-y-3 px-2">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#e6edf3] leading-tight">
                  {isFlipped ? (currentCard.answer || currentCard.back) : (currentCard.question || currentCard.front)}
                </h3>
                
                <p className="text-xs text-[#484f58] font-medium">
                  {isFlipped ? 'Click card to see question' : 'Click card to reveal answer'}
                </p>
              </div>
            </div>

            {/* Next Arrow Button */}
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] flex items-center justify-center shrink-0 transition-colors"
              title="Next card"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

          </div>

          {/* Spaced Repetition Review Action Buttons */}
          <div className="grid grid-cols-4 gap-3 pt-2">
            
            {/* Again */}
            <button
              type="button"
              onClick={() => handleReview('again')}
              className="p-3 rounded-md bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold transition-colors flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Again</span>
            </button>

            {/* Hard */}
            <button
              type="button"
              onClick={() => handleReview('hard')}
              className="p-3 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold transition-colors flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Hard</span>
            </button>

            {/* Good */}
            <button
              type="button"
              onClick={() => handleReview('good')}
              className="p-3 rounded-md bg-[#1f6feb]/10 hover:bg-[#1f6feb]/20 border border-[#1f6feb]/30 text-[#58a6ff] text-xs font-semibold transition-colors flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#1f6feb]" />
              <span>Good</span>
            </button>

            {/* Easy */}
            <button
              type="button"
              onClick={() => handleReview('easy')}
              className="p-3 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-colors flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Easy</span>
            </button>

          </div>
        </>
      )}

    </div>
  );
};

export default FlashcardDeck;
