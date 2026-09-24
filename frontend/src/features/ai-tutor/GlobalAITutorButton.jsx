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
      {/* Floating Bottom-Right AI Tutor Logo Button (Borderless Pure Floating Avatar) */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center select-none">
        <motion.button
          whileHover={{ scale: 1.12, y: -4 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(!isOpen)}
          title="AI Tutor - Ask any doubt"
          aria-label="Open AI Tutor"
          className="relative group w-14 h-14 sm:w-16 sm:h-16 bg-transparent border-0 outline-none p-0 flex items-center justify-center cursor-pointer transition-all duration-300"
        >
          {/* AI Tutor Avatar with Pure Radiant Glow */}
          <img
            src="/ai-tutor.png"
            alt="AI Tutor Logo"
            className="w-full h-full object-contain rounded-2xl filter drop-shadow-[0_0_18px_rgba(0,245,255,0.65)] group-hover:drop-shadow-[0_0_28px_rgba(0,245,255,0.95)] transition-all duration-300"
          />

          {/* Active Online Indicator Dot */}
          <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 z-10 pointer-events-none">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-[#090d16] shadow-sm" />
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
