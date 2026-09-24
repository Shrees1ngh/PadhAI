import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  User,
  Lightbulb,
  AlertCircle,
  RotateCcw,
  Copy,
  Check,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { chatWithAITutor } from '../../services/api';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import aiTutorSvg from '../../assets/AI_tutor.svg';

const QUICK_QUESTIONS = [
  'Explain Dijkstra’s algorithm step-by-step',
  'What is the difference between BFS and DFS?',
  'How does QuickSort choose its pivot?',
  'Why is binary search O(log n)?',
  'Explain dynamic programming with a simple analogy',
];

export const AITutorView = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello! I am your **PadhAI Socratic Tutor**.\n\nAsk me any Computer Science concept, algorithm breakdown, step-by-step intuition, or ask me to debug your code! Rather than giving answers upfront, I'll help you reason like a world-class engineer.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = (idx, text) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    }
  };

  const handleToggleSpeak = (idx, text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*_#\[\]()]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);

    setSpeakingIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  const handleReset = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
    }
    setMessages([
      {
        role: 'assistant',
        content: "Chat session refreshed. What concept or problem would you like to master today?",
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
    <div className="max-w-4xl mx-auto space-y-3.5 h-[calc(100vh-8.5rem)] flex flex-col select-text">
      
      {/* Top Header Card */}
      <div className="rounded-2xl p-3.5 sm:p-4 bg-[#0d1117] border border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
            <img
              src={aiTutorSvg}
              onError={(e) => { e.currentTarget.src = '/AI_tutor.svg'; }}
              alt="PadhAI Tutor Mascot"
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">PadhAI Tutor</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Ask conceptual doubts, algorithms, or code walkthroughs</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleReset}
            title="Reset conversation"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Starter Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 shrink-0 no-scrollbar">
        {QUICK_QUESTIONS.map((q, i) => (
          <button
            key={i}
            disabled={loading}
            onClick={() => handleSend(q)}
            className="px-3 py-1 rounded-lg bg-[#161b26] hover:bg-[#1f2535] border border-white/10 text-xs text-zinc-400 hover:text-zinc-200 shrink-0 transition-colors flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Lightbulb className="w-3 h-3 text-blue-400 shrink-0" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 rounded-2xl p-4 sm:p-5 bg-[#0d1117] border border-white/10 overflow-y-auto space-y-3.5">
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          const isCopied = copiedIdx === i;
          const isSpeaking = speakingIdx === i;

          return (
            <div
              key={i}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`relative group max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-[#161b26] border border-white/5 text-zinc-200 rounded-bl-xs'
                }`}
              >
                {!isUser && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[#161b26] rounded-md px-1 py-0.5 border border-white/10">
                    <button
                      onClick={() => handleToggleSpeak(i, msg.content)}
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
                      onClick={() => handleCopy(i, msg.content)}
                      title="Copy"
                      className="text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                )}

                <MarkdownRenderer content={msg.content} />
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center space-x-2 bg-[#161b26] border border-white/5 rounded-xl px-3.5 py-2 text-xs text-zinc-400 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>Thinking...</span>
          </div>
        )}

        {/* Error Banner */}
        {error && !loading && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="leading-snug">{error}</span>
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
        className="flex items-center gap-2 bg-[#121620] border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-blue-500/60 transition-colors shrink-0"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          disabled={loading}
          className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none disabled:opacity-50 py-1"
        />

        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:pointer-events-none text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

export default AITutorView;
