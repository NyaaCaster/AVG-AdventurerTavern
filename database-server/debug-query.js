const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/database.sqlite');

const now = new Date();
const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
const sevenDaysAgo = todayStart - 6 * 24 * 60 * 60 * 1000;

console.log('Today start timestamp:', todayStart);
console.log('Seven days ago timestamp:', sevenDaysAgo);

db.get(
    `SELECT COUNT(*) AS todayRequests, COALESCE(SUM(amount), 0) AS todayConsumed
     FROM sanity_ledger 
     WHERE user_id = 1 AND amount < 0 AND created_at >= ?`,
    [todayStart],
    (err, row) => {
        if (err) console.error('Error:', err);
        console.log('\nToday consumed:', row);
        console.log('Today consumed (abs):', Math.abs(row.todayConsumed));
    }
);

db.all(
    `SELECT 
        strftime('%m-%d', datetime(created_at / 1000, 'unixepoch', 'localtime')) AS dateStr,
        COALESCE(SUM(ABS(amount)), 0) AS dailyConsumed
     FROM sanity_ledger
     WHERE user_id = 1 AND amount < 0 AND created_at >= ?
     GROUP BY date(created_at / 1000, 'unixepoch', 'localtime')
     ORDER BY created_at ASC`,
    [sevenDaysAgo],
    (err, rows) => {
        if (err) console.error('Error:', err);
        console.log('\nChart data:');
        rows.forEach(row => {
            console.log(`  ${row.dateStr}: ${row.dailyConsumed}`);
        });
        
        db.close();
    }
);