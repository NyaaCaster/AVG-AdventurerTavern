# 角色立绘变化系统技术文档

## 📋 系统概述

角色立绘变化系统通过 AI 对话驱动，实现角色表情和衣着的动态切换，为玩家提供沉浸式的视觉反馈。

### 核心功能

- **表情变化**: 根据 AI 判断的情绪自动切换角色表情
- **衣着变化**: 根据剧情发展动态切换服装状态（日常/裸体/束缚）
- **智能回退**: 当指定表情不存在时自动回退到默认立绘

---

## 🎯 设计目标

1. **情绪表达**: 通过立绘变化增强角色情绪的表现力
2. **剧情联动**: 衣着状态随剧情发展自然变化
3. **资源优化**: 支持多张表情图片随机选择，增加视觉多样性
4. **状态管理**: 独立管理衣着状态，支持场景特定的初始状态

---

## 📊 数据结构

### AI 响应格式

```typescript
interface AIResponse {
    text: string;
    emotion?: string;           // 表情代码
    clothing?: ClothingState;   // 衣着状态变更
    // ... 其他字段
}
```

### 衣着状态定义

```typescript
type ClothingState = 'default' | 'nude' | 'bondage' | string;
```

| 状态 | 说明 | 使用场景 | 触发条件 |
|------|------|----------|----------|
| `default` | 日常装束 | 普通对话、公共场景 | 默认状态或穿回衣服 |
| `nude` | 裸体/未穿衣 | 温泉、亲密场景 | 脱衣剧情、温泉场景 |
| `bondage` | 束缚状态 | 特殊剧情 | 特定剧情触发 |

### 表情代码

```typescript
type Emotion = 'normal' | 'happy' | 'sad' | 'angry' | 'shy' | 'surprised' | string;
```

**常用表情列表**:

| 表情代码 | 中文名称 | 使用场景 |
|---------|---------|----------|
| `normal` | 平静 | 日常对话、中性回应 |
| `happy` | 高兴 | 愉快的对话、收到礼物 |
| `sad` | 悲伤 | 伤心的话题、失望 |
| `angry` | 生气 | 被冒犯、不满 |
| `shy` | 害羞 | 被夸奖、亲密话题 |
| `surprised` | 惊讶 | 意外的消息、惊喜 |
| `embarrassed` | 尴尬 | 尴尬的情况 |
| `excited` | 兴奋 | 激动的时刻 |
| `tired` | 疲惫 | 劳累、困倦 |
| `worried` | 担心 | 焦虑、担忧 |

### 立绘资源配置

```typescript
interface CharacterImageConfig {
    Character: string;              // 角色名称
    avatarUrl: string;              // 头像路径
    default: EmotionImageConfig;    // 日常装束配置
    nude?: EmotionImageConfig;      // 裸体状态配置（可选）
    bondage?: EmotionImageConfig;   // 束缚状态配置（可选）
}

interface EmotionImageConfig {
    spriteUrl: string;                      // 默认立绘路径
    emotions: Record<string, string[]>;     // 表情代码 -> 图片路径数组
}
```

**配置示例**:

```json
{
    "Character": "莉莉娅",
    "avatarUrl": "img/face/101.png",
    "default": {
        "spriteUrl": "img/char/101/default/normal.png",
        "emotions": {
            "normal": ["img/char/101/default/normal.png"],
            "happy": [
                "img/char/101/default/happy_1.png",
                "img/char/101/default/happy_2.png"
            ],
            "angry": ["img/char/101/default/angry.png"],
            "shy": ["img/char/101/default/shy.png"]
        }
    },
    "nude": {
        "spriteUrl": "img/char/101/nude/normal.png",
        "emotions": {
            "normal": ["img/char/101/nude/normal.png"],
            "shy": ["img/char/101/nude/shy.png"],
            "happy": ["img/char/101/nude/happy.png"]
        }
    }
}
```

---

## 🔧 实现细节

### 1. AI 提示词配置

**文件**: `data/systemPrompts.ts`

```typescript
const PROMPT_SPRITE = `
## JSON 输出指令
请严格以 JSON 格式输出，包含以下字段：
- emotion: 表情代码 (如 normal, happy, angry, shy 等)
- clothing: (可选) 衣着状态变更 (default/nude/bondage)

## 表情代码说明
根据角色当前的情绪状态选择合适的表情：
- normal: 平静、中性
- happy: 高兴、愉快
- sad: 悲伤、失落
- angry: 生气、愤怒
- shy: 害羞、脸红
- surprised: 惊讶、意外
- embarrassed: 尴尬
- excited: 兴奋、激动

## 状态变更指令 (Clothing)
- 如果剧情发展导致角色脱去衣服、变得赤裸，请在 JSON 响应的 'clothing' 字段返回 'nude'。
- 如果角色穿回衣服，请返回 'default'。
- 仅当状态发生实际改变时才包含此字段。
- 中性对话不需要改变衣着状态。
`;
```

