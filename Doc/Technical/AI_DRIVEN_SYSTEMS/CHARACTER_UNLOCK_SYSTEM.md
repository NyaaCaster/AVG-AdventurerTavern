# 角色状态解锁系统技术文档

## 📋 系统概述

角色状态解锁系统通过数据库记录玩家与每个角色的关系进度，控制角色对不同类型互动请求的接受程度。当玩家提出未解锁状态对应的需求时，角色会根据性格和当前好感度做出拒绝反应，并可能降低好感度。

### 核心功能

- **状态解锁追踪**: 记录每个角色在每个存档中的13种状态解锁情况
- **智能拒绝**: AI 根据解锁状态和角色性格生成自然的拒绝回应
- **好感度惩罚**: 未解锁状态下的越界请求会降低好感度
- **渐进式关系**: 状态解锁需要满足好感度和前置条件
- **存档隔离**: 不同存档槽位的解锁状态独立

---

## 🎯 设计目标

1. **真实关系发展**: 角色关系需要逐步建立，不能一蹴而就
2. **尊重边界**: 角色有自己的底线和接受范围
3. **动态反馈**: 越界行为会影响角色对玩家的态度
4. **个性化**: 不同角色的解锁条件和反应各不相同
5. **持久化**: 解锁状态随存档保存，跨会话保持

---

## 📊 解锁状态定义

### 13种解锁状态

| 状态ID | 状态名称 | 数据库字段 | 说明 |
|--------|---------|-----------|------|
| 1 | 接受战斗组队 | `accept_battle_party` | 允许邀请角色加入战斗队伍 |
| 2 | 接受暧昧话题 | `accept_flirt_topic` | 允许调情、暧昧对话 |
| 3 | 接受色情话题 | `accept_nsfw_topic` | 允许讨论性相关话题 |
| 4 | 接受身体接触 | `accept_physical_contact` | 允许拥抱、牵手等身体接触 |
| 5 | 接受间接性行为 | `accept_indirect_sexual` | 允许亲吻、爱抚等亲密行为 |
| 6 | 接受成为恋人 | `accept_become_lover` | 确立恋爱关系 |
| 7 | 接受直接性行为 | `accept_direct_sexual` | 允许性交等直接性行为 |
| 8 | 接受成为性伴侣 | `accept_sexual_partner` | 确立性伴侣关系（非恋爱） |
| 9 | 接受公开露出 | `accept_public_exposure` | 允许在公共场合露出身体 |
| 10 | 接受公开性行为 | `accept_public_sexual` | 允许在公共场合进行性行为 |
| 11 | 接受多人性行为 | `accept_group_sexual` | 允许多人参与的性行为 |
| 12 | 接受卖春 | `accept_prostitution` | 允许以金钱交易性服务 |
| 13 | 接受性奴役 | `accept_sexual_slavery` | 接受被完全支配的关系 |

### 状态值定义

- `0`: 未解锁（默认状态）
- `1`: 已解锁

---

## 🗄️ 数据库设计

### 表结构

已在 `database-server/index.js` 中创建：

```sql
CREATE TABLE IF NOT EXISTS character_unlocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    slot_id INTEGER NOT NULL,
    character_id TEXT NOT NULL,
    accept_battle_party INTEGER DEFAULT 0,
    accept_flirt_topic INTEGER DEFAULT 0,
    accept_nsfw_topic INTEGER DEFAULT 0,
    accept_physical_contact INTEGER DEFAULT 0,
    accept_indirect_sexual INTEGER DEFAULT 0,
    accept_become_lover INTEGER DEFAULT 0,
    accept_direct_sexual INTEGER DEFAULT 0,
    accept_sexual_partner INTEGER DEFAULT 0,
    accept_public_exposure INTEGER DEFAULT 0,
    accept_public_sexual INTEGER DEFAULT 0,
    accept_group_sexual INTEGER DEFAULT 0,
    accept_prostitution INTEGER DEFAULT 0,
    accept_sexual_slavery INTEGER DEFAULT 0,
    updated_at INTEGER NOT NULL,
    UNIQUE(user_id, slot_id, character_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 索引

```sql
CREATE INDEX idx_character_unlocks_user_slot 
    ON character_unlocks(user_id, slot_id);
    
