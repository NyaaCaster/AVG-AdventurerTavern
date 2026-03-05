const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');
const config = require('./config'); // 引入配置文件
const discordAuth = require('./discord-auth'); // Discord 认证模块

const app = express();
const PORT = config.PORT;

// Middleware
// 使用配置文件中的 CORS 设置
app.use(cors(config.CORS_CONFIG));

app.use(bodyParser.json({ limit: '50mb' })); // 增加限制以支持大存档

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Database Setup
// 使用配置文件中的数据库路径
const db = new sqlite3.Database(config.DB_PATH, (err) => {
    if (err) {
        console.error('Could not connect to database at ' + config.DB_PATH, err);
    } else {
        console.log('Connected to SQLite database at ' + config.DB_PATH);
    }
});

// Init Tables
db.serialize(() => {
    // 用户表
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        discord_id TEXT UNIQUE,
        discord_username TEXT,
        discord_avatar TEXT,
        is_discord_bound INTEGER DEFAULT 0,
        created_at INTEGER
    )`);

    // 存档表 (简化结构，直接存储 JSON 字符串)
    db.run(`CREATE TABLE IF NOT EXISTS saves (
        user_id INTEGER,
        slot_id INTEGER,
        label TEXT,
        data TEXT, 
        updated_at INTEGER,
        PRIMARY KEY (user_id, slot_id)
    )`);

    // 角色状态解锁表
    db.run(`CREATE TABLE IF NOT EXISTS character_unlocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        slot_id INTEGER NOT NULL,
        character_id TEXT NOT NULL,
        accept_battle_party INTEGER DEFAULT 0,
        accept_flirt_topic INTEGER DEFAULT 0,
        accept_nsfw_topic INTEGER DEFAULT 0,
        accept_physical_contact INTEGER DEFAULT 0,
        accept_indirect_sexual INTEGER DEFAULT 0,
        accept_become_lover INTEGER DEFAULT 0,
        accept_direct_sexual INTEGER DEFAULT 0,
        accept_sexual_partner INTEGER DEFAULT 0,
        accept_public_exposure INTEGER DEFAULT 0,
        accept_public_sexual INTEGER DEFAULT 0,
        accept_group_sexual INTEGER DEFAULT 0,
        accept_prostitution INTEGER DEFAULT 0,
        accept_sexual_slavery INTEGER DEFAULT 0,
        accept_bathing_together INTEGER DEFAULT 0,
        accept_player_massage INTEGER DEFAULT 0,
        accept_character_massage INTEGER DEFAULT 0,
        updated_at INTEGER NOT NULL,
        UNIQUE(user_id, slot_id, character_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // 为角色状态表创建索引以提高查询性能
    db.run(`CREATE INDEX IF NOT EXISTS idx_character_unlocks_user_slot 
            ON character_unlocks(user_id, slot_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_character_unlocks_character 
            ON character_unlocks(character_id)`);

    // ----------------- 新增：AI 聊天系统数据表 -----------------

    // 对话历史表 (短期工作记忆)
    db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        slot_id INTEGER NOT NULL,
        character_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // 长期记忆表 (核心事实与摘要)
    db.run(`CREATE TABLE IF NOT EXISTS character_memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        slot_id INTEGER NOT NULL,
        character_id TEXT NOT NULL,
        memory_type TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // 为聊天和记忆表创建索引以提高查询性能
    db.run(`CREATE INDEX IF NOT EXISTS idx_chat_messages 
            ON chat_messages(user_id, slot_id, character_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_character_memories 
            ON character_memories(user_id, slot_id, character_id)`);

    // ----------------- 理智用量总表（全局，不随用户数据删除）-----------------
    // 注意：本表故意不设 FOREIGN KEY，防止删除用户时级联清除计费记录
    //
    // amount 符号规则：
    //   负数 = 消耗（用户使用功能扣除）
    //   正数 = 收入（充值 / 奖励 / 退款）
    //
    // type 为自由文本字段，无枚举约束，随时新增类型无需改表。
    // 已约定类型（见 services/db.ts 的 SanityConsumeType / SanityRechargeType）：
    //
    //   消耗类（负值）：
    //     'ai_memory'   - 对话记忆写入（amount = 本条消息字符数，观测期原始数据）
    //     'ai_summary'  - 摘要压缩（amount = 被压缩的所有消息字符数合计，观测期原始数据）
    //
    //   收入类（正值）：
    //     'recharge'    - 用户付费充值
    //
    // 新增类型只需在 services/db.ts 的联合类型末尾追加字符串字面量即可。
    db.run(`CREATE TABLE IF NOT EXISTS sanity_ledger (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id     INTEGER NOT NULL,
        type        TEXT    NOT NULL,
        amount      REAL    NOT NULL,
        description TEXT,
        client_ip   TEXT,
        created_at  INTEGER NOT NULL
    )`);

    // 按用户查账常用，单独建索引；created_at 用于时间范围查询
    db.run(`CREATE INDEX IF NOT EXISTS idx_sanity_ledger_user
            ON sanity_ledger(user_id, created_at DESC)`);
    // type 索引，方便按类型统计
    db.run(`CREATE INDEX IF NOT EXISTS idx_sanity_ledger_type
            ON sanity_ledger(type, created_at DESC)`);
});

// API Routes

// 健康检查和状态端点 (GET请求，可通过浏览器直接访问)
app.get('/api/health', (req, res) => {
    const startTime = Date.now();
    
    // 测试数据库连接
    db.get("SELECT COUNT(*) as userCount FROM users", [], (err, userRow) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                message: '数据库连接失败',
                error: err.message,
                timestamp: new Date().toISOString()
            });
        }
        
        db.get("SELECT COUNT(*) as saveCount FROM saves", [], (err2, saveRow) => {
            if (err2) {
                return res.status(500).json({
                    status: 'error',
                    message: '数据库查询失败',
                    error: err2.message,
                    timestamp: new Date().toISOString()
                });
            }
            
            const responseTime = Date.now() - startTime;
            
            res.json({
                status: 'ok',
                message: '后端服务运行正常',
                service: 'AdventurerTavern Backend',
                version: '1.0.0',
                database: {
                    status: 'connected',
                    path: config.DB_PATH,
                    users: userRow.userCount,
                    saves: saveRow.saveCount
                },
                server: {
                    port: PORT,
                    uptime: process.uptime(),
                    memory: {
                        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
                        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
                    },
                    responseTime: responseTime + 'ms'
                },
                timestamp: new Date().toISOString()
            });
        });
    });
});

// 根路径重定向到健康检查
app.get('/', (req, res) => {
    res.redirect('/api/health');
});

// 1. 注册 (已关闭，仅通过 Discord 注册)
// app.post('/api/register', (req, res) => {
//     const { username, password } = req.body;
//     const stmt = db.prepare("INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)");
//     stmt.run(username, password, Date.now(), function(err) {
//         if (err) {
//             if (err.message.includes('UNIQUE constraint failed')) {
//                 return res.json({ success: false, message: '用户名已存在' });
//             }
//             return res.json({ success: false, message: err.message });
//         }
//         const newUid = this.lastID;
//         // 新账号注册时，赠送初始理智 10000
//         const initStmt = db.prepare(
//             `INSERT INTO sanity_ledger (user_id, type, amount, description, client_ip, created_at)
//              VALUES (?, 'recharge', 100000, '新账号注册赠送', ?, ?)`
//         );
//         initStmt.run(newUid, getClientIp(req), Date.now(), function(initErr) {
//             if (initErr) console.error('[Sanity] 初始赠送写入失败:', initErr.message);
//         });
//         initStmt.finalize();
//         res.json({ success: true, uid: newUid });
//     });
//     stmt.finalize();
// });

// 2. 登录
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT id, password, is_discord_bound FROM users WHERE username = ?", [username], (err, row) => {
        if (err) return res.json({ success: false, message: '服务器错误' });
        if (!row) return res.json({ success: false, message: '用户名不存在' });
        if (row.password !== password) return res.json({ success: false, message: '密码错误' });
        
        res.json({ 
            success: true, 
            uid: row.id,
            needDiscordBind: config.AUTH.FORCE_DISCORD_BIND && !row.is_discord_bound
        });
    });
});

