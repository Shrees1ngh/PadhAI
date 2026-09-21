import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Search, RotateCcw, ArrowRight, Play, Check } from 'lucide-react';

const INITIAL_NODES = [
  { id: 1, val: 12, next: 2 },
  { id: 2, val: 99, next: 3 },
  { id: 3, val: 37, next: null },
];

export const LinkedListVisualizer = () => {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [highlightId, setHighlightId] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [activeAction, setActiveAction] = useState('Idle. Dynamic heap node pointer structure.');
  const [isTraversing, setIsTraversing] = useState(false);

  // Insert Head
  const handleInsertHead = () => {
    const val = parseInt(inputValue, 10);
    if (isNaN(val)) return;

    const newId = Date.now();
    const newHead = {
      id: newId,
      val,
      next: nodes.length > 0 ? nodes[0].id : null,
    };

    setNodes([newHead, ...nodes]);
    setHighlightId(newId);
    setActiveAction(`Inserted node [${val}] at HEAD (O(1) time). Pointer updated to old head.`);
    setInputValue('');
  };

  // Insert Tail
  const handleInsertTail = () => {
    const val = parseInt(inputValue, 10);
    if (isNaN(val)) return;

    const newId = Date.now();
    const newTail = { id: newId, val, next: null };

    if (nodes.length === 0) {
      setNodes([newTail]);
    } else {
      const updated = nodes.map((n, i) => (i === nodes.length - 1 ? { ...n, next: newId } : n));
      setNodes([...updated, newTail]);
    }

    setHighlightId(newId);
    setActiveAction(`Inserted node [${val}] at TAIL (O(1) with tail pointer or O(N) traversal).`);
    setInputValue('');
  };

  // Delete Head
  const handleDeleteHead = () => {
    if (nodes.length === 0) return;
    const removed = nodes[0];
    setNodes(nodes.slice(1));
    setHighlightId(null);
    setActiveAction(`Removed HEAD node [${removed.val}] in O(1) time. Head pointer advanced.`);
  };

  // Traversal animation
  const handleTraverse = async () => {
    if (nodes.length === 0 || isTraversing) return;
    setIsTraversing(true);
    setActiveAction('Starting linked list traversal from HEAD -> TAIL...');

    for (let i = 0; i < nodes.length; i++) {
      setHighlightId(nodes[i].id);
      setActiveAction(`Visiting Node ${i + 1}: Data = ${nodes[i].val}, Next = ${nodes[i].next ? `Node_${nodes[i].next}` : 'NULL'}`);
      await new Promise((r) => setTimeout(r, 700));
    }

    setActiveAction('Reached end of list (NULL pointer). Traversal complete.');
    setIsTraversing(false);
  };

  // Search
  const handleSearch = () => {
    const val = parseInt(searchValue, 10);
    if (isNaN(val)) return;

    const target = nodes.find((n) => n.val === val);
    if (target) {
      setHighlightId(target.id);
      setActiveAction(`Found node with value [${val}]! Heap Pointer: Node_${target.id}`);
    } else {
      setHighlightId(null);
      setActiveAction(`Value [${val}] not found in linked list (O(N) search completed).`);
    }
    setSearchValue('');
  };

  const handleReset = () => {
    setNodes(INITIAL_NODES);
    setHighlightId(null);
    setActiveAction('Reset linked list to default structure.');
  };

  return (
    <div className="rounded-3xl p-6 bg-[#080c14] border border-white/10 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-base font-bold text-white">Interactive Singly Linked List</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Non-Contiguous Nodes
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Dynamic Node Allocation with Pointers | O(1) Head Insertion
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleTraverse}
            disabled={isTraversing || nodes.length === 0}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-600 hover:text-white transition-all flex items-center space-x-1.5 disabled:opacity-40"
          >
            <Play className="w-3 h-3" />
            <span>Traverse</span>
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

      {/* Nodes visual stream */}
      <div className="overflow-x-auto py-8 px-2">
        <div className="flex items-center justify-start min-w-[360px] gap-3">
          {nodes.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 font-mono w-full">
              Linked List is empty (HEAD = NULL).
            </div>
          ) : (
            nodes.map((node, idx) => {
              const isSelected = highlightId === node.id;
              const isHead = idx === 0;
              const isTail = idx === nodes.length - 1;

              return (
                <React.Fragment key={node.id}>
                  <motion.div
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex flex-col items-center group cursor-pointer"
                    onClick={() => {
                      setHighlightId(node.id);
                      setActiveAction(`Node ${idx + 1}: Data = ${node.val}, Next = ${node.next ? 'Ptr' : 'NULL'}`);
                    }}
                  >
                    {/* Position Label */}
                    <div className="h-4 flex items-center space-x-1 mb-1 text-[10px] font-mono font-bold">
                      {isHead && <span className="text-emerald-400 font-bold">[HEAD]</span>}
                      {isTail && <span className="text-purple-400 font-bold">[TAIL]</span>}
                    </div>

                    {/* Dual Box: Data | Next Pointer */}
                    <div
                      className={`flex rounded-2xl overflow-hidden border shadow-lg transition-all ${
                        isSelected
                          ? 'border-emerald-400 ring-2 ring-emerald-400/50 scale-105 shadow-emerald-500/30'
                          : 'border-white/15 hover:border-emerald-500/50'
                      }`}
                    >
                      {/* Data section */}
                      <div
                        className={`w-12 h-14 sm:w-14 sm:h-14 flex items-center justify-center font-black text-sm sm:text-base ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-[#0d1322] text-slate-100'
                        }`}
                      >
                        {node.val}
                      </div>

                      {/* Next Pointer section */}
                      <div
                        className={`w-9 h-14 sm:w-10 sm:h-14 flex items-center justify-center border-l ${
                          isSelected
                            ? 'bg-emerald-700/80 border-emerald-400 text-emerald-200'
                            : 'bg-[#0b0f1a] border-white/10 text-slate-400'
                        } text-[10px] font-mono font-bold`}
                      >
                        {node.next ? '•→' : '∅'}
                      </div>
                    </div>

                    <span className="text-[9px] font-mono text-slate-500 mt-1.5">
                      ptr: {node.id.toString().slice(-4)}
                    </span>
                  </motion.div>

                  {/* Connector Arrow */}
                  {!isTail && (
                    <div className="flex items-center text-emerald-400/70 font-mono text-sm px-1">
                      <ArrowRight className="w-4 h-4 animate-pulse" />
                    </div>
                  )}

                  {isTail && (
                    <div className="flex items-center space-x-1 text-rose-400/80 font-mono text-[11px] px-1">
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span className="bg-rose-950/40 border border-rose-500/30 px-1.5 py-0.5 rounded">NULL</span>
                    </div>
                  )}
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>

      {/* Telemetry Output */}
      <div className="p-3.5 rounded-2xl bg-[#0b0f19] border border-white/5 text-xs flex items-center space-x-2 text-slate-300 font-mono">
        <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="truncate">{activeAction}</span>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Insert Nodes</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Node Value (e.g. 45)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-[#0b0f19] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleInsertHead}
              disabled={!inputValue}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md"
            >
              + Head
            </button>
            <button
              onClick={handleInsertTail}
              disabled={!inputValue}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-md"
            >
              + Tail
            </button>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Search & Delete</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Search Value"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex-1 bg-[#0b0f19] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleSearch}
              disabled={!searchValue}
              className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold transition-all"
            >
              Search
            </button>
            <button
              onClick={handleDeleteHead}
              disabled={nodes.length === 0}
              className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all"
            >
              Pop Head
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedListVisualizer;
