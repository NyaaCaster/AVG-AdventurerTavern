# AI 驱动系统技术标准

## 📋 文档概述

本文档定义了通过 AI 对话的结构化数据输出驱动游戏系统功能的统一技术标准。这是一套通用的架构设计规范，适用于所有需要 AI 控制游戏状态的功能模块。

### 核心理念

**AI 作为游戏控制器**: 将 LLM 从单纯的对话生成器转变为游戏系统的智能控制器，通过结构化的 JSON 输出声明式地控制游戏状态。

### 设计原则

- **声明式控制**: AI 通过 JSON 字段声明意图，游戏系统负责执行
- **松耦合**: 各系统独立运作，可单独启用或禁用
- **容错性**: 无效指令不影响游戏正常运行
- **即时反馈**: 所有状态变化都有视觉或听觉反馈
- **可扩展性**: 新增功能只需添加新的 JSON 字段和对应处理器

### 已实现的系统示例

1. **[角色立绘变化系统](./CHARACTER_SPRITE_SYSTEM.md)** - 衣着和表情动态切换
2. **[物品获取系统](./CHARACTER_ITEM_GAIN_SYSTEM.md)** - 对话中获得道具
3. **[角色移动系统](./CHARACTER_MOVEMENT_SYSTEM.md)** - AI 控制角色场景转移
4. **[好感度变化系统](./CHARACTER_AFFINITY_CHANGE_SYSTEM.md)** - 智能评估对话影响并触发事件

---

## 🎯 核心架构

### 1. 结构化输出协议

**基本原则**: AI 的每次响应都是一个 JSON 对象，包含对话文本和可选的游戏指令字段。

```typescript
interface AIResponse {
    text: string;              // 必需：对话文本
    [key: string]: any;        // 可选：游戏指令字段
}
```

**协议规范**:
- **必需字段**: 只有 `text` 是必需的，确保基本对话功能
- **可选字段**: 所有游戏指令字段都是可选的，按需输出
- **命名规范**: 字段名使用 `snake_case`，清晰表达意图
- **容错设计**: 缺失或无效的字段不影响其他功能

**示例响应**:
```json
{
    "text": "谢谢你的礼物！我们一起去温泉吧~",
    "emotion": "happy",
    "gain_items": [{"id": "acs_charm", "count": 1}],
    "move_to": "scen_7",
    "affinity_change": 5
}
```

### 2. 如何让 AI 输出结构化数据

#### 方法一：系统提示词（推荐）

在系统提示词中明确定义 JSON 输出格式和规则：

```typescript
const SYSTEM_PROMPT = `
你是一个游戏角色，你的响应必须是严格的 JSON 格式。

## 输出格式
{
    "text": "对话文本（必需）",
    "emotion": "表情代码（可选）",
    "gain_items": [{"id": "物品ID", "count": 数量}]（可选）
    // ... 其他可选字段
}

## 输出规则
1. 必须输出有效的 JSON 对象
2. text 字段必须存在
3. 其他字段仅在需要时输出
4. 不要添加任何 JSON 之外的文本
`;
```

**关键要点**:
- 明确要求 JSON 格式
- 列出所有可用字段及其含义
- 说明何时应该输出某个字段
- 提供示例帮助 AI 理解

#### 方法二：Function Calling（OpenAI API）

使用 OpenAI 的 Function Calling 功能强制结构化输出：

```typescript
const functions = [{
    name: "respond_to_player",
    description: "响应玩家的对话",
    parameters: {
        type: "object",
        properties: {
            text: { type: "string", description: "对话文本" },
            emotion: { type: "string", description: "表情代码" },
            // ... 其他字段定义
        },
        required: ["text"]
    }
}];

const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: messages,
    functions: functions,
    function_call: { name: "respond_to_player" }
});
```

#### 方法三：JSON Mode（OpenAI API）

使用 JSON Mode 确保输出是有效的 JSON：

```typescript
const response = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages: messages,
    response_format: { type: "json_object" }
});
```

**注意**: 使用 JSON Mode 时，必须在提示词中明确要求 JSON 输出。

### 3. 游戏如何监听和处理数据

#### 统一的响应处理器

```typescript
// 核心处理函数
function handleAIResponse(response: AIResponse) {
    // 1. 显示对话文本（必需）
    displayDialogueText(response.text);
    
    // 2. 遍历所有可选字段，调用对应的处理器
    Object.keys(response).forEach(key => {
        if (key === 'text') return; // 跳过已处理的文本
        
        const handler = fieldHandlers[key];
        if (handler) {
            try {
                handler(response[key]);
            } catch (error) {
                console.error(`Error handling field ${key}:`, error);
                // 单个字段错误不影响其他字段
            }
        }
    });
}
```

