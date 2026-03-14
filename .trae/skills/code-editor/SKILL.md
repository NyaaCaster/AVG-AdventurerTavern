---
name: "code-editor"
description: "Efficient code editing workflow with parallel strategies. Invoke when user needs to edit multiple files, refactor code, or perform batch modifications."
---

# Code Editor Skill

This skill provides an efficient code editing workflow with parallel strategies for handling multiple file modifications.

## When to Invoke

- User needs to edit multiple files simultaneously
- User requests code refactoring across multiple modules
- User wants to perform batch modifications
- User asks for efficient code editing workflow

## Core Principles

### 1. Parallel Read Strategy

**ALWAYS read multiple files in a single tool call batch:**

```
✅ CORRECT: Send one message with multiple Read tool calls
❌ WRONG: Send multiple messages, each with one Read call
```

Example:
```xml
<function_calls>
<Read file_path="path/to/file1.ts" />
<Read file_path="path/to/file2.ts" />
<Read file_path="path/to/file3.ts" />
</function_calls>
```

### 2. Batch Edit Strategy

**Group related edits and apply them efficiently:**

- Use `SearchReplace` for targeted modifications
- Apply multiple edits in a single response when files are independent
- For dependent edits, apply sequentially but minimize context switches

### 3. Edit-Then-Verify Workflow

After completing edits:

1. **Run Build**: `npm run build`
2. **Run Type Check**: `npx tsc --noEmit`
3. **Report Results**: Summarize what was changed and verification status

## Workflow Steps

### Step 1: Analysis Phase

1. Identify all files that need modification
2. Understand the relationship between files (dependencies)
3. Plan the order of modifications (independent first, dependent later)

### Step 2: Read Phase

Read ALL relevant files in ONE batch:

```
Read file1.ts, file2.ts, file3.ts, file4.ts (parallel)
```

### Step 3: Edit Phase

**For independent files:**
- Apply edits to all independent files in one response batch

**For dependent files:**
- Edit base files first
- Then edit files that depend on them

### Step 4: Verification Phase

1. Run build command
2. Run type check
3. Report any errors found

## Best Practices

### SearchReplace Usage

- Always include enough context in `old_str` to uniquely identify the target
- Keep `old_str` and `new_str` concise but complete
- Include surrounding lines for context when needed

### Avoiding Common Mistakes

1. **Don't read files one by one** - batch read instead
2. **Don't make assumptions** - read the actual code first
3. **Don't skip verification** - always run build/typecheck after edits
4. **Don't forget dependencies** - check imports and related files

### Handling Large Refactors

For large-scale refactoring:

1. Create a todo list to track progress
2. Group files by module/feature
3. Edit one group at a time
4. Verify after each group
5. Move to next group only after verification passes

## Error Recovery

If build/typecheck fails:

1. Read the error messages carefully
2. Identify the root cause
3. Fix the specific issue
4. Re-run verification
5. Do not proceed until errors are resolved

## Output Format

After completing edits, provide:

```
## Edit Summary

| File | Changes | Status |
|------|---------|--------|
| file1.ts | Description | ✅ |
| file2.ts | Description | ✅ |

## Verification

- Build: ✅ Passed
- TypeCheck: ✅ Passed (or list errors)
```

## PowerShell Notes

When running commands in PowerShell:
- Use `;` as command separator, NOT `&&`
- Use single quotes for commit messages with special characters
- Example: `npm run build; npm run test`
