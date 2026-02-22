# 角色移动系统技术文档

## 📋 系统概述

角色移动系统允许 AI 根据对话内容判断角色是否同意前往某个场景，并通过 JSON 输出指令让游戏自动移动角色，实现动态的角色位置管理。

### 核心功能

- **智能判断**: AI 自主判断角色是否同意移动
- **自动定位**: 系统自动更新角色在世界中的位置
- **视觉反馈**: 通过通知告知玩家角色的移动
- **强制定位**: 支持临时覆盖角色的日程表定位

---

## 🎯 设计目标

1. **剧情驱动**: 角色移动自然融入对话剧情
2. **玩家引导**: 帮助玩家在不同场景找到角色
3. **灵活控制**: 支持临时和永久的位置变更
4. **状态管理**: 正确处理移动的生命周期

---

## 📊 数据结构

### AI 响应格式

```typescript
interface AIResponse {
    text: string;
    emotion?: string;
    move_to?: string;  // 目标场景 ID
    // ... 其他字段
}
```

**示例**:
```json
{
    "text": "好啊，我们一起去温泉吧。",
    "emotion": "happy",
    "move_to": "scen_7",
    "affinity_change": 2
}
```

### 场景 ID 列表

| 场景 ID | 场景名称 | 说明 | 常见用途 |
|---------|---------|------|----------|
| `scen_1` | 柜台 | 旅店前台 | 接待、登记 |
| `scen_2` | 客房 | 角色的房间 | 休息、私密对话 |
| `scen_3` | 酒场 | 酒馆大厅 | 社交、饮酒 |
| `scen_4` | 训练场 | 武器训练区 | 训练、切磋 |
| `scen_5` | 武器店 | 武器商店 | 购买武器 |
| `scen_6` | 防具店 | 防具商店 | 购买防具 |
| `scen_7` | 温泉 | 温泉浴场 | 放松、亲密场景 |
| `scen_8` | 按摩室 | 按摩房间 | 按摩、放松 |
| `scen_9` | 库房 | 仓库 | 存储、整理 |
| `scen_10` | 道具店 | 道具商店 | 购买道具 |

### 场景数据定义

```typescript
interface Scene {
    id: string;           // 场景 ID
    name: string;         // 显示名称
    description: string;  // 描述
    background?: string;  // 背景图片
    music?: string;       // 背景音乐
}

// 场景名称映射
const SCENE_NAMES: Record<string, string> = {
    'scen_1': '柜台',
    'scen_2': '客房',
    'scen_3': '酒场',
    'scen_4': '训练场',
    'scen_5': '武器店',
    'scen_6': '防具店',
    'scen_7': '温泉',
    'scen_8': '按摩室',
    'scen_9': '库房',
    'scen_10': '道具店'
};
```

---

## 🔧 实现细节

### 1. AI 提示词配置

**文件**: `data/systemPrompts.ts`

```typescript
const PROMPT_MOVEMENT = `
## 角色移动指令 (Move)

### 可用场景列表：
- scen_1: 柜台 (旅店前台)
- scen_2: 客房 (角色自己的房间)
- scen_3: 酒场 (酒馆大厅)
- scen_4: 训练场 (武器训练区)
- scen_5: 武器店 (武器商店)
- scen_6: 防具店 (防具商店)
- scen_7: 温泉 (温泉浴场)
- scen_8: 按摩室 (按摩房间)
- scen_9: 库房 (仓库)
- scen_10: 道具店 (道具商店)

### 触发条件：
当玩家建议或命令角色前往上述某个场景，并且角色**明确同意**时，在 JSON 中包含 "move_to": "场景ID" 字段。

### 特殊规则：
1. 如果玩家说"回房间"、"回去休息"等指代回到角色自己房间的指令，目标场景ID为 "scen_2"
2. 仅当角色真正决定移动时才输出此指令
3. 如果角色拒绝或犹豫，不要输出此字段

### 示例：
玩家: "要不要一起去温泉？"
角色同意 → 输出 "move_to": "scen_7"
角色拒绝 → 不输出 move_to 字段
`;
```

**关键点**:
- 完整列出所有可用场景
- 明确触发条件（角色必须同意）
- 说明特殊情况（如"回房间"）
- 提供正反示例

