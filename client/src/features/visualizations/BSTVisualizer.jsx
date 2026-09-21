import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, RotateCcw, ArrowRight } from 'lucide-react';

const INITIAL_BST = [
  { id: 1, val: 50, x: 200, y: 35, leftId: 2, rightId: 3 },
  { id: 2, val: 30, x: 100, y: 110, leftId: 4, rightId: 5 },
  { id: 3, val: 70, x: 300, y: 110, leftId: 6, rightId: 7 },
  { id: 4, val: 20, x: 50, y: 185, leftId: null, rightId: null },
  { id: 5, val: 40, x: 150, y: 185, leftId: null, rightId: null },
  { id: 6, val: 60, x: 250, y: 185, leftId: null, rightId: null },
  { id: 7, val: 80, x: 350, y: 185, leftId: null, rightId: null },
];

export const BSTVisualizer = () => {
  const [nodes, setNodes] = useState(INITIAL_BST);
  const [highlightId, setHighlightId] = useState(null);
  const [activeAction, setActiveAction] = useState('Idle. BST Invariant: Left < Root < Right.');
  const [searchValue, setSearchValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Binary Search Traversal Animation
  const handleBSTSearch = async () => {
    const target = parseInt(searchValue, 10);
    if (isNaN(target) || isSearching) return;

    setIsSearching(true);
    setActiveAction(`Searching for ${target} using BST Property...`);

    let current = nodes.find((n) => n.id === 1); // root = 50

    while (current) {
      setHighlightId(current.id);
      setActiveAction(`Comparing: target ${target} with current node ${current.val}`);
      await new Promise((r) => setTimeout(r, 700));

      if (target === current.val) {
        setActiveAction(`🎯 Found ${target}! Match located at node (${current.val}).`);
        setIsSearching(false);
        setSearchValue('');
        return;
      } else if (target < current.val) {
        setActiveAction(`${target} < ${current.val} → Navigating LEFT subtree.`);
        await new Promise((r) => setTimeout(r, 600));
        current = nodes.find((n) => n.id === current.leftId);
      } else {
        setActiveAction(`${target} > ${current.val} → Navigating RIGHT subtree.`);
        await new Promise((r) => setTimeout(r, 600));
        current = nodes.find((n) => n.id === current.rightId);
      }
    }

    setHighlightId(null);
    setActiveAction(`Element ${target} does NOT exist in BST. Reached NULL leaf.`);
    setIsSearching(false);
    setSearchValue('');
  };

  const handleReset = () => {
    setNodes(INITIAL_BST);
    setHighlightId(null);
    setActiveAction('Reset BST.');
  };

  return (
    <div className="rounded-3xl p-6 bg-[#080c14] border border-white/10 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <h3 className="text-base font-bold text-white">Binary Search Tree (BST)</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              O(log N) Lookup
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Left subtree &lt; Root &lt; Right subtree invariant
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* BST SVG Graphic */}
      <div className="flex flex-col items-center justify-center py-2 overflow-x-auto">
        <svg viewBox="0 0 400 230" className="w-full max-w-[440px] h-[230px] select-none">
          {/* Branch lines */}
          <line x1="200" y1="35" x2="100" y2="110" stroke="#9333ea" strokeWidth="2.5" strokeOpacity="0.4" />
          <line x1="200" y1="35" x2="300" y2="110" stroke="#9333ea" strokeWidth="2.5" strokeOpacity="0.4" />

          <line x1="100" y1="110" x2="50" y2="185" stroke="#9333ea" strokeWidth="2.5" strokeOpacity="0.4" />
          <line x1="100" y1="110" x2="150" y2="185" stroke="#9333ea" strokeWidth="2.5" strokeOpacity="0.4" />

          <line x1="300" y1="110" x2="250" y2="185" stroke="#9333ea" strokeWidth="2.5" strokeOpacity="0.4" />
          <line x1="300" y1="110" x2="350" y2="185" stroke="#9333ea" strokeWidth="2.5" strokeOpacity="0.4" />

          {/* Nodes */}
          {nodes.map((n) => {
            const isHighlight = highlightId === n.id;
            return (
              <g
                key={n.id}
                onClick={() => {
                  setHighlightId(n.id);
                  setActiveAction(`Inspected BST Node: Value = ${n.val}`);
                }}
                className="cursor-pointer"
              >
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={isHighlight ? 20 : 18}
                  fill={isHighlight ? '#a855f7' : '#0d1322'}
                  stroke={isHighlight ? '#e9d5ff' : '#7e22ce'}
                  strokeWidth={isHighlight ? '3' : '2'}
                  className="transition-all duration-300"
                />
                <text
                  x={n.x}
                  y={n.y + 5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {n.val}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Telemetry Output */}
      <div className="p-3.5 rounded-2xl bg-[#0b0f19] border border-white/5 text-xs flex items-center space-x-2 text-slate-300 font-mono">
        <ArrowRight className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        <span className="truncate">{activeAction}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 pt-2">
        <input
          type="number"
          placeholder="Search Value in BST (e.g. 40, 70, 99)"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="flex-1 bg-[#0b0f19] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={handleBSTSearch}
          disabled={!searchValue || isSearching}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md shadow-purple-600/20"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search Path</span>
        </button>
      </div>
    </div>
  );
};

export default BSTVisualizer;
