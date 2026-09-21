import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Copy, Check } from 'lucide-react';

const CodeBlock = ({ className, children, theme = 'dark', ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const isPaper = theme === 'paper';
  const rawChildren = String(children || '');
  
  // react-markdown v10 has no `inline` prop on `code`.
  // Detect inline code: no language- class and no newline.
  const isInline = !match && !rawChildren.includes('\n');

  if (isInline) {
    return (
      <code
        className={
          isPaper
            ? 'px-1.5 py-0.5 rounded bg-slate-100 text-purple-700 font-mono text-xs border border-slate-300 font-semibold'
            : 'px-1.5 py-0.5 rounded bg-slate-800 text-purple-300 font-mono text-xs border border-white/10'
        }
        {...props}
      >
        {children}
      </code>
    );
  }

  const codeText = rawChildren.replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`my-3 rounded-xl overflow-hidden border font-mono text-xs ${
        isPaper
          ? 'border-slate-300 bg-slate-900 text-slate-100'
          : 'border-white/10 bg-[#070b12] text-slate-200'
      }`}
    >
      <div
        className={`flex items-center justify-between px-4 py-2 text-[11px] border-b ${
          isPaper
            ? 'bg-slate-800 text-slate-300 border-slate-700'
            : 'bg-slate-900/80 text-slate-400 border-white/5'
        }`}
      >
        <span className="uppercase tracking-wider font-semibold text-purple-300">
          {match ? match[1] : 'code'}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center space-x-1 hover:text-white transition-colors"
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
      <div className="p-4 overflow-x-auto">
        <pre className="m-0 leading-relaxed font-mono">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
};

export const MarkdownRenderer = ({
  content,
  className = '',
  theme = 'dark',
  compact = false,
}) => {
  if (!content) return null;

  const isPaper = theme === 'paper';

  const baseContainerClass = isPaper
    ? 'text-slate-800 leading-relaxed'
    : 'text-slate-200 leading-relaxed';

  return (
    <div className={`max-w-none text-sm ${baseContainerClass} ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code: (props) => <CodeBlock {...props} theme={theme} />,
          h1: ({ children }) => (
            <h1
              className={`text-2xl font-bold tracking-tight pb-2 border-b ${
                compact ? 'mt-3 mb-2' : 'mt-6 mb-3'
              } ${isPaper ? 'text-slate-900 border-slate-300' : 'text-white border-white/10'}`}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className={`text-xl font-bold tracking-tight ${
                compact ? 'mt-2.5 mb-1.5' : 'mt-5 mb-2.5'
              } ${isPaper ? 'text-indigo-900' : 'text-purple-300'}`}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={`text-base font-bold tracking-tight flex items-center space-x-2 ${
                compact ? 'mt-2 mb-1' : 'mt-4 mb-2'
              } ${isPaper ? 'text-slate-900' : 'text-white'}`}
            >
              <span>{children}</span>
            </h3>
          ),
          p: ({ children }) => (
            <p
              className={`${compact ? 'mb-0 leading-normal' : 'mb-3.5 leading-relaxed'} ${
                isPaper ? 'text-slate-800 font-normal' : 'text-slate-300 font-normal'
              }`}
            >
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul
              className={`list-disc pl-5 space-y-1 ${
                compact ? 'mb-0' : 'mb-3.5'
              } ${isPaper ? 'text-slate-800' : 'text-slate-300'}`}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className={`list-decimal pl-5 space-y-1 ${
                compact ? 'mb-0' : 'mb-3.5'
              } ${isPaper ? 'text-slate-800' : 'text-slate-300'}`}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={`leading-relaxed pl-1 ${isPaper ? 'text-slate-800' : 'text-slate-300'}`}>
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className={`border-l-4 rounded-r-xl px-4 py-2 ${
                compact ? 'my-1.5' : 'my-3.5'
              } ${
                isPaper
                  ? 'border-indigo-600 bg-indigo-50/80 text-slate-800'
                  : 'border-purple-500/80 bg-purple-500/10 text-slate-300'
              }`}
            >
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div
              className={`my-3 overflow-x-auto rounded-xl border ${
                isPaper ? 'border-slate-300' : 'border-white/10'
              }`}
            >
              <table
                className={`w-full text-left text-xs border-collapse ${
                  isPaper ? 'bg-white' : 'bg-slate-900/40'
                }`}
              >
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead
              className={`border-b font-semibold uppercase text-[11px] tracking-wider ${
                isPaper
                  ? 'bg-slate-100 text-slate-900 border-slate-300'
                  : 'bg-slate-900 text-white border-white/10'
              }`}
            >
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className={isPaper ? 'divide-y divide-slate-200' : 'divide-y divide-white/5'}>
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className={isPaper ? 'hover:bg-slate-50 transition-colors' : 'hover:bg-white/5 transition-colors'}>
              {children}
            </tr>
          ),
          th: ({ children }) => <th className="px-4 py-3">{children}</th>,
          td: ({ children }) => (
            <td className={`px-4 py-3 ${isPaper ? 'text-slate-800' : 'text-slate-300'}`}>
              {children}
            </td>
          ),
          hr: () => (
            <hr className={`my-4 ${isPaper ? 'border-slate-300' : 'border-white/10'}`} />
          ),
          strong: ({ children }) => (
            <strong className={`font-semibold ${isPaper ? 'text-slate-950 font-bold' : 'text-white'}`}>
              {children}
            </strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
