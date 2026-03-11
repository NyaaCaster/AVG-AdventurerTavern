# 战斗AI系统设计文档

## 1. 系统概述

### 1.1 设计目标

本系统为《冒险者酒馆》项目提供统一的自动战斗AI决策框架，支持敌人AI和队友AI共用核心决策逻辑，通过配置参数实现差异化行为。

### 1.2 设计原则

| 原则 | 描述 |
|------|------|
| 数据驱动 | AI行为由技能note标签配置，无需硬编码 |
| 统一架构 | 敌人和队友使用相同的AI核心，仅配置不同 |
| 可扩展性 | 支持自定义条件和目标选择策略 |
| 性能优先 | 条件解析结果缓存，减少重复计算 |

### 1.3 系统边界

**包含功能：**
- AI条件解析与评估
- 目标选择策略
- 行动选择算法
- AI风格切换

**不包含功能：**
- 技能执行逻辑（由skill-executor模块处理）
- 战斗流程管理（由BattleManager处理）
- 伤害计算（由damage模块处理）

---

## 2. 核心概念

### 2.1 AI风格系统

AI风格决定行动选择的基本逻辑：

| 风格 | 描述 | 选择逻辑 |
|------|------|----------|
| CLASSIC | 经典风格 | 基于评分权重随机选择，评分方差影响随机性 |
| GAMBIT | 优先级风格 | 按行动列表顺序选择第一个有效行动 |
| CASUAL | 条件随机风格 | 仅检查条件，随机选择满足条件的行动 |
| RANDOM | 完全随机 | 仅检查技能可用性，完全随机选择 |

### 2.2 AI等级系统

AI等级（0-100）影响条件检查的严格程度：

```
AI等级 = 100：严格检查所有条件
AI等级 = 50：50%概率忽略未满足的条件
AI等级 = 0：完全忽略条件
```

**设计用途：**
- 敌人AI通常使用100级
- 队友AI可根据难度设置调整等级
- 低等级AI表现更"愚蠢"，增加游戏友好度

### 2.3 评分方差系统

评分方差（0-9）控制Classic风格的选择随机性：

```
评分方差 = 0：仅选择最高评分行动
评分方差 = 3：评分差距在3以内的行动都有机会被选中
评分方差 = 9：几乎所有行动都可能被选中
```

**推荐配置：**
- 敌人AI：评分方差3（增加战斗变化性）
- 队友AI：评分方差1（更稳定的决策）

---

## 3. 条件系统

### 3.1 条件类型

#### 3.1.1 数值条件

| 条件类型 | 格式示例 | 说明 |
|----------|----------|------|
| HP百分比 | `User HP% <= 50` | 使用者HP百分比 |
| MP百分比 | `User MP% >= 30` | 使用者MP百分比 |
| HP绝对值 | `Target HP <= 100` | 目标HP绝对值 |
| MP绝对值 | `User MP >= 20` | 使用者MP绝对值 |

#### 3.1.2 状态条件

| 条件类型 | 格式示例 | 说明 |
|----------|----------|------|
| 拥有状态 | `Target Has State 4` | 目标拥有指定状态ID |
| 无状态 | `Target Not State 11` | 目标没有指定状态ID |
| 状态回合 | `User State 15 Turns === 0` | 状态剩余回合数 |

#### 3.1.3 Buff/Debuff条件

| 条件类型 | 格式示例 | 说明 |
|----------|----------|------|
| Buff层数 | `User atk buff stacks < 2` | 攻击力Buff层数 |
| Debuff层数 | `Target def debuff stacks > 0` | 防御力Debuff层数 |

#### 3.1.4 队伍条件

| 条件类型 | 格式示例 | 说明 |
|----------|----------|------|
| 存活成员 | `Target Team Alive Members >= 2` | 敌方存活人数 |
| 死亡成员 | `User Team Dead Members < 2` | 我方死亡人数 |

#### 3.1.5 特殊条件

