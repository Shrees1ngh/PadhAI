import React, { useState, useEffect, useCallback } from 'react';
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
  Timer
} from 'lucide-react';
import { generateLessonQuiz } from '../../services/api';

const DEFAULT_SAMPLE_QUESTIONS = [
  {
    question: 'Which of the following is a valid way to declare an array in C++?',
    options: [
      'int arr[] = {1, 2, 3};',
      'array arr(5);',
      'int arr(5);',
      'int {} arr = {1, 2, 3};',
    ],
    correctAnswerIndex: 0,
    explanation: 'int arr[] = {1, 2, 3}; is a valid way to declare and initialize an array in C++ with automatic size deduction.',
  },
  {
    question: 'What is the time complexity of accessing an element in an array by its index?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
    correctAnswerIndex: 0,
    explanation: 'Arrays allocate contiguous memory blocks, allowing direct calculation of memory addresses in constant O(1) time.',
  },
  {
    question: 'Which of the following is NOT a property of standard arrays?',
    options: [
      'Dynamic size during execution',
      'Contiguous memory allocation',
      'Homogeneous elements (same type)',
      'Direct index-based access',
    ],
    correctAnswerIndex: 0,
    explanation: 'Standard arrays have a fixed size allocated at compile time; dynamic arrays require vector or runtime heap allocation.',
  },
  {
    question: 'What happens when you access an array index beyond its allocated bound in C++?',
    options: [
      'Undefined Behavior',
      'Automatic array expansion',
      'Compile-time warning only',
      'Returns null safely',
    ],
    correctAnswerIndex: 0,
    explanation: 'Out-of-bounds access in C++ leads to Undefined Behavior, potentially reading garbage memory or causing a segmentation fault.',
  },
  {
    question: 'Which data structure can be used to easily implement a dynamic array?',
    options: ['std::vector', 'std::pair', 'std::tuple', 'std::bitset'],
    correctAnswerIndex: 0,
    explanation: 'std::vector is the C++ standard library sequence container that encapsulates dynamic size arrays.',
  },
];

export const QuizRunner = ({
  lessonTitle = 'Introduction to Arrays',
  lessonContent = '',
  courseTopic = 'Data Structures',
  currentLevel = 'Beginner',
  onBack,
}) => {
  const [questions, setQuestions] = useState(DEFAULT_SAMPLE_QUESTIONS);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({ 0: 0 }); // Preselect Q1 matching screen
  const [secondsRemaining, setSecondsRemaining] = useState(272); // 04:32

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const currentQ = questions[currentIndex] || questions[0];
  const selectedOpt = userAnswers[currentIndex];
  const isAnswered = selectedOpt !== undefined;
  const isCorrect = isAnswered && selectedOpt === currentQ.correctAnswerIndex;

  const handleSelectOption = (idx) => {
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: idx }));
  };

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="rounded-3xl p-6 sm:p-10 bg-[#0d1322] border border-white/10 shadow-2xl space-y-6">
        
        {/* Header: Lesson Quiz, Question Counter, Timer */}
        <div className="space-y-3 border-b border-white/5 pb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Lesson Quiz
            </h2>
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
              <Timer className="w-3.5 h-3.5 text-indigo-400" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Question {currentIndex + 1} of {questions.length}</span>
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
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
            {currentQ.question}
          </h3>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {currentQ.options.map((opt, optIdx) => {
            const letter = String.fromCharCode(65 + optIdx); // 'A', 'B', 'C', 'D'
            const isSelected = selectedOpt === optIdx;
            const isRight = isAnswered && optIdx === currentQ.correctAnswerIndex;
            const isWrong = isSelected && !isRight;

            return (
              <button
                key={optIdx}
                type="button"
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full p-4 rounded-2xl text-xs sm:text-sm font-mono text-left transition-all flex items-center justify-between border ${
                  isSelected && isRight
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                    : isWrong
                    ? 'bg-rose-500/10 border-rose-500 text-rose-300'
                    : isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-[#080c14] border-white/5 text-slate-300 hover:border-white/15 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                      isSelected && isRight
                        ? 'bg-emerald-500 text-slate-900 font-bold'
                        : isWrong
                        ? 'bg-rose-500 text-white'
                        : isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {letter}
                  </div>
                  <span>{opt}</span>
                </div>

                {isSelected && isRight && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {isWrong && <XCircle className="w-4 h-4 text-rose-400" />}
              </button>
            );
          })}
        </div>

        {/* Explanation Card */}
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl text-xs leading-relaxed border ${
              isCorrect
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center space-x-1.5 font-bold mb-1">
              {isCorrect ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
              <span>{isCorrect ? 'Correct!' : 'Incorrect'}</span>
            </div>
            <p className="text-slate-300">{currentQ.explanation}</p>
          </motion.div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentIndex === 0}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 text-xs font-bold text-slate-300 transition-all flex items-center space-x-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center space-x-2"
            >
              <span>Next Question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 transition-all flex items-center space-x-2"
            >
              <span>Finish Quiz</span>
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default QuizRunner;
