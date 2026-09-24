import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Layers,
  Code2,
  FileUp,
  FileText,
  Activity,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Flame,
  Zap,
  ShieldCheck
} from 'lucide-react';

export default function BentoFeatures({ onStartQuickLearn, onCreateCourse, onStudyNotes }) {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
      
      {/* Section Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Engineered for Deep Comprehension</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#e6edf3] tracking-tight">
          Everything You Need to Master Computer Science
        </h2>
        <p className="text-[#8b949e] text-sm sm:text-base max-w-2xl mx-auto">
          Built from first principles for university students and engineers. No 40-hour passive video playlists—only active, structured, and interactive learning.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        
        {/* Card 1: Socratic AI Tutor (Span 2 cols on lg) */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-2xl bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff]/50 transition-all duration-300 relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#1f6feb]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#1f6feb]/20 transition-all" />
          
          <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#1f6feb]/20 border border-[#1f6feb]/40 flex items-center justify-center text-[#58a6ff]">
                  <Brain className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#1f6feb]/10 border border-[#1f6feb]/30 text-[#58a6ff]">
                  24/7 Socratic Reasoning
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[#e6edf3]">
                AI Socratic Tutor with Code Intuition
              </h3>
              <p className="text-sm text-[#8b949e] max-w-lg leading-relaxed">
                PadhAI does not just vomit the final answer. It breaks down tricky pointers, recursion trees, and system trade-offs through guided questions until the concept clicks.
              </p>
            </div>

            {/* Simulated Chat Dialogue Bubble */}
            <div className="space-y-2.5 bg-[#0d1117] p-4 rounded-xl border border-[#21262d] font-mono text-xs">
              <div className="flex items-start gap-2.5">
                <span className="text-[#8b949e] font-bold shrink-0">Student:</span>
                <span className="text-[#c9d1d9]">Why does Quicksort degrade to O(N²) when the array is already sorted?</span>
              </div>
              <div className="flex items-start gap-2.5 pt-1.5 border-t border-[#21262d]/60">
                <span className="text-[#58a6ff] font-bold shrink-0">PadhAI:</span>
                <span className="text-[#7ee787]">
                  Because picking the last element as pivot creates extremely unbalanced partitions (size 0 and N-1). You recurse N times with O(N) work each!
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#8b949e] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3fb950]" />
                Zero Hallucinations Guarantee
              </span>
              <button
                onClick={() => onStartQuickLearn && onStartQuickLearn('Quicksort', 'Intermediate')}
                className="text-xs font-semibold text-[#58a6ff] hover:text-[#79c0ff] flex items-center gap-1 group-hover:translate-x-1 transition-all cursor-pointer"
              >
                <span>Try Socratic Prompt</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: 3D Active Recall & Spaced Repetition (Span 1 col) */}
        <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] hover:border-[#a371f7]/50 transition-all duration-300 relative overflow-hidden group shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#a371f7]/15 border border-[#a371f7]/30 flex items-center justify-center text-[#d2a8ff]">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#a371f7]/10 border border-[#a371f7]/30 text-[#d2a8ff]">
                Retention Engine
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#e6edf3]">
              Smart 3D Flashcards
            </h3>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              Synthesized directly from your curriculum. Spaced repetition prevents the Ebbinghaus forgetting curve before your exams.
            </p>
          </div>

          <div className="my-4 p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d] text-center space-y-1.5">
            <div className="text-[10px] text-[#8b949e] uppercase tracking-wider font-semibold">Active Memory Benchmark</div>
            <div className="text-2xl font-extrabold text-[#7ee787] font-mono">94.2%</div>
            <div className="text-[11px] text-[#6e7681]">Average 30-day exam recall score</div>
          </div>

          <button
            onClick={() => onStartQuickLearn && onStartQuickLearn('Dynamic Programming', 'Beginner')}
            className="text-xs font-semibold text-[#d2a8ff] hover:text-white flex items-center gap-1 group-hover:translate-x-1 transition-all cursor-pointer"
          >
            <span>Practice Sample Deck</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Code Visualizer & Step Dry-Run (Span 1 col) */}
        <div className="p-6 rounded-2xl bg-[#161b22] border border-[#30363d] hover:border-[#388bfd]/50 transition-all duration-300 relative overflow-hidden group shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#388bfd]/15 border border-[#388bfd]/30 flex items-center justify-center text-[#58a6ff]">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#388bfd]/10 border border-[#388bfd]/30 text-[#58a6ff]">
                Dry-Run Visualizer
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#e6edf3]">
              Step-by-Step Code Execution
            </h3>
            <p className="text-xs text-[#8b949e] leading-relaxed">
              Watch variables update, pointers shift, and recursion trees expand in real time. Never guess how nested loops work again.
            </p>
          </div>

          <div className="my-4 p-3 rounded-lg bg-[#0d1117] border border-[#30363d] font-mono text-[11px] text-[#79c0ff] space-y-1">
            <div className="text-[#8b949e]">// Stack Trace:</div>
            <div>[0] node.val = 14</div>
            <div className="text-[#7ee787]">&gt; [1] curr.next = prev</div>
            <div className="text-[#6e7681]">[2] prev = curr</div>
          </div>

          <button
            onClick={() => onStartQuickLearn && onStartQuickLearn('Reverse Linked List', 'Beginner')}
            className="text-xs font-semibold text-[#58a6ff] hover:text-white flex items-center gap-1 group-hover:translate-x-1 transition-all cursor-pointer"
          >
            <span>Run Visualizer Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 4: Study Material & PDF Ingestion (Span 2 cols on lg) */}
        <div className="lg:col-span-2 p-6 sm:p-7 rounded-2xl bg-[#161b22] border border-[#30363d] hover:border-[#3fb950]/50 transition-all duration-300 relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#2ea043]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#2ea043]/20 transition-all" />

          <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#2ea043]/20 border border-[#2ea043]/40 flex items-center justify-center text-[#3fb950]">
                  <FileUp className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#2ea043]/10 border border-[#2ea043]/30 text-[#3fb950]">
                  Multi-Modal Ingestion
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[#e6edf3]">
                Upload Professor Slides, Notes, or Syllabus
              </h3>
              <p className="text-sm text-[#8b949e] max-w-lg leading-relaxed">
                Feed PadhAI your course syllabus, PDF lecture slides, or messy handwritten notes. PadhAI extracts the critical testable concepts and builds a personalized syllabus with practice questions.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-[#0d1117] border border-[#21262d] text-center">
                <div className="text-xs font-bold text-[#e6edf3]">PDF Slides</div>
                <div className="text-[10px] text-[#6e7681]">Auto-summarized</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1117] border border-[#21262d] text-center">
                <div className="text-xs font-bold text-[#e6edf3]">Exam Syllabus</div>
                <div className="text-[10px] text-[#6e7681]">Topic breakdown</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0d1117] border border-[#21262d] text-center">
                <div className="text-xs font-bold text-[#e6edf3]">Problem Sets</div>
                <div className="text-[10px] text-[#6e7681]">Solution hints</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#8b949e] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3fb950]" />
                Zero data leakage • Private to you
              </span>
              <button
                onClick={onStudyNotes}
                className="text-xs font-semibold text-[#3fb950] hover:text-[#56d364] flex items-center gap-1 group-hover:translate-x-1 transition-all cursor-pointer"
              >
                <span>Upload Study File</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
