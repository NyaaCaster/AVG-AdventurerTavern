# 烹饪系统技术文档

## 📋 系统概述

烹饪系统是游戏中的核心玩法之一，允许玩家使用收集的食材创建自定义料理。系统结合了 LLM AI 生成和预设模板，为每道料理生成独特的名称和描述。

## 🎯 核心功能

1. **料理创建**: 选择主素材和辅助素材，基于模板创建料理
2. **AI 命名**: 使用 LLM 生成符合食材特性的料理名称和描述
3. **料理制作**: 消耗食材批量制作料理
4. **库存管理**: 管理料理库存和食材消耗
5. **料理编辑**: 重命名和删除自定义料理

---

## 🏗️ 系统架构

```
玩家选择食材
    ↓
匹配料理模板
    ↓
LLM 生成名称和描述
    ↓
创建用户菜谱
    ↓
消耗食材制作
    ↓
添加到料理库存
```

---

## 📊 数据结构

### 1. 料理模板 (`FoodRecipe`)

```typescript
interface FoodRecipe {
    id: string;              // 模板唯一 ID
    name: string;            // 默认名称
    'main-res': string;      // 主素材标签
    'other-res': string[];   // 辅助素材标签列表
    img: string;             // 图片文件名
    description: string;     // 默认描述
}
```

**示例**:
```json
{
    "id": "food_001",
    "name": "秘制烤肉排",
    "main-res": "meat",
    "other-res": [],
    "img": "001_meat.png",
    "description": "选用上等兽肉精心烤制..."
}
```

### 2. 用户菜谱 (`UserRecipe`)

```typescript
interface UserRecipe {
    id: string;              // 菜谱唯一 ID (timestamp-based)
    templateId: string;      // 关联的模板 ID
    name: string;            // 料理名称 (LLM 生成或默认)
    description: string;     // 料理描述 (LLM 生成或默认)
    imagePath: string;       // 图片路径
    star: number;            // 料理星级 (素材平均)
    price: number;           // 估算售价
    mainResId: string;       // 主素材 ID
    otherResIds: string[];   // 辅助素材 ID 列表
    createdAt: number;       // 创建时间戳
}
```

**示例**:
```json
{
    "id": "recipe-1640000000000",
    "templateId": "food_001",
    "name": "火焰史莱姆烤肉",
    "description": "使用火焰史莱姆的核心烤制...",
    "imagePath": "img/food/001_meat.png",
    "star": 3,
    "price": 150,
    "mainResId": "res_001",
    "otherResIds": [],
    "createdAt": 1640000000000
}
```

### 3. 料理库存 (`foodStock`)

```typescript
type FoodStock = Record<string, number>;
// 菜谱 ID → 数量的映射
```

**示例**:
```json
{
    "recipe-1640000000000": 5,
    "recipe-1640000001000": 3
}
```

---

## 🔧 核心流程

### 1. 料理创建流程

```typescript
// 1. 玩家选择食材
const mainRes = selectedMainIngredient;  // 主素材
const otherRes = selectedOtherIngredients; // 辅助素材列表

// 2. 匹配料理模板
const template = findMatchingTemplate(mainRes.tag, otherRes.map(r => r.tag));

// 3. 计算料理属性
const avgStar = calculateAverageStar([mainRes, ...otherRes]);
const price = calculatePrice(avgStar);

// 4. 调用 LLM 生成名称和描述
const { name, description } = await llmService.generateFoodLore(
    [mainRes, ...otherRes],
    template.name,
    apiConfig
);

// 5. 创建用户菜谱
const newRecipe: UserRecipe = {
    id: `recipe-${Date.now()}`,
    templateId: template.id,
    name: name || template.name,
    description: description || template.description,
    imagePath: `img/food/${template.img}`,
    star: avgStar,
    price: price,
    mainResId: mainRes.id,
    otherResIds: otherRes.map(r => r.id),
    createdAt: Date.now()
};

// 6. 保存菜谱并添加初始库存
onAddRecipe(newRecipe);
```

