import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const HeroBackground = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Code snippets and programming symbols
  const codeSymbols = ['{ }', '</>', '=>', '[]', '()', ';;', '&&', '||', '!=', '==='];
  const codeSnippets = [
    'const ai = new Model();',
    'def learn():',
    'SELECT * FROM knowledge',
    'O(N log N)',
    'import torch',
    'std::vector<int>',
    'train(epochs=100)',
    'git commit -m "learn"'
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Base Dark Navy/Black Gradient with Radial Glows */}
      <div className="absolute inset-0 bg-[#0d1117]" />
      
      {/* Glowing Accents - Deep Purple and Blue */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[150px]" />
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-cyan-900/10 rounded-full blur-[100px]" />

      {/* 2. Grid Pattern (Subtle Holographic UI feel) */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, #000 70%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, #000 70%, transparent 100%)'
        }}
      />

      {/* 3. Floating Programming Symbols */}
      {codeSymbols.map((symbol, i) => (
        <motion.div
          key={`sym-${i}`}
          initial={{ 
            opacity: 0, 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight 
          }}
          animate={{ 
            opacity: [0.1, 0.4, 0.1], 
            y: [null, Math.random() * -50 - 20],
            x: [null, Math.random() * 40 - 20]
          }}
          transition={{ 
            duration: Math.random() * 10 + 10, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 5
          }}
          className="absolute text-[#58a6ff]/20 font-mono text-xl font-bold blur-[0.5px]"
        >
          {symbol}
        </motion.div>
      ))}

      {/* 4. Floating Code Snippets */}
      {codeSnippets.map((snippet, i) => (
        <motion.div
          key={`snip-${i}`}
          initial={{ 
            opacity: 0, 
            x: (i % 2 === 0 ? Math.random() * 300 : window.innerWidth - Math.random() * 300 - 200), 
            y: Math.random() * window.innerHeight 
          }}
          animate={{ 
            opacity: [0.05, 0.2, 0.05], 
            y: [null, Math.random() * -100 - 50]
          }}
          transition={{ 
            duration: Math.random() * 15 + 15, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 10
          }}
          className="absolute text-purple-400/20 font-mono text-sm whitespace-nowrap blur-[1px]"
        >
          {snippet}
        </motion.div>
      ))}

      {/* 5. Subtle SVG Neural Network / Connecting Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.05]">
        <pattern id="neural-net" width="100" height="100" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="2" fill="#58a6ff" />
          <circle cx="80" cy="50" r="2" fill="#bc8cff" />
          <circle cx="40" cy="90" r="2" fill="#58a6ff" />
          <path d="M20 20 L80 50 L40 90 Z" stroke="#58a6ff" strokeWidth="0.5" fill="none" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#neural-net)" />
      </svg>

      {/* 6. Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`part-${i}`}
          initial={{ 
            opacity: 0, 
            scale: 0,
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight 
          }}
          animate={{ 
            opacity: [0, 0.8, 0], 
            scale: [0, 1, 0],
            y: [null, Math.random() * -100 - 50]
          }}
          transition={{ 
            duration: Math.random() * 5 + 5, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: Math.random() * 5
          }}
          className="absolute w-1 h-1 bg-cyan-400/40 rounded-full blur-[1px]"
        />
      ))}

      {/* 7. Center Mask to Keep Text Readable (Low contrast in center) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1117]/50 via-[#0d1117]/80 to-[#0d1117] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0d1117_100%)] pointer-events-none opacity-80" />
    </div>
  );
};

export default HeroBackground;
