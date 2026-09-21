import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, ArrowRight, Zap, BarChart2 } from 'lucide-react';

const INITIAL_ARRAY = [45, 12, 85, 32, 89, 39, 69, 22, 55, 95];

export const SortingVisualizer = () => {
  const [array, setArray] = useState(INITIAL_ARRAY);
  const [comparing, setComparing] = useState([]);
  const [swapping, setSwapping] = useState([]);
  const [sortedIndices, setSortedIndices] = useState([]);
  const [algorithm, setAlgorithm] = useState('bubble'); // 'bubble' | 'selection' | 'insertion' | 'quick'
  const [isSorting, setIsSorting] = useState(false);
  const [activeAction, setActiveAction] = useState('Idle. Ready to visualize sorting algorithms.');
  const [speedMs, setSpeedMs] = useState(150);

  const stopSignalRef = useRef(false);

  // Bubble Sort
  const runBubbleSort = async () => {
    let arr = [...array];
    let n = arr.length;
    setIsSorting(true);
    stopSignalRef.current = false;
    setSortedIndices([]);

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (stopSignalRef.current) break;

        setComparing([j, j + 1]);
        setActiveAction(`Comparing arr[${j}] (${arr[j]}) with arr[${j + 1}] (${arr[j + 1]})`);
        await new Promise((r) => setTimeout(r, speedMs));

        if (arr[j] > arr[j + 1]) {
          setSwapping([j, j + 1]);
          let temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          setArray([...arr]);
          setActiveAction(`Swapped ${arr[j + 1]} and ${arr[j]} (O(N^2) comparison loop)`);
          await new Promise((r) => setTimeout(r, speedMs));
          setSwapping([]);
        }
      }
      setSortedIndices((prev) => [...prev, n - i - 1]);
    }
    setSortedIndices([...Array(n).keys()]);
    setComparing([]);
    setSwapping([]);
    setIsSorting(false);
    setActiveAction('Bubble Sort completed! All elements in ascending order.');
  };

  // Selection Sort
  const runSelectionSort = async () => {
    let arr = [...array];
    let n = arr.length;
    setIsSorting(true);
    stopSignalRef.current = false;
    setSortedIndices([]);

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        if (stopSignalRef.current) break;
        setComparing([minIdx, j]);
        setActiveAction(`Scanning for minimum element: current minimum is [${arr[minIdx]}]`);
        await new Promise((r) => setTimeout(r, speedMs));

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }

      if (minIdx !== i) {
        setSwapping([i, minIdx]);
        let temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
        setArray([...arr]);
        setActiveAction(`Placed minimum element [${arr[i]}] at position [${i}]`);
        await new Promise((r) => setTimeout(r, speedMs));
        setSwapping([]);
      }
      setSortedIndices((prev) => [...prev, i]);
    }
    setSortedIndices([...Array(n).keys()]);
    setComparing([]);
    setSwapping([]);
    setIsSorting(false);
    setActiveAction('Selection Sort completed!');
  };

  // Insertion Sort
  const runInsertionSort = async () => {
    let arr = [...array];
    let n = arr.length;
    setIsSorting(true);
    stopSignalRef.current = false;
    setSortedIndices([]);

    for (let i = 1; i < n; i++) {
      let key = arr[i];
      let j = i - 1;

      while (j >= 0 && arr[j] > key) {
        if (stopSignalRef.current) break;
        setComparing([j, j + 1]);
        arr[j + 1] = arr[j];
        setArray([...arr]);
        setActiveAction(`Shifted ${arr[j]} right to make space for key ${key}`);
        j--;
        await new Promise((r) => setTimeout(r, speedMs));
      }
      arr[j + 1] = key;
      setArray([...arr]);
      setSortedIndices((prev) => [...prev, i]);
    }
    setSortedIndices([...Array(n).keys()]);
    setComparing([]);
    setIsSorting(false);
    setActiveAction('Insertion Sort completed!');
  };

  const handleStartSort = () => {
    if (algorithm === 'bubble') runBubbleSort();
    else if (algorithm === 'selection') runSelectionSort();
    else if (algorithm === 'insertion') runInsertionSort();
  };

  const handleReset = () => {
    stopSignalRef.current = true;
    setIsSorting(false);
    setArray(INITIAL_ARRAY);
    setComparing([]);
    setSwapping([]);
    setSortedIndices([]);
    setActiveAction('Reset array to unsorted state.');
  };

  const handleRandomize = () => {
    stopSignalRef.current = true;
    setIsSorting(false);
    const randomized = Array.from({ length: 10 }, () => Math.floor(Math.random() * 85) + 15);
    setArray(randomized);
    setComparing([]);
    setSwapping([]);
    setSortedIndices([]);
    setActiveAction('Generated random array values.');
  };

  return (
    <div className="rounded-3xl p-6 bg-[#080c14] border border-white/10 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <h3 className="text-base font-bold text-white">Interactive Sorting Visualizer</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Comparative Array
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Step-by-step element comparisons, swaps, and sorted boundary highlights
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRandomize}
            disabled={isSorting}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-all disabled:opacity-40"
          >
            Randomize
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

      {/* Bar Chart Visualization */}
      <div className="flex items-end justify-center min-h-[190px] gap-2 pt-6 pb-2 px-2 overflow-x-auto bg-[#0d1322]/60 rounded-2xl border border-white/5">
        {array.map((val, idx) => {
          const isComparing = comparing.includes(idx);
          const isSwapping = swapping.includes(idx);
          const isSorted = sortedIndices.includes(idx);

          let barColor = 'bg-indigo-600/80 border-indigo-400/40 text-indigo-200';
          if (isSorted) barColor = 'bg-emerald-600 border-emerald-400 text-white';
          if (isComparing) barColor = 'bg-amber-500 border-yellow-300 text-black shadow-lg shadow-amber-500/30';
          if (isSwapping) barColor = 'bg-rose-500 border-rose-300 text-white animate-pulse shadow-lg shadow-rose-500/30';

          return (
            <div key={idx} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-mono text-slate-400 font-bold">{val}</span>
              <motion.div
                layout
                style={{ height: `${val * 1.6}px` }}
                className={`w-7 sm:w-8 rounded-xl border flex items-center justify-center transition-colors duration-150 ${barColor}`}
              />
              <span className="text-[9px] font-mono text-slate-500">[{idx}]</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-slate-400">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-indigo-600 border border-indigo-400" />
          <span>Unsorted</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-amber-500 border border-yellow-300" />
          <span>Comparing</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-rose-500 border border-rose-300" />
          <span>Swapping</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-emerald-600 border border-emerald-400" />
          <span>Sorted</span>
        </div>
      </div>

      {/* Telemetry Output */}
      <div className="p-3.5 rounded-2xl bg-[#0b0f19] border border-white/5 text-xs flex items-center space-x-2 text-slate-300 font-mono">
        <ArrowRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
        <span className="truncate">{activeAction}</span>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        {/* Algorithm Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {[
            { id: 'bubble', label: 'Bubble Sort' },
            { id: 'selection', label: 'Selection Sort' },
            { id: 'insertion', label: 'Insertion Sort' },
          ].map((alg) => (
            <button
              key={alg.id}
              disabled={isSorting}
              onClick={() => setAlgorithm(alg.id)}
              className={`flex-1 sm:flex-none px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                algorithm === alg.id
                  ? 'bg-rose-600/20 border-rose-500/50 text-rose-300'
                  : 'bg-[#0b0f19] border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {alg.label}
            </button>
          ))}
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartSort}
          disabled={isSorting}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 disabled:opacity-40 text-white text-xs font-black shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center space-x-2 shrink-0"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Run {algorithm.toUpperCase()} SORT</span>
        </button>
      </div>
    </div>
  );
};

export default SortingVisualizer;
