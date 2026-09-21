import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Eye, RotateCcw, ArrowRight, Layers } from 'lucide-react';

const INITIAL_STACK = [5, 15, 25, 35];
const MAX_CAPACITY = 7;

export const StackVisualizer = () => {
  const [stack, setStack] = useState(INITIAL_STACK);
  const [inputValue, setInputValue] = useState('');
  const [activeAction, setActiveAction] = useState('Idle. Last-In, First-Out (LIFO) stack container.');
  const [highlightTop, setHighlightTop] = useState(false);

  // Push
  const handlePush = () => {
    const val = parseInt(inputValue, 10);
    if (isNaN(val)) return;

    if (stack.length >= MAX_CAPACITY) {
      setActiveAction('⚠️ STACK OVERFLOW! Stack has reached its maximum capacity.');
      return;
    }

    setStack([...stack, val]);
    setHighlightTop(true);
    setActiveAction(`PUSH(${val}): Added element to TOP of stack in O(1) time.`);
    setInputValue('');
    setTimeout(() => setHighlightTop(false), 800);
  };

  // Pop
  const handlePop = () => {
    if (stack.length === 0) {
      setActiveAction('⚠️ STACK UNDERFLOW! Cannot pop from an empty stack.');
      return;
    }

    const popped = stack[stack.length - 1];
    setStack(stack.slice(0, -1));
    setActiveAction(`POP(): Removed TOP element [${popped}] in O(1) time.`);
  };

  // Peek
  const handlePeek = () => {
    if (stack.length === 0) {
      setActiveAction('Stack is empty. PEEK() returns NULL / undefined.');
      return;
    }
    const topVal = stack[stack.length - 1];
    setHighlightTop(true);
    setActiveAction(`PEEK(): Current TOP element is [${topVal}] at index [${stack.length - 1}].`);
    setTimeout(() => setHighlightTop(false), 1200);
  };

  const handleReset = () => {
    setStack(INITIAL_STACK);
    setActiveAction('Reset stack to default state.');
  };

  return (
    <div className="rounded-3xl p-6 bg-[#080c14] border border-white/10 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-base font-bold text-white">Interactive Stack Visualizer</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              LIFO Structure
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            O(1) Push | O(1) Pop | O(1) Peek / Top
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePeek}
            disabled={stack.length === 0}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-black transition-all flex items-center space-x-1.5 disabled:opacity-40"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Peek Top</span>
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Stack Beaker / Container */}
      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative w-48 sm:w-56 border-x-4 border-b-4 border-amber-500/40 rounded-b-2xl p-3 bg-[#0d1322]/80 flex flex-col-reverse justify-start gap-2 min-h-[220px] shadow-2xl">
          {stack.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500 font-mono">
              [ Empty Stack ]
            </div>
          )}

          <AnimatePresence>
            {stack.map((val, idx) => {
              const isTop = idx === stack.length - 1;
              return (
                <motion.div
                  key={idx}
                  initial={{ y: -50, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -50, opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-between border shadow-md font-mono ${
                    isTop && highlightTop
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black border-amber-300 scale-105 shadow-amber-500/30'
                      : isTop
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                      : 'bg-[#080c14] border-white/10 text-slate-200'
                  }`}
                >
                  <span className="text-xs font-bold">{val}</span>
                  {isTop ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300 border border-amber-500/40">
                      TOP →
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">[{idx}]</span>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Action Telemetry */}
      <div className="p-3.5 rounded-2xl bg-[#0b0f19] border border-white/5 text-xs flex items-center space-x-2 text-slate-300 font-mono">
        <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="truncate">{activeAction}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 pt-2">
        <input
          type="number"
          placeholder="Push Value (e.g. 50)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 bg-[#0b0f19] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
        <button
          onClick={handlePush}
          disabled={!inputValue || stack.length >= MAX_CAPACITY}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-black text-xs font-bold transition-all flex items-center space-x-1 shadow-md shadow-amber-600/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Push</span>
        </button>
        <button
          onClick={handlePop}
          disabled={stack.length === 0}
          className="px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all flex items-center space-x-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Pop</span>
        </button>
      </div>
    </div>
  );
};

export default StackVisualizer;
