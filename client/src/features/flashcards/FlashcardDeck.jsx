import React, { useState } from 'react';
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
  Zap
} from 'lucide-react';

const DEFAULT_SAMPLE_DECK = [
  {
    front: 'What is an Array?',
    back: 'A linear data structure consisting of a collection of elements identified by index or key, stored in contiguous memory.',
  },
  {
    front: 'What is Time Complexity of Array Indexing?',
    back: 'O(1) constant time, because memory address can be directly computed using base_address + index * element_size.',
  },
  {
    front: 'What is a Stack?',
    back: 'A linear data structure that follows the LIFO (Last In, First Out) principle, where elements are inserted (push) and removed (pop) from the top.',
  },
  {
    front: 'What is a Queue?',
    back: 'A linear data structure that follows the FIFO (First In, First Out) principle, where elements are enqueued at rear and dequeued from front.',
  },
  {
    front: 'What is a Linked List?',
    back: 'A linear collection of data elements called nodes, each containing a data value and a reference (pointer) to the next node in sequence.',
  },
  {
    front: 'Difference between Array and Linked List?',
    back: 'Arrays have fixed size & contiguous memory (O(1) access); Linked Lists have dynamic size & non-contiguous memory (O(n) sequential access).',
  },
  {
    front: 'What is a Hash Table?',
    back: 'A data structure that maps keys to values using a hash function to compute an index into an array of buckets (average O(1) lookup).',
  },
  {
    front: 'What is a Binary Search Tree (BST)?',
    back: 'A binary tree where each node has at most two children, and left subtree values < node value < right subtree values.',
  },
  {
    front: 'What is Recursion?',
    back: 'A programming technique where a function solves a problem by calling itself with smaller instances until reaching a base condition.',
  },
  {
    front: 'What is Space Complexity?',
    back: 'The total amount of memory space required by an algorithm or program to execute as a function of the input size N.',
  },
];

export const FlashcardDeck = ({
  lessonTitle = 'Data Structures',
  onBack,
}) => {
  const [cards, setCards] = useState(DEFAULT_SAMPLE_DECK);
  const [currentIndex, setCurrentIndex] = useState(2); // Card 3 ("What is a Stack?") matching Screen 9
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewStats, setReviewStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  const currentCard = cards[currentIndex] || cards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  };

  const handleReview = (type) => {
    setReviewStats((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    handleNext();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Flashcards</span>
            </h2>
            <p className="text-xs text-slate-400">{lessonTitle}</p>
          </div>
        </div>

        {/* Counter Badge */}
        <div className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold text-slate-200">
          {currentIndex + 1} / {cards.length}
        </div>
      </div>

      {/* Main 3D Flip Card Container */}
      <div className="relative flex items-center justify-between gap-3">
        
        {/* Previous Arrow Button */}
        <button
          onClick={handlePrev}
          className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center shrink-0 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* The Flip Card */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex-1 min-h-[300px] sm:min-h-[340px] rounded-3xl p-8 sm:p-12 bg-white text-slate-900 border border-slate-200 shadow-2xl cursor-pointer select-none flex flex-col items-center justify-center text-center relative overflow-hidden transition-all transform active:scale-[0.99] group"
        >
          {/* Subtle top indicator */}
          <div className="absolute top-4 left-6 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isFlipped ? 'Answer' : 'Question'}
          </div>

          <div className="absolute top-4 right-6 text-slate-400 group-hover:text-slate-600 transition-colors">
            <RotateCw className="w-4 h-4" />
          </div>

          <div className="my-auto space-y-3">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {isFlipped ? currentCard.back : currentCard.front}
            </h3>
            
            <p className="text-xs text-slate-400 font-medium">
              {isFlipped ? 'Click to flip back' : 'Click to reveal the answer'}
            </p>
          </div>
        </div>

        {/* Next Arrow Button */}
        <button
          onClick={handleNext}
          className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center shrink-0 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

      </div>

      {/* Spaced Repetition Review Action Buttons (Screen 9) */}
      <div className="grid grid-cols-4 gap-3 pt-2">
        
        {/* Again */}
        <button
          type="button"
          onClick={() => handleReview('again')}
          className="p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2"
        >
          <span className="w-3 h-3 rounded-full bg-rose-500" />
          <span>Again</span>
        </button>

        {/* Hard */}
        <button
          type="button"
          onClick={() => handleReview('hard')}
          className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2"
        >
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Hard</span>
        </button>

        {/* Good */}
        <button
          type="button"
          onClick={() => handleReview('good')}
          className="p-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2"
        >
          <span className="w-3 h-3 rounded-full bg-indigo-500" />
          <span>Good</span>
        </button>

        {/* Easy */}
        <button
          type="button"
          onClick={() => handleReview('easy')}
          className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2"
        >
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Easy</span>
        </button>

      </div>

    </div>
  );
};

export default FlashcardDeck;
