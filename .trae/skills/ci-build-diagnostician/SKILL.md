---
name: "ci-build-diagnostician"
description: "Diagnoses CI workflow failures, Docker build errors, GitHub Actions issues, and pipeline problems. Invoke when builds fail or CI shows errors."
---

# CI Build Diagnostician

This skill diagnoses and troubleshoots CI/CD pipeline failures including Docker builds, GitHub Actions, and other build-related issues.

## When to Invoke

- CI workflow fails
- Docker build breaks
- GitHub Actions shows errors
- Any build-related pipeline issues occur
- User reports build/deployment failures

## Diagnostic Steps

### Step 1: Identify the Failure Type
- Check if it's a Docker build issue
- Check if it's a GitHub Actions workflow issue
- Check if it's a dependency/installation issue
- Check if it's a test failure

### Step 2: Gather Information
```bash
# Check Docker build logs
docker build . 2>&1 | head -100

# Check GitHub Actions status
gh run list --limit 5

# View specific workflow run
gh run view <run-id>
```

### Step 3: Common Issues Checklist

#### Docker Build Issues
- [ ] Missing dependencies in Dockerfile
- [ ] Incorrect COPY paths
- [ ] .dockerignore excluding necessary files
- [ ] Base image version mismatch
- [ ] Environment variable issues

#### GitHub Actions Issues
- [ ] Workflow syntax errors
- [ ] Missing secrets
- [ ] Permission issues
- [ ] Runner environment problems
- [ ] Timeout issues

#### Dependency Issues
- [ ] Package version conflicts
- [ ] Missing package.json entries
- [ ] Lock file out of sync
- [ ] Registry access issues

### Step 4: Provide Solution

1. Clearly explain the root cause
2. Provide specific fix steps
3. Suggest preventive measures
4. Link to relevant documentation if needed

## Output Format

```
## Diagnosis

**Failure Type:** [Docker/GitHub Actions/Other]
**Root Cause:** [Description]

## Solution

1. [Step 1]
2. [Step 2]
3. [Step 3]

## Prevention

- [Recommendation 1]
- [Recommendation 2]
```
