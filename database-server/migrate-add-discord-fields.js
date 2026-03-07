/**
 * [已停用] Discord 字段迁移脚本
 * 
 * 停用日期: 2026-03-08
 * 停用原因: 账号迁移系统已关闭，不再需要添加 Discord 字段
 * 
 * 如需重新启用，取消下方代码块的注释
 */

/*
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('./config');

const db = new sqlite3.Database(config.DB_PATH, (err) => {
    if (err) {
        console.error('数据库连接失败:', err);
        process.exit(1);
    }
    console.log('已连接到数据库');
});

db.serialize(() => {
    // 检查并添加 Discord 相关字段
    db.all("PRAGMA table_info(users)", [], (err, columns) => {
        if (err) {
            console.error('查询表结构失败:', err);
            process.exit(1);
        }

        const existingColumns = columns.map(col => col.name);
        const fieldsToAdd = [
            { name: 'discord_id', sql: 'ALTER TABLE users ADD COLUMN discord_id TEXT' },
            { name: 'discord_username', sql: 'ALTER TABLE users ADD COLUMN discord_username TEXT' },
            { name: 'discord_avatar', sql: 'ALTER TABLE users ADD COLUMN discord_avatar TEXT' },
            { name: 'is_discord_bound', sql: 'ALTER TABLE users ADD COLUMN is_discord_bound INTEGER DEFAULT 0' }
        ];

        let addedCount = 0;
        fieldsToAdd.forEach(field => {
            if (!existingColumns.includes(field.name)) {
                db.run(field.sql, (err) => {
                    if (err) {
                        console.error(`添加字段 ${field.name} 失败:`, err);
                    } else {
                        console.log(`✓ 已添加字段: ${field.name}`);
                        addedCount++;
                    }
                });
            } else {
                console.log(`- 字段已存在: ${field.name}`);
            }
        });

        // 添加唯一索引
        db.run("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id)", (err) => {
            if (err && !err.message.includes('already exists')) {
                console.error('创建索引失败:', err);
            } else {
                console.log('✓ Discord ID 索引已就绪');
            }
            
            setTimeout(() => {
                db.close(() => {
                    console.log(`\n迁移完成，共添加 ${addedCount} 个字段`);
                    process.exit(0);
                });
            }, 500);
        });
    });
});
*/

console.log('[migrate-add-discord-fields.js] 此脚本已停用，不再执行迁移操作');
process.exit(0);
