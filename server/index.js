
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
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

// 监听所有网络接口 (不指定 IP)
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`ERROR: Port ${PORT} is already in use. Please stop other processes or change the port.`);
    } else {
        console.error('Server error:', e);
    }
});
