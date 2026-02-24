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

#### 方式 2: 对话结束时自动检查和清理

```typescript
// components/GameScene.tsx

const handleFinalCloseDialogue = () => {
    dialogue.handleFinalClose();
    
    // [角色移动系统] 对话结束后，检查角色是否已移动
    // 如果角色已经移动到其他场景，清除当前场景的 Ambient 显示
    if (dialogue.activeCharacter) {
        const charId = dialogue.activeCharacter.id;
        const actualLocation = world.forcedLocations[charId] || world.characterLocations[charId];
        
        if (actualLocation !== world.currentSceneId) {
            // 角色已经不在当前场景，清除 Ambient
            dialogue.setAmbientCharacter(null);
            dialogue.setAmbientText('');
            dialogue.setShowAmbientDialogue(false);
            console.log(`[角色移动系统] ${dialogue.activeCharacter.name} 已移动到 ${SCENE_NAMES[actualLocation]}，清除当前场景的 Ambient 显示`);
        }
    }
    
    // 对话结束时触发自动存档
    handleSaveGame(0).catch(err => console.error('Auto-save failed:', err));
};
```

**说明**: 对话结束后，系统会自动检查角色是否已移动到其他场景。如果角色不在当前场景，会立即清除 Ambient 显示，避免显示已经离开的角色。

**重要**: 强制定位本身**不会**在对话结束时清除，这确保了玩家可以在目标场景找到角色。只有 Ambient 显示会被清理。

### 2. 场景切换时的定位保持

**关键设计**: 强制定位在玩家切换场景时**不会被清除**，这确保了角色移动的持续性。

```typescript
// hooks/useWorldSystem.ts

const handleNavigate = (sceneId: SceneId, params?: any) => {
    // ... 场景切换逻辑
    
    // [角色移动系统] 保持强制定位，不在场景切换时清除
    // setForcedLocations({}) 已移除，让角色移动持续生效
    
    // 更新角色位置时会合并强制定位
    const locs = calculateCharacterLocations(newState.period, newState.dateStr, newState.timeStr, sceneLevels);
    setCharacterLocations({ ...locs, ...forcedLocations });
};
```

**行为说明**:
- ✅ 角色在对话中移动到温泉
- ✅ 玩家切换到其他场景再回来
- ✅ 角色仍然在温泉（强制定位保持）
- ✅ 直到时间段变化，角色才恢复日程表定位

### 3. Ambient 角色显示的智能过滤

**问题**: 即使角色已经移动走了，原场景可能仍然显示该角色的 Ambient 状态。

**解决方案**: 在查找场景中的角色时，检查实际位置（包括强制定位）。

```typescript
// components/GameScene.tsx

const findCharacterForScene = () => {
    if (world.currentSceneId === 'scen_2' && world.sceneParams?.target && world.sceneParams.target !== 'user') {
        const target = CHARACTERS[world.sceneParams.target];
        // [角色移动系统] 检查角色是否真的在这个场景
        const actualLocation = world.forcedLocations[target.id] || world.characterLocations[target.id];
        if (actualLocation === 'scen_2') {
            return target;
        }
        return null;
    }

    if (world.presentCharacters.length > 0) {
        // [角色移动系统] 过滤掉已经移动走的角色
        const actuallyPresentChars = world.presentCharacters.filter(c => {
            const actualLocation = world.forcedLocations[c.id] || world.characterLocations[c.id];
            return actualLocation === world.currentSceneId;
        });
        
        if (actuallyPresentChars.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * actuallyPresentChars.length);
        return actuallyPresentChars[randomIndex];
    }
    return null;
};
```

**关键点**:
- 优先检查 `forcedLocations`（AI 驱动的移动）
- 回退到 `characterLocations`（日程表定位）
- 只显示真正在当前场景的角色

### 4. 持久化策略

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
- [ ] 对话结束后已移动角色不显示 Ambient
- [ ] 场景切换后强制定位保持有效
- [ ] 玩家可以在目标场景找到已移动的角色
- [ ] 多个角色同时移动不冲突
- [ ] 角色拒绝移动时不执行
- [ ] Ambient 只显示真正在场景中的角色

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

## ❓ 常见问题与解决方案

### 问题 1: 角色移动后玩家找不到角色

**症状**: 
- AI 响应了 `move_to` 指令
- 显示了移动通知
- 但玩家前往目标场景时找不到角色

**原因**: 
在早期实现中，`useWorldSystem.ts` 的 `handleNavigate` 函数会在场景切换时清空 `forcedLocations`：
```typescript
setForcedLocations({}); // 这会清除所有强制定位
```

**解决方案**: 
移除场景切换时的强制定位清空逻辑，让强制定位持续生效直到时间段变化：
```typescript
// [角色移动系统] 保持强制定位，不在场景切换时清除
// setForcedLocations({}) 已移除
```

