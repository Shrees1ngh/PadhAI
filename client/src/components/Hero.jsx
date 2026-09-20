import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Play, 
  GraduationCap, 
  Bot, 
  FileCode, 
  FileText, 
  BarChart3, 
  ArrowRight,
  CheckCircle2,
  Users,
  Award,
  Layers,
  Clock
} from 'lucide-react';
import heroLearnerImg from '../assets/hero-learner.jpg';

export const Hero = ({ onGetStarted, onWatchDemo }) => {
  return (
    <section className="relative pt-6 pb-16 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left z-10">
            
            {/* Top pill badge */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-xs font-semibold text-indigo-300"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>✦ Your AI-powered personal learning companion</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]"
            >
              Learn Smarter <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                Not Harder
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal"
            >
              Get personalized courses, AI-generated lessons, quizzes, cheatsheets and a 24/7 AI tutor — all in one place.
            </motion.p>

            {/* CTA Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <button
                onClick={onGetStarted}
                className="px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center space-x-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onWatchDemo}
                className="px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center space-x-2.5 backdrop-blur-md"
              >
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <Play className="w-3 h-3 fill-white text-white ml-0.5" />
                </div>
                <span>Watch Demo</span>
              </button>
            </motion.div>
          </div>

          {/* Right Column: Hero Visual with Floating Feature Badges */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            
            {/* Card Graphic Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative w-full max-w-[460px] aspect-square rounded-3xl p-3 bg-gradient-to-b from-white/10 via-white/5 to-transparent border border-white/10 shadow-2xl backdrop-blur-md overflow-hidden group"
            >
              <img 
                src={heroLearnerImg} 
                alt="AI Student Learning" 
                className="w-full h-full object-cover rounded-2xl brightness-95 contrast-105 group-hover:scale-105 transition-transform duration-700"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080c14]/90 via-transparent to-transparent pointer-events-none" />

              {/* Floating Pill 1: Personalized Learning (Top Right) */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute top-6 right-6 px-3 py-1.5 rounded-xl bg-[#0e1424]/90 border border-indigo-500/40 backdrop-blur-md text-xs font-bold text-white shadow-lg flex items-center space-x-2"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px]">Personalized Learning</span>
              </motion.div>

              {/* Floating Pill 2: AI Tutor 24/7 (Top Right lower) */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute top-20 -right-2 px-3 py-1.5 rounded-xl bg-[#0e1424]/90 border border-rose-500/40 backdrop-blur-md text-xs font-bold text-white shadow-lg flex items-center space-x-2"
              >
                <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px]">AI Tutor 24/7</span>
              </motion.div>

              {/* Floating Pill 3: Quizzes & Practice (Left middle) */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute top-28 -left-2 px-3 py-1.5 rounded-xl bg-[#0e1424]/90 border border-cyan-500/40 backdrop-blur-md text-xs font-bold text-white shadow-lg flex items-center space-x-2"
              >
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <FileCode className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px]">Quizzes & Practice</span>
              </motion.div>

              {/* Floating Pill 4: Cheatsheets (Right bottom) */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="absolute bottom-20 right-4 px-3 py-1.5 rounded-xl bg-[#0e1424]/90 border border-emerald-500/40 backdrop-blur-md text-xs font-bold text-white shadow-lg flex items-center space-x-2"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px]">Cheatsheets</span>
              </motion.div>

              {/* Floating Pill 5: Progress Tracking (Left bottom) */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute bottom-10 left-4 px-3 py-1.5 rounded-xl bg-[#0e1424]/90 border border-purple-500/40 backdrop-blur-md text-xs font-bold text-white shadow-lg flex items-center space-x-2"
              >
                <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px]">Progress Tracking</span>
              </motion.div>

              {/* Handwritten Note caption */}
              <div className="absolute top-1/2 right-6 -rotate-12 pointer-events-none">
                <span className="text-xs font-bold italic tracking-wide text-purple-300 drop-shadow-md">
                  ~ Better You Everyday ✦
                </span>
              </div>
            </motion.div>
          </div>

        </div>

        {/* Bottom Metrics Bar (Screen 1 Footer Stats) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm"
        >
          <div className="text-center sm:text-left sm:pl-4 sm:border-r border-white/5">
            <p className="text-2xl sm:text-3xl font-black text-white">10K+</p>
            <p className="text-xs text-slate-400 font-medium">Learners</p>
          </div>
          <div className="text-center sm:text-left sm:pl-4 sm:border-r border-white/5">
            <p className="text-2xl sm:text-3xl font-black text-indigo-400">95%</p>
            <p className="text-xs text-slate-400 font-medium">Satisfaction</p>
          </div>
          <div className="text-center sm:text-left sm:pl-4 sm:border-r border-white/5">
            <p className="text-2xl sm:text-3xl font-black text-cyan-400">100+</p>
            <p className="text-xs text-slate-400 font-medium">Topics</p>
          </div>
          <div className="text-center sm:text-left sm:pl-4">
            <p className="text-2xl sm:text-3xl font-black text-purple-400">24/7</p>
            <p className="text-xs text-slate-400 font-medium">AI Tutor</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