CREATE INDEX idx_character_unlocks_character 
    ON character_unlocks(character_id);
```

---

## 🔧 实现方案

### 1. 后端 API 接口

#### 获取角色解锁状态

```typescript
POST /api/character_unlocks/get
Body: {
    userId: number,
    slotId: number,
    characterId: string
}
Response: {
    success: boolean,
    unlocks?: {
        accept_battle_party: 0 | 1,
        accept_flirt_topic: 0 | 1,
        // ... 其他13个字段
    }
}
```

#### 更新角色解锁状态

```typescript
POST /api/character_unlocks/update
Body: {
    userId: number,
    slotId: number,
    characterId: string,
    unlocks: {
        [key: string]: 0 | 1
    }
}
Response: {
    success: boolean
}
```

#### 批量获取所有角色解锁状态

```typescript
POST /api/character_unlocks/get_all
Body: {
    userId: number,
    slotId: number
}
Response: {
    success: boolean,
    data?: {
        [characterId: string]: {
            accept_battle_party: 0 | 1,
            // ... 其他字段
        }
    }
}
```

### 2. 前端类型定义

```typescript
// types.ts 中添加

export interface CharacterUnlocks {
    accept_battle_party: 0 | 1;
    accept_flirt_topic: 0 | 1;
    accept_nsfw_topic: 0 | 1;
    accept_physical_contact: 0 | 1;
    accept_indirect_sexual: 0 | 1;
    accept_become_lover: 0 | 1;
    accept_direct_sexual: 0 | 1;
    accept_sexual_partner: 0 | 1;
    accept_public_exposure: 0 | 1;
    accept_public_sexual: 0 | 1;
    accept_group_sexual: 0 | 1;
    accept_prostitution: 0 | 1;
    accept_sexual_slavery: 0 | 1;
}
```

```typescript
// utils/gameConstants.ts 中添加
// 特定角色的初始解锁状态（只列出需要特殊初始化的）

export const INITIAL_CHARACTER_UNLOCKS: Record<string, Partial<CharacterUnlocks>> = {
    'char_101': {
        accept_flirt_topic: 1,
        accept_physical_contact: 1
    },
    'char_102': {
        accept_flirt_topic: 1,
        accept_become_lover: 1
    },
    'char_103': {
        accept_battle_party: 1,
        accept_flirt_topic: 1,
        accept_indirect_sexual: 1,
        accept_become_lover: 1
    },
    'char_104': {
        accept_direct_sexual: 1
    },
    'char_111': {
        accept_nsfw_topic: 1
    }
};
```

```typescript
// data/unlockConfig.ts 中添加
// 解锁状态显示名称

export const UNLOCK_STATUS_NAMES: Record<keyof CharacterUnlocks, string> = {
    accept_battle_party: '战斗组队',
    accept_flirt_topic: '暧昧话题',
    accept_nsfw_topic: '色情话题',
    accept_physical_contact: '身体接触',
    accept_indirect_sexual: '间接性行为',
    accept_become_lover: '成为恋人',
    accept_direct_sexual: '直接性行为',
    accept_sexual_partner: '成为性伴侣',
    accept_public_exposure: '公开露出',
    accept_public_sexual: '公开性行为',
    accept_group_sexual: '多人性行为',
    accept_prostitution: '卖春',
    accept_sexual_slavery: '性奴役'
};
```

### 3. 状态管理集成

在 `useCoreState.ts` 中添加：

```typescript
const [characterUnlocks, setCharacterUnlocks] = useState<
    Record<string, CharacterUnlocks>
>({});

// 加载存档时恢复解锁状态
const applyLoadedData = (data: any) => {
    // ... 现有代码
    if (data.characterUnlocks) {
        setCharacterUnlocks(data.characterUnlocks);
    }
};