### 2. 强制定位系统

**文件**: `hooks/useWorldSystem.ts`

```typescript
// 强制定位状态（覆盖日程表）
const [forcedLocations, setForcedLocations] = useState<Record<string, string>>({});

// 角色位置计算
useEffect(() => {
    const characterLocations: Record<string, string> = {};
    
    Object.keys(CHARACTERS).forEach(charId => {
        const char = CHARACTERS[charId];
        
        // 1. 检查是否有强制定位
        if (forcedLocations[charId]) {
            characterLocations[charId] = forcedLocations[charId];
        } else {
            // 2. 使用日程表定位
            const schedule = char.schedule?.[worldState.period];
            if (schedule && schedule.length > 0) {
                characterLocations[charId] = schedule[0];
            }
        }
    });
    
    setCharacterLocations(characterLocations);
}, [worldState.period, forcedLocations]);
```

**定位优先级**:
1. **强制定位** (最高优先级) - AI 驱动的移动
2. **日程表定位** (默认) - 角色的日常行程

### 3. 移动处理逻辑

**文件**: `hooks/useDialogueSystem.ts`

```typescript
const handleSendMessage = async (message: string) => {
    const response = await llmService.sendMessage(message);
    
    // 检查是否有移动指令
    if (response.move_to) {
        onCharacterMove(activeCharacter.id, response.move_to);
    }
    
    // ... 处理其他响应字段
};
```

**文件**: `components/GameScene.tsx`

```typescript
const handleCharacterMove = (charId: string, targetId: string) => {
    // 1. 验证场景 ID
    if (!SCENE_NAMES[targetId as any]) {
        console.warn(`Invalid scene ID: ${targetId}`);
        return;
    }
    
    const charName = CHARACTERS[charId]?.name || '角色';
    const targetName = SCENE_NAMES[targetId as any];
    
    // 2. 显示移动通知
    setMoveNotification(`${charName} 将前往 ${targetName}`);
    setTimeout(() => setMoveNotification(null), 4000);
    
    // 3. 更新角色位置（强制定位）
    world.setForcedLocations(prev => ({
        ...prev,
        [charId]: targetId
    }));
    
    // 4. 记录日志
    console.log(`[Character Move] ${charName} → ${targetName} (${targetId})`);
};
```

**处理流程**:
1. 验证场景 ID 是否有效
2. 显示移动通知（4秒后自动消失）
3. 设置强制定位
4. 记录移动日志

### 4. 移动通知组件

**文件**: `components/GameScene.tsx`

```typescript
{moveNotification && (
    <div className="move-notification">
        <i className="fa-solid fa-shoe-prints"></i>
        <span>{moveNotification}</span>
    </div>
)}
```

**样式建议**:
```css
.move-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    padding: 12px 20px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: slideIn 0.5s ease;
    z-index: 1000;
}

.move-notification i {
    font-size: 20px;
    color: #4CAF50;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
```

---

## 💡 使用示例

### 场景 1: 邀请去温泉

**玩家**: "要不要一起去温泉？"

**AI 响应**:
```json
{
    "text": "好啊，正好想泡个澡放松一下。",
    "emotion": "happy",
    "move_to": "scen_7",
    "affinity_change": 2
}
```

**系统执行**:
1. ✅ 验证场景 ID: `scen_7` 有效
2. ✅ 显示通知: "莉莉娅 将前往 温泉"
3. ✅ 设置强制定位: `forcedLocations['char_101'] = 'scen_7'`
4. ✅ 玩家可以在温泉场景找到该角色
5. ✅ 好感度 +2

### 场景 2: 建议回房休息

**玩家**: "你看起来很累，回房间休息吧"

**AI 响应**:
```json
{
    "text": "嗯...确实有点累了，我先回房间了。",
    "emotion": "tired",
    "move_to": "scen_2"
}
```

**系统执行**:
1. ✅ 验证场景 ID: `scen_2` 有效
2. ✅ 显示通知: "莉莉娅 将前往 客房"
3. ✅ 角色返回自己的房间
4. ✅ 4秒后通知消失

### 场景 3: 角色拒绝移动

**玩家**: "去训练场练习一下吧"

