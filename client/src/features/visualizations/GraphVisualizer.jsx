import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, ArrowRight, Share2 } from 'lucide-react';

const GRAPH_NODES = [
  { id: 'A', x: 200, y: 40 },
  { id: 'B', x: 100, y: 110 },
  { id: 'C', x: 300, y: 110 },
  { id: 'D', x: 70, y: 190 },
  { id: 'E', x: 170, y: 190 },
  { id: 'F', x: 330, y: 190 },
];

const GRAPH_EDGES = [
  { from: 'A', to: 'B' },
  { from: 'A', to: 'C' },
  { from: 'B', to: 'D' },
  { from: 'B', to: 'E' },
  { from: 'C', to: 'F' },
  { from: 'E', to: 'F' },
];

export const GraphVisualizer = () => {
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [activeAction, setActiveAction] = useState('Idle. Graph network with 6 vertices and 6 edges.');
  const [isTraversing, setIsTraversing] = useState(false);

  // Run BFS
  const handleBFS = async () => {
    if (isTraversing) return;
    setIsTraversing(true);
    setVisitedNodes([]);
    setActiveAction('Starting Breadth-First Search (BFS) using FIFO Queue from Node A...');

    const bfsOrder = ['A', 'B', 'C', 'D', 'E', 'F'];

    for (let node of bfsOrder) {
      setCurrentNode(node);
      setVisitedNodes((prev) => [...prev, node]);
      setActiveAction(`BFS Visiting Vertex [${node}]`);
      await new Promise((r) => setTimeout(r, 700));
    }

    setActiveAction('BFS Traversal Complete! Visited: A → B → C → D → E → F');
    setCurrentNode(null);
    setIsTraversing(false);
  };

  // Run DFS
  const handleDFS = async () => {
    if (isTraversing) return;
    setIsTraversing(true);
    setVisitedNodes([]);
    setActiveAction('Starting Depth-First Search (DFS) using Call Stack / LIFO from Node A...');

    const dfsOrder = ['A', 'B', 'D', 'E', 'F', 'C'];

    for (let node of dfsOrder) {
      setCurrentNode(node);
      setVisitedNodes((prev) => [...prev, node]);
      setActiveAction(`DFS Exploring Vertex [${node}] deeply`);
      await new Promise((r) => setTimeout(r, 700));
    }

    setActiveAction('DFS Traversal Complete! Visited: A → B → D → E → F → C');
    setCurrentNode(null);
    setIsTraversing(false);
  };

  const handleReset = () => {
    setVisitedNodes([]);
    setCurrentNode(null);
    setActiveAction('Reset graph traversal.');
  };

  return (
    <div className="rounded-3xl p-6 bg-[#080c14] border border-white/10 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <h3 className="text-base font-bold text-white">Interactive Graph Visualizer</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Vertices & Edges
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            BFS (Queue) Level Traversal | DFS (Stack) Deep Exploration
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

      {/* SVG Canvas for Graph */}
      <div className="flex flex-col items-center justify-center py-2 overflow-x-auto">
        <svg viewBox="0 0 400 240" className="w-full max-w-[440px] h-[240px] select-none">
          {/* Edge lines */}
          {GRAPH_EDGES.map((edge, idx) => {
            const fromNode = GRAPH_NODES.find((n) => n.id === edge.from);
            const toNode = GRAPH_NODES.find((n) => n.id === edge.to);

            return (
              <line
                key={idx}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="#14b8a6"
                strokeWidth="2"
                strokeOpacity="0.35"
              />
            );
          })}

          {/* Graph Nodes */}
          {GRAPH_NODES.map((node) => {
            const isCurrent = currentNode === node.id;
            const isVisited = visitedNodes.includes(node.id);

            return (
              <g
                key={node.id}
                onClick={() => {
                  setCurrentNode(node.id);
                  setActiveAction(`Inspecting Vertex [${node.id}]`);
                }}
                className="cursor-pointer"
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isCurrent ? 22 : 18}
                  fill={isCurrent ? '#0d9488' : isVisited ? '#115e59' : '#0d1322'}
                  stroke={isCurrent ? '#5eead4' : isVisited ? '#2dd4bf' : '#14b8a6'}
                  strokeWidth={isCurrent ? '3' : '2'}
                  className="transition-all duration-300"
                />
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="13"
                  fontWeight="black"
                  fontFamily="monospace"
                >
                  {node.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Visited Chips Stream */}
      {visitedNodes.length > 0 && (
        <div className="p-3 rounded-2xl bg-teal-950/30 border border-teal-500/20 flex items-center space-x-2 overflow-x-auto text-xs font-mono">
          <span className="text-[10px] uppercase font-bold text-teal-400 shrink-0">Path:</span>
          {visitedNodes.map((n, i) => (
            <span key={i} className="px-2 py-0.5 rounded-md bg-teal-600/30 border border-teal-400/30 text-teal-200">
              {n}
            </span>
          ))}
        </div>
      )}

      {/* Telemetry Output */}
      <div className="p-3.5 rounded-2xl bg-[#0b0f19] border border-white/5 text-xs flex items-center space-x-2 text-slate-300 font-mono">
        <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0" />
        <span className="truncate">{activeAction}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleBFS}
          disabled={isTraversing}
          className="flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-teal-600/20"
        >
          <Play className="w-3 h-3" />
          <span>Run BFS (Breadth-First)</span>
        </button>
        <button
          onClick={handleDFS}
          disabled={isTraversing}
          className="flex-1 py-2.5 px-3 rounded-xl bg-[#0d1322] hover:bg-teal-600/30 border border-white/10 hover:border-teal-500/40 text-slate-200 text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
        >
          <Play className="w-3 h-3" />
          <span>Run DFS (Depth-First)</span>
        </button>
      </div>
    </div>
  );
};

export default GraphVisualizer;
