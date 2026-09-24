import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Binary,
  Cpu,
  Database,
  Network,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

const DOMAINS = [
  {
    id: 'dsa',
    name: 'Data Structures & Algos',
    icon: Binary,
    badge: '180+ Concepts',
    color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400',
    topics: [
      {
        title: 'Dynamic Programming & Memoization',
        level: 'Intermediate',
        difficultyColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
        mentalModel: 'Trading memory for time by never re-solving overlapping subproblems.',
        keyStat: 'O(N) vs O(2^N)',
        badge: 'Top Interviewer Choice'
      },
      {
        title: 'Binary Search & Monotonic Spaces',
        level: 'Beginner',
        difficultyColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
        mentalModel: 'Halving the search space per iteration on any sorted or predicate domain.',
        keyStat: 'Logarithmic O(log N)',
        badge: 'Essential Foundation'
      },
      {
        title: 'Graph Traversal (BFS & DFS)',
        level: 'Intermediate',
        difficultyColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
        mentalModel: 'Queue for radial expansion (shortest path); Stack/Recursion for deep exploration.',
        keyStat: 'O(V + E) Complexity',
        badge: 'Core Pattern'
      },
      {
        title: 'Trie & Prefix Trees',
        level: 'Advanced',
        difficultyColor: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
        mentalModel: 'Tree representation for character strings enabling O(L) autocomplete searches.',
        keyStat: 'O(L) Search Time',
        badge: 'High Performance'
      }
    ]
  },
  {
    id: 'os',
    name: 'Operating Systems',
    icon: Cpu,
    badge: '95+ Concepts',
    color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400',
    topics: [
      {
        title: 'Virtual Memory & Page Tables',
        level: 'Intermediate',
        difficultyColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
        mentalModel: 'Hardware MMU translating virtual addresses to physical frames with TLB acceleration.',
        keyStat: 'TLB Hit Ratio > 98%',
        badge: 'Semester Favorite'
      },
      {
        title: 'Process Synchronization & Mutex',
        level: 'Advanced',
        difficultyColor: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
        mentalModel: 'Preventing race conditions via atomic test-and-set and Peterson/Semaphore guarantees.',
        keyStat: 'Zero Race Conditions',
        badge: 'Crucial for Concurrency'
      },
      {
        title: 'Deadlock & Banker Algorithm',
        level: 'Intermediate',
        difficultyColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
        mentalModel: 'Safe state detection by simulating worst-case resource claims before granting requests.',
        keyStat: '4 Coffman Conditions',
        badge: 'Exam Guarantee'
      },
      {
        title: 'CPU Scheduling Algorithms',
        level: 'Beginner',
        difficultyColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
        mentalModel: 'Round Robin, SJF, and Multi-Level Feedback Queues balancing turnaround and fairness.',
        keyStat: 'Quantum Optimization',
        badge: 'Core Theory'
      }
    ]
  },
  {
    id: 'db',
    name: 'Databases & Storage',
    icon: Database,
    badge: '110+ Concepts',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    topics: [
      {
        title: 'B+ Tree Indexing & Disk I/O',
        level: 'Advanced',
        difficultyColor: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
        mentalModel: 'High fan-out balanced trees keeping all data in leaves to minimize disk seeks.',
        keyStat: 'O(log_B N) Disk Seeks',
        badge: 'Production Grade'
      },
      {
        title: 'ACID Properties & WAL Logs',
        level: 'Intermediate',
        difficultyColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
        mentalModel: 'Write-Ahead Logging guaranteeing Durability and Atomicity across power crashes.',
        keyStat: 'Crash Resilience',
        badge: 'Storage Core'
      },
      {
        title: 'Database Normalization (1NF - BCNF)',
        level: 'Beginner',
        difficultyColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
        mentalModel: 'Eliminating update, insertion, and deletion anomalies via functional dependencies.',
        keyStat: 'Zero Redundancy',
        badge: 'Viva Favorite'
      },
      {
        title: 'Sharding vs Replication',
        level: 'Intermediate',
        difficultyColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
        mentalModel: 'Horizontal partitioning (sharding) for write scale; Read replicas for throughput.',
        keyStat: 'Linear Scaling',
        badge: 'High Scale'
      }
    ]
  },
  {
    id: 'sys',
    name: 'System Design & Distributed',
    icon: Network,
    badge: '75+ Concepts',
    color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400',
    topics: [
      {
        title: 'Consistent Hashing & Ring Distribution',
        level: 'Advanced',
        difficultyColor: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
        mentalModel: 'Minimizing key remapping when cache nodes join or leave via virtual tokens on a hash ring.',
        keyStat: 'K/N Key Movement',
        badge: 'Staff Engineer Level'
      },
      {
        title: 'Rate Limiting Algorithms (Token Bucket)',
        level: 'Intermediate',
        difficultyColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
        mentalModel: 'Tokens refill at constant rate while allowing brief burst traffic up to bucket capacity.',
        keyStat: 'DDoS Prevention',
        badge: 'API Security'
      },
      {
        title: 'CAP Theorem & Eventual Consistency',
        level: 'Intermediate',
        difficultyColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
        mentalModel: 'Under network partitions, a distributed system must trade consistency for availability.',
        keyStat: 'Brewer Guarantee',
        badge: 'Architectural Pillar'
      },
      {
        title: 'Distributed Caching & Cache-Aside',
        level: 'Beginner',
        difficultyColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
        mentalModel: 'Application reads from Redis first; on miss, fetches DB and populates cache with TTL.',
        keyStat: 'Sub-millisecond Latency',
        badge: 'Industry Standard'
      }
    ]
  }
];