### 2. 料理制作流程

```typescript
// 1. 检查食材是否足够
const hasEnoughIngredients = checkIngredients(recipe, count);

if (!hasEnoughIngredients) {
    alert('食材不足');
    return;
}

// 2. 消耗食材
const ingredientsToConsume = [
    { id: recipe.mainResId, count: count },
    ...recipe.otherResIds.map(id => ({ id, count }))
];

onConsumeIngredients(ingredientsToConsume);

// 3. 增加料理库存
onCraftRecipe(recipe.id, count, ingredientsToConsume);
```

### 3. LLM 生成流程

```typescript
// services/llmService.ts
async generateFoodLore(
    ingredients: { name: string; description: string }[],
    cookingMethod: string,
    config: ApiConfig
): Promise<{ name: string; description: string }> {
    // 1. 构建提示词
    const prompt = `
你是一位异世界酒馆的创意主厨。
请根据以下素材列表和烹饪方法，设计一道充满幻想风格的料理。

烹饪方法: ${cookingMethod}
素材列表:
${ingredients.map(i => `- ${i.name} (${i.description})`).join('\n')}

请严格以 JSON 格式输出：
{
  "name": "料理名称",
  "description": "料理描述"
}
`;

    // 2. 调用 LLM API
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            model: config.model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 1.0
        })
    });

    // 3. 解析响应
    const data = await response.json();
    const content = data.choices[0].message.content;
    const json = JSON.parse(content);

    return {
        name: json.name || '未知料理',
        description: json.description || '看起来可以吃。'
    };
}
```

---

## 📚 料理模板数据

### 模板统计

- **总模板数**: 164 个
- **主素材类型**: 15 种
- **图片资源**: 164 张

### 主素材分类

| 标签 | 中文名 | 模板数量 | 示例 |
|------|--------|---------|------|
| `meat` | 兽肉 | 27 | 烤肉排、炖肉 |
| `poultry` | 禽肉 | 5 | 烤禽、白切禽 |
| `fish` | 鱼类 | 15 | 烤鱼、鱼生 |
| `shrimp` | 虾类 | 4 | 白灼虾、虾球 |
| `mussel` | 贝类 | 4 | 煮贝、烤贝 |
| `potato` | 土豆 | 14 | 烤土豆、薯条 |
| `carrot` | 胡萝卜 | 3 | 炒菌、素菜 |
| `bean` | 豆类 | 2 | 煮豆、炖豆 |
| `flour` | 面粉 | 35 | 面包、蛋糕 |
| `bread` | 面包 | 14 | 三明治、吐司 |
| `rice` | 米饭 | 13 | 盖饭、饭团 |
| `vegetable` | 蔬菜 | 5 | 沙拉、炒菜 |
| `jelly` | 果冻 | 7 | 果冻、布丁 |
| `fruit` | 水果 | 3 | 果盘、水果捞 |
| `egg` | 鸡蛋 | 8 | 煮蛋、炒蛋 |
| `mushroom` | 蘑菇 | 3 | 烤菌、煎菌 |
| `melons` | 蜜瓜 | 2 | 蜜瓜片、奶昔 |

### 辅助素材标签

| 标签 | 中文名 | 说明 |
|------|--------|------|
| `meat` | 兽肉 | 可作为辅助素材增加肉香 |
| `poultry` | 禽肉 | 禽类肉质 |
| `fish` | 鱼类 | 海鲜类 |
| `shrimp` | 虾类 | 鲜虾 |
| `mussel` | 贝类 | 贝壳类海鲜 |
| `carrot` | 胡萝卜 | 根茎类蔬菜 |
| `potato` | 土豆 | 主食类根茎 |
| `vegetable` | 蔬菜 | 绿叶蔬菜 |
| `tomatoes` | 番茄 | 酸甜调味 |
| `melons` | 蜜瓜 | 甜味水果 |
| `fruit` | 水果 | 各类水果 |
| `mushroom` | 蘑菇 | 菌类 |
| `bean` | 豆类 | 豆子 |
| `flour` | 面粉 | 面食基础 |
| `bread` | 面包 | 烘焙面包 |
| `rice` | 米饭 | 主食米类 |
| `egg` | 鸡蛋 | 蛋类 |
| `milk` | 牛奶 | 乳制品液体 |
| `dairy` | 乳酪 | 芝士、黄油等 |
| `jelly` | 果冻 | 凝胶类 |
| `spice` | 香料 | 调味料 |

