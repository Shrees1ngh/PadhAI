import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, Sparkles, Check, ExternalLink, X, AlertCircle, ShieldCheck } from 'lucide-react';

export const ApiKeyModal = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('padhai_gemini_api_key') || '';
      setApiKey(stored);
      setSaved(false);
      setError(null);
    }
  }, [isOpen]);

  const handleSave = (e) => {
    e?.preventDefault();
    const cleanKey = apiKey.trim();
    if (!cleanKey) {
      localStorage.removeItem('padhai_gemini_api_key');
      setSaved(true);
      setTimeout(() => {
        if (onClose) onClose();
      }, 800);
      return;
    }

    if (cleanKey.length < 20) {
      setError('API key appears too short. Please verify your Gemini API key from Google AI Studio.');
      return;
    }

    localStorage.setItem('padhai_gemini_api_key', cleanKey);
    setSaved(true);
    setError(null);
    setTimeout(() => {
      if (onClose) onClose();
    }, 900);
  };

  const handleRemove = () => {
    localStorage.removeItem('padhai_gemini_api_key');
    setApiKey('');
    setSaved(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg bg-[#0b0f19] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Gemini API Key</h3>
            <p className="text-xs text-slate-400">Bring your own key for personal AI generations</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {saved && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>API key saved successfully! All requests will use your key.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-[#080c14] border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
              <span>Stored safely in your browser localStorage.</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center space-x-1"
              >
                <span>Get free key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            {apiKey ? (
              <button
                type="button"
                onClick={handleRemove}
                className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-bold transition-all"
              >
                Remove Key
              </button>
            ) : <div />}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Key</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ApiKeyModal;
