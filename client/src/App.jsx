import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HealthStatusCard from './components/HealthStatusCard';
import CourseWizard from './features/courses/CourseWizard';
import CourseRoadmap from './features/courses/CourseRoadmap';
import LessonViewer from './features/lessons/LessonViewer';
import QuizRunner from './features/quizzes/QuizRunner';
import ProgressDashboard from './features/progress/ProgressDashboard';
import StudyMaterialAnalyzer from './features/study-materials/StudyMaterialAnalyzer';
import CheatsheetViewer from './features/cheatsheets/CheatsheetViewer';
import FlashcardDeck from './features/flashcards/FlashcardDeck';
import StudyPlanner from './features/planner/StudyPlanner';
import AITutorView from './features/ai-tutor/AITutorView';
import SettingsView from './features/settings/SettingsView';
import AuthModal from './features/auth/AuthModal';
import { useAuth } from './features/auth/AuthContext';
import { checkHealth, fetchCourses } from './services/api';
import { BookOpen, ArrowRight, UserCheck, X } from 'lucide-react';

export function App() {
  const { authNotification, clearAuthNotification, openAuthModal } = useAuth();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedCourses, setSavedCourses] = useState([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Active View State:
  // 'home' | 'course-wizard' | 'my-learning' | 'lessons' | 'quiz' | 'progress' | 'upload-material' | 'cheatsheet' | 'flashcards' | 'planner' | 'ai-tutor' | 'settings'
  const [currentView, setCurrentView] = useState('home');

  // Default sample active course (Data Structures and Algorithms)
  const [activeCourse, setActiveCourse] = useState({
    title: 'Data Structures and Algorithms',
    topic: 'Data Structures and Algorithms',
    level: 'Beginner',
    durationWeeks: 4,
    setupParams: {
      topic: 'Data Structures and Algorithms',
      currentLevel: 'Beginner',
      durationDays: 30,
      dailyStudyTime: '2 hours/day',
      learningGoal: 'Placement / Job Preparation',
    },
    modules: [
      {
        title: 'Fundamentals',
        lessons: [
          { title: 'Introduction to DSA', learningObjective: 'Understand basic data structures and asymptotic notation.' },
          { title: 'Time and Space Complexity', learningObjective: 'Calculate Big-O time and auxiliary memory.' },
          { title: 'Arrays & Memory Mechanics', learningObjective: 'Master contiguous memory layout and O(1) indexing.' },
          { title: 'Module Quiz: Fundamentals', learningObjective: 'Test core mastery of primitive collections.' },
        ],
      },
      {
        title: 'Linear Data Structures',
        lessons: [
          { title: 'Linked Lists (Singly & Doubly)', learningObjective: 'Implement node pointers and list traversals.' },
          { title: 'Stacks (LIFO)', learningObjective: 'Stack push/pop and monotonic stack patterns.' },
          { title: 'Queues & Deques', learningObjective: 'FIFO buffers and sliding window queues.' },
          { title: 'Deque & Circular Buffers', learningObjective: 'Double-ended queue operations.' },
          { title: 'Module Quiz: Linear Structures', learningObjective: 'Assess linear collection design.' },
        ],
      },
      {
        title: 'Non-Linear Data Structures',
        lessons: [
          { title: 'Binary Trees & Traversals', learningObjective: 'Pre-order, in-order, post-order recursive visits.' },
          { title: 'Binary Search Trees (BST)', learningObjective: 'Lookup and insertion invariants.' },
          { title: 'Heaps & Priority Queues', learningObjective: 'Min-heap and max-heap operations.' },
        ],
      },
      {
        title: 'Algorithms & Problem Solving',
        lessons: [
          { title: 'Sorting & Binary Search', learningObjective: 'MergeSort, QuickSort, and monotonic binary search.' },
          { title: 'Recursion & Backtracking', learningObjective: 'Call stacks and state rollback.' },
          { title: 'Dynamic Programming Foundations', learningObjective: 'Overlapping subproblems and memoization.' },
        ],
      },
    ],
  });

  const [selectedLessonCoordinates, setSelectedLessonCoordinates] = useState({ modIdx: 0, lessIdx: 2 });

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const data = await checkHealth();
      setHealth(data);
    } catch (err) {
      setError(err.message || 'Unable to connect to backend');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedCourses = async () => {
    try {
      const res = await fetchCourses();
      if (res?.courses && res.courses.length > 0) {
        setSavedCourses(res.courses);
        setActiveCourse(res.courses[0]);
      }
    } catch (e) {
      console.warn('Could not fetch saved courses:', e.message);
    }
  };

  useEffect(() => {
    fetchHealth();
    loadSavedCourses();
    const interval = setInterval(fetchHealth, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleStartLearning = (outline, setupParams) => {
    const courseObj = {
      ...outline,
      setupParams: setupParams || outline.setupParams,
    };
    setActiveCourse(courseObj);
    setCurrentView('my-learning');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectLessonFromRoadmap = (modIdx, lessIdx) => {
    setSelectedLessonCoordinates({ modIdx, lessIdx });
    setCurrentView('lessons');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex bg-[#080c14] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Left Navigation Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => {
          setCurrentView(v);
          setMobileSidebarOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        activeCourse={activeCourse}
      />

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0b0f19] border-r border-white/10 z-50">
            <Sidebar
              currentView={currentView}
              onSelectView={(v) => {
                setCurrentView(v);
                setMobileSidebarOpen(false);
              }}
              activeCourse={activeCourse}
            />
          </div>
        </div>
      )}

      {/* Right Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <Navbar
          health={health}
          onRefreshHealth={fetchHealth}
          isRefreshing={loading}
          activeCourse={activeCourse}
          currentView={currentView}
          onSwitchView={(v) => setCurrentView(v)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Global Notifications Banner */}
        {authNotification && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 w-full">
            <div
              className={`p-3 rounded-2xl flex items-center justify-between text-xs font-semibold border backdrop-blur-md shadow-lg ${
                authNotification.type === 'error'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 shrink-0" />
                <span>{authNotification.message}</span>
              </div>
              <button
                onClick={clearAuthNotification}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Global Authentication Modal */}
        <AuthModal />

        {/* Main Routed Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          
          {/* ======================================================== */}
          {/* 1. LANDING PAGE (SCREEN 1) */}
          {/* ======================================================== */}
          {currentView === 'home' && (
            <div className="space-y-12">
              <Hero
                onGetStarted={() => setCurrentView('course-wizard')}
                onWatchDemo={() => setCurrentView('my-learning')}
              />

              {/* Active Course Banner */}
              {activeCourse && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
                  <div className="rounded-3xl p-5 bg-[#0d1322] border border-indigo-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                          Active Course in Progress
                        </span>
                        <h4 className="text-sm sm:text-base font-bold text-white">
                          {activeCourse.title}
                        </h4>
                      </div>
                    </div>

                    <button
                      onClick={() => setCurrentView('my-learning')}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-2"
                    >
                      <span>Open Course Roadmap</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Diagnostics Card */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <HealthStatusCard
                  health={health}
                  loading={loading}
                  error={error}
                  onRefresh={fetchHealth}
                />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. CREATE LEARNING PLAN (SCREEN 2) */}
          {/* ======================================================== */}
          {currentView === 'course-wizard' && (
            <CourseWizard
              onCourseSaved={loadSavedCourses}
              onStartLearning={handleStartLearning}
            />
          )}

          {/* ======================================================== */}
          {/* 3. COURSE ROADMAP (SCREEN 3) */}
          {/* ======================================================== */}
          {currentView === 'my-learning' && (
            <CourseRoadmap
              course={activeCourse}
              onSelectLesson={handleSelectLessonFromRoadmap}
              onEditPlan={() => setCurrentView('course-wizard')}
              onOpenStudyPlan={() => setCurrentView('planner')}
              onOpenResources={() => setCurrentView('upload-material')}
            />
          )}

          {/* ======================================================== */}
          {/* 4. LESSON PAGE WITH DOCKED AI TUTOR (SCREEN 4) */}
          {/* ======================================================== */}
          {currentView === 'lessons' && (
            <LessonViewer
              course={activeCourse}
              initialModuleIndex={selectedLessonCoordinates.modIdx}
              initialLessonIndex={selectedLessonCoordinates.lessIdx}
              onBack={() => setCurrentView('my-learning')}
              onNavigateView={(v) => setCurrentView(v)}
            />
          )}

          {/* ======================================================== */}
          {/* 5. QUIZ PAGE (SCREEN 5) */}
          {/* ======================================================== */}
          {currentView === 'quiz' && (
            <QuizRunner
              courseTopic={activeCourse?.topic || 'Data Structures'}
              lessonTitle="Introduction to Arrays"
              onBack={() => setCurrentView('lessons')}
            />
          )}

          {/* ======================================================== */}
          {/* 6. PROGRESS DASHBOARD (SCREEN 6) */}
          {/* ======================================================== */}
          {currentView === 'progress' && (
            <ProgressDashboard
              onContinueLearning={() => setCurrentView('lessons')}
            />
          )}

          {/* ======================================================== */}
          {/* 7. UPLOAD MATERIAL / ANALYZER (SCREEN 7) */}
          {/* ======================================================== */}
          {currentView === 'upload-material' && (
            <StudyMaterialAnalyzer />
          )}

          {/* ======================================================== */}
          {/* 8. AI CHEATSHEET (SCREEN 8) */}
          {/* ======================================================== */}
          {currentView === 'cheatsheet' && (
            <CheatsheetViewer
              lessonTitle="Arrays"
              courseTopic={activeCourse?.topic || 'Data Structures'}
              onBack={() => setCurrentView('lessons')}
            />
          )}

          {/* ======================================================== */}
          {/* 9. FLASHCARDS (SCREEN 9) */}
          {/* ======================================================== */}
          {currentView === 'flashcards' && (
            <FlashcardDeck
              lessonTitle={activeCourse?.title || 'Data Structures and Algorithms'}
              onBack={() => setCurrentView('lessons')}
            />
          )}

          {/* ======================================================== */}
          {/* 10. AI STUDY PLANNER (SCREEN 10) */}
          {/* ======================================================== */}
          {currentView === 'planner' && (
            <StudyPlanner
              onSelectTopic={() => setCurrentView('lessons')}
            />
          )}

          {/* ======================================================== */}
          {/* STANDALONE 24/7 AI TUTOR */}
          {/* ======================================================== */}
          {currentView === 'ai-tutor' && (
            <AITutorView />
          )}

          {/* ======================================================== */}
          {/* PLATFORM SETTINGS */}
          {/* ======================================================== */}
          {currentView === 'settings' && (
            <SettingsView />
          )}

        </main>
      </div>

    </div>
  );
}

export default App;
