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
  KeyRound,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { sendTutorChatMessage } from '../../services/api';

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
        setError('Gemini API Key required. Click "Set Key" to continue.');
      } else {
        setError(err.message || 'Connection failed. Please check network or API key.');
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
      {/* Floating Chat Widget - NO full-page dark overlay blocking the website */}
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.96 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="fixed bottom-22 right-6 z-[9995] w-[410px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-7.5rem)] bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-sm select-text"
      >
        {/* Simple Compact Header */}
        <div className="px-4 py-3 border-b border-white/10 bg-[#121620] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/15">
              <img
                src="/ai-tutor.png"
                alt="AI Tutor"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white text-xs truncate">PadhAI Tutor</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              </div>
              <p className="text-[11px] text-zinc-400 truncate">
                {lessonTitle || moduleTitle || 'Course Assistant'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-api-key-modal'))}
              title="Set API Key"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetChat}
              title="Restart chat"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              title="Close"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isCopied = copiedId === msg.id;
            const isSpeaking = speakingId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`relative group max-w-[88%] rounded-xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-[#161b26] border border-white/5 text-zinc-200 rounded-bl-xs'
                  }`}
                >
                  {/* Action buttons on AI bubble */}
                  {!isUser && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#161b26] rounded-md px-1 py-0.5 border border-white/10">
                      <button
                        onClick={() => handleToggleSpeak(msg.id, msg.content)}
                        title={isSpeaking ? 'Stop' : 'Listen'}
                        className="text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                      >
                        {isSpeaking ? (
                          <VolumeX className="w-3 h-3 text-blue-400" />
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
                    <div className="flex items-center gap-1 text-[11px] text-amber-400 mb-1.5">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>Outside current lesson scope</span>
                    </div>
                  )}

                  <MarkdownRenderer content={msg.content} />
                </div>

                {/* Clean Suggested Follow-ups */}
                {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 pl-1 max-w-[90%]">
                    {msg.suggestedFollowUps.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSendMessage(sug)}
                        className="text-left text-[11px] px-2.5 py-1 rounded-md bg-[#161b26] hover:bg-[#1f2535] border border-white/10 text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>{sug}</span>
                        <ChevronRight className="w-2.5 h-2.5 opacity-60" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Reasoning / Loading state */}
          {loading && (
            <div className="flex items-center space-x-2 bg-[#161b26] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-zinc-400 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span>Thinking...</span>
            </div>
          )}

          {error && !loading && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center justify-between gap-2">
              <span className="truncate">{error}</span>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-api-key-modal'))}
                className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-200 text-xs font-semibold shrink-0 cursor-pointer"
              >
                Set Key
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Clean Input Bar */}
        <div className="p-3 border-t border-white/10 bg-[#121620]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-1.5 bg-[#181d29] border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-blue-500/60 transition-colors"
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
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:pointer-events-none text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AITutorDrawer;
