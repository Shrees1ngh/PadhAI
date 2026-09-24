import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, X, MessageSquare } from 'lucide-react';
import AITutorDrawer from './AITutorDrawer';

export const GlobalAITutorButton = ({
  activeTopic = 'General Concepts',
  activeLessonTitle = '',
  activeModuleTitle = '',
  learningObjective = '',
  learnerLevel = 'Beginner',
  lessonContent = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Bottom-Right AI Tutor Logo Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center select-none">
        <motion.button
          whileHover={{ scale: 1.1, y: -3 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(!isOpen)}
          title="AI Tutor - Ask any doubt"
          aria-label="Open AI Tutor"
          className="relative group w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#090d16] border border-cyan-400/40 hover:border-cyan-400 shadow-[0_0_20px_rgba(0,245,255,0.4)] hover:shadow-[0_0_30px_rgba(0,245,255,0.7)] flex items-center justify-center transition-all duration-300 cursor-pointer p-0.5"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 rounded-2xl bg-cyan-500/20 blur-lg opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none -z-10" />

          {/* AI Tutor Avatar */}
          <img
            src="/ai-tutor.png"
            alt="AI Tutor Logo"
            className="w-full h-full object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
          />

          {/* Active Online Indicator Dot */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 z-10">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-[#080c14]" />
          </span>
        </motion.button>
      </div>

      {/* Grounded AI Tutor Drawer */}
      <AITutorDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        courseTitle={activeTopic}
        moduleTitle={activeModuleTitle}
        lessonTitle={activeLessonTitle || activeTopic}
        learningObjective={learningObjective}
        learnerLevel={learnerLevel}
        lessonContent={lessonContent}
      />
    </>
  );
};

export default GlobalAITutorButton;
