# 好感度变化系统技术文档

## 📋 系统概述

好感度变化系统通过 AI 根据对话内容和角色情绪自动输出好感度变化值，实现动态的角色关系管理。该系统包括智能评估、情绪反馈、累计追踪和触发机制四大核心功能。

### 核心功能

- **智能评估**: AI 根据对话内容自动判断好感度变化
- **情绪反馈**: 将角色的情绪状态量化为好感度数值
- **累计追踪**: 跟踪单次对话会话中的好感度累计变化
- **触发机制**: 当好感度累计过低时触发角色主动结束对话
- **上限控制**: 当好感度累计过高时停止增加，防止单次对话刷好感度

---

## 🎯 设计目标

1. **关系深度**: 量化玩家与角色的关系变化
2. **即时反馈**: 玩家立即看到对话的影响
3. **剧情驱动**: 好感度影响剧情发展和角色行为
4. **平衡机制**: 防止玩家过度冒犯角色或单次对话刷好感度
5. **真实情感**: 角色有自己的情绪底线，会主动结束不愉快的对话
6. **渐进关系**: 好感度需要通过多次对话逐步积累，而非一次性获得

---

## 📊 数据结构

### AI 响应格式

```typescript
interface AIResponse {
    text: string;
    emotion?: string;
    affinity_change?: number;  // 好感度变化 (-5 到 +5)
    // ... 其他字段
}
```

**示例**:
```json
{
    "text": "谢谢你的夸奖~（脸微微泛红）",
    "emotion": "shy",
    "affinity_change": 2
}
```

### 好感度变化范围

**正面变化**: +1 到 +5
- +1: 轻微好感（普通礼貌回应）
- +2~+3: 明显好感（被夸奖、收到礼物、愉快对话）
- +4~+5: 强烈好感（深受感动、特别开心、产生亲密感）

**负面变化**: -1 到 -5
- -1: 轻微不满（被打扰、话题不合适）
- -2~-3: 明显不满（被冒犯、说了不该说的话）
- -4~-5: 强烈反感（严重冒犯、侮辱、触碰底线）

### 数据存储

#### 全局好感度
**位置**: `GameScene` 组件状态 → `characterStats`

```typescript
characterStats: {
    ''char_101'': { level: 1, affinity: 52 },
    ''char_102'': { level: 1, affinity: 30 }
}
```

**特点**:
- 永久存储（通过 localStorage）
- 跨对话会话保持
- 影响角色的长期关系

#### 会话好感度累计
**位置**: `useDialogueSystem` Hook 状态 → `sessionAffinityTotal`

```typescript
sessionAffinityTotal: -12  // 当前对话会话的累计值
```

**特点**:
- 临时存储（仅在对话期间）
- 每次对话开始时重置为 0
- 用于触发角色主动结束对话

---

## 🔧 实现细节

### 1. AI 提示词配置

**文件**: `data/systemPrompts.ts`

```typescript
const PROMPT_AFFINITY = `
## 好感度变化指令 (Affinity Change)
- 根据对话内容和角色的情绪反应，在 JSON 响应中包含 ''affinity_change'' 字段来表示好感度变化。
- 变化范围：-5 到 +5 之间的整数。
- 正面情绪（高兴、感动、害羞、温暖、感激等）：+1 到 +5
- 负面情绪（生气、厌恶、失望、不满、被冒犯等）：-1 到 -5
- 中性或平淡的对话不需要输出此字段。
- 注意：如果对话中好感度累计下降过多（≤-10），角色可能会主动结束对话。
- 注意：如果对话中好感度累计增加过多（≥+10），则不再输出正面的好感度变化（affinity_change字段），但负面变化仍然正常输出。
`;
```

### 2. 状态管理

**文件**: `hooks/useDialogueSystem.ts`

```typescript
// 跟踪当前对话会话的好感度累计变化
const [sessionAffinityTotal, setSessionAffinityTotal] = useState<number>(0);

// 显示好感度变化的临时指示器
const [lastAffinityChange, setLastAffinityChange] = useState<number | undefined>(undefined);
```

### 3. 对话开始时重置

```typescript
const handleEnterDialogue = async (characterId: string, actionType: string = ''chat'') => {
    // ... 其他初始化逻辑
    
    // [角色主动结束对话] 重置对话会话的好感度累计
    setSessionAffinityTotal(0);
    
    // ... 其他初始化逻辑
};
```

