import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, RefreshCw, User, BookOpen, Lightbulb, AlertCircle, RotateCcw, Copy, Check } from 'lucide-react';
import { chatWithAITutor } from '../../services/api';
import MarkdownRenderer from '../../components/MarkdownRenderer';

const QUICK_QUESTIONS = [
  'Explain Dijkstra’s algorithm step-by-step',
  'What is the difference between BFS and DFS?',
  'How does QuickSort choose its pivot?',
  'Why is binary search O(log n)?',
];

export const AITutorView = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I am your **24/7 PadhAI Socratic Tutor**.\n\nAsk me any Computer Science concept, algorithm breakdown, step-by-step proof, or ask me to debug your code!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleCopy = (idx, text) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Chat session refreshed. What would you like to master today?",
      },
    ]);
    setError(null);
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    setInput('');
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const historyForApi = messages
        .filter((m) => m.content)
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        }));

      const res = await chatWithAITutor({
        message: text,
        learnerLevel: 'Intermediate',
        conversationHistory: historyForApi.slice(-6),
      });

      if (res?.success && res.answer) {
        setMessages((prev) => [...prev, { role: 'assistant', content: res.answer }]);
      } else {
        throw new Error(res?.message || 'Failed to receive tutor response.');
      }
    } catch (err) {
      console.error('Tutor chat error:', err);
      const isKeyErr = err.code === 'API_KEY_REQUIRED' || err.message?.toLowerCase().includes('gemini api key is required');
      if (isKeyErr) {
        setError('Google Gemini API Key required. Click "Set Key" to continue.');
      } else {
        setError(err.message || 'Failed to connect to AI Tutor. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 h-[calc(100vh-8.5rem)] flex flex-col select-text">
      
      {/* Top Header Card */}
      <div className="rounded-2xl p-4 sm:p-5 bg-[#0d1424] border border-white/[0.08] flex items-center justify-between shadow-xl shrink-0">
        <div className="flex items-center space-x-3.5">
          <div className="relative shrink-0">
            <img
              src="/ai-tutor.png"
              alt="AI Tutor"
              className="w-11 h-11 rounded-2xl object-contain filter drop-shadow-[0_0_14px_rgba(0,245,255,0.65)]"
            />
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-[#0d1424]" />
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-tight">24/7 PadhAI Tutor</h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[#00f5ff] text-[10px] font-semibold tracking-wide uppercase">
                Active
              </span>
            </div>
            <p className="text-xs text-[#8a8faa]">Ask any conceptual doubt, code walkthrough, or proof</p>
          </div>
        </div>

        <button
          onClick={handleReset}
          title="Reset conversation"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#8a8faa] hover:text-white transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Starter Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 no-scrollbar">
        {QUICK_QUESTIONS.map((q, i) => (
          <button
            key={i}
            disabled={loading}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 rounded-xl bg-[#0e1628] hover:bg-[#17233f] border border-white/[0.08] hover:border-cyan-500/40 text-xs font-medium text-[#8a8faa] hover:text-white shrink-0 transition-all flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#00f5ff] shrink-0" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 rounded-3xl p-4 sm:p-6 bg-[#080c16]/90 border border-white/[0.08] shadow-2xl overflow-y-auto space-y-4">
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          const isCopied = copiedIdx === i;

          return (
            <div
              key={i}
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

              {/* Message Bubble */}
              <div
                className={`relative group max-w-[85%] p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-md ${
                  isUser
                    ? 'bg-gradient-to-r from-[#1f6feb] to-[#2563eb] text-white rounded-tr-sm shadow-[0_4px_16px_rgba(31,111,235,0.25)]'
                    : 'bg-[#0d1424] border border-white/[0.08] text-[#e6edf3] rounded-tl-sm'
                }`}
              >
                {!isUser && (
                  <button
                    onClick={() => handleCopy(i, msg.content)}
                    title="Copy message"
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8a8faa] hover:text-white transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}

                <div className={isUser ? 'text-white' : ''}>
                  <MarkdownRenderer content={msg.content} />
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
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
              <span className="text-xs text-[#8a8faa] font-medium">PadhAI is reasoning...</span>
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

        <div ref={bottomRef} />
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0e1424] border border-white/10 focus-within:border-[#00f5ff]/60 focus-within:ring-2 focus-within:ring-[#00f5ff]/20 transition-all shadow-xl shrink-0"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything (e.g. explain dynamic programming memoization, prove master theorem)..."
          disabled={loading}
          className="flex-1 bg-transparent px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#6e7681] focus:outline-none disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#00f5ff] to-[#38bdf8] hover:from-[#7dd3fc] hover:to-[#00f5ff] text-[#020617] flex items-center justify-center transition-all shadow-[0_0_15px_rgba(0,245,255,0.4)] disabled:opacity-30 disabled:pointer-events-none shrink-0 cursor-pointer"
        >
          <Send className="w-4 h-4 text-[#020617] stroke-[2.5]" />
        </button>
      </form>
    </div>
  );
};

export default AITutorView;
