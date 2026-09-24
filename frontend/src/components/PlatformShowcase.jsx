import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch,
  Code2,
  Layers,
  FileText,
  Bot,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  RotateCw,
  Copy,
  Check,
  Play,
  Terminal,
  Cpu,
  Brain,
  Zap,
  BookOpen
} from 'lucide-react';

export default function PlatformShowcase({ onStartQuickLearn, onCreateCourse }) {
  const [activeTab, setActiveTab] = useState('roadmap');

  // Flashcard Demo State
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);

  const FLASHCARDS = [
    {
      topic: 'Graph Algorithms',
      q: "Why does Dijkstra's algorithm fail with negative edge weights?",
      a: "Dijkstra greedily assumes once a node is visited with the shortest known path, it can never be reduced. A negative weight later can invalidate this greedy choice. Use Bellman-Ford (O(VE)) or SPFA instead.",
      tag: 'Hard',
      difficultyColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20'
    },
    {
      topic: 'Data Structures',
      q: 'What is the amortized time complexity of dynamic array resizing?',
      a: 'O(1) amortized. Doubling capacity takes O(N) when triggered, but happens so infrequently (every 2^k insertions) that the cost averaged over all insertions is constant O(1).',
      tag: 'Medium',
      difficultyColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20'
    },
    {
      topic: 'Operating Systems',
      q: 'What are the 4 Coffman conditions required for Deadlock?',
      a: '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait.\nBreaking any one of these guarantees deadlock will not occur.',
      tag: 'Exam Classic',
      difficultyColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
    }
  ];

  // Code Visualizer Demo State
  const [activeCodeStep, setActiveCodeStep] = useState(1);
  const [codeCopied, setCodeCopied] = useState(false);

  const handleCopyCode = (text) => {
    navigator.clipboard?.writeText(text);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const tabs = [
    { id: 'roadmap', label: 'Adaptive Roadmaps', icon: GitBranch, color: 'text-cyan-400' },
    { id: 'visualizer', label: 'Code & Visualizer', icon: Code2, color: 'text-blue-400' },
    { id: 'flashcards', label: '3D Flashcards', icon: Layers, color: 'text-purple-400' },
    { id: 'cheatsheet', label: 'Exam Cheatsheets', icon: FileText, color: 'text-emerald-400' },
    { id: 'tutor', label: 'Socratic AI Tutor', icon: Bot, color: 'text-pink-400' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
      
      {/* Section Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Interactive Platform Engine</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Experience How PadhAI Teaches You
        </h2>
        <p className="text-[#8a8faa] text-sm sm:text-base max-w-2xl mx-auto">
          Not just another video player. PadhAI turns any lecture or topic into an active, multi-modal lab designed for permanent concept retention.
        </p>
      </div>

      {/* Tabs Switcher Navigation */}
      <div className="flex items-center justify-center">
        <div className="flex flex-wrap items-center justify-center p-1.5 rounded-2xl bg-[#0f1422] border border-[#21293d] gap-1 sm:gap-2 shadow-2xl backdrop-blur-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white shadow-[0_0_20px_rgba(0,245,255,0.3)] border border-cyan-400/30'
                    : 'text-[#8a8faa] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Display Stage */}
      <div className="relative rounded-2xl bg-[#0b0f19] border border-[#1e2638] shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
        
        {/* Top Window Bar */}
        <div className="h-10 px-4 bg-[#090d16] border-b border-[#1a2133] flex items-center justify-between text-xs text-[#6e7681]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            <span className="ml-2 font-mono text-[11px] text-[#7d8590]">padhai-lab // live-preview</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-cyan-400/90">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>Interactive Demo</span>
          </div>
        </div>

        {/* Content Pane with Animation */}
        <div className="p-4 sm:p-7 min-h-[380px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: ROADMAP PREVIEW */}
            {activeTab === 'roadmap' && (
              <motion.div
                key="tab-roadmap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="w-full space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1c2436] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">Full-Stack Algorithms Curriculum</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
                        4 Modules • 14 Lessons
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#8a8faa] mt-1">
                      AI tailors milestones from foundational primitives to advanced tree balance operations.
                    </p>
                  </div>
                  <button
                    onClick={() => onCreateCourse?.()}
                    className="self-start sm:self-auto px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5 group cursor-pointer"
                  >
                    <span>Generate Custom Course</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Visual Roadmap Stepper Nodes */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
                  {[
                    { step: '01', title: 'Binary Trees & Traversals', status: 'Completed', progress: 100, color: 'emerald', lessons: 'Preorder, Inorder, BFS' },
                    { step: '02', title: 'BST & Balancing', status: 'In Progress', progress: 65, color: 'cyan', lessons: 'Rotations, AVL Insertion' },
                    { step: '03', title: 'Self-Balancing Red-Black', status: 'Next Up', progress: 0, color: 'blue', lessons: 'Color Properties, Repair' },
                    { step: '04', title: 'B-Trees & Disk Storage', status: 'Upcoming', progress: 0, color: 'purple', lessons: 'Page Splitting, DB Index' },
                  ].map((node, i) => (
                    <div
                      key={node.step}
                      className="group relative p-4 rounded-xl bg-[#101626] border border-[#212b42] hover:border-cyan-500/40 hover:bg-[#131b2e] transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#5c667a] group-hover:text-cyan-400 transition-colors">
                          STAGE {node.step}
                        </span>
                        {node.status === 'Completed' ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Done
                          </span>
                        ) : node.status === 'In Progress' ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-400">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Active
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-[#5c667a]">Locked</span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
                          {node.title}
                        </h4>
                        <p className="text-xs text-[#7d8590] mt-1 font-mono">{node.lessons}</p>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-[#1b2336] rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            node.color === 'emerald'
                              ? 'bg-emerald-500'
                              : node.color === 'cyan'
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                              : 'bg-transparent'
                          }`}
                          style={{ width: `${node.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 2: CODE VISUALIZER PREVIEW */}
            {activeTab === 'visualizer' && (
              <motion.div
                key="tab-visualizer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5"
              >
                {/* Code Window (Left 7 Cols) */}
                <div className="lg:col-span-7 rounded-xl bg-[#090d16] border border-[#1b2338] p-4 font-mono text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1b2338] pb-2 text-[#7d8590]">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-white font-semibold">quicksort.py</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold">Python 3</span>
                    </div>
                    <button
                      onClick={() => handleCopyCode(`def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    mid = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + mid + quicksort(right)`)}
                      className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {codeCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{codeCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="space-y-1 leading-relaxed text-[#c9d1d9] select-text">
                    <p><span className="text-purple-400">def</span> <span className="text-blue-400">quicksort</span>(arr):</p>
                    <p className="pl-4 text-[#8b949e]"># Base condition: single element is sorted</p>
                    <p className="pl-4"><span className="text-purple-400">if</span> <span className="text-cyan-400">len</span>(arr) &lt;= <span className="text-amber-300">1</span>: <span className="text-purple-400">return</span> arr</p>
                    <p className={`pl-4 py-0.5 rounded transition-colors ${activeCodeStep === 1 ? 'bg-cyan-500/20 text-cyan-200 border-l-2 border-cyan-400' : ''}`}>
                      pivot = arr[<span className="text-cyan-400">len</span>(arr) // <span className="text-amber-300">2</span>]
                    </p>
                    <p className={`pl-4 py-0.5 rounded transition-colors ${activeCodeStep === 2 ? 'bg-cyan-500/20 text-cyan-200 border-l-2 border-cyan-400' : ''}`}>
                      left = [x <span className="text-purple-400">for</span> x <span className="text-purple-400">in</span> arr <span className="text-purple-400">if</span> x &lt; pivot]
                    </p>
                    <p className="pl-4">mid = [x <span className="text-purple-400">for</span> x <span className="text-purple-400">in</span> arr <span className="text-purple-400">if</span> x == pivot]</p>
                    <p className={`pl-4 py-0.5 rounded transition-colors ${activeCodeStep === 3 ? 'bg-cyan-500/20 text-cyan-200 border-l-2 border-cyan-400' : ''}`}>
                      right = [x <span className="text-purple-400">for</span> x <span className="text-purple-400">in</span> arr <span className="text-purple-400">if</span> x &gt; pivot]
                    </p>
                    <p className="pl-4"><span className="text-purple-400">return</span> quicksort(left) + mid + quicksort(right)</p>
                  </div>
                </div>

                {/* Live Step Simulation Panel (Right 5 Cols) */}
                <div className="lg:col-span-5 rounded-xl bg-[#101626] border border-[#212b42] p-4 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#7d8590] border-b border-[#1c2436] pb-2">
                      <span className="font-bold text-white uppercase tracking-wider">Dry Run State</span>
                      <span className="text-cyan-400 font-mono">Step {activeCodeStep} of 3</span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="text-xs text-[#8a8faa]">Array State at step:</div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[14, 7, 3, 19, 5, 21, 2].map((num) => (
                          <div
                            key={num}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm transition-all ${
                              num === 19 && activeCodeStep === 1
                                ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-110'
                                : num < 19 && activeCodeStep === 2
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                                : num > 19 && activeCodeStep === 3
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                                : 'bg-[#182136] text-white border border-[#2b3652]'
                            }`}
                          >
                            {num}
                          </div>
                        ))}
                      </div>

                      <div className="p-3 rounded-lg bg-[#0a0e1a] border border-[#1b2338] text-xs text-[#c9d1d9] space-y-1">
                        <div className="text-cyan-400 font-semibold">
                          {activeCodeStep === 1 && 'Selected Pivot = 19 (Middle Element)'}
                          {activeCodeStep === 2 && 'Partition Left Subarray (x < 19): [14, 7, 3, 5, 2]'}
                          {activeCodeStep === 3 && 'Partition Right Subarray (x > 19): [21]'}
                        </div>
                        <p className="text-[11px] text-[#7d8590]">
                          Time Complexity: Average O(N log N) | Worst Case O(N²)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#1c2436]">
                    {[1, 2, 3].map((step) => (
                      <button
                        key={step}
                        onClick={() => setActiveCodeStep(step)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          activeCodeStep === step
                            ? 'bg-cyan-500 text-black font-extrabold shadow-[0_0_15px_rgba(0,245,255,0.4)]'
                            : 'bg-[#1b2338] text-[#8a8faa] hover:text-white'
                        }`}
                      >
                        Step {step}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: 3D FLASHCARD ENGINE */}
            {activeTab === 'flashcards' && (
              <motion.div
                key="tab-flashcards"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-2xl mx-auto space-y-4"
              >
                <div className="flex items-center justify-between text-xs text-[#7d8590]">
                  <span className="font-semibold text-white">Active Recall Deck • Card {currentCardIdx + 1} of {FLASHCARDS.length}</span>
                  <span className="text-cyan-400 font-medium">Click card to reveal answer</span>
                </div>

                {/* 3D Flip Card Container */}
                <div
                  onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                  className="cursor-pointer group relative h-64 sm:h-72 w-full rounded-2xl transition-all duration-500 [perspective:1000px]"
                >
                  <div
                    className={`relative w-full h-full rounded-2xl border transition-all duration-500 [transform-style:preserve-3d] p-6 sm:p-8 flex flex-col justify-between shadow-2xl ${
                      flashcardFlipped
                        ? 'bg-gradient-to-br from-[#121c2e] to-[#0a111c] border-cyan-500/50 [transform:rotateY(180deg)] shadow-[0_0_40px_rgba(0,245,255,0.15)]'
                        : 'bg-gradient-to-br from-[#141a29] to-[#0d121f] border-[#222b40] hover:border-cyan-400/40'
                    }`}
                  >
                    {/* Front Face */}
                    <div className={`space-y-4 ${flashcardFlipped ? 'hidden' : 'block'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2.5 py-1 rounded-full font-mono font-bold bg-[#1b2338] text-[#8a8faa]">
                          {FLASHCARDS[currentCardIdx].topic}
                        </span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${FLASHCARDS[currentCardIdx].difficultyColor}`}>
                          {FLASHCARDS[currentCardIdx].tag}
                        </span>
                      </div>
                      <h4 className="text-lg sm:text-2xl font-bold text-white leading-snug">
                        {FLASHCARDS[currentCardIdx].q}
                      </h4>
                    </div>

                    {/* Back Face */}
                    <div className={`space-y-4 [transform:rotateY(180deg)] ${flashcardFlipped ? 'block' : 'hidden'}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified Explanation
                        </span>
                        <span className="text-[11px] text-[#7d8590]">Press Space to Flip</span>
                      </div>
                      <p className="text-sm sm:text-base text-[#e6edf3] leading-relaxed whitespace-pre-line font-normal">
                        {FLASHCARDS[currentCardIdx].a}
                      </p>
                    </div>

                    {/* Bottom Indicator */}
                    <div className="flex items-center justify-between text-xs text-[#5c667a] pt-4 border-t border-white/[0.06]">
                      <span className="flex items-center gap-1 text-cyan-400/80">
                        <RotateCw className="w-3 h-3" />
                        {flashcardFlipped ? 'Click to show question' : 'Click to flip'}
                      </span>
                      <span>Spaced Repetition Algorithm Active</span>
                    </div>
                  </div>
                </div>

                {/* Card Controls */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => {
                      setFlashcardFlipped(false);
                      setCurrentCardIdx((prev) => (prev > 0 ? prev - 1 : FLASHCARDS.length - 1));
                    }}
                    className="px-4 py-2 rounded-xl bg-[#141b2c] hover:bg-[#1a233a] border border-[#222b40] text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    ← Previous Card
                  </button>

                  <div className="flex items-center gap-1">
                    {FLASHCARDS.map((_, idx) => (
                      <span
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === currentCardIdx ? 'w-5 bg-cyan-400' : 'bg-[#2b354f]'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setFlashcardFlipped(false);
                      setCurrentCardIdx((prev) => (prev + 1) % FLASHCARDS.length);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-xs font-bold text-black transition-all shadow-[0_0_15px_rgba(0,245,255,0.3)] cursor-pointer"
                  >
                    Next Card →
                  </button>
                </div>
              </motion.div>
            )}

            {/* TAB 4: CHEATSHEETS PREVIEW */}
            {activeTab === 'cheatsheet' && (
              <motion.div
                key="tab-cheatsheet"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="w-full space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1c2436] pb-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">Dense Exam Cheatsheet: Sorting & Complexity</h3>
                    <p className="text-xs text-[#7d8590]">High-yield, formula-dense reference card ready for tech interviews and finals.</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold self-start sm:self-auto">
                    One-Click Printable
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#0e1424] border border-[#1e2840] space-y-2">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">QuickSort</span>
                    <div className="text-xs font-mono space-y-1 text-[#c9d1d9]">
                      <p>Time: <span className="text-emerald-400 font-bold">O(N log N)</span> avg</p>
                      <p>Worst: <span className="text-red-400 font-bold">O(N²)</span></p>
                      <p>Space: <span className="text-cyan-400 font-bold">O(log N)</span> recursion</p>
                      <p className="text-[11px] text-[#7d8590] pt-1">Pitfall: Sorted inputs without random pivot</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0e1424] border border-[#1e2840] space-y-2">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">MergeSort</span>
                    <div className="text-xs font-mono space-y-1 text-[#c9d1d9]">
                      <p>Time: <span className="text-emerald-400 font-bold">O(N log N)</span> all cases</p>
                      <p>Space: <span className="text-amber-400 font-bold">O(N)</span> aux buffer</p>
                      <p>Stable: <span className="text-emerald-400 font-bold">Yes</span> (preserves order)</p>
                      <p className="text-[11px] text-[#7d8590] pt-1">Preferred for: Linked Lists & External Sort</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0e1424] border border-[#1e2840] space-y-2">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">HeapSort</span>
                    <div className="text-xs font-mono space-y-1 text-[#c9d1d9]">
                      <p>Time: <span className="text-emerald-400 font-bold">O(N log N)</span> all cases</p>
                      <p>Space: <span className="text-emerald-400 font-bold">O(1)</span> in-place</p>
                      <p>Stable: <span className="text-red-400 font-bold">No</span></p>
                      <p className="text-[11px] text-[#7d8590] pt-1">Build Heap cost: Strict O(N)</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#080d17] border border-[#182136] flex items-center justify-between text-xs text-[#8a8faa]">
                  <span>💡 <strong>Master Rule:</strong> When guaranteed O(N log N) without extra memory is needed, choose HeapSort. When stability is critical, choose MergeSort.</span>
                </div>
              </motion.div>
            )}

            {/* TAB 5: SOCRATIC AI TUTOR PREVIEW */}
            {activeTab === 'tutor' && (
              <motion.div
                key="tab-tutor"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="w-full max-w-2xl mx-auto space-y-4"
              >
                <div className="p-4 rounded-xl bg-[#090e1a] border border-[#1c253d] space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-black flex items-center justify-center font-bold shrink-0 shadow-[0_0_12px_rgba(0,245,255,0.4)]">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">PadhAI Socratic Tutor</span>
                        <span className="text-[10px] text-[#5c667a]">Live Session</span>
                      </div>
                      <div className="text-xs sm:text-sm text-[#d4daf0] leading-relaxed bg-[#101729] p-3 rounded-xl border border-[#212c47]">
                        Let&apos;s think about this together: When you call a recursive function like <code className="text-cyan-300 font-mono">fib(5)</code>, where does the computer temporarily store each incomplete function call?
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pl-8">
                    <div className="w-7 h-7 rounded-lg bg-[#1f283d] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      You
                    </div>
                    <div className="text-xs sm:text-sm text-white bg-blue-600/30 border border-blue-500/40 p-3 rounded-xl">
                      On the call stack, right?
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-black flex items-center justify-center font-bold shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs sm:text-sm text-[#d4daf0] leading-relaxed bg-[#101729] p-3 rounded-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(0,245,255,0.08)]">
                        🎯 <strong>Spot on!</strong> Each call pushes a stack frame with its local variables. So if recursion goes 10,000 calls deep without returning, what critical runtime error will occur?
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    disabled
                    placeholder="Stack Overflow Error! 🚀"
                    className="flex-1 px-4 py-2 rounded-xl bg-[#0e1424] border border-[#212b42] text-xs text-[#8a8faa] font-mono"
                  />
                  <button
                    onClick={() => onStartQuickLearn?.('Recursion & Stack')}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-colors shrink-0 cursor-pointer"
                  >
                    Try Live Tutor →
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