### 4. 处理 AI 响应中的好感度变化

```typescript
// 在 handleSendMessage 函数中
if (response.affinity_change && activeCharacter) {
    // [好感度上限] 检查是否已达到正面好感度累计上限
    const shouldApplyChange = response.affinity_change < 0 || sessionAffinityTotal < 10;
    
    if (shouldApplyChange) {
        // 更新全局好感度（永久存储）
        onAffinityChange(activeCharacter.id, response.affinity_change);
        
        // 设置临时显示指示器
        setLastAffinityChange(response.affinity_change);
        
        // 2.5秒后清除指示器
        setTimeout(() => setLastAffinityChange(undefined), 2500);
        
        // [角色主动结束对话] 累计好感度变化
        const newTotal = sessionAffinityTotal + response.affinity_change;
        setSessionAffinityTotal(newTotal);
        
        // 如果累计好感度变化 <= -10 且不在 bondage 状态，角色主动结束对话
        if (newTotal <= -10 && clothingState !== ''bondage'') {
            console.log(`[角色主动结束对话] 好感度累计: ${newTotal}, 触发强制结束`);
            // 延迟1秒，让当前消息显示完毕
            setTimeout(() => {
                handleEndDialogueGeneration();
            }, 1000);
        }
    } else {
        console.log(`[好感度上限] 当前累计: ${sessionAffinityTotal}, 忽略正面变化: +${response.affinity_change}`);
    }
}
```

### 5. 对话结束时清理

```typescript
const handleFinalClose = () => {
    // ... 其他清理逻辑
    
    // [角色主动结束对话] 重置好感度累计
    setSessionAffinityTotal(0);
    
    // ... 其他清理逻辑
};
```

---

## 🚫 角色主动结束对话机制

### 触发条件

- **好感度累计阈值**: 单次对话中好感度累计变化 ≤ -10
- **状态限制**: 角色不处于 `bondage` 状态
- **触发时机**: 在 AI 响应包含好感度变化后自动检测

### 告别文本生成

当触发条件满足时，系统会生成特殊的告别文本：

```typescript
const handleEndDialogueGeneration = async () => {
    // 判断是否为角色主动结束
    const isCharacterInitiated = sessionAffinityTotal <= -10 && clothingState !== ''bondage'';
    
    let contextPrompt = '''';
    if (isCharacterInitiated) {
        // 角色因恼怒主动结束对话
        contextPrompt = `
[系统指令: 此消息不显示给玩家，仅作为系统指令]
你因为玩家的言行感到非常不满和恼怒，决定主动结束这次对话。
当前场景【${worldState.sceneName}】、时间【${worldState.periodLabel}】、好感度(${stats.affinity})。
在这次对话中，你的好感度累计下降了 ${Math.abs(sessionAffinityTotal)} 点。
请根据刚才的对话内容和你当前的情绪状态（生气、失望、厌烦等），生成一句简短但明确表达不满的告别语。
你的台词应该体现出你主动结束对话的意图，而不是被动告别。
不需要添加任何系统前缀，直接输出角色的台词和动作描写。
`;
    }
    
    // 调用 LLM 生成告别文本
    const response = await llmService.sendMessage(contextPrompt);
    // ...
};
```

**关键点**:
- 告诉 AI 角色因为玩家的言行感到不满
- 提供当前好感度累计下降的数值
- 要求 AI 生成符合角色性格的恼怒告别语
- 告别文本由 AI 动态生成，而非固定模板

### 数据流程

```
玩家发送消息
    ↓
AI 生成响应（包含 affinity_change）
    ↓
更新角色好感度（全局）
    ↓
累计对话会话好感度（sessionAffinityTotal）
    ↓
检测累计值是否 ≤ -10 且非 bondage 状态
    ↓
是 → 延迟1秒 → 调用 handleEndDialogueGeneration()
    ↓
生成恼怒告别文本（AI 根据对话历史和情绪状态）
    ↓
显示告别文本 → 等待玩家点击退出
    ↓
重置 sessionAffinityTotal = 0
```

### 特殊情况

**bondage 状态豁免**:
- 即使好感度累计 ≤ -10，也不会触发自动结束
- 角色仍然会更新全局好感度和累计会话好感度
- 符合游戏设定（角色无法主动离开）