| 条件类型 | 格式示例 | 说明 |
|----------|----------|------|
| 随机概率 | `30% Chance` | 随机概率触发 |
| 开关状态 | `$gameSwitches.value(3511) === false` | 游戏开关检查 |
| 变量值 | `$gameVariables.value(4049) === 0` | 游戏变量检查 |
| 伤害计算 | `0 < a.param(2) * 4 - b.param(3) * 2` | 预计算伤害大于0 |

### 3.2 条件逻辑

#### ALL条件（所有条件必须满足）

```
<All AI Conditions>
  User HP% <= 50%
  User MP% >= 20
  Target Not State 11
</All AI Conditions>
```

#### ANY条件（任一条件满足即可）

```
<Any AI Conditions>
  Target Has State 4
  Target Has State 10
  Target HP% <= 30%
</Any AI Conditions>
```

### 3.3 条件主体

| 主体 | 描述 | 适用场景 |
|------|------|----------|
| User | 行动使用者 | 检查自身状态 |
| Target | 技能目标 | 检查目标状态 |
| Lowest | HP最低的友方 | 治疗技能目标选择 |
| Highest | HP最高的敌方 | 吸收技能目标选择 |

---

## 4. 目标选择系统

### 4.1 目标选择策略

通过 `<AI Target: strategy>` 标签配置：

| 策略 | 描述 | 适用技能类型 |
|------|------|-------------|
| `lowest_hp` | HP绝对值最低 | 击杀技能 |
| `highest_hp` | HP绝对值最高 | 吸收技能 |
| `lowest_hp_percent` | HP百分比最低 | 治疗技能 |
| `highest_hp_percent` | HP百分比最高 | - |
| `highest_atk` | 攻击力最高 | 仇恨控制 |
| `lowest_atk` | 攻击力最低 | - |
| `highest_negative_state_count` | 负面状态最多 | 净化技能 |
| `random` | 随机选择 | - |

### 4.2 目标选择流程

```
┌─────────────────────────────────────────────────────────────┐
│                     目标选择流程                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 确定技能范围 (SkillScope)                                │
│     ├── ENEMY_SINGLE: 敌方单体                               │
│     ├── ENEMY_ALL: 敌方全体                                  │
│     ├── ALLY_SINGLE: 我方单体                                │
│     ├── ALLY_ALL: 我方全体                                   │
│     └── SELF: 自身                                          │
│                                                             │
│  2. 获取候选目标列表                                          │
│     ├── 根据技能范围筛选                                      │
│     └── 排除死亡/无效目标                                     │
│                                                             │
│  3. 应用目标选择策略                                          │
│     ├── 有AI Target标签: 按策略选择                           │
│     └── 无标签: 默认随机选择                                  │
│                                                             │
│  4. 返回目标列表                                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. 技能冷却系统

### 5.1 冷却机制概述

技能冷却系统确保AI不会在冷却期间重复使用同一技能，增加战斗策略性。

### 5.2 冷却配置

通过技能note标签配置冷却回合数：

```
<Cooldown: 3>
```

### 5.3 冷却追踪流程

```
┌─────────────────────────────────────────────────────────────┐
│                     冷却追踪流程                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 技能使用时                                               │
│     ├── 记录技能ID、使用回合、冷却回合数                       │
│     └── 存储到冷却映射表                                      │
│                                                             │
│  2. 行动选择时                                               │
│     ├── 检查技能是否在冷却中                                  │
│     ├── 计算剩余冷却回合 = 冷却回合 - (当前回合 - 使用回合)    │
│     └── 剩余回合 > 0 则跳过该技能                             │
│                                                             │
│  3. 战斗结束时                                               │
│     └── 清除所有冷却记录                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 冷却管理器接口

```typescript
interface CooldownTracker {
  /** 获取技能剩余冷却回合数 */
  getRemainingCooldown(skillId: number, currentTurn: number): number;
  /** 记录技能使用 */
  recordSkillUse(skillId: number, currentTurn: number, cooldown: number): void;
  /** 清除所有冷却记录 */
  clear(): void;
}
```

---

## 6. 行动选择算法

