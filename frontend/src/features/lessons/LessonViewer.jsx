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
  Share2,
  Download,
  Cpu
} from 'lucide-react';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { generateLessonContent, chatWithAITutor, completeTopicProgress, fetchCourseProgress } from '../../services/api';
import QuizRunner from '../quizzes/QuizRunner';
import CheatsheetViewer from '../cheatsheets/CheatsheetViewer';
import ActiveRecallSection from './ActiveRecallSection';
import VisualizerHost from '../visualizations/VisualizerHost';
import RecommendedVideos from '../youtube/RecommendedVideos';

export const LessonViewer = ({
  course,
  initialModuleIndex = 0,
  initialLessonIndex = 0,
  onBack,
  onNavigateView
}) => {
  const [activeModIdx, setActiveModIdx] = useState(initialModuleIndex);
  const [activeLessIdx, setActiveLessIdx] = useState(initialLessonIndex);
  const [activeTab, setActiveTab] = useState('lesson'); // 'lesson' | 'quiz' | 'cheatsheet'

  // Lesson cache
  const [lessonCache, setLessonCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Completed lessons tracking
  const [completedSet, setCompletedSet] = useState(new Set());
  const [markingComplete, setMarkingComplete] = useState(false);

  // Load existing persisted progress on mount / course change
  useEffect(() => {
    const loadProgress = async () => {
      const courseId = course?._id || course?.id;
      if (!courseId) return;

      try {
        const res = await fetchCourseProgress(courseId);
        if (res?.success && res.data?.completedLessons) {
          const set = new Set();
          res.data.completedLessons.forEach((l) => set.add(`${l.moduleIndex}_${l.lessonIndex}`));
          setCompletedSet(set);
        }
      } catch (err) {
        console.warn('Could not fetch course progress for viewer:', err.message);
      }
    };

    loadProgress();
  }, [course?._id, course?.id]);

  // Docked AI Tutor State
  const [messages, setMessages] = useState([
    {
      role: 'user',
      content: 'Can you explain the main idea of this lesson in simple words with intuition?',
    },
    {
      role: 'assistant',
      content:
        'Sure! I am your PadhAI Master Tutor. Ask me any doubt, request a real-world analogy, or ask me to break down complex code step-by-step!',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);
  const chatBottomRef = useRef(null);

  const modules = course?.modules || [];
  const currentModule = modules[activeModIdx] || modules[0];
  const currentLesson = currentModule?.lessons?.[activeLessIdx] || currentModule?.lessons?.[0];
  const cacheKey = `${activeModIdx}_${activeLessIdx}`;
  const lessonData = lessonCache[cacheKey];
  const isLessonCompleted = completedSet.has(cacheKey);

  // Derive active day information
  const currentDayInfo = React.useMemo(() => {
    if (!course?.days || course.days.length === 0) return null;
    for (const d of course.days) {
      const match = (d.lessons || []).some((l) => l.title === currentLesson?.title);
      if (match) return d;
    }
    return course.days[activeModIdx] || null;
  }, [course?.days, currentLesson?.title, activeModIdx]);

  // Fetch lesson content from Gemini
  const fetchLesson = async () => {
    if (!course || !course.modules || course.modules.length === 0) return;
    if (lessonCache[cacheKey]) return;

    setLoading(true);
    setError(null);

    const payload = {
      courseTitle: course.title || course.topic || '',
      courseTopic: course.topic || '',
      currentLevel: course.level || course.setupParams?.currentLevel || 'Beginner',
      moduleIndex: activeModIdx,
      moduleTitle: currentModule?.title || '',
      totalModules: modules.length || 4,
      lessonIndex: activeLessIdx,
      lessonTitle: currentLesson?.title || '',
      learningObjective: currentLesson?.learningObjective || '',
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
      console.warn('Lesson generation error:', err);
      setError(err.message || 'Failed to load lesson content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLesson();
  }, [cacheKey]);

  // Reset docked AI Tutor State on lesson change
  useEffect(() => {
    if (currentLesson?.title) {
      setMessages([
        {
          role: 'assistant',
          content: `👋 Hi! I'm your **PadhAI Tutor** for **${currentLesson.title}**${currentDayInfo ? ` (Day ${currentDayInfo.day})` : ''}.\n\nAsk me any doubt, request a real-world analogy, or ask me to break down tricky code step-by-step!`,
        },
      ]);
      setInputQuery('');
    }
  }, [cacheKey, currentLesson?.title, currentDayInfo?.day]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, tutorLoading]);

  // Send message to Docked AI Tutor
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputQuery.trim() || tutorLoading) return;

    const userText = inputQuery.trim();
    setInputQuery('');
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setTutorLoading(true);

    try {
      const historyForApi = messages
        .filter((m) => m.content)
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        }));

      const res = await chatWithAITutor({
        message: userText,
        courseTitle: course?.title || course?.topic || '',
        moduleTitle: currentModule?.title || '',
        lessonTitle: currentLesson?.title || '',
        learningObjective: currentLesson?.learningObjective || '',
        lessonContent: lessonData || {},
        learnerLevel: course?.level || course?.setupParams?.currentLevel || 'Beginner',
        conversationHistory: historyForApi.slice(-6),
      });

      if (res?.success && res.answer) {
        setMessages((prev) => [...prev, { role: 'assistant', content: res.answer }]);
      } else {
        throw new Error(res?.message || 'Failed to receive tutor response.');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ ${err.message || 'Failed to connect to AI Tutor. Please try again.'}`,
        },
      ]);
    } finally {
      setTutorLoading(false);
    }
  };

  const handleToggleComplete = async () => {
    const courseId = course?._id || course?.id;
    if (!courseId || markingComplete) return;

    setMarkingComplete(true);
    try {
      await completeTopicProgress({
        courseId,
        moduleIndex: activeModIdx,
        lessonIndex: activeLessIdx,
      });
      setCompletedSet((prev) => new Set(prev).add(cacheKey));
    } catch (err) {
      console.warn('Could not record lesson completion:', err.message);
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleNextLesson = () => {
    if (currentModule?.lessons && activeLessIdx < currentModule.lessons.length - 1) {
      setActiveLessIdx(activeLessIdx + 1);
    } else if (activeModIdx < modules.length - 1) {
      setActiveModIdx(activeModIdx + 1);
      setActiveLessIdx(0);
    }
  };

  const handlePrevLesson = () => {
    if (activeLessIdx > 0) {
      setActiveLessIdx(activeLessIdx - 1);
    } else if (activeModIdx > 0) {
      const prevMod = modules[activeModIdx - 1];
      setActiveModIdx(activeModIdx - 1);
      setActiveLessIdx((prevMod?.lessons?.length || 1) - 1);
    }
  };

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
          className="mt-6 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold min-h-[40px]"
        >
          Back to Course Studio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 text-sm text-indigo-400 font-semibold mb-1 cursor-pointer" onClick={onBack}>
            <span>&lt; {course.title || course.topic || 'Course Syllabus'}</span>
            <span className="text-slate-500">•</span>
            {currentDayInfo && (
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-sm">
                Day {currentDayInfo.day}
              </span>
            )}
            <span className="text-slate-500">&gt;</span>
            <span className="text-slate-300 font-bold truncate max-w-[200px]">{currentLesson?.title || 'Lesson'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {currentLesson?.title || 'Lesson Overview'}
          </h1>
        </div>

        {/* Action switchers: Quiz, Cheatsheet, Flashcards, PDF */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab('lesson')}
            className={`px-3 py-2 rounded-xl text-sm font-bold transition-all min-h-[36px] ${
              activeTab === 'lesson'
                ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Lesson
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-2 rounded-xl text-sm font-bold transition-all min-h-[36px] ${
              activeTab === 'quiz'
                ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Quiz
          </button>
          <button
            onClick={() => setActiveTab('cheatsheet')}
            className={`px-3 py-2 rounded-xl text-sm font-bold transition-all min-h-[36px] ${
              activeTab === 'cheatsheet'
                ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            Cheatsheet
          </button>
          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Export as PDF"
            aria-label="Export lesson as PDF"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* VIEW: QUIZ */}
      {activeTab === 'quiz' && (
        <div className="mt-4">
          <QuizRunner
            courseId={course._id || course.id || ''}
            moduleIndex={activeModIdx}
            lessonIndex={activeLessIdx}
            courseTopic={course.topic}
            currentLevel={course.level || course.setupParams?.currentLevel || 'Beginner'}
            lessonTitle={currentLesson?.title || ''}
            learningObjective={currentLesson?.learningObjective || ''}
            lessonContent={
              lessonData
                ? `${lessonData.introduction || ''}\n\n${lessonData.explanation || ''}\n\n${(lessonData.keyConcepts || []).join('\n')}`
                : (currentLesson?.learningObjective || currentLesson?.title || '')
            }
            onBack={() => setActiveTab('lesson')}
          />
        </div>
      )}

      {/* VIEW: CHEATSHEET */}
      {activeTab === 'cheatsheet' && (
        <div className="mt-4">
          <CheatsheetViewer
            courseId={course._id || course.id || ''}
            moduleIndex={activeModIdx}
            lessonIndex={activeLessIdx}
            lessonTitle={currentLesson?.title || ''}
            lessonContent={
              lessonData
                ? `${lessonData.introduction || ''}\n\n${lessonData.explanation || ''}\n\n${(lessonData.keyConcepts || []).join('\n')}`
                : (currentLesson?.learningObjective || currentLesson?.title || '')
            }
            courseTopic={course.topic}
            currentLevel={course.level || course.setupParams?.currentLevel || 'Beginner'}
            onBack={() => setActiveTab('lesson')}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* 2-COLUMN UNIFIED LESSON VIEW + DOCKED AI TUTOR */}
      {/* ======================================================== */}
      {activeTab === 'lesson' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Rich Lesson Content (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl p-5 sm:p-8 bg-[#0d1322] border border-white/10 shadow-2xl space-y-6">
              
              {loading ? (
                <div className="py-16 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                  <p className="text-sm text-slate-300 font-bold">Generating Structured Lesson Material...</p>
                </div>
              ) : error && !lessonData ? (
                <div className="py-16 text-center space-y-4">
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl max-w-md mx-auto text-red-300 text-sm">
                    {error}
                  </div>
                  <button
                    onClick={fetchLesson}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-md min-h-[40px]"
                  >
                    Retry Loading Lesson
                  </button>
                </div>
              ) : (
                <>
                  {/* Demo Mode Banner */}
                  {(lessonData?.isDemo || course?.isDemo) && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 font-bold uppercase text-sm">Demo Data</span>
                      <span>Lesson content generated in offline demo mode.</span>
                    </div>
                  )}

                  {/* Introduction */}
                  <div>
                    <h3 className="text-base font-bold text-white mb-2">
                      {currentLesson?.title}
                    </h3>
                    <div className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                      <MarkdownRenderer content={lessonData?.introduction || `Mastering ${currentLesson?.title} in ${course.topic}.`} />
                    </div>
                  </div>

                  {/* Core Explanation */}
                  {lessonData?.explanation && (
                    <div className="pt-3 border-t border-white/5 space-y-2">
                      <div className="text-sm sm:text-base text-slate-300 leading-relaxed">
                        <MarkdownRenderer content={lessonData.explanation} />
                      </div>
                    </div>
                  )}

                  {/* Key Concepts */}
                  {lessonData?.keyConcepts && lessonData.keyConcepts.length > 0 && (
                    <div className="pt-4 border-t border-white/5 space-y-3">
                      <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Core Invariants & Key Concepts</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {lessonData.keyConcepts.map((item, i) => (
                          <div key={i} className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start space-x-2 text-sm text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                            <div className="flex-1">
                              <MarkdownRenderer content={item} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Practical Examples / Walkthrough */}
                  {lessonData?.examples && lessonData.examples.length > 0 && (
                    <div className="pt-4 border-t border-white/5 space-y-3">
                      <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Practical Code & Step-by-Step Examples</span>
                      </h4>
                      <div className="space-y-3">
                        {lessonData.examples.map((ex, i) => (
                          <div key={i} className="p-4 rounded-2xl bg-[#080c14] border border-white/5 text-sm text-slate-300 space-y-2">
                            <MarkdownRenderer content={ex} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Real-World Industry Application */}
                  {lessonData?.realWorldApplication && (
                    <div className="pt-4 border-t border-white/5 space-y-2">
                      <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Real-World & Production Implementation</span>
                      </h4>
                      <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/15 text-sm text-slate-300 leading-relaxed">
                        <MarkdownRenderer content={lessonData.realWorldApplication} />
                      </div>
                    </div>
                  )}

                  {/* Common Pitfalls & Mistakes */}
                  {lessonData?.commonMistakes && lessonData.commonMistakes.length > 0 && (
                    <div className="pt-4 border-t border-white/5 space-y-3">
                      <h4 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Common Mistakes & Exam Pitfalls</span>
                      </h4>
                      <div className="space-y-2">
                        {lessonData.commonMistakes.map((m, i) => (
                          <div key={i} className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-200">
                            <MarkdownRenderer content={m} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Important Takeaways */}
                  {lessonData?.importantTakeaways && lessonData.importantTakeaways.length > 0 && (
                    <div className="pt-4 border-t border-white/5 space-y-3">
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 text-sm text-indigo-200 space-y-2">
                        <h5 className="font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-1.5">
                          <Award className="w-4 h-4 text-amber-400" />
                          <span>Topper's Key Takeaways</span>
                        </h5>
                        <ul className="space-y-1.5 pl-2">
                          {lessonData.importantTakeaways.map((t, i) => (
                            <li key={i} className="flex items-start space-x-2">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Interactive Visualizer Host if applicable to lesson */}
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <div className="flex items-center space-x-2 text-sm font-bold uppercase tracking-wider text-indigo-400">
                      <Cpu className="w-4 h-4" />
                      <span>Interactive Visualization</span>
                    </div>
                    <div className="overflow-hidden rounded-2xl">
                      <VisualizerHost
                        topic={currentLesson?.title || course.topic}
                      />
                    </div>
                  </div>

                  {/* Interactive In-Lesson Active Recall / Self-Check Q&A Cards */}
                  <ActiveRecallSection
                    lesson={lessonData}
                    lessonTitle={currentLesson?.title || course.topic}
                  />

                  {/* Recommended YouTube Videos for Lesson */}
                  <div className="pt-4 border-t border-white/5">
                    <RecommendedVideos
                      courseTopic={course.topic}
                      lessonTitle={currentLesson?.title}
                      learningObjective={currentLesson?.learningObjective}
                    />
                  </div>

                </>
              )}

              {/* Bottom Lesson Navigation */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-white/5">
                <button
                  onClick={handlePrevLesson}
                  disabled={activeModIdx === 0 && activeLessIdx === 0}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 border border-white/10 text-sm font-bold text-slate-300 transition-all flex items-center space-x-2 min-h-[44px]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleToggleComplete}
                  disabled={markingComplete}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 border min-h-[44px] ${
                    isLessonCompleted
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                      : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${isLessonCompleted ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>{isLessonCompleted ? 'Completed' : 'Mark as Completed'}</span>
                </button>

                <button
                  onClick={handleNextLesson}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center space-x-2 min-h-[44px]"
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
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">PadhAI Tutor</h3>
                    <span className="text-sm text-slate-400 truncate block">
                      Context: {currentLesson?.title}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Online</span>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-sm">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-[#080c14] border border-white/10 text-slate-200'
                      }`}
                    >
                      <MarkdownRenderer content={msg.content} />
                    </div>
                  </div>
                ))}
                {tutorLoading && (
                  <div className="flex justify-start">
                    <div className="p-3 rounded-2xl bg-[#080c14] border border-white/10 text-slate-400 flex items-center space-x-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      <span className="text-sm">AI Tutor is typing...</span>
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
                  placeholder="Ask anything about this lesson..."
                  className="flex-1 bg-[#080c14] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors min-h-[40px]"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || tutorLoading}
                  aria-label="Send query to AI Tutor"
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-md min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
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
