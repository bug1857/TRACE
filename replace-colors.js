const fs = require('fs');
const path = require('path');

const colorMap = {
  '#FAFAF8': '#F8FAFC',
  '#F3F2EE': '#FFFFFF',
  '#E2E0D8': '#E2E8F0',
  '#1A1917': '#0F172A',
  '#6B6963': '#64748B',
  '#9B9891': '#94A3B8',
  '#2D6A4F': '#4338CA',
  '#E8F0EB': '#EEF2FF',
  '#C0392B': '#EF4444',
  '#FDECEA': '#FEF2F2',
  '#B45309': '#F59E0B',
  '#FEF3C7': '#FEF3C7',
  '#166534': '#10B981',
  '#DCFCE7': '#D1FAE5'
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

    // Case-insensitive replacement for each color
    for (const [oldColor, newColor] of Object.entries(colorMap)) {
      const regex = new RegExp(oldColor, 'gi');
      if (regex.test(content)) {
        content = content.replace(regex, newColor);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated colors in ${filePath}`);
    }
  });
});

console.log("Done updating colors.");