**AI 响应**:
```json
{
    "text": "现在不太想动，改天再说吧。",
    "emotion": "normal"
}
```

**注意**: 
- 没有 `move_to` 字段
- 角色位置不变
- 不显示移动通知

### 场景 4: 无效场景 ID

**AI 响应**:
```json
{
    "text": "我们去那里吧。",
    "emotion": "happy",
    "move_to": "invalid_scene"
}
```

**系统执行**:
1. ❌ 验证场景 ID: 无效
2. ⚠️ 控制台警告: "Invalid scene ID: invalid_scene"
3. ✅ 不执行移动
4. ✅ 对话正常继续

---

## 🔄 移动生命周期

### 1. 强制定位的清除时机

强制定位会在以下情况下清除：

#### 方式 1: 时间推进时自动清除

```typescript
// hooks/useWorldSystem.ts

useEffect(() => {
    // 当时间段变化时，清除所有强制定位
    setForcedLocations({});
}, [worldState.period]);
```

**说明**: 当游戏时间进入下一个时段（如从早晨到中午），所有角色恢复日程表定位。

#### 方式 2: 对话结束时可选清除

```typescript
// hooks/useDialogueSystem.ts

const handleFinalClose = () => {
    // ... 其他清理逻辑
    
    // 可选：清除该角色的强制定位
    if (shouldClearLocation) {
        world.setForcedLocations(prev => {
            const newLocations = { ...prev };
            delete newLocations[activeCharacter.id];
            return newLocations;
        });
    }
};
```

**说明**: 对话结束后，可以选择性地清除角色的强制定位，让其恢复日程表行为。

#### 方式 3: 玩家离开场景时清除

```typescript
// components/GameScene.tsx

const handleLeaveScene = () => {
    // 清除当前场景中所有角色的强制定位
    const charactersInScene = getCharactersInScene(currentScene);
    
    world.setForcedLocations(prev => {
        const newLocations = { ...prev };
        charactersInScene.forEach(charId => {
            delete newLocations[charId];
        });
        return newLocations;
    });
};
```

### 2. 持久化策略

**临时移动** (不持久化):
- 对话期间的移动
- 短期的场景切换
- 清除时机: 时间推进或对话结束

**永久移动** (持久化):
- 剧情关键的位置变更
- 角色搬家等重大事件
- 需要修改角色的日程表数据

```typescript
// 永久移动示例
const permanentMove = (charId: string, newSchedule: Schedule) => {
    // 更新角色数据
    updateCharacterSchedule(charId, newSchedule);
    
    // 清除强制定位（使用新日程表）
    world.setForcedLocations(prev => {
        const newLocations = { ...prev };
        delete newLocations[charId];
        return newLocations;
    });
    
    // 保存到存档
    saveGameState();
};
```

---

## 🔍 场景验证

### 场景 ID 验证函数

```typescript
function validateSceneId(sceneId: string): boolean {
    return SCENE_NAMES.hasOwnProperty(sceneId);
}

// 使用示例
if (response.move_to) {
    if (validateSceneId(response.move_to)) {
        onCharacterMove(activeCharacter.id, response.move_to);
    } else {
        console.warn(`Invalid scene ID: ${response.move_to}`);
    }
}
```

### 场景可达性检查

```typescript
function isSceneAccessible(sceneId: string, worldState: WorldState): boolean {
    // 检查场景是否在当前时段开放
    const scene = SCENES[sceneId];
    if (!scene) return false;
    
    // 检查时间限制
    if (scene.availablePeriods && !scene.availablePeriods.includes(worldState.period)) {
        return false;
    }
    
    // 检查其他条件（如任务进度、权限等）
    // ...
    
    return true;
}
```

---

## 🎨 UI/UX 优化

### 1. 延迟执行

让对话文本先显示，再执行移动：

```typescript
if (response.move_to) {
    // 延迟1秒，让玩家先看到对话
    setTimeout(() => {
        onCharacterMove(activeCharacter.id, response.move_to);
    }, 1000);
}
```

### 2. 移动动画

```typescript
const handleCharacterMove = (charId: string, targetId: string) => {
    // ... 验证逻辑
    
    // 显示移动动画
    setMovingCharacter(charId);
    
    setTimeout(() => {
        // 更新位置
        world.setForcedLocations(prev => ({
            ...prev,
            [charId]: targetId
        }));
        
        // 结束动画
        setMovingCharacter(null);
    }, 500);
};
```

