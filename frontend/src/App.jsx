import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CourseWizard from './features/courses/CourseWizard';
import CourseRoadmap from './features/courses/CourseRoadmap';
import CoursesDashboard from './features/courses/CoursesDashboard';
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
import ApiKeyModal from './components/ApiKeyModal';
import QuickLearnView from './features/quick-learn/QuickLearnView';
import GlobalAITutorButton from './features/ai-tutor/GlobalAITutorButton';
import SwipeToast from './components/SwipeToast/SwipeToast';
import { useAuth } from './features/auth/AuthContext';
import { checkHealth, fetchCourses, fetchSavedTopics } from './services/api';
import { BookOpen, ArrowRight, UserCheck, X, AlertCircle, CheckCircle2, Layers, Plus } from 'lucide-react';

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
      <div className="max-w-2xl mx-auto my-12 p-8 sm:p-10 rounded-md bg-[#161b22] border border-[#30363d] text-center space-y-4 shadow-2xl">
        <div className="w-10 h-10 rounded-md bg-[#1f6feb]/10 border border-[#1f6feb]/30 text-[#58a6ff] flex items-center justify-center mx-auto">
          <BookOpen className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-semibold text-[#e6edf3]">Authentication Required</h3>
        <p className="text-xs sm:text-sm text-[#8b949e] max-w-md mx-auto">
          Please sign in or create an account to access this feature, track your progress, and save your courses.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => openAuthModal('login')}
            className="px-5 py-2 rounded-md bg-[#1f6feb] hover:bg-[#388bfd] text-white text-xs font-semibold transition-colors border border-[rgba(240,246,252,0.1)]"
          >
            Sign In
          </button>
          <button
            onClick={() => openAuthModal('signup')}
            className="px-5 py-2 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#e6edf3] text-xs font-semibold transition-colors"
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// Route redirect for /signin and /signup links
const AuthRouteRedirect = ({ view = 'login' }) => {
  const { openAuthModal } = useAuth();
  useEffect(() => {
    openAuthModal(view);
  }, [view, openAuthModal]);
  return <Navigate to="/" replace />;
};

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, authNotification, clearAuthNotification, openAuthModal, isAuthenticated } = useAuth();

  const currentUserId = currentUser?._id || currentUser?.id || (isAuthenticated && currentUser?.email ? currentUser.email : null);

  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedCourses, setSavedCourses] = useState([]);
  const [coursesViewMode, setCoursesViewMode] = useState('dashboard'); // 'dashboard' | 'roadmap'
  const [savedTopics, setSavedTopics] = useState([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenApiKeyModal = () => setApiKeyModalOpen(true);
    window.addEventListener('open-api-key-modal', handleOpenApiKeyModal);
    return () => window.removeEventListener('open-api-key-modal', handleOpenApiKeyModal);
  }, []);

  // Global SwipeToast Notifications State
  const [activeToast, setActiveToast] = useState(null);

  useEffect(() => {
    if (authNotification) {
      setActiveToast({
        id: Date.now(),
        type: authNotification.type || 'info',
        title: authNotification.title || (authNotification.type === 'error' ? 'Notice' : 'Success'),
        description: authNotification.message,
        duration: 4500,
        fuseColor: authNotification.type === 'error' ? '#f43f5e' : '#10b981',
      });
    }
  }, [authNotification]);

  // Support global custom toast triggers across entire app via 'padhai-toast'
  useEffect(() => {
    window.showToast = (toast) => {
      window.dispatchEvent(new CustomEvent('padhai-toast', { detail: toast }));
    };

    const handleCustomToast = (e) => {
      if (e?.detail) {
        setActiveToast({
          id: Date.now(),
          type: e.detail.type || 'info',
          title: e.detail.title || 'Notification',
          description: e.detail.description || e.detail.message || '',
          actionLabel: e.detail.actionLabel,
          onAction: e.detail.onAction,
          duration: e.detail.duration || 4000,
          fuseColor: e.detail.fuseColor || (e.detail.type === 'error' ? '#f43f5e' : '#388bfd'),
        });
      }
    };
    window.addEventListener('padhai-toast', handleCustomToast);
    return () => window.removeEventListener('padhai-toast', handleCustomToast);
  }, []);

  // User-Scoped Course State Persistence
  const [activeCourse, setActiveCourseState] = useState(null);

  const setActiveCourse = (course) => {
    setActiveCourseState(course);
    if (currentUserId) {
      const userActiveKey = `padhai_active_course_${currentUserId}`;
      if (course) {
        try {
          localStorage.setItem(userActiveKey, JSON.stringify(course));
        } catch (e) {}
      } else {
        try {
          localStorage.removeItem(userActiveKey);
        } catch (e) {}
      }
    }
  };

  // Keep savedCourses in sync with activeCourse only if belongs to current user
  useEffect(() => {
    if (activeCourse && currentUserId) {
      setSavedCourses((prev) => {
        const idMatches = (c, target) =>
          (c._id && target._id && c._id === target._id) ||
          (c.id && target.id && c.id === target.id) ||
          (c.title && target.title && c.title === target.title);

        const exists = prev.some((c) => idMatches(c, activeCourse));
        if (!exists) {
          const updated = [activeCourse, ...prev];
          try {
            localStorage.setItem(`padhai_all_courses_${currentUserId}`, JSON.stringify(updated));
          } catch (e) {}
          return updated;
        }
        return prev;
      });
    }
  }, [activeCourse, currentUserId]);

  const [selectedLessonCoordinates, setSelectedLessonCoordinatesState] = useState(() => {
    try {
      const saved = localStorage.getItem('padhai_lesson_coords');
      return saved ? JSON.parse(saved) : { modIdx: 0, lessIdx: 0 };
    } catch {
      return { modIdx: 0, lessIdx: 0 };
    }
  });

  const setSelectedLessonCoordinates = (coords) => {
    setSelectedLessonCoordinatesState(coords);
    localStorage.setItem('padhai_lesson_coords', JSON.stringify(coords));
  };

  // Map route pathname to sidebar / breadcrumb ID
  const getCurrentViewId = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/learn')) return 'quick-learn';
    if (path === '/course-wizard') return 'course-wizard';
    if (path === '/my-learning') return 'my-learning';
    if (path === '/lessons') return 'lessons';
    if (path === '/quiz') return 'quiz';
    if (path === '/flashcards') return 'flashcards';
    if (path === '/cheatsheets') return 'cheatsheets';
    if (path === '/planner') return 'planner';
    if (path === '/upload-material' || path === '/study-notes') return 'upload-material';
    if (path === '/ai-tutor') return 'ai-tutor';
    if (path === '/progress') return 'progress';
    if (path === '/settings') return 'settings';
    return 'home';
  };

  // Multi-page Dynamic Browser Tab Title Sync
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      document.title = 'PadhAI • AI Learning Platform';
    } else if (path.startsWith('/learn/')) {
      const topicName = decodeURIComponent(path.replace('/learn/', ''));
      document.title = `PadhAI • Learn: ${topicName}`;
    } else if (path === '/my-learning') {
      document.title = activeCourse ? `PadhAI • ${activeCourse.title}` : 'PadhAI • My Courses';
    } else if (path === '/course-wizard') {
      document.title = 'PadhAI • Create AI Course';
    } else if (path === '/lessons') {
      document.title = 'PadhAI • Interactive Lesson Viewer';
    } else if (path === '/quiz') {
      document.title = 'PadhAI • Knowledge Check & Quiz';
    } else if (path === '/flashcards') {
      document.title = 'PadhAI • AI Flashcard Decks';
    } else if (path === '/cheatsheets') {
      document.title = 'PadhAI • Quick Revision Cheatsheets';
    } else if (path === '/upload-material' || path === '/study-notes') {
      document.title = 'PadhAI • Study Material Analyzer';
    } else if (path === '/planner') {
      document.title = 'PadhAI • Personalized Study Planner';
    } else if (path === '/progress') {
      document.title = 'PadhAI • Progress & Mastery Analytics';
    } else if (path === '/settings') {
      document.title = 'PadhAI • Account & API Settings';
    } else if (path === '/ai-tutor') {
      document.title = 'PadhAI • 24/7 AI Tutor';
    } else {
      document.title = 'PadhAI • AI-Powered Learning';
    }
  }, [location.pathname, activeCourse?.title]);

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

  const loadSavedCoursesAndTopics = async (uid = currentUserId) => {
    if (!isAuthenticated || !uid) {
      setSavedCourses([]);
      setActiveCourseState(null);
      setSavedTopics([]);
      return;
    }

    try {
      const res = await fetchCourses();
      if (res?.success) {
        const userCourses = Array.isArray(res.courses) ? res.courses : [];
        setSavedCourses(userCourses);

        const userCoursesKey = `padhai_all_courses_${uid}`;
        const userActiveKey = `padhai_active_course_${uid}`;

        try {
          localStorage.setItem(userCoursesKey, JSON.stringify(userCourses));
        } catch (e) {}

        if (userCourses.length === 0) {
          // New user has 0 courses! Reset activeCourse so other accounts don't leak
          setActiveCourseState(null);
          try {
            localStorage.removeItem(userActiveKey);
          } catch (e) {}
        } else {
          // If activeCourse is not among user's courses, set to first
          setActiveCourseState((prev) => {
            const matches = prev && userCourses.some(
              (c) =>
                (c._id && prev._id && c._id === prev._id) ||
                (c.id && prev.id && c.id === prev.id) ||
                (c.title && prev.title && c.title === prev.title)
            );
            const nextActive = matches ? prev : userCourses[0];
            try {
              localStorage.setItem(userActiveKey, JSON.stringify(nextActive));
            } catch (e) {}
            return nextActive;
          });
        }
      }
    } catch (e) {
      console.warn('Could not fetch saved courses:', e.message);
    }

    try {
      const topicsRes = await fetchSavedTopics();
      if (topicsRes?.topics && Array.isArray(topicsRes.topics)) {
        setSavedTopics(topicsRes.topics);
      }
    } catch (e) {
      console.warn('Could not fetch saved topics:', e.message);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  // When user switches or logs in/out, clear unscoped legacy keys and load this user's data
  useEffect(() => {
    // Purge legacy unscoped keys
    try {
      localStorage.removeItem('padhai_active_course');
      localStorage.removeItem('padhai_all_courses');
    } catch (e) {}

    if (!isAuthenticated || !currentUserId) {
      setSavedCourses([]);
      setActiveCourseState(null);
      setSavedTopics([]);
      setCoursesViewMode('dashboard');
      return;
    }

    // Try instant load from user-scoped storage cache while network request runs
    const userCoursesKey = `padhai_all_courses_${currentUserId}`;
    const userActiveKey = `padhai_active_course_${currentUserId}`;
    try {
      const cached = localStorage.getItem(userCoursesKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setSavedCourses(parsed);
          if (parsed.length === 0) {
            setActiveCourseState(null);
          } else {
            const cachedActive = localStorage.getItem(userActiveKey);
            setActiveCourseState(cachedActive ? JSON.parse(cachedActive) : parsed[0]);
          }
        }
      } else {
        setSavedCourses([]);
        setActiveCourseState(null);
      }
    } catch {
      setSavedCourses([]);
      setActiveCourseState(null);
    }

    try {
      const cachedTopics = localStorage.getItem(`padhai_saved_topics_${currentUserId}`);
      if (cachedTopics) {
        const parsed = JSON.parse(cachedTopics);
        if (Array.isArray(parsed)) setSavedTopics(parsed);
      }
    } catch {}

    loadSavedCoursesAndTopics(currentUserId);
  }, [currentUserId, isAuthenticated]);

  useEffect(() => {
    const handleTopicsUpdated = () => {
      if (currentUserId) {
        try {
          const cachedTopics = localStorage.getItem(`padhai_saved_topics_${currentUserId}`);
          if (cachedTopics) {
            const parsed = JSON.parse(cachedTopics);
            if (Array.isArray(parsed)) setSavedTopics(parsed);
          }
        } catch {}
      }
    };
    window.addEventListener('padhai_topics_updated', handleTopicsUpdated);
    return () => window.removeEventListener('padhai_topics_updated', handleTopicsUpdated);
  }, [currentUserId]);

  const handleStartLearning = (outline, setupParams) => {
    const courseObj = {
      ...outline,
      id: outline._id || outline.id || `course_${Date.now()}`,
      setupParams: setupParams || outline.setupParams,
    };
    setActiveCourse(courseObj);
    setSavedCourses((prev) => {
      const idMatches = (c, target) =>
        (c._id && target._id && c._id === target._id) ||
        (c.id && target.id && c.id === target.id) ||
        (c.title && target.title && c.title === target.title);

      const exists = prev.some((c) => idMatches(c, courseObj));
      const updated = exists
        ? prev.map((c) => (idMatches(c, courseObj) ? { ...c, ...courseObj } : c))
        : [courseObj, ...prev];
      if (currentUserId) {
        try {
          localStorage.setItem(`padhai_all_courses_${currentUserId}`, JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
    setCoursesViewMode('roadmap');
    navigate('/my-learning');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCourse = (courseId) => {
    setSavedCourses((prev) => {
      const updated = prev.filter((c) => (c._id || c.id) !== courseId && c.title !== courseId);
      if (currentUserId) {
        try {
          localStorage.setItem(`padhai_all_courses_${currentUserId}`, JSON.stringify(updated));
        } catch (e) {}
      }
      if (activeCourse && ((activeCourse._id || activeCourse.id) === courseId || activeCourse.title === courseId)) {
        const nextActive = updated.length > 0 ? updated[0] : null;
        setActiveCourse(nextActive);
      }
      return updated;
    });
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
      case 'quick-learn':
        navigate('/learn');
        break;
      case 'my-learning':
        setCoursesViewMode('dashboard');
        navigate('/my-learning');
        break;
      case 'course-wizard':
        navigate('/course-wizard');
        break;
      case 'lessons':
        navigate('/lessons');
        break;
      case 'quiz':
        navigate('/quiz');
        break;
      case 'flashcards':
        navigate('/flashcards');
        break;
      case 'cheatsheets':
        navigate('/cheatsheets');
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
    <div className="min-h-screen flex flex-col bg-[#0d1117] text-[#e6edf3]">
      
      {/* Top Header - Standalone Full-Width Navbar across entire top */}
      <Navbar
        currentView={getCurrentViewId()}
        onSwitchView={(v) => handleSidebarNav(v)}
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* React Bits SwipeToast Notification */}
      {activeToast && (
        <SwipeToast
          key={activeToast.id}
          open={true}
          onClose={() => {
            setActiveToast(null);
            clearAuthNotification();
          }}
          title={activeToast.title}
          description={activeToast.description}
          actionLabel={activeToast.actionLabel}
          onAction={activeToast.onAction}
          icon={
            activeToast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )
          }
          background="#161b22"
          color="#e6edf3"
          fuseColor={activeToast.fuseColor}
          width={380}
          radius={14}
          duration={activeToast.duration}
          closeButton={true}
          pauseOnHover={true}
          fuse="bottom"
        />
      )}

      {/* Page Body: Sidebar on Left, Content on Right */}
      <div className="flex-1 flex min-w-0 pt-[100px]">
        
        {/* Left Navigation Sidebar (Hidden on Home landing page so Navbar is perfectly centered like Hintify) */}
        {location.pathname !== '/' && (
          <Sidebar
            currentView={getCurrentViewId()}
            onSelectView={handleSidebarNav}
            activeCourse={activeCourse}
          />
        )}

        {/* Mobile Drawer Overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-[10050] flex md:hidden">
            <div 
              className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#0d1117] border-r border-[#21262d] z-[10051] shadow-2xl">
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

            {/* 2. Quick Learn (Single Topic Learning View & Search Hub) */}
            <Route
              path="/learn"
              element={
                <QuickLearnView
                  onBack={() => navigate('/')}
                  onOpenTutor={() => {}}
                />
              }
            />
            <Route
              path="/learn/:topic"
              element={
                <QuickLearnView
                  onBack={() => navigate('/')}
                  onOpenTutor={() => {}}
                />
              }
            />
            <Route
              path="/quick-learn"
              element={<Navigate to="/learn" replace />}
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

            {/* 4. Course Roadmap & Multi-Course Dashboard (Protected) */}
            <Route
              path="/my-learning"
              element={
                <ProtectedRoute>
                  <div className="space-y-4">
                    {/* View Switcher Bar when user has an active course */}
                    {activeCourse && (
                      <div className="flex items-center justify-between gap-3 pb-2 border-b border-[#30363d] flex-wrap">
                        <div className="flex items-center gap-1.5 p-1 bg-[#161b22] border border-[#30363d] rounded-xl shadow-inner">
                          <button
                            onClick={() => setCoursesViewMode('dashboard')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              coursesViewMode === 'dashboard'
                                ? 'bg-[#1f6feb] text-white shadow-sm'
                                : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
                            }`}
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>All Courses ({savedCourses.length})</span>
                          </button>
                          <button
                            onClick={() => setCoursesViewMode('roadmap')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all max-w-[220px] truncate cursor-pointer ${
                              coursesViewMode === 'roadmap'
                                ? 'bg-[#1f6feb] text-white shadow-sm'
                                : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
                            }`}
                          >
                            <BookOpen className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{activeCourse.title || 'Course Roadmap'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {coursesViewMode === 'dashboard' || !activeCourse ? (
                      <CoursesDashboard
                        courses={savedCourses}
                        activeCourse={activeCourse}
                        onSelectCourse={(course) => {
                          setActiveCourse(course);
                          setCoursesViewMode('roadmap');
                        }}
                        onResumeCourse={(course) => {
                          setActiveCourse(course);
                          navigate('/lessons');
                        }}
                        onResumeLesson={(course) => {
                          setActiveCourse(course);
                          navigate('/lessons');
                        }}
                        onCreateCourse={() => navigate('/course-wizard')}
                        onCreateNew={() => navigate('/course-wizard')}
                        onViewRoadmap={(course) => {
                          setActiveCourse(course);
                          setCoursesViewMode('roadmap');
                        }}
                        onDeleteCourse={handleDeleteCourse}
                      />
                    ) : (
                      <CourseRoadmap
                        course={activeCourse}
                        onSelectLesson={handleSelectLessonFromRoadmap}
                        onEditPlan={() => navigate('/course-wizard')}
                        onOpenStudyPlan={() => navigate('/planner')}
                        onOpenResources={() => navigate('/upload-material')}
                        onViewAllCourses={() => setCoursesViewMode('dashboard')}
                        onCreateCourse={() => navigate('/course-wizard')}
                      />
                    )}
                  </div>
                </ProtectedRoute>
              }
            />
            <Route path="/courses" element={<Navigate to="/my-learning" replace />} />

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

            {/* 7. Flashcards Page (Protected) */}
            <Route
              path="/flashcards"
              element={
                <ProtectedRoute>
                  <FlashcardDeck
                    courseTopic={activeCourse?.topic || ''}
                    lessonTitle={activeCourse?.title || ''}
                    currentLevel={activeCourse?.level || 'Beginner'}
                    courseId={activeCourse?._id || activeCourse?.id}
                    onBack={() => navigate('/my-learning')}
                  />
                </ProtectedRoute>
              }
            />

            {/* 8. Cheatsheets Page (Protected) */}
            <Route
              path="/cheatsheets"
              element={
                <ProtectedRoute>
                  <CheatsheetViewer
                    onBack={() => navigate('/my-learning')}
                  />
                </ProtectedRoute>
              }
            />

            {/* 9. Progress Dashboard (Protected) */}
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

            {/* Profile & Auth Route Aliases */}
            <Route
              path="/profile"
              element={<Navigate to="/progress" replace />}
            />
            <Route
              path="/signin"
              element={<AuthRouteRedirect view="login" />}
            />
            <Route
              path="/signup"
              element={<AuthRouteRedirect view="signup" />}
            />

            {/* Fallback */}
            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />

          </Routes>
        </main>
      </div>
    </div>

    {/* Redesigned Floating AI Tutor Trigger (Modern Minimalist Obsidian Badge) */}
    <GlobalAITutorButton
      activeTopic={activeCourse?.topic || 'General Concepts'}
      activeLessonTitle={activeCourse?.title}
      learnerLevel={activeCourse?.level || 'Beginner'}
    />

    {/* Global Authentication Modal */}
    <AuthModal />

    {/* Global BYOK Gemini API Key Modal */}
    <ApiKeyModal
      isOpen={apiKeyModalOpen}
      onClose={() => setApiKeyModalOpen(false)}
    />

  </div>
);
}

export default App;
