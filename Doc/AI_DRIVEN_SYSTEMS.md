# AI 驱动的动态系统技术文档

## 📋 系统概述

本文档描述游戏中由 AI 对话驱动的三大动态系统：

1. **角色立绘变化系统** - 衣着和表情动态切换
2. **物品获取系统** - 对话中获得道具
3. **角色移动系统** - AI 控制角色场景转移

这些系统通过 LLM 的结构化输出（JSON）实现，让 AI 能够根据对话内容自主控制游戏状态。

---

## 🎯 核心设计理念

### 1. 结构化输出

AI 的每次响应都包含结构化的 JSON 数据：

```json
{
    "text": "对话文本",
    "emotion": "表情代码",
    "clothing": "衣着状态",
    "gain_items": [{"id": "item_id", "count": 1}],
    "move_to": "场景ID",
    "affinity_change": 5
}
```

### 2. 游戏监听机制

游戏系统监听 AI 输出的指令字段，自动执行相应操作：

```
AI 输出 JSON
    ↓
解析指令字段
    ↓
执行对应操作
    ↓
更新游戏状态
    ↓
显示视觉反馈
```

---

## 🎨 系统一：角色立绘变化

### 概述

角色立绘根据对话内容动态变化，包括：
- **表情变化**: 根据情绪切换表情
- **衣着变化**: 根据剧情切换服装状态

### 数据结构

#### 衣着状态 (`ClothingState`)

```typescript
type ClothingState = 'default' | 'nude' | 'bondage' | string;
```

| 状态 | 说明 | 使用场景 |
|------|------|----------|
| `default` | 日常装束 | 普通对话 |
| `nude` | 裸体/未穿衣 | 温泉、亲密场景 |
| `bondage` | 束缚状态 | 特殊剧情 |

#### 表情代码 (`emotion`)

```typescript
type Emotion = 'normal' | 'happy' | 'sad' | 'angry' | 'shy' | 'surprised' | string;
```

常用表情：
- `normal` - 平静
- `happy` - 高兴
- `sad` - 悲伤
- `angry` - 生气
- `shy` - 害羞
- `surprised` - 惊讶
- `embarrassed` - 尴尬
- `excited` - 兴奋

### 实现流程

#### 1. AI 提示词配置

```markdown
## JSON 输出指令
请严格以 JSON 格式输出，包含以下字段：
- emotion: 表情代码 (如 normal, happy, angry 等)
- clothing: (可选) 衣着状态变更 (default/nude/bondage)

## 状态变更指令 (Clothing)
- 如果剧情发展导致角色脱去衣服、变得赤裸，请在 JSON 响应的 'clothing' 字段返回 'nude'。
- 如果角色穿回衣服，请返回 'default'。
- 仅当状态发生实际改变时才包含此字段。
```

#### 2. 立绘资源结构

```typescript
interface CharacterImageConfig {
    Character: string;
    avatarUrl: string;
    default: EmotionImageConfig;  // 日常装束
    nude?: EmotionImageConfig;    // 裸体状态
    bondage?: EmotionImageConfig; // 束缚状态
}

interface EmotionImageConfig {
    spriteUrl: string;  // 默认立绘
    emotions: Record<string, string[]>; // 表情 -> 图片路径列表
}
```

**示例**:
```json
{
    "Character": "莉莉娅",
    "avatarUrl": "img/face/101.png",
    "default": {
        "spriteUrl": "img/char/101/default/normal.png",
        "emotions": {
            "normal": ["img/char/101/default/normal.png"],
            "happy": ["img/char/101/default/happy.png"],
            "angry": ["img/char/101/default/angry.png"]
        }
    },
    "nude": {
        "spriteUrl": "img/char/101/nude/normal.png",
        "emotions": {
            "normal": ["img/char/101/nude/normal.png"],
            "shy": ["img/char/101/nude/shy.png"]
        }
    }
}
```

#### 3. 立绘切换逻辑

