import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
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
import QuickLearnView from './features/quick-learn/QuickLearnView';
import GlobalAITutorButton from './features/ai-tutor/GlobalAITutorButton';
import { useAuth } from './features/auth/AuthContext';
import { checkHealth, fetchCourses, fetchSavedTopics } from './services/api';
import { BookOpen, ArrowRight, UserCheck, X } from 'lucide-react';

// Protected Route Component to enforce authentication
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, openAuthModal, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-slate-400 text-xs">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 sm:p-10 rounded-3xl bg-[#0d1322] border border-white/10 text-center space-y-4 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-white">Authentication Required</h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Please sign in or create an account to access this feature, track your progress, and save your courses.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => openAuthModal('login')}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
          >
            Sign In
          </button>
          <button
            onClick={() => openAuthModal('signup')}
            className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition-all"
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authNotification, clearAuthNotification, openAuthModal, isAuthenticated } = useAuth();

  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedCourses, setSavedCourses] = useState([]);
  const [savedTopics, setSavedTopics] = useState([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Production Clean-Slate: No fake mock courses. Start null until real course is selected/created.
  const [activeCourse, setActiveCourse] = useState(null);
  const [selectedLessonCoordinates, setSelectedLessonCoordinates] = useState({ modIdx: 0, lessIdx: 0 });

  // Map route pathname to sidebar ID
  const getCurrentViewId = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/learn')) return 'quick-learn';
    if (path === '/course-wizard') return 'my-learning';
    if (path === '/my-learning') return 'my-learning';
    if (path === '/lessons') return 'my-learning';
    if (path === '/planner') return 'planner';
    if (path === '/upload-material' || path === '/study-notes') return 'upload-material';
    if (path === '/ai-tutor') return 'ai-tutor';
    if (path === '/progress') return 'progress';
    if (path === '/settings') return 'settings';
    return 'home';
  };

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

  const loadSavedCoursesAndTopics = async () => {
    if (!isAuthenticated) {
      setSavedCourses([]);
      setSavedTopics([]);
      setActiveCourse(null);
      return;
    }

    try {
      const res = await fetchCourses();
      if (res?.courses && res.courses.length > 0) {
        setSavedCourses(res.courses);
        if (!activeCourse) {
          setActiveCourse(res.courses[0]);
        }
      }
    } catch (e) {
      console.warn('Could not fetch saved courses:', e.message);
    }

    try {
      const topicsRes = await fetchSavedTopics();
      if (topicsRes?.topics && topicsRes.topics.length > 0) {
        setSavedTopics(topicsRes.topics);
      }
    } catch (e) {
      console.warn('Could not fetch saved topics:', e.message);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  useEffect(() => {
    loadSavedCoursesAndTopics();
  }, [isAuthenticated]);

  const handleStartLearning = (outline, setupParams) => {
    const courseObj = {
      ...outline,
      setupParams: setupParams || outline.setupParams,
    };
    setActiveCourse(courseObj);
    navigate('/my-learning');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectLessonFromRoadmap = (modIdx, lessIdx) => {
    setSelectedLessonCoordinates({ modIdx, lessIdx });
    navigate('/lessons');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartQuickLearn = (topicName) => {
    navigate(`/learn/${encodeURIComponent(topicName)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSidebarNav = (viewId) => {
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    switch (viewId) {
      case 'home':
        navigate('/');
        break;
      case 'my-learning':
        navigate(activeCourse ? '/my-learning' : '/course-wizard');
        break;
      case 'planner':
        navigate('/planner');
        break;
      case 'upload-material':
        navigate('/upload-material');
        break;
      case 'ai-tutor':
        navigate('/ai-tutor');
        break;
      case 'progress':
        navigate('/progress');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#080c14] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Left Navigation Sidebar */}
      <Sidebar
        currentView={getCurrentViewId()}
        onSelectView={handleSidebarNav}
        activeCourse={activeCourse}
      />

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0b0f19] border-r border-white/10 z-50 shadow-2xl">
            <Sidebar
              isMobile={true}
              onClose={() => setMobileSidebarOpen(false)}
              currentView={getCurrentViewId()}
              onSelectView={handleSidebarNav}
              activeCourse={activeCourse}
            />
          </div>
        </div>
      )}

      {/* Right Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <Navbar
          activeCourse={activeCourse}
          currentView={getCurrentViewId()}
          onSwitchView={(v) => handleSidebarNav(v)}
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

        {/* Multi-Page Routes */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Routes>
            
            {/* 1. Home / Landing Hub */}
            <Route
              path="/"
              element={
                <div className="space-y-12">
                  <Hero
                    onStartQuickLearn={handleStartQuickLearn}
                    onCreateCourse={() => navigate('/course-wizard')}
                    onStudyNotes={() => navigate('/upload-material')}
                    activeCourse={activeCourse}
                    savedTopics={savedTopics}
                    savedCourses={savedCourses}
                    onSelectTopic={(t) => handleStartQuickLearn(t)}
                    onSelectCourse={(c) => {
                      setActiveCourse(c);
                      navigate('/my-learning');
                    }}
                  />
                </div>
              }
            />

            {/* 2. Quick Learn (Single Topic Learning View) */}
            <Route
              path="/learn/:topic"
              element={
                <QuickLearnView
                  onBack={() => navigate('/')}
                  onOpenTutor={() => {}}
                />
              }
            />

            {/* 3. Course Creation Wizard (Protected) */}
            <Route
              path="/course-wizard"
              element={
                <ProtectedRoute>
                  <CourseWizard
                    onCourseSaved={loadSavedCoursesAndTopics}
                    onStartLearning={handleStartLearning}
                  />
                </ProtectedRoute>
              }
            />

            {/* 4. Course Roadmap (Protected) */}
            <Route
              path="/my-learning"
              element={
                <ProtectedRoute>
                  <CourseRoadmap
                    course={activeCourse}
                    onSelectLesson={handleSelectLessonFromRoadmap}
                    onEditPlan={() => navigate('/course-wizard')}
                    onOpenStudyPlan={() => navigate('/planner')}
                    onOpenResources={() => navigate('/upload-material')}
                  />
                </ProtectedRoute>
              }
            />

            {/* 5. Lesson Viewer (Protected) */}
            <Route
              path="/lessons"
              element={
                <ProtectedRoute>
                  <LessonViewer
                    course={activeCourse}
                    initialModuleIndex={selectedLessonCoordinates.modIdx}
                    initialLessonIndex={selectedLessonCoordinates.lessIdx}
                    onBack={() => navigate('/my-learning')}
                    onNavigateView={(v) => handleSidebarNav(v)}
                  />
                </ProtectedRoute>
              }
            />

            {/* 6. Quiz Runner (Protected) */}
            <Route
              path="/quiz"
              element={
                <ProtectedRoute>
                  <QuizRunner
                    courseTopic={activeCourse?.topic || 'Computer Science'}
                    lessonTitle={activeCourse?.title || 'Core Fundamentals'}
                    onBack={() => navigate('/lessons')}
                  />
                </ProtectedRoute>
              }
            />

            {/* 7. Progress Dashboard (Protected) */}
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <ProgressDashboard
                    onContinueLearning={() => navigate(activeCourse ? '/lessons' : '/course-wizard')}
                  />
                </ProtectedRoute>
              }
            />

            {/* 8. Study Notes / Upload Material (Protected) */}
            <Route
              path="/upload-material"
              element={
                <ProtectedRoute>
                  <StudyMaterialAnalyzer />
                </ProtectedRoute>
              }
            />
            <Route
              path="/study-notes"
              element={<Navigate to="/upload-material" replace />}
            />

            {/* 9. Study Planner (Protected) */}
            <Route
              path="/planner"
              element={
                <ProtectedRoute>
                  <StudyPlanner
                    activeCourse={activeCourse}
                    onSelectTopic={(t) => handleStartQuickLearn(t)}
                    onCreateCourse={() => navigate('/course-wizard')}
                  />
                </ProtectedRoute>
              }
            />

            {/* 10. Standalone AI Tutor */}
            <Route
              path="/ai-tutor"
              element={<AITutorView />}
            />

            {/* 11. Settings View */}
            <Route
              path="/settings"
              element={<SettingsView />}
            />

            {/* Fallback */}
            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />

          </Routes>
        </main>
      </div>

      {/* Redesigned Floating AI Tutor Trigger (Modern Minimalist Obsidian Badge) */}
      <GlobalAITutorButton
        activeTopic={activeCourse?.topic || 'General Concepts'}
        activeLessonTitle={activeCourse?.title}
        learnerLevel={activeCourse?.level || 'Beginner'}
      />

    </div>
  );
}

export default App;
