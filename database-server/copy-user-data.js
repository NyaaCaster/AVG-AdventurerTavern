const sqlite3 = require('sqlite3').verbose();
const config = require('./config');

const db = new sqlite3.Database(config.DB_PATH, (err) => {
    if (err) { console.error('数据库连接失败:', err); process.exit(1); }
    console.log('已连接到数据库');
});

const sourceId = parseInt(process.argv[2]) || 79;
const targetId = parseInt(process.argv[3]) || 1;
const targetUsername = process.argv[4] || null;

db.serialize(() => {
    db.run("BEGIN TRANSACTION");

    db.run(
        targetUsername
            ? `INSERT INTO users (id, username, password, created_at, is_discord_bound)
               SELECT ?, ?, password, created_at, 0 FROM users WHERE id = ?`
            : `INSERT INTO users (id, username, password, created_at, is_discord_bound)
               SELECT ?, username, password, created_at, 0 FROM users WHERE id = ?`,
        targetUsername ? [targetId, targetUsername, sourceId] : [targetId, sourceId],
        function(err) {
            if (err) console.error('创建用户失败:', err.message);
            else console.log('✓ 创建用户', targetUsername, '(id=' + targetId + ')');
        }
    );

    db.run(
        `INSERT INTO saves (user_id, slot_id, label, data, updated_at)
         SELECT ?, slot_id, label, data, updated_at FROM saves WHERE user_id = ?`,
        [targetId, sourceId],
        function(err) {
            if (err) console.error('复制存档失败:', err.message);
            else console.log('✓ 复制存档:', this.changes, '条');
        }
    );

    db.run(
        `INSERT INTO character_unlocks (user_id, slot_id, character_id,
         accept_battle_party, accept_flirt_topic, accept_nsfw_topic,
         accept_physical_contact, accept_indirect_sexual, accept_become_lover,
         accept_direct_sexual, accept_sexual_partner, accept_public_exposure,
         accept_public_sexual, accept_group_sexual, accept_prostitution,
         accept_sexual_slavery, updated_at)
         SELECT ?, slot_id, character_id,
         accept_battle_party, accept_flirt_topic, accept_nsfw_topic,
         accept_physical_contact, accept_indirect_sexual, accept_become_lover,
         accept_direct_sexual, accept_sexual_partner, accept_public_exposure,
         accept_public_sexual, accept_group_sexual, accept_prostitution,
         accept_sexual_slavery, updated_at
         FROM character_unlocks WHERE user_id = ?`,
        [targetId, sourceId],
        function(err) {
            if (err) console.error('复制解锁失败:', err.message);
            else console.log('✓ 复制解锁:', this.changes, '条');
        }
    );

    db.run(
        `INSERT INTO chat_messages (user_id, slot_id, character_id, role, content, created_at)
         SELECT ?, slot_id, character_id, role, content, created_at
         FROM chat_messages WHERE user_id = ?`,
        [targetId, sourceId],
        function(err) {
            if (err) console.error('复制聊天失败:', err.message);
            else console.log('✓ 复制聊天:', this.changes, '条');
        }
    );

    db.run(
        `INSERT INTO character_memories (user_id, slot_id, character_id, memory_type, content, created_at)
         SELECT ?, slot_id, character_id, memory_type, content, created_at
         FROM character_memories WHERE user_id = ?`,
        [targetId, sourceId],
        function(err) {
            if (err) console.error('复制记忆失败:', err.message);
            else console.log('✓ 复制记忆:', this.changes, '条');
        }
    );

    db.run(
        `INSERT INTO sanity_ledger (user_id, type, amount, description, client_ip, created_at)
         SELECT ?, type, amount, description, client_ip, created_at
         FROM sanity_ledger WHERE user_id = ?`,
        [targetId, sourceId],
        function(err) {
            if (err) console.error('复制理智失败:', err.message);
            else console.log('✓ 复制理智:', this.changes, '条');
        }
    );

    db.run("COMMIT", (err) => {
        if (err) {
            console.error('提交失败:', err);
            db.run("ROLLBACK");
        } else {
            console.log('\n✅ 数据复制完成');
        }
        db.close(() => process.exit(err ? 1 : 0));
    });
});