**关键点**:
- 明确列出所有可用的表情代码
- 说明何时输出 `clothing` 字段
- 强调只在状态实际改变时输出

### 2. 状态管理

**文件**: `hooks/useDialogueSystem.ts`

```typescript
// 衣着状态管理
const [clothingState, setClothingState] = useState<ClothingState>('default');

// 当前显示的立绘路径
const [currentSprite, setCurrentSprite] = useState<string>('');

// 对话开始时初始化衣着状态
const handleEnterDialogue = async (characterId: string, actionType: string) => {
    let nextClothingState: ClothingState = 'default';
    
    // 根据动作类型设置初始衣着状态
    if (actionType === 'bath_together') {
        nextClothingState = 'nude';
    } else if (actionType === 'bondage_play') {
        nextClothingState = 'bondage';
    }
    
    setClothingState(nextClothingState);
    
    // 设置初始立绘
    const initialSprite = getCharacterSprite(
        activeCharacter, 
        nextClothingState, 
        'normal'
    );
    setCurrentSprite(initialSprite);
    
    // ... 其他初始化逻辑
};
```

### 3. AI 响应处理

```typescript
const handleSendMessage = async (message: string) => {
    const response = await llmService.sendMessage(message);
    
    // 1. 处理衣着状态变更
    if (settings.enableNSFW && response.clothing) {
        const newClothing = response.clothing.toLowerCase();
        if (['default', 'nude', 'bondage'].includes(newClothing)) {
            setClothingState(newClothing as ClothingState);
        }
    }
    
    // 2. 更新立绘（使用最新的衣着状态）
    const emotion = response.emotion || 'normal';
    const sprite = getCharacterSprite(
        activeCharacter, 
        clothingState,  // 使用当前衣着状态
        emotion
    );
    setCurrentSprite(sprite);
    
    // ... 处理其他响应字段
};
```

**处理流程**:
1. 先更新衣着状态（如果 AI 指定）
2. 根据新的衣着状态和表情获取立绘
3. 更新显示的立绘路径

### 4. 立绘获取函数

**文件**: `utils/gameLogic.ts`

```typescript
export function getCharacterSprite(
    character: Character,
    clothing: ClothingState,
    emotion: string
): string {
    const config = CHARACTER_IMAGES[character.id];
    if (!config) {
        console.warn(`Character image config not found: ${character.id}`);
        return '';
    }
    
    // 1. 获取对应衣着状态的配置
    const clothingConfig = config[clothing] || config.default;
    
    // 2. 获取对应表情的图片数组
    const emotionImages = clothingConfig.emotions[emotion];
    
    if (emotionImages && emotionImages.length > 0) {
        // 3. 随机选择一张（如果有多张）
        const index = Math.floor(Math.random() * emotionImages.length);
        return emotionImages[index];
    }
    
    // 4. 回退到该衣着状态的默认立绘
    return clothingConfig.spriteUrl;
}
```

**回退机制**:
1. 如果指定的衣着状态不存在 → 使用 `default` 状态
2. 如果指定的表情不存在 → 使用该衣着状态的默认立绘
3. 如果有多张表情图片 → 随机选择一张

---

## 💡 使用示例

### 场景 1: 温泉对话

**初始化**:
```typescript
// 进入温泉场景，设置初始衣着为裸体
handleEnterDialogue('char_101', 'bath_together');
// clothingState 被设置为 'nude'
```

**对话过程**:

**玩家**: "水温怎么样？"

**AI 响应**:
```json
{
    "text": "*(脸颊微红)* 水温刚刚好呢...",
    "emotion": "shy",
    "clothing": "nude"
}
```

**系统处理**:
1. 衣着状态保持为 `nude`（AI 确认）
2. 表情切换为 `shy`
3. 显示立绘: `img/char/101/nude/shy.png`

### 场景 2: 情绪变化

**玩家**: "你今天看起来很开心啊"

**AI 响应**:
```json
{
    "text": "嗯！因为你来看我了嘛~",
    "emotion": "happy"
}
```

**系统处理**:
1. 衣着状态不变（AI 未指定）
2. 表情切换为 `happy`
3. 如果有多张 happy 表情，随机选择一张

### 场景 3: 衣着状态切换

**玩家**: "该穿上衣服了"

**AI 响应**:
```json
{
    "text": "嗯...好吧。",
    "emotion": "normal",
    "clothing": "default"
}
```

**系统处理**:
1. 衣着状态从 `nude` 切换为 `default`
2. 表情为 `normal`
3. 显示立绘: `img/char/101/default/normal.png`

### 场景 4: 表情不存在时的回退

**AI 响应**:
```json
{
    "text": "我有点累了...",
    "emotion": "tired"
}
```

**系统处理**:
1. 查找 `tired` 表情 → 不存在
2. 回退到当前衣着状态的默认立绘
3. 显示: `img/char/101/default/normal.png`（或当前衣着的默认图）