**验证**: 
1. 在柜台与角色对话，AI 响应移动到温泉
2. 玩家切换到其他场景
3. 玩家前往温泉
4. ✅ 角色应该在温泉出现

---

### 问题 2: 对话结束后角色还在原场景显示 Ambient

**症状**: 
- 角色在对话中移动到其他场景
- 对话结束后，原场景仍然显示该角色的 Ambient 对话
- 角色看起来同时在两个场景

**原因**: 
Ambient Logic 只检查了 `isDialogueMode`，没有验证角色是否真的在当前场景。即使角色已经通过 `forcedLocations` 移动走了，系统仍然会基于 `presentCharacters` 显示 Ambient。

**解决方案**: 

**方案 A**: 在 `findCharacterForScene` 中过滤已移动的角色
```typescript
const findCharacterForScene = () => {
    // ... 其他逻辑
    
    // [角色移动系统] 过滤掉已经移动走的角色
    const actuallyPresentChars = world.presentCharacters.filter(c => {
        const actualLocation = world.forcedLocations[c.id] || world.characterLocations[c.id];
        return actualLocation === world.currentSceneId;
    });
    
    if (actuallyPresentChars.length === 0) return null;
    // ...
};
```

**方案 B**: 在 `handleFinalCloseDialogue` 中清除 Ambient
```typescript
const handleFinalCloseDialogue = () => {
    dialogue.handleFinalClose();
    
    // 检查角色是否已移动
    if (dialogue.activeCharacter) {
        const charId = dialogue.activeCharacter.id;
        const actualLocation = world.forcedLocations[charId] || world.characterLocations[charId];
        
        if (actualLocation !== world.currentSceneId) {
            // 清除 Ambient 显示
            dialogue.setAmbientCharacter(null);
            dialogue.setAmbientText('');
            dialogue.setShowAmbientDialogue(false);
        }
    }
};
```

**最佳实践**: 同时使用两种方案，提供双重保护。

**验证**: 
1. 在柜台与角色对话，AI 响应移动到温泉
2. 对话结束
3. ✅ 柜台不应该显示该角色的 Ambient
4. 前往温泉
5. ✅ 温泉应该显示该角色的 Ambient

---

### 问题 3: 多个角色在同一场景时移动冲突

**症状**: 
- 场景中有多个角色
- 其中一个移动走了
- Ambient 仍然可能选中已移动的角色

**解决方案**: 
在 Ambient Logic 的 `useEffect` 中，每次重新计算时都要过滤实际位置：
```typescript
useEffect(() => {
    // ... 场景切换和对话模式检查
    
    const char = findCharacterForScene(); // 内部已过滤
    
    if (char) {
        // 再次验证角色确实在场景中
        const actualLocation = world.forcedLocations[char.id] || world.characterLocations[char.id];
        if (actualLocation === world.currentSceneId) {
            dialogue.setAmbientCharacter(char);
            // ...
        }
    }
}, [world.currentSceneId, world.isSceneTransitioning, dialogue.isDialogueMode]);
```

---

### 调试技巧

**1. 检查角色实际位置**:
```typescript
console.log('Forced:', world.forcedLocations);
console.log('Schedule:', world.characterLocations);
console.log('Actual:', world.forcedLocations[charId] || world.characterLocations[charId]);
```

**2. 监控移动事件**:
```typescript
const handleCharacterMove = (charId: string, targetId: string) => {
    console.log(`[Character Move] ${charName} → ${targetName} (${targetId})`);
    // ...
};
```

**3. 验证 Ambient 选择**:
```typescript
const findCharacterForScene = () => {
    const char = /* ... */;
    if (char) {
        console.log(`[Ambient] Selected ${char.name} for ${world.currentSceneId}`);
    }
    return char;
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

---

## 📝 变更日志

### v1.1.0 (2025-01-24)
- 🐛 修复：角色移动后玩家找不到角色的问题
  - 移除场景切换时清空 `forcedLocations` 的逻辑
  - 强制定位现在持续到时间段变化
- 🐛 修复：对话结束后角色仍显示 Ambient 的问题
  - 在 `findCharacterForScene` 中添加实际位置验证
  - 在 `handleFinalCloseDialogue` 中添加 Ambient 清理逻辑
- 📖 添加：常见问题与解决方案章节
- 📖 更新：移动生命周期说明
- 📖 更新：测试清单

### v1.0.0 (2026-02-22)
- 🎉 初始版本
- ✨ 实现基本的角色移动功能
- ✨ 实现强制定位系统
- ✨ 实现移动通知
- 📖 完整的技术文档

---

**最后更新**: 2025-01-24
**文档版本**: 1.1.0
**设计者**: Nyaa
**开发者**: Gemini
**维护者**: Claude
**标签**: `#角色移动` `#AI驱动` `#位置管理` `#世界系统`