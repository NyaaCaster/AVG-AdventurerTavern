/**
 * [已停用] Discord 字段迁移脚本（旧版本）
 * 
 * 停用日期: 2026-03-08
 * 停用原因: 账号迁移系统已关闭，不再需要添加 Discord 字段
 * 
 * 如需重新启用，取消下方代码块的注释
 */

/*
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 使用本地数据库路径
const DB_PATH = path.join(__dirname, 'data', 'database.sqlite');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('无法连接到数据库:', err);
        process.exit(1);
    }
    console.log('已连接到数据库');
});

db.serialize(() => {
    console.log('开始迁移：添加 Discord 字段...');
    
    // 添加 Discord 相关字段
    const alterStatements = [
        'ALTER TABLE users ADD COLUMN discord_id TEXT',
        'ALTER TABLE users ADD COLUMN discord_username TEXT',
        'ALTER TABLE users ADD COLUMN discord_avatar TEXT',
        'ALTER TABLE users ADD COLUMN is_discord_bound INTEGER DEFAULT 0'
    ];
    
    let completed = 0;
    alterStatements.forEach((sql, index) => {
        db.run(sql, (err) => {
            if (err && !err.message.includes('duplicate column name')) {
                console.error(`执行失败 [${index + 1}/${alterStatements.length}]:`, err.message);
            } else if (err) {
                console.log(`跳过 [${index + 1}/${alterStatements.length}]: 字段已存在`);
            } else {
                console.log(`成功 [${index + 1}/${alterStatements.length}]: ${sql}`);
            }
            
            completed++;
            if (completed === alterStatements.length) {
                // 创建索引
                db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_discord_id ON users(discord_id)', (err) => {
                    if (err) {
                        console.error('创建索引失败:', err.message);
                    } else {
                        console.log('索引创建成功');
                    }
                    
                    console.log('\n迁移完成！');
                    db.close();
                });
            }
        });
    });
});
*/

console.log('[migrate-discord.js] 此脚本已停用，不再执行迁移操作');
process.exit(0);