#### 字段处理器注册表

```typescript
// 字段处理器映射表
const fieldHandlers: Record<string, (value: any) => void> = {
    emotion: handleEmotion,
    clothing: handleClothing,
    gain_items: handleItemGain,
    move_to: handleMovement,
    affinity_change: handleAffinityChange,
    // ... 可以轻松添加新的处理器
};

// 示例：表情处理器
function handleEmotion(emotion: string) {
    if (!validateEmotion(emotion)) {
        console.warn(`Invalid emotion: ${emotion}`);
        return;
    }
    updateCharacterSprite(emotion);
}

// 示例：物品处理器
function handleItemGain(items: ItemGainInstruction[]) {
    const validItems = items.filter(validateItem);
    if (validItems.length > 0) {
        addItemsToInventory(validItems);
        showItemNotifications(validItems);
    }
}
```

#### 处理器的标准结构

每个字段处理器应遵循以下模式：

```typescript
function handle[FieldName](value: any) {
    // 1. 验证数据
    if (!validate[FieldName](value)) {
        console.warn(`Invalid ${fieldName}:`, value);
        return;
    }
    
    // 2. 执行游戏逻辑
    execute[FieldName]Action(value);
    
    // 3. 更新游戏状态
    update[FieldName]State(value);
    
    // 4. 提供用户反馈
    show[FieldName]Feedback(value);
    
    // 5. 持久化（如需要）
    if (shouldPersist) {
        persist[FieldName]State(value);
    }
}
```

### 4. 数据流全景

```
┌─────────────────┐
│  玩家输入消息    │
└────────┬────────┘
         ↓
┌─────────────────┐
│ 构建 LLM 请求   │
│ + 系统提示词    │
│ + 对话历史      │
│ + 游戏上下文    │
└────────┬────────┘
         ↓
┌─────────────────┐
│  LLM API 调用   │
│ (JSON Mode)     │
└────────┬────────┘
         ↓
┌─────────────────┐
│ AI 生成 JSON    │
│ 结构化响应      │
└────────┬────────┘
         ↓
┌─────────────────┐
│  解析 JSON      │
│  验证格式       │
└────────┬────────┘
         ↓
┌─────────────────┐
│ 显示对话文本    │
│ (text 字段)     │
└────────┬────────┘
         ↓
┌─────────────────┐
│ 遍历可选字段    │
│ 调用对应处理器  │
└────────┬────────┘
         ↓
    ┌────┴────┐
    ↓         ↓
┌───────┐ ┌───────┐
│验证数据│ │执行逻辑│
└───┬───┘ └───┬───┘
    ↓         ↓
┌───────┐ ┌───────┐
│更新状态│ │显示反馈│
└───┬───┘ └───┬───┘
    ↓         ↓
┌─────────────────┐
│  持久化存储     │
│  (如需要)       │
└─────────────────┘
```

---

## 📦 实现示例

以下是基于此标准实现的系统示例，展示了如何将通用标准应用到具体功能：

| 系统 | JSON 字段 | 功能描述 | 详细文档 |
|------|----------|---------|----------|
| 角色立绘变化 | `emotion`, `clothing` | 根据情绪和剧情切换表情和衣着 | [查看文档](./CHARACTER_SPRITE_SYSTEM.md) |
| 物品获取 | `gain_items` | AI 判断并自动发放物品 | [查看文档](./CHARACTER_ITEM_GAIN_SYSTEM.md) |
| 角色移动 | `move_to` | AI 控制角色场景转移 | [查看文档](./CHARACTER_MOVEMENT_SYSTEM.md) |
| 好感度变化 | `affinity_change` | 量化关系变化并触发事件 | [查看文档](./CHARACTER_AFFINITY_CHANGE_SYSTEM.md) |

**扩展性**: 添加新功能只需：
1. 定义新的 JSON 字段
2. 在系统提示词中说明字段用途
3. 实现对应的字段处理器
4. 注册到处理器映射表

---

## 🔧 实现标准

### 1. AI 提示词编写规范

每个 JSON 字段都需要在系统提示词中明确说明：

```markdown
## [字段名] 指令

### 功能说明
[简要描述该字段的作用]

### 输出格式
"field_name": value_type

### 触发条件
[何时应该输出此字段]

### 取值范围
[列出所有有效值或值的范围]

### 使用示例
正面示例：[展示正确用法]
反面示例：[展示错误用法]

### 注意事项
[特殊规则和限制]
```

