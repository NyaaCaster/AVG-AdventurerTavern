onst express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');
const config = require('./config'); // 寮曞叆閰嶇疆鏂囦欢

const app = express();
const PORT = config.PORT;

// Middleware
// 浣跨敤閰嶇疆鏂囦欢涓殑 CORS 璁剧疆
app.use(cors(config.CORS_CONFIG));

app.use(bodyParser.json({ limit: '50mb' })); // 澧炲姞闄愬埗浠ユ敮鎸佸ぇ瀛樻。

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Database Setup
// 浣跨敤閰嶇疆鏂囦欢涓殑鏁版嵁搴撹矾寰?const db = new sqlite3.Database(config.DB_PATH, (err) => {
    if (err) {
        console.error('Could not connect to database at ' + config.DB_PATH, err);
    } else {
        console.log('Connected to SQLite database at ' + config.DB_PATH);
    }
});

// Init Tables
db.serialize(() => {
    // 鐢ㄦ埛琛?    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        created_at INTEGER
    )`);

    // 瀛樻。琛?(绠€鍖栫粨鏋勶紝鐩存帴瀛樺偍 JSON 瀛楃涓?
    db.run(`CREATE TABLE IF NOT EXISTS saves (
        user_id INTEGER,
        slot_id INTEGER,
        label TEXT,
        data TEXT, 
        updated_at INTEGER,
        PRIMARY KEY (user_id, slot_id)
    )`);

    // 瑙掕壊鐘舵€佽В閿佽〃
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

    // 涓鸿鑹茬姸鎬佽〃鍒涘缓绱㈠紩浠ユ彁楂樻煡璇㈡€ц兘
    db.run(`CREATE INDEX IF NOT EXISTS idx_character_unlocks_user_slot 
            ON character_unlocks(user_id, slot_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_character_unlocks_character 
            ON character_unlocks(character_id)`);

    // ----------------- 鏂板锛欰I 鑱婂ぉ绯荤粺鏁版嵁琛?-----------------

    // 瀵硅瘽鍘嗗彶琛?(鐭湡宸ヤ綔璁板繂)
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

    // 闀挎湡璁板繂琛?(鏍稿績浜嬪疄涓庢憳瑕?
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

    // 涓鸿亰澶╁拰璁板繂琛ㄥ垱寤虹储寮曚互鎻愰珮鏌ヨ鎬ц兘
    db.run(`CREATE INDEX IF NOT EXISTS idx_chat_messages 
            ON chat_messages(user_id, slot_id, character_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_character_memories 
            ON character_memories(user_id, slot_id, character_id)`);
});

// API Routes

// 鍋ュ悍妫€鏌ュ拰鐘舵€佺鐐?(GET璇锋眰锛屽彲閫氳繃娴忚鍣ㄧ洿鎺ヨ闂?
app.get('/api/health', (req, res) => {
    const startTime = Date.now();
    
    // 娴嬭瘯鏁版嵁搴撹繛鎺?    db.get("SELECT COUNT(*) as userCount FROM users", [], (err, userRow) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                message: '鏁版嵁搴撹繛鎺ュけ璐?,
                error: err.message,
                timestamp: new Date().toISOString()
            });
        }
        
        db.get("SELECT COUNT(*) as saveCount FROM saves", [], (err2, saveRow) => {
            if (err2) {
                return res.status(500).json({
                    status: 'error',
                    message: '鏁版嵁搴撴煡璇㈠け璐?,
                    error: err2.message,
                    timestamp: new Date().toISOString()
                });
            }
            
            const responseTime = Date.now() - startTime;
            
            res.json({
                status: 'ok',
                message: '鍚庣鏈嶅姟杩愯姝ｅ父',
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

// 鏍硅矾寰勯噸瀹氬悜鍒板仴搴锋鏌?app.get('/', (req, res) => {
    res.redirect('/api/health');
});

// 1. 娉ㄥ唽
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const stmt = db.prepare("INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)");
    stmt.run(username, password, Date.now(), function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.json({ success: false, message: '鐢ㄦ埛鍚嶅凡瀛樺湪' });
            }
            return res.json({ success: false, message: err.message });
        }
        res.json({ success: true, uid: this.lastID });
    });
    stmt.finalize();
});

// 2. 鐧诲綍
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT id, password FROM users WHERE username = ?", [username], (err, row) => {
        if (err) return res.json({ success: false, message: '鏈嶅姟鍣ㄩ敊璇? });
        if (!row) return res.json({ success: false, message: '鐢ㄦ埛鍚嶄笉瀛樺湪' });
        if (row.password !== password) return res.json({ success: false, message: '瀵嗙爜閿欒' });
        
        res.json({ success: true, uid: row.id });
    });
});

// 3. 涓婁紶瀛樻。 (Save)
app.post('/api/save', (req, res) => {
    const { userId, slotId, label, data } = req.body;
    const dataStr = JSON.stringify(data);
    const timestamp = Date.now();

    // 浣跨敤 INSERT OR REPLACE 瀹炵幇"瀛樺湪鍗虫洿鏂帮紝涓嶅瓨鍦ㄥ嵆鎻掑叆"
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

// 4. 涓嬭浇瀛樻。 (Load)
app.post('/api/load', (req, res) => {
    const { userId, slotId } = req.body;
    db.get("SELECT data FROM saves WHERE user_id = ? AND slot_id = ?", [userId, slotId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.json({ success: false, data: null });
        
        try {
            const data = JSON.parse(row.data);
            res.json({ success: true, data });
        } catch (e) {
            res.json({ success: false, message: "瀛樻。鎹熷潖" });
        }
    });
});

// 5. 鑾峰彇瀛樻。鍒楄〃
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
                    characterStats: data.characterStats || {}
                };
            } catch (e) {
                // 濡傛灉瑙ｆ瀽澶辫触锛岃繑鍥為粯璁ゅ€?                return {
                    slotId: row.slot_id,
                    label: row.label,
                    savedAt: row.updated_at,
                    gold: 0,
                    currentSceneId: '',
                    worldState: { dateStr: '', timeStr: '', sceneName: '鏁版嵁鎹熷潖' },
                    characterStats: {}
                };
            }
        });
        res.json({ success: true, slots });
    });
});

// 6. 鍒犻櫎瀛樻。
app.post('/api/delete', (req, res) => {
    const { userId, slotId } = req.body;
    const stmt = db.prepare("DELETE FROM saves WHERE user_id = ? AND slot_id = ?");
    stmt.run(userId, slotId, function(err) {
        if (err) return res.json({ success: false, message: err.message });
        
        // 绾ц仈鍒犻櫎鐩稿叧鑱旂殑鑱婂ぉ鍜岃蹇嗘暟鎹?        const stmtChats = db.prepare("DELETE FROM chat_messages WHERE user_id = ? AND slot_id = ?");
        stmtChats.run(userId, slotId);
        stmtChats.finalize();
        
        const stmtMemories = db.prepare("DELETE FROM character_memories WHERE user_id = ? AND slot_id = ?");
        stmtMemories.run(userId, slotId);
        stmtMemories.finalize();
        
        res.json({ success: true });
    });
    stmt.finalize();
});

// ----------------- 鏂板锛欰I 璁板繂涓庤亰澶╃郴缁?API -----------------

// 6.1 鑾峰彇瑙掕壊鑱婂ぉ鍘嗗彶 (鐭湡璁板繂)
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

// 6.2 璁板綍涓€鏉℃柊瀵硅瘽
app.post('/api/chat/messages/add', (req, res) => {
    const { userId, slotId, characterId, role, content } = req.body;
    const stmt = db.prepare(`INSERT INTO chat_messages (user_id, slot_id, character_id, role, content, created_at) VALUES (?, ?, ?, ?, ?, ?)`);
    stmt.run(userId, slotId, characterId, role, content, Date.now(), function(err) {
        if (err) return res.json({ success: false, message: err.message });
        res.json({ success: true, id: this.lastID });
    });
    stmt.finalize();
});

// 6.3 鑾峰彇瑙掕壊鏍稿績璁板繂 (闀挎湡璁板繂)
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

// 6.4 鎵归噺娣诲姞鏍稿績璁板繂
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

// 6.5 瀛樻。鏃跺悓姝ュ鍒跺璇濆拰璁板繂 (瑙ｅ喅璇绘。瑕嗙洊/鏃剁┖閿欎贡闂)
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

// 6.6 鏇存柊瑙掕壊鐨勫巻鍙叉憳瑕?(婊氬姩鏇存柊)
app.post('/api/chat/summary/update', (req, res) => {
    const { userId, slotId, characterId, summaryText } = req.body;
    
    if (!userId || slotId === undefined || !characterId || !summaryText) {
        return res.json({ success: false, message: '缂哄皯蹇呴渶鍙傛暟' });
    }

    const now = Date.now();

    // 鍏堝皾璇曟洿鏂扮幇鏈夌殑 summary
    db.run(
        `UPDATE character_memories 
         SET content = ?, created_at = ? 
         WHERE user_id = ? AND slot_id = ? AND character_id = ? AND memory_type = 'summary'`,
        [summaryText, now, userId, slotId, characterId],
        function(err) {
            if (err) return res.status(500).json({ success: false, message: err.message });
            
            // 濡傛灉娌℃湁鏇存柊浠讳綍琛岋紝璇存槑杩樻病鏈?summary锛岄渶瑕佹彃鍏?            if (this.changes === 0) {
                const stmt = db.prepare(
                    `INSERT INTO character_memories (user_id, slot_id, character_id, memory_type, content, created_at) 
                     VALUES (?, ?, ?, 'summary', ?, ?)`
                );
                stmt.run(userId, slotId, characterId, summaryText, now, function(err) {
                    if (err) return res.status(500).json({ success: false, message: err.message });
                    res.json({ success: true, message: '鎽樿宸插垱寤? });
                });
                stmt.finalize();
            } else {
                res.json({ success: true, message: '鎽樿宸叉洿鏂? });
            }
        }
    );
});

// 6.7 鍒犻櫎宸叉€荤粨鐨勬棫瀵硅瘽璁板綍
app.post('/api/chat/messages/delete_old', (req, res) => {
    const { userId, slotId, characterId, beforeTimestamp } = req.body;
    
    if (!userId || slotId === undefined || !characterId || !beforeTimestamp) {
        return res.json({ success: false, message: '缂哄皯蹇呴渶鍙傛暟' });
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

// --- 瑙掕壊瑙ｉ攣鐘舵€?API ---

// 7. 鑾峰彇鍗曚釜瑙掕壊鐨勮В閿佺姸鎬?app.post('/api/character_unlocks/get', (req, res) => {
    const { userId, slotId, characterId } = req.body;
    
    if (!userId || slotId === undefined || !characterId) {
        return res.json({ 
            success: false, 
            message: '缂哄皯蹇呴渶鍙傛暟: userId, slotId, characterId' 
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
                    message: '鏁版嵁搴撴煡璇㈤敊璇? ' + err.message 
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

// 8. 鏇存柊瑙掕壊瑙ｉ攣鐘舵€?app.post('/api/character_unlocks/update', (req, res) => {
    const { userId, slotId, characterId, unlocks } = req.body;
    
    if (!userId || slotId === undefined || !characterId || !unlocks) {
        return res.json({ 
            success: false, 
            message: '缂哄皯蹇呴渶鍙傛暟: userId, slotId, characterId, unlocks' 
        });
    }
    
    if (typeof unlocks !== 'object') {
        return res.json({ 
            success: false, 
            message: 'unlocks 蹇呴』鏄璞? 
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
                    message: `瀛楁 ${field} 鐨勫€煎繀椤绘槸 0 鎴?1` 
                });
            }
            updateFields.push(`${field} = ?`);
            updateValues.push(value);
        }
    }
    
    if (updateFields.length === 0) {
        return res.json({ 
            success: false, 
            message: '娌℃湁鏈夋晥鐨勬洿鏂板瓧娈? 
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
                message: '鏇存柊澶辫触: ' + err.message 
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
                        message: '鎻掑叆澶辫触: ' + err.message 
                    });
                }
                res.json({ success: true, message: '瑙ｉ攣鐘舵€佸凡鍒涘缓' });
            });
        } else {
            res.json({ success: true, message: '瑙ｉ攣鐘舵€佸凡鏇存柊' });
        }
    });
});

// 9. 鎵归噺鑾峰彇鎵€鏈夎鑹茬殑瑙ｉ攣鐘舵€?app.post('/api/character_unlocks/get_all', (req, res) => {
    const { userId, slotId } = req.body;
    
    if (!userId || slotId === undefined) {
        return res.json({ 
            success: false, 
            message: '缂哄皯蹇呴渶鍙傛暟: userId, slotId' 
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
                return res.status(500).json({ 
                    success: false, 
                    message: '鏁版嵁搴撴煡璇㈤敊璇? ' + err.message 
                });
            }
            
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

// 鍒涘缓鏈嶅姟鍣?(鏀寔 HTTPS)
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
            console.warn('SSL璇佷功鏂囦欢涓嶅瓨鍦紝鍥為€€鍒癏TTP妯″紡');
            server = http.createServer(app);
            server.listen(PORT, () => {
                console.log(`HTTP Server running on http://localhost:${PORT}`);
            });
        }
    } catch (err) {
        console.error('HTTPS鍚姩澶辫触锛屽洖閫€鍒癏TTP妯″紡:', err.message);
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
