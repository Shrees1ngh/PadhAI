import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import AITutorDrawer from './AITutorDrawer';
import aiTutorSvg from '../../assets/AI_tutor.svg';

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
      {/* Floating Bottom-Right Launcher with smooth animations */}
      <div className="fixed bottom-6 right-6 z-[9990] flex items-center select-none">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? "Close AI Tutor" : "Ask PadhAI Tutor"}
          aria-label="Toggle AI Tutor"
          className="relative w-14 h-14 sm:w-15 sm:h-15 flex items-center justify-center cursor-pointer bg-transparent border-0 p-0 shadow-none outline-none focus:outline-none select-none"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="w-12 h-12 rounded-full bg-[#0d121c] border border-cyan-400/40 flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
              >
                <X className="w-5 h-5 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="avatar"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="w-full h-full flex items-center justify-center"
              >
                <img
                  src={aiTutorSvg}
                  onError={(e) => { e.currentTarget.src = '/AI_tutor.svg'; }}
                  alt="PadhAI Tutor"
                  className="w-full h-full object-contain filter drop-shadow-[0_4px_14px_rgba(34,231,253,0.35)]"
                />
              </motion.div>
            )}
          </AnimatePresence>
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
