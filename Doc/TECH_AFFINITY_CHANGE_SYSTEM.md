# [AI驱动的角色好感度变化系统] 技术文档

## 📋 概述

本文档详细描述了通过 AI 聊天驱动的角色好感度变化功能（`affinity_change`）的完整技术实现。该系统允许 AI 根据对话内容和角色情绪自动输出好感度变化值，实现动态的角色关系管理。

---

## 🎯 功能目标

1. **智能评估**: AI 根据对话内容自动判断好感度变化
2. **情绪反馈**: 将角色的情绪状态量化为好感度数值
3. **累计追踪**: 跟踪单次对话会话中的好感度累计变化
4. **触发机制**: 当好感度累计过低时触发角色主动结束对话

---

## 🏗️ 系统架构

### 数据流向图

```
用户输入消息
    ↓
LLM 服务处理
    ↓
AI 生成响应 (包含 affinity_change)
    ↓
解析 JSON 响应
    ↓
┌─────────────────────────────────┐
│  更新全局好感度                    │
│  (永久存储在角色统计数据中)          │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  累计会话好感度                    │
│  (sessionAffinityTotal)          │
└─────────────────────────────────┘
    ↓
检测累计值是否 ≤ -10
    ↓
是 → 触发角色主动结束对话
否 → 继续对话
```

---

## 📂 核心文件结构

### 1. AI 提示词定义
**文件**: `data/systemPrompts.ts`

定义了 AI 如何输出好感度变化值的规则：

```typescript
const PROMPT_AFFINITY = `
## 好感度变化指令 (Affinity Change)
- 根据对话内容和角色的情绪反应，在 JSON 响应中包含 'affinity_change' 字段来表示好感度变化。
- 变化范围：-5 到 +5 之间的整数。
- 正面情绪（高兴、感动、害羞、温暖、感激等）：+1 到 +5
  - +1: 轻微好感（如普通的礼貌回应）
  - +2~+3: 明显好感（如被夸奖、收到礼物、愉快的对话）
  - +4~+5: 强烈好感（如深受感动、特别开心、产生亲密感）
- 负面情绪（生气、厌恶、失望、不满、被冒犯等）：-1 到 -5
  - -1: 轻微不满（如被打扰、话题不合适）
  - -2~-3: 明显不满（如被冒犯、说了不该说的话）
  - -4~-5: 强烈反感（如严重冒犯、侮辱、触碰底线）
- 中性或平淡的对话不需要输出此字段。
- 好感度变化应该符合角色性格和当前情境，保持自然和一致性。
- 注意：如果对话中好感度累计下降过多（≤-10），角色可能会主动结束对话。
`;
```

**关键点**:
- AI 被明确指示在何种情况下输出 `affinity_change`
- 提供了清晰的数值范围和情绪对应关系（包含详细的分级说明）
- 强调自然性和角色一致性
- 提醒 AI 注意累计效应可能触发对话结束

---

### 2. 类型定义
**文件**: `services/llmService.ts`

```typescript
export interface LLMResponse {
    text: string;
    emotion?: string;
    clothing?: 'default' | 'nude' | 'bondage';
    move_to?: string;
    items?: { id: string; count: number }[];
    affinity_change?: number; // 好感度变化 (-5 到 +5)
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
```

**关键点**:
- `affinity_change` 定义为可选字段
- 类型为 `number`，范围在 -5 到 +5

---

### 3. 核心逻辑实现
**文件**: `hooks/useDialogueSystem.ts`

#### 3.1 状态管理

```typescript
// 跟踪当前对话会话的好感度累计变化
const [sessionAffinityTotal, setSessionAffinityTotal] = useState<number>(0);

// 显示好感度变化的临时指示器
const [lastAffinityChange, setLastAffinityChange] = useState<number | undefined>(undefined);
```

**说明**:
- `sessionAffinityTotal`: 累计当前对话会话中的所有好感度变化
- `lastAffinityChange`: 用于 UI 显示最近一次的好感度变化（2.5秒后自动清除）

#### 3.2 对话开始时重置

```typescript
const handleEnterDialogue = async (characterId: string, actionType: string = 'chat') => {
    // ... 其他初始化逻辑
    
    // [角色主动结束对话] 重置对话会话的好感度累计
    setSessionAffinityTotal(0);
    
    // ... 其他初始化逻辑
};
```

**说明**:
- 每次进入新对话时，重置会话累计值为 0
- 确保每次对话独立计算

#### 3.3 处理 AI 响应中的好感度变化

```typescript
// 在 handleSendMessage 函数中
if (response.affinity_change && activeCharacter) {
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
    if (newTotal <= -10 && clothingState !== 'bondage') {
        console.log(`[角色主动结束对话] 好感度累计: ${newTotal}, 触发强制结束`);
        // 延迟1秒，让当前消息显示完毕
        setTimeout(() => {
            handleEndDialogueGeneration();
        }, 1000);
    }
}
```

**关键点**:
1. **双重更新**: 同时更新全局好感度和会话累计值
2. **UI 反馈**: 通过 `lastAffinityChange` 提供视觉反馈
3. **自动触发**: 当累计值 ≤ -10 时自动触发结束对话
4. **状态豁免**: `bondage` 状态下不触发自动结束

#### 3.4 对话结束时清理

```typescript
const handleFinalClose = () => {
    // ... 其他清理逻辑
    
    // [角色主动结束对话] 重置好感度累计
    setSessionAffinityTotal(0);
    
    // ... 其他清理逻辑
};
```

#### 3.5 角色主动结束对话的告别文本生成

当 `sessionAffinityTotal <= -10` 时，系统会生成特殊的告别文本：