### 6.1 Classic风格算法

```
输入: 行动列表 actions, 评分方差 variance
输出: 选择的行动

1. 过滤有效行动（条件满足、技能可用）
2. 按评分降序排序
3. 计算最高评分 maxRating
4. 筛选评分 >= maxRating - variance 的行动
5. 从筛选结果中随机选择
```

### 5.2 Gambit风格算法

```
输入: 行动列表 actions
输出: 选择的行动

1. 按列表顺序遍历行动
2. 返回第一个有效行动
3. 若无有效行动，返回null
```

### 5.3 Casual风格算法

```
输入: 行动列表 actions
输出: 选择的行动

1. 过滤满足条件的行动
2. 从结果中随机选择
```

### 5.4 Random风格算法

```
输入: 行动列表 actions
输出: 选择的行动

1. 过滤技能可用的行动（MP足够、无禁用状态）
2. 从结果中随机选择
```

---

## 7. 敌人AI与队友AI

### 7.1 共同点

| 特性 | 敌人AI | 队友AI |
|------|--------|--------|
| 核心决策逻辑 | ✅ 共用 | ✅ 共用 |
| 条件解析器 | ✅ 共用 | ✅ 共用 |
| 目标选择器 | ✅ 共用 | ✅ 共用 |
| 行动选择器 | ✅ 共用 | ✅ 共用 |

### 7.2 差异点

| 特性 | 敌人AI | 队友AI |
|------|--------|--------|
| 默认AI风格 | CLASSIC | CLASSIC |
| 默认评分方差 | 3 | 1 |
| 行动来源 | EnemyData.actions | 已学习技能列表 |
| 目标阵营 | 玩家队伍 | 敌人队伍 |
| 条件严格度 | 100%（严格） | 可配置 |

### 7.3 数据流对比

#### 敌人AI数据流

```
EnemyData.actions
       │
       ▼
┌─────────────────┐
│   行动列表      │
│  (skillId,      │
│   rating,       │
│   condition)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  条件解析器     │ ← 技能note标签
│ ConditionParser │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  行动选择器     │ ← AI风格、评分方差
│ ActionSelector  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  目标选择器     │ ← AI Target策略
│ TargetSelector  │
└────────┬────────┘
         │
         ▼
    决策结果
```

#### 队友AI数据流

```
角色已学习技能列表
       │
       ▼
┌─────────────────┐
│   行动生成      │
│  (转换为        │
│   EnemyAction   │
│   格式)         │
└────────┬────────┘
         │
         ▼
    (同敌人AI流程)
```

---

## 8. 模块架构

### 8.1 文件结构

```
battle-system/ai/
├── index.ts              # 模块导出
├── types.ts              # 类型定义
├── ConditionParser.ts    # 条件解析器
├── ConditionEvaluator.ts # 条件评估器
├── TargetSelector.ts     # 目标选择器
├── ActionSelector.ts     # 行动选择器
├── CooldownManager.ts    # 冷却管理器
└── BattleAI.ts           # AI核心类
```

### 8.2 模块职责

| 模块 | 职责 | 输入 | 输出 |
|------|------|------|------|
| types.ts | 类型定义 | - | 接口、枚举、类型 |
| ConditionParser | 解析条件标签 | 技能note | SkillAIConfig |
| ConditionEvaluator | 评估条件 | AICondition, BattleUnit | boolean |
| TargetSelector | 选择目标 | SkillData, BattleUnit[] | BattleUnit[] |
| ActionSelector | 选择行动 | EnemyAction[], AIConfig | EnemyAction |
| CooldownManager | 追踪技能冷却 | 技能ID, 回合数 | 冷却状态 |
| BattleAI | 整合决策 | AIDecisionContext | AIDecisionResult |

### 8.3 依赖关系

```
BattleAI
    ├── ActionSelector
    │       ├── ConditionEvaluator
    │       │       └── ConditionParser
    │       └── CooldownManager
    ├── TargetSelector
    └── CooldownManager
```

---

## 9. 配置说明

