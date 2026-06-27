const fs = require('fs');
const path = require('path');

const colorMap = {
  '#F8FAFC': 'var(--background)',
  '#FFFFFF': 'var(--card)',
  '#E2E8F0': 'var(--border)',
  '#0F172A': 'var(--foreground)',
  '#64748B': 'var(--muted-foreground)',
  '#94A3B8': 'var(--trace-subtle)',
  '#4338CA': 'var(--primary)',
  '#EEF2FF': 'var(--accent)',
  '#EF4444': 'var(--destructive)',
  '#FEF2F2': 'var(--trace-danger-light)',
  '#F59E0B': 'var(--trace-warning)',
  '#FEF3C7': 'var(--trace-warning-light)',
  '#10B981': 'var(--trace-success)',
  '#D1FAE5': 'var(--trace-success-light)'
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
        callback(dirPath);
      }
    }
  });
}

const dirsToScan = ['app', 'components'];

dirsToScan.forEach(dir => {
  const fullDir = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullDir)) return;
  
  walkDir(fullDir, (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    for (const [hex, semantic] of Object.entries(colorMap)) {
      // Replace arbitrary tailwind values like [#4338CA] to [var(--primary)]
      const regex = new RegExp(`\\[${hex}\\]`, 'gi');
      if (regex.test(content)) {
        content = content.replace(regex, `[${semantic}]`);
        modified = true;
      }
      
      // Replace raw hex codes used in SVG charts or style objects
      const rawRegex = new RegExp(`['"]${hex}['"]`, 'gi');
      if (rawRegex.test(content)) {
        content = content.replace(rawRegex, `'${semantic}'`);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated to semantic in ${filePath}`);
    }
  });
});

console.log("Done updating to semantic.");
