# 存档系统与数据库技术文档

## 📋 系统概述

本游戏采用**云存档 + 本地配置**的混合存储方案：
- **云存档（数据库）**: 游戏进度、角色数据、物品等核心游戏数据
- **本地存储（LocalStorage）**: 用户偏好设置、API 配置等客户端配置

## 🏗️ 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                      游戏客户端                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │  LocalStorage    │         │   游戏状态管理    │     │
│  │  (本地配置)      │         │   (useCoreState)  │     │
│  └──────────────────┘         └──────────────────┘     │
│           │                            │                │
│           │                            │                │
│           ▼                            ▼                │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │ utils/storage.ts │         │  services/db.ts  │     │
│  │  (配置管理)      │         │   (存档服务)     │     │
│  └──────────────────┘         └──────────────────┘     │
│                                         │                │
└─────────────────────────────────────────┼────────────────┘
                                          │
                                          │ HTTP/HTTPS
                                          │
                                          ▼
                            ┌──────────────────────────┐
                            │    后端服务器 (Node.js)   │
                            │    server/server.js      │
                            ├──────────────────────────┤
                            │  - 用户认证 (JWT)        │
                            │  - 存档管理 (CRUD)       │
                            │  - 数据验证              │
                            └──────────────────────────┘
                                          │
                                          ▼
                            ┌──────────────────────────┐
                            │   SQLite 数据库          │
                            │   data/game.db           │
                            ├──────────────────────────┤
                            │  - users 表              │
                            │  - saves 表              │
                            └──────────────────────────┘
```

---

## 📊 数据库设计

### 数据库类型
- **SQLite 3**: 轻量级、无需独立服务器、适合单机/小型部署
- **位置**: `database-server/data/database.sqlite`（独立数据库服务）
- **部署方式**: 独立 Docker 容器部署（与前端客户端分离）

### 表结构

#### 1. `users` 表（用户认证）

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | 用户唯一 ID |
| `username` | TEXT | UNIQUE, NOT NULL | 用户名 |
| `password` | TEXT | NOT NULL | 密码（bcrypt 加密） |
| `created_at` | INTEGER | NOT NULL | 创建时间戳 |

#### 2. `saves` 表（存档数据）

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | 存档唯一 ID |
| `user_id` | INTEGER | NOT NULL | 用户 ID（外键） |
| `slot_id` | INTEGER | NOT NULL | 存档槽位 (0=自动, 1-3=手动) |
| `label` | TEXT | NOT NULL | 存档标签（显示名称） |
| `saved_at` | INTEGER | NOT NULL | 保存时间戳 |
| `data` | TEXT | NOT NULL | 游戏数据（JSON 字符串） |

**索引**:
- `UNIQUE(user_id, slot_id)` - 每个用户每个槽位只能有一个存档

#### 3. `character_unlocks` 表（角色状态解锁）

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | 记录唯一 ID |
| `user_id` | INTEGER | NOT NULL, FOREIGN KEY | 用户 ID（外键） |
| `slot_id` | INTEGER | NOT NULL | 存档槽位 (0=自动, 1-3=手动) |
| `character_id` | TEXT | NOT NULL | 角色 ID (如 char_101) |
| `accept_battle_party` | INTEGER | DEFAULT 0 | 接受战斗组队 (0=未解锁, 1=已解锁) |
| `accept_flirt_topic` | INTEGER | DEFAULT 0 | 接受暧昧话题 (0=未解锁, 1=已解锁) |
| `accept_nsfw_topic` | INTEGER | DEFAULT 0 | 接受色情话题 (0=未解锁, 1=已解锁) |
| `accept_physical_contact` | INTEGER | DEFAULT 0 | 接受身体接触 (0=未解锁, 1=已解锁) |
| `accept_indirect_sexual` | INTEGER | DEFAULT 0 | 接受间接性行为 (0=未解锁, 1=已解锁) |
| `accept_become_lover` | INTEGER | DEFAULT 0 | 接受成为恋人 (0=未解锁, 1=已解锁) |
| `accept_direct_sexual` | INTEGER | DEFAULT 0 | 接受直接性行为 (0=未解锁, 1=已解锁) |
| `accept_sexual_partner` | INTEGER | DEFAULT 0 | 接受成为性伴侣 (0=未解锁, 1=已解锁) |
| `accept_public_exposure` | INTEGER | DEFAULT 0 | 接受公开露出 (0=未解锁, 1=已解锁) |
| `accept_public_sexual` | INTEGER | DEFAULT 0 | 接受公开性行为 (0=未解锁, 1=已解锁) |
| `accept_group_sexual` | INTEGER | DEFAULT 0 | 接受多人性行为 (0=未解锁, 1=已解锁) |
| `accept_prostitution` | INTEGER | DEFAULT 0 | 接受卖春 (0=未解锁, 1=已解锁) |
| `accept_sexual_slavery` | INTEGER | DEFAULT 0 | 接受性奴役 (0=未解锁, 1=已解锁) |
| `updated_at` | INTEGER | NOT NULL | 最后更新时间戳 |

**索引**:
- `UNIQUE(user_id, slot_id, character_id)` - 每个存档中每个角色只有一条状态记录
- `idx_character_unlocks_user_slot` - 复合索引 (user_id, slot_id)
- `idx_character_unlocks_character` - 角色 ID 索引

**外键约束**:
- `user_id` → `users(id)` ON DELETE CASCADE - 删除用户时级联删除角色状态

**设计说明**:
- 所有解锁状态字段使用 INTEGER 类型存储布尔值 (0=false, 1=true)
- 默认值均为 0（未解锁状态）
- 与存档槽位关联，不同槽位的角色状态独立
- 支持级联删除，确保数据一致性

---

## 📦 云存档数据字典（数据库 `saves.data` 字段）

### 数据结构概览

```typescript
interface SaveData {
    // 基础资源
    gold: number;
    
