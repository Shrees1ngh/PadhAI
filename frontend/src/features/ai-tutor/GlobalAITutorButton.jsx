import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, X, MessageSquare } from 'lucide-react';
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
      {/* Floating Bottom-Right Launcher (Clean, Minimal, Non-intrusive) */}
      <div className="fixed bottom-6 right-6 z-[9990] flex items-center select-none">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          title="AI Tutor"
          aria-label="Open AI Tutor"
          className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#121620] hover:bg-[#181e2b] border border-white/15 p-1 flex items-center justify-center cursor-pointer shadow-xl transition-colors"
        >
          {isOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center">
              <img
                src="/ai-tutor.png"
                alt="PadhAI Tutor"
                className="w-full h-full object-cover rounded-full"
              />
              <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#121620]" />
            </div>
          )}
        </motion.button>
      </div>

      {/* Floating Chatbot Widget (No full-screen dark overlay) */}
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
