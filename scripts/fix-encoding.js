#!/usr/bin/env node
// Automatically fix HTML entity encoding issues in source files

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

let fixedFiles = 0;
let totalReplacements = 0;

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let fileReplacements = 0;
  
  htmlEntities.forEach(({ pattern, replacement, name }) => {
    const matches = content.match(pattern);
    if (matches) {
      content = content.replace(pattern, replacement);
      modified = true;
      fileReplacements += matches.length;
      console.log(`   - Replaced ${matches.length} instances of ${name}`);
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
    fixedFiles++;
    totalReplacements += fileReplacements;
  }
}

function fixDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'dist') {
        fixDirectory(fullPath);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (extensionsToCheck.includes(ext)) {
        fixFile(fullPath);
      }
    }
  }
}

console.log('Fixing HTML entity encoding in source files...');

dirsToCheck.forEach(dir => {
  const fullPath = path.join(rootDir, dir);
  if (fs.existsSync(fullPath)) {
    fixDirectory(fullPath);
  }
});

// Fix TypeScript files in root directory
const rootFiles = fs.readdirSync(rootDir);
rootFiles.forEach(file => {
  const ext = path.extname(file);
  if (extensionsToCheck.includes(ext)) {
    fixFile(path.join(rootDir, file));
  }
});

if (fixedFiles > 0) {
  console.log(`\nFixed ${fixedFiles} files, replaced ${totalReplacements} encoding issues`);
} else {
  console.log('\nNo encoding issues found');
}