export default function DomainExplorer({ onSelectTopic }) {
  const [selectedDomain, setSelectedDomain] = useState(DOMAINS[0].id);

  const activeDomainData = DOMAINS.find((d) => d.id === selectedDomain) || DOMAINS[0];

  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
      
      {/* Section Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#21262d] pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#58a6ff] text-xs font-semibold tracking-wide uppercase">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>Interactive Knowledge Graph</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#e6edf3] tracking-tight">
            Explore Curated Computer Science Tracks
          </h2>
          <p className="text-[#8b949e] text-sm max-w-xl">
            Click any concept to jump straight into an AI-powered visual breakdown, step-by-step dry run, and quiz.
          </p>
        </div>

        {/* Total stats counter */}
        <div className="flex items-center gap-3 bg-[#161b22] border border-[#30363d] px-4 py-2 rounded-xl shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-[#8b949e]">Curriculum Coverage:</span>
          <span className="text-xs font-bold text-[#e6edf3]">460+ Core Topics</span>
        </div>
      </div>

      {/* Domain Navigation Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {DOMAINS.map((domain) => {
          const Icon = domain.icon;
          const isSelected = selectedDomain === domain.id;
          return (
            <button
              key={domain.id}
              onClick={() => setSelectedDomain(domain.id)}
              className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                isSelected
                  ? 'bg-[#1c2128] border-[#58a6ff] shadow-[0_0_20px_rgba(88,166,255,0.15)] ring-1 ring-[#58a6ff]'
                  : 'bg-[#161b22] border-[#30363d] hover:border-[#8b949e] hover:bg-[#1c2128]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    isSelected
                      ? 'bg-[#1f6feb] text-white shadow-md'
                      : 'bg-[#0d1117] text-[#8b949e] border border-[#30363d]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-bold truncate ${isSelected ? 'text-[#e6edf3]' : 'text-[#8b949e] group-hover:text-[#e6edf3]'}`}>
                    {domain.name}
                  </div>
                  <div className="text-[10px] text-[#6e7681]">{domain.badge}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Topics Grid for Active Domain */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeDomainData.topics.map((t, idx) => (
          <motion.div
            key={t.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelectTopic && onSelectTopic(t.title, t.level)}
            className="p-5 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-[#58a6ff]/70 hover:bg-[#1c2128] transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
          >
            <div className="space-y-2.5">
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${t.difficultyColor}`}>
                  {t.level}
                </span>
                <span className="text-[10px] text-[#8b949e] bg-[#0d1117] px-2 py-0.5 rounded border border-[#30363d] font-mono">
                  {t.badge}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-[#e6edf3] group-hover:text-[#58a6ff] transition-colors flex items-center justify-between">
                <span>{t.title}</span>
                <ArrowRight className="w-4 h-4 text-[#6e7681] group-hover:text-[#58a6ff] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </h3>

              {/* Mental Model */}
              <p className="text-xs text-[#8b949e] leading-relaxed">
                <span className="text-[#6e7681] font-semibold">Intuition: </span>
                {t.mentalModel}
              </p>
            </div>

            {/* Bottom Row */}
            <div className="pt-3 border-t border-[#21262d] flex items-center justify-between text-xs">
              <span className="font-mono text-[11px] text-[#58a6ff] bg-[#1f6feb]/10 px-2 py-0.5 rounded border border-[#1f6feb]/20">
                {t.keyStat}
              </span>
              <span className="text-xs font-semibold text-[#8b949e] group-hover:text-[#e6edf3] flex items-center gap-1 transition-colors">
                <span>Launch Lesson</span>
                <Sparkles className="w-3 h-3 text-[#58a6ff]" />
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
