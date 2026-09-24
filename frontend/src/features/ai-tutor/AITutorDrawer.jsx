import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Bot,
  User,
  Send,
  X,
  RotateCcw,
  Copy,
  Check,
  Volume2,
  VolumeX,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { sendTutorChatMessage } from '../../services/api';
import aiTutorSvg from '../../assets/AI_tutor.svg';

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
  const [speakingId, setSpeakingId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const apiKey = typeof window !== 'undefined' ? localStorage.getItem('padhai_gemini_api_key') || '' : '';

  useEffect(() => {
    if (lessonTitle) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Hi! I'm your tutor for **${lessonTitle}** (${learnerLevel} level).\n\nAsk me any concept breakdown, edge case, or code explanation!`,
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
      }
    }
  }, [messages, isOpen, loading]);

  const handleCopy = (id, text) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleToggleSpeak = (id, text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*_#\[\]()]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setError(null);
    setLoading(true);

    try {
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
        setError('AI model connection failed. Please ensure GEMINI_API_KEY is configured in server .env or Settings.');
      } else {
        setError(err.message || 'Connection failed. Please check network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    }
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Chat session refreshed. What would you like to ask about **${lessonTitle || 'this topic'}**?`,
        suggestedFollowUps: ['Explain the core intuition', 'Show code implementation', 'Quiz me'],
      },
    ]);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Floating Chat Widget with smooth spring animation */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 22, scale: 0.94 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-22 right-6 z-[9995] w-[410px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-7.5rem)] bg-[#0d121c]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden text-sm select-text"
      >
        {/* Simple Minimal Header */}
        <div className="px-4 py-3 border-b border-white/10 bg-[#121826]/90 backdrop-blur-md flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
              <img
                src={aiTutorSvg}
                onError={(e) => { e.currentTarget.src = '/AI_tutor.svg'; }}
                alt="AI Tutor"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-white text-xs sm:text-sm tracking-tight truncate">PadhAI Tutor</h4>
              <p className="text-[11px] text-zinc-400 truncate">
                {lessonTitle || moduleTitle || 'AI Learning Assistant'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            <motion.button
              whileHover={{ rotate: -60, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleResetChat}
              title="Reset conversation"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              title="Close"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isCopied = copiedId === msg.id;
            const isSpeaking = speakingId === msg.id;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`relative group max-w-[88%] rounded-2xl px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed transition-all shadow-sm ${
                    isUser
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs shadow-blue-900/30'
                      : 'bg-[#151b28] border border-white/5 text-zinc-200 rounded-bl-xs'
                  }`}
                >
                  {/* Action buttons on AI bubble */}
                  {!isUser && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#151b28]/90 backdrop-blur-sm rounded-md px-1 py-0.5 border border-white/10">
                      <button
                        onClick={() => handleToggleSpeak(msg.id, msg.content)}
                        title={isSpeaking ? 'Stop' : 'Listen'}
                        className="text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                      >
                        {isSpeaking ? (
                          <VolumeX className="w-3 h-3 text-cyan-400" />
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        title="Copy"
                        className="text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  )}

                  {msg.isOutsideLessonScope && (
                    <div className="flex items-center gap-1 text-[11px] text-amber-400 mb-1.5 font-medium">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>Outside current lesson scope</span>
                    </div>
                  )}

                  <MarkdownRenderer content={msg.content} />
                </div>

                {/* Clean Animated Suggested Follow-ups */}
                {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 pl-1 max-w-[92%]">
                    {msg.suggestedFollowUps.map((sug, sIdx) => (
                      <motion.button
                        key={sIdx}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: sIdx * 0.05 + 0.05, duration: 0.2 }}
                        whileHover={{ scale: 1.02, x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSendMessage(sug)}
                        className="text-left text-[11px] px-3 py-1.5 rounded-lg bg-[#141a26] hover:bg-[#1c2436] border border-white/10 hover:border-cyan-500/40 text-zinc-300 hover:text-cyan-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm group"
                      >
                        <span>{sug}</span>
                        <ChevronRight className="w-2.5 h-2.5 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Reasoning / Loading state with 3 animated bouncing dots */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-2.5 bg-[#141a26] border border-cyan-500/20 rounded-2xl px-4 py-2.5 text-xs text-zinc-300 w-fit shadow-lg shadow-cyan-950/20"
            >
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
              </div>
              <span className="text-xs text-zinc-300 font-medium">Thinking...</span>
            </motion.div>
          )}

          {error && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="leading-snug">{error}</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Clean Input Bar */}
        <div className="p-3 border-t border-white/10 bg-[#121826]/90 backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-[#181f2f] border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-cyan-500/60 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask doubt..."
              disabled={loading}
              className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none disabled:opacity-50 py-1"
            />
            <motion.button
              type="submit"
              disabled={!input.trim() || loading}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className="w-7 h-7 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-30 disabled:pointer-events-none text-white flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-md shadow-cyan-950/40"
            >
              <Send className="w-3.5 h-3.5" />
            </motion.button>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AITutorDrawer;
