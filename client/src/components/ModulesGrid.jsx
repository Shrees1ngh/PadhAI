import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  TrendingUp, 
  Bot, 
  FileUp, 
  Columns3, 
  Layers, 
  Video,
  ArrowUpRight
} from 'lucide-react';

const MODULES = [
  {
    id: 'auth',
    title: 'Authentication & Profiles',
    description: 'Secure JWT authentication with session handling, learner preferences, and customizable avatars.',
    icon: ShieldCheck,
    color: 'from-blue-500 to-indigo-600',
    badge: 'Security',
    route: '/api/auth'
  },
  {
    id: 'courses',
    title: 'Course Outline Architect',
    description: 'AI-driven Bloom’s Taxonomy syllabus generation with interactive human-in-the-loop outline refinement.',
    icon: BookOpen,
    color: 'from-purple-500 to-indigo-600',
    badge: 'Core AI',
    route: '/api/courses'
  },
  {
    id: 'lessons',
    title: 'Lesson & Content Engine',
    description: 'Deep modular lesson generation with pedagogical structure, real-world case studies, and code snippets.',
    icon: FileText,
    color: 'from-indigo-500 to-cyan-500',
    badge: 'Content',
    route: '/api/lessons'
  },
  {
    id: 'quizzes',
    title: 'Adaptive Quiz Engine',
    description: 'Chapter-level and course-level assessments with anti-cheat key protection, timers, and explanations.',
    icon: HelpCircle,
    color: 'from-amber-500 to-rose-500',
    badge: 'Assessment',
    route: '/api/quizzes'
  },
  {
    id: 'progress',
    title: 'Progress & Enrollment',
    description: 'Granular topic completion tracking with atomic updates and automatic course completion percentages.',
    icon: TrendingUp,
    color: 'from-emerald-500 to-teal-500',
    badge: 'Analytics',
    route: '/api/progress'
  },
  {
    id: 'ai-tutor',
    title: '24/7 AI Personal Tutor',
    description: 'Conversational assistant contextualized on course content to answer doubts and clarify tricky concepts.',
    icon: Bot,
    color: 'from-fuchsia-500 to-purple-600',
    badge: 'Conversational AI',
    route: '/api/ai-tutor'
  },
  {
    id: 'study-materials',
    title: 'Document Ingestion (PDF / PPT)',
    description: 'Multi-format material ingestion using PyMuPDF and slide parsers to turn lectures into complete courses.',
    icon: FileUp,
    color: 'from-cyan-500 to-blue-600',
    badge: 'Ingestion',
    route: '/api/study-materials'
  },
  {
    id: 'cheatsheets',
    title: 'Dense Exam Cheatsheets',
    description: 'Multi-column, ultra-dense reference sheets with semantic highlighting and LaTeX/PDF export.',
    icon: Columns3,
    color: 'from-rose-500 to-pink-600',
    badge: 'Exam Prep',
    route: '/api/cheatsheets'
  },
  {
    id: 'flashcards',
    title: 'Spaced Repetition Flashcards',
    description: 'Auto-generated flashcard decks tailored to key concepts, formulas, and terminology.',
    icon: Layers,
    color: 'from-violet-500 to-purple-500',
    badge: 'Retention',
    route: '/api/flashcards'
  },
  {
    id: 'youtube',
    title: 'YouTube Media Synchronization',
    description: 'Automatic curation and synchronization of top-rated educational videos for every chapter topic.',
    icon: Video,
    color: 'from-red-500 to-orange-500',
    badge: 'Multimodal',
    route: '/api/youtube'
  }
];

export const ModulesGrid = ({ onSelectModule }) => {
  return (
    <section id="modules" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300 uppercase tracking-wider mb-3">
            System Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            10 Modular Pillars of PadhAI
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-400">
            Each module is cleanly decoupled across client features, Express route handlers, and MongoDB data models.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULES.map((item, index) => {
            const Icon = item.icon;
            const isImplemented = item.id === 'study-materials' || item.id === 'courses' || item.id === 'lessons';
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => {
                  if (item.id === 'study-materials' && onSelectModule) {
                    onSelectModule('study-materials');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={`glass-card glass-card-hover rounded-2xl p-6 border border-white/10 flex flex-col justify-between group ${
                  item.id === 'study-materials' ? 'cursor-pointer hover:border-cyan-500/40 hover:shadow-cyan-500/10' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white shadow-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                      item.id === 'study-materials' || item.id === 'cheatsheets' || item.id === 'flashcards' || item.id === 'courses' || item.id === 'lessons' || item.id === 'quizzes'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : 'bg-white/5 border border-white/10 text-slate-300'
                    }`}>
                      {item.id === 'study-materials' || item.id === 'cheatsheets' || item.id === 'flashcards' ? 'Active Module' : item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400 text-[11px]">
                    {item.route}
                  </span>
                  <span className={`inline-flex items-center font-medium group-hover:translate-x-0.5 transition-transform ${
                    item.id === 'study-materials' || item.id === 'cheatsheets' || item.id === 'flashcards' ? 'text-cyan-400 font-bold' : 'text-purple-400'
                  }`}>
                    {item.id === 'study-materials' ? 'Launch Analyzer' : item.id === 'cheatsheets' || item.id === 'flashcards' ? 'Ready in Viewer' : 'Scaffolded'}{' '}
                    <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ModulesGrid;
