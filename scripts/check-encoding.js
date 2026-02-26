#!/usr/bin/env node
// Check for HTML entity encoding issues in source files

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const htmlEntities = [
  { pattern: /&gt;/g, replacement: '>', name: '&gt;' },
  { pattern: /&lt;/g, replacement: '<', name: '&lt;' },
  { pattern: /&quot;/g, replacement: '"', name: '&quot;' },
  { pattern: /&amp;/g, replacement: '&', name: '&amp;' },
  { pattern: /&#39;/g, replacement: "'", name: '&#39;' },
];

const dirsToCheck = ['components', 'services', 'utils', 'hooks', 'data'];
const extensionsToCheck = ['.ts', '.tsx', '.js', '.jsx'];

let foundIssues = false;

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let hasIssue = false;
  
  htmlEntities.forEach(({ pattern, name }) => {
    if (pattern.test(content)) {
      if (!hasIssue) {
        console.log(`\nFound encoding issue: ${filePath}`);
        hasIssue = true;
        foundIssues = true;
      }
      const matches = content.match(pattern);
      console.log(`   - Found ${matches.length} instances of ${name}`);
    }
  });
  
  return hasIssue;
}

function checkDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'dist') {
        checkDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (extensionsToCheck.includes(ext)) {
        checkFile(fullPath);
      }
    }
  }
}

console.log('Checking source files for HTML entity encoding...');

dirsToCheck.forEach(dir => {
  const fullPath = path.join(rootDir, dir);
  if (fs.existsSync(fullPath)) {
    checkDirectory(fullPath);
  }
});

// Check TypeScript files in root directory
const rootFiles = fs.readdirSync(rootDir);
rootFiles.forEach(file => {
  const ext = path.extname(file);
  if (extensionsToCheck.includes(ext)) {
    checkFile(path.join(rootDir, file));
  }
});

if (foundIssues) {
  console.log('\nEncoding issues found! Please fix before committing.');
  process.exit(1);
} else {
  console.log('\nNo encoding issues found');
  process.exit(0);
}
