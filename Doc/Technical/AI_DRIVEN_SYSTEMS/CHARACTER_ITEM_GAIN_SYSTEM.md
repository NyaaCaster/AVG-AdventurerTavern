# 物品获取系统技术文档

## 📋 系统概述

物品获取系统允许 AI 根据对话内容判断玩家是否应该获得物品，并通过 JSON 输出指令让游戏自动发放道具，实现无缝的剧情道具交互。

### 核心功能

- **智能判断**: AI 自主判断何时应该发放物品
- **自动发放**: 系统自动更新玩家库存
- **视觉反馈**: 通过 Toast 通知告知玩家获得的物品
- **批量支持**: 支持一次发放多个不同物品

---

## 🎯 设计目标

1. **剧情融合**: 物品获取自然融入对话剧情
2. **即时反馈**: 玩家立即看到获得的物品
3. **灵活配置**: 支持各种物品类型和数量
4. **错误容错**: 处理无效物品 ID，避免系统崩溃

---

## 📊 数据结构

### AI 响应格式

```typescript
interface AIResponse {
    text: string;
    emotion?: string;
    gain_items?: ItemGainInstruction[];  // 物品获取指令
    // ... 其他字段
}

interface ItemGainInstruction {
    id: string;      // 物品 ID
    count: number;   // 数量
}
```

**示例**:
```json
{
    "text": "这是我亲手做的护身符，送给你吧。",
    "emotion": "happy",
    "gain_items": [
        {"id": "acs_charm_001", "count": 1}
    ],
    "affinity_change": 3
}
```

### 物品 ID 规范

| 前缀 | 类别 | 说明 | 示例 |
|------|------|------|------|
| `res_` | 资源 | 基础材料、原料 | `res_wood`, `res_iron`, `res_stone` |
| `itm_` | 道具 | 消耗品、任务道具 | `itm_potion`, `itm_key`, `itm_scroll` |
| `wpn_` | 武器 | 各类武器 | `wpn_sword`, `wpn_bow`, `wpn_dagger` |
| `arm_` | 防具 | 护甲、盾牌 | `arm_shield`, `arm_helmet`, `arm_armor` |
| `acs_` | 饰品 | 首饰、配饰 | `acs_ring`, `acs_necklace`, `acs_charm` |
| `food_` | 食物 | 食品、饮料 | `food_bread`, `food_meat`, `food_wine` |

**命名规范**:
- 使用小写字母和下划线
- 格式: `{前缀}_{物品名}_{可选编号}`
- 示例: `acs_necklace_001`, `wpn_sword_rare`

### 物品数据定义

```typescript
interface Item {
    id: string;           // 物品 ID
    name: string;         // 显示名称
    description: string;  // 描述
    type: ItemType;       // 类型
    icon?: string;        // 图标路径
    rarity?: string;      // 稀有度
    stackable?: boolean;  // 是否可堆叠
    maxStack?: number;    // 最大堆叠数
}
```

---

## 🔧 实现细节

### 1. AI 提示词配置

**文件**: `data/systemPrompts.ts`

```typescript
const PROMPT_ITEMS = `
## 道具获取指令 (Items)
- 如果剧情逻辑判断玩家应该获得某个道具，必须在 JSON 的 'gain_items' 字段中返回。
- 格式为数组: [{"id": "item-id", "count": 1}]
- 可以同时发放多个不同的道具

### 触发场景示例：
1. 角色赠送礼物
   - 玩家夸奖角色的物品 → 角色决定赠送
   - 完成角色的请求 → 角色给予奖励
   
2. 完成任务奖励
   - 玩家完成任务 → 发放任务奖励
   - 达成特定条件 → 获得成就奖励
   
3. 探索发现
   - 玩家询问箱子/宝箱内容 → 发现物品
   - 搜索特定地点 → 找到隐藏物品
   
4. 购买交易
   - 玩家购买物品 → 获得商品
   - 以物易物 → 交换物品

### 物品 ID 参考：
- 资源类: res_wood, res_iron, res_stone
- 道具类: itm_potion, itm_key, itm_scroll
- 武器类: wpn_sword, wpn_bow, wpn_dagger
- 防具类: arm_shield, arm_helmet
- 饰品类: acs_ring, acs_necklace, acs_charm
- 食物类: food_bread, food_meat, food_wine

