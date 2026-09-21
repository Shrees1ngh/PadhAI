import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Plus, Trash2, Search, ArrowRight, Layers, Cpu } from 'lucide-react';

const INITIAL_ARRAY = [10, 20, 30, 40, 50];
const BASE_ADDRESS = 0x1000;
const ELEMENT_SIZE = 4; // 4 bytes for 32-bit int

export const ArrayVisualizer = () => {
  const [array, setArray] = useState(INITIAL_ARRAY);
  const [highlightIndex, setHighlightIndex] = useState(null);
  const [activeAction, setActiveAction] = useState('Idle. Ready for interaction.');
  const [inputValue, setInputValue] = useState('');
  const [indexValue, setIndexValue] = useState('0');
  const [searchValue, setSearchValue] = useState('');
  const [showMemory, setShowMemory] = useState(true);

  // Insert element at index
  const handleInsert = () => {
    const val = parseInt(inputValue, 10);
    const idx = parseInt(indexValue, 10);
    if (isNaN(val)) return;

    const targetIdx = Math.max(0, Math.min(idx, array.length));
    const newArr = [...array];
    newArr.splice(targetIdx, 0, val);
    setArray(newArr);
    setHighlightIndex(targetIdx);
    setActiveAction(`Inserted value ${val} at index ${targetIdx}. Elements shifted right (O(N) operation).`);
    setInputValue('');
  };

  // Delete element at index
  const handleDelete = (idx) => {
    if (array.length === 0) return;
    const targetIdx = idx !== undefined ? idx : parseInt(indexValue, 10);
    if (targetIdx < 0 || targetIdx >= array.length) return;

    const removedVal = array[targetIdx];
    const newArr = array.filter((_, i) => i !== targetIdx);
    setArray(newArr);
    setHighlightIndex(null);
    setActiveAction(`Deleted value ${removedVal} from index ${targetIdx}. Remaining elements shifted left (O(N) operation).`);
  };

  // Search element by value
  const handleSearch = () => {
    const val = parseInt(searchValue, 10);
    if (isNaN(val)) return;

    let foundIdx = -1;
    for (let i = 0; i < array.length; i++) {
      if (array[i] === val) {
        foundIdx = i;
        break;
      }
    }

    if (foundIdx !== -1) {
      setHighlightIndex(foundIdx);
      setActiveAction(`Found value ${val} at index ${foundIdx}! Memory address: 0x${(BASE_ADDRESS + foundIdx * ELEMENT_SIZE).toString(16).toUpperCase()}`);
    } else {
      setHighlightIndex(null);
      setActiveAction(`Value ${val} not found in array (checked all elements in O(N) linear time).`);
    }
    setSearchValue('');
  };

  const handleReset = () => {
    setArray(INITIAL_ARRAY);
    setHighlightIndex(null);
    setActiveAction('Reset array to default state.');
  };

  return (
    <div className="rounded-3xl p-6 bg-[#080c14] border border-white/10 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-base font-bold text-white">Interactive Array Visualizer</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Contiguous Memory
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            O(1) Direct Random Access | O(N) Insertion & Deletion
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowMemory(!showMemory)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 ${
              showMemory
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{showMemory ? 'Hide Memory' : 'Show Memory'}</span>
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

      {/* Main Array Display */}
      <div className="overflow-x-auto py-6 px-2">
        <div className="flex items-center justify-center min-w-[320px] gap-2">
          {array.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 font-mono">
              Array is currently empty. Use the controls below to insert elements.
            </div>
          ) : (
            array.map((val, idx) => {
              const isSelected = highlightIndex === idx;
              const memAddr = `0x${(BASE_ADDRESS + idx * ELEMENT_SIZE).toString(16).toUpperCase()}`;

              return (
                <motion.div
                  key={idx}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  onClick={() => {
                    setHighlightIndex(idx);
                    setActiveAction(`Inspecting Index ${idx}: Value = ${val}, Memory Address = ${memAddr}`);
                  }}
                  className={`flex flex-col items-center cursor-pointer group`}
                >
                  {/* Index Indicator */}
                  <span className="text-[11px] font-mono font-bold text-slate-400 mb-1.5 group-hover:text-cyan-400 transition-colors">
                    [{idx}]
                  </span>

                  {/* Array Cell */}
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-base sm:text-lg font-black transition-all shadow-lg border relative ${
                      isSelected
                        ? 'bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white border-cyan-400 shadow-cyan-500/30 scale-105 ring-2 ring-cyan-400/50'
                        : 'bg-[#0d1322] border-white/15 text-slate-100 hover:border-cyan-500/50 hover:bg-[#121a30]'
                    }`}
                  >
                    {val}
                  </div>

                  {/* Memory Address Offset */}
                  {showMemory && (
                    <span className="text-[9px] font-mono text-cyan-400/80 mt-1.5 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/20">
                      {memAddr}
                    </span>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Action Telemetry Box */}
      <div className="p-3.5 rounded-2xl bg-[#0b0f19] border border-white/5 text-xs flex items-center space-x-2 text-slate-300 font-mono">
        <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span className="truncate">{activeAction}</span>
      </div>

      {/* Interactive Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {/* Insert Control */}
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Insert Element</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Val (e.g. 25)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-1/2 bg-[#0b0f19] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <input
              type="number"
              placeholder="Idx"
              value={indexValue}
              onChange={(e) => setIndexValue(e.target.value)}
              className="w-1/4 bg-[#0b0f19] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleInsert}
              disabled={!inputValue}
              className="flex-1 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center justify-center space-x-1 shadow-md shadow-cyan-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Insert</span>
            </button>
          </div>
        </div>

        {/* Search & Delete Control */}
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Search & Delete</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Find Val"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex-1 bg-[#0b0f19] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleSearch}
              disabled={!searchValue}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center space-x-1"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
            <button
              onClick={() => handleDelete()}
              disabled={array.length === 0}
              className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArrayVisualizer;
