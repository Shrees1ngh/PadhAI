import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Award,
  AlertTriangle,
  Lightbulb,
  Check,
  RefreshCw,
  Clock,
  Timer,
  BookOpen
} from 'lucide-react';
import { generateLessonQuiz, saveQuizAttempt } from '../../services/api';

export const QuizRunner = ({
  courseId = 'general',
  moduleIndex = 0,
  lessonIndex = 0,
  lessonTitle = 'Active Lesson',
  lessonContent = '',
  courseTopic = 'Course Topic',
  currentLevel = 'Beginner',
  onBack,
}) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // Starts strictly empty: no preselected answer
  const [secondsRemaining, setSecondsRemaining] = useState(300);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [savingAttempt, setSavingAttempt] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // { success: boolean, message: string }

  const timerRef = useRef(null);

  // Fetch / Generate dynamic quiz from Gemini backend
  const [isDemo, setIsDemo] = useState(false);

  const fetchQuiz = useCallback(async () => {
    if (!lessonTitle) return;

    setLoading(true);
    setError(null);
    setIsSubmitted(false);
    setUserAnswers({});
    setCurrentIndex(0);
    setSaveStatus(null);

    try {
      const res = await generateLessonQuiz({
        courseId,
        moduleIndex,
        lessonIndex,
        lessonTitle,
        lessonContent,
        courseTopic,
        currentLevel,
      });

      setIsDemo(Boolean(res?.isDemo || res?.quiz?.isDemo || res?.quiz?.questions?.some?.(q => q.isDemo)));

      if (res?.success && res.quiz?.questions?.length > 0) {
        setQuestions(res.quiz.questions);
        const totalSecs = Math.max(120, res.quiz.questions.length * 60);
        setSecondsRemaining(totalSecs);
      } else {
        throw new Error(res?.message || 'Could not generate quiz for this lesson.');
      }
    } catch (err) {
      console.error('Quiz generation error:', err);
      setError(err.message || 'Failed to generate quiz. Please try again.');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [courseId, moduleIndex, lessonIndex, lessonTitle, lessonContent, courseTopic, currentLevel]);

  useEffect(() => {
    fetchQuiz();
  }, [fetchQuiz]);

  // Submit and save quiz attempt
  const handleFinishQuiz = useCallback(
    async (finalAnswers = userAnswers) => {
      if (isSubmitted || questions.length === 0) return;

      setIsSubmitted(true);

      // Compute score
      let correctCount = 0;
      const weakConcepts = [];

      questions.forEach((q, idx) => {
        const correctIdx = q.correctAnswer !== undefined ? q.correctAnswer : q.correctAnswerIndex;
        if (finalAnswers[idx] === correctIdx) {
          correctCount += 1;
        } else if (q.relatedConcept) {
          weakConcepts.push(q.relatedConcept);
        }
      });

      const percentage = Math.round((correctCount / questions.length) * 100);

      if (isDemo) {
        setSavingAttempt(false);
        setSaveStatus({
          success: false,
          message: 'Demo Mode: Quiz evaluated locally. Saving is disabled for demo content.',
        });
        return;
      }

      // Persist attempt via existing save API
      setSavingAttempt(true);
      try {
        const formattedUserAnswers = questions.map((_, i) =>
          finalAnswers[i] !== undefined ? finalAnswers[i] : -1
        );

        const saveRes = await saveQuizAttempt({
          courseId: courseId || 'general',
          moduleIndex: Number(moduleIndex) || 0,
          lessonIndex: Number(lessonIndex) || 0,
          lessonTitle,
          questions,
          score: correctCount,
          totalQuestions: questions.length,
          percentage,
          userAnswers: formattedUserAnswers,
          weakConcepts,
        });

        if (saveRes?.success) {
          setSaveStatus({ success: true, message: 'Quiz score saved.' });
        } else if (saveRes?.mongoUnavailable) {
          setSaveStatus({
            success: false,
            message: 'Database offline: Result evaluated locally.',
          });
        }
      } catch (err) {
        console.warn('Quiz attempt save notice:', err.message);
        setSaveStatus({
          success: false,
          message: err.message || 'Unable to save attempt to server.',
        });
      } finally {
        setSavingAttempt(false);
      }
    },
    [isSubmitted, questions, courseId, moduleIndex, lessonIndex, lessonTitle, userAnswers]
  );

  // Timer countdown
  useEffect(() => {
    if (loading || isSubmitted || questions.length === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleFinishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, isSubmitted, questions.length, handleFinishQuiz]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelectOption = (optIdx) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: optIdx }));
  };

  const handleRetryQuiz = () => {
    setIsSubmitted(false);
    setUserAnswers({});
    setCurrentIndex(0);
    setSaveStatus(null);
    setSecondsRemaining(Math.max(120, questions.length * 60));
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="rounded-3xl p-12 bg-[#0d1322] border border-white/10 shadow-2xl text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
          <h3 className="text-base font-bold text-white">
            Generating Conceptual Quiz with PadhAI...
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Synthesizing 5 targeted assessment questions calibrated to {currentLevel} level for{' '}
            <span className="text-indigo-300 font-semibold">{lessonTitle}</span>.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="rounded-3xl p-10 bg-[#0d1322] border border-white/10 shadow-2xl text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Quiz Unavailable</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            {error || "Couldn't generate this resource right now. Please try again."}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={fetchQuiz}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Generation</span>
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
      </div>
    );
  }

  // ==========================================
  // SCREEN: QUIZ RESULTS REVIEW
  // ==========================================
  if (isSubmitted) {
    let score = 0;
    questions.forEach((q, idx) => {
      const correctIdx = q.correctAnswer !== undefined ? q.correctAnswer : q.correctAnswerIndex;
      if (userAnswers[idx] === correctIdx) score += 1;
    });
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 60;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {isDemo && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 font-bold uppercase text-xs">Demo Data</span>
            <span>Quiz evaluated in offline demo mode. Results are not saved to the database.</span>
          </div>
        )}
        <div className="rounded-3xl p-6 sm:p-10 bg-[#0d1322] border border-white/10 shadow-2xl space-y-8">
          
          {/* Result Score Header */}
          <div className="text-center space-y-3 pb-6 border-b border-white/5">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/20 mb-1">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Quiz Completed
            </h2>
            <p className="text-xs text-slate-400">
              {lessonTitle} • {currentLevel} Level
            </p>

            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="px-5 py-2 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs text-slate-400 block">Score</span>
                <span className="text-xl sm:text-2xl font-black text-white">
                  {score} / {questions.length}
                </span>
              </div>
              <div className="px-5 py-2 rounded-2xl bg-white/5 border border-white/10">
                <span className="text-xs text-slate-400 block">Accuracy</span>
                <span
                  className={`text-xl sm:text-2xl font-black ${
                    passed ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {percentage}%
                </span>
              </div>
            </div>

            {saveStatus && (
              <p
                className={`text-xs font-semibold pt-1 ${
                  saveStatus.success ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                {saveStatus.message}
              </p>
            )}
          </div>

          {/* Detailed Question Review List */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Question Breakdown & Explanations
            </h3>

            {questions.map((q, idx) => {
              const correctIdx =
                q.correctAnswer !== undefined ? q.correctAnswer : q.correctAnswerIndex;
              const selectedOpt = userAnswers[idx];
              const isQCorrect = selectedOpt === correctIdx;
              const wasAnswered = selectedOpt !== undefined;

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border space-y-3.5 transition-all ${
                    isQCorrect
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-rose-500/5 border-rose-500/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Question {idx + 1}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                        {q.question}
                      </h4>
                    </div>

                    <span
                      className={`shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-bold uppercase ${
                        isQCorrect
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {isQCorrect ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Correct</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>{wasAnswered ? 'Incorrect' : 'Unanswered'}</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Options review */}
                  <div className="space-y-1.5 pt-1">
                    {q.options.map((opt, optIdx) => {
                      const isThisCorrect = optIdx === correctIdx;
                      const isThisSelected = selectedOpt === optIdx;

                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl text-xs flex items-center justify-between border ${
                            isThisCorrect
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200 font-semibold'
                              : isThisSelected
                              ? 'bg-rose-500/15 border-rose-500/40 text-rose-200 line-through'
                              : 'bg-white/5 border-white/5 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="w-5 text-center font-bold text-xs">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span>{opt}</span>
                          </div>
                          {isThisCorrect && (
                            <span className="text-xs font-bold text-emerald-400">
                              Correct Answer
                            </span>
                          )}
                          {isThisSelected && !isThisCorrect && (
                            <span className="text-xs font-bold text-rose-400">
                              Your Choice
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation card */}
                  {q.explanation && (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 leading-relaxed">
                      <span className="font-bold text-indigo-400 block mb-0.5">
                        💡 Explanation:
                      </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-white/5">
            <button
              onClick={handleRetryQuiz}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 transition-all flex items-center space-x-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Quiz</span>
            </button>

            {onBack && (
              <button
                onClick={onBack}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center space-x-2"
              >
                <span>Back to Lesson</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // SCREEN: ACTIVE QUIZ RUNNER
  // ==========================================
  const currentQ = questions[currentIndex] || questions[0];
  const selectedOpt = userAnswers[currentIndex];
  const isAnswered = selectedOpt !== undefined;
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {isDemo && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 font-bold uppercase text-xs">Demo Data</span>
          <span>Sample quiz questions generated in developer demo mode.</span>
        </div>
      )}
      <div className="rounded-3xl p-6 sm:p-10 bg-[#0d1322] border border-white/10 shadow-2xl space-y-6">
        
        {/* Header: Lesson Quiz, Question Counter, Timer */}
        <div className="space-y-3 border-b border-white/5 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Lesson Quiz
              </h2>
              <p className="text-xs text-slate-400">{lessonTitle}</p>
            </div>

            <div
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                secondsRemaining < 60
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
                  : 'bg-white/5 border-white/10 text-slate-300'
              }`}
            >
              <Timer className="w-3.5 h-3.5 text-indigo-400" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>
              Question {currentIndex + 1} of {questions.length} • ({answeredCount}/{questions.length} answered)
            </span>
            <span>{Math.round(progressPercent)}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-[#080c14] overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Prompt */}
        <div className="space-y-2">
          {currentQ.relatedConcept && (
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              {currentQ.relatedConcept}
            </span>
          )}
          <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
            {currentQ.question}
          </h3>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {currentQ.options?.map((opt, optIdx) => {
            const letter = String.fromCharCode(65 + optIdx); // 'A', 'B', 'C', 'D'
            const isSelected = selectedOpt === optIdx;

            return (
              <button
                key={optIdx}
                type="button"
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full p-4 rounded-2xl text-xs sm:text-sm font-mono text-left transition-all flex items-center justify-between border ${
                  isSelected
                    ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                    : 'bg-[#080c14] border-white/5 text-slate-300 hover:border-white/15 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {letter}
                  </div>
                  <span>{opt}</span>
                </div>

                {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
              </button>
            );
          })}
        </div>

        {/* Bottom Navigation / Submit Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 text-xs font-bold text-slate-300 transition-all flex items-center space-x-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => handleFinishQuiz()}
                disabled={savingAttempt}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition-all flex items-center space-x-2"
              >
                <span>{savingAttempt ? 'Saving...' : 'Finish & Submit'}</span>
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default QuizRunner;
