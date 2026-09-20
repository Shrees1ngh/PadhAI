import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-[#060910] py-12 mt-20 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">PadhAI</span>
          <span className="text-slate-400">— AI-Powered Personal Learning Platform</span>
        </div>

        <div className="flex items-center space-x-6">
          <span>React + Vite</span>
          <span>•</span>
          <span>Tailwind CSS</span>
          <span>•</span>
          <span>Node + Express</span>
          <span>•</span>
          <span>MongoDB</span>
          <span>•</span>
          <span>Gemini AI</span>
        </div>

        <div>
          © {new Date().getFullYear()} PadhAI. Ready for Next Generation Learning.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
