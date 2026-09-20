import React, { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';

export const CheatsheetViewer = ({
  lessonTitle = 'Arrays',
  lessonContent = '',
  courseTopic = 'Data Structures',
  onBack,
}) => {
  const [styleMode, setStyleMode] = useState('light'); // 'light' | 'dark'
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              AI Cheatsheet
            </h2>
            <p className="text-xs text-slate-400">Exam & interview ready quick revision guide</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>

          <button
            onClick={() => setStyleMode(styleMode === 'light' ? 'dark' : 'light')}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition-all flex items-center space-x-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Style: {styleMode === 'light' ? 'Paper' : 'Dark'}</span>
          </button>
        </div>
      </div>

      {/* Screen 8: Paper Document Revision Card */}
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
              {lessonTitle || 'Arrays'}
            </h1>
            <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${styleMode === 'light' ? 'text-indigo-600' : 'text-indigo-400'}`}>
              Quick Revision Guide
            </p>
          </div>

          <button
            onClick={handleCopy}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center space-x-1 ${
              styleMode === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* 2-Column Split matching Screen 8 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed">
          
          {/* Left Column: Definition, Key Points, Common Operations Table */}
          <div className="space-y-6">
            
            {/* Definition */}
            <div>
              <h3 className="font-bold uppercase tracking-wider text-[11px] text-indigo-600 mb-1.5">
                Definition
              </h3>
              <p className={styleMode === 'light' ? 'text-slate-700 font-medium' : 'text-slate-300'}>
                An array is a collection of elements of the same type stored in contiguous memory locations.
              </p>
            </div>

            {/* Key Points */}
            <div>
              <h3 className="font-bold uppercase tracking-wider text-[11px] text-indigo-600 mb-2">
                Key Points
              </h3>
              <ul className={`space-y-1.5 list-disc pl-4 ${styleMode === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                <li>Fixed size</li>
                <li>Contiguous memory</li>
                <li>Same data type</li>
                <li>Index based access (0 to N-1)</li>
                <li>O(1) access time</li>
              </ul>
            </div>

            {/* Common Operations Table */}
            <div>
              <h3 className="font-bold uppercase tracking-wider text-[11px] text-indigo-600 mb-2">
                Common Operations
              </h3>
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className={styleMode === 'light' ? 'bg-slate-100 text-slate-900 font-bold' : 'bg-[#080c14] text-slate-300'}>
                    <tr>
                      <th className="p-2.5 border-b border-r">Operation</th>
                      <th className="p-2.5 border-b">Time Complexity</th>
                    </tr>
                  </thead>
                  <tbody className={styleMode === 'light' ? 'divide-y divide-slate-200 text-slate-800' : 'divide-y divide-white/5 text-slate-300'}>
                    <tr>
                      <td className="p-2.5 border-r font-medium">Access</td>
                      <td className="p-2.5 text-indigo-600 font-bold">O(1)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 border-r font-medium">Search</td>
                      <td className="p-2.5 text-amber-600 font-bold">O(n)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 border-r font-medium">Insertion</td>
                      <td className="p-2.5 text-amber-600 font-bold">O(n)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 border-r font-medium">Deletion</td>
                      <td className="p-2.5 text-amber-600 font-bold">O(n)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Column: Syntax, Example, Common Mistakes, Takeaways */}
          <div className="space-y-6">
            
            {/* Syntax (C++) */}
            <div>
              <h3 className="font-bold uppercase tracking-wider text-[11px] text-indigo-600 mb-1.5">
                Syntax (C++)
              </h3>
              <div className="p-3.5 rounded-xl bg-slate-900 text-indigo-300 font-mono text-[11px] shadow-inner">
                <pre>{`int arr[5];\nint arr[] = {1, 2, 3, 4, 5};`}</pre>
              </div>
            </div>

            {/* Example */}
            <div>
              <h3 className="font-bold uppercase tracking-wider text-[11px] text-indigo-600 mb-1.5">
                Example
              </h3>
              <div className="p-3.5 rounded-xl bg-slate-900 text-indigo-300 font-mono text-[11px] shadow-inner">
                <pre>{`int arr[5] = {1, 2, 3, 4, 5};\ncout << arr[0]; // 1\ncout << arr[4]; // 5`}</pre>
              </div>
            </div>

            {/* Common Mistakes (Red Box) */}
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-300">
              <h4 className="font-bold text-[11px] text-rose-600 dark:text-rose-400 flex items-center space-x-1 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Common Mistakes</span>
              </h4>
              <ul className="space-y-1 text-[11px] list-disc pl-4 text-rose-800 dark:text-rose-200">
                <li>Array index out of bounds</li>
                <li>Not initializing elements</li>
                <li>Confusing size and last index</li>
              </ul>
            </div>

            {/* Takeaways (Green Box) */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-300">
              <h4 className="font-bold text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Takeaways</span>
              </h4>
              <ul className="space-y-1 text-[11px] list-disc pl-4 text-emerald-800 dark:text-emerald-200">
                <li>Arrays are simple but powerful</li>
                <li>Use when size is known</li>
                <li>Great for random access</li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default CheatsheetViewer;
