---
name: "game-data-query"
description: "Queries and analyzes game-related data including user profiles, inventories, characters, sanity ledgers, and database content. Invoke when user needs to check or modify game data."
---

# Game Data Query

This skill handles queries and operations on game-related data such as user profiles, inventories, character progression, and other database content.

## When to Invoke

- User wants to check player data
- User needs to query inventory
- User asks about character levels/exp/equipment
- User wants to analyze sanity consumption
- User needs to modify game database content
- User asks about user statistics

## Database Location

```
database-server/data/database.sqlite
```

> **基准目录**: `e:\GitHUB\AVG-AdventurerTavern`（项目根目录）

## Database Tables

| 表名 | 说明 |
|------|------|
| `users` | 用户账户信息 |
| `saves` | 游戏存档 |
| `character_unlocks` | 角色解锁状态 |
| `character_progress` | 角色等级经验 |
| `character_equipment` | 角色装备栏位 |
| `chat_messages` | AI 对话历史 |
| `character_memories` | 角色长期记忆 |
| `sanity_ledger` | 理智账本 |

## Data Types

### User Profiles
- User ID, Discord ID, Discord username
- Registration date, Discord avatar
- **注意**: 密码登录已停用，仅支持 Discord 登录

### Inventories
- Items owned (id, quantity)
- Equipment slots
- Special items

### Characters
- Unlocked characters
- Levels and experience
- Equipment and skills
- Stats and attributes

### Sanity Ledger
- Consumption history
- Balance tracking
- Transaction records

## Query Tools

### sqlite3 CLI (推荐)

```powershell
# 查看所有表
sqlite3 database-server/data/database.sqlite ".tables"

# 查看表结构
sqlite3 database-server/data/database.sqlite ".schema users"

# 查询用户数量
sqlite3 database-server/data/database.sqlite "SELECT COUNT(*) FROM users;"

# 导出数据
sqlite3 database-server/data/database.sqlite ".dump users" > users_backup.sql

# 交互模式
sqlite3 database-server/data/database.sqlite
```

### Node.js Scripts

```powershell
# 在 database-server 目录下执行
cd database-server
node -e "const db = require('sqlite3').verbose().Database('./data/database.sqlite'); ..."
```

## Query Operations

### Read Operations
```typescript
// Example queries
getUserProfile(userId: string)
getInventory(userId: string, category?: string)
getCharacterData(userId: string, slotId: number)
getSanityLedger(userId: string, dateRange?: DateRange)
```

### Write Operations
```typescript
// Example mutations
updateUserGold(userId: string, amount: number)
addItemToInventory(userId: string, itemId: string, quantity: number)
updateCharacterLevel(userId: string, slotId: number, newLevel: number)
```

## Analysis Capabilities

- Top users by sanity consumption
- Item popularity statistics
- Character usage distribution
- Resource balance reports

## Output Format

```
## Query Result

**Data Type:** [Profile/Inventory/Character/etc]
**User:** [User ID/Name]

### Details
[Formatted data display]

### Summary
[Brief summary of findings]
```

## Safety Notes

- **Always backup before modifying data** - Use `backup_db.ps1`
- Always confirm before modifying data
- Log all write operations
- Provide rollback information when possible
- Use transactions for bulk operations

## Related Documentation

- [USER_ACCOUNT_MIGRATION_SYSTEM.md](../../Doc/Technical/USER_ACCOUNT_MIGRATION_SYSTEM.md) - 账号迁移系统（已停用）
- [SAVE_SYSTEM_AND_DATABASE.md](../../Doc/Technical/SAVE_SYSTEM_AND_DATABASE.md) - 存档系统