**对话重新开始**:
- 每次进入对话时，累计值重置为 0
- 确保每次对话独立计算
- 不影响角色的全局好感度

---

## 💡 使用示例

### 场景 1: 正常对话流程

```
1. 用户: "你今天看起来很漂亮"
   ↓
2. AI 响应:
   {
     "text": "谢谢你的夸奖~（脸微微泛红）",
     "emotion": "shy",
     "affinity_change": 2
   }
   ↓
3. 系统处理:
   - 全局好感度: 50 → 52
   - 会话累计: 0 → 2
   - 显示 UI 指示器: +2 (2.5秒后消失)
   ↓
4. 继续对话...
```

### 场景 2: 触发好感度上限

```
1. 对话历史:
   - 消息1: affinity_change: +3 (累计: +3)
   - 消息2: affinity_change: +2 (累计: +5)
   - 消息3: affinity_change: +4 (累计: +9)
   ↓
2. 用户: "你真是太棒了！"
   ↓
3. AI 响应:
   {
     "text": "谢谢你~（开心地笑了）",
     "emotion": "happy",
     "affinity_change": 2
   }
   ↓
4. 系统检测:
   - 会话累计: 9
   - 新变化: +2
   - 累计会达到: 11 (超过上限 10)
   ↓
5. 系统处理:
   - 忽略此次好感度变化
   - 不更新全局好感度
   - 不显示 UI 指示器
   - 会话累计保持: 9
   - 控制台输出: "[好感度上限] 当前累计: 9, 忽略正面变化: +2"
   ↓
6. 对话继续:
   - AI 对话内容正常显示
   - 角色情绪和行为不受影响
   - 仅好感度数值不再增加
```

### 场景 3: 触发角色主动结束

```
1. 对话历史:
   - 消息1: affinity_change: -3 (累计: -3)
   - 消息2: affinity_change: -2 (累计: -5)
   - 消息3: affinity_change: -4 (累计: -9)
   ↓
2. 用户: "你真是个笨蛋"
   ↓
3. AI 响应:
   {
     "text": "你...你太过分了！",
     "emotion": "angry",
     "affinity_change": -3
   }
   ↓
4. 系统检测:
   - 会话累计: -9 + (-3) = -12
   - 触发条件: -12 ≤ -10 ✓
   - 衣着状态: default (非 bondage) ✓
   ↓
5. 自动触发结束:
   - 延迟 1 秒显示当前消息
   - 调用 handleEndDialogueGeneration()
   - 生成恼怒告别文本
   ↓
6. 显示告别文本:
   "我不想再和你说话了！（转身离开）"
   ↓
7. 等待玩家点击退出
   ↓
8. 重置 sessionAffinityTotal = 0
```

---

## 🎨 UI 反馈机制

### 好感度变化指示器

```typescript
// 显示逻辑
if (affinityChange !== undefined) {
    // 显示动画效果
    // 例如: 在角色头像旁显示 "+2" 或 "-3"
    // 颜色: 正数为绿色，负数为红色
    // 2.5秒后自动消失
}
```

**建议实现**:
- 使用淡入淡出动画
- 正数显示为绿色/金色，负数显示为红色
- 位置: 角色头像或状态栏附近
- 持续时间: 2.5 秒

---

## 🔧 配置与调优

### AI 提示词调优建议

1. **频率控制**
   - 不是每条消息都需要 `affinity_change`
   - 只在有明确情绪反应时输出
   - 避免过于频繁的好感度波动

2. **数值校准**
   - 根据实际游戏体验调整数值范围
   - 考虑不同角色性格的差异
   - 平衡正面和负面变化的频率

3. **角色一致性**
   - 确保好感度变化符合角色性格
   - 傲娇角色可能更容易产生负面变化
   - 温柔角色可能更宽容

### 触发阈值调整

```typescript
// 当前阈值: -10
if (newTotal <= -10 && clothingState !== ''bondage'') {
    // 触发结束
}

// 可调整为:
// - 更严格: -8 (更容易触发)
// - 更宽松: -15 (更难触发)
```

### 角色特定阈值（未来扩展）

```typescript
const CHARACTER_THRESHOLDS = {
    ''char_101'': -8,  // 傲娇角色，更容易生气
    ''char_102'': -12, // 温柔角色，更宽容
    // ...
};
```

