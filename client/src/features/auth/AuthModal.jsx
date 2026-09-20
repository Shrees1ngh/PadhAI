import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from './AuthContext';

export const AuthModal = () => {
  const {
    authModalOpen,
    authModalView,
    setAuthModalView,
    closeAuthModal,
    login,
    register,
    loginWithGoogle,
  } = useAuth();

  // Form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status state
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forgotPasswordSubmitted, setForgotPasswordSubmitted] = useState(false);

  if (!authModalOpen) return null;

  const resetFormState = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setForgotPasswordSubmitted(false);
  };

  const handleSwitchView = (newView) => {
    resetFormState();
    setAuthModalView(newView);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (authModalView === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter.');
        return;
      }

      try {
        setLoading(true);
        await register({ name: name.trim(), email: email.trim(), password });
        resetFormState();
      } catch (err) {
        setError(err.message || 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    } else if (authModalView === 'login') {
      if (!email.trim()) {
        setError('Please enter your email address.');
        return;
      }
      if (!password) {
        setError('Please enter your password.');
        return;
      }

      try {
        setLoading(true);
        await login({ email: email.trim(), password });
        resetFormState();
      } catch (err) {
        setError(err.message || 'Login failed. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    } else if (authModalView === 'forgot-password') {
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      setForgotPasswordSubmitted(true);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      setGoogleLoading(true);
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || 'Google authentication failed.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 border border-white/15 bg-[#0b101b] shadow-2xl relative overflow-hidden"
      >
        {/* Glow ambient background highlights */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 mx-auto mb-3">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {authModalView === 'signup'
              ? 'Create your PadhAI Account'
              : authModalView === 'forgot-password'
              ? 'Reset Your Password'
              : 'Welcome Back to PadhAI'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {authModalView === 'signup'
              ? 'Join thousands of learners mastering subjects with AI scaffolding'
              : authModalView === 'forgot-password'
              ? 'Enter your registered email to receive password reset guidance'
              : 'Sign in to access your personalized courses, quizzes & cheatsheets'}
          </p>
        </div>

        {/* View Switcher Tabs (Login vs Sign Up) */}
        {authModalView !== 'forgot-password' && (
          <div className="flex rounded-xl bg-slate-900/80 p-1 border border-white/5 mb-5">
            <button
              type="button"
              onClick={() => handleSwitchView('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authModalView === 'login'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleSwitchView('signup')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                authModalView === 'signup'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Continue Button */}
        {authModalView !== 'forgot-password' && (
          <>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2.5 disabled:opacity-70 active:scale-[0.99] mb-4"
            >
              {googleLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-700" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>

            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Or with Email
              </span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>
          </>
        )}

        {/* FORGOT PASSWORD NOTIFICATION */}
        {authModalView === 'forgot-password' && forgotPasswordSubmitted ? (
          <div className="py-4 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Reset Link Ready</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              If an account exists for <span className="text-cyan-300 font-semibold">{email}</span>, password reset instructions and security tokens have been dispatched.
            </p>
            <button
              type="button"
              onClick={() => handleSwitchView('login')}
              className="mt-4 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          /* AUTH FORM */
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Name Input (Sign up only) */}
            {authModalView === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#080c14] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="learner@padhai.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#080c14] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Input (Login and Sign up) */}
            {authModalView !== 'forgot-password' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    Password
                  </label>
                  {authModalView === 'login' && (
                    <button
                      type="button"
                      onClick={() => handleSwitchView('forgot-password')}
                      className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors font-medium"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#080c14] border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password (Sign up only) */}
            {authModalView === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#080c14] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Primary Submit CTA */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white shadow-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-400 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.99] mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {authModalView === 'signup'
                      ? 'Create Account'
                      : authModalView === 'forgot-password'
                      ? 'Send Reset Instructions'
                      : 'Sign In to PadhAI'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Footer switcher */}
            <div className="text-center pt-2">
              {authModalView === 'signup' ? (
                <p className="text-xs text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchView('login')}
                    className="text-purple-400 hover:text-purple-300 font-bold underline ml-1"
                  >
                    Sign In
                  </button>
                </p>
              ) : authModalView === 'login' ? (
                <p className="text-xs text-slate-400">
                  Don’t have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchView('signup')}
                    className="text-purple-400 hover:text-purple-300 font-bold underline ml-1"
                  >
                    Sign Up Free
                  </button>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSwitchView('login')}
                  className="text-xs text-slate-400 hover:text-white font-medium"
                >
                  ← Back to Sign In
                </button>
              )}
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default AuthModal;
