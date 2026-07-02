/**
 * P7-2 迁移脚本：users 表添加 nyaa_uid 列并按 username 回填
 *
 * 用法（在 database-server/ 目录下、db 容器停止时运行）：
 *   node migrate-add-nyaa-uid.js                  # 加列 + 索引 + 回填（不动密码）
 *   node migrate-add-nyaa-uid.js --drop-passwords # 二阶段：验证通过后将 password 置 NULL（弃存）
 *
 * 回填逻辑：对每个 nyaa_uid 为空的用户，调 NyaaAcount GET /project/uid?username=
 * （P6 已按 AVG username 汇入，理论上应 100% 命中）。任何缺失都会列出并以
 * 非零退出码结束，此时不应继续后续步骤。
 */

const sqlite3 = require('sqlite3').verbose();
const config = require('./config');
const { getUidByUsername } = require('./nyaacount-client');

const DROP_PASSWORDS = process.argv.includes('--drop-passwords');

const db = new sqlite3.Database(config.DB_PATH, (err) => {
    if (err) {
        console.error('数据库连接失败:', err);
        process.exit(1);
    }
    console.log('已连接到数据库:', config.DB_PATH);
});

// sqlite3 回调 API 的 Promise 封装
const all = (sql, params = []) => new Promise((res, rej) =>
    db.all(sql, params, (e, rows) => e ? rej(e) : res(rows)));
const run = (sql, params = []) => new Promise((res, rej) =>
    db.run(sql, params, function (e) { e ? rej(e) : res(this); }));

async function ensureColumn() {
    const columns = await all('PRAGMA table_info(users)');
    if (columns.some(c => c.name === 'nyaa_uid')) {
        console.log('- 字段已存在: nyaa_uid');
    } else {
        await run('ALTER TABLE users ADD COLUMN nyaa_uid INTEGER');
        console.log('✓ 已添加字段: nyaa_uid');
    }
    await run('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_nyaa_uid ON users(nyaa_uid)');
    console.log('✓ nyaa_uid 唯一索引已就绪');
}

async function backfill() {
    const users = await all('SELECT id, username FROM users WHERE nyaa_uid IS NULL');
    console.log(`\n待回填用户: ${users.length} 个`);

    const missing = [];
    let filled = 0;
    for (const u of users) {
        const r = await getUidByUsername(u.username);
        if (r.ok && r.data && r.data.uid) {
            await run('UPDATE users SET nyaa_uid = ? WHERE id = ?', [r.data.uid, u.id]);
            filled++;
            console.log(`  ✓ ${u.username} (id=${u.id}) → nyaa_uid=${r.data.uid}`);
        } else {
            missing.push(u);
            console.log(`  ✗ ${u.username} (id=${u.id}) 未命中: status=${r.status} ${JSON.stringify(r.data) || r.error}`);
        }
    }

    const total = (await all('SELECT COUNT(*) AS c FROM users'))[0].c;
    const linked = (await all('SELECT COUNT(*) AS c FROM users WHERE nyaa_uid IS NOT NULL'))[0].c;
    console.log(`\n回填结果: 本次 ${filled} 个；总计 ${linked}/${total} 已链接`);

    if (missing.length > 0) {
        console.error(`\n❌ ${missing.length} 个用户未能回填，请先在 NyaaAcount 侧核对后重跑`);
        return false;
    }
    console.log('✅ 全部用户已链接 nyaa_uid');
    return true;
}

async function dropPasswords() {
    const unlinked = (await all('SELECT COUNT(*) AS c FROM users WHERE nyaa_uid IS NULL'))[0].c;
    if (unlinked > 0) {
        console.error(`❌ 仍有 ${unlinked} 个用户没有 nyaa_uid，拒绝弃存密码`);
        return false;
    }
    const r = await run("UPDATE users SET password = NULL WHERE password IS NOT NULL");
    console.log(`✅ 已弃存本地密码: ${r.changes} 行置 NULL（登录改经 NyaaAcount 校验）`);
    return true;
}

(async () => {
    try {
        let ok;
        if (DROP_PASSWORDS) {
            ok = await dropPasswords();
        } else {
            await ensureColumn();
            ok = await backfill();
        }
        db.close(() => process.exit(ok ? 0 : 1));
    } catch (err) {
        console.error('迁移失败:', err);
        db.close(() => process.exit(1));
    }
})();