### 注意事项：
- 只在角色真正决定给予物品时才输出此指令
- 如果只是提到物品但未实际给予，不要输出
- 数量应该合理，符合剧情逻辑
`;
```

**关键点**:
- 明确列出触发场景
- 提供物品 ID 参考列表
- 强调只在实际给予时输出
- 说明可以同时发放多个物品

### 2. 物品发放逻辑

**文件**: `hooks/useDialogueSystem.ts`

```typescript
const handleSendMessage = async (message: string) => {
    const response = await llmService.sendMessage(message);
    
    // 检查是否有物品获取指令
    if (response.items && response.items.length > 0) {
        // 调用物品发放回调
        onItemsGained(response.items);
    }
    
    // ... 处理其他响应字段
};
```

**文件**: `components/GameScene.tsx`

```typescript
const handleItemsGained = (items: { id: string; count: number }[]) => {
    // 1. 验证并过滤有效物品
    const validItems = items.filter(item => {
        if (!ITEMS[item.id]) {
            console.warn(`Invalid item ID: ${item.id}`);
            return false;
        }
        return true;
    });
    
    if (validItems.length === 0) {
        return; // 没有有效物品，直接返回
    }
    
    // 2. 更新库存
    core.handleAddItems(validItems);
    
    // 3. 创建通知
    const newNotifications = validItems.map(item => ({
        id: `${Date.now()}_${Math.random()}`,
        itemId: item.id,
        count: item.count,
        timestamp: Date.now()
    }));
    
    // 4. 显示通知
    setItemNotifications(prev => [...prev, ...newNotifications]);
};
```

**处理流程**:
1. 验证物品 ID 是否有效
2. 过滤掉无效物品
3. 更新玩家库存
4. 创建并显示通知

### 3. 库存更新

**文件**: `hooks/useCoreGameLogic.ts`

```typescript
const handleAddItems = (items: { id: string; count: number }[]) => {
    setInventory(prev => {
        const newInventory = { ...prev };
        
        items.forEach(item => {
            const itemData = ITEMS[item.id];
            if (!itemData) return;
            
            // 检查是否可堆叠
            if (itemData.stackable !== false) {
                // 可堆叠物品：累加数量
                newInventory[item.id] = (newInventory[item.id] || 0) + item.count;
                
                // 检查最大堆叠数
                if (itemData.maxStack) {
                    newInventory[item.id] = Math.min(
                        newInventory[item.id], 
                        itemData.maxStack
                    );
                }
            } else {
                // 不可堆叠物品：添加新条目
                // 实现取决于具体的库存系统设计
                newInventory[item.id] = (newInventory[item.id] || 0) + item.count;
            }
        });
        
        return newInventory;
    });
    
    // 触发自动存档
    saveGameState();
};
```

### 4. 通知组件

**文件**: `components/ItemToast.tsx`

```typescript
interface ItemToastProps {
    itemId: string;
    count: number;
    onComplete: () => void;
}

const ItemToast: React.FC<ItemToastProps> = ({ itemId, count, onComplete }) => {
    const [isVisible, setIsVisible] = useState(false);
    const item = ITEMS[itemId];
    
    useEffect(() => {
        // 淡入动画
        setTimeout(() => setIsVisible(true), 10);
        
        // 4秒后开始淡出
        const timer = setTimeout(() => {
            setIsVisible(false);
            // 淡出动画完成后调用回调
            setTimeout(onComplete, 500);
        }, 4000);
        
        return () => clearTimeout(timer);
    }, [onComplete]);
    
    if (!item) return null;
    
    return (
        <div className={`item-toast ${isVisible ? 'visible' : ''}`}>
            <div className="toast-icon">
                {item.icon ? (
                    <img src={item.icon} alt={item.name} />
                ) : (
                    <i className="fa-solid fa-gift"></i>
                )}
            </div>
            <div className="toast-content">
                <div className="toast-title">获得道具</div>
                <div className="toast-item">
                    {item.name} ×{count}
                </div>
            </div>
        </div>
    );
};
```