### 常见料理组合

#### 肉类料理
- `meat` + 无 → 烤肉排、炖肉
- `meat` + `potato` → 土豆烧肉
- `meat` + `carrot` + `potato` → 经典炖菜
- `meat` + `flour` → 肉馅饼、炸肉排
- `meat` + `egg` → 滑蛋肉片

#### 海鲜料理
- `fish` + 无 → 盐烤海鱼、清蒸鱼
- `fish` + `fruit` → 柠香烤鱼
- `shrimp` + `fruit` → 凤梨虾球
- `shrimp` + `fish` + `mussel` → 海鲜总汇

#### 主食料理
- `flour` + `egg` + `milk` + `dairy` → 松饼、泡芙
- `flour` + `meat` + `dairy` → 肉酱披萨
- `rice` + `meat` → 肉燥饭
- `rice` + `egg` + `carrot` + `tomatoes` → 蛋包饭
- `bread` + `vegetable` + `tomatoes` + `meat` + `dairy` → 全家福三明治

#### 甜点料理
- `flour` + `egg` + `milk` + `dairy` + `fruit` → 豪华水果蛋糕
- `jelly` + `fruit` → 水果果冻
- `egg` + `dairy` + `jelly` → 焦糖布丁

---

## 🎨 UI 组件

### CookingModal 组件

**功能**:
- 显示所有可用食材
- 选择主素材和辅助素材
- 预览匹配的料理模板
- 创建新菜谱
- 管理现有菜谱
- 批量制作料理

**状态管理**:
```typescript
const [selectedMain, setSelectedMain] = useState<ItemData | null>(null);
const [selectedOthers, setSelectedOthers] = useState<ItemData[]>([]);
const [matchedTemplate, setMatchedTemplate] = useState<FoodRecipe | null>(null);
const [isGenerating, setIsGenerating] = useState(false);
```

---

## 💾 数据持久化

### 存档内容

烹饪系统数据包含在游戏存档中：

```typescript
interface SaveData {
    // ... 其他数据
    userRecipes?: UserRecipe[];      // 用户创建的菜谱
    foodStock?: Record<string, number>; // 料理库存
}
```

### 存档时机

- 创建新菜谱后自动存档
- 制作料理后自动存档
- 删除菜谱后自动存档
- 游戏定时自动存档

---

## 🔍 算法详解

### 1. 模板匹配算法

```typescript
function findMatchingTemplate(
    mainTag: string,
    otherTags: string[]
): FoodRecipe | null {
    // 1. 排序辅助素材标签
    const sortedOthers = [...otherTags].sort();
    
    // 2. 查找完全匹配的模板
    const exactMatch = FOOD_RECIPES.find(recipe => {
        if (recipe['main-res'] !== mainTag) return false;
        const recipeOthers = [...recipe['other-res']].sort();
        return arraysEqual(sortedOthers, recipeOthers);
    });
    
    if (exactMatch) return exactMatch;
    
    // 3. 查找仅主素材匹配的模板
    const mainOnlyMatch = FOOD_RECIPES.find(recipe => 
        recipe['main-res'] === mainTag && 
        recipe['other-res'].length === 0
    );
    
    return mainOnlyMatch || null;
}
```

### 2. 星级计算

```typescript
function calculateAverageStar(ingredients: ItemData[]): number {
    const stars = ingredients
        .map(item => parseInt(item.star || '1'))
        .filter(s => !isNaN(s));
    
    if (stars.length === 0) return 1;
    
    const avg = stars.reduce((a, b) => a + b, 0) / stars.length;
    return Math.round(avg);
}
```

