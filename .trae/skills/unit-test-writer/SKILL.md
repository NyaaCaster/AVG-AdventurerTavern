---
name: "unit-test-writer"
description: "Writes comprehensive unit tests using multi-agent team mode. Invoke when user needs to create/update tests for modified modules, verify data flow, interfaces, or after code changes."
---

# Unit Test Writer Skill

This skill provides a systematic approach to writing comprehensive unit tests using multi-agent team mode for the AVG-AdventurerTavern project.

## When to Invoke

- User requests unit tests for modified/new modules
- User wants to verify data protection (no data loss/regression)
- User needs edge case coverage for game logic
- User asks for test coverage improvement
- After code modifications that need test verification
- User wants to verify data flow, interfaces, or project integration

## Test Framework

This project uses **Vitest** with the following configuration:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  }
});
```

**Commands:**
- `npm test` - Run all tests
- `npm run test:watch` - Watch mode
- `npm run test:coverage` - Generate coverage report

## Test Directory Structure

```
tests/
├── battle/                    # Battle system tests
│   ├── effects/               # Visual effects tests
│   │   ├── animations.test.ts
│   │   ├── damagePopup.test.ts
│   │   ├── leaderEffects.test.ts
│   │   ├── transitions.test.ts
│   │   ├── turnOrder.test.ts
│   │   ├── uiComponents.test.ts
│   │   └── unitStates.test.ts
│   ├── ai.test.ts
│   ├── damage.test.ts
│   ├── skillExecutor.test.ts
│   └── statusEffects.test.ts
├── coreState/                 # Core state management
│   ├── normalizeStats.test.ts
│   └── expSystem.test.ts
├── services/                  # Service layer tests
│   └── characterBattleStats.test.ts
├── utils/                     # Utility functions
│   └── random.test.ts
├── dataProtection.test.ts     # Data integrity tests
└── gameConstants.test.ts      # Constant validation
```

## Multi-Agent Team Mode Workflow

### Step 1: Identify Modified Modules

Before creating tests, identify all modified/new files in the current conversation:

1. Review conversation history for file changes
2. Categorize changes by module type:
   - Core logic (battle system, state management)
   - UI components (React components, styles)
   - Services (API calls, data processing)
   - Utilities (helper functions, constants)

### Step 2: Launch Parallel Agents

Launch multiple agents to analyze different aspects:

```typescript
// Agent 1: Core Logic Analysis
{
  task: "Analyze core logic in [files] for test coverage",
  focus: ["business logic", "data transformations", "state changes"]
}

// Agent 2: Data Flow Analysis
{
  task: "Trace data flow in [files] for validation tests",
  focus: ["input/output", "data transformations", "edge cases"]
}

// Agent 3: Interface Verification
{
  task: "Verify interfaces and contracts in [files]",
  focus: ["function signatures", "type definitions", "API contracts"]
}

// Agent 4: Integration Points
{
  task: "Identify integration points in [files]",
  focus: ["module dependencies", "external calls", "event handlers"]
}
```

### Step 3: Generate Test Plans

Each agent returns a structured test plan:

```typescript
interface TestPlan {
  module: string;
  testFile: string;
  testSuites: TestSuite[];
  priority: 'high' | 'medium' | 'low';
}

interface TestSuite {
  name: string;
  tests: TestCase[];
  coverage: string[];
}