    // 世界状态
    currentSceneId: string;
    worldState: WorldState;
    
    // 旅店管理
    managementStats: ManagementStats;
    
    // 物品系统
    inventory: Record<string, number>;
    
    // 角色系统
    characterStats: Record<string, { level: number; affinity: number }>;
    
    // 场景系统
    sceneLevels: Record<string, number>;
    
    // 财务系统
    revenueLogs: RevenueLog[];
    
    // 烹饪系统
    userRecipes?: UserRecipe[];
    foodStock?: Record<string, number>;
    
    // 游戏设置（可选）
    settings?: GameSettings;
}
```

### 详细数据项

#### 1. 基础资源

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `gold` | `number` | 玩家持有的金币数量 | `3000` |

#### 2. 世界状态 (`worldState`)

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `dateStr` | `string` | 游戏内日期 | `"10月24日"` |
| `weekDay` | `string` | 星期 | `"周日"` |
| `timeStr` | `string` | 游戏内时间 | `"22:30"` |
| `period` | `'day' \| 'evening' \| 'night'` | 时段代码 | `"night"` |
| `periodLabel` | `string` | 时段显示名 | `"深夜"` |
| `weather` | `string` | 天气描述 | `"晴朗"` |
| `weatherCode` | `string` | 天气图标代码 | `"sunny"` |
| `sceneName` | `string` | 当前场景名称 | `"柜台"` |
| `currentSceneId` | `string` | 当前场景 ID | `"scen_1"` |

#### 3. 旅店管理数据 (`managementStats`)

| 字段 | 类型 | 说明 | 范围 | 示例 |
|------|------|------|------|------|
| `occupancy` | `number` | 当前住宿人数 | 0 - maxOccupancy | `15` |
| `maxOccupancy` | `number` | 最大住宿人数 | - | `20` |
| `roomPrice` | `number` | 客房单价 (G) | - | `50` |
| `satisfaction` | `number` | 满足度 | 0 - 100 | `75` |
| `attraction` | `number` | 集客力 | 0 - 100 | `60` |
| `reputation` | `number` | 好评度 | 0 - 100 | `80` |

#### 4. 物品库存 (`inventory`)

| 数据结构 | 说明 | 示例 |
|----------|------|------|
| `Record<string, number>` | 物品 ID → 数量的映射 | `{ "item_001": 5, "item_002": 10 }` |

**物品 ID 格式**:
- 资源类: `res_xxx`
- 道具类: `itm_xxx`
- 武器类: `wpn_xxx`
- 防具类: `arm_xxx`
- 饰品类: `acs_xxx`

#### 5. 角色统计数据 (`characterStats`)

| 数据结构 | 说明 | 示例 |
|----------|------|------|
| `Record<string, { level: number; affinity: number }>` | 角色 ID → 统计数据 | 见下表 |

**角色统计字段**:

| 字段 | 类型 | 说明 | 范围 |
|------|------|------|------|
| `level` | `number` | 角色等级 | 1 - 99 |
| `affinity` | `number` | 好感度 | 0 - 100 |

**示例**:
```json
{
    "char_101": { "level": 5, "affinity": 85 },
    "char_102": { "level": 99, "affinity": 45 },
    "char_103": { "level": 1, "affinity": 20 }
}
```

#### 6. 场景等级 (`sceneLevels`)

| 数据结构 | 说明 | 示例 |
|----------|------|------|
| `Record<string, number>` | 场景 ID → 等级的映射 | `{ "scen_1": 2, "scen_2": 1 }` |

**场景 ID 列表**:
- `scen_1`: 柜台
- `scen_2`: 客房
- `scen_3`: 酒场
- `scen_4`: 训练场
- `scen_5`: 武器店
- `scen_6`: 防具店
- `scen_7`: 温泉
- `scen_8`: 按摩室
- `scen_9`: 库房
- `scen_10`: 道具店

#### 7. 营收记录 (`revenueLogs`)

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `id` | `string` | 记录唯一 ID | `"log-1234567890"` |
| `timestamp` | `number` | 时间戳 | `1640000000000` |
| `dateStr` | `string` | 日期字符串 | `"10月24日"` |
| `timeStr` | `string` | 时间字符串 | `"08:00"` |
| `type` | `'accommodation' \| 'tavern'` | 收入类型 | `"accommodation"` |
| `amount` | `number` | 金额 (G) | `500` |

**数组限制**: 最多保存 100 条记录

#### 8. 烹饪系统

##### 8.1 用户菜谱 (`userRecipes`)

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `id` | `string` | 菜谱唯一 ID | `"recipe-1234567890"` |
| `templateId` | `string` | 关联的模板 ID | `"template_001"` |
| `name` | `string` | 料理名称 | `"火焰史莱姆冻"` |
| `description` | `string` | 料理描述 | `"虽然外表红通通的..."` |
| `imagePath` | `string` | 图片路径 | `"img/food/001.png"` |
| `star` | `number` | 料理星级 | `3` |
| `price` | `number` | 估算售价 | `150` |
| `mainResId` | `string` | 主素材 ID | `"res_001"` |
| `otherResIds` | `string[]` | 辅素材 ID 列表 | `["res_002", "res_003"]` |
| `createdAt` | `number` | 创建时间戳 | `1640000000000` |

##### 8.2 料理库存 (`foodStock`)

| 数据结构 | 说明 | 示例 |
|----------|------|------|
| `Record<string, number>` | 菜谱 ID → 数量的映射 | `{ "recipe-123": 5 }` |

#### 9. 游戏设置 (`settings`, 可选)

> **注意**: 此字段为可选，用于跨设备同步设置。详见"本地存储数据字典"章节。

---

## 💾 本地存储数据字典（LocalStorage）

### 存储位置
- **Key**: `adventurer_tavern_settings`
- **存储方式**: `localStorage.setItem(key, JSON.stringify(settings))`

### 数据结构

```typescript
interface GameSettings {
    // 用户自定义
    userName: string;
    innName: string;
    
