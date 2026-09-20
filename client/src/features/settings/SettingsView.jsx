import React, { useState } from 'react';
import { Settings, Key, Shield, User, Bell, Check, Database, Sparkles } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export const SettingsView = () => {
  const { currentUser, isAuthenticated, openAuthModal } = useAuth();
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem('padhai_gemini_key') || ''
  );
  const [saved, setSaved] = useState(false);

  const handleSaveKey = (e) => {
    e.preventDefault();
    localStorage.setItem('padhai_gemini_key', apiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-3xl p-6 sm:p-8 bg-[#0d1322] border border-white/10 shadow-2xl space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <Settings className="w-5 h-5 text-indigo-400" />
            <span>Platform Settings</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your AI model configurations, account preferences, and persistence settings.
          </p>
        </div>

        {/* Account Status Card */}
        <div className="p-5 rounded-2xl bg-[#080c14] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-indigo-400" />
              <div>
                <h4 className="text-xs font-bold text-white">Account Status</h4>
                <p className="text-[11px] text-slate-400">
                  {isAuthenticated && currentUser ? `Logged in as ${currentUser.name} (${currentUser.email})` : 'Guest Session (Local Mode)'}
                </p>
              </div>
            </div>
            {!isAuthenticated && (
              <button
                onClick={() => openAuthModal('signup')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>

        {/* Optional Custom Gemini API Key */}
        <form onSubmit={handleSaveKey} className="p-5 rounded-2xl bg-[#080c14] border border-white/5 space-y-3">
          <div className="flex items-center space-x-3">
            <Key className="w-5 h-5 text-amber-400" />
            <div>
              <h4 className="text-xs font-bold text-white">Custom Gemini API Key (Optional)</h4>
              <p className="text-[11px] text-slate-400">
                Override server API key with your own Google AI Studio key for higher rate limits.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="flex-1 bg-[#0b0f19] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              {saved ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{saved ? 'Saved' : 'Save Key'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default SettingsView;
