---
name: "dockerfile-guardian"
description: "Verifies new files/directories are properly included in Dockerfile COPY instructions and not excluded by .dockerignore. Invoke when adding new files to project root."
---

# Dockerfile Guardian

This skill ensures new files and directories added to the project root are properly configured for Docker builds.

## When to Invoke

- New files are added to project root
- New directories are created in project root
- User mentions creating new configuration files
- User adds new source files to root level
- Before committing new root-level files

## What It Checks

### 1. Dockerfile COPY Instructions
- Are new files covered by existing COPY patterns?
- Do they need explicit COPY instructions?
- Are paths correctly specified?

### 2. .dockerignore Configuration
- Are new files accidentally excluded?
- Should they be included in the build context?
- Are patterns too broad or too narrow?

## Check Process

### Step 1: Identify New Files
```bash
# List recently added files
git status --short

# Check for untracked files in root
ls -la | grep -v "^\."
```

### Step 2: Check Dockerfile
```bash
# View COPY instructions
grep -n "COPY" Dockerfile
```

### Step 3: Check .dockerignore
```bash
# View ignore patterns
cat .dockerignore
```

### Step 4: Verify Coverage

For each new file/directory:
- [ ] Is it needed in the Docker image?
- [ ] Is it covered by a COPY pattern?
- [ ] Is it excluded by .dockerignore?
- [ ] Does it need special handling?

## Common Patterns

### Files That Need COPY
- Configuration files (*.json, *.yaml, *.env.example)
- Source code directories (src/, lib/, components/)
- Build files (package.json, tsconfig.json, Dockerfile)
- Asset directories (public/, assets/, static/)

### Files That Should Be Ignored
- Node modules (node_modules/)
- Build outputs (dist/, build/)
- Git files (.git/, .gitignore)
- IDE files (.idea/, .vscode/)
- Environment files (.env, .env.local)
- Cache directories (.cache/, __pycache__/)

## Output Format

```
## Dockerfile Check Report

### New Files Detected
- [filename] - [status: ✅ covered / ⚠️ needs attention / ❌ excluded]

### Recommendations
1. [Recommendation 1]
2. [Recommendation 2]

### Required Changes (if any)
[Dockerfile or .dockerignore modifications needed]
```

## Quick Fix Commands

```bash
# Add to Dockerfile (example)
echo "COPY new-file.json /app/" >> Dockerfile

# Remove from .dockerignore (example)
sed -i '/new-directory/d' .dockerignore
```