```typescript
// hooks/useDialogueSystem.ts

// 初始化衣着状态
const [clothingState, setClothingState] = useState<ClothingState>('default');
const [currentSprite, setCurrentSprite] = useState('');

// 处理 AI 响应
const handleSend = async () => {
    const response = await llmService.sendMessage(message);
    
    // 1. 更新衣着状态（如果 AI 指定）
    if (settings.enableNSFW && response.clothing) {
        const newClothing = response.clothing.toLowerCase();
        if (['default', 'nude', 'bondage'].includes(newClothing)) {
            setClothingState(newClothing as ClothingState);
        }
    }
    
    // 2. 更新表情立绘
    const sprite = response.emotion 
        ? getCharacterSprite(activeCharacter, clothingState, response.emotion)
        : getCharacterSprite(activeCharacter, clothingState, 'normal');
    
    setCurrentSprite(sprite);
};
```

#### 4. 立绘获取函数

```typescript
// utils/gameLogic.ts

export function getCharacterSprite(
    character: Character,
    clothing: ClothingState,
    emotion: string
): string {
    const config = CHARACTER_IMAGES[character.id];
    if (!config) return '';
    
    // 1. 获取对应衣着状态的配置
    const clothingConfig = config[clothing] || config.default;
    
    // 2. 获取对应表情的图片
    const emotionImages = clothingConfig.emotions[emotion];
    
    if (emotionImages && emotionImages.length > 0) {
        // 随机选择一张（如果有多张）
        const index = Math.floor(Math.random() * emotionImages.length);
        return emotionImages[index];
    }
    
    // 3. 回退到默认立绘
    return clothingConfig.spriteUrl;
}
```

### 使用示例

#### 场景 1: 温泉对话

```typescript
// 进入温泉场景时设置衣着状态
const handleEnterDialogue = async (characterId: string, actionType: string) => {
    let nextClothingState: ClothingState = 'default';
    
    if (actionType === 'bath_together') {
        nextClothingState = 'nude';
    }
    
    setClothingState(nextClothingState);
    // ...
};
```

**AI 响应示例**:
```json
{
    "text": "*(脸颊微红)* 水温刚刚好呢...",
    "emotion": "shy",
    "clothing": "nude"
}
```

#### 场景 2: 情绪变化

**玩家**: "你今天看起来很开心啊"

**AI 响应**:
```json
{
    "text": "嗯！因为你来看我了嘛~",
    "emotion": "happy",
    "affinity_change": 2
}
```

---

## 🎁 系统二：物品获取系统

### 概述

AI 可以根据对话内容判断玩家是否应该获得物品，并通过 JSON 输出指令让游戏自动发放道具。

### 数据结构

#### 物品指令格式

```typescript
interface ItemGainInstruction {
    id: string;    // 物品 ID
    count: number; // 数量
}

// AI 响应中的字段
interface AIResponse {
    // ...
    gain_items?: ItemGainInstruction[];
}
```

**示例**:
```json
{
    "text": "这是我亲手做的护身符，送给你吧。",
    "emotion": "happy",
    "gain_items": [
        {"id": "acs_001", "count": 1}
    ],
    "affinity_change": 3
}
```

### 实现流程

#### 1. AI 提示词配置

```markdown
## 道具获取指令 (Items)
- 如果剧情逻辑判断玩家应该获得某个道具（如角色赠送礼物、探索发现等）：
  - 必须在 JSON 的 'gain_items' 字段中返回。
  - 格式为 [{id: 'item-id', count: 1}]

示例场景：
- 角色赠送礼物
- 完成任务奖励
- 探索发现宝箱
- 购买交易
```

#### 2. 物品发放逻辑

```typescript
// hooks/useDialogueSystem.ts

const handleSend = async () => {
    const response = await llmService.sendMessage(message);
    
    // 检查是否有物品获取指令
    if (response.items && response.items.length > 0) {
        onItemsGained(response.items);
    }
};
```

```typescript
// components/GameScene.tsx

const handleItemsGained = (items: { id: string; count: number }[]) => {
    // 1. 更新库存
    core.handleAddItems(items);
    
    // 2. 显示通知
    const newNotifications = items.map(item => ({
        id: Date.now() + Math.random().toString(),
        itemId: item.id,
        count: item.count
    }));
    setItemNotifications(prev => [...prev, ...newNotifications]);
};
```

#### 3. 物品通知组件

