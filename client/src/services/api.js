import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('padhai_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for unified error extraction
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';
    const enhancedError = new Error(message);
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;
    enhancedError.code = error.response?.data?.code;
    enhancedError.mongoUnavailable = error.response?.data?.mongoUnavailable || false;
    return Promise.reject(enhancedError);
  }
);

export const checkHealth = async () => {
  return await api.get('/health');
};

export const generateCourseOutline = async (setupParams, apiKey) => {
  const headers = apiKey ? { 'x-gemini-key': apiKey } : {};
  return await api.post('/courses/generate-outline', setupParams, { headers });
};

export const modifyCourseOutline = async ({ currentOutline, modifications, setupParams }, apiKey) => {
  const headers = apiKey ? { 'x-gemini-key': apiKey } : {};
  return await api.post(
    '/courses/modify-outline',
    { currentOutline, modifications, setupParams },
    { headers }
  );
};

export const saveCourse = async ({ outline, setupParams }) => {
  return await api.post('/courses/save', { outline, setupParams });
};

export const fetchCourses = async () => {
  return await api.get('/courses');
};

export const generateLessonContent = async (payload, apiKey) => {
  const headers = apiKey ? { 'x-gemini-key': apiKey } : {};
  return await api.post('/lessons/generate', payload, { headers });
};

export const saveLessonContent = async (payload) => {
  return await api.post('/lessons/save', payload);
};

export const fetchLesson = async (courseId, moduleIndex, lessonIndex) => {
  return await api.get(`/lessons/${courseId}/${moduleIndex}/${lessonIndex}`);
};

export const toggleLessonComplete = async (courseId, moduleIndex, lessonIndex, completed) => {
  return await api.patch(`/lessons/${courseId}/${moduleIndex}/${lessonIndex}/complete`, { completed });
};

// ========================
// QUIZ GENERATOR SERVICES
// ========================

export const generateLessonQuiz = async (payload, apiKey) => {
  const headers = apiKey ? { 'x-gemini-key': apiKey } : {};
  return await api.post('/quizzes/generate', payload, { headers });
};

export const saveQuizAttempt = async (payload) => {
  return await api.post('/quizzes/save', payload);
};

export const fetchLessonQuiz = async (courseId, moduleIndex, lessonIndex) => {
  return await api.get(`/quizzes/${courseId}/${moduleIndex}/${lessonIndex}`);
};

// ==================================
// YOUTUBE LEARNING RESOURCES SERVICE
// ==================================

export const fetchRecommendedVideos = async ({
  courseTopic,
  moduleTitle,
  lessonTitle,
  learningObjective,
  q,
}) => {
  const params = {};
  if (courseTopic) params.courseTopic = courseTopic;
  if (moduleTitle) params.moduleTitle = moduleTitle;
  if (lessonTitle) params.lessonTitle = lessonTitle;
  if (learningObjective) params.learningObjective = learningObjective;
  if (q) params.q = q;

  return await api.get('/youtube/search', { params });
};

// ========================
// AI TUTOR CHAT SERVICE
// ========================

export const sendTutorChatMessage = async (payload, apiKey) => {
  const headers = apiKey ? { 'x-gemini-key': apiKey } : {};
  return await api.post('/ai-tutor/chat', payload, { headers });
};

export const chatWithAITutor = sendTutorChatMessage;

// ==================================
// STUDY MATERIAL ANALYZER SERVICE
// ==================================

export const analyzeStudyMaterial = async (formData, apiKey) => {
  const headers = {
    'Content-Type': 'multipart/form-data',
  };
  if (apiKey) {
    headers['x-gemini-key'] = apiKey;
  }
  return await api.post('/study-materials/analyze', formData, { headers });
};

// ==================================
// CHEATSHEETS API SERVICES
// ==================================

export const generateCheatsheet = async (payload, apiKey) => {
  const headers = apiKey ? { 'x-gemini-key': apiKey } : {};
  return await api.post('/cheatsheets/generate', payload, { headers });
};

export const saveCheatsheet = async (payload) => {
  return await api.post('/cheatsheets/save', payload);
};

export const fetchLessonCheatsheet = async (courseId, moduleIndex, lessonIndex) => {
  return await api.get(`/cheatsheets/${courseId}/${moduleIndex}/${lessonIndex}`);
};

// ==================================
// FLASHCARDS API SERVICES
// ==================================

export const generateFlashcards = async (payload, apiKey) => {
  const headers = apiKey ? { 'x-gemini-key': apiKey } : {};
  return await api.post('/flashcards/generate', payload, { headers });
};

export const saveFlashcards = async (payload) => {
  return await api.post('/flashcards/save', payload);
};

export const fetchLessonFlashcards = async (courseId, moduleIndex, lessonIndex) => {
  return await api.get(`/flashcards/${courseId}/${moduleIndex}/${lessonIndex}`);
};

// ==================================
// AUTHENTICATION API SERVICES
// ==================================

export const registerUser = async (payload) => {
  return await api.post('/auth/register', payload);
};

export const loginUser = async (payload) => {
  return await api.post('/auth/login', payload);
};

export const fetchCurrentUser = async () => {
  return await api.get('/auth/me');
};

export const getGoogleAuthUrl = async () => {
  return await api.get('/auth/google/url');
};

// ==================================
// PROGRESS TRACKING API SERVICES
// ==================================

export const fetchEnrolledCoursesProgress = async () => {
  return await api.get('/progress/enrolled-courses');
};

export const fetchCourseProgress = async (courseId) => {
  return await api.get(`/progress/${courseId}`);
};

export const completeTopicProgress = async ({ courseId, moduleIndex, lessonIndex }) => {
  return await api.post('/progress/complete-topic', { courseId, moduleIndex, lessonIndex });
};

export default api;