    // UI 设置
    enableTypewriter: boolean;
    dialogueTransparency: number;
    
    // API 配置
    apiConfig: ApiConfig;
    
    // 音频设置
    masterVolume: number;
    isMuted: boolean;
    
    // 功能开关
    enableNSFW: boolean;
    enableDebug: boolean;
    enableHD: boolean;
}
```

### 详细数据项

#### 1. 用户自定义

| 字段 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `userName` | `string` | 玩家角色名称 | `"罗安"` |
| `innName` | `string` | 旅店名称 | `"夜莺亭"` |

#### 2. UI 设置

| 字段 | 类型 | 说明 | 范围 | 默认值 |
|------|------|------|------|--------|
| `enableTypewriter` | `boolean` | 启用打字机效果 | - | `true` |
| `dialogueTransparency` | `number` | 对话框透明度 | 0 - 100 | `40` |

#### 3. API 配置 (`apiConfig`)

| 字段 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `provider` | `ApiProvider` | API 提供商 | `"openai_compatible"` |
| `baseUrl` | `string` | API 基础 URL | `"https://love.qinyan.icu/v1"` |
| `apiKey` | `string` | API 密钥 | `""` |
| `model` | `string` | 模型名称 | `"grok-3"` |
| `autoConnect` | `boolean` | 自动连接 | `false` |

**API 提供商类型**:
```typescript
type ApiProvider = 'openai_compatible' | 'google' | 'deepseek' | 'openai' | 'claude';
```

#### 4. 音频设置

| 字段 | 类型 | 说明 | 范围 | 默认值 |
|------|------|------|------|--------|
| `masterVolume` | `number` | 主音量 | 0 - 100 | `15` |
| `isMuted` | `boolean` | 静音状态 | - | `false` |

#### 5. 功能开关

| 字段 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `enableNSFW` | `boolean` | 启用 NSFW 内容 | `false` |
| `enableDebug` | `boolean` | 启用调试模式 | `false` |
| `enableHD` | `boolean` | 启用高清图片 | `false` |

---

## 🔄 存档流程

### 自动存档（Slot 0）

**触发时机**:
1. 每次对话结束时
2. 每 5 分钟（如果不在对话中且不在场景转换中）
3. 从设置界面返回游戏时

**流程**:
```typescript
// 1. 收集当前游戏状态
const saveData = {
    gold: core.gold,
    currentSceneId: world.currentSceneId,
    worldState: world.worldState,
    managementStats: core.managementStats,
    inventory: core.inventory,
    characterStats: core.characterStats,
    sceneLevels: core.sceneLevels,
    revenueLogs: core.revenueLogs,
    userRecipes: core.userRecipes,
    foodStock: core.foodStock,
    settings: settings
};

