
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3097; // 后端运行在 3097 端口

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // 增加限制以支持大存档

// Database Setup - 使用数据卷路径
const dbPath = process.env.DB_PATH || path.resolve(__dirname, '../data/database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
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
});

// API Routes

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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