---

## 🔍 调试与监控

### 控制台日志

系统在关键节点输出日志：

```javascript
// 触发自动结束时
console.log(`[角色主动结束对话] 好感度累计: ${newTotal}, 触发强制结束`);

// 可添加更多调试日志
console.log(`[Affinity] 全局好感度: ${stats.affinity}, 会话累计: ${sessionAffinityTotal}`);
```

### 常见问题排查

**问题：AI 不输出 `affinity_change` 字段**

可能原因：
1. 系统提示词中缺少好感度变化指令 → 检查 `data/systemPrompts.ts` 中是否包含 `PROMPT_AFFINITY`
2. AI 模型不支持 JSON 模式 → 检查 LLM 服务日志
3. 对话内容过于中性 → 这是正常行为，中性对话不应触发好感度变化

排查步骤：
1. 检查 `GLOBAL_AI_RULES` 是否包含 `PROMPT_AFFINITY` 模块
2. 查看 LLM 服务的请求/响应日志
3. 尝试发送明确带有情绪的消息（如夸奖或冒犯）
4. 检查 AI 响应的原始 JSON 是否包含该字段

### 代码搜索标记

所有相关代码使用以下标记，方便搜索：

```bash
# 搜索好感度变化相关代码
grep -r "affinity_change" .

# 搜索角色主动结束对话相关代码
grep -r "\[角色主动结束对话\]" .

# 搜索会话累计相关代码
grep -r "sessionAffinityTotal" .
```

---

## 🧪 测试用例

### 测试清单

- [ ] 正面好感度变化正常更新
- [ ] 负面好感度变化正常更新
- [ ] 会话累计值正确计算
- [ ] 触发阈值 -10 正确检测
- [ ] 触发上限 +10 正确检测
- [ ] 达到上限后正面变化被忽略
- [ ] 达到上限后负面变化仍然生效
- [ ] bondage 状态下不触发自动结束
- [ ] 对话开始时累计值重置为 0
- [ ] 对话结束时累计值重置为 0
- [ ] 告别文本正确生成
- [ ] UI 指示器正常显示和消失
- [ ] 全局好感度正确持久化

### 测试脚本

```typescript
const testAffinitySystem = () => {
    const testCases = [
        {
            name: ''正常好感度增加'',
            changes: [2, 3, 1],
            expectedTotal: 6,
            shouldTriggerEnd: false,
            shouldTriggerCap: false
        },
        {
            name: ''触发好感度上限'',
            changes: [3, 3, 3, 2],
            expectedTotal: 9,  // 最后一个 +2 被忽略
            shouldTriggerEnd: false,
            shouldTriggerCap: true
        },
        {
            name: ''达到上限后负面变化仍生效'',
            changes: [3, 3, 3, 2, -2],
            expectedTotal: 7,  // 9 (上限前) + (-2)
            shouldTriggerEnd: false,
            shouldTriggerCap: false
        },
        {
            name: ''触发自动结束'',
            changes: [-3, -2, -4, -3],
            expectedTotal: -12,
            shouldTriggerEnd: true,
            shouldTriggerCap: false
        },
        {
            name: ''bondage 状态豁免'',
            changes: [-3, -2, -4, -3],
            clothingState: ''bondage'',
            expectedTotal: -12,
            shouldTriggerEnd: false,
            shouldTriggerCap: false
        }
    ];
    
    testCases.forEach(testCase => {
        console.log(`Testing: ${testCase.name}`);
        // 执行测试逻辑
    });
};
```

---

## 🎮 用户体验设计

### 设计理念

1. **真实情感反馈**: 角色不是被动接受玩家的所有言行，而是有自己的情绪底线
2. **未知与不确定**: 不显示警告提示，让玩家保持对角色情绪的真实感知，增强沉浸感
3. **智能文本生成**: 告别文本由 AI 根据对话历史动态生成，而非固定模板
4. **状态豁免**: bondage 状态下角色无法主动结束，符合游戏设定
5. **会话隔离**: 每次对话独立计算，不影响角色的全局好感度

### 玩家体验流程

**正常流程**:
1. 玩家与角色对话
2. 每次 AI 响应可能包含好感度变化（-5 到 +5）
3. 系统累计本次对话的好感度变化
4. 玩家无法直接看到累计值，保持未知感

