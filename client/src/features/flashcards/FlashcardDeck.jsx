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
  RotateCcw
} from 'lucide-react';
import { generateFlashcards, saveFlashcards } from '../../services/api';

export const FlashcardDeck = ({
  lessonTitle = 'Lesson Flashcards',
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

  const fetchFlashcardDeck = useCallback(async () => {
    if (!lessonTitle && !courseTopic) return;
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
        lessonTitle: lessonTitle || courseTopic || 'Topic Flashcards',
        lessonContent: typeof lessonContent === 'object' ? JSON.stringify(lessonContent) : (lessonContent || lessonTitle || courseTopic),
        courseTopic: courseTopic || '',
        currentLevel: currentLevel || 'Intermediate',
        courseId: courseId || undefined,
        moduleIndex: moduleIndex !== undefined ? moduleIndex : undefined,
        lessonIndex: lessonIndex !== undefined ? lessonIndex : undefined,
        sourceType: sourceType || 'lesson',
      });

      const returnedCards = res?.deck?.cards || res?.cards || [];
      if (res?.success && Array.isArray(returnedCards) && returnedCards.length > 0) {
        setCards(returnedCards);
        setCurrentIndex(0);
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
  }, [lessonTitle, lessonContent, courseTopic, currentLevel, courseId, moduleIndex, lessonIndex, sourceType]);

  useEffect(() => {
    fetchFlashcardDeck();
  }, [fetchFlashcardDeck]);

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
        lessonTitle: lessonTitle || courseTopic || 'Flashcard Deck',
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
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Flashcards</span>
            </h2>
            <p className="text-xs text-slate-400">{lessonTitle || courseTopic}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {cards.length > 0 && !loading && (
            <>
              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving || saveStatus === 'saved'}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center space-x-1.5 ${
                  saveStatus === 'saved'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10 hover:border-white/20'
                }`}
              >
                {saving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                ) : saveStatus === 'saved' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{saving ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save'}</span>
              </button>

              {/* Counter Badge */}
              <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-bold text-slate-200">
                {isCompleted ? cards.length : currentIndex + 1} / {cards.length}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Save Notification banner */}
      {saveMessage && (
        <div
          className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
            saveStatus === 'saved'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
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

      {/* Loading State */}
      {loading && (
        <div className="rounded-3xl p-16 bg-[#0d1322] border border-white/10 text-center space-y-4 shadow-2xl">
          <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
          <h3 className="text-base font-bold text-white">Generating 10 High-Yield Flashcards...</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Structuring active recall prompts, definitions, core invariants, and progressive difficulties for{' '}
            <span className="text-indigo-300 font-bold">{lessonTitle || courseTopic}</span>.
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && cards.length === 0 && (
        <div className="rounded-3xl p-12 bg-[#0d1322] border border-rose-500/20 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Flashcard Generation Failed</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchFlashcardDeck}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Deck Completion View */}
      {!loading && !error && cards.length > 0 && isCompleted && (
        <div className="rounded-3xl p-8 sm:p-12 bg-[#0d1322] border border-white/10 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-xl">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-white">Deck Completed!</h3>
            <p className="text-xs text-slate-400 mt-1">
              You reviewed all {cards.length} flashcards for {lessonTitle || courseTopic}.
            </p>
          </div>

          {/* Breakdown Stats */}
          <div className="grid grid-cols-4 gap-2.5 max-w-md mx-auto">
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
              <span className="text-lg font-black text-rose-400">{reviewStats.again}</span>
              <p className="text-[10px] text-rose-300 font-bold uppercase">Again</p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-lg font-black text-amber-400">{reviewStats.hard}</span>
              <p className="text-[10px] text-amber-300 font-bold uppercase">Hard</p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
              <span className="text-lg font-black text-indigo-400">{reviewStats.good}</span>
              <p className="text-[10px] text-indigo-300 font-bold uppercase">Good</p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span className="text-lg font-black text-emerald-400">{reviewStats.easy}</span>
              <p className="text-[10px] text-emerald-300 font-bold uppercase">Easy</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg flex items-center space-x-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Review Deck Again</span>
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition-all"
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
          {/* Main 3D Flip Card Container */}
          <div className="relative flex items-center justify-between gap-3">
            
            {/* Previous Arrow Button */}
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-white/5 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center shrink-0 transition-all"
              title="Previous card"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* The Flip Card */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex-1 min-h-[300px] sm:min-h-[340px] rounded-3xl p-8 sm:p-12 bg-white text-slate-900 border border-slate-200 shadow-2xl cursor-pointer select-none flex flex-col items-center justify-center text-center relative overflow-hidden transition-all transform active:scale-[0.99] group"
            >
              {/* Top metadata indicator */}
              <div className="absolute top-4 left-6 flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isFlipped ? 'Answer' : 'Question'}
                </span>
                {currentCard.concept && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                    {currentCard.concept}
                  </span>
                )}
                {currentCard.difficulty && (
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    currentCard.difficulty === 'Easy'
                      ? 'bg-emerald-50 text-emerald-700'
                      : currentCard.difficulty === 'Hard'
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {currentCard.difficulty}
                  </span>
                )}
              </div>

              <div className="absolute top-4 right-6 text-slate-400 group-hover:text-indigo-600 transition-colors">
                <RotateCw className="w-4 h-4" />
              </div>

              <div className="my-auto space-y-3 px-2">
                <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 leading-tight">
                  {isFlipped ? (currentCard.answer || currentCard.back) : (currentCard.question || currentCard.front)}
                </h3>
                
                <p className="text-xs text-slate-400 font-medium">
                  {isFlipped ? 'Click card to see question' : 'Click card to reveal answer'}
                </p>
              </div>
            </div>

            {/* Next Arrow Button */}
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center shrink-0 transition-all"
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
              className="p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Again</span>
            </button>

            {/* Hard */}
            <button
              type="button"
              onClick={() => handleReview('hard')}
              className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Hard</span>
            </button>

            {/* Good */}
            <button
              type="button"
              onClick={() => handleReview('good')}
              className="p-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>Good</span>
            </button>

            {/* Easy */}
            <button
              type="button"
              onClick={() => handleReview('easy')}
              className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2"
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
