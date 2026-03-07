/**
 * [已停用] 用户数据迁移脚本
 * 
 * 停用日期: 2026-03-08
 * 停用原因: 账号迁移系统已关闭，不再需要迁移用户数据
 * 
 * 如需重新启用，取消下方代码块的注释
 */

/*
const sqlite3 = require('sqlite3').verbose();
const config = require('./config');

const db = new sqlite3.Database(config.DB_PATH, (err) => {
    if (err) {
        console.error('数据库连接失败:', err);
        process.exit(1);
    }
    console.log('已连接到数据库');
});

const sourceUserId = parseInt(process.argv[2]);
const targetUserId = parseInt(process.argv[3]);

if (!sourceUserId || !targetUserId) {
    console.error('用法: node migrate-user-data.js <源用户ID> <目标用户ID>');
    console.error('例如: node migrate-user-data.js 1 112');
    process.exit(1);
}

console.log(`准备将用户 ${sourceUserId} 的数据迁移到用户 ${targetUserId}`);

db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    
    db.run(
        "UPDATE saves SET user_id = ? WHERE user_id = ?",
        [targetUserId, sourceUserId],
        function(err) {
            if (err) {
                console.error('迁移存档失败:', err);
            } else {
                console.log(`✓ 已迁移 ${this.changes} 个存档`);
            }
        }
    );
    
    db.run(
        "UPDATE character_unlocks SET user_id = ? WHERE user_id = ?",
        [targetUserId, sourceUserId],
        function(err) {
            if (err) {
                console.error('迁移角色解锁状态失败:', err);
            } else {
                console.log(`✓ 已迁移 ${this.changes} 条角色解锁记录`);
            }
        }
    );
    
    db.run(
        "UPDATE chat_messages SET user_id = ? WHERE user_id = ?",
        [targetUserId, sourceUserId],
        function(err) {
            if (err) {
                console.error('迁移聊天消息失败:', err);
            } else {
                console.log(`✓ 已迁移 ${this.changes} 条聊天消息`);
            }
        }
    );
    
    db.run(
        "UPDATE character_memories SET user_id = ? WHERE user_id = ?",
        [targetUserId, sourceUserId],
        function(err) {
            if (err) {
                console.error('迁移角色记忆失败:', err);
            } else {
                console.log(`✓ 已迁移 ${this.changes} 条角色记忆`);
            }
        }
    );
    
    db.run(
        "UPDATE sanity_ledger SET user_id = ? WHERE user_id = ?",
        [targetUserId, sourceUserId],
        function(err) {
            if (err) {
                console.error('迁移理智账本失败:', err);
            } else {
                console.log(`✓ 已迁移 ${this.changes} 条理智记录`);
            }
        }
    );
    
    db.run(
        "DELETE FROM users WHERE id = ?",
        [sourceUserId],
        function(err) {
            if (err) {
                console.error('删除旧用户失败:', err);
            } else {
                console.log(`✓ 已删除旧用户 ${sourceUserId}`);
            }
        }
    );
    
    db.run("COMMIT", (err) => {
        if (err) {
            console.error('提交事务失败:', err);
            db.run("ROLLBACK");
        } else {
            console.log('\n✅ 数据迁移完成！');
        }
        
        db.close(() => {
            process.exit(err ? 1 : 0);
        });
    });
});
*/

console.log('[migrate-user-data.js] 此脚本已停用，不再执行迁移操作');
process.exit(0);
