import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  Sparkles,
  AlertCircle,
  HelpCircle,
  BookOpen,
  Layers,
  Check,
  RefreshCw,
  ArrowRight,
  X,
  Award,
  Calendar,
  Zap,
  Tag,
  Target,
  File,
  MoreVertical,
  CheckCircle2,
  Printer,
  FileCode,
  Lightbulb,
  AlertTriangle,
  GraduationCap
} from 'lucide-react';
import { analyzeStudyMaterial } from '../../services/api';
import CheatsheetViewer from '../cheatsheets/CheatsheetViewer';
import FlashcardDeck from '../flashcards/FlashcardDeck';
import QuizRunner from '../quizzes/QuizRunner';
import MarkdownRenderer from '../../components/MarkdownRenderer';

const SAMPLE_MATERIALS = [
  {
    id: '1',
    name: 'Operating_Systems_Notes.pdf',
    type: 'pdf',
    time: 'Uploaded 2 hours ago',
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  },
  {
    id: '2',
    name: 'DBMS_Normalization.pptx',
    type: 'pptx',
    time: 'Uploaded 1 day ago',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    id: '3',
    name: 'Computer_Networks.txt',
    type: 'txt',
    time: 'Uploaded 3 days ago',
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
];

const NOTE_ACTIONS = [
  { id: 'explain', label: 'Explain these notes', icon: BookOpen, desc: 'Break down complex concepts into simple language' },
  { id: 'summary', label: 'Summarize', icon: FileText, desc: 'Key summaries and essential takeaways' },
  { id: 'extract-topics', label: 'Extract important topics', icon: Target, desc: 'List core subtopics and syllabus boundaries' },
  { id: 'study-material', label: 'Create study material', icon: Sparkles, desc: 'Comprehensive study notes with examples' },
  { id: 'quiz', label: 'Create quiz', icon: HelpCircle, desc: 'Multiple-choice test with explanations' },
  { id: 'cheatsheet', label: 'Create cheatsheet', icon: Zap, desc: 'One-page quick reference revision sheet' },
  { id: 'flashcards', label: 'Create flashcards', icon: Layers, desc: 'Spaced repetition cards for active recall' },
  { id: 'revision-plan', label: 'Create revision plan', icon: Calendar, desc: 'Structured day-wise revision roadmap' },
  { id: 'weak-topics', label: 'Identify weak/important topics', icon: Award, desc: 'High-frequency exam & interview topics' },
];

export const StudyMaterialAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedAction, setSelectedAction] = useState('explain');
  const [materialsList, setMaterialsList] = useState(SAMPLE_MATERIALS);

  // Processing state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisMetadata, setAnalysisMetadata] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'cheatsheet' | 'flashcards' | 'quiz' | null

  const fileInputRef = useRef(null);
  const activeRequestIdRef = useRef(0);

  const handleFileSelect = (file) => {
    if (!file) return;
    const validExtensions = ['.pdf', '.ppt', '.pptx', '.txt', '.md'];
    const hasValidExt = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExt) {
      setError('Unsupported file type. Please upload a PDF (.pdf), PowerPoint (.ppt, .pptx), Text (.txt), or Markdown (.md) file.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('File size exceeds 25MB limit.');
      return;
    }

    // Invalidate prior requests and reset state cleanly on new file
    activeRequestIdRef.current++;
    setSelectedFile(file);
    setAnalysisResult(null);
    setAnalysisMetadata(null);
    setError(null);
    setActiveModal(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || loading) {
      if (!selectedFile) setError('Please select or drop a study material file first.');
      return;
    }

    const currentRequestId = ++activeRequestIdRef.current;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('learnerLevel', 'Intermediate');
    formData.append('action', selectedAction);

    try {
      const res = await analyzeStudyMaterial(formData);
      if (activeRequestIdRef.current !== currentRequestId) {
        // Obsolete response from older request, discard
        return;
      }

      const analysisData = res?.analysis || res?.data;
      if (res?.success && analysisData) {
        setAnalysisResult(analysisData);
        setAnalysisMetadata(res?.metadata || null);
        setMaterialsList((prev) => [
          {
            id: Date.now().toString(),
            name: selectedFile.name,
            type: selectedFile.name.split('.').pop() || 'doc',
            time: 'Uploaded just now',
            color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
          },
          ...prev,
        ]);
      } else {
        throw new Error(res?.message || 'Failed to analyze study material.');
      }
    } catch (err) {
      if (activeRequestIdRef.current !== currentRequestId) return;
      console.error('Study material analysis error:', err);
      setError(err.message || 'Failed to analyze study material. Please try again.');
      setAnalysisResult(null);
      setAnalysisMetadata(null);
    } finally {
      if (activeRequestIdRef.current === currentRequestId) {
        setLoading(false);
      }
    }
  };

  // Synthesize complete markdown for passing full rich context to modal viewers
  const synthesizedContent = useMemo(() => {
    if (!analysisResult) return '';
    const sections = [];

    if (analysisResult.summary) {
      sections.push(`## Summary\n${analysisResult.summary}`);
    }

    if (analysisResult.keyConcepts?.length) {
      sections.push(
        `## Key Concepts\n` +
          analysisResult.keyConcepts
            .map((kc) =>
              typeof kc === 'string'
                ? `- ${kc}`
                : `### ${kc.concept || 'Concept'}\n${kc.explanation || ''}`
            )
            .join('\n\n')
      );
    }

    if (analysisResult.keyPoints?.length) {
      sections.push(
        `## High-Yield Key Points\n` +
          analysisResult.keyPoints.map((kp) => `- ${kp}`).join('\n')
      );
    }

    if (analysisResult.definitions?.length) {
      sections.push(
        `## Definitions\n` +
          analysisResult.definitions
            .map((d) =>
              typeof d === 'string'
                ? `- ${d}`
                : `- **${d.term}**: ${d.definition}`
            )
            .join('\n')
      );
    }

    if (analysisResult.importantFormulas?.length) {
      sections.push(
        `## Important Formulas\n` +
          analysisResult.importantFormulas
            .map((f) =>
              typeof f === 'string'
                ? `- ${f}`
                : `- **${f.name}**: \`${f.formula}\` — ${f.explanation}`
            )
            .join('\n')
      );
    }

    if (analysisResult.commonMistakes?.length) {
      sections.push(
        `## Common Pitfalls & Mistakes\n` +
          analysisResult.commonMistakes
            .map((m) =>
              typeof m === 'string'
                ? `- ${m}`
                : `- **Mistake**: ${m.mistake}\n  **Correction**: ${m.correction}\n  **Why**: ${m.explanation}`
            )
            .join('\n\n')
      );
    }

    return sections.join('\n\n');
  }, [analysisResult]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Study My Notes
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Upload PDF, PPT, PPTX, TXT, or Markdown notes and let PadhAI explain, summarize, create quizzes, cheatsheets, or flashcards.
          </p>
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Drag & Drop + 9 Actions + Results (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-3xl p-6 sm:p-8 bg-[#0d1322] border border-white/10 shadow-2xl space-y-6">
            
            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 sm:p-12 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
                isDragging
                  ? 'border-indigo-400 bg-indigo-500/10'
                  : 'border-white/10 hover:border-indigo-500/40 bg-[#080c14]/60 hover:bg-[#080c14]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.ppt,.pptx,.txt,.md"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />

              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shadow-lg">
                <UploadCloud className="w-7 h-7" />
              </div>

              <div>
                <p className="text-sm font-bold text-white">
                  {selectedFile ? selectedFile.name : 'Drag & drop your notes here or Browse Files'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports PDF, PPT, PPTX, TXT, MD (Max 25MB)
                </p>
              </div>

              {selectedFile && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  Ready to process ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              )}
            </div>

            {/* Error banner */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start justify-between gap-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
                {selectedFile && (
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-bold text-xs transition-all"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            {/* "What do you want PadhAI to do with these notes?" 9 Action Grid */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-200">
                What do you want PadhAI to do with these notes?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {NOTE_ACTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedAction === opt.id;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedAction(opt.id)}
                      className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between space-y-1.5 ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                          : 'bg-[#080c14] border-white/5 text-slate-400 hover:text-white hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold truncate">{opt.label}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Process Button */}
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading || !selectedFile}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Notes with PadhAI...</span>
                </>
              ) : (
                <>
                  <span>Execute {NOTE_ACTIONS.find((a) => a.id === selectedAction)?.label || 'Action'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </div>

          {/* Results Display */}
          {analysisResult && (
            <div id="study-material-results" className="rounded-3xl p-6 sm:p-8 bg-[#0d1322] border border-white/10 shadow-2xl space-y-6 animate-in fade-in">
              
              {/* Result Header & Metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">
                    {analysisResult.documentTitle || 'Synthesized Study Notes'}
                  </h3>
                  {analysisMetadata && (
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-400">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-mono">
                        {analysisMetadata.filename}
                      </span>
                      <span>•</span>
                      <span>{analysisMetadata.wordCount} words</span>
                      <span>•</span>
                      <span className="capitalize">{analysisMetadata.action || selectedAction} mode</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center space-x-1.5"
                    title="Export / Print Notes"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Export</span>
                  </button>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Ready
                  </span>
                </div>
              </div>

              {/* Demo Mode Banner */}
              {analysisResult.isDemo && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 font-bold uppercase text-xs">Demo Data</span>
                  <span>Document analysis generated in offline demo mode.</span>
                </div>
              )}

              {/* 1. Summary Section */}
              {analysisResult.summary && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Executive Summary</span>
                  </h4>
                  <div className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#080c14] p-4 rounded-2xl border border-white/5">
                    <MarkdownRenderer content={analysisResult.summary} />
                  </div>
                </div>
              )}

              {/* 2. Important Topics */}
              {analysisResult.importantTopics?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-1.5">
                    <Target className="w-3.5 h-3.5" />
                    <span>Core Syllabus Topics</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.importantTopics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Key Concepts Grid */}
              {analysisResult.keyConcepts?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Key Concepts & Explanations</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysisResult.keyConcepts.map((kc, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#080c14] border border-white/5 space-y-1.5"
                      >
                        <h5 className="text-xs font-bold text-white">
                          {typeof kc === 'string' ? `Concept ${idx + 1}` : kc.concept}
                        </h5>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {typeof kc === 'string' ? kc : kc.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. High-Yield Key Points */}
              {analysisResult.keyPoints?.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>High-Yield Key Takeaways</span>
                  </h4>
                  <div className="space-y-2">
                    {analysisResult.keyPoints.map((pt, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-xs text-slate-300 flex items-start space-x-2.5"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <span className="leading-relaxed">{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Definitions & Formulas Row */}
              {((analysisResult.definitions && analysisResult.definitions.length > 0) ||
                (analysisResult.importantFormulas && analysisResult.importantFormulas.length > 0)) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Definitions */}
                  {analysisResult.definitions?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Core Definitions</span>
                      </h4>
                      <div className="space-y-2">
                        {analysisResult.definitions.map((def, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-[#080c14] border border-white/5 space-y-1"
                          >
                            <span className="text-xs font-bold text-amber-300">
                              {typeof def === 'string' ? def.split(':')[0] : def.term}
                            </span>
                            <p className="text-xs text-slate-400">
                              {typeof def === 'string' ? def.split(':').slice(1).join(':') : def.definition}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Formulas */}
                  {analysisResult.importantFormulas?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-1.5">
                        <FileCode className="w-3.5 h-3.5" />
                        <span>Formulas & Notation</span>
                      </h4>
                      <div className="space-y-2">
                        {analysisResult.importantFormulas.map((f, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-[#080c14] border border-white/5 space-y-1"
                          >
                            <span className="text-xs font-bold text-blue-300">
                              {typeof f === 'string' ? f : f.name}
                            </span>
                            {typeof f !== 'string' && f.formula && (
                              <div className="font-mono text-xs text-white bg-black/40 px-2.5 py-1 rounded-md border border-white/10 my-1">
                                {f.formula}
                              </div>
                            )}
                            {typeof f !== 'string' && f.explanation && (
                              <p className="text-xs text-slate-400">{f.explanation}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 6. Common Mistakes */}
              {analysisResult.commonMistakes?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Common Misconceptions & Pitfalls</span>
                  </h4>
                  <div className="space-y-2">
                    {analysisResult.commonMistakes.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/15 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center space-x-2 text-rose-300 font-bold">
                          <span>⚠️ Mistake:</span>
                          <span>{typeof m === 'string' ? m : m.mistake}</span>
                        </div>
                        {typeof m !== 'string' && m.correction && (
                          <div className="text-emerald-300 font-medium pl-4 border-l-2 border-emerald-500/40">
                            ✓ Correction: {m.correction}
                          </div>
                        )}
                        {typeof m !== 'string' && m.explanation && (
                          <p className="text-slate-400 text-xs pl-4">{m.explanation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. Practice Questions */}
              {analysisResult.practiceQuestions?.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Practice Diagnostic Questions</span>
                  </h4>
                  <div className="space-y-3">
                    {analysisResult.practiceQuestions.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-[#080c14] border border-white/5 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-white">
                            {idx + 1}. {typeof q === 'string' ? q : q.question}
                          </p>
                          {typeof q !== 'string' && q.difficulty && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                              {q.difficulty}
                            </span>
                          )}
                        </div>

                        {typeof q !== 'string' && q.options?.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                            {q.options.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className={`text-xs p-2 rounded-lg border ${
                                  opt === q.answer
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold'
                                    : 'bg-white/5 border-white/5 text-slate-400'
                                }`}
                              >
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}

                        {typeof q !== 'string' && q.explanation && (
                          <p className="text-xs text-slate-400 border-t border-white/5 pt-2">
                            <span className="font-bold text-slate-300">Explanation:</span> {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. Action shortcuts */}
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveModal('cheatsheet')}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Open Cheatsheet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal('flashcards')}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/20 transition-all flex items-center space-x-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Open Flashcards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal('quiz')}
                  className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all flex items-center space-x-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Take Quiz on Notes</span>
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Right Column: "Your Material" List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-3xl p-6 bg-[#0d1322] border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white">Your Uploaded Notes</h3>

            <div className="space-y-3">
              {materialsList.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#080c14] border border-white/5 hover:border-white/15 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs uppercase ${item.color}`}>
                      <File className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white truncate max-w-[140px]">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-400">{item.time}</p>
                    </div>
                  </div>

                  <button className="text-slate-400 hover:text-white p-1 rounded-lg">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Modal: Cheatsheet Viewer */}
      {activeModal === 'cheatsheet' && (
        <div className="fixed inset-0 z-[10100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0b0f19] border border-white/15 rounded-3xl p-6 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <CheatsheetViewer
              lessonTitle={analysisResult?.documentTitle || 'Study Material'}
              lessonContent={synthesizedContent || analysisResult?.summary || ''}
              onBack={() => setActiveModal(null)}
            />
          </div>
        </div>
      )}

      {/* Modal: Flashcards Deck */}
      {activeModal === 'flashcards' && (
        <div className="fixed inset-0 z-[10100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#0b0f19] border border-white/15 rounded-3xl p-6 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <FlashcardDeck
              lessonTitle={analysisResult?.documentTitle || 'Study Material'}
              lessonContent={synthesizedContent || analysisResult?.summary || ''}
              onBack={() => setActiveModal(null)}
            />
          </div>
        </div>
      )}

      {/* Modal: Quiz Runner */}
      {activeModal === 'quiz' && (
        <div className="fixed inset-0 z-[10100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0b0f19] border border-white/15 rounded-3xl p-6 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <QuizRunner
              lessonTitle={analysisResult?.documentTitle || 'Study Material'}
              courseTopic={analysisResult?.documentTitle || 'Study Material'}
              lessonContent={synthesizedContent || analysisResult?.summary || ''}
              onBack={() => setActiveModal(null)}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default StudyMaterialAnalyzer;

