import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  registerUser as apiRegisterUser,
  loginUser as apiLoginUser,
  fetchCurrentUser as apiFetchCurrentUser,
  getGoogleAuthUrl as apiGetGoogleAuthUrl,
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

      // 1. Check URL parameters for Google OAuth callback tokens or errors
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('auth_token');
      const authSuccess = urlParams.get('auth_success');
      const authError = urlParams.get('auth_error');

      if (urlToken) {
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
      } else {
        throw new Error(
          res?.message ||
            'Google OAuth is not configured on the server. Please check GOOGLE_CLIENT_ID in server/.env.'
        );
      }
    } catch (err) {
      console.error('Google OAuth URL error:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('padhai_auth_token');
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
