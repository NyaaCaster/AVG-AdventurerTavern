import sqlite3
import sys
import os

# 确保能正确找到数据库文件
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "database.sqlite")

def get_sanity_stats(all_users=False):
    if not os.path.exists(DB_PATH):
        print(f"找不到数据库文件: {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()
    
    # 统计每个用户的：总记录数、理智余额（总amount）、累计消耗（只计算amount < 0的绝对值）
    sql = """
    SELECT 
        s.user_id, 
        u.username, 
        COUNT(s.id) as record_count, 
        SUM(s.amount) as total_amount,
        SUM(CASE WHEN s.amount < 0 THEN ABS(s.amount) ELSE 0 END) as total_consumed
    FROM sanity_ledger s 
    LEFT JOIN users u ON s.user_id = u.id 
    GROUP BY s.user_id 
    ORDER BY total_consumed DESC, s.user_id ASC;
    """
    
    rows = cur.execute(sql).fetchall()
    
    print(f"{'UID':<5} | {'用户名':<18} | {'记录数':<6} | {'当前剩余灵感':<12} | {'累计消耗':<12}")
    print("-" * 70)
    
    for row in rows:
        uid = row['user_id']
        username = str(row['username']) if row['username'] else "Unknown"
        record_count = row['record_count']
        # 数值除以 10000
        total_amount = float(row['total_amount'] or 0) / 10000.0
        total_consumed = float(row['total_consumed'] or 0) / 10000.0
        
        # 默认只显示有实际消耗的活跃用户
        if not all_users and total_consumed == 0:
            continue
            
        # 保留小数点 4 位
        print(f"{uid:<5} | {username:<18} | {record_count:<9} | {total_amount:<16.4f} | {total_consumed:<12.4f}")

    conn.close()

if __name__ == "__main__":
    show_all = len(sys.argv) > 1 and sys.argv[1] == '--all'
    if not show_all:
        print("默认仅显示有消耗记录的活跃用户。如需查看所有用户，请运行: python database-server/sanity_stats.py --all\n")
    get_sanity_stats(show_all)