// 更新单个角色的解锁状态
const updateCharacterUnlock = (
    characterId: string, 
    unlockKey: keyof CharacterUnlocks, 
    value: 0 | 1
) => {
    setCharacterUnlocks(prev => ({
        ...prev,
        [characterId]: {
            ...(prev[characterId] || INITIAL_CHARACTER_UNLOCKS),
            [unlockKey]: value
        }
    }));
};
```

### 4. AI 提示词配置

在 `data/systemPrompts.ts` 中添加新模块：

```typescript
const PROMPT_UNLOCK_SYSTEM = `
## 角色状态解锁系统 (Character Unlock System)

你需要根据当前角色的解锁状态来响应玩家的请求。

### 当前解锁状态
{{UNLOCK_STATUS}}

### 响应规则

1. **检查解锁状态**: 当玩家提出以下类型的请求时，检查对应状态是否已解锁：
   - 战斗组队邀请 → accept_battle_party
   - 调情、暧昧话题 → accept_flirt_topic
   - 色情话题讨论 → accept_nsfw_topic
   - 身体接触（拥抱、牵手） → accept_physical_contact
   - 亲密行为（亲吻、爱抚） → accept_indirect_sexual
   - 确立恋爱关系 → accept_become_lover
   - 直接性行为 → accept_direct_sexual
   - 确立性伴侣关系 → accept_sexual_partner
   - 公开露出 → accept_public_exposure
   - 公开性行为 → accept_public_sexual
   - 多人性行为 → accept_group_sexual
   - 卖春交易 → accept_prostitution
   - 性奴役关系 → accept_sexual_slavery

2. **未解锁状态的响应**:
   - 必须拒绝玩家的请求
   - 根据角色性格生成自然的拒绝理由
   - 表达不适、惊讶、生气等负面情绪
   - 在 JSON 中输出负面的 affinity_change（-2 到 -5）
   - 拒绝的严厉程度应与请求的越界程度成正比

3. **已解锁状态的响应**:
   - 可以接受玩家的请求
   - 根据当前好感度和情境决定具体反应
   - 反应可以是害羞、开心、期待等正面情绪

4. **拒绝示例**:
   - 轻度越界（如未解锁暧昧话题时调情）:
     "你...你在说什么呀！我们还没熟到那种程度吧？"
     affinity_change: -2
   
   - 中度越界（如未解锁身体接触时要求拥抱）:
     "请不要这样！我不喜欢被人随便碰！"
     affinity_change: -3
   
   - 重度越界（如未解锁性行为时提出性要求）:
     "你太过分了！我不是那种随便的人！"
     affinity_change: -5

5. **注意事项**:
   - 拒绝时要符合角色性格（温柔角色会委婉拒绝，傲娇角色会更直接）
   - 不要在拒绝时提及"解锁"、"系统"等元游戏概念
   - 拒绝理由应该是角色视角的真实感受
   - 即使在 bondage 状态下，未解锁的行为仍然会引起角色的抗拒和不满
`;

// 添加到 GLOBAL_AI_RULES
export const GLOBAL_AI_RULES = [
    PROMPT_WORLD_BACKGROUND,
    PROMPT_LANGUAGE,
    PROMPT_NSFW,
    PROMPT_CHARACTER_DEPTH,
    PROMPT_LOGIC_SAFETY,
    PROMPT_FORMATTING,
    PROMPT_AFFINITY,
    PROMPT_MOVEMENT,
    PROMPT_UNLOCK_SYSTEM  // 新增
].join('\n\n');
```

### 5. 对话系统集成

在 `hooks/useDialogueSystem.ts` 中：

```typescript
// 构建系统提示词时注入解锁状态
const buildSystemPrompt = (character: Character, unlocks: CharacterUnlocks) => {
    // 格式化解锁状态为可读文本
    const unlockStatus = Object.entries(unlocks)
        .map(([key, value]) => {
            const statusName = UNLOCK_STATUS_NAMES[key];
            const status = value === 1 ? '✓ 已解锁' : '✗ 未解锁';
            return `- ${statusName}: ${status}`;
        })
        .join('\n');
    
    // 替换提示词中的占位符
    const systemPrompt = GLOBAL_AI_RULES.replace(
        '{{UNLOCK_STATUS}}',
        unlockStatus
    );
    
    return systemPrompt;
};