**关键原则**:
- **明确性**: 清晰定义字段含义和用途
- **完整性**: 列出所有可用值（如场景 ID、物品 ID）
- **示例性**: 提供正反示例帮助 AI 理解
- **限制性**: 说明何时不应输出该字段

### 2. 数据验证三层模型

```typescript
function validateField(fieldName: string, value: any): boolean {
    // 第一层：类型验证
    if (!validateType(fieldName, value)) {
        console.warn(`Type error for ${fieldName}`);
        return false;
    }
    
    // 第二层：值域验证
    if (!validateRange(fieldName, value)) {
        console.warn(`Range error for ${fieldName}`);
        return false;
    }
    
    // 第三层：业务逻辑验证
    if (!validateBusinessRules(fieldName, value)) {
        console.warn(`Business rule violation for ${fieldName}`);
        return false;
    }
    
    return true;
}
```

**验证层级**:
1. **类型验证**: 确保数据类型正确（string, number, array 等）
2. **值域验证**: 确保值在有效范围内（如 ID 存在、数值在范围内）
3. **业务验证**: 确保符合业务逻辑（如角色是否可移动、物品是否可获得）

### 3. 错误处理原则

**静默失败**: 单个字段错误不影响其他字段和基本对话功能

```typescript
function handleField(fieldName: string, value: any) {
    try {
        // 验证
        if (!validateField(fieldName, value)) {
            return; // 静默跳过无效数据
        }
        
        // 执行
        executeFieldAction(fieldName, value);
        
    } catch (error) {
        // 记录错误但不抛出
        console.error(`Error handling ${fieldName}:`, error);
        // 游戏继续运行
    }
}
```

**错误处理层级**:
- **验证失败**: 记录警告，跳过该字段
- **执行异常**: 记录错误，不影响其他字段
- **致命错误**: 仅在 JSON 解析失败时才影响整体

### 4. 状态管理模式

**不可变更新**:
```typescript
// ❌ 错误：直接修改
state.value = newValue;

// ✅ 正确：创建新对象
setState({ ...state, value: newValue });
```

**单一数据源**:
```typescript
// 每个状态只有一个权威来源
const [gameState, setGameState] = useState<GameState>({
    characterEmotion: 'normal',
    inventory: [],
    characterLocation: 'scen_1',
    affinity: 50
});
```

**可预测的状态变化**:
```typescript
// 状态变化应该是纯函数
function updateState(current: State, action: Action): State {
    // 根据 action 返回新状态
    // 不产生副作用
    return newState;
}
```

### 5. UI 反馈标准

**反馈类型映射**:

| 变化类型 | 反馈形式 | 持续时间 | 优先级 |
|---------|---------|---------|--------|
| 视觉变化 | 动画过渡 | 0.3-1s | 高 |
| 状态更新 | Toast 通知 | 2-4s | 中 |
| 数值变化 | 数字指示器 | 2.5s | 中 |
| 位置变化 | 移动通知 | 4s | 低 |

**反馈实现模板**:
```typescript
function showFeedback(type: string, data: any) {
    const feedback = createFeedback(type, data);
    
    // 显示反馈
    displayFeedback(feedback);
    
    // 自动清理
    setTimeout(() => {
        removeFeedback(feedback);
    }, feedback.duration);
}
```

---

## 🔄 多字段协调

### 执行顺序策略

当 AI 响应包含多个字段时，按优先级顺序执行：

```typescript
const FIELD_PRIORITY = {
    // 视觉优先（立即可见）
    'emotion': 1,
    'clothing': 1,
    
    // 状态更新（需要处理）
    'gain_items': 2,
    'affinity_change': 2,
    
    // 位置变化（可延迟）
    'move_to': 3
};

function processFields(response: AIResponse) {
    const fields = Object.keys(response)
        .filter(key => key !== 'text')
        .sort((a, b) => (FIELD_PRIORITY[a] || 99) - (FIELD_PRIORITY[b] || 99));
    
    fields.forEach(field => {
        handleField(field, response[field]);
    });
}
```

**优先级原则**:
1. **视觉优先**: 玩家先看到角色表情变化
2. **状态次之**: 然后处理游戏状态更新
3. **位置最后**: 最后处理位置变化

### 字段依赖管理

```typescript
const FIELD_DEPENDENCIES = {
    'affinity_change': ['emotion'],  // 好感度依赖表情显示
    'move_to': ['emotion']           // 移动依赖表情显示
};

function canExecuteField(field: string, executedFields: Set<string>): boolean {
    const deps = FIELD_DEPENDENCIES[field] || [];
    return deps.every(dep => executedFields.has(dep));
}
```

### 冲突解决策略

