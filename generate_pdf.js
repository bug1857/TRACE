const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const summaries = JSON.parse(fs.readFileSync('/tmp/summaries.json', 'utf8'));

let markdown = '# TRACE Application - Page Summaries & Code\n\n';

for (const [filePath, summary] of Object.entries(summaries)) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    const code = fs.readFileSync(fullPath, 'utf8');
    markdown += `## ${filePath}\n\n`;
    markdown += `**Summary**: ${summary}\n\n`;
    markdown += `### Code\n\n`;
    markdown += `\`\`\`tsx\n${code}\n\`\`\`\n\n`;
    markdown += `---\n\n`;
  } else {
    console.warn(`File not found: ${fullPath}`);
  }
}

fs.writeFileSync('trace-pages-summary.md', markdown);
console.log('Markdown generated. Converting to PDF...');

try {
  execSync('npx -y md-to-pdf trace-pages-summary.md');
  console.log('PDF generated successfully as trace-pages-summary.pdf.');
} catch (e) {
  console.error('Error generating PDF:', e.message);
  console.error(e.stdout ? e.stdout.toString() : '');
  console.error(e.stderr ? e.stderr.toString() : '');
}
