import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
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
  AlertCircle
} from 'lucide-react';
import { generateCheatsheet, saveCheatsheet } from '../../services/api';
import MarkdownRenderer from '../../components/MarkdownRenderer';

export const CheatsheetViewer = ({
  lessonTitle = 'Lesson Revision',
  lessonContent = '',
  courseTopic = '',
  currentLevel = 'Intermediate',
  courseId = '',
  moduleIndex = 0,
  lessonIndex = 0,
  sourceType = 'lesson',
  onBack,
}) => {
  const [cheatsheet, setCheatsheet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [styleMode, setStyleMode] = useState('light'); // 'light' | 'dark'
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saved' | 'error' | null
  const [saveMessage, setSaveMessage] = useState(null);

  const fetchCheatsheetData = useCallback(async () => {
    if (!lessonTitle && !courseTopic) return;
    setLoading(true);
    setError(null);
    setSaveStatus(null);
    setSaveMessage(null);

    try {
      const res = await generateCheatsheet({
        lessonTitle: lessonTitle || courseTopic || 'Topic Overview',
        lessonContent: typeof lessonContent === 'object' ? JSON.stringify(lessonContent) : (lessonContent || lessonTitle || courseTopic),
        courseTopic: courseTopic || '',
        currentLevel: currentLevel || 'Intermediate',
        courseId: courseId || undefined,
        moduleIndex: moduleIndex !== undefined ? moduleIndex : undefined,
        lessonIndex: lessonIndex !== undefined ? lessonIndex : undefined,
        sourceType: sourceType || 'lesson',
      });

      if (res?.success && res.cheatsheet) {
        setCheatsheet(res.cheatsheet);
      } else {
        throw new Error(res?.message || "Couldn't generate this resource right now. Please try again.");
      }
    } catch (err) {
      console.error('Cheatsheet generation error:', err);
      setError(err?.message || "Couldn't generate this resource right now. Please try again.");
      setCheatsheet(null);
    } finally {
      setLoading(false);
    }
  }, [lessonTitle, lessonContent, courseTopic, currentLevel, courseId, moduleIndex, lessonIndex, sourceType]);

  useEffect(() => {
    fetchCheatsheetData();
  }, [fetchCheatsheetData]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = async () => {
    if (!cheatsheet) return;

    // Build human-readable structured markdown
    let textToCopy = `# ${cheatsheet.title || lessonTitle}\n\n`;
    if (cheatsheet.overview) {
      textToCopy += `## Overview\n${cheatsheet.overview}\n\n`;
    }

    if (cheatsheet.definitions && cheatsheet.definitions.length > 0) {
      textToCopy += `## Definitions\n`;
      cheatsheet.definitions.forEach((d) => {
        textToCopy += `- **${d.term}**: ${d.definition}\n`;
      });
      textToCopy += `\n`;
    }

    if (cheatsheet.keyConcepts && cheatsheet.keyConcepts.length > 0) {
      textToCopy += `## Key Concepts\n`;
      cheatsheet.keyConcepts.forEach((c) => {
        textToCopy += `- **${c.concept}**: ${c.explanation}\n`;
      });
      textToCopy += `\n`;
    }

    if (cheatsheet.importantRules && cheatsheet.importantRules.length > 0) {
      textToCopy += `## Important Rules\n`;
      cheatsheet.importantRules.forEach((r) => {
        textToCopy += `- ${r}\n`;
      });
      textToCopy += `\n`;
    }

    if (cheatsheet.formulas && cheatsheet.formulas.length > 0) {
      textToCopy += `## Formulas & Invariants\n`;
      cheatsheet.formulas.forEach((f) => {
        textToCopy += `### ${f.name}\n\`${f.formula}\`\n${f.explanation || ''}\n\n`;
      });
    }

    if (cheatsheet.syntaxPatterns && cheatsheet.syntaxPatterns.length > 0) {
      textToCopy += `## Syntax & Code Patterns\n`;
      cheatsheet.syntaxPatterns.forEach((s) => {
        textToCopy += `### ${s.title}\n\`\`\`\n${s.pattern}\n\`\`\`\n${s.explanation || ''}\n\n`;
      });
    }

    if (cheatsheet.examples && cheatsheet.examples.length > 0) {
      textToCopy += `## Examples\n`;
      cheatsheet.examples.forEach((ex) => {
        textToCopy += `### ${ex.topic}\n\`\`\`\n${ex.example}\n\`\`\`\n${ex.explanation || ''}\n\n`;
      });
    }

    if (cheatsheet.commonMistakes && cheatsheet.commonMistakes.length > 0) {
      textToCopy += `## Common Mistakes to Avoid\n`;
      cheatsheet.commonMistakes.forEach((m) => {
        textToCopy += `- **Mistake**: ${m.mistake}\n  **Correction**: ${m.correction}\n`;
      });
      textToCopy += `\n`;
    }

    if (cheatsheet.quickRevisionPoints && cheatsheet.quickRevisionPoints.length > 0) {
      textToCopy += `## Quick Revision Points\n`;
      cheatsheet.quickRevisionPoints.forEach((p) => {
        textToCopy += `- ${p}\n`;
      });
      textToCopy += `\n`;
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch (clipErr) {
      console.warn('Clipboard write failed:', clipErr);
      // Fallback
      try {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Copy fallback failed:', err);
      }
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
        lessonTitle: lessonTitle || courseTopic || 'Revision Cheatsheet',
        sourceType: sourceType || 'lesson',
        cheatsheet,
      });

      if (res?.success) {
        setSaveStatus('saved');
        setSaveMessage('Cheatsheet saved successfully!');
      } else if (res?.mongoUnavailable) {
        setSaveStatus('error');
        setSaveMessage(res.message || 'Database offline. Cheatsheet could not be saved to server.');
      } else {
        throw new Error(res?.message || 'Failed to save cheatsheet.');
      }
    } catch (err) {
      console.error('Save cheatsheet error:', err);
      setSaveStatus('error');
      setSaveMessage(err?.message || 'Failed to save cheatsheet.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Action Header */}
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
              <span>AI Cheatsheet</span>
            </h2>
            <p className="text-xs text-slate-400">{lessonTitle || courseTopic} • Quick Revision Guide</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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

              {/* Print / PDF Button */}
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>

              {/* Style Switcher */}
              <button
                onClick={() => setStyleMode(styleMode === 'light' ? 'dark' : 'light')}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition-all flex items-center space-x-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Theme: {styleMode === 'light' ? 'Paper' : 'Dark'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Save Notification banner */}
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
          <button
            onClick={() => setSaveMessage(null)}
            className="text-xs opacity-60 hover:opacity-100 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="rounded-3xl p-16 bg-[#0d1322] border border-white/10 text-center space-y-4 shadow-2xl">
          <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
          <h3 className="text-base font-bold text-white">Generating Structured Cheatsheet...</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Extracting definitions, core invariants, syntax formulas, code patterns, and common mistakes for{' '}
            <span className="text-indigo-300 font-bold">{lessonTitle || courseTopic}</span>.
          </p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && !cheatsheet && (
        <div className="rounded-3xl p-12 bg-[#0d1322] border border-rose-500/20 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Cheatsheet Generation Failed</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchCheatsheetData}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Cheatsheet Content Document */}
      {!loading && cheatsheet && (
        <div
          className={`rounded-3xl p-6 sm:p-10 shadow-2xl transition-all border ${
            styleMode === 'light'
              ? 'bg-[#ffffff] text-slate-900 border-slate-200'
              : 'bg-[#0d1322] text-slate-100 border-white/10'
          }`}
        >
          {/* Document Header */}
          <div className="border-b pb-4 mb-6 flex items-start justify-between">
            <div>
              <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${styleMode === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {cheatsheet.title || lessonTitle}
              </h1>
              <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${styleMode === 'light' ? 'text-indigo-600' : 'text-indigo-400'}`}>
                High-Yield Revision Guide • {currentLevel} Level
              </p>
            </div>

            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                styleMode === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Overview */}
          {cheatsheet.overview && (
            <div className={`p-4 rounded-2xl mb-6 ${styleMode === 'light' ? 'bg-indigo-50 border border-indigo-100 text-slate-800' : 'bg-indigo-950/30 border border-indigo-800/30 text-indigo-200'}`}>
              <p className="text-xs sm:text-sm font-medium leading-relaxed">
                {cheatsheet.overview}
              </p>
            </div>
          )}

          {/* 2-Column Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed">
            
            {/* Left Column: Definitions, Key Concepts, Important Rules, Quick Revision */}
            <div className="space-y-6">
              
              {/* Definitions */}
              {cheatsheet.definitions && cheatsheet.definitions.length > 0 && (
                <div>
                  <h3 className={`font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center space-x-1.5 ${styleMode === 'light' ? 'text-indigo-700' : 'text-indigo-400'}`}>
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Definitions & Terminology</span>
                  </h3>
                  <div className="space-y-2">
                    {cheatsheet.definitions.map((d, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border ${
                          styleMode === 'light'
                            ? 'bg-slate-50 border-slate-200 text-slate-800'
                            : 'bg-white/[0.03] border-white/5 text-slate-300'
                        }`}
                      >
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{d.term}: </span>
                        <span>{d.definition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Concepts */}
              {cheatsheet.keyConcepts && cheatsheet.keyConcepts.length > 0 && (
                <div>
                  <h3 className={`font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center space-x-1.5 ${styleMode === 'light' ? 'text-indigo-700' : 'text-indigo-400'}`}>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Key Concepts & Invariants</span>
                  </h3>
                  <div className="space-y-2">
                    {cheatsheet.keyConcepts.map((c, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border ${
                          styleMode === 'light'
                            ? 'bg-slate-50 border-slate-200 text-slate-800'
                            : 'bg-white/[0.03] border-white/5 text-slate-300'
                        }`}
                      >
                        <h4 className="font-bold text-slate-900 dark:text-white mb-0.5">{c.concept}</h4>
                        <p className={styleMode === 'light' ? 'text-slate-700' : 'text-slate-300'}>{c.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Important Rules */}
              {cheatsheet.importantRules && cheatsheet.importantRules.length > 0 && (
                <div>
                  <h3 className={`font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center space-x-1.5 ${styleMode === 'light' ? 'text-indigo-700' : 'text-indigo-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Important Rules & Theorems</span>
                  </h3>
                  <ul className={`space-y-1.5 list-disc pl-4 ${styleMode === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                    {cheatsheet.importantRules.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Revision Points */}
              {cheatsheet.quickRevisionPoints && cheatsheet.quickRevisionPoints.length > 0 && (
                <div className={`p-4 rounded-2xl border ${
                  styleMode === 'light'
                    ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950'
                    : 'bg-indigo-900/20 border-indigo-500/20 text-indigo-200'
                }`}>
                  <h4 className="font-bold text-[11px] uppercase tracking-wider mb-2 flex items-center space-x-1.5 text-indigo-600 dark:text-indigo-400">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>60-Second Rapid Recall</span>
                  </h4>
                  <ul className="space-y-1.5 text-[11px] list-disc pl-4">
                    {cheatsheet.quickRevisionPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            {/* Right Column: Formulas, Syntax Patterns, Examples, Common Mistakes */}
            <div className="space-y-6">
              
              {/* Formulas */}
              {cheatsheet.formulas && cheatsheet.formulas.length > 0 && (
                <div>
                  <h3 className={`font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center space-x-1.5 ${styleMode === 'light' ? 'text-indigo-700' : 'text-indigo-400'}`}>
                    <Table className="w-3.5 h-3.5" />
                    <span>Formulas & Complexity</span>
                  </h3>
                  <div className="space-y-2">
                    {cheatsheet.formulas.map((f, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border ${
                          styleMode === 'light'
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-white/[0.03] border-white/5'
                        }`}
                      >
                        <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                          <span>{f.name}</span>
                        </div>
                        <div className="font-mono text-[11px] p-2 rounded-lg bg-slate-900 text-indigo-300 mt-1.5 overflow-x-auto">
                          {f.formula}
                        </div>
                        {f.explanation && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{f.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Syntax & Code Patterns */}
              {cheatsheet.syntaxPatterns && cheatsheet.syntaxPatterns.length > 0 && (
                <div>
                  <h3 className={`font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center space-x-1.5 ${styleMode === 'light' ? 'text-indigo-700' : 'text-indigo-400'}`}>
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Syntax & Patterns</span>
                  </h3>
                  <div className="space-y-3">
                    {cheatsheet.syntaxPatterns.map((s, i) => (
                      <div key={i} className="space-y-1">
                        <p className="font-bold text-[11px] text-slate-800 dark:text-slate-200">{s.title}</p>
                        <div className="p-3 rounded-xl bg-slate-900 text-indigo-300 font-mono text-[11px] shadow-inner overflow-x-auto">
                          <pre>{s.pattern}</pre>
                        </div>
                        {s.explanation && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{s.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Examples */}
              {cheatsheet.examples && cheatsheet.examples.length > 0 && (
                <div>
                  <h3 className={`font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center space-x-1.5 ${styleMode === 'light' ? 'text-indigo-700' : 'text-indigo-400'}`}>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Concrete Examples</span>
                  </h3>
                  <div className="space-y-3">
                    {cheatsheet.examples.map((ex, i) => (
                      <div key={i} className="space-y-1">
                        <p className="font-bold text-[11px] text-slate-800 dark:text-slate-200">{ex.topic}</p>
                        <div className="p-3 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] shadow-inner overflow-x-auto">
                          <pre>{ex.example}</pre>
                        </div>
                        {ex.explanation && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{ex.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common Mistakes (Red Box) */}
              {cheatsheet.commonMistakes && cheatsheet.commonMistakes.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-300">
                  <h4 className="font-bold text-[11px] text-rose-600 dark:text-rose-400 flex items-center space-x-1 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Common Pitfalls & Mistakes</span>
                  </h4>
                  <ul className="space-y-2 text-[11px]">
                    {cheatsheet.commonMistakes.map((m, i) => (
                      <li key={i} className="space-y-0.5">
                        <div className="font-semibold text-rose-800 dark:text-rose-300">✕ {m.mistake}</div>
                        {m.correction && (
                          <div className="text-emerald-700 dark:text-emerald-400 pl-3">✓ {m.correction}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default CheatsheetViewer;