**UI 冲突**（通知过多）:
```typescript
const MAX_CONCURRENT_NOTIFICATIONS = 3;

function showNotification(notification: Notification) {
    if (activeNotifications.length >= MAX_CONCURRENT_NOTIFICATIONS) {
        // 策略1：队列等待
        notificationQueue.push(notification);
        // 策略2：合并显示
        // mergeNotifications(notification);
    } else {
        displayNotification(notification);
    }
}
```

**状态冲突**（后者覆盖前者）:
```typescript
// 同一响应中的多个状态变化，后者生效
if (response.emotion) {
    currentEmotion = response.emotion; // 最终状态
}
```

**逻辑冲突**（记录并使用默认值）:
```typescript
if (hasLogicConflict(field, value)) {
    console.warn(`Logic conflict for ${field}, using default`);
    value = getDefaultValue(field);
}
```

---

## 📊 性能指标

### 响应时间基准

| 阶段 | 目标 | 最大 | 说明 |
|------|------|------|------|
| JSON 解析 | < 10ms | < 50ms | 解析 AI 响应 |
| 字段验证 | < 5ms/字段 | < 20ms/字段 | 验证单个字段 |
| 状态更新 | < 20ms | < 100ms | 更新游戏状态 |
| UI 反馈 | < 50ms | < 200ms | 显示用户反馈 |
| **端到端** | **< 100ms** | **< 500ms** | **从解析到反馈** |

**优化建议**:
- 使用 `JSON.parse()` 而非正则表达式解析
- 验证逻辑使用查找表而非遍历
- 状态更新批量处理，减少重渲染
- UI 反馈使用 CSS 动画而非 JS 动画

### 资源限制

```typescript
const RESOURCE_LIMITS = {
    maxStateSize: 1 * 1024 * 1024,        // 1MB 状态大小
    maxPersistentData: 10 * 1024 * 1024,  // 10MB 持久化数据
    maxConcurrentNotifications: 3,         // 3 个并发通知
    maxHistoryRecords: 100                 // 100 条历史记录
};
```

---

## 🧪 测试策略

### 测试金字塔

```
        ┌─────────┐
        │ E2E 测试 │  10%  - 完整流程测试
        └─────────┘
      ┌─────────────┐
      │  集成测试   │  30%  - 多字段协调测试
      └─────────────┘
    ┌─────────────────┐
    │   单元测试      │  60%  - 单个处理器测试
    └─────────────────┘
```

### 必需测试场景

**1. 单字段测试**
```typescript
test('valid field is processed correctly', () => {
    const response = { text: 'Hello', emotion: 'happy' };
    handleAIResponse(response);
    expect(currentEmotion).toBe('happy');
});

test('invalid field is rejected silently', () => {
    const response = { text: 'Hello', emotion: 'invalid' };
    handleAIResponse(response);
    expect(currentEmotion).toBe('normal'); // 保持默认值
});
```

**2. 多字段协调测试**
```typescript
test('multiple fields execute in correct order', () => {
    const response = {
        text: 'Hello',
        move_to: 'scen_7',
        emotion: 'happy',
        affinity_change: 5
    };
    const executionOrder = [];
    handleAIResponse(response, (field) => executionOrder.push(field));
    expect(executionOrder).toEqual(['emotion', 'affinity_change', 'move_to']);
});
```

**3. 错误隔离测试**
```typescript
test('one field error does not affect others', () => {
    const response = {
        text: 'Hello',
        emotion: 'invalid',  // 这个会失败
        affinity_change: 5   // 这个应该成功
    };
    handleAIResponse(response);
    expect(affinity).toBe(55); // 好感度正常更新
});
```

**4. 边界条件测试**
```typescript
test('handles missing optional fields', () => {
    const response = { text: 'Hello' }; // 只有必需字段
    expect(() => handleAIResponse(response)).not.toThrow();
});

test('handles empty arrays', () => {
    const response = { text: 'Hello', gain_items: [] };
    expect(() => handleAIResponse(response)).not.toThrow();
});
```

---

## 🚀 扩展新功能

### 添加新字段的完整流程

#### 1. 定义 JSON 字段

```typescript
// 在 AIResponse 接口中添加新字段
interface AIResponse {
    text: string;
    // ... 现有字段
    new_field?: NewFieldType;  // 新增字段
}
```

#### 2. 编写 AI 提示词

```markdown
## [新字段名] 指令

### 功能说明
[描述该字段的作用]

### 输出格式
"new_field": value_type

### 触发条件
[何时输出此字段]

### 取值范围
[列出有效值]

### 使用示例
{
    "text": "对话文本",
    "new_field": "示例值"
}
```

