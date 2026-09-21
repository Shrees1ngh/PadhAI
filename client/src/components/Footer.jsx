import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-[#060910] py-12 mt-20 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center p-1.5 shadow-md shadow-cyan-500/10">
            <img src="/logo.svg" alt="PadhAI Logo" className="w-full h-full object-contain filter drop-shadow-[0_1px_4px_rgba(6,182,212,0.3)]" />
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="text-base font-black text-white tracking-tight">Padh<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">AI</span></span>
            <span className="text-slate-400">— AI-Powered Personal Learning Platform</span>
          </div>
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
