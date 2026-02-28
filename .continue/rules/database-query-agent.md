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