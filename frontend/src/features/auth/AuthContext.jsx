import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  registerUser as apiRegisterUser,
  loginUser as apiLoginUser,
  fetchCurrentUser as apiFetchCurrentUser,
  getGoogleAuthUrl as apiGetGoogleAuthUrl,
  exchangeAuthCode as apiExchangeAuthCode,
} from '../../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState('login'); // 'login' | 'signup' | 'forgot-password'
  const [authNotification, setAuthNotification] = useState(null); // { type: 'success' | 'error', message: string }

  // Load user from stored token or handle OAuth callback
  const initializeAuth = async () => {
    try {
      setLoading(true);

      // 1. Check URL parameters for Google OAuth callback code, tokens, or errors
      const urlParams = new URLSearchParams(window.location.search);
      const urlCode = urlParams.get('auth_code');
      const urlToken = urlParams.get('auth_token');
      const authSuccess = urlParams.get('auth_success');
      const authError = urlParams.get('auth_error');

      if (urlCode) {
        try {
          const exchangeRes = await apiExchangeAuthCode(urlCode);
          if (exchangeRes?.success && exchangeRes.token) {
            localStorage.setItem('padhai_auth_token', exchangeRes.token);
            if (exchangeRes.user) {
              setCurrentUser(exchangeRes.user);
            }
            if (authSuccess) {
              setAuthNotification({
                type: 'success',
                message: 'Signed in with Google successfully!',
              });
            }
          }
        } catch (exErr) {
          console.error('Failed to exchange OAuth code:', exErr);
          setAuthNotification({
            type: 'error',
            message: exErr.message || 'Failed to complete Google authentication.',
          });
        }
        // Clean URL parameters without reloading
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
      } else if (urlToken) {
        localStorage.setItem('padhai_auth_token', urlToken);
        // Clean URL parameters without reloading
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);

        if (authSuccess) {
          setAuthNotification({
            type: 'success',
            message: 'Signed in with Google successfully!',
          });
        }
      } else if (authError) {
        setAuthNotification({
          type: 'error',
          message: decodeURIComponent(authError),
        });
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
      }

      // 2. Fetch profile if token is present
      const storedToken = localStorage.getItem('padhai_auth_token');
      if (storedToken) {
        try {
          const res = await apiFetchCurrentUser();
          if (res?.success && res.user) {
            setCurrentUser(res.user);
          } else {
            localStorage.removeItem('padhai_auth_token');
            setCurrentUser(null);
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          localStorage.removeItem('padhai_auth_token');
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async ({ email, password }) => {
    const res = await apiLoginUser({ email, password });
    if (res?.success && res.token) {
      localStorage.setItem('padhai_auth_token', res.token);
      setCurrentUser(res.user);
      setAuthModalOpen(false);
      return res.user;
    }
    throw new Error(res?.message || 'Login failed');
  };

  const register = async ({ name, email, password }) => {
    const res = await apiRegisterUser({ name, email, password });
    if (res?.success && res.token) {
      localStorage.setItem('padhai_auth_token', res.token);
      setCurrentUser(res.user);
      setAuthModalOpen(false);
      return res.user;
    }
    throw new Error(res?.message || 'Registration failed');
  };

  const loginWithGoogle = async () => {
    try {
      const res = await apiGetGoogleAuthUrl();
      if (res?.success && res.url) {
        window.location.href = res.url;
        return;
      }
      throw new Error(
        res?.message ||
          'Google OAuth is not configured on the server. Please check GOOGLE_CLIENT_ID.'
      );
    } catch (err) {
      console.warn('API Google URL error, attempting direct backend redirect:', err);
      // Fallback: direct browser navigation to backend /api/auth/google
      const envUrl = import.meta.env.VITE_API_URL?.trim();
      const backendBase = envUrl ? envUrl.replace(/\/+$/, '') : '';
      const targetUrl = backendBase
        ? `${backendBase.endsWith('/api') ? backendBase : `${backendBase}/api`}/auth/google`
        : '/api/auth/google';
      window.location.href = targetUrl;
    }
  };

  const logout = () => {
    localStorage.removeItem('padhai_auth_token');
    localStorage.removeItem('padhai_active_course');
    localStorage.removeItem('padhai_all_courses');
    localStorage.removeItem('padhai_lesson_coords');
    setCurrentUser(null);
    setAuthNotification({
      type: 'success',
      message: 'You have been logged out successfully.',
    });
  };

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('padhai_auth_token');
    if (!storedToken) return null;

    try {
      const res = await apiFetchCurrentUser();
      if (res?.success && res.user) {
        setCurrentUser(res.user);
        return res.user;
      }
    } catch (e) {
      logout();
    }
    return null;
  };

  const openAuthModal = (view = 'login') => {
    setAuthModalView(view);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const clearAuthNotification = () => {
    setAuthNotification(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshUser,
        authModalOpen,
        authModalView,
        setAuthModalView,
        openAuthModal,
        closeAuthModal,
        authNotification,
        clearAuthNotification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