### 3. 价格计算

```typescript
function calculatePrice(star: number): number {
    const basePrice = 50;
    const multiplier = Math.pow(1.5, star - 1);
    return Math.floor(basePrice * multiplier);
}
```

**价格表**:
| 星级 | 价格 (G) |
|------|----------|
| 1 | 50 |
| 2 | 75 |
| 3 | 113 |
| 4 | 169 |
| 5 | 254 |

---

## 🎯 最佳实践

### 1. LLM 调用优化

```typescript
// 使用 try-catch 处理 LLM 失败
try {
    const result = await llmService.generateFoodLore(...);
    // 使用生成的名称和描述
} catch (error) {
    console.error('LLM generation failed:', error);
    // 回退到模板默认值
    name = template.name;
    description = template.description;
}
```

### 2. 食材验证

```typescript
// 创建前验证食材
if (!selectedMain) {
    alert('请选择主素材');
    return;
}

if (inventory[selectedMain.id] < 1) {
    alert('主素材数量不足');
    return;
}
```

### 3. 用户体验

- 显示 LLM 生成进度
- 提供默认名称作为后备
- 允许用户重命名料理
- 显示食材消耗预览

### 4. 错误处理

```typescript
// 模板未找到
if (!matchedTemplate) {
    alert('未找到匹配的料理模板');
    return;
}

// LLM 生成失败
try {
    const result = await generateFoodLore(...);
} catch (error) {
    console.error('LLM Error:', error);
    // 使用模板默认值
    return {
        name: template.name,
        description: template.description
    };
}

// 食材不足
const missingIngredients = checkMissingIngredients(recipe, count);
if (missingIngredients.length > 0) {
    alert(`缺少食材: ${missingIngredients.join(', ')}`);
    return;
}
```

---

## 🐛 调试与日志

### 控制台日志

```typescript
// 模板匹配
console.log('[Cooking] Matched template:', template.id, template.name);

// LLM 生成
console.log('[Cooking] Generating food lore...');
console.log('[Cooking] Generated:', { name, description });

// 菜谱创建
console.log('[Cooking] Recipe created:', newRecipe.id);

// 料理制作
console.log('[Cooking] Crafted:', recipe.name, 'x', count);
```

### 常见问题

#### 1. 模板匹配失败

**原因**: 食材标签不匹配或组合不存在

**解决**: 
- 检查食材的 `tag` 字段是否正确
- 确认 `FOOD_RECIPES` 中存在对应组合
- 使用仅主素材的模板作为后备

#### 2. LLM 生成超时

**原因**: API 响应慢或网络问题

**解决**:
- 增加超时时间
- 使用模板默认名称和描述
- 提示用户稍后重试

#### 3. 食材消耗错误

**原因**: 库存数据不同步

**解决**:
- 在消耗前重新检查库存
- 使用事务确保原子性
- 记录详细的消耗日志

---

## ⚡ 性能优化

### 1. LLM 调用优化

```typescript
// 缓存生成结果
const generationCache = new Map<string, { name: string; description: string }>();

function getCacheKey(ingredients: ItemData[], template: FoodRecipe): string {
    const ids = [template.id, ...ingredients.map(i => i.id)].sort();
    return ids.join('-');
}

async function generateWithCache(...) {
    const key = getCacheKey(ingredients, template);
    
    if (generationCache.has(key)) {
        return generationCache.get(key);
    }
    
    const result = await llmService.generateFoodLore(...);
    generationCache.set(key, result);
    return result;
}
```

### 2. 模板查找优化

```typescript
// 使用 Map 加速查找
const templateMap = new Map<string, FoodRecipe[]>();

// 初始化时按主素材分组
FOOD_RECIPES.forEach(recipe => {
    const mainRes = recipe['main-res'];
    if (!templateMap.has(mainRes)) {
        templateMap.set(mainRes, []);
    }
    templateMap.get(mainRes).push(recipe);
});

// 查找时只搜索相关分组
function findMatchingTemplate(mainTag: string, otherTags: string[]) {
    const candidates = templateMap.get(mainTag) || [];
    // 在候选列表中查找...
}
```