// 2. 生成存档标签
const label = `${worldState.dateStr} ${worldState.timeStr} - ${worldState.sceneName}`;

// 3. 调用存档服务
await saveGame(userId, 0, label, saveData);
```

### 手动存档（Slot 1-3）

**触发方式**: 玩家通过存档界面手动保存

**流程**: 与自动存档相同，但 `slotId` 为 1-3

### 读档流程

```typescript
// 1. 从服务器加载存档数据
const data = await loadGame(userId, slotId);

// 2. 恢复游戏状态
if (data) {
    core.applyLoadedData(data);
    world.setCurrentSceneId(data.currentSceneId);
    world.setWorldState(data.worldState);
    
    // 3. 恢复设置（如果存在）
    if (data.settings) {
        onSettingsChange(data.settings);
    }
}
```

---

## 🔐 安全性设计

### 1. 用户认证
- **密码加密**: 使用 bcrypt 加密存储
- **会话管理**: JWT Token（可选，当前版本未实现）

### 2. 数据验证
- **服务端验证**: 所有存档数据在保存前进行类型检查
- **SQL 注入防护**: 使用参数化查询

### 3. 数据隔离
- **用户隔离**: 每个用户只能访问自己的存档
- **槽位隔离**: 不同槽位的存档相互独立

---

## 📈 性能优化

### 1. 数据压缩
- **JSON 序列化**: 存档数据以 JSON 字符串形式存储
- **未来优化**: 可考虑使用 gzip 压缩大型存档

### 2. 查询优化
- **索引**: `(user_id, slot_id)` 复合索引
- **限制**: 营收记录最多保存 100 条

### 3. 缓存策略
- **本地缓存**: 游戏状态在内存中维护
- **延迟写入**: 自动存档使用定时器批量写入

---

## 🛠️ API 接口

### 1. 用户认证

#### 注册
```typescript
POST /register
Body: { username: string, password: string }
Response: { success: boolean, message: string, uid?: number }
```

#### 登录
```typescript
POST /login
Body: { username: string, password: string }
Response: { success: boolean, message: string, uid?: number }
```

### 2. 存档管理

#### 保存存档
```typescript
POST /save
Body: {
    userId: number,
    slotId: number,
    label: string,
    data: SaveData
}
Response: { success: boolean, message?: string }
```

#### 读取存档
```typescript
POST /load
Body: { userId: number, slotId: number }
Response: {
    success: boolean,
    data?: SaveData & { savedAt: number }
}
```

#### 获取存档列表
```typescript
POST /slots
Body: { userId: number }
Response: {
    success: boolean,
    slots: Array<{
        slotId: number,
        label: string,
        savedAt: number
    }>
}
```

#### 删除存档
```typescript
POST /delete
Body: { userId: number, slotId: number }
Response: { success: boolean }
```

---

## 🔧 配置文件

### 服务器配置 (`database-server/config.js`)

```javascript
module.exports = {
    port: 3097,
    dbPath: './data/database.sqlite',
    corsOrigin: '*',
    jwtSecret: 'your-secret-key' // 未来使用
};
```

### 客户端配置 (`config.ts`)

```typescript
export const AppConfig = {
    apiBaseUrl: 'https://your-domain.com:3097'
};
```

---

## 📝 数据迁移

### 版本兼容性

当游戏更新导致存档结构变化时，需要实现数据迁移逻辑：

```typescript
// 示例：添加新字段时的兼容处理
const applyLoadedData = (data: any) => {
    // 兼容旧版本存档
    if (!data.userRecipes) data.userRecipes = [];
    if (!data.foodStock) data.foodStock = {};
    
    // 应用数据
    setGold(data.gold);
    setInventory(data.inventory);
    // ...
};
```

---

## 🐛 调试工具

### 1. 控制台日志

```javascript
// 存档成功
console.log('[Save] Slot', slotId, 'saved successfully');

