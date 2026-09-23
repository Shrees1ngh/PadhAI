const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

const colorNames = [
  'slate', 'gray', 'zinc', 'neutral', 'stone', 
  'red', 'orange', 'amber', 'yellow', 'lime', 
  'green', 'emerald', 'teal', 'cyan', 'sky', 
  'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'
];

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

  for (const color of colorNames) {
    // Text -> black
    content = content.replace(new RegExp(`text-${color}-\\d+(\\/\\d+)?`, 'g'), 'text-black');
    content = content.replace(new RegExp(`text-${color}\b`, 'g'), 'text-black'); 
    
    // Backgrounds -> blue-900 (safest for buttons/boxes, backgrounds are usually white anyway)
    content = content.replace(new RegExp(`bg-${color}-\\d+(\\/\\d+)?`, 'g'), 'bg-blue-900');
    content = content.replace(new RegExp(`bg-${color}\b`, 'g'), 'bg-blue-900');
    
    // Borders -> blue-900
    content = content.replace(new RegExp(`border-${color}-\\d+(\\/\\d+)?`, 'g'), 'border-blue-900');
    content = content.replace(new RegExp(`border-${color}\b`, 'g'), 'border-blue-900');
    
    // Shadows, rings, gradients -> blue-900
    content = content.replace(new RegExp(`ring-${color}-\\d+(\\/\\d+)?`, 'g'), 'ring-blue-900');
    content = content.replace(new RegExp(`shadow-${color}-\\d+(\\/\\d+)?`, 'g'), 'shadow-blue-900');
    content = content.replace(new RegExp(`from-${color}-\\d+(\\/\\d+)?`, 'g'), 'from-blue-900');
    content = content.replace(new RegExp(`via-${color}-\\d+(\\/\\d+)?`, 'g'), 'via-blue-900');
    content = content.replace(new RegExp(`to-${color}-\\d+(\\/\\d+)?`, 'g'), 'to-blue-900');
    content = content.replace(new RegExp(`fill-${color}-\\d+(\\/\\d+)?`, 'g'), 'fill-blue-900');
    content = content.replace(new RegExp(`stroke-${color}-\\d+(\\/\\d+)?`, 'g'), 'stroke-blue-900');
  }

  // Handle blue variants specifically (we only want blue-900)
  content = content.replace(/bg-blue-(?!900\b)\d+(\/\d+)?/g, 'bg-blue-900');
  content = content.replace(/text-blue-(?!900\b)\d+(\/\d+)?/g, 'text-black');
  content = content.replace(/border-blue-(?!900\b)\d+(\/\d+)?/g, 'border-blue-900');
  content = content.replace(/shadow-blue-(?!900\b)\d+(\/\d+)?/g, 'shadow-blue-900');
  content = content.replace(/ring-blue-(?!900\b)\d+(\/\d+)?/g, 'ring-blue-900');
  content = content.replace(/from-blue-(?!900\b)\d+(\/\d+)?/g, 'from-blue-900');
  content = content.replace(/to-blue-(?!900\b)\d+(\/\d+)?/g, 'to-blue-900');

  // Strip opacities from the 3 allowed colors to enforce solid colors
  content = content.replace(/bg-blue-900\/\d+/g, 'bg-blue-900');
  content = content.replace(/bg-white\/\d+/g, 'bg-white');
  content = content.replace(/bg-black\/\d+/g, 'bg-black');
  content = content.replace(/border-blue-900\/\d+/g, 'border-blue-900');
  content = content.replace(/border-white\/\d+/g, 'border-white');
  content = content.replace(/border-black\/\d+/g, 'border-black');
  content = content.replace(/text-black\/\d+/g, 'text-black');
  content = content.replace(/text-white\/\d+/g, 'text-white');

  // Intelligent fix for text inside blue-900 boxes
  // If a class string contains both bg-blue-900 and text-black, change text-black to text-white
  content = content.replace(/className=(["'])(.*?)\1/g, (match, quote, classStr) => {
    if (classStr.includes('bg-blue-900') && classStr.includes('text-black')) {
      return `className=${quote}${classStr.replace(/text-black/g, 'text-white')}${quote}`;
    }
    return match;
  });

  // Ensure 'text-slate-600' etc (if any escaped) are handled
  // Actually the loop above should have caught them.

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

console.log('Enforcing strict 3-color palette...');
processDirectory(srcDir);
console.log('Done!');