```typescript
// components/ItemToast.tsx

interface ItemToastProps {
    itemId: string;
    count: number;
    onComplete: () => void;
}

const ItemToast: React.FC<ItemToastProps> = ({ itemId, count, onComplete }) => {
    const item = ITEMS[itemId];
    
    useEffect(() => {
        // 4秒后自动消失
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 500);
        }, 4000);
        return () => clearTimeout(timer);
    }, []);
    
    return (
        <div className="item-toast">
            <div className="icon">{getIcon(item)}</div>
            <div className="info">
                <span>获得道具</span>
                <span>{item.name} ×{count}</span>
            </div>
        </div>
    );
};
```

### 使用示例

#### 场景 1: 角色赠送礼物

**玩家**: "你的项链真漂亮"

**AI 响应**:
```json
{
    "text": "谢谢夸奖！既然你这么喜欢，这条项链就送给你吧。",
    "emotion": "happy",
    "gain_items": [
        {"id": "acs_necklace_001", "count": 1}
    ],
    "affinity_change": 5
}
```

**效果**:
1. 玩家库存增加项链 ×1
2. 屏幕左下角显示 Toast 通知
3. 好感度 +5

#### 场景 2: 任务奖励

**玩家**: "我帮你找到了丢失的书"

**AI 响应**:
```json
{
    "text": "太好了！这是给你的报酬，还有一些我自己做的点心。",
    "emotion": "happy",
    "gain_items": [
        {"id": "itm_gold_pouch", "count": 1},
        {"id": "food_cookie", "count": 3}
    ],
    "affinity_change": 3
}
```

**效果**:
1. 获得金币袋 ×1
2. 获得饼干 ×3
3. 显示两个 Toast 通知

#### 场景 3: 探索发现

**玩家**: "这个箱子里有什么？"

**AI 响应**:
```json
{
    "text": "让我看看...哇，是一把精致的短剑！你拿去用吧。",
    "emotion": "surprised",
    "gain_items": [
        {"id": "wpn_dagger_rare", "count": 1}
    ]
}
```

### 物品 ID 规范

| 前缀 | 类别 | 示例 |
|------|------|------|
| `res_` | 资源 | `res_wood`, `res_iron` |
| `itm_` | 道具 | `itm_potion`, `itm_key` |
| `wpn_` | 武器 | `wpn_sword`, `wpn_bow` |
| `arm_` | 防具 | `arm_shield`, `arm_helmet` |
| `acs_` | 饰品 | `acs_ring`, `acs_necklace` |
| `food_` | 食物 | `food_bread`, `food_meat` |

### 错误处理

```typescript
// 验证物品 ID
function validateItemId(itemId: string): boolean {
    return ITEMS.hasOwnProperty(itemId);
}

// 处理无效物品
if (response.items) {
    const validItems = response.items.filter(item => {
        if (!validateItemId(item.id)) {
            console.warn(`Invalid item ID: ${item.id}`);
            return false;
        }
        return true;
    });
    
    if (validItems.length > 0) {
        onItemsGained(validItems);
    }
}
```

---

## 🚶 系统三：角色移动系统

### 概述

AI 可以根据对话内容判断角色是否同意前往某个场景，并通过 JSON 输出指令让游戏自动移动角色。

### 数据结构

#### 移动指令格式

```typescript
interface AIResponse {
    // ...
    move_to?: string; // 目标场景 ID
}
```

**示例**:
```json
{
    "text": "好啊，我们一起去温泉吧。",
    "emotion": "happy",
    "move_to": "scen_7"
}
```

### 场景 ID 列表

| 场景 ID | 场景名称 | 说明 |
|---------|---------|------|
| `scen_1` | 柜台 | 旅店前台 |
| `scen_2` | 客房 | 角色的房间 |
| `scen_3` | 酒场 | 酒馆大厅 |
| `scen_4` | 训练场 | 武器训练区 |
| `scen_5` | 武器店 | 武器商店 |
| `scen_6` | 防具店 | 防具商店 |
| `scen_7` | 温泉 | 温泉浴场 |
| `scen_8` | 按摩室 | 按摩房间 |
| `scen_9` | 库房 | 仓库 |
| `scen_10` | 道具店 | 道具商店 |

### 实现流程

#### 1. AI 提示词配置