**样式建议**:
```css
.item-toast {
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: rgba(0, 0, 0, 0.8);
    padding: 15px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.5s ease;
}

.item-toast.visible {
    opacity: 1;
    transform: translateY(0);
}

.toast-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.toast-icon img {
    max-width: 100%;
    max-height: 100%;
}

.toast-title {
    color: #888;
    font-size: 12px;
}

.toast-item {
    color: #fff;
    font-size: 16px;
    font-weight: bold;
}
```

---

## 💡 使用示例

### 场景 1: 角色赠送礼物

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

**系统执行**:
1. ✅ 验证物品 ID: `acs_necklace_001` 有效
2. ✅ 更新库存: 项链 +1
3. ✅ 显示 Toast: "获得道具 精致项链 ×1"
4. ✅ 更新好感度: +5
5. ✅ 4秒后 Toast 自动消失

### 场景 2: 任务奖励（多个物品）

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

**系统执行**:
1. ✅ 验证两个物品 ID 都有效
2. ✅ 更新库存: 金币袋 +1, 饼干 +3
3. ✅ 显示两个 Toast 通知（依次显示）
4. ✅ 更新好感度: +3

### 场景 3: 探索发现

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

**系统执行**:
1. ✅ 验证物品 ID 有效
2. ✅ 更新库存: 稀有短剑 +1
3. ✅ 显示 Toast: "获得道具 稀有短剑 ×1"

### 场景 4: 无效物品 ID 处理

**AI 响应**:
```json
{
    "text": "这是给你的礼物。",
    "emotion": "happy",
    "gain_items": [
        {"id": "invalid_item_123", "count": 1}
    ]
}
```

**系统执行**:
1. ❌ 验证物品 ID: 无效
2. ⚠️ 控制台警告: "Invalid item ID: invalid_item_123"
3. ✅ 过滤掉无效物品
4. ✅ 对话正常继续（不影响游戏）

### 场景 5: 只提到但未给予

**玩家**: "你的剑看起来很厉害"

**AI 响应**:
```json
{
    "text": "谢谢，这是我最珍贵的武器，不能送给你哦。",
    "emotion": "normal"
}
```

**注意**: 没有 `gain_items` 字段，因为角色只是提到但未实际给予。

---

## 🔍 错误处理

### 1. 物品 ID 验证

```typescript
function validateItemId(itemId: string): boolean {
    return ITEMS.hasOwnProperty(itemId);
}

// 使用示例
if (response.gain_items) {
    const validItems = response.gain_items.filter(item => {
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

### 2. 数量验证

```typescript
function validateItemCount(count: number): number {
    // 确保数量为正整数
    const validCount = Math.max(1, Math.floor(count));
    
    // 限制最大数量（防止异常）
    return Math.min(validCount, 9999);
}

// 使用示例
const validItems = response.gain_items.map(item => ({
    id: item.id,
    count: validateItemCount(item.count)
}));
```

### 3. 库存溢出处理

```typescript
const handleAddItems = (items: { id: string; count: number }[]) => {
    setInventory(prev => {
        const newInventory = { ...prev };
        
        items.forEach(item => {
            const itemData = ITEMS[item.id];
            if (!itemData) return;
            
            const currentCount = newInventory[item.id] || 0;
            const newCount = currentCount + item.count;
            
            // 检查库存上限
            if (itemData.maxStack && newCount > itemData.maxStack) {
                console.warn(`Item ${item.id} exceeds max stack: ${itemData.maxStack}`);
                newInventory[item.id] = itemData.maxStack;
            } else {
                newInventory[item.id] = newCount;
            }
        });
        
        return newInventory;
    });
};
```

---

## 🎨 UI/UX 优化

### 1. 批量通知优化

当一次获得多个物品时，避免屏幕拥挤：

```typescript
const handleItemsGained = (items: { id: string; count: number }[]) => {
    // ... 验证和更新库存
    
    if (validItems.length > 3) {
        // 超过3个物品，显示合并通知
        showBatchNotification(validItems);
    } else {
        // 3个或更少，依次显示
        validItems.forEach((item, index) => {
            setTimeout(() => {
                showSingleNotification(item);
            }, index * 500); // 每个通知间隔0.5秒
        });
    }
};
```

### 2. 稀有度视觉效果

根据物品稀有度显示不同颜色：

```typescript
const getRarityColor = (rarity?: string): string => {
    switch (rarity) {
        case 'common': return '#ffffff';
        case 'uncommon': return '#1eff00';
        case 'rare': return '#0070dd';
        case 'epic': return '#a335ee';
        case 'legendary': return '#ff8000';
        default: return '#ffffff';
    }
};

