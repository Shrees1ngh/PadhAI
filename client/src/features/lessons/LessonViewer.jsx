import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Bot,
  Send,
  Code2,
  FileText,
  HelpCircle,
  Award,
  Layers,
  ChevronRight,
  Check,
  Zap,
  Bookmark,
  Share2
} from 'lucide-react';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { generateLessonContent, chatWithAITutor } from '../../services/api';
import QuizRunner from '../quizzes/QuizRunner';
import CheatsheetViewer from '../cheatsheets/CheatsheetViewer';
import FlashcardDeck from '../flashcards/FlashcardDeck';

export const LessonViewer = ({
  course,
  initialModuleIndex = 0,
  initialLessonIndex = 0,
  onBack,
  onNavigateView
}) => {
  if (!course || !course.modules || course.modules.length === 0) {
    return (
      <div className="rounded-3xl p-10 bg-[#0d1322] border border-white/10 text-center max-w-xl mx-auto my-8">
        <BookOpen className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white">No Course Outline Loaded</h3>
        <p className="text-sm text-slate-400 mt-2">
          Please select or generate a course first from the Course Studio.
        </p>
        <button
          onClick={onBack}
          className="mt-6 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
        >
          Back to Course Studio
        </button>
      </div>
    );
  }

  const [activeModIdx, setActiveModIdx] = useState(initialModuleIndex);
  const [activeLessIdx, setActiveLessIdx] = useState(initialLessonIndex);
  const [activeTab, setActiveTab] = useState('lesson'); // 'lesson' | 'examples' | 'practice' | 'resources' | 'quiz' | 'cheatsheet' | 'flashcards'

  // Lesson cache
  const [lessonCache, setLessonCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Completed lessons tracking
  const [completedSet, setCompletedSet] = useState(new Set());

  // Docked AI Tutor State
  const [messages, setMessages] = useState([
    {
      role: 'user',
      content: 'Explain the difference between array and linked list in simple words.',
    },
    {
      role: 'assistant',
      content:
        'Sure! An array stores elements in contiguous memory locations and has a fixed size. You can access any element directly using an index (O(1) time).\n\nA linked list stores elements in nodes, where each node points to the next node. It has dynamic size and does not require contiguous memory.',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);
  const chatBottomRef = useRef(null);

  const currentModule = course.modules[activeModIdx] || course.modules[0];
  const currentLesson = currentModule?.lessons?.[activeLessIdx] || currentModule?.lessons?.[0];
  const cacheKey = `${activeModIdx}_${activeLessIdx}`;
  const lessonData = lessonCache[cacheKey];

  // Fetch lesson content from Gemini
  const fetchLesson = async () => {
    if (lessonCache[cacheKey]) return;

    setLoading(true);
    setError(null);

    const payload = {
      courseTitle: course.title || course.topic,
      courseTopic: course.topic,
      learnerLevel: course.level || course.setupParams?.currentLevel || 'Beginner',
      moduleIndex: activeModIdx,
      moduleTitle: currentModule?.title,
      lessonIndex: activeLessIdx,
      lessonTitle: currentLesson?.title,
      learningObjective: currentLesson?.learningObjective,
      keyTopics: currentLesson?.keyTopics || [],
    };

    try {
      const res = await generateLessonContent(payload);
      if (res?.success && res.lesson) {
        setLessonCache((prev) => ({ ...prev, [cacheKey]: res.lesson }));
      } else {
        throw new Error(res?.message || 'Failed to load lesson content.');
      }
    } catch (err) {
      console.warn('Lesson generation notice:', err);
      // Fallback structured content
      setLessonCache((prev) => ({
        ...prev,
        [cacheKey]: {
          title: currentLesson?.title || 'Lesson Overview',
          introduction: `An in-depth guide on ${currentLesson?.title}.`,
          sections: [
            {
              heading: 'Core Concepts',
              body: `Understanding ${currentLesson?.title} is fundamental to mastering ${course.topic}.`,
            },
          ],
          summary: 'Review key takeaways and test your knowledge with the practice quiz.',
          importantTakeaways: [
            'Understand basic memory layout and data access.',
            'Time and space complexity tradeoffs.',
          ],
        },
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson();
  }, [activeModIdx, activeLessIdx]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message to Docked AI Tutor
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputQuery.trim() || tutorLoading) return;

    const userText = inputQuery.trim();
    setInputQuery('');
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setTutorLoading(true);

    try {
      const res = await chatWithAITutor({
        message: userText,
        history: messages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        })),
        context: {
          courseTitle: course.title,
          lessonTitle: currentLesson?.title,
          learnerLevel: course.level || 'Beginner',
        },
      });

      if (res?.success && res.response) {
        setMessages((prev) => [...prev, { role: 'assistant', content: res.response }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              res?.message ||
              "I'm here to clarify concepts, review practice questions, or walk through code line-by-line!",
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Let me break that down for you: what specific part would you like to review first?',
        },
      ]);
    } finally {
      setTutorLoading(false);
    }
  };

  const handleNextLesson = () => {
    setCompletedSet((prev) => new Set(prev).add(cacheKey));
    if (activeLessIdx < currentModule.lessons.length - 1) {
      setActiveLessIdx(activeLessIdx + 1);
    } else if (activeModIdx < course.modules.length - 1) {
      setActiveModIdx(activeModIdx + 1);
      setActiveLessIdx(0);
    }
  };

  const handlePrevLesson = () => {
    if (activeLessIdx > 0) {
      setActiveLessIdx(activeLessIdx - 1);
    } else if (activeModIdx > 0) {
      const prevMod = course.modules[activeModIdx - 1];
      setActiveModIdx(activeModIdx - 1);
      setActiveLessIdx((prevMod.lessons?.length || 1) - 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-indigo-400 font-semibold mb-1 cursor-pointer" onClick={onBack}>
            <span>&lt; {course.topic || 'Data Structures'}</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-slate-300 font-bold">{currentLesson?.title || 'Lesson'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {currentLesson?.title || 'Introduction to Arrays'}
          </h1>
        </div>

        {/* Action switchers: Quiz, Cheatsheet, Flashcards */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('lesson')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'lesson'
                ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Lesson
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'quiz'
                ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Quiz
          </button>
          <button
            onClick={() => setActiveTab('cheatsheet')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'cheatsheet'
                ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Cheatsheet
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'flashcards'
                ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Flashcards
          </button>
        </div>
      </div>

      {/* Sub tabs: [Lesson] [Examples] [Practice] [Resources] */}
      {activeTab === 'lesson' && (
        <div className="flex items-center space-x-2 border-b border-white/5 pb-2">
          {['Lesson', 'Examples', 'Practice', 'Resources'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.toLowerCase()
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* VIEW: QUIZ */}
      {activeTab === 'quiz' && (
        <div className="mt-4">
          <QuizRunner
            courseTopic={course.topic}
            currentLevel={course.level}
            lessonTitle={currentLesson?.title}
            lessonContent={lessonData?.introduction || currentLesson?.title}
            onBack={() => setActiveTab('lesson')}
          />
        </div>
      )}

      {/* VIEW: CHEATSHEET */}
      {activeTab === 'cheatsheet' && (
        <div className="mt-4">
          <CheatsheetViewer
            lessonTitle={currentLesson?.title}
            lessonContent={lessonData?.introduction || currentLesson?.title}
            courseTopic={course.topic}
            currentLevel={course.level}
            onBack={() => setActiveTab('lesson')}
          />
        </div>
      )}

      {/* VIEW: FLASHCARDS */}
      {activeTab === 'flashcards' && (
        <div className="mt-4">
          <FlashcardDeck
            lessonTitle={currentLesson?.title}
            lessonContent={lessonData?.introduction || currentLesson?.title}
            courseTopic={course.topic}
            currentLevel={course.level}
            onBack={() => setActiveTab('lesson')}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* SCREEN 4: SPLIT 2-COLUMN VIEW (LESSON CONTENT + DOCKED AI TUTOR) */}
      {/* ======================================================== */}
      {(activeTab === 'lesson' || activeTab === 'examples' || activeTab === 'practice' || activeTab === 'resources') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Lesson Content (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl p-6 sm:p-8 bg-[#0d1322] border border-white/10 shadow-2xl space-y-6">
              
              {loading ? (
                <div className="py-16 text-center">
                  <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
                  <p className="text-xs text-slate-300 font-bold">Generating Structured Lesson...</p>
                </div>
              ) : (
                <>
                  {/* Definition / Introduction */}
                  <div>
                    <h3 className="text-base font-bold text-white mb-2">
                      What is an Array?
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                      {lessonData?.introduction ||
                        'An array is a linear data structure that stores elements of the same type in contiguous memory locations.'}
                    </p>
                  </div>

                  {/* Key Points */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2.5">
                      Key Points
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-300">
                      <li className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        <span>Fixed size</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        <span>Same data type</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        <span>Contiguous memory allocation</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        <span>Fast access using index (O(1) time complexity)</span>
                      </li>
                    </ul>
                  </div>

                  {/* Code Example Box */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-400">Example (C++)</span>
                      <span className="text-[10px] text-indigo-400 font-mono">syntax: standard</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#080c14] border border-white/10 font-mono text-xs text-slate-200 overflow-x-auto shadow-inner">
                      <pre className="text-indigo-300">
{`int arr[5] = {1, 2, 3, 4, 5};
cout << arr[0]; // 1
cout << arr[3]; // 4`}
                      </pre>
                    </div>
                  </div>

                  {/* Sections / Scaffolding if available */}
                  {lessonData?.sections?.map((sec, idx) => (
                    <div key={idx} className="pt-2 border-t border-white/5">
                      <h4 className="text-xs font-bold text-white mb-1.5">{sec.heading}</h4>
                      <div className="text-xs text-slate-300 leading-relaxed">
                        <MarkdownRenderer content={sec.body} />
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Bottom Lesson Navigation */}
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <button
                  onClick={handlePrevLesson}
                  disabled={activeModIdx === 0 && activeLessIdx === 0}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 text-xs font-bold text-slate-300 transition-all flex items-center space-x-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleNextLesson}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center space-x-2"
                >
                  <span>Next Lesson</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: Docked AI Tutor Panel (5 cols) */}
          <div className="lg:col-span-5 sticky top-20">
            <div className="rounded-3xl bg-[#0d1322] border border-white/10 shadow-2xl flex flex-col h-[580px] overflow-hidden">
              
              {/* AI Tutor Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#0b0f19]">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">AI Tutor</h3>
                    <span className="text-[10px] text-slate-400">Contextual Learning Assistant</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Online</span>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-[#080c14] border border-white/10 text-slate-200'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {tutorLoading && (
                  <div className="flex justify-start">
                    <div className="p-3 rounded-2xl bg-[#080c14] border border-white/10 text-slate-400 flex items-center space-x-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      <span className="text-[11px]">AI Tutor is typing...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Bottom Input Box */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-white/5 bg-[#0b0f19] flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 bg-[#080c14] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || tutorLoading}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default LessonViewer;
