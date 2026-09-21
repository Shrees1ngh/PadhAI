import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Printer,
  Edit2,
  Copy,
  Check,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Code2,
  Table,
  CheckCircle2,
  RefreshCw,
  Save,
  BookOpen,
  HelpCircle,
  AlertCircle,
  Star,
  GraduationCap,
  Layers,
  Zap,
  Tag,
  Search,
  TrendingUp,
  Terminal,
  Calculator,
  Scale,
  Atom,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { generateCheatsheet, saveCheatsheet } from '../../services/api';
import MarkdownRenderer from '../../components/MarkdownRenderer';

const BADGE_COLORS = [
  { border: 'border-rose-500/40', bg: 'bg-rose-500/10', text: 'text-rose-400', lightBorder: 'border-rose-300', lightHeader: 'text-rose-700', lightBg: 'bg-rose-50/70', badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  { border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', text: 'text-emerald-400', lightBorder: 'border-emerald-300', lightHeader: 'text-emerald-700', lightBg: 'bg-emerald-50/70', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  { border: 'border-cyan-500/40', bg: 'bg-cyan-500/10', text: 'text-cyan-400', lightBorder: 'border-cyan-300', lightHeader: 'text-cyan-700', lightBg: 'bg-cyan-50/70', badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  { border: 'border-amber-500/40', bg: 'bg-amber-500/10', text: 'text-amber-400', lightBorder: 'border-amber-300', lightHeader: 'text-amber-700', lightBg: 'bg-amber-50/70', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  { border: 'border-indigo-500/40', bg: 'bg-indigo-500/10', text: 'text-indigo-400', lightBorder: 'border-indigo-300', lightHeader: 'text-indigo-700', lightBg: 'bg-indigo-50/70', badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
  { border: 'border-purple-500/40', bg: 'bg-purple-500/10', text: 'text-purple-400', lightBorder: 'border-purple-300', lightHeader: 'text-purple-700', lightBg: 'bg-purple-50/70', badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  { border: 'border-blue-500/40', bg: 'bg-blue-500/10', text: 'text-blue-400', lightBorder: 'border-blue-300', lightHeader: 'text-blue-700', lightBg: 'bg-blue-50/70', badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  { border: 'border-teal-500/40', bg: 'bg-teal-500/10', text: 'text-teal-400', lightBorder: 'border-teal-300', lightHeader: 'text-teal-700', lightBg: 'bg-teal-50/70', badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30' },
];

const PRESET_TOPICS = [
  { label: 'Marginal Utility & Consumer Equilibrium', domain: 'economics', icon: TrendingUp, category: 'Economics' },
  { label: 'Supply & Demand Price Elasticity', domain: 'economics', icon: TrendingUp, category: 'Economics' },
  { label: 'Binary Search Trees & Balancing', domain: 'cs', icon: Terminal, category: 'CS & DSA' },
  { label: 'Dynamic Programming & Memoization', domain: 'cs', icon: Terminal, category: 'CS & DSA' },
  { label: 'Calculus: Derivatives & Integrals', domain: 'math', icon: Calculator, category: 'Math & Science' },
  { label: 'Thermodynamics Laws & Entropy', domain: 'science', icon: Atom, category: 'Science' },
  { label: 'Fundamental Rights & Articles (Constitution)', domain: 'law', icon: Scale, category: 'Law & Civics' },
];

export const CheatsheetViewer = ({
  lessonTitle = 'Marginal Utility & Consumer Equilibrium',
  lessonContent = '',
  courseTopic = '',
  currentLevel = 'Beginner',
  courseId = '',
  moduleIndex = 0,
  lessonIndex = 0,
  sourceType = 'lesson',
  onBack,
}) => {
  const [activeTopic, setActiveTopic] = useState(lessonTitle || courseTopic || 'Marginal Utility & Consumer Equilibrium');
  const [activeContext, setActiveContext] = useState(courseTopic || '');
  const [activeLevel, setActiveLevel] = useState(currentLevel || 'Beginner');
  const [customInput, setCustomInput] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [cheatsheet, setCheatsheet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [styleMode, setStyleMode] = useState('paper'); // 'paper' | 'dark'
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [saveMessage, setSaveMessage] = useState(null);

  const fetchCheatsheetData = useCallback(async (overrideTopic, overrideContext) => {
    const topicToUse = overrideTopic || activeTopic;
    if (!topicToUse) return;

    setLoading(true);
    setError(null);
    setSaveStatus(null);
    setSaveMessage(null);

    try {
      const res = await generateCheatsheet({
        lessonTitle: topicToUse,
        lessonContent: typeof lessonContent === 'object' ? JSON.stringify(lessonContent) : (lessonContent || topicToUse),
        courseTopic: overrideContext !== undefined ? overrideContext : activeContext,
        currentLevel: activeLevel || 'Beginner',
        courseId: courseId || undefined,
        moduleIndex: moduleIndex !== undefined ? moduleIndex : undefined,
        lessonIndex: lessonIndex !== undefined ? lessonIndex : undefined,
        sourceType: sourceType || 'lesson',
      });

      if (res?.success && res.cheatsheet) {
        setCheatsheet(res.cheatsheet);
      } else {
        throw new Error(res?.message || "Couldn't generate cheatsheet right now.");
      }
    } catch (err) {
      console.error('Cheatsheet generation error:', err);
      setError(err?.message || "Couldn't generate cheatsheet right now.");
      setCheatsheet(null);
    } finally {
      setLoading(false);
    }
  }, [activeTopic, activeContext, activeLevel, lessonContent, courseId, moduleIndex, lessonIndex, sourceType]);

  useEffect(() => {
    if (lessonTitle) {
      setActiveTopic(lessonTitle);
      fetchCheatsheetData(lessonTitle, courseTopic);
    }
  }, [lessonTitle, courseTopic]);

  const handleCustomTopicSubmit = (e) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const newTopic = customInput.trim();
    setActiveTopic(newTopic);
    fetchCheatsheetData(newTopic, '');
  };

  const handleSelectPreset = (preset) => {
    setActiveTopic(preset.label);
    setCustomInput(preset.label);
    fetchCheatsheetData(preset.label, preset.category);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = async () => {
    if (!cheatsheet) return;

    let textToCopy = `# ${cheatsheet.unitNumber || 'UNIT'} CHEATSHEET: ${cheatsheet.title || activeTopic}\n\n`;
    if (cheatsheet.overview) {
      textToCopy += `## Overview\n${cheatsheet.overview}\n\n`;
    }

    if (cheatsheet.cards && cheatsheet.cards.length > 0) {
      cheatsheet.cards.forEach((c) => {
        textToCopy += `### ${c.number || ''}. ${c.title} (${c.categoryType || 'Concept'})\n`;
        if (c.definition) textToCopy += `${c.definition}\n\n`;
        if (c.bulletPoints && c.bulletPoints.length > 0) {
          c.bulletPoints.forEach((b) => { textToCopy += `- ${b}\n`; });
          textToCopy += `\n`;
        }
        if (c.formula) textToCopy += `**Formula:** ${c.formula}\n\n`;
        if (c.codeSnippet) textToCopy += `\`\`\`${c.codeLanguage || ''}\n${c.codeSnippet}\n\`\`\`\n\n`;
        if (c.example) textToCopy += `*Real-World Example:* ${c.example}\n\n`;
        if (c.visualDiagram) textToCopy += `\`\`\`\n${c.visualDiagram}\n\`\`\`\n\n`;
        if (c.examTip) textToCopy += `> **Exam Tip:** ${c.examTip}\n\n`;
      });
    }

    if (cheatsheet.quickRevisionPoints && cheatsheet.quickRevisionPoints.length > 0) {
      textToCopy += `## Quick Revision Checklist\n`;
      cheatsheet.quickRevisionPoints.forEach((p) => { textToCopy += `✓ ${p}\n`; });
      textToCopy += `\n`;
    }

    if (cheatsheet.examPoints && cheatsheet.examPoints.length > 0) {
      textToCopy += `## Important Exam & Interview Questions\n`;
      cheatsheet.examPoints.forEach((q) => { textToCopy += `- ${q}\n`; });
      textToCopy += `\n`;
    }

    if (cheatsheet.topperTip) {
      textToCopy += `## Topper's Strategy Tip\n${cheatsheet.topperTip}\n`;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleSave = async () => {
    if (!cheatsheet || saving) return;
    setSaving(true);
    setSaveStatus(null);
    setSaveMessage(null);

    try {
      const res = await saveCheatsheet({
        courseId: courseId || undefined,
        moduleIndex: moduleIndex !== undefined ? moduleIndex : undefined,
        lessonIndex: lessonIndex !== undefined ? lessonIndex : undefined,
        lessonTitle: activeTopic || cheatsheet.title || 'Revision Cheatsheet',
        sourceType: sourceType || 'lesson',
        cheatsheet,
      });

      if (res?.success) {
        setSaveStatus('saved');
        setSaveMessage('Cheatsheet saved successfully to MongoDB Atlas!');
      } else {
        throw new Error(res?.message || 'Failed to save cheatsheet.');
      }
    } catch (err) {
      setSaveStatus('error');
      setSaveMessage(err?.message || 'Failed to save cheatsheet.');
    } finally {
      setSaving(false);
    }
  };

  // Process cards
  const cardsToRender = React.useMemo(() => {
    if (cheatsheet?.cards && cheatsheet.cards.length > 0) {
      return cheatsheet.cards;
    }
    const synthetic = [];
    let count = 1;

    (cheatsheet?.keyConcepts || []).forEach((c) => {
      synthetic.push({
        number: count++,
        title: c.concept || 'Core Concept',
        definition: c.explanation || '',
        bulletPoints: [],
        categoryType: 'Concept',
      });
    });

    (cheatsheet?.definitions || []).forEach((d) => {
      synthetic.push({
        number: count++,
        title: d.term || 'Definition',
        definition: d.definition || '',
        bulletPoints: [],
        categoryType: 'Definition',
      });
    });

    (cheatsheet?.formulas || []).forEach((f) => {
      synthetic.push({
        number: count++,
        title: f.name || 'Formula / Rule',
        definition: f.explanation || '',
        formula: f.formula,
        bulletPoints: [],
        categoryType: 'Formula',
      });
    });

    (cheatsheet?.examples || []).forEach((e) => {
      synthetic.push({
        number: count++,
        title: e.topic || 'Practical Example',
        definition: e.explanation || '',
        example: e.example || '',
        bulletPoints: [],
        categoryType: 'Example',
      });
    });

    return synthetic;
  }, [cheatsheet]);

  const isPaper = styleMode === 'paper';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* ======================================================== */}
      {/* TOP BAR: ACTION BAR & TOPIC PICKER */}
      {/* ======================================================== */}
      <div className="bg-[#0b0f19] border border-white/10 rounded-3xl p-5 shadow-2xl print:hidden space-y-4">
        
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>AI Visual Cheatsheet Generator</span>
              </h2>
              <p className="text-xs text-slate-400">
                Topic: <span className="font-bold text-indigo-300">{activeTopic}</span> • High-Yield Revision Matrix
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle Topic Generator Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isSearchOpen ? 'Close Search' : 'Change Topic / Search'}</span>
              {isSearchOpen ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
            </button>

            {cheatsheet && (
              <>
                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={saving || saveStatus === 'saved'}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center space-x-1.5 ${
                    saveStatus === 'saved'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10 hover:border-white/20'
                  }`}
                >
                  {saving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  ) : saveStatus === 'saved' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{saving ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save'}</span>
                </button>

                {/* Copy Structured Text */}
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center space-x-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {/* Print / PDF Button */}
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>

                {/* Theme Switcher */}
                <button
                  onClick={() => setStyleMode(isPaper ? 'dark' : 'paper')}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition-all flex items-center space-x-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isPaper ? 'Infographic Sheet' : 'Dark Mode'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search & Topic Customizer Dropdown / Accordion */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-4 border-t border-white/10 space-y-3 overflow-hidden"
            >
              <form onSubmit={handleCustomTopicSubmit} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter ANY topic (e.g., Marginal Utility, Supply & Demand, Binary Search Trees, Calculus...)"
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors font-medium"
                  />
                </div>
                
                {/* Level selector */}
                <select
                  value={activeLevel}
                  onChange={(e) => setActiveLevel(e.target.value)}
                  className="px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                >
                  <option value="Beginner" className="bg-[#0b0f19]">Beginner Level</option>
                  <option value="Intermediate" className="bg-[#0b0f19]">Intermediate Level</option>
                  <option value="Advanced" className="bg-[#0b0f19]">Advanced Level</option>
                </select>

                <button
                  type="submit"
                  disabled={loading || !customInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center space-x-1.5"
                >
                  {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Generate Cheatsheet</span>
                </button>
              </form>

              {/* Quick Topic Preset Chips */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Quick Topics across Domains:
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TOPICS.map((preset, pIdx) => {
                    const Icon = preset.icon;
                    return (
                      <button
                        key={pIdx}
                        onClick={() => handleSelectPreset(preset)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-medium border transition-all flex items-center space-x-1.5 ${
                          activeTopic === preset.label
                            ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500 shadow-sm'
                            : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{preset.label}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-400 uppercase">
                          {preset.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Save Notification Toast */}
      {saveMessage && (
        <div
          className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
            saveStatus === 'saved'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            {saveStatus === 'saved' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{saveMessage}</span>
          </div>
          <button onClick={() => setSaveMessage(null)} className="text-xs opacity-60 hover:opacity-100 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="rounded-3xl p-16 bg-[#0d1322] border border-white/10 text-center space-y-4 shadow-2xl">
          <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
          <h3 className="text-base font-bold text-white">Generating Domain-Specific Visual Cheatsheet...</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Structuring definitions, visual graphs/curves, formulas, real-world examples, and revision matrix for <span className="text-indigo-300 font-bold">"{activeTopic}"</span>.
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && !cheatsheet && (
        <div className="rounded-3xl p-12 bg-[#0d1322] border border-rose-500/20 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Cheatsheet Generation Notice</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => fetchCheatsheetData(activeTopic, activeContext)}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg"
          >
            Regenerate Cheatsheet
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 15ForTeen STYLE INFOGRAPHIC CHEATSHEET CONTAINER */}
      {/* ======================================================== */}
      {!loading && cheatsheet && (
        <div
          id="cheatsheet-infographic-root"
          className={`rounded-3xl p-6 sm:p-10 shadow-2xl transition-all border ${
            isPaper
              ? 'bg-[#ffffff] text-slate-900 border-slate-300'
              : 'bg-[#0b0f19] text-slate-100 border-white/10'
          }`}
        >
          {/* Header Banner */}
          <div className={`border-b pb-6 mb-8 text-center relative ${isPaper ? 'border-slate-300' : 'border-white/10'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border ${
                isPaper ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-indigo-950/60 text-indigo-300 border-indigo-500/30'
              }`}>
                &lt;/&gt; PadhAI Visual Matrix
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
              </div>
            </div>

            <h1 className={`text-2xl sm:text-4xl font-black uppercase tracking-tight ${
              isPaper ? 'text-slate-950' : 'text-white'
            }`}>
              {cheatsheet.unitNumber ? `${cheatsheet.unitNumber} CHEATSHEET` : 'REVISION CHEATSHEET'}
            </h1>

            <div className="inline-block mt-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white text-xs sm:text-sm font-black uppercase tracking-wide shadow-md">
              {cheatsheet.title || activeTopic}
            </div>

            {cheatsheet.overview && (
              <p className={`text-xs sm:text-sm mt-3 max-w-3xl mx-auto font-medium leading-relaxed ${
                isPaper ? 'text-slate-600' : 'text-slate-400'
              }`}>
                {cheatsheet.overview}
              </p>
            )}
          </div>

          {/* Numbered Cards Grid (4 Columns on Desktop, exactly like 15ForTeen Infographic!) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 mb-8">
            {cardsToRender.map((card, idx) => {
              const colorTheme = BADGE_COLORS[idx % BADGE_COLORS.length];
              const cardNum = card.number || idx + 1;

              return (
                <div
                  key={idx}
                  className={`rounded-2xl p-4 sm:p-5 flex flex-col justify-between border transition-all ${
                    isPaper
                      ? `bg-white ${colorTheme.lightBorder} shadow-sm hover:shadow-md`
                      : `bg-[#0d1322] ${colorTheme.border} hover:bg-[#10172a]`
                  }`}
                >
                  <div className="space-y-3">
                    
                    {/* Card Header: Number + Title + Category */}
                    <div className="flex items-start justify-between gap-2 border-b pb-2">
                      <h3 className={`text-xs sm:text-sm font-black uppercase tracking-tight leading-snug ${
                        isPaper ? colorTheme.lightHeader : colorTheme.text
                      }`}>
                        {cardNum}. {card.title}
                      </h3>
                      {card.categoryType && (
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase shrink-0 border ${
                          isPaper
                            ? 'bg-slate-100 text-slate-700 border-slate-300'
                            : 'bg-white/5 text-slate-300 border-white/10'
                        }`}>
                          {card.categoryType}
                        </span>
                      )}
                    </div>

                    {/* Definition in Simple Language */}
                    {card.definition && (
                      <p className={`text-[11.5px] leading-relaxed font-medium ${
                        isPaper ? 'text-slate-800' : 'text-slate-300'
                      }`}>
                        {card.definition}
                      </p>
                    )}

                    {/* Bullet Points */}
                    {card.bulletPoints && card.bulletPoints.length > 0 && (
                      <ul className="space-y-1.5 pt-0.5 text-[11px]">
                        {card.bulletPoints.map((bp, bIdx) => (
                          <li key={bIdx} className="flex items-start space-x-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
                              isPaper ? 'bg-indigo-600' : 'bg-indigo-400'
                            }`} />
                            <span className={isPaper ? 'text-slate-700' : 'text-slate-300'}>
                              <MarkdownRenderer content={bp} />
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Mathematical Formula (if applicable) */}
                    {card.formula && (
                      <div className={`p-2.5 rounded-xl border font-mono text-[11px] ${
                        isPaper
                          ? 'bg-indigo-50/90 border-indigo-200 text-indigo-950'
                          : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200'
                      }`}>
                        <div className="flex items-center space-x-1 mb-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          <Calculator className="w-3 h-3" />
                          <span>Formula / Governing Equation:</span>
                        </div>
                        <div className="font-semibold overflow-x-auto py-0.5">
                          <MarkdownRenderer content={`$$${card.formula}$$`} />
                        </div>
                      </div>
                    )}

                    {/* Code Snippet (ONLY if CS/tech topic) */}
                    {card.codeSnippet && (
                      <div className={`rounded-xl border overflow-hidden text-[10.5px] font-mono ${
                        isPaper ? 'border-slate-700 bg-slate-950 text-slate-100' : 'border-white/10 bg-[#060911] text-cyan-300'
                      }`}>
                        <div className="flex items-center justify-between px-3 py-1 bg-slate-900 border-b border-white/5 text-[9.5px] text-slate-400 font-bold uppercase">
                          <span className="flex items-center space-x-1">
                            <Code2 className="w-3 h-3 text-purple-400" />
                            <span>{card.codeLanguage || 'Code'}</span>
                          </span>
                        </div>
                        <pre className="p-2.5 overflow-x-auto m-0 leading-relaxed font-mono">
                          <code>{card.codeSnippet}</code>
                        </pre>
                      </div>
                    )}

                    {/* Visual ASCII / Graph / Schedule / Tree */}
                    {card.visualDiagram && (
                      <div className={`p-2.5 rounded-xl border font-mono text-[10px] overflow-x-auto ${
                        isPaper
                          ? 'bg-slate-900 text-emerald-300 border-slate-700 shadow-sm'
                          : 'bg-[#060911] text-cyan-300 border-cyan-500/30 shadow-inner'
                      }`}>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400 font-sans font-bold mb-1 flex items-center space-x-1">
                          <Layers className="w-3 h-3" />
                          <span>Visual Curve / Diagram / Schedule:</span>
                        </div>
                        <pre className="whitespace-pre font-mono leading-tight">{card.visualDiagram}</pre>
                      </div>
                    )}

                    {/* Real-World Relatable Example */}
                    {card.example && (
                      <div className={`p-2.5 rounded-xl border text-[11px] ${
                        isPaper
                          ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                          : 'bg-amber-500/10 border-amber-500/25 text-amber-200'
                      }`}>
                        <span className="font-bold flex items-center space-x-1 text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                          <Lightbulb className="w-3 h-3" />
                          <span>Relatable Real-World Example:</span>
                        </span>
                        <p className="leading-relaxed font-medium">{card.example}</p>
                      </div>
                    )}

                    {/* High-Yield Exam Tip */}
                    {card.examTip && (
                      <div className={`p-2 rounded-xl border text-[10px] flex items-start space-x-1.5 ${
                        isPaper
                          ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                      }`}>
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span className="leading-snug font-medium">{card.examTip}</span>
                      </div>
                    )}

                  </div>

                  {/* Card Number Footer */}
                  <div className="pt-3 mt-3 border-t border-dashed border-slate-200 dark:border-white/5 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                    <span className="uppercase font-bold tracking-wider">{card.categoryType || 'Concept'}</span>
                    <span>Card #{cardNum}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ======================================================== */}
          {/* COMPARISON TABLE */}
          {/* ======================================================== */}
          {cheatsheet.comparisonTable && cheatsheet.comparisonTable.rows?.length > 0 && (
            <div className={`rounded-2xl p-5 sm:p-6 mb-6 border ${
              isPaper ? 'bg-slate-50 border-slate-300' : 'bg-[#0d1322] border-white/10'
            }`}>
              <h3 className={`text-xs sm:text-sm font-black uppercase tracking-tight mb-4 flex items-center space-x-2 ${
                isPaper ? 'text-indigo-800' : 'text-indigo-300'
              }`}>
                <Table className="w-4 h-4" />
                <span>{cheatsheet.comparisonTable.title || 'Core Paradigm Comparison Matrix'}</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className={isPaper ? 'bg-slate-200/80 text-slate-900' : 'bg-white/5 text-slate-200'}>
                      {(cheatsheet.comparisonTable.headers || ['Concept', 'Definition', 'Example / Behavior', 'Primary Use']).map((h, hIdx) => (
                        <th key={hIdx} className="p-3 font-black uppercase tracking-wider border-b border-slate-300 dark:border-white/10">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cheatsheet.comparisonTable.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className={`border-b transition-colors ${
                          isPaper
                            ? rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                            : rIdx % 2 === 0 ? 'bg-[#080c14]' : 'bg-[#0b0f19]'
                        } ${isPaper ? 'border-slate-200 text-slate-800' : 'border-white/5 text-slate-300'}`}
                      >
                        <td className="p-3 font-bold text-indigo-600 dark:text-indigo-400 align-top">
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 inline-block font-semibold">
                            {row.type}
                          </span>
                        </td>
                        <td className="p-3 leading-relaxed align-top">{row.definition}</td>
                        <td className="p-3 font-medium align-top text-emerald-600 dark:text-emerald-400">{row.example}</td>
                        <td className="p-3 font-medium align-top">{row.use}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* QUICK REVISION + EXAM POINTS (2-Column Split) */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            
            {/* Quick Revision Checkpoints */}
            {cheatsheet.quickRevisionPoints && cheatsheet.quickRevisionPoints.length > 0 && (
              <div className={`rounded-2xl p-5 border ${
                isPaper ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950' : 'bg-[#0d1322] border-emerald-500/30 text-slate-200'
              }`}>
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>High-Yield Revision Checklist</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {cheatsheet.quickRevisionPoints.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start space-x-2">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">✓</span>
                      <span className="leading-snug">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Important Exam / University Questions */}
            {cheatsheet.examPoints && cheatsheet.examPoints.length > 0 && (
              <div className={`rounded-2xl p-5 border ${
                isPaper ? 'bg-indigo-50/70 border-indigo-300 text-indigo-950' : 'bg-[#0d1322] border-indigo-500/30 text-slate-200'
              }`}>
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center space-x-1.5">
                  <Star className="w-4 h-4 fill-current" />
                  <span>Important Exam & Interview Questions</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {cheatsheet.examPoints.map((eq, eIdx) => (
                    <div key={eIdx} className="flex items-start space-x-2">
                      <span className="text-indigo-500 shrink-0 font-bold">•</span>
                      <span className="leading-snug">{eq}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ======================================================== */}
          {/* TOPPER'S TIP FOOTER BANNER */}
          {/* ======================================================== */}
          <div className="rounded-2xl p-4 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 border border-indigo-500/30 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-lg">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                  Topper's Revision Strategy
                </span>
                <span className="text-xs sm:text-sm font-black tracking-wide">
                  {cheatsheet.topperTip || 'Understand Concepts ➔ Practice Examples ➔ Write Definitions ➔ Revise Regularly'}
                </span>
              </div>
            </div>

            <div className="text-[11px] font-mono text-indigo-300 font-bold px-3 py-1 rounded-lg bg-black/40 border border-white/10 shrink-0">
              PadhAI AI-Engine
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default CheatsheetViewer;