// 在 Toast 组件中使用
<div 
    className="toast-item" 
    style={{ color: getRarityColor(item.rarity) }}
>
    {item.name} ×{count}
</div>
```

### 3. 音效反馈

```typescript
const playItemGainSound = (rarity?: string) => {
    const soundMap = {
        'common': 'sounds/item_common.mp3',
        'rare': 'sounds/item_rare.mp3',
        'legendary': 'sounds/item_legendary.mp3'
    };
    
    const soundFile = soundMap[rarity || 'common'] || soundMap.common;
    const audio = new Audio(soundFile);
    audio.volume = 0.5;
    audio.play();
};
```

---

## 🧪 测试用例

### 测试清单

- [ ] 单个物品发放正常
- [ ] 多个物品同时发放正常
- [ ] 无效物品 ID 被正确过滤
- [ ] 物品数量验证正确
- [ ] 库存更新正确
- [ ] Toast 通知正常显示和消失
- [ ] 可堆叠物品正确累加
- [ ] 不可堆叠物品正确处理
- [ ] 库存上限检查生效
- [ ] 自动存档触发

### 测试脚本

```typescript
// 测试物品发放
const testItemGain = () => {
    const testCases = [
        // 测试1: 单个物品
        {
            items: [{ id: 'itm_potion', count: 1 }],
            expected: { 'itm_potion': 1 }
        },
        // 测试2: 多个物品
        {
            items: [
                { id: 'itm_potion', count: 2 },
                { id: 'food_bread', count: 3 }
            ],
            expected: { 'itm_potion': 2, 'food_bread': 3 }
        },
        // 测试3: 无效物品
        {
            items: [
                { id: 'invalid_item', count: 1 },
                { id: 'itm_potion', count: 1 }
            ],
            expected: { 'itm_potion': 1 }
        }
    ];
    
    testCases.forEach((testCase, index) => {
        console.log(`Running test case ${index + 1}...`);
        handleItemsGained(testCase.items);
        // 验证库存是否符合预期
    });
};
```

---

## 🚀 性能优化

### 1. 通知队列管理

```typescript
const [notificationQueue, setNotificationQueue] = useState<ItemNotification[]>([]);
const [activeNotifications, setActiveNotifications] = useState<ItemNotification[]>([]);

const MAX_ACTIVE_NOTIFICATIONS = 3;

useEffect(() => {
    // 如果有空位且队列中有通知，显示下一个
    if (activeNotifications.length < MAX_ACTIVE_NOTIFICATIONS && notificationQueue.length > 0) {
        const [next, ...rest] = notificationQueue;
        setNotificationQueue(rest);
        setActiveNotifications(prev => [...prev, next]);
    }
}, [notificationQueue, activeNotifications]);
```

### 2. 防抖处理

```typescript
import { debounce } from 'lodash';

const debouncedItemGain = debounce((items: ItemGainInstruction[]) => {
    handleItemsGained(items);
}, 300);
```

---

## 📚 相关文档

- [AI 驱动系统技术标准](./AI_DRIVEN_SYSTEMS.md) - 总体技术标准
- [角色立绘变化系统](./CHARACTER_SPRITE_SYSTEM.md) - 立绘切换系统
- [角色移动系统](./CHARACTER_MOVEMENT_SYSTEM.md) - 角色位置控制
- [好感度变化系统](./CHARACTER_AFFINITY_CHANGE_SYSTEM.md) - 好感度管理

---

## 🔗 相关文件

- `data/systemPrompts.ts` - AI 提示词配置
- `data/items.ts` - 物品数据定义
- `hooks/useDialogueSystem.ts` - 对话系统核心逻辑
- `hooks/useCoreGameLogic.ts` - 库存管理逻辑
- `components/GameScene.tsx` - 游戏场景和系统集成
- `components/ItemToast.tsx` - 物品通知组件

---

**最后更新**: 2026-02-22  
**文档版本**: 1.0.0  
**设计者**: Nyaa  
**开发者**: Gemini  
**维护者**: Claude  
**标签**: `#物品系统` `#AI驱动` `#库存管理` `#通知系统`