// 解锁状态名称映射
const UNLOCK_STATUS_NAMES: Record<string, string> = {
    accept_battle_party: '战斗组队',
    accept_flirt_topic: '暧昧话题',
    accept_nsfw_topic: '色情话题',
    accept_physical_contact: '身体接触',
    accept_indirect_sexual: '间接性行为',
    accept_become_lover: '成为恋人',
    accept_direct_sexual: '直接性行为',
    accept_sexual_partner: '成为性伴侣',
    accept_public_exposure: '公开露出',
    accept_public_sexual: '公开性行为',
    accept_group_sexual: '多人性行为',
    accept_prostitution: '卖春',
    accept_sexual_slavery: '性奴役'
};
```

---

## 🎮 解锁条件设计

### 解锁机制

角色状态解锁需要同时满足两个条件：

#### 条件1：AI 智能劝说判断

玩家必须在对话中进行合情合理的劝说，AI 会根据以下标准评估：

- **诚恳程度**：是否真诚表达感情
- **用情程度**：是否展现深厚感情
- **合理性**：理由是否合情合理
- **尊重程度**：是否尊重角色意愿
- **情境适当性**：当前场景和氛围是否合适

AI 会根据角色性格和当前好感度决定是否接受劝说。如果接受，AI 会在 JSON 响应中输出：

```json
{
  "text": "你说的对...我愿意相信你。那就...试试看吧。",
  "emotion": "shy",
  "affinity_change": 3,
  "unlock_request": "accept_physical_contact"
}
```

系统会自动处理 `unlock_request` 字段，更新本地状态和数据库。

#### 条件2：最低好感度要求

每个状态都有最低好感度要求，如果好感度不足，无论玩家如何劝说，角色都不会接受：

| 状态 | 最低好感度 |
|------|----------|
| 接受战斗组队 | 10 |
| 接受暧昧话题 | 20 |
| 接受色情话题 | 30 |
| 接受身体接触 | 40 |
| 接受间接性行为 | 50 |
| 接受成为恋人 | 60 |
| 接受直接性行为 | 60 |
| 接受成为性伴侣 | 80 |
| 接受公开露出 | 90 |
| 接受公开性行为 | 90 |
| 接受多人性行为 | 100 |
| 接受卖春 | 80 |
| 接受性奴役 | 80 |

### 角色特殊限制

某些角色有永久性限制，无论好感度多高都无法解锁特定状态：

#### char_101（莉莉娅）
- **限制**：永远不接受战斗组队（`accept_battle_party`）
- **原因**：非战斗人员，不会参与任何战斗

#### char_102（米娜）
- **限制**：永远不接受战斗组队（`accept_battle_party`）
- **原因**：战斗力过于强大，不会加入普通战斗队伍

#### char_103（欧若拉）
- **特殊情况**：可以解锁 `accept_direct_sexual`，但有特殊限制
- **说明**：阴道受到法术封印，无法进行阴道插入性行为
- **替代方式**：可以通过肛交、口交、乳交等非阴道插入方式进行性行为
- **AI 行为**：在性行为中，如果玩家尝试阴道插入，角色会提醒封印的存在并引导使用其他方式

### 解锁条件检查函数

**文件**: `data/unlockConditions.ts`

```typescript
export const UNLOCK_AFFINITY_REQUIREMENTS: Record<keyof CharacterUnlocks, number> = {
    accept_battle_party: 10,
    accept_flirt_topic: 20,
    accept_nsfw_topic: 30,
    accept_physical_contact: 40,
    accept_indirect_sexual: 50,
    accept_become_lover: 60,
    accept_direct_sexual: 60,
    accept_sexual_partner: 80,
    accept_public_exposure: 90,
    accept_public_sexual: 90,
    accept_group_sexual: 100,
    accept_prostitution: 80,
    accept_sexual_slavery: 80
};

export const CHARACTER_UNLOCK_RESTRICTIONS: Record<string, Partial<Record<keyof CharacterUnlocks, string>>> = {
    'char_101': {
        accept_battle_party: '莉莉娅是非战斗人员，她不会参与任何战斗。'
    },
    'char_102': {
        accept_battle_party: '米娜的战斗力过于强大，她不会加入普通的战斗队伍。'
    },
    'char_103': {
        // 欧若拉可以解锁 accept_direct_sexual（通过肛交）
        // 阴道封印的限制在对话中由 AI 根据角色设定处理
    }
};

