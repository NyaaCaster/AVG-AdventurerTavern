# [角色主动结束对话] 功能实现文档

## 📋 功能概述

当玩家在对话中的言行导致角色情绪持续恶化时，角色会因恼怒主动结束对话。这是一个基于好感度累计变化的智能对话管理系统。

## 🎯 触发条件

- **好感度累计阈值**: 单次对话中好感度累计变化 ≤ -10
- **状态限制**: 角色不处于 `bondage` 状态
- **触发时机**: 在 AI 响应包含好感度变化后自动检测

## 🔧 实现细节

### 1. 状态管理 (`hooks/useDialogueSystem.ts`)

```typescript
// 跟踪当前对话会话的好感度累计
const [sessionAffinityTotal, setSessionAffinityTotal] = useState<number>(0);

// 对话开始时重置累计
const handleEnterDialogue = async (characterId: string, actionType: string = 'chat') => {
    setSessionAffinityTotal(0);
    // ... 其他初始化逻辑
};

// 对话结束时重置累计
const handleFinalClose = () => {
    setSessionAffinityTotal(0);
    // ... 其他清理逻辑
};
```

### 2. 好感度累计与检测 (`hooks/useDialogueSystem.ts`)

```typescript
if (response.affinity_change && activeCharacter) {
    onAffinityChange(activeCharacter.id, response.affinity_change);
    setLastAffinityChange(response.affinity_change);
    
    // 累计好感度变化
    const newTotal = sessionAffinityTotal + response.affinity_change;
    setSessionAffinityTotal(newTotal);
    
    // 检测是否触发自动结束
    if (newTotal <= -10 && clothingState !== 'bondage') {
        console.log(`[角色主动结束对话] 好感度累计: ${newTotal}, 触发强制结束`);
        // 延迟1秒，让当前消息显示完毕
        setTimeout(() => {
            handleEndDialogueGeneration();
        }, 1000);
    }
}
```

### 3. 告别文本生成 (`hooks/useDialogueSystem.ts`)

```typescript
const handleEndDialogueGeneration = async () => {
    // 判断是否为角色主动结束
    const isCharacterInitiated = sessionAffinityTotal <= -10 && clothingState !== 'bondage';
    
    let contextPrompt = '';
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
    } else {
        // 玩家主动结束对话（原有逻辑）
        contextPrompt = `...`;
    }
    
    // 调用 LLM 生成告别文本
    const response = await llmService.sendMessage(contextPrompt);
    // ...
};
```

### 4. 数据传递 (`components/GameScene.tsx`)

```typescript
<ChatInterface 
    // ... 其他属性
    sessionAffinityTotal={dialogue.sessionAffinityTotal}
    clothingState={dialogue.clothingState}
/>
```

## 📊 数据流程图

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

## 🎮 用户体验

### 正常流程
1. 玩家与角色对话
2. 每次 AI 响应可能包含好感度变化（-5 到 +5）
3. 系统累计本次对话的好感度变化
4. 玩家无法直接看到累计值，保持未知感

### 触发阶段（累计 ≤ -10）
1. 系统自动调用结束对话流程
2. AI 生成符合角色性格和当前情绪的恼怒告别文本
3. 告别文本体现角色主动结束的意图
4. 玩家点击屏幕任意位置退出对话

### 特殊情况
- **bondage 状态**: 即使好感度累计 ≤ -10，也不会触发自动结束
- **对话重新开始**: 每次进入对话时，累计值重置为 0

## 🔍 调试信息

系统在触发自动结束时会输出控制台日志：

```javascript
console.log(`[角色主动结束对话] 好感度累计: ${newTotal}, 触发强制结束`);
```

## 📝 代码标记

所有相关代码都使用 `[角色主动结束对话]` 标记，方便搜索和维护：

```bash
# 搜索所有相关代码
grep -r "\[角色主动结束对话\]" .
```

## 🔗 相关文件

- `hooks/useDialogueSystem.ts` - 核心逻辑实现
- `components/ChatInterface.tsx` - 数据接收和传递
- `components/GameScene.tsx` - 数据传递
- `systemPrompts.ts` - AI 提示词（好感度变化规则）

## 🎯 设计理念

1. **真实情感反馈**: 角色不是被动接受玩家的所有言行，而是有自己的情绪底线
2. **未知与不确定**: 不显示警告提示，让玩家保持对角色情绪的真实感知，增强沉浸感
3. **智能文本生成**: 告别文本由 AI 根据对话历史动态生成，而非固定模板
4. **状态豁免**: bondage 状态下角色无法主动结束，符合游戏设定
5. **会话隔离**: 每次对话独立计算，不影响角色的全局好感度

## 🚀 未来扩展

可能的扩展方向：
- 不同角色的触发阈值可配置（如傲娇角色阈值更低）
- 根据角色性格生成不同风格的告别文本
- 添加"挽回"机制，玩家可以尝试道歉
- 记录角色主动结束次数，影响后续互动

---

**最后更新**: 2026-02-21  
**设计者**: Nyaa  
**开发者**: Claude  
**维护者**: Claude  
**标签**: `#角色主动结束对话` `#好感度系统` `#对话管理`