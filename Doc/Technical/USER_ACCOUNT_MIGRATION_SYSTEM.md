# 用户账号迁移系统技术文档

## 📋 元数据

| 属性 | 值 |
|------|-----|
| **文档名称** | USER_ACCOUNT_MIGRATION_SYSTEM |
| **创建日期** | 2026-03-08 |
| **设计者** | Nyaa |
| **创建者** | GPT Codex |
| **维护者** | GLM |
| **当前状态** | 已停用（代码已注释） |

---

## 📖 系统概述

用户账号迁移系统用于将旧账号密码登录的用户数据迁移到 Discord 账号。该系统允许用户在首次使用 Discord 登录时，输入旧账号的用户名和密码，将存档、角色解锁、聊天记录、理智账本等数据迁移到新的 Discord 账号。

### 停用原因

- 简化用户登录流程
- 减少维护负担
- 避免数据库结构变更时的迁移逻辑同步问题
- 当前阶段不再需要支持旧账号迁移

### 停用日期

2026-03-08

---

## 🗂️ 已注释代码位置

### 1. 后端迁移脚本

| 文件路径 | 说明 |
|----------|------|
| `database-server/migrate-add-discord-fields.js` | Discord 字段迁移脚本（添加 discord_id, discord_username, discord_avatar, is_discord_bound 字段） |
| `database-server/migrate-discord.js` | Discord 字段迁移脚本（旧版本） |
| `database-server/migrate-user-data.js` | 用户数据迁移脚本（迁移存档、解锁、聊天、记忆、理智等数据） |

### 2. 后端 API 端点

| 文件路径 | 端点 | 说明 |
|----------|------|------|
| `database-server/index.js` | `/api/login` | 密码登录 API |
| `database-server/index.js` | `/api/auth/discord/migrate` | 账号数据迁移 API |

### 3. 后端配置

| 文件路径 | 配置项 | 说明 |
|----------|--------|------|
| `database-server/config.js` | `AUTH.ENABLE_PASSWORD_LOGIN` | 账号密码登录开关 |
| `database-server/config.js` | `AUTH.FORCE_DISCORD_BIND` | 强制 Discord 绑定开关 |

### 4. 前端服务

| 文件路径 | 函数/组件 | 说明 |
|----------|-----------|------|
| `services/db.ts` | `migrateOldAccount()` | 迁移旧账号数据函数（已注释） |
| `components/TitleScreen.tsx` | Migration States | 迁移界面状态变量（已注释） |
| `components/TitleScreen.tsx` | `handleSkipMigration()` | 跳过迁移函数（已注释） |
| `components/TitleScreen.tsx` | `handleMigrate()` | 执行迁移函数（已注释） |
| `components/TitleScreen.tsx` | Migration Modal JSX | 迁移界面 UI（已注释） |

> **注意**：所有前端代码均已安全注释，重新启用时只需取消注释即可。

---

## 🔧 重新启用步骤

### 步骤 1：恢复后端配置

编辑 `database-server/config.js`：

```javascript
// 登录方式配置
AUTH: {
    ENABLE_PASSWORD_LOGIN: process.env.ENABLE_PASSWORD_LOGIN !== 'false',
    FORCE_DISCORD_BIND: process.env.FORCE_DISCORD_BIND !== 'false'
}
```

### 步骤 2：恢复后端 API

编辑 `database-server/index.js`，取消以下代码块的注释：

1. **密码登录 API**（约第 451-464 行）
2. **账号迁移 API**（约第 642-748 行）

### 步骤 3：恢复前端服务

编辑 `services/db.ts`，取消 `migrateOldAccount` 函数的注释：

```typescript
export const migrateOldAccount = async (newUserId: number, oldUsername: string, oldPassword: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiCall('/auth/discord/migrate', { newUserId, oldUsername, oldPassword });
    return res;
};
```

### 步骤 4：恢复前端界面

编辑 `components/TitleScreen.tsx`，取消以下代码块的注释：

1. **import 语句**（第 6 行）：将 `migrateOldAccount` 从注释中恢复
2. **迁移状态变量**（约第 48-54 行）
3. **Discord 回调中的迁移逻辑**（约第 101-127 行）
4. **迁移处理函数**（约第 206-251 行）
5. **迁移界面 JSX**（约第 596-658 行）
6. **登录界面条件判断**：将 `{titleState === 'AUTH' && (` 改为 `{titleState === 'AUTH' && !showMigration && (`

### 步骤 5：恢复迁移脚本（如需重新执行数据库迁移）

取消以下文件的注释：
- `database-server/migrate-add-discord-fields.js`
- `database-server/migrate-discord.js`
- `database-server/migrate-user-data.js`

---

## 📐 新数据库结构迁移规则

当需要重新启用迁移系统时，如果数据库结构已发生变化，需要按以下规则更新迁移逻辑：

### 规则 1：新增用户相关表

如果新增了与用户数据相关的表，需要在迁移脚本中添加对应的迁移逻辑：

**位置**：`database-server/index.js` 的 `/api/auth/discord/migrate` 端点

**模板**：

```javascript
// 1. 清理目标用户的空数据
db.run("DELETE FROM new_table WHERE user_id = ?", [targetUserId], function(err) {
    if (err) { migrationError = err; console.error('[迁移] 清理目标新表失败:', err); }
});

// 2. 迁移源用户数据到目标用户
db.run("UPDATE new_table SET user_id = ? WHERE user_id = ?", [targetUserId, sourceUserId], function(err) {
    if (err) { migrationError = err; console.error('[迁移] 迁移新表失败:', err); }
    else console.log(`[迁移] 迁移新表: ${this.changes} 条`);
});
```

