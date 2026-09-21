import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, RefreshCw, User, BookOpen, Lightbulb, AlertCircle, RotateCcw } from 'lucide-react';
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
        'Hello! I am your 24/7 AI Tutor. Ask me any conceptual question, debug your code, or request step-by-step mathematical intuition.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
      setError(err.message || 'Failed to connect to AI Tutor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="rounded-3xl p-5 bg-[#0d1322] border border-white/10 flex items-center justify-between shadow-xl shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">24/7 AI Tutor</h2>
            <p className="text-xs text-slate-400">Ask any conceptual doubt or code question</p>
          </div>
        </div>

        <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Active</span>
        </span>
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        {QUICK_QUESTIONS.map((q, i) => (
          <button
            key={i}
            disabled={loading}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-semibold text-slate-300 hover:text-white shrink-0 transition-all flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Lightbulb className="w-3 h-3 text-indigo-400" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 rounded-3xl p-6 bg-[#0d1322] border border-white/10 shadow-2xl overflow-y-auto space-y-4 text-xs">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] p-4 rounded-2xl leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-[#080c14] border border-white/10 text-slate-200'
              }`}
            >
              <MarkdownRenderer content={msg.content} />
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="p-3.5 rounded-2xl bg-[#080c14] border border-white/10 text-slate-400 flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Synthesizing response...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="flex-1">{error}</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Send Input */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything (e.g. explain dynamic programming memoization)..."
          disabled={loading}
          className="flex-1 bg-[#0d1322] border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xl disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg disabled:opacity-50 transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default AITutorView;