```markdown
## 角色移动指令 (Move)
- 场景ID列表：
  - scen_1: 柜台
  - scen_2: 客房 (角色自己的房间)
  - scen_3: 酒场
  - scen_4: 训练场
  - scen_5: 武器店
  - scen_6: 防具店
  - scen_7: 温泉
  - scen_8: 按摩室
  - scen_9: 库房
  - scen_10: 道具店

- 触发条件：当玩家建议或命令角色前往上述某个场景，并且角色**明确同意**时。
- 输出格式：在JSON中包含 "move_to": "场景ID" 字段。
- 特殊规则：如果玩家说"回房间"、"回去休息"等指代回到角色自己房间的指令，目标场景ID为 "scen_2"。
- 仅当角色真正决定移动时才输出此指令。
```

#### 2. 移动处理逻辑

```typescript
// hooks/useDialogueSystem.ts

const handleSend = async () => {
    const response = await llmService.sendMessage(message);
    
    // 检查是否有移动指令
    if (response.move_to) {
        onCharacterMove(activeCharacter.id, response.move_to);
    }
};
```

```typescript
// components/GameScene.tsx

const handleCharacterMove = (charId: string, targetId: string) => {
    if (SCENE_NAMES[targetId as any]) {
        const charName = CHARACTERS[charId]?.name || '角色';
        const targetName = SCENE_NAMES[targetId as any];
        
        // 1. 显示移动通知
        setMoveNotification(`${charName} 将前往 ${targetName}`);
        setTimeout(() => setMoveNotification(null), 4000);
        
        // 2. 更新角色位置（强制定位）
        world.setForcedLocations(prev => ({
            ...prev,
            [charId]: targetId
        }));
    }
};
```

#### 3. 移动通知组件

```typescript
// 显示在屏幕上的移动提示
{moveNotification && (
    <div className="move-notification">
        <i className="fa-solid fa-shoe-prints"></i>
        <span>{moveNotification}</span>
    </div>
)}
```

### 使用示例

#### 场景 1: 邀请去温泉

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

**效果**:
1. 显示通知："莉莉娅 将前往 温泉"
2. 角色位置更新到温泉场景
3. 玩家可以在温泉场景找到该角色

#### 场景 2: 建议回房休息

**玩家**: "你看起来很累，回房间休息吧"

**AI 响应**:
```json
{
    "text": "嗯...确实有点累了，我先回房间了。",
    "emotion": "tired",
    "move_to": "scen_2"
}
```

#### 场景 3: 角色拒绝移动

**玩家**: "去训练场练习一下吧"

**AI 响应**:
```json
{
    "text": "现在不太想动，改天再说吧。",
    "emotion": "normal"
}
```

**注意**: 没有 `move_to` 字段，角色不会移动。

### 移动验证

```typescript
// 验证场景 ID
function validateSceneId(sceneId: string): boolean {
    return SCENE_NAMES.hasOwnProperty(sceneId);
}

// 处理移动指令
if (response.move_to) {
    if (validateSceneId(response.move_to)) {
        onCharacterMove(activeCharacter.id, response.move_to);
    } else {
        console.warn(`Invalid scene ID: ${response.move_to}`);
    }
}
```

### 强制定位系统

```typescript
// hooks/useWorldSystem.ts

const [forcedLocations, setForcedLocations] = useState<Record<string, string>>({});

// 更新角色位置
useEffect(() => {
    Object.keys(CHARACTERS).forEach(charId => {
        const char = CHARACTERS[charId];
        
        // 检查是否有强制定位
        if (forcedLocations[charId]) {
            characterLocations[charId] = forcedLocations[charId];
        } else {
            // 使用日程表定位
            const schedule = char.schedule?.[worldState.period];
            if (schedule && schedule.length > 0) {
                characterLocations[charId] = schedule[0];
            }
        }
    });
}, [worldState.period, forcedLocations]);
```

### 移动持久化

角色的强制定位会在以下情况下清除：

1. **场景切换**: 玩家离开当前场景
2. **时间变化**: 游戏时间进入下一个时段
3. **对话结束**: 对话结束后可选择性清除

```typescript
// 清除强制定位
const handleFinalCloseDialogue = () => {
    dialogue.handleFinalClose();
    
    // 可选：清除该角色的强制定位
    // world.setForcedLocations(prev => {
    //     const newLocations = { ...prev };
    //     delete newLocations[activeCharacter.id];
    //     return newLocations;
    // });
};
```

---

## 🔄 系统集成

### 多系统联动示例

#### 场景：温泉约会

**玩家**: "一起去温泉吧，我给你带了毛巾"