### 9.1 技能note标签

#### 基础标签

```
<All AI Conditions>
  条件1
  条件2
</All AI Conditions>

<Any AI Conditions>
  条件1
  条件2
</Any AI Conditions>

<AI Target: lowest_hp>
<Cooldown: 3>
```

#### 条件示例

```
<All AI Conditions>
  User HP% <= 50%
  User MP% >= 10
  Target Not State 11
</All AI Conditions>

<Any AI Conditions>
  Target HP <= a.param(2) * 6 - b.param(3) * 2
  Target Has State 4
</Any AI Conditions>
```

### 9.2 AI配置参数

```typescript
interface AIConfig {
  style: AIStyle;        // AI风格
  level: number;         // AI等级 (0-100)
  ratingVariance: number; // 评分方差 (0-9)
}
```

### 9.3 默认配置

```typescript
// 敌人AI默认配置
const ENEMY_AI_CONFIG: AIConfig = {
  style: AIStyle.CLASSIC,
  level: 100,
  ratingVariance: 3
};

// 队友AI默认配置
const ALLY_AI_CONFIG: AIConfig = {
  style: AIStyle.CLASSIC,
  level: 100,
  ratingVariance: 1
};
```

---

## 10. 使用示例

### 10.1 敌人AI使用

```typescript
import { BattleAI, ENEMY_AI_CONFIG } from './battle-system/ai';

const ai = new BattleAI(ENEMY_AI_CONFIG);

const context: AIDecisionContext = {
  unit: enemyUnit,
  turnNumber: 3,
  playerUnits: playerParty,
  enemyUnits: enemyParty,
  availableActions: enemyData.actions,
  skillMap: skillDataMap
};

const decision = ai.makeDecision(context);

// decision.action: 选择的行动
// decision.skill: 对应的技能
// decision.targetIds: 目标ID列表
```

### 10.2 队友AI使用

```typescript
import { BattleAI, ALLY_AI_CONFIG } from './battle-system/ai';

const ai = new BattleAI(ALLY_AI_CONFIG);

// 将队友技能转换为行动格式
const actions = convertSkillsToActions(ally.learnedSkills);

const context: AIDecisionContext = {
  unit: allyUnit,
  turnNumber: 3,
  playerUnits: playerParty,
  enemyUnits: enemyParty,
  availableActions: actions,
  skillMap: skillDataMap
};

const decision = ai.makeDecision(context);
```

---

## 11. 性能优化

### 11.1 条件解析缓存

```typescript
// 条件解析结果缓存
const parseCache = new Map<string, SkillAIConfig>();

function parseSkillAIConfig(note: string): SkillAIConfig {
  if (parseCache.has(note)) {
    return parseCache.get(note)!;
  }
  // 解析并缓存...
}
```

### 11.2 条件评估优化

- 短路评估：ALL条件遇到false立即返回
- 快速路径：常见条件（HP%、随机概率）优先检查
- 避免重复计算：预计算百分比等常用值

### 11.3 目标选择优化

- 预筛选：先过滤有效目标再排序
- 延迟计算：仅在需要时计算属性值
- 缓存排序结果：相同策略复用结果

---

## 12. 扩展指南

### 12.1 添加新条件类型

1. 在 `types.ts` 中定义新条件接口
2. 在 `ConditionParser.ts` 中添加解析方法
3. 在 `ConditionEvaluator.ts` 中添加评估逻辑

### 12.2 添加新目标策略

1. 在 `types.ts` 的 `AITargetStrategy` 类型中添加
2. 在 `TargetSelector.ts` 中实现选择逻辑

### 12.3 添加新AI风格

1. 在 `types.ts` 的 `AIStyle` 枚举中添加
2. 在 `ActionSelector.ts` 中实现选择算法

---

## 13. 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| 1.0.0 | 2026-03-11 | 初始版本，实现核心AI框架 |
| 1.1.0 | 2026-03-11 | 补充冷却系统文档，更新模块架构和依赖关系 |

**维护者**: GLM
