import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot,
} from 'recharts';
import {
  BookOpen,
  CheckCircle2,
  TrendingUp,
  GitGraph,
  Table as TableIcon,
  Code2,
  Terminal,
  HelpCircle,
  Globe,
  AlertTriangle,
  History,
  Lightbulb,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import MarkdownRenderer from '../../components/MarkdownRenderer';

// Initialize mermaid safely
try {
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    theme: 'dark',
  });
} catch (e) {
  console.warn('Mermaid init error:', e);
}

const PALETTES = [
  '#818CF8', // Indigo
  '#34D399', // Emerald
  '#F472B6', // Pink
  '#38BDF8', // Sky
  '#FBBF24', // Amber
  '#A78BFA', // Purple
  '#FB7185', // Rose
];

// =========================================================================
// 1. DEFINITION BLOCK
// =========================================================================
export const DefinitionBlock = ({ block, isPaper }) => (
  <div
    className={`p-5 rounded-2xl border transition-all shadow-sm ${
      isPaper
        ? 'bg-indigo-50/70 border-indigo-200 text-slate-900'
        : 'bg-indigo-950/20 border-indigo-500/30 text-slate-100'
    }`}
  >
    <div className="flex items-center space-x-2.5 mb-3">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
          isPaper ? 'bg-indigo-600 text-white' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
        }`}
      >
        <BookOpen className="w-4 h-4" />
      </div>
      <h3 className={`text-sm font-bold uppercase tracking-wider ${isPaper ? 'text-indigo-900' : 'text-indigo-300'}`}>
        Core Definition & Mental Model
      </h3>
    </div>
    <MarkdownRenderer
      content={block.text}
      theme={isPaper ? 'paper' : 'dark'}
      className="text-base font-normal leading-relaxed"
    />
  </div>
);

// =========================================================================
// 2. KEY POINTS BLOCK
// =========================================================================
export const KeyPointsBlock = ({ block, isPaper }) => (
  <div
    className={`p-5 rounded-2xl border transition-all shadow-sm ${
      isPaper
        ? 'bg-white border-slate-200 text-slate-900'
        : 'bg-slate-900/50 border-white/10 text-slate-100'
    }`}
  >
    <div className="flex items-center space-x-2.5 mb-3">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
          isPaper ? 'bg-emerald-600 text-white' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        }`}
      >
        <CheckCircle2 className="w-4 h-4" />
      </div>
      <h3 className={`text-sm font-bold uppercase tracking-wider ${isPaper ? 'text-emerald-800' : 'text-emerald-300'}`}>
        Key Principles & Invariants
      </h3>
    </div>
    <ul className="space-y-2.5">
      {(block.items || []).map((item, idx) => (
        <li key={idx} className="flex items-start space-x-2 text-sm leading-relaxed">
          <span
            className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
              isPaper ? 'bg-emerald-600' : 'bg-emerald-400'
            }`}
          />
          <div className="flex-1">
            <MarkdownRenderer content={item} theme={isPaper ? 'paper' : 'dark'} compact={true} />
          </div>
        </li>
      ))}
    </ul>
  </div>
);

// =========================================================================
// 3. FORMULA BLOCK
// =========================================================================
export const FormulaBlock = ({ block, isPaper }) => {
  const cleanLatex = (block.latex || '').trim().replace(/^(\$\$|\$)|(\$\$|\$)$/g, '');
  const displayLatex = `$$${cleanLatex}$$`;

  return (
    <div
      className={`p-5 rounded-2xl border transition-all shadow-sm ${
        isPaper
          ? 'bg-amber-50/50 border-amber-200 text-slate-900'
          : 'bg-amber-950/20 border-amber-500/30 text-slate-100'
      }`}
    >
      <div className="flex items-center space-x-2.5 mb-2.5">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            isPaper ? 'bg-amber-600 text-white' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}
        >
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className={`text-sm font-bold uppercase tracking-wider ${isPaper ? 'text-amber-900' : 'text-amber-300'}`}>
            Formula: {block.name}
          </h3>
        </div>
      </div>

      <div
        className={`my-3 p-3.5 rounded-xl flex items-center justify-center text-center overflow-x-auto ${
          isPaper ? 'bg-white border border-amber-200 shadow-inner' : 'bg-slate-950/80 border border-amber-500/20'
        }`}
      >
        <MarkdownRenderer content={displayLatex} theme={isPaper ? 'paper' : 'dark'} compact={true} />
      </div>

      {block.explanation && (
        <div className="mb-3">
          <MarkdownRenderer content={block.explanation} theme={isPaper ? 'paper' : 'dark'} compact={true} />
        </div>
      )}

      {Array.isArray(block.variables) && block.variables.length > 0 && (
        <div className="mt-3 pt-3 border-t border-amber-500/20">
          <span className={`text-xs font-semibold uppercase tracking-wider block mb-1.5 ${isPaper ? 'text-amber-800' : 'text-amber-400'}`}>
            Variable Legend:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
            {block.variables.map((v, i) => (
              <div
                key={i}
                className={`px-2.5 py-1.5 rounded-lg flex items-center space-x-2 ${
                  isPaper ? 'bg-amber-100/70 text-slate-800' : 'bg-slate-900/60 border border-white/5 text-slate-300'
                }`}
              >
                <code className={`font-mono font-bold ${isPaper ? 'text-amber-900' : 'text-amber-300'}`}>
                  ${v.symbol}$
                </code>
                <span>=</span>
                <span className="truncate">{v.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 4. CHART BLOCK (RECHARTS)
// =========================================================================
export const ChartBlock = ({ block, isPaper }) => {
  const seriesList = block.series || [];
  const chartType = block.chartType || 'line';

  // Format data into unified recharts coordinates
  const dataMap = new Map();
  seriesList.forEach((s) => {
    (s.points || []).forEach((pt) => {
      const existing = dataMap.get(pt.x) || { x: pt.x };
      existing[s.name] = pt.y;
      dataMap.set(pt.x, existing);
    });
  });

  const chartData = Array.from(dataMap.values()).sort((a, b) => a.x - b.x);

  return (
    <div
      className={`p-5 rounded-2xl border transition-all shadow-sm ${
        isPaper
          ? 'bg-white border-slate-200 text-slate-900'
          : 'bg-slate-900/70 border-white/10 text-slate-100'
      }`}
    >
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center space-x-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isPaper ? 'bg-cyan-600 text-white' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${isPaper ? 'text-slate-900' : 'text-white'}`}>
              {block.title || 'Analytical Graph'}
            </h3>
            <span className="text-xs text-slate-400">
              {block.xLabel} vs. {block.yLabel}
            </span>
          </div>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium uppercase ${
            isPaper ? 'bg-cyan-100 text-cyan-800' : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
          }`}
        >
          {chartType} chart
        </span>
      </div>

      <div className="h-64 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isPaper ? '#E2E8F0' : '#1E293B'} />
              <XAxis
                dataKey="x"
                stroke={isPaper ? '#64748B' : '#94A3B8'}
                tick={{ fontSize: 11 }}
                label={{ value: block.xLabel, position: 'insideBottom', offset: -10, fill: isPaper ? '#475569' : '#94A3B8', fontSize: 11 }}
              />
              <YAxis
                stroke={isPaper ? '#64748B' : '#94A3B8'}
                tick={{ fontSize: 11 }}
                label={{ value: block.yLabel, angle: -90, position: 'insideLeft', fill: isPaper ? '#475569' : '#94A3B8', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isPaper ? '#FFFFFF' : '#0F172A',
                  borderColor: isPaper ? '#CBD5E1' : '#334155',
                  borderRadius: '0.75rem',
                  color: isPaper ? '#0F172A' : '#F8FAFC',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {seriesList.map((s, idx) => (
                <Bar key={s.name} dataKey={s.name} fill={PALETTES[idx % PALETTES.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          ) : chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isPaper ? '#E2E8F0' : '#1E293B'} />
              <XAxis
                dataKey="x"
                stroke={isPaper ? '#64748B' : '#94A3B8'}
                tick={{ fontSize: 11 }}
                label={{ value: block.xLabel, position: 'insideBottom', offset: -10, fill: isPaper ? '#475569' : '#94A3B8', fontSize: 11 }}
              />
              <YAxis
                stroke={isPaper ? '#64748B' : '#94A3B8'}
                tick={{ fontSize: 11 }}
                label={{ value: block.yLabel, angle: -90, position: 'insideLeft', fill: isPaper ? '#475569' : '#94A3B8', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isPaper ? '#FFFFFF' : '#0F172A',
                  borderColor: isPaper ? '#CBD5E1' : '#334155',
                  borderRadius: '0.75rem',
                  color: isPaper ? '#0F172A' : '#F8FAFC',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {seriesList.map((s, idx) => (
                <Area
                  key={s.name}
                  type="monotone"
                  dataKey={s.name}
                  stroke={PALETTES[idx % PALETTES.length]}
                  fill={PALETTES[idx % PALETTES.length]}
                  fillOpacity={0.25}
                />
              ))}
            </AreaChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isPaper ? '#E2E8F0' : '#1E293B'} />
              <XAxis
                dataKey="x"
                stroke={isPaper ? '#64748B' : '#94A3B8'}
                tick={{ fontSize: 11 }}
                label={{ value: block.xLabel, position: 'insideBottom', offset: -10, fill: isPaper ? '#475569' : '#94A3B8', fontSize: 11 }}
              />
              <YAxis
                stroke={isPaper ? '#64748B' : '#94A3B8'}
                tick={{ fontSize: 11 }}
                label={{ value: block.yLabel, angle: -90, position: 'insideLeft', fill: isPaper ? '#475569' : '#94A3B8', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isPaper ? '#FFFFFF' : '#0F172A',
                  borderColor: isPaper ? '#CBD5E1' : '#334155',
                  borderRadius: '0.75rem',
                  color: isPaper ? '#0F172A' : '#F8FAFC',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {seriesList.map((s, idx) => (
                <Line
                  key={s.name}
                  type="monotone"
                  dataKey={s.name}
                  stroke={PALETTES[idx % PALETTES.length]}
                  strokeWidth={2.5}
                  dot={{ r: 3.5 }}
                  activeDot={{ r: 6 }}
                />
              ))}
              {Array.isArray(block.markers) &&
                block.markers.map((m, mIdx) => (
                  <ReferenceDot
                    key={mIdx}
                    x={m.x}
                    y={m.y}
                    r={5}
                    fill="#EF4444"
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                    label={{
                      value: m.label,
                      position: 'top',
                      fill: isPaper ? '#B91C1C' : '#F87171',
                      fontSize: 10,
                      fontWeight: 600,
                    }}
                  />
                ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {block.insight && (
        <div
          className={`mt-3 p-3 rounded-xl text-xs leading-relaxed ${
            isPaper ? 'bg-cyan-50 text-cyan-950 border border-cyan-200' : 'bg-cyan-950/30 text-cyan-200 border border-cyan-500/20'
          }`}
        >
          <span className="font-bold mr-1">Analytical Insight:</span>
          <MarkdownRenderer content={block.insight} theme={isPaper ? 'paper' : 'dark'} compact={true} />
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 5. DIAGRAM BLOCK (MERMAID)
// =========================================================================
export const DiagramBlock = ({ block, isPaper }) => {
  const containerRef = useRef(null);
  const [renderError, setRenderError] = useState(false);
  const diagramId = useRef(`mermaid-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    let isMounted = true;
    const renderDiagram = async () => {
      if (!block.mermaid || !containerRef.current) return;
      try {
        setRenderError(false);
        const { svg } = await mermaid.render(diagramId.current, block.mermaid);
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.warn('Mermaid rendering syntax fallback:', err.message);
        if (isMounted) setRenderError(true);
      }
    };

    renderDiagram();
    return () => {
      isMounted = false;
    };
  }, [block.mermaid, isPaper]);

  return (
    <div
      className={`p-5 rounded-2xl border transition-all shadow-sm ${
        isPaper
          ? 'bg-white border-slate-200 text-slate-900'
          : 'bg-slate-900/70 border-white/10 text-slate-100'
      }`}
    >
      <div className="flex items-center space-x-2.5 mb-3">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            isPaper ? 'bg-purple-600 text-white' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
          }`}
        >
          <GitGraph className="w-4 h-4" />
        </div>
        <h3 className={`text-sm font-bold uppercase tracking-wider ${isPaper ? 'text-purple-900' : 'text-purple-300'}`}>
          Process & Architecture Diagram
        </h3>
      </div>

      <div
        className={`p-4 rounded-xl flex items-center justify-center overflow-x-auto min-h-[140px] ${
          isPaper ? 'bg-slate-50 border border-slate-200' : 'bg-slate-950/80 border border-white/5'
        }`}
      >
        {renderError ? (
          <div className="w-full">
            <span className="text-xs text-amber-400 block mb-1">Mermaid Source (Visual Flow):</span>
            <pre className="text-xs font-mono p-3 bg-slate-900 rounded overflow-x-auto text-slate-300">
              {block.mermaid}
            </pre>
          </div>
        ) : (
          <div ref={containerRef} className="w-full flex justify-center mermaid-container" />
        )}
      </div>

      {block.caption && (
        <div className="mt-2.5 text-xs text-slate-400 text-center italic">
          {block.caption}
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 6. TABLE BLOCK
// =========================================================================
export const TableBlock = ({ block, isPaper }) => (
  <div
    className={`p-5 rounded-2xl border transition-all shadow-sm ${
      isPaper
        ? 'bg-white border-slate-200 text-slate-900'
        : 'bg-slate-900/70 border-white/10 text-slate-100'
    }`}
  >
    <div className="flex items-center space-x-2.5 mb-3.5">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
          isPaper ? 'bg-blue-600 text-white' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        }`}
      >
        <TableIcon className="w-4 h-4" />
      </div>
      <h3 className={`text-sm font-bold uppercase tracking-wider ${isPaper ? 'text-slate-900' : 'text-white'}`}>
        {block.title || 'Comparison & Paradigm Matrix'}
      </h3>
    </div>

    <div
      className={`overflow-x-auto rounded-xl border ${
        isPaper ? 'border-slate-300 shadow-sm' : 'border-white/10'
      }`}
    >
      <table className="w-full text-left text-xs border-collapse">
        <thead
          className={`${
            isPaper
              ? 'bg-slate-100 text-slate-900 border-b border-slate-300'
              : 'bg-slate-950 text-purple-300 border-b border-white/10'
          }`}
        >
          <tr>
            {(block.headers || []).map((h, i) => (
              <th key={i} className="px-4 py-3 font-bold uppercase tracking-wider text-[11px]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={isPaper ? 'divide-y divide-slate-200' : 'divide-y divide-white/5'}>
          {(block.rows || []).map((row, rIdx) => (
            <tr
              key={rIdx}
              className={`${
                isPaper
                  ? 'hover:bg-slate-50'
                  : 'hover:bg-white/5 bg-slate-900/30'
              } transition-colors`}
            >
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-4 py-2.5 text-xs leading-relaxed">
                  <MarkdownRenderer content={String(cell)} theme={isPaper ? 'paper' : 'dark'} compact={true} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// =========================================================================
// 7. CODE / SYNTAX BLOCK
// =========================================================================
export const CodeBlockItem = ({ block, isPaper }) => {
  const [copied, setCopied] = useState(false);
  const codeContent = block.code || block.snippet || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`p-5 rounded-2xl border transition-all shadow-sm ${
        isPaper
          ? 'bg-slate-900 text-slate-100 border-slate-800'
          : 'bg-[#070b12] border-white/10 text-slate-200'
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/30">
            <Code2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-mono font-bold uppercase text-purple-300">
            {block.language || 'code'} {block.type === 'syntax' ? 'Syntax' : 'Implementation'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <pre className="p-4 my-3 rounded-xl bg-black/50 border border-white/5 overflow-x-auto text-xs font-mono leading-relaxed text-slate-200">
        <code>{codeContent}</code>
      </pre>

      {(block.explanation || block.notes) && (
        <div className="mt-2 text-xs text-slate-300 leading-relaxed">
          <MarkdownRenderer
            content={block.explanation || block.notes}
            theme="dark"
            compact={true}
          />
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 8. EXAMPLE BLOCK
// =========================================================================
export const ExampleBlock = ({ block, isPaper }) => (
  <div
    className={`p-5 rounded-2xl border transition-all shadow-sm ${
      isPaper
        ? 'bg-sky-50/60 border-sky-200 text-slate-900'
        : 'bg-sky-950/20 border-sky-500/30 text-slate-100'
    }`}
  >
    <div className="flex items-center space-x-2.5 mb-3">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
          isPaper ? 'bg-sky-600 text-white' : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
        }`}
      >
        <HelpCircle className="w-4 h-4" />
      </div>
      <h3 className={`text-sm font-bold uppercase tracking-wider ${isPaper ? 'text-sky-900' : 'text-sky-300'}`}>
        Worked Problem & Solution
      </h3>
    </div>

    <div className="space-y-3 text-xs leading-relaxed">
      <div className={`p-3 rounded-xl ${isPaper ? 'bg-white border border-sky-200' : 'bg-slate-950/70 border border-white/5'}`}>
        <span className="font-bold text-sky-400 block mb-1 uppercase tracking-wider text-[11px]">Problem / Question:</span>
        <MarkdownRenderer content={block.problem} theme={isPaper ? 'paper' : 'dark'} compact={true} />
      </div>

      <div className={`p-3 rounded-xl ${isPaper ? 'bg-sky-100/70 text-slate-900' : 'bg-sky-900/30 text-sky-100 border border-sky-500/20'}`}>
        <span className="font-bold text-emerald-400 block mb-1 uppercase tracking-wider text-[11px]">Step-by-Step Solution:</span>
        <MarkdownRenderer content={block.solution} theme={isPaper ? 'paper' : 'dark'} compact={true} />
      </div>
    </div>
  </div>
);

// =========================================================================
// 9. REAL LIFE BLOCK
// =========================================================================
export const RealLifeBlock = ({ block, isPaper }) => (
  <div
    className={`p-5 rounded-2xl border transition-all shadow-sm ${
      isPaper
        ? 'bg-teal-50/60 border-teal-200 text-slate-900'
        : 'bg-teal-950/20 border-teal-500/30 text-slate-100'
    }`}
  >
    <div className="flex items-center space-x-2.5 mb-3">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
          isPaper ? 'bg-teal-600 text-white' : 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
        }`}
      >
        <Globe className="w-4 h-4" />
      </div>
      <h3 className={`text-sm font-bold uppercase tracking-wider ${isPaper ? 'text-teal-900' : 'text-teal-300'}`}>
        Real-Life Application & Analogy
      </h3>
    </div>

    <div className="space-y-2 text-xs leading-relaxed">
      <div className="font-medium">
        <span className="font-bold mr-1.5">Everyday Scenario:</span>
        <MarkdownRenderer content={block.scenario} theme={isPaper ? 'paper' : 'dark'} compact={true} />
      </div>
      <div className={`p-3 rounded-xl mt-2 ${isPaper ? 'bg-teal-100/70' : 'bg-teal-900/30 border border-teal-500/20'}`}>
        <span className="font-bold mr-1.5">Conceptual Connection:</span>
        <MarkdownRenderer content={block.connection} theme={isPaper ? 'paper' : 'dark'} compact={true} />
      </div>
    </div>
  </div>
);

// =========================================================================
// 10. COMMON MISTAKES BLOCK
// =========================================================================
export const CommonMistakesBlock = ({ block, isPaper }) => (
  <div
    className={`p-5 rounded-2xl border transition-all shadow-sm ${
      isPaper
        ? 'bg-rose-50/50 border-rose-200 text-slate-900'
        : 'bg-rose-950/20 border-rose-500/30 text-slate-100'
    }`}
  >
    <div className="flex items-center space-x-2.5 mb-3.5">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
          isPaper ? 'bg-rose-600 text-white' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
        }`}
      >
        <AlertTriangle className="w-4 h-4" />
      </div>
      <h3 className={`text-sm font-bold uppercase tracking-wider ${isPaper ? 'text-rose-900' : 'text-rose-300'}`}>
        Frequent Traps & Common Mistakes
      </h3>
    </div>

    <div className="space-y-3">
      {(block.items || []).map((m, idx) => (
        <div
          key={idx}
          className={`p-3 rounded-xl text-xs space-y-1.5 ${
            isPaper ? 'bg-white border border-rose-200' : 'bg-slate-950/70 border border-white/5'
          }`}
        >
          <div className="flex items-start space-x-2">
            <span className="text-rose-400 font-bold flex-shrink-0">❌ Trap:</span>
            <div className="flex-1">
              <MarkdownRenderer content={m.mistake} theme={isPaper ? 'paper' : 'dark'} compact={true} />
            </div>
          </div>
          <div className="flex items-start space-x-2 pt-1 border-t border-rose-500/10">
            <span className="text-emerald-400 font-bold flex-shrink-0">✅ Fix:</span>
            <div className="flex-1">
              <MarkdownRenderer content={m.fix} theme={isPaper ? 'paper' : 'dark'} compact={true} />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// =========================================================================
// 11. TIMELINE BLOCK
// =========================================================================
export const TimelineBlock = ({ block, isPaper }) => (
  <div
    className={`p-5 rounded-2xl border transition-all shadow-sm ${
      isPaper
        ? 'bg-white border-slate-200 text-slate-900'
        : 'bg-slate-900/60 border-white/10 text-slate-100'
    }`}
  >
    <div className="flex items-center space-x-2.5 mb-4">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
          isPaper ? 'bg-amber-600 text-white' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
        }`}
      >
        <History className="w-4 h-4" />
      </div>
      <h3 className={`text-sm font-bold uppercase tracking-wider ${isPaper ? 'text-slate-900' : 'text-white'}`}>
        Chronological Milestones & Timeline
      </h3>
    </div>

    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-amber-500/30">
      {(block.events || []).map((ev, i) => (
        <div key={i} className="relative">
          <div
            className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border-2 ${
              isPaper ? 'bg-amber-600 border-white' : 'bg-amber-400 border-slate-900'
            }`}
          />
          <div className="text-xs">
            <span className={`font-mono font-bold mr-2 ${isPaper ? 'text-amber-800' : 'text-amber-300'}`}>
              {ev.when}
            </span>
            <span className="leading-relaxed">
              <MarkdownRenderer content={ev.what} theme={isPaper ? 'paper' : 'dark'} compact={true} />
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// =========================================================================
// 12. MNEMONIC BLOCK
// =========================================================================
export const MnemonicBlock = ({ block, isPaper }) => (
  <div
    className={`p-4 rounded-2xl border flex items-start space-x-3 shadow-sm ${
      isPaper
        ? 'bg-purple-50/70 border-purple-200 text-purple-950'
        : 'bg-purple-950/20 border-purple-500/30 text-purple-200'
    }`}
  >
    <div
      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
        isPaper ? 'bg-purple-600 text-white' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
      }`}
    >
      <Lightbulb className="w-4 h-4" />
    </div>
    <div className="flex-1 text-xs leading-relaxed">
      <span className="font-bold uppercase tracking-wider text-[11px] block mb-0.5 text-purple-400">
        Topper Memory Mnemonic:
      </span>
      <MarkdownRenderer content={block.text} theme={isPaper ? 'paper' : 'dark'} compact={true} />
    </div>
  </div>
);

// =========================================================================
// 13. QUICK SUMMARY BLOCK
// =========================================================================
export const QuickSummaryBlock = ({ block, isPaper }) => (
  <div
    className={`p-5 rounded-2xl border transition-all shadow-sm ${
      isPaper
        ? 'bg-slate-100 border-slate-300 text-slate-900'
        : 'bg-slate-950/80 border-white/10 text-slate-100'
    }`}
  >
    <div className="flex items-center space-x-2.5 mb-3">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
          isPaper ? 'bg-slate-700 text-white' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
        }`}
      >
        <Sparkles className="w-4 h-4" />
      </div>
      <h3 className={`text-sm font-bold uppercase tracking-wider ${isPaper ? 'text-slate-900' : 'text-purple-300'}`}>
        Exam-Day Quick Summary
      </h3>
    </div>
    <ul className="space-y-2 text-xs leading-relaxed">
      {(block.items || []).map((item, idx) => (
        <li key={idx} className="flex items-start space-x-2">
          <span className="text-purple-400 font-bold flex-shrink-0">⚡</span>
          <div className="flex-1">
            <MarkdownRenderer content={item} theme={isPaper ? 'paper' : 'dark'} compact={true} />
          </div>
        </li>
      ))}
    </ul>
  </div>
);

// =========================================================================
// 14. SIMPLE EXPLANATION BLOCK
// =========================================================================
export const SimpleExplanationBlock = ({ block, isPaper }) => (
  <div
    className={`p-5 rounded-2xl border transition-all shadow-sm ${
      isPaper
        ? 'bg-blue-50/70 border-blue-200 text-slate-900'
        : 'bg-blue-950/20 border-blue-500/30 text-slate-100'
    }`}
  >
    <div className="flex items-center space-x-2.5 mb-3">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
          isPaper ? 'bg-blue-600 text-white' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        }`}
      >
        <BookOpen className="w-4 h-4" />
      </div>
      <h3 className={`text-sm font-bold uppercase tracking-wider ${isPaper ? 'text-blue-900' : 'text-blue-300'}`}>
        Simple Explanation
      </h3>
    </div>
    <MarkdownRenderer
      content={block.text}
      theme={isPaper ? 'paper' : 'dark'}
      className="text-base font-normal leading-relaxed"
    />
  </div>
);

// =========================================================================
// 15. STEP BY STEP BLOCK
// =========================================================================
export const StepByStepBlock = ({ block, isPaper }) => (
  <div
    className={`p-5 rounded-2xl border transition-all shadow-sm ${
      isPaper
        ? 'bg-white border-slate-200 text-slate-900'
        : 'bg-slate-900/50 border-white/10 text-slate-100'
    }`}
  >
    <div className="flex items-center space-x-2.5 mb-4">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
          isPaper ? 'bg-indigo-600 text-white' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
        }`}
      >
        <CheckCircle2 className="w-4 h-4" />
      </div>
      <h3 className={`text-sm font-bold uppercase tracking-wider ${isPaper ? 'text-indigo-900' : 'text-indigo-300'}`}>
        {block.title || 'Step-by-Step Breakdown'}
      </h3>
    </div>
    <div className="space-y-3">
      {(block.steps || []).map((stepItem, idx) => (
        <div
          key={idx}
          className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
            isPaper
              ? 'bg-slate-50 border-slate-200 text-slate-800'
              : 'bg-[#080c14] border-white/5 text-slate-200'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
              isPaper
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
            }`}
          >
            {stepItem.step || idx + 1}
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold mb-1">{stepItem.title}</h4>
            <MarkdownRenderer
              content={stepItem.explanation}
              theme={isPaper ? 'paper' : 'dark'}
              className="text-xs leading-relaxed opacity-90"
              compact={true}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// =========================================================================
// 16. TAKEAWAYS BLOCK
// =========================================================================
export const TakeawaysBlock = ({ block, isPaper }) => (
  <div
    className={`p-5 rounded-2xl border transition-all shadow-sm ${
      isPaper
        ? 'bg-emerald-50/70 border-emerald-200 text-slate-900'
        : 'bg-emerald-950/20 border-emerald-500/30 text-slate-100'
    }`}
  >
    <div className="flex items-center space-x-2.5 mb-3">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
          isPaper ? 'bg-emerald-600 text-white' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        }`}
      >
        <CheckCircle2 className="w-4 h-4" />
      </div>
      <h3 className={`text-sm font-bold uppercase tracking-wider ${isPaper ? 'text-emerald-900' : 'text-emerald-300'}`}>
        Key Takeaways & Invariants
      </h3>
    </div>
    <ul className="space-y-2 text-xs leading-relaxed">
      {(block.items || []).map((item, idx) => (
        <li key={idx} className="flex items-start space-x-2">
          <span className="text-emerald-400 font-bold flex-shrink-0">✓</span>
          <div className="flex-1">
            <MarkdownRenderer content={item} theme={isPaper ? 'paper' : 'dark'} compact={true} />
          </div>
        </li>
      ))}
    </ul>
  </div>
);

// =========================================================================
// 17. MINI QUIZ BLOCK
// =========================================================================
export const MiniQuizBlock = ({ block, isPaper }) => {
  const [selectedAnswers, setSelectedAnswers] = React.useState({});
  const [revealed, setRevealed] = React.useState(false);

  const questions = block.questions || [];

  const handleSelect = (qIdx, optIdx) => {
    if (revealed) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const score = questions.reduce((acc, q, idx) => {
    return selectedAnswers[idx] === q.correctOptionIndex ? acc + 1 : acc;
  }, 0);

  return (
    <div
      className={`p-5 sm:p-6 rounded-2xl border transition-all shadow-sm space-y-5 ${
        isPaper
          ? 'bg-white border-cyan-200 text-slate-900'
          : 'bg-slate-900/60 border-cyan-500/30 text-slate-100'
      }`}
    >
      <div className="flex items-center justify-between border-b pb-3 border-white/5">
        <div className="flex items-center space-x-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isPaper ? 'bg-cyan-600 text-white' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
          </div>
          <h3 className={`text-sm font-bold uppercase tracking-wider ${isPaper ? 'text-cyan-900' : 'text-cyan-300'}`}>
            Knowledge Check (Mini Quiz)
          </h3>
        </div>
        {revealed && (
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            Score: {score} / {questions.length}
          </span>
        )}
      </div>

      <div className="space-y-5">
        {questions.map((q, qIdx) => {
          const picked = selectedAnswers[qIdx];

          return (
            <div
              key={qIdx}
              className={`p-4 rounded-xl border space-y-3 ${
                isPaper ? 'bg-slate-50 border-slate-200' : 'bg-[#080c14] border-white/5'
              }`}
            >
              <p className="text-xs sm:text-sm font-bold">
                {qIdx + 1}. {q.question}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options?.map((opt, optIdx) => {
                  const isSelected = picked === optIdx;
                  let optStyle = isPaper
                    ? 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                    : 'bg-[#0d1322] border-white/5 text-slate-300 hover:border-white/15';

                  if (revealed) {
                    if (optIdx === q.correctOptionIndex) {
                      optStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold';
                    } else if (isSelected) {
                      optStyle = 'bg-rose-500/20 border-rose-500/50 text-rose-300 line-through';
                    }
                  } else if (isSelected) {
                    optStyle = 'bg-cyan-600/30 border-cyan-500 text-cyan-200 font-bold shadow-sm';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(qIdx, optIdx)}
                      className={`p-3 rounded-xl border text-xs text-left transition-all ${optStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {revealed && q.explanation && (
                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed ${
                    isPaper ? 'bg-cyan-50 text-cyan-900' : 'bg-cyan-950/30 border border-cyan-500/20 text-cyan-300'
                  }`}
                >
                  <span className="font-bold">Explanation: </span>
                  <MarkdownRenderer content={q.explanation} theme={isPaper ? 'paper' : 'dark'} compact={true} />
                </div>
              )}
            </div>
          );
        })}

        <div className="flex items-center space-x-3 pt-2">
          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              disabled={Object.keys(selectedAnswers).length < questions.length}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all disabled:opacity-40"
            >
              Check Answers
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedAnswers({});
                setRevealed(false);
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-200 transition-all"
            >
              Reset Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// BLOCK REGISTRY MAP
// =========================================================================
const BLOCK_REGISTRY = {
  definition: DefinitionBlock,
  simple_explanation: SimpleExplanationBlock,
  key_points: KeyPointsBlock,
  formula: FormulaBlock,
  chart: ChartBlock,
  diagram: DiagramBlock,
  table: TableBlock,
  code: CodeBlockItem,
  syntax: CodeBlockItem,
  step_by_step: StepByStepBlock,
  example: ExampleBlock,
  real_life: RealLifeBlock,
  common_mistakes: CommonMistakesBlock,
  timeline: TimelineBlock,
  mnemonic: MnemonicBlock,
  quick_summary: QuickSummaryBlock,
  takeaways: TakeawaysBlock,
  mini_quiz: MiniQuizBlock,
};

/**
 * Determine if a block should span full width in grid layout
 */
export const isFullWidthBlock = (type) => {
  return (
    type === 'chart' ||
    type === 'diagram' ||
    type === 'table' ||
    type === 'code' ||
    type === 'timeline' ||
    type === 'step_by_step' ||
    type === 'mini_quiz'
  );
};

/**
 * Universal Block Dispatcher: skips unknown block types safely without crashing
 */
export const BlockRenderer = ({ block, isPaper }) => {
  if (!block || !block.type) return null;

  const Component = BLOCK_REGISTRY[block.type];
  if (!Component) {
    console.warn(`Unknown block type encountered and safely skipped: ${block.type}`);
    return null;
  }

  const isFull = isFullWidthBlock(block.type);

  return (
    <div className={`w-full ${isFull ? 'col-span-1 md:col-span-2' : 'col-span-1'} print:break-inside-avoid`}>
      <Component block={block} isPaper={isPaper} />
    </div>
  );
};

export default BlockRenderer;

