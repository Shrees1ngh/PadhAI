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
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(!isOpen)}
          title="AI Tutor - Ask any doubt"
          aria-label="Open AI Tutor"
          className="relative group w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-2xl shadow-indigo-600/40 border border-white/20 hover:border-white/40 flex items-center justify-center transition-all duration-300 ring-2 ring-indigo-500/20"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 blur-md opacity-40 group-hover:opacity-80 transition-opacity pointer-events-none -z-10" />

          {/* AI Sparkles Icon */}
          <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300 drop-shadow" />

          {/* Active Online Indicator Dot */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
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
