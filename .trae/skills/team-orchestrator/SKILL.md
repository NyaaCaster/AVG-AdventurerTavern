---
name: "team-orchestrator"
description: "Orchestrates multiple agents in parallel for complex analysis and problem solving. Invoke when user presents design requirements or bug reports requiring multi-module analysis."
---

# Team Orchestrator Skill

This skill orchestrates multiple agents working in parallel to analyze and solve complex problems efficiently.

## When to Invoke

- User presents a design requirement involving multiple modules
- User reports a bug that may span multiple files/systems
- User requests comprehensive analysis of a complex feature
- User asks for team-based problem solving approach

## Core Philosophy

**Divide and Conquer**: Break complex problems into specialized sub-tasks that can be processed in parallel by multiple agents.

## Agent Team Patterns

### Pattern 1: Module-Based Team

For problems spanning multiple code modules:

```
┌─────────────────────────────────────────────────────────────┐
│                    Team Orchestrator                         │
│                     (Main Agent)                             │
└─────────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   Agent A    │ │   Agent B    │ │   Agent C    │
    │  Module X    │ │  Module Y    │ │  Module Z    │
    └──────────────┘ └──────────────┘ └──────────────┘
```

### Pattern 2: Aspect-Based Team

For problems requiring different analysis perspectives:

```
┌─────────────────────────────────────────────────────────────┐
│                    Team Orchestrator                         │
└─────────────────────────────────────────────────────────────┘
                           │
     ┌─────────┬───────────┼───────────┬─────────┐
     ▼         ▼           ▼           ▼         ▼
  ┌──────┐ ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐
  │Logic │ │ Data │   │  UI  │   │  AI  │   │ CSS  │
  │Agent │ │Agent │   │Agent │   │Agent │   │Agent │
  └──────┘ └──────┘   └──────┘   └──────┘   └──────┘
```

## Workflow Steps

### Step 1: Problem Decomposition

Analyze the user's request and identify:

1. **Scope**: Which files/modules are affected?
2. **Aspects**: What types of analysis are needed?
3. **Dependencies**: Which tasks depend on others?

### Step 2: Agent Assignment

Create specialized agents based on the decomposition:

**For Battle System Issues:**
- Agent 1: Core Logic (BattleManager, skill-executor, damage)
- Agent 2: Status Effects (status-effects, buffs-debuffs)
- Agent 3: AI System (ai/* modules)
- Agent 4: Frontend (BattleScene, components)
- Agent 5: Data Flow (hooks, GameScene)

**For General Feature Development:**
- Agent 1: Data Models & Types
- Agent 2: Business Logic
- Agent 3: UI Components
- Agent 4: State Management
- Agent 5: Integration Points

### Step 3: Parallel Execution

Launch all agents in a SINGLE message with multiple Task tool calls:

```xml
<function_calls>
<Task subagent_type="search" description="Agent 1: Core Logic" query="..." response_language="zh-CN" />
<Task subagent_type="search" description="Agent 2: Status Effects" query="..." response_language="zh-CN" />
<Task subagent_type="search" description="Agent 3: AI System" query="..." response_language="zh-CN" />
<Task subagent_type="search" description="Agent 4: Frontend" query="..." response_language="zh-CN" />
<Task subagent_type="search" description="Agent 5: Data Flow" query="..." response_language="zh-CN" />
</function_calls>
```

### Step 4: Result Aggregation

After all agents complete:

1. Collect all findings
2. Identify overlapping issues
3. Prioritize by severity
4. Create unified fix plan

### Step 5: Sequential Fix Application

Apply fixes in order:
1. High severity issues first
2. Shared/dependency issues before isolated ones
3. Verify after each batch of fixes

## Agent Prompt Template

When creating agent tasks, use this structure:

```
你是[模块名称]分析专家。请检查以下文件中的问题：

**需要检查的文件：**
1. `path/to/file1.ts` - 描述
2. `path/to/file2.ts` - 描述

**需要检查的问题：**
1. **问题类型1**：具体描述
2. **问题类型2**：具体描述

**输出要求：**
1. 列出发现的所有问题（按严重程度分类）
2. 对每个问题提供具体的修复代码
3. 说明修复的原因和影响

请直接进行代码修复，不要只是报告问题。
```

## Severity Classification

| Level | Description | Action |
|-------|-------------|--------|
| **严重 (Critical)** | System crash, data loss, core functionality broken | Fix immediately |
| **中等 (Medium)** | Feature not working correctly, performance issues | Fix in current iteration |
| **轻微 (Minor)** | Code quality, minor UI issues, optimization | Fix when possible |

## Output Format

After team analysis completes:

```markdown
## 团队分析报告

### Agent 1: [模块名称]
- 发现问题: X 个
- 严重: X | 中等: X | 轻微: X
- 主要问题: [简要描述]

### Agent 2: [模块名称]
...

## 问题汇总

| 优先级 | 问题 | 文件 | 状态 |
|--------|------|------|------|
| 高 | 描述 | file.ts | 待修复 |
| 中 | 描述 | file.ts | 待修复 |

## 修复计划

1. [ ] 修复严重问题A
2. [ ] 修复严重问题B
3. [ ] 修复中等问题C
...
```

## Best Practices

### DO:
- ✅ Launch ALL agents in ONE message (parallel execution)
- ✅ Give each agent clear, specific scope
- ✅ Use consistent output format requirements
- ✅ Aggregate results before fixing
- ✅ Verify fixes after application

### DON'T:
- ❌ Launch agents one by one (serial execution)
- ❌ Give vague or overlapping scopes
- ❌ Skip result aggregation
- ❌ Apply fixes without prioritization
- ❌ Forget to verify after fixes

## Example: Battle System Bug

**User Request**: "战斗系统有问题，伤害计算不正确"

**Decomposition**:
- Scope: battle-system/*, hooks/useBattleSystem.ts, BattleScene.tsx
- Aspects: Core logic, UI display, data flow
- Dependencies: Core logic affects UI and data flow

**Agent Assignment**:
```
Agent 1: damage.ts, skill-executor.ts (伤害计算核心)
Agent 2: BattleManager.ts (战斗流程管理)
Agent 3: useBattleSystem.ts (数据传递)
Agent 4: BattleScene.tsx, DamagePopup.tsx (前端表现)
```

**Parallel Launch**: All 4 agents in one message

**Result Aggregation**: Collect findings, identify root cause

**Fix Application**: Fix core logic first, then UI, verify
