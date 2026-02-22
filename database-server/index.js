
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const https = require('https');
const http = require('http');
const fs = require('fs');
const config = require('./config'); // 引入配置文件

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
        updated_at INTEGER NOT NULL,
        UNIQUE(user_id, slot_id, character_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // 为角色状态表创建索引以提高查询性能
    db.run(`CREATE INDEX IF NOT EXISTS idx_character_unlocks_user_slot 
            ON character_unlocks(user_id, slot_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_character_unlocks_character 
            ON character_unlocks(character_id)`);
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

// 1. 注册
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const stmt = db.prepare("INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)");
    stmt.run(username, password, Date.now(), function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.json({ success: false, message: '用户名已存在' });
            }
            return res.json({ success: false, message: err.message });
        }
        res.json({ success: true, uid: this.lastID });
    });
    stmt.finalize();
});

// 2. 登录
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT id, password FROM users WHERE username = ?", [username], (err, row) => {
        if (err) return res.json({ success: false, message: '服务器错误' });
        if (!row) return res.json({ success: false, message: '用户名不存在' });
        if (row.password !== password) return res.json({ success: false, message: '密码错误' });
        
        res.json({ success: true, uid: row.id });
    });
});

// 3. 上传存档 (Save)
app.post('/api/save', (req, res) => {
    const { userId, slotId, label, data } = req.body;
    const dataStr = JSON.stringify(data);
    const timestamp = Date.now();

    // 使用 INSERT OR REPLACE 实现“存在即更新，不存在即插入”
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
    db.all("SELECT slot_id, label, updated_at FROM saves WHERE user_id = ?", [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const slots = rows.map(row => ({
            slotId: row.slot_id,
            label: row.label,
            savedAt: row.updated_at,
            // 构造简略信息用于UI显示
            gold: 0, // 列表接口暂不返回详细数据以节省流量
            currentSceneId: '...',
            worldState: { dateStr: '', timeStr: '', sceneName: 'Server Save' }
        }));
        res.json({ success: true, slots });
    });
});

// 6. 删除存档
app.post('/api/delete', (req, res) => {
    const { userId, slotId } = req.body;
    const stmt = db.prepare("DELETE FROM saves WHERE user_id = ? AND slot_id = ?");
    stmt.run(userId, slotId, function(err) {
        if (err) return res.json({ success: false, message: err.message });
        res.json({ success: true });
    });
    stmt.finalize();
});

// --- 角色解锁状态 API ---

// 7. 获取单个角色的解锁状态
app.post('/api/character_unlocks/get', (req, res) => {
    const { userId, slotId, characterId } = req.body;
    
    // 验证必需参数
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
            accept_sexual_slavery
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
                // 如果没有记录，返回默认的全部未解锁状态
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
                        accept_sexual_slavery: 0
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
    
    // 验证必需参数
    if (!userId || slotId === undefined || !characterId || !unlocks) {
        return res.json({ 
            success: false, 
            message: '缺少必需参数: userId, slotId, characterId, unlocks' 
        });
    }
    
    // 验证 unlocks 对象
    if (typeof unlocks !== 'object') {
        return res.json({ 
            success: false, 
            message: 'unlocks 必须是对象' 
        });
    }
    
    const timestamp = Date.now();
    
    // 构建 SET 子句
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
        'accept_sexual_slavery'
    ];
    
    const updateFields = [];
    const updateValues = [];
    
    for (const field of validFields) {
        if (unlocks.hasOwnProperty(field)) {
            const value = unlocks[field];
            // 验证值必须是 0 或 1
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
    
    // 添加 updated_at
    updateFields.push('updated_at = ?');
    updateValues.push(timestamp);
    
    // 添加 WHERE 条件的值
    updateValues.push(userId, slotId, characterId);
    
    // 先尝试更新
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
        
        // 如果没有更新任何行，说明记录不存在，需要插入
        if (this.changes === 0) {
            // 构建插入语句
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
    
    // 验证必需参数
    if (!userId || slotId === undefined) {
        return res.json({ 
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
            accept_sexual_slavery
        FROM character_unlocks 
        WHERE user_id = ? AND slot_id = ?`,
        [userId, slotId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: '数据库查询错误: ' + err.message 
                });
            }
            
            // 将数组转换为对象映射
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
        // 检查SSL证书文件是否存在
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