### 3. 场景切换提示

```typescript
const handleCharacterMove = (charId: string, targetId: string) => {
    // ... 移动逻辑
    
    // 如果玩家也在目标场景，显示角色到达提示
    if (currentScene === targetId) {
        showArrivalNotification(`${charName} 来到了这里`);
    }
};
```

---

## 🧪 测试用例

### 测试清单

- [ ] 角色成功移动到有效场景
- [ ] 无效场景 ID 被正确拒绝
- [ ] 移动通知正常显示和消失
- [ ] 强制定位正确覆盖日程表
- [ ] 时间推进时强制定位被清除
- [ ] 对话结束时可选清除生效
- [ ] 多个角色同时移动不冲突
- [ ] 角色拒绝移动时不执行
- [ ] 移动后玩家能在目标场景找到角色

### 测试脚本

```typescript
const testCharacterMovement = () => {
    const testCases = [
        {
            name: '有效移动',
            charId: 'char_101',
            targetId: 'scen_7',
            shouldSucceed: true
        },
        {
            name: '无效场景',
            charId: 'char_101',
            targetId: 'invalid_scene',
            shouldSucceed: false
        },
        {
            name: '回房间',
            charId: 'char_101',
            targetId: 'scen_2',
            shouldSucceed: true
        }
    ];
    
    testCases.forEach(testCase => {
        console.log(`Testing: ${testCase.name}`);
        handleCharacterMove(testCase.charId, testCase.targetId);
        // 验证结果
    });
};
```

---

## 🚀 高级功能

### 1. 跟随系统

角色跟随玩家移动：

```typescript
const [followingCharacter, setFollowingCharacter] = useState<string | null>(null);

useEffect(() => {
    if (followingCharacter) {
        // 玩家移动时，角色也移动
        world.setForcedLocations(prev => ({
            ...prev,
            [followingCharacter]: currentScene
        }));
    }
}, [currentScene, followingCharacter]);
```

### 2. 群体移动

多个角色同时移动：

```typescript
const handleGroupMove = (charIds: string[], targetId: string) => {
    world.setForcedLocations(prev => {
        const newLocations = { ...prev };
        charIds.forEach(charId => {
            newLocations[charId] = targetId;
        });
        return newLocations;
    });
    
    const charNames = charIds.map(id => CHARACTERS[id]?.name).join('、');
    setMoveNotification(`${charNames} 将前往 ${SCENE_NAMES[targetId]}`);
};
```

### 3. 移动历史记录

```typescript
interface MovementRecord {
    charId: string;
    from: string;
    to: string;
    timestamp: number;
    reason?: string;
}

const [movementHistory, setMovementHistory] = useState<MovementRecord[]>([]);

const recordMovement = (charId: string, from: string, to: string) => {
    setMovementHistory(prev => [...prev, {
        charId,
        from,
        to,
        timestamp: Date.now(),
        reason: 'dialogue'
    }]);
};
```

---

## 📚 相关文档

- [AI 驱动系统技术标准](./AI_DRIVEN_SYSTEMS.md) - 总体技术标准
- [角色立绘变化系统](./CHARACTER_SPRITE_SYSTEM.md) - 立绘切换系统
- [物品获取系统](./CHARACTER_ITEM_GAIN_SYSTEM.md) - 物品发放系统
- [好感度变化系统](./CHARACTER_AFFINITY_CHANGE_SYSTEM.md) - 好感度管理

---

## 🔗 相关文件

- `data/systemPrompts.ts` - AI 提示词配置
- `data/scenes.ts` - 场景数据定义
- `hooks/useDialogueSystem.ts` - 对话系统核心逻辑
- `hooks/useWorldSystem.ts` - 世界系统和角色定位
- `components/GameScene.tsx` - 游戏场景和系统集成

---

**最后更新**: 2026-02-22  
**文档版本**: 1.0.0  
**设计者**: Nyaa  
**开发者**: Gemini  
**维护者**: Claude  
**标签**: `#角色移动` `#AI驱动` `#位置管理` `#世界系统`