**触发阶段**（累计 ≤ -10）:
1. 系统自动调用结束对话流程
2. AI 生成符合角色性格和当前情绪的恼怒告别文本
3. 告别文本体现角色主动结束的意图
4. 玩家点击屏幕任意位置退出对话

---

## 🚀 未来扩展方向

### 1. 多维度好感度系统

```typescript
interface AffinityChange {
    romantic: number;   // 浪漫好感
    friendship: number; // 友谊好感
    respect: number;    // 尊重度
    trust: number;      // 信任度
}
```

### 2. 角色特定阈值

```typescript
const CHARACTER_THRESHOLDS = {
    ''char_101'': -8,  // 傲娇角色，更容易生气
    ''char_102'': -12, // 温柔角色，更宽容
    ''char_103'': -6,  // 高傲角色，非常容易生气
    // ...
};
```

### 3. 好感度历史记录

```typescript
interface AffinityHistory {
    timestamp: number;
    change: number;
    reason: string; // 对话内容摘要
    sessionId: string;
}
```

### 4. 挽回机制

- 玩家可以尝试道歉
- 送礼物恢复好感度
- 特殊事件触发和解
- 时间流逝自然恢复

### 5. 好感度影响对话内容

- 高好感度时角色更友好、更愿意分享
- 低好感度时角色更冷淡、更警惕
- 动态调整 AI 提示词中的角色态度

### 6. 好感度等级系统

```typescript
const AFFINITY_LEVELS = {
    ''hostile'': { min: -100, max: -50, label: ''敌对'' },
    ''unfriendly'': { min: -49, max: -10, label: ''不友好'' },
    ''neutral'': { min: -9, max: 30, label: ''中立'' },
    ''friendly'': { min: 31, max: 70, label: ''友好'' },
    ''close'': { min: 71, max: 100, label: ''亲密'' }
};
```

---

## 📚 相关文档

- [AI 驱动系统技术标准](./AI_DRIVEN_SYSTEMS.md) - 总体技术标准
- [角色立绘变化系统](./CHARACTER_SPRITE_SYSTEM.md) - 立绘切换系统
- [物品获取系统](./CHARACTER_ITEM_GAIN_SYSTEM.md) - 物品发放系统
- [角色移动系统](./CHARACTER_MOVEMENT_SYSTEM.md) - 角色位置控制

---

## 🔗 相关文件

- `data/systemPrompts.ts` - AI 提示词配置
- `hooks/useDialogueSystem.ts` - 对话系统核心逻辑
- `components/GameScene.tsx` - 游戏场景和系统集成
- `components/ChatInterface.tsx` - 聊天界面组件
- `components/AffinityToast.tsx` - 好感度通知组件

---

## 📝 变更日志

### v1.0.0 (2025-02-21)
- ✅ 初始实现 `affinity_change` 功能
- ✅ 集成到对话系统
- ✅ 实现角色主动结束对话机制
- ✅ 添加 UI 反馈指示器

### v1.0.1 (2025-02-21)
- 🐛 修复：补充缺失的 AI 提示词指令
- 📝 问题：系统提示词中完全缺失好感度变化的指令
- ✅ 解决：在 `data/systemPrompts.ts` 中添加完整的 `PROMPT_AFFINITY` 模块

### v2.0.0 (2026-02-22)
- 📚 文档重构：整合角色主动结束对话功能
- 📝 完善实现细节和使用示例
- ✅ 添加测试用例和调试指南
- 🎨 优化文档结构和可读性

### v2.1.0 (2026-02-22)
- ✨ 新功能：添加好感度上限机制
- 🎯 设计目标：防止单次对话刷好感度
- 📝 实现：当会话累计好感度 ≥ +10 时，停止应用正面好感度变化
- ⚠️ 重要：负面好感度变化不受上限限制，始终生效
- 🤖 AI 提示：更新系统提示词，告知 AI 上限机制
- 📚 文档：添加好感度上限相关说明和测试用例

---

**最后更新**: 2026-02-22  
**文档版本**: 2.1.0  
**设计者**: Nyaa  
**开发者**: Claude  
**维护者**: Claude  
**标签**: `#好感度系统` `#AI驱动` `#关系管理` `#角色主动结束对话`