// 存档失败
console.error('[Save] Failed:', error.message);

// 读档成功
console.log('[Load] Slot', slotId, 'loaded successfully');
```

### 2. 数据库查看

```bash
# 进入数据库服务容器
docker exec -it database-server sh

# 查看数据库
sqlite3 /app/data/database.sqlite

# 查询存档
SELECT id, user_id, slot_id, label, saved_at FROM saves;

# 查看用户
SELECT id, username, created_at FROM users;
```

---

## 🚀 未来扩展

### 1. 云同步增强
- 实现 JWT 认证
- 添加存档冲突检测
- 支持多设备同步

### 2. 数据分析
- 记录玩家行为数据
- 生成游戏统计报告
- 优化游戏平衡性

### 3. 备份与恢复
- 自动备份数据库
- 支持存档导出/导入
- 灾难恢复机制

---

## 📚 相关文件

### 前端客户端
- `services/db.ts` - 客户端存档服务
- `utils/storage.ts` - 本地配置管理
- `hooks/useCoreState.ts` - 游戏状态管理

### 数据库服务（独立部署）
- `database-server/index.js` - 后端服务器主文件
- `database-server/config.js` - 服务器配置
- `database-server/data/database.sqlite` - SQLite 数据库文件
- `database-server/docker-compose.yml` - 数据库服务部署配置
- `database-server/Dockerfile` - 数据库服务镜像构建
- `database-server/README.md` - 数据库服务部署文档

---

---

## 🏗️ 部署架构说明

### 服务分离架构

从 2026-02-21 起，本项目采用**前后端分离**的部署架构：

```
┌─────────────────────────────────────────────────────────┐
│                   前端客户端容器                         │
│              (honywen/adv-tavern)                       │
│                   Port: 3098                            │
│              Nginx + React 静态资源                      │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/HTTPS
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 数据库服务容器（独立部署）                │
│              (database-server/)                         │
│                   Port: 3097                            │
│              Node.js + SQLite                           │
│         database-server/data/database.sqlite            │
└─────────────────────────────────────────────────────────┘
```

### 部署步骤

#### 1. 部署前端客户端
```bash
# 在项目根目录
docker-compose up -d
# 访问: http://localhost:3098
```

#### 2. 部署数据库服务（独立部署）
```bash
# 进入数据库服务目录
cd database-server

# 启动数据库服务
docker-compose up -d

# 数据库服务运行在: http://localhost:3097
```

### 服务通信

- **前端客户端**: 通过配置的 API Base URL 连接到数据库服务
- **数据库服务**: 提供 RESTful API 接口供前端调用
- **数据持久化**: 数据库文件存储在 `database-server/data/database.sqlite`

### 优势

1. **独立扩展**: 前端和后端可以独立扩展和更新
2. **资源隔离**: 数据库服务与前端服务资源隔离
3. **安全性**: 数据库不直接暴露给客户端
4. **灵活部署**: 可以将数据库服务部署到不同的服务器
5. **维护便利**: 可以独立维护和备份数据库服务

---

**最后更新**: 2026-02-21  
**设计者**: Nyaa  
**开发者**: Gemini  
**维护者**: Claude  
**版本**: v2.0 (服务分离架构)  
**标签**: `#存档系统` `#数据库` `#数据字典` `#技术文档` `#微服务架构`