- 告诉 AI 角色因为玩家的言行感到不满
- 提供当前好感度累计下降的数值
- 要求 AI 生成符合角色性格的恼怒告别语
- 告别文本由 AI 动态生成，而非固定模板

---

### 4. UI 组件集成
**文件**: `components/ChatInterface.tsx`

```typescript
interface ChatInterfaceProps {
    // ... 其他属性
    stats?: { level: number; affinity: number };
    affinityChange?: number; // 好感度变化值
    sessionAffinityTotal?: number; // 当前对话好感度累计
    clothingState?: string; // 当前衣着状态
}
```

**文件**: `components/GameScene.tsx`

```typescript
<ChatInterface 
    // ... 其他属性
    stats={currentStats}
    affinityChange={dialogue.lastAffinityChange}
    sessionAffinityTotal={dialogue.sessionAffinityTotal}
    clothingState={dialogue.clothingState}
/>
```

---

## 🔄 完整工作流程

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

### 场景 2: 触发角色主动结束

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

## 📊 数据结构

### 全局好感度存储
**位置**: `GameScene` 组件状态 → `characterStats`

```typescript
characterStats: {
    'char_101': { level: 1, affinity: 52 },
    'char_102': { level: 1, affinity: 30 },
    // ...
}
```

**特点**:
- 永久存储（通过 localStorage）
- 跨对话会话保持
- 影响角色的长期关系

### 会话好感度累计
**位置**: `useDialogueSystem` Hook 状态 → `sessionAffinityTotal`

```typescript
sessionAffinityTotal: -12  // 当前对话会话的累计值
```

**特点**:
- 临时存储（仅在对话期间）
- 每次对话开始时重置为 0
- 用于触发角色主动结束对话

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
if (newTotal <= -10 && clothingState !== 'bondage') {
    // 触发结束
}

// 可调整为:
// - 更严格: -8 (更容易触发)
// - 更宽松: -15 (更难触发)
```

---

## 🐛 调试与监控

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

### 调试工具建议

1. **开发者面板**
   - 显示当前 `sessionAffinityTotal` 值
   - 显示每次 `affinity_change` 的详细信息
   - 提供手动重置功能

2. **日志记录**
   - 记录所有好感度变化事件
   - 记录触发自动结束的情况
   - 分析 AI 输出的 `affinity_change` 分布

---

## 🔒 边界情况处理

### 1. AI 未输出 affinity_change
**情况**: AI 响应中没有 `affinity_change` 字段

**处理**: 
- 不更新任何好感度值
- 不影响会话累计
- 正常继续对话

### 2. affinity_change 超出范围
**情况**: AI 输出的值超出 -5 到 +5 范围

**建议处理**:
```typescript
if (response.affinity_change) {
    // 限制在有效范围内
    const clampedChange = Math.max(-5, Math.min(5, response.affinity_change));
    onAffinityChange(activeCharacter.id, clampedChange);
}
```

### 3. bondage 状态下的好感度变化
**情况**: 角色处于 `bondage` 状态

**处理**:
- 仍然更新全局好感度
- 仍然累计会话好感度
- 但不触发自动结束对话

### 4. 对话中途切换角色
**情况**: 用户在对话中切换到另一个角色

**处理**:
- 当前对话的 `sessionAffinityTotal` 被重置
- 新对话从 0 开始累计

---

## 📈 性能考虑

### 1. 状态更新频率
- `sessionAffinityTotal` 仅在收到 AI 响应时更新
- 不会造成频繁的重渲染

### 2. 内存占用
- 会话累计值仅占用少量内存（单个数字）
- 不需要持久化存储

### 3. 计算复杂度
- 累计计算为简单的加法操作
- 阈值检测为简单的比较操作
- 性能影响可忽略不计

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
    'char_101': -8,  // 傲娇角色，更容易生气
    'char_102': -12, // 温柔角色，更宽容
    // ...
};
```

### 3. 好感度历史记录
```typescript
interface AffinityHistory {
    timestamp: number;
    change: number;
    reason: string; // 对话内容摘要
}
```

### 4. 挽回机制
- 玩家可以尝试道歉
- 送礼物恢复好感度
- 特殊事件触发和解

### 5. 好感度影响对话内容
- 高好感度时角色更友好
- 低好感度时角色更冷淡
- 动态调整 AI 提示词

---

## 📚 相关文档

- [角色主动结束对话功能文档](./FEATURE_CHARACTER_AUTO_END_DIALOGUE.md)
- [AI驱动系统总览](./AI_DRIVEN_SYSTEMS.md)

---

## 🔖 代码搜索标记

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

## 👥 维护信息

**最后更新**: 2026-02-21  
**设计者**: Nyaa  
**开发者**: Gemini  
**维护者**: Claude  
**标签**: `#affinity_change` `#好感度系统` `#AI驱动` `#对话系统`

---

## 📝 变更日志

### v1.0.0 (2025-02-21)
- ✅ 初始实现 `affinity_change` 功能
- ✅ 集成到对话系统
- ✅ 实现角色主动结束对话机制
- ✅ 添加 UI 反馈指示器

### v1.0.1 (2025-02-21)
- 🐛 修复：补充缺失的 AI 提示词指令
- 📝 问题：系统提示词中完全缺失好感度变化的指令，导致 AI 不知道应该输出 `affinity_change` 字段
- ✅ 解决：在 `data/systemPrompts.ts` 中添加完整的 `PROMPT_AFFINITY` 模块
- ✅ 包含详细的数值范围说明（-5 到 +5）和情绪对应关系
- ✅ 添加使用规则和注意事项

### 未来计划
- [ ] 多维度好感度系统
- [ ] 角色特定阈值配置
- [ ] 好感度历史记录
- [ ] 挽回机制
- [ ] 好感度影响对话内容