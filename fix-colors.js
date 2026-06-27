const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /bg-\[\#FAFAF8\]/g, replacement: 'bg-white/5 backdrop-blur-md' },
  { regex: /bg-\[\#F3F2EE\]/g, replacement: 'bg-white/5' },
  { regex: /bg-\[\#ECEAE4\]/g, replacement: 'bg-white/10' },
  { regex: /border-\[\#E2E0D8\]/g, replacement: 'border-trace-border' },
  { regex: /text-\[\#1A1917\]/g, replacement: 'text-trace-text' },
  { regex: /text-\[\#6B6963\]/g, replacement: 'text-trace-muted' },
  { regex: /text-\[\#9B9891\]/g, replacement: 'text-trace-subtle' },
  { regex: /text-\[\#2D6A4F\]/g, replacement: 'text-trace-accent' },
  { regex: /border-\[\#2D6A4F\]/g, replacement: 'border-trace-accent' },
  { regex: /bg-\[\#E8F0EB\]/g, replacement: 'bg-trace-accent/10' },
  { regex: /hover:bg-\[\#E8F0EB\]/g, replacement: 'hover:bg-trace-accent/10' },
  { regex: /hover:bg-\[\#F3F2EE\]/g, replacement: 'hover:bg-white/10' },
  { regex: /hover:bg-\[\#ECEAE4\]/g, replacement: 'hover:bg-white/10' },
  { regex: /hover:text-\[\#1A1917\]/g, replacement: 'hover:text-trace-text' },
  { regex: /hover:text-\[\#2D6A4F\]/g, replacement: 'hover:text-trace-accent' },
  { regex: /text-\[\#C0392B\]/g, replacement: 'text-rose-400' },
  { regex: /border-\[\#C0392B\]\/10/g, replacement: 'border-rose-400/10' },
  { regex: /bg-\[\#FDECEA\]/g, replacement: 'bg-rose-400/10' },
  { regex: /hover:bg-\[\#FDECEA\]/g, replacement: 'hover:bg-rose-400/10' },
  { regex: /hover:text-\[\#C0392B\]/g, replacement: 'hover:text-rose-400' },
  { regex: /text-\[\#166534\]/g, replacement: 'text-emerald-400' },
  { regex: /bg-\[\#DCFCE7\]/g, replacement: 'bg-emerald-400/10' },
  { regex: /bg-\[\#2D6A4F\]/g, replacement: 'bg-trace-accent' },
  { regex: /hover:bg-\[\#166534\]/g, replacement: 'hover:bg-trace-accent/80' },
  { regex: /text-\[\#E8F0EB\]/g, replacement: 'text-[#0B1120]' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated', fullPath);
      }
    }
  }
}

processDirectory('./app');
processDirectory('./components');
console.log('Done replacing colors.');