---

## 🎨 资源组织规范

### 目录结构

```
img/
├── face/                    # 角色头像
│   ├── 101.png             # 角色 101 头像
│   └── 102.png             # 角色 102 头像
└── char/                    # 角色立绘
    ├── 101/                 # 角色 101 立绘
    │   ├── default/         # 日常装束
    │   │   ├── normal.png
    │   │   ├── happy_1.png
    │   │   ├── happy_2.png
    │   │   ├── angry.png
    │   │   └── shy.png
    │   ├── nude/            # 裸体状态
    │   │   ├── normal.png
    │   │   ├── shy.png
    │   │   └── happy.png
    │   └── bondage/         # 束缚状态（可选）
    │       └── normal.png
    └── 102/                 # 角色 102 立绘
        └── ...
```

### 命名规范

- **目录名**: 使用衣着状态名称（`default`, `nude`, `bondage`）
- **文件名**: 使用表情代码（`normal.png`, `happy.png`）
- **多张变体**: 使用下划线加数字（`happy_1.png`, `happy_2.png`）

### 资源要求

- **格式**: PNG（支持透明背景）
- **尺寸**: 建议统一尺寸（如 800x1200）
- **分辨率**: 适合游戏显示的分辨率
- **文件大小**: 优化后的文件大小，避免过大

---

## 🔍 调试与测试

### 调试日志

```typescript
// 在 getCharacterSprite 函数中添加日志
console.log(`[Sprite] Character: ${character.id}, Clothing: ${clothing}, Emotion: ${emotion}`);
console.log(`[Sprite] Selected: ${selectedSprite}`);
```

### 测试检查清单

- [ ] 所有表情代码都有对应的图片资源
- [ ] 每个衣着状态都有默认立绘（`spriteUrl`）
- [ ] 表情不存在时能正确回退到默认立绘
- [ ] 衣着状态切换时立绘正确更新
- [ ] 多张表情图片能随机选择
- [ ] NSFW 开关能正确控制衣着变化

### 常见问题

**问题 1: 立绘不显示**

排查步骤:
1. 检查 `CHARACTER_IMAGES` 配置是否存在该角色
2. 检查图片路径是否正确
3. 检查图片文件是否存在
4. 查看浏览器控制台是否有 404 错误

**问题 2: 表情切换不生效**

排查步骤:
1. 检查 AI 响应中是否包含 `emotion` 字段
2. 检查表情代码是否在配置中存在
3. 检查是否正确调用了 `getCharacterSprite`
4. 查看 `currentSprite` 状态是否更新

**问题 3: 衣着状态切换失败**

排查步骤:
1. 检查 NSFW 设置是否开启（`settings.enableNSFW`）
2. 检查 AI 响应中 `clothing` 字段的值
3. 检查该衣着状态的配置是否存在
4. 查看 `clothingState` 状态是否更新

---

## 🚀 优化建议

### 性能优化

1. **图片预加载**: 在对话开始前预加载常用表情
2. **懒加载**: 按需加载不常用的衣着状态图片
3. **图片压缩**: 使用工具压缩图片文件大小
4. **缓存策略**: 利用浏览器缓存已加载的图片

### 用户体验优化

1. **过渡动画**: 添加立绘切换的淡入淡出效果
2. **加载提示**: 图片加载时显示占位符
3. **错误处理**: 图片加载失败时显示默认图片
4. **响应式**: 根据屏幕尺寸调整立绘大小

### 扩展性建议

1. **动态表情**: 支持 GIF 或序列帧动画
2. **表情组合**: 支持多个表情叠加（如 `happy_blush`）
3. **局部变化**: 支持只改变脸部表情，身体保持不变
4. **自定义皮肤**: 允许玩家自定义角色外观

---

## 📚 相关文档

- [AI 驱动系统技术标准](./AI_DRIVEN_SYSTEMS.md) - 总体技术标准
- [物品获取系统](./CHARACTER_ITEM_GAIN_SYSTEM.md) - 物品发放系统
- [角色移动系统](./CHARACTER_MOVEMENT_SYSTEM.md) - 角色位置控制
- [好感度变化系统](./CHARACTER_AFFINITY_CHANGE_SYSTEM.md) - 好感度管理

---

## 🔗 相关文件

- `data/systemPrompts.ts` - AI 提示词配置
- `data/characterImages.ts` - 角色立绘资源配置
- `hooks/useDialogueSystem.ts` - 对话系统核心逻辑
- `utils/gameLogic.ts` - 立绘获取函数
- `components/ChatInterface.tsx` - 立绘显示组件

---

**最后更新**: 2026-02-22  
**文档版本**: 1.0.0  
**设计者**: Nyaa  
**开发者**: Gemini  
**维护者**: Claude  
**标签**: `#立绘系统` `#AI驱动` `#视觉反馈` `#表情切换`
</contents>