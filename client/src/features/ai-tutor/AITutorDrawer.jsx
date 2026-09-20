import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Bot,
  User,
  Send,
  X,
  RefreshCw,
  Lightbulb,
  Code2,
  HelpCircle,
  Puzzle,
  AlertCircle,
  Layers,
  ChevronRight,
  BookOpen,
  ArrowRight,
  CornerDownLeft,
} from 'lucide-react';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { sendTutorChatMessage } from '../../services/api';

const QUICK_ACTIONS = [
  { label: 'Explain simpler', icon: Lightbulb, query: 'Can you explain the main idea of this lesson in simpler terms with basic intuition?' },
  { label: 'Give an example', icon: Code2, query: 'Can you provide a concrete, real-world practical example or code walkthrough for this lesson?' },
  { label: 'Give an analogy', icon: Puzzle, query: 'Can you give me an intuitive real-world analogy to help me remember this concept?' },
  { label: 'Quiz me', icon: HelpCircle, query: 'Ask me a quick conceptual question to test my understanding of this lesson.' },
];

export const AITutorDrawer = ({
  isOpen,
  onClose,
  courseTitle = '',
  moduleTitle = '',
  lessonTitle = '',
  learningObjective = '',
  lessonContent = {},
  learnerLevel = 'Beginner',
  lessonKey = '',
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // API Key from localStorage
  const apiKey = localStorage.getItem('padhai_gemini_key') || 'DEMO_MODE';

  // Initialize/Reset conversation when lessonKey changes
  useEffect(() => {
    if (lessonTitle) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `👋 Hi! I'm your **PadhAI Tutor** for **${lessonTitle}**.\n\nI'm contextualized to your current lesson material (${learnerLevel} level). Ask me to clarify any doubt, provide an analogy, or break down tricky edge cases!`,
          relatedConcepts: lessonContent?.keyConcepts?.slice(0, 3) || [],
          suggestedFollowUps: [
            'Explain simpler',
            'Give an example',
            'Give an analogy',
          ],
        },
      ]);
      setError(null);
    }
  }, [lessonKey, lessonTitle, learnerLevel]);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isOpen, loading]);

  // Handle Send Message
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    // Update conversation state
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      // Format history for backend
      const historyForApi = newHistory
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await sendTutorChatMessage(
        {
          message: text,
          courseTitle,
          moduleTitle,
          lessonTitle,
          learningObjective,
          lessonContent,
          learnerLevel,
          conversationHistory: historyForApi.slice(-6),
        },
        apiKey
      );

      if (res.success && res.answer) {
        const botMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: res.answer,
          relatedConcepts: res.relatedConcepts || [],
          suggestedFollowUps: res.suggestedFollowUps || [],
          isOutsideLessonScope: res.isOutsideLessonScope || false,
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(res.message || 'Failed to receive tutor response');
      }
    } catch (err) {
      console.error('AI Tutor error:', err);
      setError(err.message || 'Failed to connect to AI Tutor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Action Handler
  const handleQuickAction = (queryText) => {
    handleSendMessage(queryText);
  };

  // Reset Chat Session
  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Chat reset. I'm ready to answer any questions about **${lessonTitle}**!`,
        relatedConcepts: [],
        suggestedFollowUps: ['Explain simpler', 'Give an example', 'Quiz me'],
      },
    ]);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
        {/* Drawer Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Drawer Container */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-lg h-full bg-[#090d16] border-l border-white/10 shadow-2xl flex flex-col z-10"
        >
          {/* Top Header Bar */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    PadhAI Lesson Tutor
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Active</span>
                  </span>
                </div>
                <div className="text-[11px] text-purple-300 font-medium truncate max-w-[240px]">
                  Grounded: {lessonTitle || 'Active Lesson'}
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleResetChat}
                title="Reset this chat session"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Context Strip */}
          <div className="px-4 py-2 bg-purple-950/20 border-b border-purple-500/10 flex items-center justify-between text-[11px] text-purple-200">
            <div className="flex items-center space-x-1.5 truncate">
              <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">{moduleTitle}</span>
            </div>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-500/20 shrink-0">
              {learnerLevel}
            </span>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2.5 ${
                    isUser ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      isUser
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 text-purple-300 border border-white/10'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  {/* Message Bubble Container */}
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 ${
                      isUser
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20 rounded-tr-none'
                        : 'bg-slate-900/80 border border-white/10 text-slate-200 rounded-tl-none shadow-md'
                    }`}
                  >
                    {/* Scope Notice Badge */}
                    {msg.isOutsideLessonScope && (
                      <div className="flex items-center space-x-1.5 text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md mb-1">
                        <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>Question outside primary lesson scope</span>
                      </div>
                    )}

                    {/* Content Markdown */}
                    <div className={isUser ? 'text-white' : ''}>
                      <MarkdownRenderer content={msg.content} />
                    </div>

                    {/* Related Concept Tags */}
                    {!isUser && msg.relatedConcepts && msg.relatedConcepts.length > 0 && (
                      <div className="pt-2 border-t border-white/5 flex flex-wrap gap-1.5">
                        {msg.relatedConcepts.map((concept, cIdx) => (
                          <span
                            key={cIdx}
                            className="px-2 py-0.5 rounded-md bg-purple-950/50 border border-purple-500/20 text-purple-300 text-[10px] font-medium"
                          >
                            🏷️ {concept}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Suggested Follow-Up Prompt Chips */}
                    {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                      <div className="pt-2 border-t border-white/5 space-y-1.5">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Suggested follow-ups:
                        </div>
                        <div className="flex flex-col space-y-1">
                          {msg.suggestedFollowUps.map((suggestion, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSendMessage(suggestion)}
                              className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-purple-600/20 hover:border-purple-500/40 border border-white/5 text-purple-200 transition-all flex items-center justify-between group"
                            >
                              <span className="truncate pr-2">{suggestion}</span>
                              <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-purple-300 shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Thinking / Loading Animation */}
            {loading && (
              <div className="flex items-start space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/10 text-purple-300 border border-white/10 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-900/80 border border-white/10 rounded-2xl rounded-tl-none p-3.5 flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs text-slate-400 pl-1">Thinking with lesson context...</span>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {error && !loading && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">{error}</div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions Strip */}
          <div className="p-3 border-t border-white/5 bg-white/[0.01]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
              Quick Actions for this Lesson:
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_ACTIONS.map((action, idx) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action.query)}
                    disabled={loading}
                    className="p-2 rounded-xl bg-slate-900/60 hover:bg-purple-600/20 border border-white/5 hover:border-purple-500/30 text-slate-300 hover:text-purple-200 text-[11px] font-medium transition-all flex items-center space-x-1.5 truncate disabled:opacity-50"
                  >
                    <IconComponent className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Input Form */}
          <div className="p-4 border-t border-white/10 bg-[#090d16]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask a question about ${lessonTitle || 'this lesson'}...`}
                  disabled={loading}
                  className="w-full pl-3.5 pr-10 py-3 rounded-xl bg-slate-900/90 border border-white/10 focus:border-purple-500 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all disabled:opacity-50"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono hidden sm:block">
                  ↵
                </div>
              </div>

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all shadow-lg shadow-purple-600/25 disabled:opacity-40 disabled:pointer-events-none shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AITutorDrawer;
