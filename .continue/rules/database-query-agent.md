---
description: 当用户询问数据库内容、用户数据、存档、背包道具、角色数据等游戏数据相关问题时应用此规则。
alwaysApply: false
---

当用户需要查询、分析或修改游戏数据库时，使用 `database-server/db_query.py` 脚本。可用命令：
- `python database-server/db_query.py counts` — 各表数据量
- `python database-server/db_query.py users [user_id]` — 查询用户
- `python database-server/db_query.py inventory <user_id> [item_id]` — 查询背包
- `python database-server/db_query.py save <user_id> [slot_id]` — 查看存档
- `python database-server/db_query.py sql "<SELECT ...>"` — 执行任意SQL

数据库路径：`database-server/data/database.sqlite`
道具数据存储在 saves 表的 data 字段（JSON格式）的 inventory 对象中。

时间戳字段（如 created_at、updated_at）均为毫秒级 Unix 时间戳，查询时间相关信息时，必须使用 `datetime(field/1000, 'unixepoch', '+8 hours')` 转换，并以「年月日时分秒」格式（如 2026-03-01 01:21:37）输出。

---

## 理智账本（sanity_ledger）查询规范

表结构：
- `id` — 自增主键
- `user_id` — 用户ID（不关联users表，删除用户不影响此表）
- `type` — 记录类型（见下方枚举）
- `amount` — 负数=消耗，正数=充值/收入
- `description` — 备注（如角色ID、操作说明）
- `client_ip` — 客户端真实IP
- `created_at` — 毫秒时间戳

已定义 type 枚举：
- `ai_memory` — 对话记忆写入（amount = 该条消息字符数的负值）
- `ai_summary` — 摘要压缩（amount = 被压缩的所有消息字符数合计的负值）
- `recharge` — 用户付费充值（正值）

常用查询模板：

```sql
-- 查询某用户的余额（所有 amount 求和）
SELECT user_id, SUM(amount) AS balance FROM sanity_ledger WHERE user_id = ?;

-- 查询某用户的最近明细
SELECT type, amount, description, client_ip,
       datetime(created_at/1000, 'unixepoch', '+8 hours') AS time
FROM sanity_ledger WHERE user_id = ? ORDER BY created_at DESC LIMIT 20;

-- 按 type 统计全局消耗分布
SELECT type, COUNT(*) AS count,
       SUM(ABS(amount)) AS total_chars,
       CAST(AVG(ABS(amount)) AS INTEGER) AS avg_chars
FROM sanity_ledger GROUP BY type;

-- 查询所有用户的累计消耗排行
SELECT user_id, SUM(ABS(amount)) AS total_consumed
FROM sanity_ledger WHERE amount < 0
GROUP BY user_id ORDER BY total_consumed DESC LIMIT 20;

-- 按天统计全局字符写入量
SELECT date(created_at/1000, 'unixepoch', '+8 hours') AS day,
       COUNT(*) AS records,
       SUM(ABS(amount)) AS total_chars
FROM sanity_ledger WHERE amount < 0
GROUP BY day ORDER BY day DESC;
```