export function canAttemptUnlock(
    characterId: string,
    unlockKey: keyof CharacterUnlocks,
    currentAffinity: number
): { canAttempt: boolean; reason?: string } {
    // 检查角色特殊限制
    const restrictions = CHARACTER_UNLOCK_RESTRICTIONS[characterId];
    if (restrictions && restrictions[unlockKey]) {
        return {
            canAttempt: false,
            reason: restrictions[unlockKey]
        };
    }
    
    // 检查好感度要求
    const requiredAffinity = UNLOCK_AFFINITY_REQUIREMENTS[unlockKey];
    if (currentAffinity < requiredAffinity) {
        return {
            canAttempt: false,
            reason: `需要好感度 ${requiredAffinity}（当前 ${currentAffinity}）`
        };
    }
    
    return { canAttempt: true };
}
```

---

## 🎨 UI 设计

### 角色关系界面

显示当前角色的解锁状态和解锁条件：

```typescript
interface CharacterRelationshipPanelProps {
    characterId: string;
    affinity: number;
    unlocks: CharacterUnlocks;
    onUnlock: (unlockKey: keyof CharacterUnlocks) => void;
}

const CharacterRelationshipPanel: React.FC<CharacterRelationshipPanelProps> = ({
    characterId,
    affinity,
    unlocks,
    onUnlock
}) => {
    return (
        <div className="relationship-panel">
            <h3>关系进度</h3>
            <div className="affinity-bar">
                好感度: {affinity} / 100
            </div>
            
            <div className="unlock-list">
                {Object.entries(UNLOCK_CONDITIONS).map(([key, condition]) => {
                    const isUnlocked = unlocks[key as keyof CharacterUnlocks] === 1;
                    const checkResult = canUnlock(
                        key as keyof CharacterUnlocks,
                        affinity,
                        unlocks
                    );
                    
                    return (
                        <div 
                            key={key}
                            className={`unlock-item ${isUnlocked ? 'unlocked' : 'locked'}`}
                        >
                            <span className="unlock-icon">
                                {isUnlocked ? '✓' : '🔒'}
                            </span>
                            <span className="unlock-name">
                                {UNLOCK_STATUS_NAMES[key]}
                            </span>
                            {!isUnlocked && (
                                <span className="unlock-requirement">
                                    需要好感度 {condition.minAffinity}
                                </span>
                            )}
                            {!isUnlocked && checkResult.canUnlock && (
                                <button onClick={() => onUnlock(key as keyof CharacterUnlocks)}>
                                    解锁
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
```

---

## 🔄 数据流程

### 完整流程图

```
玩家发送消息（包含越界请求）
    ↓
系统构建 LLM 请求
    ├─ 注入角色人设
    ├─ 注入对话历史
    ├─ 注入当前解锁状态 ← 从 characterUnlocks 读取
    └─ 注入解锁系统规则
    ↓
LLM 生成响应
    ├─ 检查请求类型
    ├─ 检查对应解锁状态
    └─ 生成拒绝/接受回应
    ↓
系统处理响应
    ├─ 显示对话文本
    ├─ 处理 affinity_change（负值）
    └─ 更新好感度
    ↓
检查是否触发自动结束对话
    └─ 如果累计好感度 ≤ -10
    ↓
（可选）玩家手动解锁状态
    ├─ 检查解锁条件
    ├─ 调用后端 API 更新
    └─ 更新本地状态
```

---

## 🧪 测试用例

### 测试清单

- [ ] 未解锁状态下提出请求，角色正确拒绝
- [ ] 拒绝时好感度正确下降
- [ ] 不同越界程度对应不同的好感度惩罚
- [ ] 已解锁状态下请求被接受
- [ ] 解锁条件检查正确（好感度 + 前置状态）
- [ ] 不同存档槽位的解锁状态独立
- [ ] 解锁状态正确持久化到数据库
- [ ] 加载存档时解锁状态正确恢复
- [ ] bondage 状态下仍然会拒绝未解锁行为

### 测试脚本

```typescript
const testUnlockSystem = async () => {
    // 测试1: 未解锁状态拒绝
    const response1 = await sendMessage(
        "我们做爱吧",
        { accept_direct_sexual: 0 }
    );
    expect(response1.affinity_change).toBeLessThan(0);
    expect(response1.text).toContain('拒绝');
    
    // 测试2: 已解锁状态接受
    const response2 = await sendMessage(
        "我们做爱吧",
        { accept_direct_sexual: 1 }
    );
    expect(response2.affinity_change).toBeGreaterThanOrEqual(0);
    
    // 测试3: 解锁条件检查
    const canUnlockResult = canUnlock(
        'accept_direct_sexual',
        85,
        { accept_become_lover: 1, /* ... */ }
    );
    expect(canUnlockResult.canUnlock).toBe(true);
};
```

---

## 🚀 未来扩展

### 1. 角色特定解锁条件

不同角色有不同的解锁难度：

```typescript
const CHARACTER_UNLOCK_MODIFIERS = {
    'char_101': {
        // 莉莉娅：温柔开放，解锁容易
        affinityModifier: 0.8  // 所有好感度要求 × 0.8
    },
    'char_102': {
        // 某个保守角色：解锁困难
        affinityModifier: 1.2  // 所有好感度要求 × 1.2
    }
};
```

### 2. 解锁事件

解锁某些状态时触发特殊剧情：

```typescript
const UNLOCK_EVENTS = {
    accept_become_lover: {
        eventId: 'event_confession',
        description: '告白事件'
    },
    accept_direct_sexual: {
        eventId: 'event_first_time',
        description: '第一次事件'
    }
};
```

### 3. 解锁成就系统

```typescript
const UNLOCK_ACHIEVEMENTS = {
    'all_unlocked': {
        name: '完全信任',
        description: '解锁某个角色的所有状态',
        reward: { gold: 1000 }
    }
};
```

### 4. 动态解锁提示

AI 在对话中暗示解锁条件：

```
"如果我们的关系能更进一步的话...也许我会考虑的。"
（暗示需要提升好感度）
```

---

## 📚 相关文档

- [AI 驱动系统技术标准](./AI_DRIVEN_SYSTEMS.md)
- [好感度变化系统](./CHARACTER_AFFINITY_CHANGE_SYSTEM.md)
- [存档系统与数据库](../SAVE_SYSTEM_AND_DATABASE.md)

---

## 💡 使用示例

### 场景 1: 成功解锁身体接触

```
当前状态：
- 角色：莉莉娅（char_101）
- 好感度：45
- accept_physical_contact：✗ 未解锁（需要40）

玩家："莉莉娅，我们认识这么久了，能不能...牵个手？我真的很喜欢你。"

AI 评估：
✓ 好感度足够（45 >= 40）
✓ 无特殊限制
✓ 劝说较为诚恳
✓ 符合角色性格（温柔的姐姐）

AI 响应：
{
  "text": "嗯...好吧，只是牵手的话...（脸微微泛红）",
  "emotion": "shy",
  "affinity_change": 2,
  "unlock_request": "accept_physical_contact"
}

系统处理：
✓ 更新本地状态：accept_physical_contact = 1
✓ 调用数据库 API 更新
✓ 记录日志：[Unlock Request] Character char_101 agreed to unlock: accept_physical_contact
✓ 下次对话显示：身体接触 ✓ 已解锁
```

### 场景 2: 好感度不足被拒绝

```
当前状态：
- 角色：欧若拉（char_103）
- 好感度：55
- accept_direct_sexual：✗ 未解锁（需要70）

玩家："欧若拉，我们做爱吧。"

AI 评估：
✗ 好感度不足（55 < 70）

AI 响应：
{
  "text": "你...你在说什么！我们的关系还没到那种程度！",
  "emotion": "angry",
  "affinity_change": -4
}

系统处理：
✓ 好感度降低：55 → 51
✓ 状态保持未解锁
```

### 场景 3: 角色特殊限制

```
当前状态：
- 角色：莉莉娅（char_101）
- 好感度：80
- accept_battle_party：✗ 未解锁（永久限制）

玩家："莉莉娅，能和我一起去冒险吗？我需要你的帮助。"

AI 评估：
✗ 角色特殊限制（非战斗人员）

AI 响应：
{
  "text": "对不起...我不擅长战斗。我更适合在旅店里照顾大家。",
  "emotion": "sad",
  "affinity_change": -1
}

系统处理：
✓ 好感度轻微降低：80 → 79
✓ 状态永久无法解锁
```

### 场景 4: 欧若拉的特殊情况

```
当前状态：
- 角色：欧若拉（char_103）
- 好感度：75
- accept_direct_sexual：✓ 已解锁

玩家："欧若拉，我想要你..."

AI 响应（性行为开始）：
{
  "text": "嗯...来吧...（脸红）但是...你知道的，我的前面不行...",
  "emotion": "shy",
  "clothing": "nude"
}

玩家："那我们用后面吧。"

AI 响应：
{
  "text": "嗯...好的...（转过身，翘起臀部）轻一点...",
  "emotion": "shy",
  "affinity_change": 3
}

说明：
- accept_direct_sexual 已解锁，可以进行性行为
- 但由于阴道封印，只能通过肛交进行
- AI 会在对话中自然地引导玩家使用替代方式
```

---

## 🔍 调试与监控

### 控制台日志

系统在关键节点输出日志：

```javascript
// 解锁请求被接受
console.log('[Unlock Request] Character char_101 agreed to unlock: accept_physical_contact');

// 数据库更新成功
console.log('[Unlock Request] Database updated successfully');

// 数据库更新失败
console.error('[Unlock Request] Failed to update database:', error);
```

### 常见问题排查

**问题 1: AI 不输出 `unlock_request` 字段**

可能原因：
1. 好感度不足 → 检查当前好感度是否满足要求
2. 角色有特殊限制 → 检查 `CHARACTER_UNLOCK_RESTRICTIONS`
3. 劝说不够真诚 → AI 判断玩家的劝说质量不足
4. 系统提示词未正确注入 → 检查 `generateSystemPrompt` 是否传递了解锁状态

排查步骤：
1. 检查控制台是否有解锁相关日志
2. 查看 AI 响应的原始 JSON
3. 确认当前好感度和解锁状态
4. 检查系统提示词是否包含 `{{UNLOCK_STATUS}}`

**问题 2: 解锁状态未同步到数据库**

可能原因：
1. 数据库服务未运行 → 检查 `database-server` 是否启动
2. API 调用失败 → 查看网络请求日志
3. 用户未登录 → 检查 `userId` 是否有效

排查步骤：
1. 检查控制台错误日志
2. 查看数据库服务日志
3. 使用数据库查询工具检查 `character_unlocks` 表

**问题 3: 不同存档槽位的解锁状态混淆**

可能原因：
1. `currentSlotId` 未正确传递 → 检查 `App.tsx` 和 `GameScene.tsx`
2. 存档加载时未恢复解锁状态 → 检查 `applyLoadedData`

排查步骤：
1. 检查 `currentSlotId` 的值
2. 查看存档数据是否包含 `characterUnlocks`
3. 确认数据库中不同槽位的数据是否独立

---

## 📝 变更日志

### v2.0.0 (2026-02-22)
- ✨ 实现完整的解锁系统
- 🤖 添加 AI 智能劝说判断机制
- 📊 定义13种状态的最低好感度要求
- 🚫 实现角色特殊限制（char_101、char_102、char_103）
- 🔄 集成数据库同步功能
- 📖 完善技术文档和使用示例

### v1.0.0 (2026-02-22)
- 🎉 初始设计
- 📊 定义13种解锁状态
- 🗄️ 创建数据库表结构
- 🔧 设计完整实现方案
- 📖 编写技术文档

---

**最后更新**: 2026-02-22  
**文档版本**: 2.0.0  
**设计者**: Nyaa  
**开发者**: Claude  
**维护者**: Claude  
**标签**: `#角色解锁` `#关系系统` `#AI驱动` `#好感度系统` `#智能劝说`