### 3. 批量操作

```typescript
// 批量制作料理
function batchCraft(recipes: { recipe: UserRecipe; count: number }[]) {
    // 一次性计算所有食材消耗
    const totalConsumption = calculateTotalConsumption(recipes);
    
    // 一次性验证
    if (!hasEnoughIngredients(totalConsumption)) {
        return false;
    }
    
    // 一次性消耗
    consumeIngredients(totalConsumption);
    
    // 批量更新库存
    recipes.forEach(({ recipe, count }) => {
        updateFoodStock(recipe.id, count);
    });
    
    return true;
}
```

---

## 🚀 未来扩展

### 1. 料理品质系统

```typescript
interface UserRecipe {
    // ... 现有字段
    quality: 'normal' | 'fine' | 'excellent' | 'masterpiece';
    qualityBonus: number; // 品质加成百分比
}

// 根据食材星级和随机因素决定品质
function determineQuality(avgStar: number): string {
    const roll = Math.random();
    if (avgStar >= 4 && roll > 0.9) return 'masterpiece';
    if (avgStar >= 3 && roll > 0.7) return 'excellent';
    if (avgStar >= 2 && roll > 0.5) return 'fine';
    return 'normal';
}
```

### 2. 料理效果系统

```typescript
interface FoodEffect {
    type: 'heal' | 'buff' | 'debuff';
    value: number;
    duration?: number; // 持续时间（秒）
}

interface UserRecipe {
    // ... 现有字段
    effects: FoodEffect[];
}

// 示例：恢复生命值的料理
const healingFood: FoodEffect = {
    type: 'heal',
    value: 50 // 恢复 50 HP
};
```

### 3. 料理评分系统

```typescript
interface RecipeRating {
    recipeId: string;
    rating: number; // 1-5 星
    reviews: number; // 评价数量
}

// NPC 或玩家可以对料理评分
function rateRecipe(recipeId: string, rating: number) {
    // 更新评分数据
    // 影响料理价格和声望
}
```

### 4. 特殊料理

```typescript
// 节日限定料理
interface SeasonalRecipe extends UserRecipe {
    season: 'spring' | 'summer' | 'autumn' | 'winter';
    availableFrom: Date;
    availableTo: Date;
}

// 角色专属料理
interface CharacterRecipe extends UserRecipe {
    characterId: string;
    affinityRequired: number; // 需要的好感度
}
```

### 5. 料理书系统

```typescript
interface CookBook {
    id: string;
    name: string;
    recipes: string[]; // 菜谱 ID 列表
    completionRate: number; // 完成度百分比
}

// 收集料理解锁成就
function checkCookBookCompletion(userId: number) {
    const userRecipes = getUserRecipes(userId);
    const totalRecipes = FOOD_RECIPES.length;
    const completion = (userRecipes.length / totalRecipes) * 100;
    
    if (completion >= 100) {
        unlockAchievement('master_chef');
    }
}
```

### 6. 料理分享系统

```typescript
// 玩家可以分享自己的菜谱
interface SharedRecipe extends UserRecipe {
    authorId: number;
    authorName: string;
    likes: number;
    downloads: number;
    sharedAt: number;
}

// 其他玩家可以学习分享的菜谱
function learnSharedRecipe(recipeId: string, userId: number) {
    const recipe = getSharedRecipe(recipeId);
    addRecipeToUser(userId, recipe);
}
```

---

## 🔗 相关文件

- `food-recipes.ts` - 料理模板数据（164个模板）
- `components/CookingModal.tsx` - 烹饪界面组件
- `hooks/useCoreState.ts` - 游戏状态管理
- `services/llmService.ts` - LLM 服务（料理命名）
- `data/items.ts` - 食材数据定义

---

**最后更新**: 2026-02-21  
**设计者**: Nyaa  
**开发者**: Gemini  
**维护者**: Claude  
**标签**: `#烹饪系统` `#LLM生成` `#游戏玩法`