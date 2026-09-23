const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Remove glowing ambient blobs completely
  // Delete gradients (from-*, via-*, to-*)
  content = content.replace(/\b(from|via|to)-[a-z]+-\d+(\/\d+)?\b/g, '');
  content = content.replace(/\b(from|via|to)-(transparent|black|white)\b/g, '');
  // Delete blur classes
  content = content.replace(/\bblur-\[.*?\]\b/g, '');
  content = content.replace(/\bblur-(sm|md|lg|xl|2xl|3xl)\b/g, '');
  // Delete arbitrary glow classes
  content = content.replace(/\bglow-(purple|cyan)\b/g, '');

  // 2. Map all neutral/dark backgrounds to white
  const neutrals = ['slate', 'gray', 'zinc', 'neutral', 'stone'];
  for (const n of neutrals) {
    // bg-slate-900 -> bg-white (opacities dropped because white on white doesn't matter)
    content = content.replace(new RegExp(`\\bbg-${n}-\\d+(\\/\\d+)?\\b`, 'g'), 'bg-white');
    // text-slate-300 -> text-black
    content = content.replace(new RegExp(`\\btext-${n}-\\d+(\\/\\d+)?\\b`, 'g'), 'text-black');
    content = content.replace(new RegExp(`\\bborder-${n}-\\d+(\\/\\d+)?\\b`, 'g'), 'border-black');
  }

  // 3. Map all colorful accents/buttons to blue-900
  const colors = ['indigo', 'purple', 'cyan', 'blue', 'emerald', 'rose', 'amber', 'yellow', 'red', 'green', 'sky', 'teal', 'fuchsia', 'pink', 'violet'];
  for (const c of colors) {
    // If it's a background, it's probably a button or a badge. Make it dark blue.
    content = content.replace(new RegExp(`\\bbg-${c}-\\d+(\\/\\d+)?\\b`, 'g'), 'bg-blue-900');
    // If it's text, the user wants black text.
    content = content.replace(new RegExp(`\\btext-${c}-\\d+(\\/\\d+)?\\b`, 'g'), 'text-black');
    // Borders
    content = content.replace(new RegExp(`\\bborder-${c}-\\d+(\\/\\d+)?\\b`, 'g'), 'border-blue-900');
    // Rings
    content = content.replace(new RegExp(`\\bring-${c}-\\d+(\\/\\d+)?\\b`, 'g'), 'ring-blue-900');
    // Shadows
    content = content.replace(new RegExp(`\\bshadow-${c}-\\d+(\\/\\d+)?\\b`, 'g'), 'shadow-none'); // strip colored shadows
  }

  // 4. Ensure blue text inside blue boxes is white
  content = content.replace(/className=(["'])(.*?)\1/g, (match, quote, classStr) => {
    if (classStr.includes('bg-blue-900') && classStr.includes('text-black')) {
      return `className=${quote}${classStr.replace(/\btext-black\b/g, 'text-white')}${quote}`;
    }
    return match;
  });

  // 5. Clean up any accidental double spaces left by deleted classes
  content = content.replace(/className=(["'])\s+/g, 'className=$1');
  content = content.replace(/\s+(["'])/g, '$1');
  content = content.replace(/\s{2,}/g, ' ');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

console.log('Running safe B/W/Blue theme refactor...');
processDirectory(srcDir);
console.log('Done!');
