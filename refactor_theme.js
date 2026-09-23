const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'client', 'src');

const replacements = {
  // Backgrounds
  'bg-[#080c14]': 'bg-white',
  'bg-[#0b0f19]': 'bg-white',
  'bg-[#0d1322]': 'bg-blue-900', // assuming this was used for cards
  'bg-slate-950': 'bg-white',
  'bg-slate-900': 'bg-white',
  'bg-slate-800': 'bg-blue-900',
  'bg-slate-800/50': 'bg-blue-900/90',
  'bg-slate-800/80': 'bg-blue-900/90',
  'bg-white/5': 'bg-blue-800',
  'bg-white/10': 'bg-blue-700',
  'hover:bg-white/5': 'hover:bg-blue-800',
  'hover:bg-white/10': 'hover:bg-blue-700',
  'hover:bg-slate-800': 'hover:bg-blue-800',
  'bg-indigo-600': 'bg-blue-900',
  'hover:bg-indigo-500': 'hover:bg-blue-800',
  'bg-indigo-500/10': 'bg-blue-900/10',
  'bg-indigo-500/20': 'bg-blue-900/20',
  'bg-emerald-500/10': 'bg-emerald-100',
  'bg-rose-500/10': 'bg-rose-100',
  'bg-amber-500/10': 'bg-amber-100',
  'bg-blue-500/10': 'bg-blue-100',
  
  // Text colors
  'text-slate-100': 'text-black',
  'text-slate-200': 'text-slate-800',
  'text-slate-300': 'text-slate-700',
  'text-slate-400': 'text-slate-600',
  'text-slate-500': 'text-slate-600',
  'text-indigo-400': 'text-blue-900',
  'text-indigo-300': 'text-blue-800',
  'text-indigo-500': 'text-blue-900',
  
  // Notice: We don't replace 'text-white' globally because it will be correct on 'bg-blue-900' boxes.
  // But we might have some cases where text-white is used directly on the background.
  
  // Borders
  'border-white/10': 'border-blue-900/20',
  'border-white/20': 'border-blue-900/30',
  'border-slate-800': 'border-blue-900/20',
  'border-slate-700': 'border-blue-900/30',
  'border-indigo-500/20': 'border-blue-900/20',
  'border-indigo-500/30': 'border-blue-900/30',
  'border-indigo-500/50': 'border-blue-900/50',
  'border-emerald-500/30': 'border-emerald-500/30',
  
  // Shadows/Rings
  'shadow-indigo-500/20': 'shadow-blue-900/20',
  'shadow-indigo-600/30': 'shadow-blue-900/30',
  'ring-white/10': 'ring-blue-900/20',
  'ring-slate-800': 'ring-blue-900/20',
};

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Some specific hacks for App.jsx where it explicitly uses text-white on body-like containers
  if (filePath.endsWith('App.jsx')) {
    content = content.replace(/text-slate-100/g, 'text-black');
    content = content.replace(/text-white/g, 'text-black');
    // Re-replace for buttons where it needs to be white
    content = content.replace(/text-black(.*?)Sign In/g, 'text-white$1Sign In');
  } else if (filePath.endsWith('Hero.jsx')) {
     content = content.replace(/text-white/g, 'text-black');
     content = content.replace(/text-black(.*?)Get Started/g, 'text-white$1Get Started');
     content = content.replace(/from-white to-slate-400/g, 'from-black to-slate-700');
     content = content.replace(/from-indigo-400 to-purple-400/g, 'from-blue-900 to-blue-700');
  }

  for (const [search, replace] of Object.entries(replacements)) {
    // Escape regex characters just in case
    const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<!-)${safeSearch}(?!-)`, 'g');
    content = content.replace(regex, replace);
  }
  
  // More specific text fixes
  content = content.replace(/text-white(.*?)bg-blue-900/g, 'text-white$1bg-blue-900');
  content = content.replace(/bg-blue-900(.*?)text-black/g, 'bg-blue-900$1text-white');
  content = content.replace(/bg-blue-900\/10(.*?)text-white/g, 'bg-blue-900/10$1text-blue-900');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

console.log('Starting refactor script...');
processDirectory(srcDir);
console.log('Done!');