#### 3. 实现字段处理器

```typescript
function handleNewField(value: NewFieldType) {
    // 1. 验证
    if (!validateNewField(value)) {
        console.warn('Invalid new_field:', value);
        return;
    }
    
    // 2. 执行逻辑
    executeNewFieldAction(value);
    
    // 3. 更新状态
    updateNewFieldState(value);
    
    // 4. 显示反馈
    showNewFieldFeedback(value);
    
    // 5. 持久化（可选）
    if (shouldPersist) {
        persistNewFieldState(value);
    }
}
```

#### 4. 注册处理器

```typescript
// 添加到处理器映射表
const fieldHandlers = {
    // ... 现有处理器
    new_field: handleNewField
};
```

#### 5. 添加测试

```typescript
test('new_field is processed correctly', () => {
    const response = { text: 'Hello', new_field: 'test_value' };
    handleAIResponse(response);
    expect(newFieldState).toBe('test_value');
});
```

#### 6. 更新文档

- 在系统提示词文档中添加字段说明
- 创建或更新功能详细文档
- 在本文档的实现示例表格中添加条目

### 修改现有字段的注意事项

**向后兼容原则**:
```typescript
// ❌ 错误：破坏性变更
function handleField(value: string) {  // 改变了类型
    // ...
}

// ✅ 正确：兼容旧格式
function handleField(value: string | NewType) {
    if (typeof value === 'string') {
        // 处理旧格式
    } else {
        // 处理新格式
    }
}
```

**渐进增强**:
- 新功能作为可选字段添加
- 旧代码在新字段缺失时仍能正常工作
- 使用特性检测而非版本检测

**版本管理**:
```typescript
const FIELD_VERSION = {
    'emotion': '1.0.0',
    'clothing': '1.1.0',  // 添加了新的衣着状态
    'new_field': '2.0.0'  // 新增字段
};
```

---

## 📖 最佳实践总结

### DO（推荐做法）

✅ **明确的提示词**: 在系统提示词中清晰定义每个字段的用途和格式  
✅ **严格的验证**: 对所有字段进行三层验证（类型、值域、业务）  
✅ **静默失败**: 单个字段错误不影响其他功能  
✅ **即时反馈**: 所有状态变化都提供用户反馈  
✅ **可扩展设计**: 使用处理器映射表，便于添加新字段  
✅ **完整测试**: 覆盖正常、边界、错误、集成等场景  

### DON'T（避免做法）

❌ **隐式依赖**: 不要让字段处理器之间有隐式依赖  
❌ **破坏性变更**: 不要改变现有字段的数据类型或含义  
❌ **抛出异常**: 不要让字段处理错误中断整个流程  
❌ **缺少验证**: 不要直接使用 AI 输出而不验证  
❌ **过度耦合**: 不要让处理器直接调用其他处理器  
❌ **忽略性能**: 不要在处理器中执行耗时操作  

---

## 🔗 相关资源

### 核心代码文件

- `data/systemPrompts.ts` - AI 提示词配置
- `services/llmService.ts` - LLM 服务和 JSON 解析
- `hooks/useDialogueSystem.ts` - 响应处理和字段分发
- `components/GameScene.tsx` - 系统集成和状态管理

### 功能实现文档

- [角色立绘变化系统](./CHARACTER_SPRITE_SYSTEM.md)
- [物品获取系统](./CHARACTER_ITEM_GAIN_SYSTEM.md)
- [角色移动系统](./CHARACTER_MOVEMENT_SYSTEM.md)
- [好感度变化系统](./CHARACTER_AFFINITY_CHANGE_SYSTEM.md)

### 相关技术文档

- [数据流最佳实践](../DATA_FLOW_BEST_PRACTICES.md)
- [存档系统](../SAVE_SYSTEM_AND_DATABASE.md)

---

## 📝 变更日志

### v2.0.0 (2026-02-22)
- 📚 重构为通用技术标准文档
- ✨ 添加 AI 结构化输出的三种实现方法
- ✨ 添加字段处理器注册表模式
- ✨ 添加完整的数据流说明
- 📖 提供扩展新功能的完整流程
- 🎯 聚焦于架构和标准，而非具体实现

### v1.0.0 (2026-02-21)
- 🎉 初始版本
- 📝 包含四大系统的详细实现

---

**文档类型**: 技术标准  
**适用范围**: 所有 AI 驱动的游戏功能  
**最后更新**: 2026-02-22  
**文档版本**: 2.0.0  
**维护者**: Nyaa, Claude  
**标签**: `#AI驱动` `#技术标准` `#架构设计` `#结构化输出`
</contents>