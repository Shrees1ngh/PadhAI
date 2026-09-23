import React, { useState, useMemo } from 'react';
import {
  BrainCircuit,
  HelpCircle,
  Eye,
  EyeOff,
  Lightbulb,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
} from 'lucide-react';
import MarkdownRenderer from '../../components/MarkdownRenderer';

/**
 * Interactive In-Lesson Active Recall & Self-Check Q&A Cards.
 * Placed directly within lessons to encourage active recall without opening a separate tab.
 */
export const ActiveRecallSection = ({ lesson, lessonTitle }) => {
  // Derive cards: prioritize lesson.selfCheckQuestions, fallback to keyConcepts
  const questions = useMemo(() => {
    if (Array.isArray(lesson?.selfCheckQuestions) && lesson.selfCheckQuestions.length > 0) {
      return lesson.selfCheckQuestions;
    }

    // Dynamic smart fallback for existing lessons without saved selfCheckQuestions
    const fallbackList = [];
    const concepts = Array.isArray(lesson?.keyConcepts) ? lesson.keyConcepts : [];
    const mistakes = Array.isArray(lesson?.commonMistakes) ? lesson.commonMistakes : [];
    const takeaways = Array.isArray(lesson?.importantTakeaways) ? lesson.importantTakeaways : [];

    if (concepts.length > 0) {
      fallbackList.push({
        question: `How would you explain the primary mechanism of ${lessonTitle || 'this topic'} and its core invariant in your own words?`,
        hint: 'Recall the first key concept and how the system isolates state.',
        answer: concepts[0].replace(/\*\*/g, ''),
        concept: 'Core Mechanism',
      });
    }

    if (concepts.length > 1) {
      fallbackList.push({
        question: `What fundamental rule or constraint governs ${lessonTitle || 'this concept'} in production environments?`,
        hint: 'Think about idempotency, error boundaries, or operational consistency.',
        answer: concepts[1].replace(/\*\*/g, ''),
        concept: 'Production Invariant',
      });
    }

    if (mistakes.length > 0) {
      fallbackList.push({
        question: `What is a critical misconception or failure mode to guard against when implementing ${lessonTitle || 'this concept'}?`,
        hint: 'Consider typical edge cases, assumption traps, or concurrency issues.',
        answer: mistakes[0].replace(/\*\*/g, ''),
        concept: 'Pitfalls & Gotchas',
      });
    } else if (takeaways.length > 0) {
      fallbackList.push({
        question: `What is the single most important actionable takeaway from this lesson?`,
        hint: 'Focus on practical engineering design rules.',
        answer: takeaways[0].replace(/\*\*/g, ''),
        concept: 'Key Takeaway',
      });
    }

    return fallbackList;
  }, [lesson, lessonTitle]);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [revealedHints, setRevealedHints] = useState({});
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  if (!questions || questions.length === 0) return null;

  const toggleAnswer = (idx) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const toggleHint = (idx) => {
    setRevealedHints((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const currentQ = questions[activeCardIndex] || questions[0];
  const isAnswerRevealed = Boolean(revealedAnswers[activeCardIndex]);
  const isHintRevealed = Boolean(revealedHints[activeCardIndex]);

  return (
    <div className="my-10 rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/20 to-slate-900/60 p-6 sm:p-8 shadow-xl relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Active Recall & Concept Self-Check
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Self-Test
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Formulate your own explanation first, then reveal the verified solution to solidify memory retention.
            </p>
          </div>
        </div>

        {/* Card Progress / Selector */}
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          <span className="text-xs font-semibold text-slate-400">
            Card {activeCardIndex + 1} of {questions.length}
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setActiveCardIndex((prev) => (prev > 0 ? prev - 1 : questions.length - 1))}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
              title="Previous Question"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveCardIndex((prev) => (prev < questions.length - 1 ? prev + 1 : 0))}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
              title="Next Question"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="bg-slate-900/90 rounded-2xl border border-white/10 p-6 sm:p-7 shadow-inner relative transition-all">
        {/* Concept Badge & Card Number */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{currentQ.concept || 'Concept Check'}</span>
          </span>
          <span className="text-xs font-mono text-slate-400">
            Challenge #{activeCardIndex + 1}
          </span>
        </div>

        {/* Question Prompt */}
        <div className="mb-6">
          <h4 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
            {currentQ.question}
          </h4>
        </div>

        {/* Optional Hint Section */}
        {currentQ.hint && (
          <div className="mb-5">
            {!isHintRevealed ? (
              <button
                onClick={() => toggleHint(activeCardIndex)}
                className="inline-flex items-center space-x-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Need a hint? (Click to reveal)</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start space-x-2.5 animate-fadeIn">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold text-amber-300 mr-1.5">Hint:</span>
                  <span>{currentQ.hint}</span>
                </div>
                <button
                  onClick={() => toggleHint(activeCardIndex)}
                  className="text-amber-400/60 hover:text-amber-300 text-xs ml-2 cursor-pointer"
                  title="Hide hint"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        {/* Action Button: Reveal / Hide Answer */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={() => toggleAnswer(activeCardIndex)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              isAnswerRevealed
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/10'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
            }`}
          >
            {isAnswerRevealed ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Hide Answer</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Reveal Verified Answer</span>
              </>
            )}
          </button>

          {isAnswerRevealed && (
            <button
              onClick={() => {
                if (activeCardIndex < questions.length - 1) {
                  setActiveCardIndex(activeCardIndex + 1);
                } else {
                  setActiveCardIndex(0);
                }
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Next Question</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Answer Drawer */}
        {isAnswerRevealed && (
          <div className="mt-5 p-5 rounded-xl bg-emerald-950/25 border border-emerald-500/30 text-emerald-100 text-sm animate-fadeIn">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified Explanation:</span>
            </div>
            <div className="text-slate-200 text-xs sm:text-sm leading-relaxed">
              <MarkdownRenderer content={currentQ.answer} compact={true} />
            </div>
          </div>
        )}
      </div>

      {/* Pill Navigation Dots */}
      <div className="flex items-center justify-center space-x-2 mt-5">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveCardIndex(i)}
            className={`h-2 rounded-full transition-all cursor-pointer ${
              activeCardIndex === i ? 'w-6 bg-indigo-500' : 'w-2 bg-slate-700 hover:bg-slate-600'
            }`}
            title={`Go to Question ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ActiveRecallSection;
