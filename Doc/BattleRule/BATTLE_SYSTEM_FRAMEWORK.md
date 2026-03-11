# 战斗系统框架模型

> 本文档定义了战斗系统的核心架构与逻辑模型，作为后续开发的参考基准。

## 一、战斗类型

- **类型**：回合制战斗（类似 RPG Maker）
- **设计参考**：传统 JRPG 回合制战斗系统

---

## 二、阵营结构

| 阵营 | 最大单位数 | 说明 |
|------|-----------|------|
| 我方 | 4 | 玩家控制的角色 |
| 敌方 | 4 | AI 控制的敌人 |

---

## 三、死亡机制

### 3.1 死亡判定
- 任意战斗单位 **HP ≤ 0** 时判定为死亡

### 3.2 死亡后处理

| 阵营 | 死亡后行为 | 说明 |
|------|-----------|------|
| 敌方 | 从场上消失 | 无法被复活，不再参与战斗 |
| 我方 | 保留在场上 | 进入「死亡」状态，可被复活技能/道具复活 |

### 3.3 死亡状态特性
- 死亡单位无法行动
- 死亡单位仍可被选为目标（用于复活技能）
- 战斗结束后自动恢复

---

## 四、胜负判定

### 4.1 胜利条件
- **我方胜利**：敌方所有战斗单位死亡
- **敌方胜利**：我方所有战斗单位死亡

### 4.2 战斗结束
- 满足任意胜利条件时，战斗立即结束
- 结算经验值、掉落物品等

---

## 五、行动顺序

### 5.1 速度判定
- 按**敏捷值 (AGI)** 高低排序
- 敏捷值越高，越先行动

### 5.2 回合流程
```
回合开始
    ↓
按敏捷值排序所有存活单位
    ↓
依次执行各单位行动
    ↓
回合结束（处理状态效果等）
    ↓
进入下一回合
```

---

## 六、目标选择

### 6.1 距离系统
- **无距离概念**
- 所有单位可攻击任意敌方单位

### 6.2 站位系统
- **无站位概念**
- 不存在前后排区分
- 不存在范围伤害的位置衰减

---

## 七、相关文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 战斗系统规则 | `.DesDoc/battle/战斗系统规则.md` | 伤害计算、技能、状态等详细规则 |
| 角色战斗数值 | `services/characterBattleStats.ts` | 角色属性计算逻辑 |
| 战斗数据表 | `data/battle-data/` | 基础属性、技能、敌人、状态效果等数据 |
| 战斗系统代码 | `battle-system/` | 战斗系统底层逻辑实现 |

---

## 八、数据依赖

### 8.1 已有数据模块

```
data/battle-data/
├── base_stats_table.ts   # 基础属性成长表 (1-100级)
├── skills.ts             # 技能数据
├── enemies.ts            # 敌人数据
├── status_effects.ts     # 状态效果数据
└── exp_table.ts          # 经验值表
```

### 8.2 已有服务模块

```
services/
└── characterBattleStats.ts   # 角色战斗属性计算
```

---

## 九、已实现模块

```
battle-system/
├── types.ts              # 类型定义（BattleStats, BattleUnit, SkillData 等）
├── damage.ts             # 伤害计算器
├── healing.ts            # 治疗计算器
├── absorb.ts             # HP吸收计算器
├── status-effects.ts     # 状态效果管理器
├── buffs-debuffs.ts      # 增益/减益管理器
├── targeting.ts          # 目标选择器
├── skill-executor.ts     # 技能执行器
├── counter.ts            # 反击系统
├── formula-parser.ts     # RPG Maker 公式解析器
├── enemy-unit-factory.ts # 敌人战斗单位工厂
├── BattleManager.ts      # 战斗流程管理器
└── index.ts              # 统一导出
```

### 9.1 模块功能说明

| 模块 | 功能 |
|------|------|
| `types.ts` | 定义战斗系统所有接口、枚举和类型 |
| `damage.ts` | 物理/魔法伤害计算、暴击判定、伤害浮动 |
| `healing.ts` | HP回复计算、复活处理 |
| `absorb.ts` | HP吸收效果计算 |
| `status-effects.ts` | 状态效果应用、解除、回合结算 |
| `buffs-debuffs.ts` | 属性增益/减益管理 |
| `targeting.ts` | 根据技能范围选择目标 |
| `skill-executor.ts` | 技能执行流程、效果应用 |
| `counter.ts` | 反击触发判定与执行 |
| `formula-parser.ts` | 解析 RPG Maker 风格的伤害公式 |
| `enemy-unit-factory.ts` | 将敌人配置转换为 BattleUnit |
| `BattleManager.ts` | 战斗流程控制、回合管理、胜负判定 |

---

## 十、敌人战斗单位创建流程

### 10.1 数据来源

| 数据 | 来源 | 说明 |
|------|------|------|
| 敌人ID | `quest-list.ts` → `battle_config.enemies[].enemy_id` | 任务配置中的敌人ID |
| 敌人等级 | `quest-list.ts` → `star` | 任务星级（1-10） |
| 敌人行动 | `enemies.ts` → `actions` | AI行动配置 |
| 敌人特性 | `enemies.ts` → `traits` | 属性抗性、状态免疫等 |
| 基础属性 | `base_stats_table.ts` → `getBaseStats(level)` | 等级对应属性 |

### 10.2 创建流程

```typescript
import { createEnemyParty } from './battle-system';

// 从任务配置创建敌人队伍
const enemyUnits = createEnemyParty({
  enemies: quest.battle_config.enemies,  // [{ enemy_id: 101, position: 1 }, ...]
  enemyLevel: quest.enemy_level,          // 敌人等级 (1-99)
  statMultipliers: { atk: 120 }           // 可选：属性修正
});
```

### 10.3 属性命名对照

| BaseStats (数据层) | BattleStats (战斗层) | RPG Maker 公式 |
|-------------------|---------------------|----------------|
| `hp` | `maxHp`, `hp` | `mhp`, `hp` |
| `mp` | `maxMp`, `mp` | `mmp`, `mp` |
| `atk` | `atk` | `atk` |
| `def` | `def` | `def` |
| `matk` | `matk` | `mat` |
| `mdef` | `mdef` | `mdf` |
| `agi` | `agi` | `agi` |
| `luk` | `luk` | `luk` |