### 规则 2：新增用户字段

如果 `users` 表新增了字段，需要更新迁移脚本：

**位置**：`database-server/migrate-add-discord-fields.js`

**模板**：

```javascript
const fieldsToAdd = [
    // 现有字段...
    { name: 'new_field', sql: 'ALTER TABLE users ADD COLUMN new_field TEXT' }
];
```

### 规则 3：新增数据表需要更新迁移脚本

**位置**：`database-server/migrate-user-data.js`

**模板**：

```javascript
db.run(
    "UPDATE new_table SET user_id = ? WHERE user_id = ?",
    [targetUserId, sourceUserId],
    function(err) {
        if (err) {
            console.error('迁移新表失败:', err);
        } else {
            console.log(`✓ 已迁移 ${this.changes} 条新表记录`);
        }
    }
);
```

### 规则 4：数据完整性检查

迁移完成后，必须验证数据完整性：

```javascript
// 验证迁移结果
db.get("SELECT COUNT(*) as count FROM saves WHERE user_id = ?", [targetUserId], (err, row) => {
    console.log(`验证: 目标用户存档数 = ${row.count}`);
});
```

---

## 🗄️ 数据库表结构参考

### users 表（当前结构）

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | 用户唯一 ID |
| `username` | TEXT | UNIQUE | 用户名（Discord 登录可为空） |
| `password` | TEXT | - | 密码（Discord 登录可为空） |
| `discord_id` | TEXT | UNIQUE | Discord 用户 ID |
| `discord_username` | TEXT | - | Discord 用户名 |
| `discord_avatar` | TEXT | - | Discord 头像 hash |
| `is_discord_bound` | INTEGER | DEFAULT 0 | 是否已绑定 Discord |
| `created_at` | INTEGER | - | 创建时间戳 |

### 迁移涉及的数据表

| 表名 | 说明 | 迁移方式 |
|------|------|----------|
| `saves` | 存档数据 | UPDATE user_id |
| `character_unlocks` | 角色解锁状态 | UPDATE user_id |
| `character_progress` | 角色等级经验 | UPDATE user_id |
| `character_equipment` | 角色装备栏位 | UPDATE user_id |
| `chat_messages` | 对话历史 | UPDATE user_id |
| `character_memories` | 长期记忆 | UPDATE user_id |
| `sanity_ledger` | 理智账本 | UPDATE user_id |

---

## ⚠️ 注意事项

1. **数据备份**：执行迁移前必须备份数据库
2. **事务处理**：迁移操作必须在事务中执行，失败时回滚
3. **唯一约束**：迁移前需检查目标用户是否已有数据，避免冲突
4. **删除源用户**：迁移成功后删除旧用户记录
5. **索引维护**：确保 `discord_id` 字段有唯一索引

---

## 💾 数据库备份脚本

### 脚本位置

`database-server/backup_db.ps1`

### 使用方法

```powershell
# 在 database-server 目录下执行
.\backup_db.ps1
```

### 脚本内容

```powershell
# 数据库备份脚本
# 按时间戳格式备份数据库文件

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$dbPath = Join-Path $scriptDir "data\database.sqlite"

# 检查数据库文件是否存在
if (-not (Test-Path $dbPath)) {
    Write-Error "错误: 数据库文件不存在 - $dbPath"
    exit 1
}

# 生成时间戳格式: YYMMDDHHMMSS
$timestamp = Get-Date -Format "yyMMddHHmmss"
$backupName = "database_$timestamp.sqlite.bak"
$backupPath = Join-Path $scriptDir "data\$backupName"

# 执行备份
try {
    Copy-Item $dbPath $backupPath
    $fileSize = (Get-Item $backupPath).Length / 1KB
    Write-Host "✓ 数据库备份成功!" -ForegroundColor Green
    Write-Host "  备份文件: $backupName"
    Write-Host "  文件大小: $([math]::Round($fileSize, 2)) KB"
    Write-Host "  备份时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
} catch {
    Write-Error "备份失败: $_"
    exit 1
}
```

### 输出示例

```
✓ 数据库备份成功!
  备份文件: database_260308153045.sqlite.bak
  文件大小: 128.5 KB
  备份时间: 2026-03-08 15:30:45
```

### 备份文件位置

备份文件保存在 `database-server/data/` 目录下，命名格式为 `database_YYMMDDHHMMSS.sqlite.bak`

---

## 📝 变更历史

| 日期 | 版本 | 变更内容 | 作者 |
|------|------|----------|------|
| 2026-03-08 | 1.0.0 | 初始版本，记录已停用的迁移系统 | GLM |
| 2026-03-08 | 1.1.0 | 将前端代码改为注释形式（非删除），便于后续重新启用 | GLM |

---

## 🔗 相关文档

- [SAVE_SYSTEM_AND_DATABASE.md](./SAVE_SYSTEM_AND_DATABASE.md) - 存档系统与数据库
- [SETTINGS_MIGRATION_SYSTEM.md](./SETTINGS_MIGRATION_SYSTEM.md) - 设置迁移系统
- [AI_MEMORY_COMPLETE_GUIDE.md](./AI_MEMORY_COMPLETE_GUIDE.md) - AI 记忆系统
