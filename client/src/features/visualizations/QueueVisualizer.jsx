import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Eye, RotateCcw, ArrowRight } from 'lucide-react';

const INITIAL_QUEUE = [10, 20, 30, 40];
const MAX_QUEUE_CAPACITY = 6;

export const QueueVisualizer = () => {
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [inputValue, setInputValue] = useState('');
  const [activeAction, setActiveAction] = useState('Idle. First-In, First-Out (FIFO) queue buffer.');
  const [highlightFront, setHighlightFront] = useState(false);

  // Enqueue
  const handleEnqueue = () => {
    const val = parseInt(inputValue, 10);
    if (isNaN(val)) return;

    if (queue.length >= MAX_QUEUE_CAPACITY) {
      setActiveAction('⚠️ QUEUE OVERFLOW! Max capacity reached.');
      return;
    }

    setQueue([...queue, val]);
    setActiveAction(`ENQUEUE(${val}): Element added to REAR in O(1) time.`);
    setInputValue('');
  };

  // Dequeue
  const handleDequeue = () => {
    if (queue.length === 0) {
      setActiveAction('⚠️ QUEUE UNDERFLOW! Queue is already empty.');
      return;
    }

    const dequeued = queue[0];
    setQueue(queue.slice(1));
    setActiveAction(`DEQUEUE(): Removed FRONT element [${dequeued}] in O(1) time.`);
  };

  // Peek Front
  const handlePeek = () => {
    if (queue.length === 0) {
      setActiveAction('Queue is empty. FRONT returns NULL.');
      return;
    }
    const frontVal = queue[0];
    setHighlightFront(true);
    setActiveAction(`PEEK(): Front element is [${frontVal}]. Next in line to be served.`);
    setTimeout(() => setHighlightFront(false), 1200);
  };

  const handleReset = () => {
    setQueue(INITIAL_QUEUE);
    setActiveAction('Reset queue to initial state.');
  };

  return (
    <div className="rounded-3xl p-6 bg-[#080c14] border border-white/10 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <h3 className="text-base font-bold text-white">Interactive Queue Visualizer</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              FIFO Buffer
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            O(1) Enqueue (Rear) | O(1) Dequeue (Front)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePeek}
            disabled={queue.length === 0}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500 hover:text-white transition-all flex items-center space-x-1.5 disabled:opacity-40"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Peek Front</span>
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

      {/* Main Queue Horizontal Pipeline */}
      <div className="overflow-x-auto py-8 px-2">
        <div className="flex items-center justify-center min-w-[320px] gap-2 border-y-2 border-blue-500/30 py-6 px-4 bg-[#0d1322]/50 rounded-2xl relative">
          <span className="absolute left-3 top-1 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
            ← FRONT (Out)
          </span>
          <span className="absolute right-3 top-1 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
            REAR (In) ←
          </span>

          {queue.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-500 font-mono">
              [ Queue is Empty ]
            </div>
          ) : (
            <AnimatePresence>
              {queue.map((val, idx) => {
                const isFront = idx === 0;
                const isRear = idx === queue.length - 1;

                return (
                  <motion.div
                    key={idx}
                    layout
                    initial={{ scale: 0.8, x: 50, opacity: 0 }}
                    animate={{ scale: 1, x: 0, opacity: 1 }}
                    exit={{ scale: 0.8, x: -50, opacity: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="flex flex-col items-center"
                  >
                    <div className="h-4 text-[10px] font-mono font-bold">
                      {isFront && <span className="text-blue-400">[FRONT]</span>}
                      {isRear && !isFront && <span className="text-indigo-400">[REAR]</span>}
                    </div>

                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-base sm:text-lg font-black border shadow-lg transition-all ${
                        isFront && highlightFront
                          ? 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white border-blue-300 scale-105 shadow-blue-500/30'
                          : isFront
                          ? 'bg-blue-600/30 border-blue-500/50 text-blue-200'
                          : 'bg-[#080c14] border-white/15 text-slate-100'
                      }`}
                    >
                      {val}
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono mt-1">pos: {idx}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Action Telemetry */}
      <div className="p-3.5 rounded-2xl bg-[#0b0f19] border border-white/5 text-xs flex items-center space-x-2 text-slate-300 font-mono">
        <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span className="truncate">{activeAction}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 pt-2">
        <input
          type="number"
          placeholder="Enqueue Value (e.g. 50)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-1 bg-[#0b0f19] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleEnqueue}
          disabled={!inputValue || queue.length >= MAX_QUEUE_CAPACITY}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center space-x-1 shadow-md shadow-blue-600/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Enqueue</span>
        </button>
        <button
          onClick={handleDequeue}
          disabled={queue.length === 0}
          className="px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all flex items-center space-x-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Dequeue</span>
        </button>
      </div>
    </div>
  );
};

export default QueueVisualizer;