**AI 响应**:
```json
{
    "text": "*(脸红)* 谢谢你...那我们走吧。",
    "emotion": "shy",
    "move_to": "scen_7",
    "affinity_change": 3
}
```

**系统执行**:
1. ✅ 表情切换为 `shy`
2. ✅ 好感度 +3（显示 Toast）
3. ✅ 角色移动到温泉（显示移动通知）

**后续对话**（在温泉场景）:

**玩家**: "水温怎么样？"

**AI 响应**:
```json
{
    "text": "刚刚好...很舒服呢。",
    "emotion": "happy",
    "clothing": "nude"
}
```

**系统执行**:
1. ✅ 表情切换为 `happy`
2. ✅ 衣着切换为 `nude`（立绘变化）

#### 场景：赠送礼物后移动

**玩家**: "这个护身符送给你，然后我们去酒场喝一杯吧"

**AI 响应**:
```json
{
    "text": "太感谢了！好啊，走吧~",
    "emotion": "happy",
    "gain_items": [{"id": "acs_charm", "count": 1}],
    "move_to": "scen_3",
    "affinity_change": 5
}
```

**系统执行**:
1. ✅ 表情切换为 `happy`
2. ✅ 获得护身符（显示 Toast）
3. ✅ 好感度 +5（显示 Toast）
4. ✅ 角色移动到酒场（显示移动通知）

---

## 📊 数据流程总览

```
玩家输入对话
    ↓
发送到 LLM API
    ↓
AI 生成 JSON 响应
    ↓
解析 JSON 字段
    ├─→ text: 显示对话文本
    ├─→ emotion: 切换表情立绘
    ├─→ clothing: 切换衣着立绘
    ├─→ gain_items: 发放物品 + 显示 Toast
    ├─→ move_to: 移动角色 + 显示通知
    └─→ affinity_change: 更新好感度 + 显示 Toast
    ↓
更新游戏状态
    ↓
触发自动存档
```

---

## 🎯 最佳实践

### 1. AI 提示词设计

```markdown
# 好的提示词
- 明确指定 JSON 格式
- 列出所有可用的场景 ID
- 说明触发条件
- 提供示例

# 避免
- 模糊的指令
- 缺少场景列表
- 没有示例
```

### 2. 错误处理

```typescript
// 统一的响应处理函数
function handleAIResponse(response: AIResponse) {
    try {
        // 1. 显示对话文本
        setCurrentDialogue(response.text);
        
        // 2. 更新立绘
        if (response.emotion) {
            updateSprite(response.emotion, response.clothing);
        }
        
        // 3. 发放物品
        if (response.gain_items?.length > 0) {
            const validItems = response.gain_items.filter(validateItem);
            if (validItems.length > 0) {
                grantItems(validItems);
            }
        }
        
        // 4. 移动角色
        if (response.move_to && validateSceneId(response.move_to)) {
            moveCharacter(response.move_to);
        }
        
        // 5. 更新好感度
        if (response.affinity_change) {
            updateAffinity(response.affinity_change);
        }
    } catch (error) {
        console.error('Failed to handle AI response:', error);
        // 显示错误提示
    }
}
```

### 3. 用户体验优化

```typescript
// 延迟执行，让对话文本先显示
if (response.move_to) {
    setTimeout(() => {
        onCharacterMove(charId, response.move_to);
    }, 1000);
}

// 批量通知，避免屏幕拥挤
if (response.gain_items?.length > 3) {
    // 合并显示或分批显示
    showBatchNotification(response.gain_items);
}
```

---

## 🔗 相关文件

- `systemPrompts.ts` - AI 提示词配置
- `services/llmService.ts` - LLM 服务和响应解析
- `hooks/useDialogueSystem.ts` - 对话系统核心逻辑
- `components/GameScene.tsx` - 游戏场景和系统集成
- `components/ItemToast.tsx` - 物品通知组件
- `components/AffinityToast.tsx` - 好感度通知组件
- `utils/gameLogic.ts` - 立绘获取函数
- `hooks/useWorldSystem.ts` - 世界系统和角色定位

---

**最后更新**: 2026-02-21  
**设计者**: Nyaa  
**开发者**: Gemini  
**维护者**: Claude  
**标签**: `#AI驱动` `#立绘系统` `#物品系统` `#角色移动` `#动态系统`