import React, { useState } from 'react';
import { 
  Settings, 
  Key, 
  Shield, 
  User, 
  Check, 
  Sparkles, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Trash2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export const SettingsView = () => {
  const { currentUser, isAuthenticated, openAuthModal } = useAuth();
  const [apiKey, setApiKey] = useState(
    () => (typeof window !== 'undefined' ? localStorage.getItem('padhai_gemini_api_key') || '' : '')
  );
  const [showKey, setShowKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saved' | 'removed' | null

  const handleSaveKey = (e) => {
    e.preventDefault();
    const trimmed = apiKey.trim();
    if (!trimmed) {
      handleRemoveKey();
      return;
    }
    localStorage.setItem('padhai_gemini_api_key', trimmed);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api-key-updated'));
    }
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleRemoveKey = () => {
    localStorage.removeItem('padhai_gemini_api_key');
    setApiKey('');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api-key-updated'));
    }
    setSaveStatus('removed');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const isCustomKeyActive = Boolean(apiKey);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <span>Account & Platform Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure your personal Gemini AI API key, account details, and learning preferences.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Gemini API Key Configuration Section (Always accessible to all users & guests) */}
        <div className="rounded-3xl p-6 sm:p-8 bg-[#0d1322] border border-white/10 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Google Gemini API Key</span>
              </h3>
              <p className="text-xs text-slate-400">
                Add your personal Gemini API key. Stored locally in your browser — no account login required.
              </p>
            </div>

            {/* Status Pill */}
            <div className="shrink-0">
              {isCustomKeyActive ? (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Personal Key Active</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Default Server Key</span>
                </span>
              )}
            </div>
          </div>

          {/* Notification alert */}
          {saveStatus === 'saved' && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Gemini API Key successfully saved and activated in your browser!</span>
            </div>
          )}

          {saveStatus === 'removed' && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Custom API Key removed. Reverted to default server configuration.</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSaveKey} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Enter Gemini API Key</span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center space-x-1 text-xs font-semibold"
                >
                  <span>Get free key from Google AI Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </label>

              <div className="relative flex items-center">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-[#080c14] border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono pr-24"
                />
                
                <div className="absolute right-2 flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                    title={showKey ? 'Hide key' : 'Show key'}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>

                  {apiKey && (
                    <button
                      type="button"
                      onClick={handleRemoveKey}
                      className="p-2 text-rose-400 hover:text-rose-300 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Remove key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-xs text-slate-400">
                Saved securely in your browser's local storage and used directly for all AI generations.
              </p>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center space-x-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Key</span>
              </button>
            </div>
          </form>
        </div>

        {/* Account & Profile Card */}
        {isAuthenticated && currentUser ? (
          <div className="rounded-3xl p-6 bg-[#0d1322] border border-white/10 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span>Learner Profile</span>
            </h3>
            
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#080c14] border border-white/5">
              <div className="flex items-center space-x-3.5">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-indigo-400/40 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-base flex items-center justify-center shrink-0">
                    {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'U'}
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-white">{currentUser?.name}</p>
                  <p className="text-xs text-slate-400">{currentUser?.email}</p>
                  <span className="inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    {currentUser?.authProvider === 'google' ? 'Google Authenticated' : 'Registered Learner'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl p-6 bg-[#0d1322] border border-white/10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Browsing as Guest</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sign in or create an account to save your generated courses, quizzes, and sync progress across devices.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => openAuthModal('login')}
                className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SettingsView;
