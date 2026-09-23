import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Plus, Search, ArrowRight, GitBranch } from 'lucide-react';

// Default Tree:
//        10
//       /  \
//      5    15
//     / \   / \
//    2   7 12 20

const INITIAL_TREE = {
  val: 10,
  id: 1,
  left: {
    val: 5,
    id: 2,
    left: { val: 2, id: 4, left: null, right: null },
    right: { val: 7, id: 5, left: null, right: null },
  },
  right: {
    val: 15,
    id: 3,
    left: { val: 12, id: 6, left: null, right: null },
    right: { val: 20, id: 7, left: null, right: null },
  },
};

export const BinaryTreeVisualizer = () => {
  const [tree, setTree] = useState(INITIAL_TREE);
  const [highlightId, setHighlightId] = useState(null);
  const [activeAction, setActiveAction] = useState('Idle. Binary Tree root = 10.');
  const [inputValue, setInputValue] = useState('');
  const [isTraversing, setIsTraversing] = useState(false);
  const [traversalLog, setTraversalLog] = useState([]);

  // Tree node positions for rendering in SVG / Canvas
  // Tree depth 3: Root (200, 30), Left (100, 100), Right (300, 100), L-L (50, 170), L-R (150, 170), R-L (250, 170), R-R (350, 170)
  const nodeCoordinates = {
    1: { x: 200, y: 35 },
    2: { x: 100, y: 110 },
    3: { x: 300, y: 110 },
    4: { x: 50, y: 185 },
    5: { x: 150, y: 185 },
    6: { x: 250, y: 185 },
    7: { x: 350, y: 185 },
  };

  // Perform In-order traversal (Left -> Root -> Right)
  const handleInOrder = async () => {
    if (isTraversing) return;
    setIsTraversing(true);
    setTraversalLog([]);
    setActiveAction('Starting In-Order Traversal (Left → Root → Right)...');

    const sequence = [4, 2, 5, 1, 6, 3, 7]; // 2, 5, 7, 10, 12, 15, 20
    const vals = [2, 5, 7, 10, 12, 15, 20];

    for (let i = 0; i < sequence.length; i++) {
      setHighlightId(sequence[i]);
      setTraversalLog((prev) => [...prev, vals[i]]);
      setActiveAction(`Visiting Node [${vals[i]}]`);
      await new Promise((r) => setTimeout(r, 650));
    }

    setActiveAction('In-Order Traversal Complete! Result: ' + vals.join(' → '));
    setIsTraversing(false);
  };

  // Pre-Order Traversal (Root -> Left -> Right)
  const handlePreOrder = async () => {
    if (isTraversing) return;
    setIsTraversing(true);
    setTraversalLog([]);
    setActiveAction('Starting Pre-Order Traversal (Root → Left → Right)...');

    const sequence = [1, 2, 4, 5, 3, 6, 7]; // 10, 5, 2, 7, 15, 12, 20
    const vals = [10, 5, 2, 7, 15, 12, 20];

    for (let i = 0; i < sequence.length; i++) {
      setHighlightId(sequence[i]);
      setTraversalLog((prev) => [...prev, vals[i]]);
      setActiveAction(`Visiting Node [${vals[i]}]`);
      await new Promise((r) => setTimeout(r, 650));
    }

    setActiveAction('Pre-Order Traversal Complete! Result: ' + vals.join(' → '));
    setIsTraversing(false);
  };

  // Post-Order Traversal (Left -> Right -> Root)
  const handlePostOrder = async () => {
    if (isTraversing) return;
    setIsTraversing(true);
    setTraversalLog([]);
    setActiveAction('Starting Post-Order Traversal (Left → Right → Root)...');

    const sequence = [4, 5, 2, 6, 7, 3, 1]; // 2, 7, 5, 12, 20, 15, 10
    const vals = [2, 7, 5, 12, 20, 15, 10];

    for (let i = 0; i < sequence.length; i++) {
      setHighlightId(sequence[i]);
      setTraversalLog((prev) => [...prev, vals[i]]);
      setActiveAction(`Visiting Node [${vals[i]}]`);
      await new Promise((r) => setTimeout(r, 650));
    }

    setActiveAction('Post-Order Traversal Complete! Result: ' + vals.join(' → '));
    setIsTraversing(false);
  };

  const handleReset = () => {
    setTree(INITIAL_TREE);
    setHighlightId(null);
    setTraversalLog([]);
    setActiveAction('Reset binary tree to initial structure.');
  };

  return (
    <div className="rounded-3xl p-6 bg-[#080c14] border border-white/10 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <h3 className="text-base font-bold text-white">Interactive Binary Tree Visualizer</h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Hierarchical Graph
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Pre-order | In-order | Post-order Recursive Traversal
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

      {/* SVG Tree Visualizer Display */}
      <div className="flex flex-col items-center justify-center py-2 overflow-x-auto">
        <svg viewBox="0 0 400 230" className="w-full max-w-[440px] h-[230px] select-none">
          {/* Branch Lines */}
          <line x1="200" y1="35" x2="100" y2="110" stroke="#4f46e5" strokeWidth="2.5" strokeOpacity="0.4" />
          <line x1="200" y1="35" x2="300" y2="110" stroke="#4f46e5" strokeWidth="2.5" strokeOpacity="0.4" />

          <line x1="100" y1="110" x2="50" y2="185" stroke="#4f46e5" strokeWidth="2.5" strokeOpacity="0.4" />
          <line x1="100" y1="110" x2="150" y2="185" stroke="#4f46e5" strokeWidth="2.5" strokeOpacity="0.4" />

          <line x1="300" y1="110" x2="250" y2="185" stroke="#4f46e5" strokeWidth="2.5" strokeOpacity="0.4" />
          <line x1="300" y1="110" x2="350" y2="185" stroke="#4f46e5" strokeWidth="2.5" strokeOpacity="0.4" />

          {/* Render Nodes */}
          {[
            { id: 1, val: 10, label: 'Root (10)' },
            { id: 2, val: 5, label: '5' },
            { id: 3, val: 15, label: '15' },
            { id: 4, val: 2, label: '2' },
            { id: 5, val: 7, label: '7' },
            { id: 6, val: 12, label: '12' },
            { id: 7, val: 20, label: '20' },
          ].map((n) => {
            const { x, y } = nodeCoordinates[n.id];
            const isHighlight = highlightId === n.id;

            return (
              <g
                key={n.id}
                onClick={() => {
                  setHighlightId(n.id);
                  setActiveAction(`Inspected Node [${n.val}]`);
                }}
                className="cursor-pointer"
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isHighlight ? 20 : 18}
                  fill={isHighlight ? '#6366f1' : '#0d1322'}
                  stroke={isHighlight ? '#a5b4fc' : '#4338ca'}
                  strokeWidth={isHighlight ? '3' : '2'}
                  className="transition-all duration-300"
                />
                <text
                  x={x}
                  y={y + 5}
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

      {/* Traversal Output Chip Stream */}
      {traversalLog.length > 0 && (
        <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-center space-x-2 overflow-x-auto text-xs font-mono">
          <span className="text-xs uppercase font-bold text-indigo-400 shrink-0">Visited:</span>
          {traversalLog.map((v, i) => (
            <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-600/30 border border-indigo-400/30 text-indigo-200">
              {v}
            </span>
          ))}
        </div>
      )}

      {/* Telemetry Output */}
      <div className="p-3.5 rounded-2xl bg-[#0b0f19] border border-white/5 text-xs flex items-center space-x-2 text-slate-300 font-mono">
        <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span className="truncate">{activeAction}</span>
      </div>

      {/* Traversal Controls */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <button
          onClick={handleInOrder}
          disabled={isTraversing}
          className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center justify-center space-x-1 shadow-md shadow-indigo-600/20"
        >
          <Play className="w-3 h-3" />
          <span>In-Order (Sorted)</span>
        </button>
        <button
          onClick={handlePreOrder}
          disabled={isTraversing}
          className="flex-1 py-2.5 px-3 rounded-xl bg-[#0d1322] hover:bg-indigo-600/30 border border-white/10 hover:border-indigo-500/40 text-slate-200 text-xs font-bold transition-all flex items-center justify-center space-x-1"
        >
          <span>Pre-Order</span>
        </button>
        <button
          onClick={handlePostOrder}
          disabled={isTraversing}
          className="flex-1 py-2.5 px-3 rounded-xl bg-[#0d1322] hover:bg-indigo-600/30 border border-white/10 hover:border-indigo-500/40 text-slate-200 text-xs font-bold transition-all flex items-center justify-center space-x-1"
        >
          <span>Post-Order</span>
        </button>
      </div>
    </div>
  );
};

export default BinaryTreeVisualizer;