// 2.1 获取认证配置
app.get('/api/auth/config', (req, res) => {
    res.json({
        success: true,
        enablePasswordLogin: config.AUTH.ENABLE_PASSWORD_LOGIN,
        forceDiscordBind: config.AUTH.FORCE_DISCORD_BIND
    });
});

// 2.2 Discord 登录 - 获取授权 URL
app.get('/api/auth/discord', (req, res) => {
    try {
        const authUrl = discordAuth.getDiscordAuthUrl();
        res.json({ success: true, url: authUrl });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2.3 Discord 回调处理
app.get('/auth/discord/callback', async (req, res) => {
    const { code, error } = req.query;
    
    if (error) {
        return res.redirect(`${config.FRONTEND_URL}?discord_error=${encodeURIComponent(error)}`);
    }
    
    if (!code) {
        return res.redirect(`${config.FRONTEND_URL}?discord_error=no_code`);
    }
    
    try {
        // 1. 用授权码换取访问令牌
        const tokenData = await discordAuth.exchangeCode(code);
        
        // 2. 获取用户信息
        const discordUser = await discordAuth.getDiscordUser(tokenData.access_token);
        
        // 3. 检查用户是否在服务器中
        const isMember = await discordAuth.checkGuildMembership(discordUser.id);
        
        if (!isMember) {
            return res.redirect(`${config.FRONTEND_URL}?discord_error=not_in_guild`);
        }
        
        // 4. 查找或创建用户
        db.get(
            "SELECT id, username, is_discord_bound FROM users WHERE discord_id = ?",
            [discordUser.id],
            (err, existingUser) => {
                if (err) {
                    console.error('数据库查询错误:', err);
                    return res.redirect(`${config.FRONTEND_URL}?discord_error=db_error`);
                }
                
                if (existingUser) {
                    // 用户已存在，直接登录
                    return res.redirect(`${config.FRONTEND_URL}?discord_login=success&uid=${existingUser.id}`);
                }
                
                // 新用户，创建账号
                const username = discordUser.username;
                const stmt = db.prepare(
                    `INSERT INTO users (username, discord_id, discord_username, discord_avatar, is_discord_bound, created_at) 
                     VALUES (?, ?, ?, ?, 1, ?)`
                );
                
                stmt.run(
                    username,
                    discordUser.id,
                    discordUser.username,
                    discordUser.avatar,
                    Date.now(),
                    function(err) {
                        if (err) {
                            console.error('创建用户失败:', err);
                            return res.redirect(`${config.FRONTEND_URL}?discord_error=create_failed`);
                        }
                        
                        const newUid = this.lastID;
                        
                        // 赠送初始理智
                        const initStmt = db.prepare(
                            `INSERT INTO sanity_ledger (user_id, type, amount, description, client_ip, created_at)
                             VALUES (?, 'recharge', 100000, 'Discord新账号注册赠送', ?, ?)`
                        );
                        initStmt.run(newUid, getClientIp(req), Date.now());
                        initStmt.finalize();
                        
                        res.redirect(`${config.FRONTEND_URL}?discord_login=success&uid=${newUid}&new_user=true`);
                    }
                );
                stmt.finalize();
            }
        );
    } catch (error) {
        console.error('Discord 认证错误:', error);
        res.redirect(`${config.FRONTEND_URL}?discord_error=${encodeURIComponent(error.message)}`);
    }
});

// 2.4 绑定 Discord 到现有账号
app.post('/api/auth/discord/bind', async (req, res) => {
    const { userId, code } = req.body;
    
    if (!userId || !code) {
        return res.json({ success: false, message: '缺少必需参数' });
    }
    
    try {
        // 1. 用授权码换取访问令牌
        const tokenData = await discordAuth.exchangeCode(code);
        
        // 2. 获取用户信息
        const discordUser = await discordAuth.getDiscordUser(tokenData.access_token);
        
        // 3. 检查用户是否在服务器中
        const isMember = await discordAuth.checkGuildMembership(discordUser.id);
        
        if (!isMember) {
            return res.json({ success: false, message: '您不在指定的 Discord 服务器中' });
        }
        
        // 4. 检查该 Discord 账号是否已绑定其他账号
        db.get(
            "SELECT id FROM users WHERE discord_id = ? AND id != ?",
            [discordUser.id, userId],
            (err, existingUser) => {
                if (err) {
                    return res.json({ success: false, message: '数据库错误' });
                }
                
                if (existingUser) {
                    return res.json({ success: false, message: '该 Discord 账号已绑定其他游戏账号' });
                }
                
                // 5. 绑定 Discord 账号
                db.run(
                    `UPDATE users 
                     SET discord_id = ?, discord_username = ?, discord_avatar = ?, is_discord_bound = 1 
                     WHERE id = ?`,
                    [discordUser.id, discordUser.username, discordUser.avatar, userId],
                    function(err) {
                        if (err) {
                            return res.json({ success: false, message: '绑定失败' });
                        }
                        
                        res.json({ 
                            success: true, 
                            message: '绑定成功',
                            discordUsername: discordUser.username
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error('Discord 绑定错误:', error);
        res.json({ success: false, message: error.message });
    }
});

// 2.5 迁移旧账号数据到 Discord 账号
app.post('/api/auth/discord/migrate', (req, res) => {
    const { newUserId, oldUsername, oldPassword } = req.body;
    
    if (!newUserId || !oldUsername || !oldPassword) {
        return res.json({ success: false, message: '缺少必需参数' });
    }
    
    // 1. 验证旧账号
    db.get(
        "SELECT id, password FROM users WHERE username = ? AND discord_id IS NULL",
        [oldUsername],
        (err, oldUser) => {
            if (err) {
                return res.json({ success: false, message: '数据库错误' });
            }
            
            if (!oldUser) {
                return res.json({ success: false, message: '旧账号不存在或已绑定Discord' });
            }
            
            if (oldUser.password !== oldPassword) {
                return res.json({ success: false, message: '密码错误' });
            }
            
            // 2. 迁移数据
            const sourceUserId = oldUser.id;
            const targetUserId = newUserId;
            
            db.serialize(() => {
                db.run("BEGIN TRANSACTION");
                
                db.run("UPDATE saves SET user_id = ? WHERE user_id = ?", [targetUserId, sourceUserId]);
                db.run("UPDATE character_unlocks SET user_id = ? WHERE user_id = ?", [targetUserId, sourceUserId]);
                db.run("UPDATE chat_messages SET user_id = ? WHERE user_id = ?", [targetUserId, sourceUserId]);
                db.run("UPDATE character_memories SET user_id = ? WHERE user_id = ?", [targetUserId, sourceUserId]);
                db.run("UPDATE sanity_ledger SET user_id = ? WHERE user_id = ?", [targetUserId, sourceUserId]);
                db.run("DELETE FROM users WHERE id = ?", [sourceUserId]);
                
                db.run("COMMIT", (err) => {
                    if (err) {
                        console.error('迁移失败:', err);
                        db.run("ROLLBACK");
                        return res.json({ success: false, message: '迁移失败' });
                    }
                    
                    console.log(`成功迁移用户 ${sourceUserId} 的数据到用户 ${targetUserId}`);
                    res.json({ success: true, message: '数据迁移成功' });
                });
            });
        }
    );
});

// 2.6 检查用户 Discord 绑定状态
app.post('/api/auth/discord/status', (req, res) => {
    const { userId } = req.body;
    
    if (!userId) {
        return res.json({ success: false, message: '缺少 userId' });
    }
    
    db.get(
        "SELECT discord_id, discord_username, is_discord_bound FROM users WHERE id = ?",
        [userId],
        (err, row) => {
            if (err) {
                return res.json({ success: false, message: '数据库错误' });
            }
            
            if (!row) {
                return res.json({ success: false, message: '用户不存在' });
            }
            
            res.json({
                success: true,
                isBound: !!row.is_discord_bound,
                discordUsername: row.discord_username
            });
        }
    );
});

// 3. 上传存档 (Save)
app.post('/api/save', (req, res) => {
    const { userId, slotId, label, data } = req.body;
    const dataStr = JSON.stringify(data);
    const timestamp = Date.now();

    // 使用 INSERT OR REPLACE 实现"存在即更新，不存在即插入"
    const stmt = db.prepare(`
        INSERT OR REPLACE INTO saves (user_id, slot_id, label, data, updated_at)
        VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(userId, slotId, label, dataStr, timestamp, function(err) {
        if (err) return res.json({ success: false, message: err.message });
        res.json({ success: true });
    });
    stmt.finalize();
});

// 4. 下载存档 (Load)
app.post('/api/load', (req, res) => {
    const { userId, slotId } = req.body;
    db.get("SELECT data FROM saves WHERE user_id = ? AND slot_id = ?", [userId, slotId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.json({ success: false, data: null });
        
        try {
            const data = JSON.parse(row.data);
            res.json({ success: true, data });
        } catch (e) {
            res.json({ success: false, message: "存档损坏" });
        }
    });
});

// 5. 获取存档列表
app.post('/api/slots', (req, res) => {
    const { userId } = req.body;
    db.all("SELECT slot_id, label, data, updated_at FROM saves WHERE user_id = ?", [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const slots = rows.map(row => {
            try {
                const data = JSON.parse(row.data);
                return {
                    slotId: row.slot_id,
                    label: row.label,
                    savedAt: row.updated_at,
                    gold: data.gold || 0,
                    currentSceneId: data.currentSceneId || '',
                    worldState: data.worldState || { dateStr: '', timeStr: '', sceneName: '' },
                    characterStats: data.characterStats || {},
                    checkedInCharacters: data.checkedInCharacters,
                    sceneLevels: data.sceneLevels
                };
            } catch (e) {
                // 如果解析失败，返回默认值
                return {
                    slotId: row.slot_id,
                    label: row.label,
                    savedAt: row.updated_at,
                    gold: 0,
                    currentSceneId: '',
                    worldState: { dateStr: '', timeStr: '', sceneName: '数据损坏' },
                    characterStats: {},
                    checkedInCharacters: undefined,
                    sceneLevels: undefined
                };
            }
        });
        res.json({ success: true, slots });
    });
});

// 6. 删除存档
app.post('/api/delete', (req, res) => {
    const { userId, slotId } = req.body;
    const stmt = db.prepare("DELETE FROM saves WHERE user_id = ? AND slot_id = ?");
    stmt.run(userId, slotId, function(err) {
        if (err) return res.json({ success: false, message: err.message });
        
        // 级联删除相关联的聊天和记忆数据
        const stmtChats = db.prepare("DELETE FROM chat_messages WHERE user_id = ? AND slot_id = ?");
        stmtChats.run(userId, slotId);
        stmtChats.finalize();
        
        const stmtMemories = db.prepare("DELETE FROM character_memories WHERE user_id = ? AND slot_id = ?");
        stmtMemories.run(userId, slotId);
        stmtMemories.finalize();
        
        res.json({ success: true });
    });
    stmt.finalize();
});

// ----------------- 新增：AI 记忆与聊天系统 API -----------------

// 6.1 获取角色聊天历史 (短期记忆)
app.post('/api/chat/messages/get', (req, res) => {
    const { userId, slotId, characterId, limit = 20 } = req.body;
    db.all(
        `SELECT role, content, created_at FROM chat_messages 
         WHERE user_id = ? AND slot_id = ? AND character_id = ?
         ORDER BY created_at DESC LIMIT ?`,
        [userId, slotId, characterId, limit],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, messages: rows.reverse() });
        }
    );
});

// 6.2 记录一条新对话
app.post('/api/chat/messages/add', (req, res) => {
    const { userId, slotId, characterId, role, content } = req.body;
    const stmt = db.prepare(`INSERT INTO chat_messages (user_id, slot_id, character_id, role, content, created_at) VALUES (?, ?, ?, ?, ?, ?)`);
    stmt.run(userId, slotId, characterId, role, content, Date.now(), function(err) {
        if (err) return res.json({ success: false, message: err.message });
        res.json({ success: true, id: this.lastID });
    });
    stmt.finalize();
});

// 6.3 获取角色核心记忆 (长期记忆)
app.post('/api/chat/memories/get', (req, res) => {
    const { userId, slotId, characterId } = req.body;
    db.all(
        `SELECT memory_type, content, created_at FROM character_memories 
         WHERE user_id = ? AND slot_id = ? AND character_id = ?
         ORDER BY created_at ASC`,
        [userId, slotId, characterId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, memories: rows });
        }
    );
});

// 6.4 批量添加核心记忆
app.post('/api/chat/memories/add_batch', (req, res) => {
    const { userId, slotId, characterId, memories, type = 'core_fact' } = req.body;
    if (!memories || !Array.isArray(memories) || memories.length === 0) {
        return res.json({ success: true });
    }

    const stmt = db.prepare(`INSERT INTO character_memories (user_id, slot_id, character_id, memory_type, content, created_at) VALUES (?, ?, ?, ?, ?, ?)`);
    const now = Date.now();
    
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        memories.forEach(content => {
            stmt.run(userId, slotId, characterId, type, content, now);
        });
        db.run("COMMIT", (err) => {
            if (err) return res.json({ success: false, message: err.message });
            res.json({ success: true });
        });
    });
    stmt.finalize();
});

// 6.5 存档时同步复制对话和记忆 (解决读档覆盖/时空错乱问题)
app.post('/api/chat/sync_slot', (req, res) => {
    const { userId, sourceSlotId, targetSlotId } = req.body;
    
    if (sourceSlotId === targetSlotId) return res.json({ success: true });

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        
        db.run("DELETE FROM chat_messages WHERE user_id = ? AND slot_id = ?", [userId, targetSlotId]);
        db.run("DELETE FROM character_memories WHERE user_id = ? AND slot_id = ?", [userId, targetSlotId]);

        db.run(`INSERT INTO chat_messages (user_id, slot_id, character_id, role, content, created_at)
                SELECT user_id, ?, character_id, role, content, created_at FROM chat_messages 
                WHERE user_id = ? AND slot_id = ?`, [targetSlotId, userId, sourceSlotId]);

        db.run(`INSERT INTO character_memories (user_id, slot_id, character_id, memory_type, content, created_at)
                SELECT user_id, ?, character_id, memory_type, content, created_at FROM character_memories 
                WHERE user_id = ? AND slot_id = ?`, [targetSlotId, userId, sourceSlotId]);

        db.run("COMMIT", (err) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true });
        });
    });
});

// 6.6 更新角色的历史摘要 (滚动更新)
app.post('/api/chat/summary/update', (req, res) => {
    const { userId, slotId, characterId, summaryText } = req.body;
    
    if (!userId || slotId === undefined || !characterId || !summaryText) {
        return res.json({ success: false, message: '缺少必需参数' });
    }

    const now = Date.now();

    // 先尝试更新现有的 summary
    db.run(
        `UPDATE character_memories 
         SET content = ?, created_at = ? 
         WHERE user_id = ? AND slot_id = ? AND character_id = ? AND memory_type = 'summary'`,
        [summaryText, now, userId, slotId, characterId],
        function(err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            
            // 如果没有更新任何行，说明还没有 summary，需要插入
            if (this.changes === 0) {
                const stmt = db.prepare(
                    `INSERT INTO character_memories (user_id, slot_id, character_id, memory_type, content, created_at) 
                     VALUES (?, ?, ?, 'summary', ?, ?)`
                );
                stmt.run(userId, slotId, characterId, summaryText, now, function(err) {
                    if (err) return res.status(500).json({ success: false, message: err.message });
                    res.json({ success: true, message: '摘要已创建' });
                });
                stmt.finalize();
            } else {
                res.json({ success: true, message: '摘要已更新' });
            }
        }
    );
});

// 6.7 删除已总结的旧对话记录
app.post('/api/chat/messages/delete_old', (req, res) => {
    const { userId, slotId, characterId, beforeTimestamp } = req.body;
    
    if (!userId || slotId === undefined || !characterId || !beforeTimestamp) {
        return res.json({ success: false, message: '缺少必需参数' });
    }

    db.run(
        `DELETE FROM chat_messages 
         WHERE user_id = ? AND slot_id = ? AND character_id = ? AND created_at <= ?`,
        [userId, slotId, characterId, beforeTimestamp],
        function(err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, deletedCount: this.changes });
        }
    );
});

// ----------------- 理智账本 API -----------------

// 辅助函数：从请求中提取真实客户端 IP
function getClientIp(req) {
    // 优先读反向代理注入的头（Nginx / CDN 场景）
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        // X-Forwarded-For 可能包含多个 IP，取第一个（最原始的客户端）
        return forwarded.split(',')[0].trim();
    }
    return req.socket?.remoteAddress || req.ip || null;
}

    // S-1. 记录理智消耗（负值，由业务逻辑调用）
// type 参见 services/db.ts → SanityConsumeType
app.post('/api/sanity/consume', (req, res) => {
    const { userId, type, amount, description } = req.body;

    if (!userId || !type || amount === undefined) {
        return res.json({ success: false, message: '缺少必需参数: userId, type, amount' });
    }
    if (typeof amount !== 'number' || amount <= 0) {
        return res.json({ success: false, message: 'amount 必须为正数（系统自动转为负值记账）' });
    }

    const clientIp = getClientIp(req);
    const realAmount = -Math.abs(amount); // 消耗强制为负

    const stmt = db.prepare(
        `INSERT INTO sanity_ledger (user_id, type, amount, description, client_ip, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
    );
    stmt.run(userId, type, realAmount, description || null, clientIp, Date.now(), function(err) {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, id: this.lastID, amount: realAmount });
    });
    stmt.finalize();
});

// S-2. 记录理智充值/赠送（正值，由管理员或支付回调调用）
// type 参见 services/db.ts → SanityRechargeType
app.post('/api/sanity/recharge', (req, res) => {
    const { userId, type, amount, description } = req.body;

    if (!userId || !type || amount === undefined) {
        return res.json({ success: false, message: '缺少必需参数: userId, type, amount' });
    }
    if (typeof amount !== 'number' || amount <= 0) {
        return res.json({ success: false, message: 'amount 必须为正数' });
    }

    const clientIp = getClientIp(req);
    const realAmount = Math.abs(amount); // 充值强制为正

    const stmt = db.prepare(
        `INSERT INTO sanity_ledger (user_id, type, amount, description, client_ip, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
    );
    stmt.run(userId, type, realAmount, description || null, clientIp, Date.now(), function(err) {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, id: this.lastID, amount: realAmount });
    });
    stmt.finalize();
});

// S-3. 查询用户理智余额 + 最近明细
app.post('/api/sanity/balance', (req, res) => {
    const { userId, limit = 20 } = req.body;

    if (!userId) {
        return res.json({ success: false, message: '缺少必需参数: userId' });
    }

    // 先查总余额（所有记录的 amount 求和）
    db.get(
        `SELECT COALESCE(SUM(amount), 0) AS balance FROM sanity_ledger WHERE user_id = ?`,
        [userId],
        (err, balanceRow) => {
            if (err) return res.status(500).json({ success: false, message: err.message });

            // 再查最近明细
            db.all(
                `SELECT id, type, amount, description, client_ip, created_at
                 FROM sanity_ledger
                 WHERE user_id = ?
                 ORDER BY created_at DESC
                 LIMIT ?`,
                [userId, limit],
                (err2, rows) => {
                    if (err2) return res.status(500).json({ success: false, message: err2.message });
                    res.json({
                        success: true,
                        balance: balanceRow.balance,
                        records: rows
                    });
                }
            );
        }
    );
});

// S-4. 用户面板概况：获取今日汇总和7天图表
app.post('/api/sanity/dashboard', (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.json({ success: false, message: '缺少 userId' });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = todayStart - 6 * 24 * 60 * 60 * 1000;

                                        // 1. 今日请求次数和AI消耗
      db.get(
          `SELECT COUNT(*) AS todayRequests,
           COALESCE(SUM(CASE WHEN type IN ('ai_memory', 'ai_summary') THEN amount ELSE 0 END), 0) AS todayAiConsumed
           FROM sanity_ledger
           WHERE user_id = ? AND amount < 0 AND created_at >= ?`,
        [userId, todayStart],
        (err, todayRow) => {
            if (err) return res.status(500).json({ success: false, message: err.message });

                                    // 2. 过去7天图表数据 (按天分组)
            db.all(
                `SELECT 
                    strftime('%m-%d', datetime(created_at / 1000, 'unixepoch', 'localtime')) AS dateStr,
                    COALESCE(SUM(ABS(amount)), 0) AS dailyConsumed,
                    COALESCE(SUM(CASE WHEN type IN ('ai_memory', 'ai_summary') THEN ABS(amount) ELSE 0 END), 0) AS dailyAiConsumed
                 FROM sanity_ledger
                 WHERE user_id = ? AND amount < 0 AND created_at >= ?
                 GROUP BY date(created_at / 1000, 'unixepoch', 'localtime')
                 ORDER BY created_at ASC`,
                [userId, sevenDaysAgo],
                (err2, chartRows) => {
                    if (err2) return res.status(500).json({ success: false, message: err2.message });

                                                            // 补齐 7 天的数据
                    const chartMap = {};
                    chartRows.forEach(row => {
                        chartMap[row.dateStr] = {
                            amount: row.dailyConsumed,
                            aiAmount: row.dailyAiConsumed
                        };
                    });

                                        const chartData = [];
                    for (let i = 6; i >= 0; i--) {
                        const d = new Date(todayStart - i * 24 * 60 * 60 * 1000);
                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                        const dd = String(d.getDate()).padStart(2, '0');
                        const key = `${mm}-${dd}`;
                        const dayData = chartMap[key] || { amount: 0, aiAmount: 0 };
                        chartData.push({
                            date: key,
                            amount: dayData.amount,
                            aiAmount: dayData.aiAmount
                        });
                    }

                                                            res.json({
                        success: true,
                        todayRequests: todayRow.todayRequests,
                        chartData
                    });
                }
            );
        }
    );
});

// S-5. 管理/用户端：全量明细查询（支持分类/时间范围，分页）
app.post('/api/sanity/admin/records', (req, res) => {
    const { userId, type, category, startTime, endTime, page = 1, pageSize = 50 } = req.body;

    const conditions = [];
    const params = [];

    if (userId)    { conditions.push('user_id = ?');       params.push(userId); }
    if (type)      { conditions.push('type = ?');           params.push(type); }
    if (category === 'consume')  { conditions.push('amount < 0'); }
    if (category === 'recharge') { conditions.push('amount > 0'); }
    if (startTime) { conditions.push('created_at >= ?');   params.push(startTime); }
    if (endTime)   { conditions.push('created_at <= ?');   params.push(endTime); }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const offset = (page - 1) * pageSize;

    // 先查总条数
    db.get(
        `SELECT COUNT(*) AS total, COALESCE(SUM(amount), 0) AS total_amount
         FROM sanity_ledger ${where}`,
        params,
        (err, countRow) => {
            if (err) return res.status(500).json({ success: false, message: err.message });

            // 再查分页数据
            db.all(
                `SELECT id, user_id, type, amount, description, client_ip, created_at
                 FROM sanity_ledger ${where}
                 ORDER BY created_at DESC
                 LIMIT ? OFFSET ?`,
                [...params, pageSize, offset],
                (err2, rows) => {
                    if (err2) return res.status(500).json({ success: false, message: err2.message });
                    res.json({
                        success: true,
                        total: countRow.total,
                        totalAmount: countRow.total_amount,
                        page,
                        pageSize,
                        records: rows
                    });
                }
            );
        }
    );
});

// --- 角色解锁状态 API ---

// 7. 获取单个角色的解锁状态
app.post('/api/character_unlocks/get', (req, res) => {
    const { userId, slotId, characterId } = req.body;
    
    if (!userId || slotId === undefined || !characterId) {
        return res.json({ 
            success: false, 
            message: '缺少必需参数: userId, slotId, characterId' 
        });
    }
    
    db.get(
        `SELECT 
            accept_battle_party,
            accept_flirt_topic,
            accept_nsfw_topic,
            accept_physical_contact,
            accept_indirect_sexual,
            accept_become_lover,
            accept_direct_sexual,
            accept_sexual_partner,
            accept_public_exposure,
            accept_public_sexual,
            accept_group_sexual,
            accept_prostitution,
            accept_sexual_slavery,
            accept_bathing_together,
            accept_player_massage,
            accept_character_massage
        FROM character_unlocks 
        WHERE user_id = ? AND slot_id = ? AND character_id = ?`,
        [userId, slotId, characterId],
        (err, row) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: '数据库查询错误: ' + err.message 
                });
            }
            
            if (!row) {
                return res.json({
                    success: true,
                    unlocks: {
                        accept_battle_party: 0,
                        accept_flirt_topic: 0,
                        accept_nsfw_topic: 0,
                        accept_physical_contact: 0,
                        accept_indirect_sexual: 0,
                        accept_become_lover: 0,
                        accept_direct_sexual: 0,
                        accept_sexual_partner: 0,
                        accept_public_exposure: 0,
                        accept_public_sexual: 0,
                        accept_group_sexual: 0,
                        accept_prostitution: 0,
                        accept_sexual_slavery: 0,
                        accept_bathing_together: 0,
                        accept_player_massage: 0,
                        accept_character_massage: 0
                    }
                });
            }
            
            res.json({ success: true, unlocks: row });
        }
    );
});

// 8. 更新角色解锁状态
app.post('/api/character_unlocks/update', (req, res) => {
    const { userId, slotId, characterId, unlocks } = req.body;
    
    if (!userId || slotId === undefined || !characterId || !unlocks) {
        return res.json({ 
            success: false, 
            message: '缺少必需参数: userId, slotId, characterId, unlocks' 
        });
    }
    
    if (typeof unlocks !== 'object') {
        return res.json({ 
            success: false, 
            message: 'unlocks 必须是对象' 
        });
    }
    
    const timestamp = Date.now();
    
    const validFields = [
        'accept_battle_party',
        'accept_flirt_topic',
        'accept_nsfw_topic',
        'accept_physical_contact',
        'accept_indirect_sexual',
        'accept_become_lover',
        'accept_direct_sexual',
        'accept_sexual_partner',
        'accept_public_exposure',
        'accept_public_sexual',
        'accept_group_sexual',
        'accept_prostitution',
        'accept_sexual_slavery',
        'accept_bathing_together',
        'accept_player_massage',
        'accept_character_massage'
    ];
    
    const updateFields = [];
    const updateValues = [];
    
    for (const field of validFields) {
        if (unlocks.hasOwnProperty(field)) {
            const value = unlocks[field];
            if (value !== 0 && value !== 1) {
                return res.json({ 
                    success: false, 
                    message: `字段 ${field} 的值必须是 0 或 1` 
                });
            }
            updateFields.push(`${field} = ?`);
            updateValues.push(value);
        }
    }
    
    if (updateFields.length === 0) {
        return res.json({ 
            success: false, 
            message: '没有有效的更新字段' 
        });
    }
    
    updateFields.push('updated_at = ?');
    updateValues.push(timestamp);
    
    updateValues.push(userId, slotId, characterId);
    
    const updateSql = `
        UPDATE character_unlocks 
        SET ${updateFields.join(', ')}
        WHERE user_id = ? AND slot_id = ? AND character_id = ?
    `;
    
    db.run(updateSql, updateValues, function(err) {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: '更新失败: ' + err.message 
            });
        }
        
        if (this.changes === 0) {
            const insertFields = ['user_id', 'slot_id', 'character_id', 'updated_at'];
            const insertPlaceholders = ['?', '?', '?', '?'];
            const insertValues = [userId, slotId, characterId, timestamp];
            
            for (const field of validFields) {
                if (unlocks.hasOwnProperty(field)) {
                    insertFields.push(field);
                    insertPlaceholders.push('?');
                    insertValues.push(unlocks[field]);
                }
            }
            
            const insertSql = `
                INSERT INTO character_unlocks (${insertFields.join(', ')})
                VALUES (${insertPlaceholders.join(', ')})
            `;
            
            db.run(insertSql, insertValues, function(err) {
                if (err) {
                    return res.status(500).json({ 
                        success: false, 
                        message: '插入失败: ' + err.message 
                    });
                }
                res.json({ success: true, message: '解锁状态已创建' });
            });
        } else {
            res.json({ success: true, message: '解锁状态已更新' });
        }
    });
});

// 9. 批量获取所有角色的解锁状态
app.post('/api/character_unlocks/get_all', (req, res) => {
    const { userId, slotId } = req.body;
    
    console.log('[character_unlocks/get_all] Request:', { userId, slotId });
    
    if (!userId || slotId === undefined) {
        console.error('[character_unlocks/get_all] 缺少参数');
        return res.status(400).json({ 
            success: false, 
            message: '缺少必需参数: userId, slotId' 
        });
    }
    
    db.all(
        `SELECT 
            character_id,
            accept_battle_party,
            accept_flirt_topic,
            accept_nsfw_topic,
            accept_physical_contact,
            accept_indirect_sexual,
            accept_become_lover,
            accept_direct_sexual,
            accept_sexual_partner,
            accept_public_exposure,
            accept_public_sexual,
            accept_group_sexual,
            accept_prostitution,
            accept_sexual_slavery,
            accept_bathing_together,
            accept_player_massage,
            accept_character_massage
        FROM character_unlocks 
        WHERE user_id = ? AND slot_id = ?`,
        [userId, slotId],
        (err, rows) => {
            if (err) {
                console.error('[character_unlocks/get_all] 数据库错误:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: '数据库查询错误: ' + err.message 
                });
            }
            
            console.log(`[character_unlocks/get_all] 查询到 ${rows.length} 条记录`);
            
            const data = {};
            rows.forEach(row => {
                const characterId = row.character_id;
                delete row.character_id;
                data[characterId] = row;
            });
            
            res.json({ success: true, data });
        }
    );
});

// 创建服务器 (支持 HTTPS)
let server;

if (config.HTTPS_ENABLED) {
    try {
        if (fs.existsSync(config.SSL_KEY_PATH) && fs.existsSync(config.SSL_CERT_PATH)) {
            const httpsOptions = {
                key: fs.readFileSync(config.SSL_KEY_PATH),
                cert: fs.readFileSync(config.SSL_CERT_PATH)
            };
            
            server = https.createServer(httpsOptions, app);
            server.listen(PORT, () => {
                console.log(`HTTPS Server running on https://localhost:${PORT}`);
            });
        } else {
            console.warn('SSL证书文件不存在，回退到HTTP模式');
            server = http.createServer(app);
            server.listen(PORT, () => {
                console.log(`HTTP Server running on http://localhost:${PORT}`);
            });
        }
    } catch (err) {
        console.error('HTTPS启动失败，回退到HTTP模式:', err.message);
        server = http.createServer(app);
        server.listen(PORT, () => {
            console.log(`HTTP Server running on http://localhost:${PORT}`);
        });
    }
} else {
    server = http.createServer(app);
    server.listen(PORT, () => {
        console.log(`HTTP Server running on http://localhost:${PORT}`);
    });
}

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`ERROR: Port ${PORT} is already in use. Please stop other processes or change the port.`);
    } else {
        console.error('Server error:', e);
    }
});
