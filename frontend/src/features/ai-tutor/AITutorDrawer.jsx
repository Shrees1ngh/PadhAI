import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Bot,
  User,
  Send,
  X,
  RotateCcw,
  Lightbulb,
  Code2,
  HelpCircle,
  Puzzle,
  AlertCircle,
  Copy,
  Check,
  BookOpen,
  ArrowRight,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Zap
} from 'lucide-react';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { sendTutorChatMessage } from '../../services/api';

const PROMPT_SUGGESTIONS = [
  { label: 'Explain intuitively', icon: Lightbulb, query: 'Can you explain the core intuition of this concept in simple terms without heavy jargon?' },
  { label: 'Code walkthrough', icon: Code2, query: 'Can you walk me through a clean, well-commented code implementation of this step-by-step?' },
  { label: 'Real-world analogy', icon: Puzzle, query: 'Give me a vivid, real-world analogy to help me remember how this works.' },
  { label: 'Quiz my knowledge', icon: HelpCircle, query: 'Ask me a sharp conceptual question or tricky edge-case to test if I really understand this.' },
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
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // API Key from localStorage
  const apiKey = typeof window !== 'undefined' ? localStorage.getItem('padhai_gemini_api_key') || '' : '';

  // Initialize/Reset conversation when lessonKey changes
  useEffect(() => {
    if (lessonTitle) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Hi! I'm your **PadhAI Socratic Tutor** for **${lessonTitle}**.\n\nI'm grounded in your active course materials at the **${learnerLevel}** level. Ask me to break down tricky concepts, debug code, or explore practical edge cases!`,
          relatedConcepts: lessonContent?.keyConcepts?.slice(0, 4) || [],
          suggestedFollowUps: [
            'Explain the core intuition',
            'Show code implementation',
            'What are common pitfalls?',
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

  // Handle Copy Message Content
  const handleCopy = (id, text) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

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
      const isKeyErr = err.code === 'API_KEY_REQUIRED' || err.message?.toLowerCase().includes('gemini api key is required');
      if (isKeyErr) {
        setError('Google Gemini API Key required. Click "Set Key" to continue.');
      } else {
        setError(err.message || 'Connection failed. Please check your network or API key.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset Chat Session
  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Chat session refreshed. What would you like to explore about **${lessonTitle || 'this topic'}**?`,
        relatedConcepts: lessonContent?.keyConcepts?.slice(0, 3) || [],
        suggestedFollowUps: ['Explain simpler', 'Give an example', 'Quiz me'],
      },
    ]);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/70 backdrop-blur-sm transition-opacity">
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Next-Level Glassmorphic Drawer */}
        <motion.div
          initial={{ x: '100%', opacity: 0.5 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0.5 }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="relative w-full max-w-xl h-full bg-[#080c16]/95 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col z-10 select-text"
        >
          {/* Top Header Bar */}
          <div className="p-4 sm:px-6 sm:py-4.5 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-white/[0.03] to-transparent">
            <div className="flex items-center space-x-3.5 min-w-0">
              {/* 3D Robot Logo */}
              <div className="relative shrink-0">
                <img
                  src="/ai-tutor.png"
                  alt="PadhAI Tutor"
                  className="w-10 h-10 rounded-2xl object-contain filter drop-shadow-[0_0_12px_rgba(0,245,255,0.6)]"
                />
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border border-[#080c16]" />
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    PadhAI Socratic Tutor
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[#00f5ff] text-[10px] font-semibold tracking-wide uppercase">
                    AI Active
                  </span>
                </div>
                <p className="text-xs text-[#8a8faa] truncate mt-0.5">
                  Grounded to: <span className="text-[#38bdf8] font-medium">{lessonTitle || moduleTitle || 'Current Lesson'}</span>
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                onClick={handleResetChat}
                title="Restart conversation"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#8a8faa] hover:text-white transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onClose}
                title="Close Tutor"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#8a8faa] hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lesson Context Ribbon */}
          {(moduleTitle || learnerLevel) && (
            <div className="px-5 py-2 bg-[#0c1220] border-b border-white/[0.06] flex items-center justify-between text-xs text-[#8a8faa]">
              <div className="flex items-center space-x-2 truncate">
                <BookOpen className="w-3.5 h-3.5 text-[#00f5ff] shrink-0" />
                <span className="truncate">{moduleTitle || lessonTitle}</span>
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#161f33] text-[#7dd3fc] border border-cyan-500/20 shrink-0">
                {learnerLevel} Track
              </span>
            </div>
          )}

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const isCopied = copiedId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar */}
                  <div className="shrink-0 mt-0.5">
                    {isUser ? (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1f6feb] to-[#388bfd] text-white flex items-center justify-center text-xs font-bold shadow-md">
                        <User className="w-4 h-4" />
                      </div>
                    ) : (
                      <img
                        src="/ai-tutor.png"
                        alt="Tutor"
                        className="w-8 h-8 rounded-xl object-contain filter drop-shadow-[0_0_8px_rgba(0,245,255,0.5)]"
                      />
                    )}
                  </div>

                  {/* Message Bubble Container */}
                  <div className={`max-w-[85%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`relative group rounded-2xl p-4 text-xs sm:text-[13px] leading-relaxed transition-all shadow-md ${
                        isUser
                          ? 'bg-gradient-to-r from-[#1f6feb] to-[#2563eb] text-white rounded-tr-sm shadow-[0_4px_16px_rgba(31,111,235,0.25)]'
                          : 'bg-[#0d1424] border border-white/[0.08] text-[#e6edf3] rounded-tl-sm'
                      }`}
                    >
                      {/* Copy Action for AI Responses */}
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          title="Copy response"
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8a8faa] hover:text-white transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}

                      {/* Scope Notice Badge */}
                      {msg.isOutsideLessonScope && (
                        <div className="flex items-center space-x-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md mb-2">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Question falls slightly outside lesson scope</span>
                        </div>
                      )}

                      {/* Content Markdown */}
                      <div className={isUser ? 'text-white' : ''}>
                        <MarkdownRenderer content={msg.content} />
                      </div>

                      {/* Related Concept Chips */}
                      {!isUser && msg.relatedConcepts && msg.relatedConcepts.length > 0 && (
                        <div className="pt-3 mt-2 border-t border-white/[0.06] flex flex-wrap gap-1.5">
                          {msg.relatedConcepts.map((concept, cIdx) => (
                            <button
                              key={cIdx}
                              onClick={() => handleSendMessage(`Explain ${concept} in detail`)}
                              className="px-2 py-0.5 rounded-md bg-[#161f33] hover:bg-[#1f2c4a] border border-cyan-500/20 text-[#7dd3fc] text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              🏷️ {concept}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Suggested Follow-Ups */}
                    {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                      <div className="pt-1.5 space-y-1 pl-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#6e7681]">
                          Suggested follow-ups:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestedFollowUps.map((sug, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => handleSendMessage(sug)}
                              className="text-left text-xs px-3 py-1.5 rounded-xl bg-[#0c1220] hover:bg-[#162035] hover:border-cyan-500/40 border border-white/[0.07] text-[#8a8faa] hover:text-white transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
                            >
                              <span>{sug}</span>
                              <ChevronRight className="w-3 h-3 text-[#58a6ff]" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Thinking / Reasoning Animation */}
            {loading && (
              <div className="flex items-start space-x-3">
                <img
                  src="/ai-tutor.png"
                  alt="Tutor"
                  className="w-8 h-8 rounded-xl object-contain filter drop-shadow-[0_0_8px_rgba(0,245,255,0.5)] shrink-0"
                />
                <div className="bg-[#0d1424] border border-white/[0.08] rounded-2xl rounded-tl-sm p-4 flex items-center space-x-3 shadow-md">
                  <div className="flex space-x-1">
                    <span className="w-2 h-2 rounded-full bg-[#00f5ff] animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-[#818cf8] animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-xs text-[#8a8faa] font-medium">PadhAI is reasoning through your concept...</span>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {error && !loading && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center justify-between gap-2 shadow-md">
                <div className="flex items-center space-x-2 min-w-0">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="truncate">{error}</span>
                </div>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-api-key-modal'))}
                  className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                >
                  Set Key
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips Strip */}
          <div className="px-4 py-2.5 border-t border-white/[0.06] bg-[#070b14]/70">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {PROMPT_SUGGESTIONS.map((action, idx) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(action.query)}
                    disabled={loading}
                    className="px-2.5 py-1.5 rounded-lg bg-[#0e1628] hover:bg-[#17233f] border border-white/[0.08] hover:border-cyan-500/40 text-[#8a8faa] hover:text-white text-xs font-medium transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <IconComponent className="w-3.5 h-3.5 text-[#00f5ff] shrink-0" />
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Input Form */}
          <div className="p-4 border-t border-white/[0.08] bg-[#080c16]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0e1424] border border-white/10 focus-within:border-[#00f5ff]/60 focus-within:ring-2 focus-within:ring-[#00f5ff]/20 transition-all shadow-xl"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask doubt on ${lessonTitle || 'this concept'}...`}
                disabled={loading}
                className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-[#6e7681] focus:outline-none disabled:opacity-50"
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#00f5ff] to-[#38bdf8] hover:from-[#7dd3fc] hover:to-[#00f5ff] text-[#020617] flex items-center justify-center transition-all shadow-[0_0_15px_rgba(0,245,255,0.4)] disabled:opacity-30 disabled:pointer-events-none shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#020617] stroke-[2.5]" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AITutorDrawer;
