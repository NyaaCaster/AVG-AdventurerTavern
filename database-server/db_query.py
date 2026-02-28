import sqlite3
import json
import sys

DB_PATH = "database-server/data/database.sqlite"


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def table_counts():
    """查看各表数据量"""
    conn = get_conn()
    cur = conn.cursor()
    tables = ['users', 'saves', 'character_unlocks', 'chat_messages', 'character_memories']
    for t in tables:
        count = cur.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
        print(f"{t}: {count} 行")
    conn.close()


def query_inventory(user_id: int, item_id: str = None):
    """查询用户背包，可指定道具ID"""
    conn = get_conn()
    cur = conn.cursor()
    rows = cur.execute("SELECT slot_id, data FROM saves WHERE user_id = ?", (user_id,)).fetchall()
    if not rows:
        print(f"用户 {user_id} 没有存档")
        conn.close()
        return
    for row in rows:
        data = json.loads(row["data"])
        inventory = data.get("inventory", {})
        if item_id:
            count = inventory.get(item_id, 0)
            print(f"用户 {user_id} slot {row['slot_id']}: {item_id} = {count}")
        else:
            print(f"用户 {user_id} slot {row['slot_id']} 背包: {json.dumps(inventory, ensure_ascii=False)}")
    conn.close()


def query_user(user_id: int = None):
    """查询用户信息"""
    conn = get_conn()
    cur = conn.cursor()
    if user_id:
        rows = cur.execute("SELECT id, username, created_at FROM users WHERE id = ?", (user_id,)).fetchall()
    else:
        rows = cur.execute("SELECT id, username, created_at FROM users").fetchall()
    for row in rows:
        print(f"id={row['id']}  username={row['username']}  created_at={row['created_at']}")
    conn.close()


def query_save(user_id: int, slot_id: int = None):
    """查看存档完整数据"""
    conn = get_conn()
    cur = conn.cursor()
    if slot_id is not None:
        rows = cur.execute("SELECT slot_id, label, data FROM saves WHERE user_id = ? AND slot_id = ?", (user_id, slot_id)).fetchall()
    else:
        rows = cur.execute("SELECT slot_id, label, data FROM saves WHERE user_id = ?", (user_id,)).fetchall()
    for row in rows:
        data = json.loads(row["data"])
        print(f"\n--- slot {row['slot_id']} ({row['label']}) ---")
        print(json.dumps(data, ensure_ascii=False, indent=2))
    conn.close()


def raw_sql(sql: str):
    """执行任意 SELECT 语句"""
    conn = get_conn()
    cur = conn.cursor()
    rows = cur.execute(sql).fetchall()
    if rows:
        print("\t".join(rows[0].keys()))
        print("-" * 60)
        for row in rows:
            print("\t".join(str(v) for v in row))
    else:
        print("无结果")
    conn.close()


HELP = """
用法:
  python db_query.py counts
  python db_query.py users [user_id]
  python db_query.py inventory <user_id> [item_id]
  python db_query.py save <user_id> [slot_id]
  python db_query.py sql "<SELECT ...>"
"""

if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        print(HELP)
    elif args[0] == "counts":
        table_counts()
    elif args[0] == "users":
        query_user(int(args[1]) if len(args) > 1 else None)
    elif args[0] == "inventory":
        query_inventory(int(args[1]), args[2] if len(args) > 2 else None)
    elif args[0] == "save":
        query_save(int(args[1]), int(args[2]) if len(args) > 2 else None)
    elif args[0] == "sql":
        raw_sql(args[1])
    else:
        print(HELP)