interface TestCase {
  description: string;
  input: any;
  expected: any;
  edgeCase?: boolean;
}
```

### Step 4: Create/Update Test Files

Based on agent analysis, create or update test files:

1. **New modules**: Create new test file in appropriate directory
2. **Modified modules**: Update existing tests or add new test suites
3. **Deleted modules**: Remove corresponding test files

### Step 5: Run Tests and Verify

After writing tests:
1. Run `npm test` to verify all tests pass
2. Check for TypeScript errors
3. Report test results to user

## Test Writing Patterns

### 1. Data Protection Tests (Critical)

**Purpose:** Ensure user data is never lost or incorrectly modified.

```typescript
describe('Data Protection', () => {
  it('should NOT fallback when user has higher level', () => {
    const rawLevel = 50;
    const initialLevel = INITIAL_CHARACTER_LEVEL['char_102'] || 1;
    const safeLevel = Number(rawLevel) || initialLevel;
    
    expect(safeLevel).toBe(50); // User data preserved
  });

  it('should use initial value when data is missing', () => {
    const rawLevel = undefined;
    const initialLevel = INITIAL_CHARACTER_LEVEL['char_102'] || 1;
    const safeLevel = Number(rawLevel) || initialLevel;
    
    expect(safeLevel).toBe(99); // Initial value used
  });
});
```

### 2. Boundary Value Tests

```typescript
describe('Boundary Values', () => {
  it('should clamp level to minimum 1', () => {
    const result = normalizeLevel(0);
    expect(result).toBe(1);
  });

  it('should clamp level to maxLevel', () => {
    const result = normalizeLevel(999, 100);
    expect(result).toBe(100);
  });

  it('should handle level exactly at boundary', () => {
    const result = normalizeLevel(100, 100);
    expect(result).toBe(100);
  });
});
```

### 3. Edge Case Tests

```typescript
describe('Edge Cases', () => {
  it('should handle NaN', () => {
    const result = Number(NaN) || 1;
    expect(result).toBe(1);
  });

  it('should handle null', () => {
    const result = Number(null) || 1;
    expect(result).toBe(1);
  });

  it('should handle undefined', () => {
    const result = Number(undefined) || 1;
    expect(result).toBe(1);
  });

  it('should handle string number', () => {
    const result = Number('50') || 1;
    expect(result).toBe(50);
  });

  it('should handle invalid string', () => {
    const result = Number('invalid') || 1;
    expect(result).toBe(1);
  });
});
```

### 4. Visual Effects Tests

```typescript
describe('Visual Effects Configuration', () => {
  const ANIMATION_CONFIG = {
    fadeIn: { duration: 300, timing: 'ease-out' },
    screenShake: { duration: 500, timing: 'ease-out' },
    damageRise: { duration: 1200, timing: 'ease-out' },
  };

  it('fadeIn should have correct duration', () => {
    expect(ANIMATION_CONFIG.fadeIn.duration).toBe(300);
  });

  it('screenShake should be longer than fadeIn', () => {
    expect(ANIMATION_CONFIG.screenShake.duration)
      .toBeGreaterThan(ANIMATION_CONFIG.fadeIn.duration);
  });
});
```

### 5. Interface Contract Tests

```typescript
describe('Interface Contracts', () => {
  it('should implement required interface methods', () => {
    const service = new BattleService();
    expect(typeof service.initialize).toBe('function');
    expect(typeof service.execute).toBe('function');
    expect(typeof service.cleanup).toBe('function');
  });

  it('should return correct type', () => {
    const result = calculateDamage(attacker, defender);
    expect(result).toHaveProperty('value');
    expect(result).toHaveProperty('isCritical');
    expect(typeof result.value).toBe('number');
  });
});
```

## Test Priority Levels

### High Priority (Must Test)
- Data normalization functions
- Experience/level calculations
- Save/load operations
- Fallback logic (data protection)
- Core game formulas (damage, healing)
- Visual effects configuration

### Medium Priority (Should Test)
- Utility functions
- State transitions
- Equipment validation
- Skill availability checks
- UI component props

### Low Priority (Nice to Have)
- UI helpers
- Formatting functions
- Simple getters
- Static configurations

## Test Naming Convention

```typescript
// Pattern: should [expected behavior] when [condition]
it('should return initial level when data is missing', () => {});
it('should preserve user level when it exceeds initial', () => {});
it('should clamp affinity to 0-100 range', () => {});
it('should trigger upgrade when exp exceeds threshold', () => {});
```

## Verification Checklist

After writing tests, verify:

- [ ] All tests pass: `npm test`
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] Edge cases covered (null, undefined, NaN, 0, negative)
- [ ] Boundary values tested (min, max, boundary-1, boundary+1)
- [ ] Data protection verified (user data not lost)
- [ ] Fallback logic tested (missing data uses initial values)
- [ ] Interface contracts verified

## Output Format

After creating tests, provide:

```markdown
## Test Summary

**Modified Modules:** [list of modules]

**Test Files Created/Updated:**
- `tests/path/to/test.test.ts` (new/updated)

| Test Suite | Tests | Status |
|------------|-------|--------|
| Normal Cases | 5 | ✅ |
| Boundary Values | 4 | ✅ |
| Edge Cases | 6 | ✅ |
| Data Protection | 3 | ✅ |

**Verification:**
- Tests: ✅ 18 passed
- TypeScript: ✅ No errors
```

## Best Practices

1. **Test behavior, not implementation** - Focus on inputs and outputs
2. **One assertion per test** - Keep tests focused
3. **Use descriptive names** - Tests should document behavior
4. **Test the happy path first** - Then add edge cases
5. **Keep tests independent** - No shared state between tests
6. **Mock external dependencies** - Isolate the unit under test
7. **Verify data protection** - Critical for game saves
8. **Use multi-agent for complex modules** - Parallel analysis improves coverage

## Multi-Agent Execution Template

When user requests unit tests:

```
1. Identify modified files from conversation
2. Launch parallel agents:
   - Agent 1: Core logic analysis
   - Agent 2: Data flow analysis  
   - Agent 3: Interface verification
   - Agent 4: Integration points
3. Collect test plans from all agents
4. Create/update test files
5. Run `npm test`
6. Report results
```

## Common Test Scenarios by Module Type

| Module Type | Key Test Scenarios |
|-------------|-------------------|
| Battle System | Damage formulas, status effects, turn order, AI decisions |
| Visual Effects | Animation configs, timing, CSS values, transitions |
| State Management | Normalization, persistence, state transitions |
| Services | API contracts, error handling, data transformation |
| UI Components | Props validation, event handlers, rendering |
| Utilities | Pure functions, edge cases, boundary values |
