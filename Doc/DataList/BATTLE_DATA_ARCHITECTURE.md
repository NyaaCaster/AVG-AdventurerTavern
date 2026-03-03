# 战斗数据架构与引用逻辑指南 (Battle Data Architecture)

本文档旨在概述项目中用于战斗及相关系统（如角色成长、道具使用、异常状态结算等）的核心数据结构及其相互之间的引用逻辑。本项目采用了**数据驱动 (Data-Driven)** 和 **SoA (Structure of Arrays)** 的设计模式，以实现高度的扩展性和极致的查询性能。

---

## 1. 核心目录与文件分布

所有的战斗强相关静态数据主要分布在以下目录和文件中：

- **`data/battle-data/`** (战斗核心数值表与规则字典)
  - `base_stats_table.ts`: 1~100 级基础属性成长表（包含 HP/MP/ATK 等的极速查表函数）。
  - `exp_table.ts`: 1~100 级升级所需的静态总经验值表。
  - `status_effects.ts`: 异常状态枚举与战斗引擎规则配置表。
- **`data/characters/`** (角色个体数据)
  - `char_*.ts`: 各角色的导出配置文件中，包含了 `battleData` 节点，定义了该角色特有的数值修正比例、职业设定与技能解锁等级。
- **`data/`** (泛用物品系统，兼顾战斗)
  - `item-equip.ts`: 战斗装备数据（武器、防具、饰品等），包含加成属性 `stats`。
  - `item-itm.ts`: 战斗与地图消耗品道具数据，包含恢复与状态影响配置 `consumableEffects`。

---

## 2. 角色战斗面板属性的计算逻辑

在本项目中，角色的“最终面板属性”是在运行时动态计算合成的，任何系统都不应直接存储角色的最终战斗数值。计算流程分为以下三步：

### 第一步：获取基础属性 (Base Stats)
角色当前等级决定了其肉体强度的基准值。通过查表函数极速获取：
```typescript
import { getBaseStats } from '../data/battle-data/base_stats_table';
const base = getBaseStats(character.level);
// base 包含: hp, mp, atk, def, matk, mdef, agi, luk
```

### 第二步：角色个体数值修正 (Character Multipliers)
每个角色由于职业或人设的不同，对基础属性有不同的放大/缩小比例。该数据存储在角色个体的 `battleData.statMultipliers` 中。
```typescript
// 修正后的攻击力 = 基础攻击力 * (角色攻击力修正比率 / 100)
const rawAtk = Math.round(base.atk * (character.battleData.statMultipliers.atk / 100));
```

### 第三步：装备数值加成 (Equipment Stats)
读取角色当前穿戴的装备，遍历累加其 `stats` 属性。由于装备属性（`ItemStats`）与基础属性字典（`BaseStats`）使用了完全一致的键名（如 `atk`, `matk`），可以通过循环优雅地合成：
```typescript
import { ITEMS_EQUIP } from '../data/item-equip';

// ... 将 rawAtk 等结合装备属性，得出最终面板
let finalAtk = rawAtk + (equippedWeapon.stats.atk || 0) + (equippedArmor.stats.atk || 0);
```

---

## 3. 经验值与等级成长系统

由于直接在引擎中进行幂运算和浮点运算存在性能消耗及潜在的边界 BUG，本项目将复杂的经验公式前置计算，沉淀为了静态经验表：

- **引用位置**: `data/battle-data/exp_table.ts` 中的 `EXP_TABLE` 数组。
- **判断逻辑**: 
  数组的索引（Index）严格对应角色的等级。例如 `EXP_TABLE[50]` 的值就是升到 50 级所需的**总累计经验**。
  ```typescript
  if (character.totalExp >= EXP_TABLE[character.level + 1]) {
      // 触发升级逻辑
  }
  ```

---

## 4. 消耗品道具与异常状态引擎

为了保持战斗代码的简洁，避免大量的 `switch(itemId)` 硬编码，异常状态和消耗品道具全面实现了数据抽象。

### 异常状态配置 (`status_effects.ts`)
每个状态包含完整的引擎规则：
- `defaultDuration`: 持续回合数（`-1` 为永久）。
- `skipTurn`: 为 `true` 时战斗系统将直接跳过该角色的行动（如死亡、晕眩、昏睡）。
- `persistAfterBattle`: 决定该状态是否在战斗结束后继续保留在角色身上（如 `horny` 发情保留，`poison` 中毒自动清除）。

### 消耗品效果配置 (`item-itm.ts`)
在 `ItemData.consumableEffects` 中定义：
- `recoverHpPercent` / `recoverMpPercent`: 恢复百分比（0.0 ~ 1.0）。
- `removeStatus`: 使用后解除的状态ID数组（例如清醒药包含 `['sleep', 'stun']`）。
- `applyStatus`: 使用后附带的状态ID数组（例如女神遗香包含 `['horny']`）。
- `revive`: 是否为复活道具（仅限对 `dead` 状态目标使用）。

**引擎执行范例**：
```typescript
function useConsumable(item, target) {
  const effects = item.consumableEffects;
  if (!effects) return;
  
  if (effects.recoverHpPercent) target.hp += target.maxHp * effects.recoverHpPercent;
  if (effects.removeStatus) target.status = target.status.filter(s => !effects.removeStatus.includes(s));
  if (effects.applyStatus) target.status.push(...effects.applyStatus);
}
```

---

## 总结
通过这种将**核心机制参数化、数值增长静态化、接口字段统一化**的数据架构，游戏的战斗系统被解耦为了纯粹的“规则执行器”。无论是添加新的极品武器、设计新的连环剧毒状态，还是调整角色的后期成长难度，都不需要再修改任何一行逻辑代码，仅需调整 `data/` 下对应的 `.ts` 配置文件即可。
