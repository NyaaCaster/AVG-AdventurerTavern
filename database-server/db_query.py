import json
import sqlite3
import sys
from typing import Any, Iterable

DB_PATH = "database-server/data/database.sqlite"


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def print_rows(rows: Iterable[sqlite3.Row]):
    rows = list(rows)
    if not rows:
        print("无结果")
        return

    headers = list(rows[0].keys())
    print("\t".join(headers))
    print("-" * 80)
    for row in rows:
        print("\t".join("" if v is None else str(v) for v in row))


def table_exists(cur: sqlite3.Cursor, table_name: str) -> bool:
    row = cur.execute(
        "SELECT 1 FROM sqlite_master WHERE type='table' AND name = ?",
        (table_name,),
    ).fetchone()
    return row is not None


def table_counts():
    """查看各表数据量"""
    conn = get_conn()
    cur = conn.cursor()
    tables = [
        "users",
        "saves",
        "character_unlocks",
        "character_progress",
        "character_equipment",
        "chat_messages",
        "character_memories",
        "sanity_ledger",
    ]

    for table in tables:
        if not table_exists(cur, table):
            print(f"{table}: 表不存在")
            continue
        count = cur.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
        print(f"{table}: {count} 行")

    conn.close()


def query_inventory(user_id: int, item_id: str | None = None):
    """查询用户背包，可指定道具ID"""
    conn = get_conn()
    cur = conn.cursor()
    rows = cur.execute("SELECT slot_id, data FROM saves WHERE user_id = ? ORDER BY slot_id", (user_id,)).fetchall()
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


def query_user(user_id: int | None = None):
    """查询用户信息"""
    conn = get_conn()
    cur = conn.cursor()

    sql = """
    SELECT id,
           username,
           datetime(created_at/1000, 'unixepoch', '+8 hours') AS created_at
    FROM users
    """
    params: list[Any] = []
    if user_id is not None:
        sql += " WHERE id = ?"
        params.append(user_id)
    sql += " ORDER BY id"

    print_rows(cur.execute(sql, params).fetchall())
    conn.close()


def query_save(user_id: int, slot_id: int | None = None):
    """查看存档完整数据"""
    conn = get_conn()
    cur = conn.cursor()

    if slot_id is not None:
        rows = cur.execute(
            "SELECT slot_id, label, data FROM saves WHERE user_id = ? AND slot_id = ? ORDER BY slot_id",
            (user_id, slot_id),
        ).fetchall()
    else:
        rows = cur.execute(
            "SELECT slot_id, label, data FROM saves WHERE user_id = ? ORDER BY slot_id",
            (user_id,),
        ).fetchall()

    if not rows:
        print("无结果")
    else:
        for row in rows:
            data = json.loads(row["data"])
            print(f"\n--- slot {row['slot_id']} ({row['label']}) ---")
            print(json.dumps(data, ensure_ascii=False, indent=2))

    conn.close()


def query_unlocks(user_id: int, slot_id: int | None = None, character_id: str | None = None):
    """查询角色解锁状态"""
    conn = get_conn()
    cur = conn.cursor()

    sql = """
    SELECT user_id,
           slot_id,
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
           accept_character_massage,
           datetime(updated_at/1000, 'unixepoch', '+8 hours') AS updated_at
    FROM character_unlocks
    WHERE user_id = ?
    """
    params: list[Any] = [user_id]
    if slot_id is not None:
        sql += " AND slot_id = ?"
        params.append(slot_id)
    if character_id is not None:
        sql += " AND character_id = ?"
        params.append(character_id)
    sql += " ORDER BY slot_id, character_id"

    print_rows(cur.execute(sql, params).fetchall())
    conn.close()


def query_progress(user_id: int, slot_id: int | None = None, character_id: str | None = None):
    """查询角色等级与经验"""
    conn = get_conn()
    cur = conn.cursor()

    sql = """
    SELECT user_id,
           slot_id,
           character_id,
           level,
           exp,
           datetime(updated_at/1000, 'unixepoch', '+8 hours') AS updated_at
    FROM character_progress
    WHERE user_id = ?
    """
    params: list[Any] = [user_id]
    if slot_id is not None:
        sql += " AND slot_id = ?"
        params.append(slot_id)
    if character_id is not None:
        sql += " AND character_id = ?"
        params.append(character_id)
    sql += " ORDER BY slot_id, character_id"

    print_rows(cur.execute(sql, params).fetchall())
    conn.close()


def query_equipment(user_id: int, slot_id: int | None = None, character_id: str | None = None):
    """查询角色装备"""
    conn = get_conn()
    cur = conn.cursor()

    sql = """
    SELECT user_id,
           slot_id,
           character_id,
           weapon_id,
           armor_id,
           accessory1_id,
           accessory2_id,
           datetime(updated_at/1000, 'unixepoch', '+8 hours') AS updated_at
    FROM character_equipment
    WHERE user_id = ?
    """
    params: list[Any] = [user_id]
    if slot_id is not None:
        sql += " AND slot_id = ?"
        params.append(slot_id)
    if character_id is not None:
        sql += " AND character_id = ?"
        params.append(character_id)
    sql += " ORDER BY slot_id, character_id"

    print_rows(cur.execute(sql, params).fetchall())
    conn.close()


def query_character_overview(user_id: int, slot_id: int, character_id: str | None = None):
    """查询角色总览：解锁 + 等级经验 + 装备"""
    conn = get_conn()
    cur = conn.cursor()

    sql = """
    SELECT p.user_id,
           p.slot_id,
           p.character_id,
           p.level,
           p.exp,
           e.weapon_id,
           e.armor_id,
           e.accessory1_id,
           e.accessory2_id,
           u.accept_battle_party,
           u.accept_become_lover,
           datetime(p.updated_at/1000, 'unixepoch', '+8 hours') AS progress_updated_at,
           datetime(e.updated_at/1000, 'unixepoch', '+8 hours') AS equipment_updated_at,
           datetime(u.updated_at/1000, 'unixepoch', '+8 hours') AS unlocks_updated_at
    FROM character_progress p
    LEFT JOIN character_equipment e
      ON p.user_id = e.user_id AND p.slot_id = e.slot_id AND p.character_id = e.character_id
    LEFT JOIN character_unlocks u
      ON p.user_id = u.user_id AND p.slot_id = u.slot_id AND p.character_id = u.character_id
    WHERE p.user_id = ? AND p.slot_id = ?
    """
    params: list[Any] = [user_id, slot_id]
    if character_id is not None:
        sql += " AND p.character_id = ?"
        params.append(character_id)
    sql += " ORDER BY p.character_id"

    print_rows(cur.execute(sql, params).fetchall())
    conn.close()


def query_sanity(user_id: int, limit: int = 20):
    """查询某用户理智账本最近明细"""
    conn = get_conn()
    cur = conn.cursor()

    sql = """
    SELECT type,
           amount,
           description,
           client_ip,
           datetime(created_at/1000, 'unixepoch', '+8 hours') AS created_at
    FROM sanity_ledger
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
    """

    print_rows(cur.execute(sql, (user_id, limit)).fetchall())
    conn.close()


def query_balance(user_id: int | None = None):
    """查询理智余额（sum(amount)）"""
    conn = get_conn()
    cur = conn.cursor()

    sql = "SELECT user_id, SUM(amount) AS balance FROM sanity_ledger"
    params: list[Any] = []
    if user_id is not None:
        sql += " WHERE user_id = ?"
        params.append(user_id)
    sql += " GROUP BY user_id ORDER BY user_id"

    print_rows(cur.execute(sql, params).fetchall())
    conn.close()


def raw_sql(sql: str):
    """执行任意 SQL 语句（建议优先使用 SELECT）"""
    conn = get_conn()
    cur = conn.cursor()
    rows = cur.execute(sql).fetchall()
    print_rows(rows)
    conn.close()


HELP = """
用法:
  python database-server/db_query.py counts
  python database-server/db_query.py users [user_id]
  python database-server/db_query.py inventory <user_id> [item_id]
  python database-server/db_query.py save <user_id> [slot_id]
  python database-server/db_query.py unlocks <user_id> [slot_id] [character_id]
  python database-server/db_query.py progress <user_id> [slot_id] [character_id]
  python database-server/db_query.py equipment <user_id> [slot_id] [character_id]
  python database-server/db_query.py character <user_id> <slot_id> [character_id]
  python database-server/db_query.py sanity <user_id> [limit]
  python database-server/db_query.py balance [user_id]
  python database-server/db_query.py sql "<SELECT ...>"
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
        if len(args) < 2:
            print(HELP)
        else:
            query_inventory(int(args[1]), args[2] if len(args) > 2 else None)
    elif args[0] == "save":
        if len(args) < 2:
            print(HELP)
        else:
            query_save(int(args[1]), int(args[2]) if len(args) > 2 else None)
    elif args[0] == "unlocks":
        if len(args) < 2:
            print(HELP)
        else:
            query_unlocks(
                int(args[1]),
                int(args[2]) if len(args) > 2 else None,
                args[3] if len(args) > 3 else None,
            )
    elif args[0] == "progress":
        if len(args) < 2:
            print(HELP)
        else:
            query_progress(
                int(args[1]),
                int(args[2]) if len(args) > 2 else None,
                args[3] if len(args) > 3 else None,
            )
    elif args[0] == "equipment":
        if len(args) < 2:
            print(HELP)
        else:
            query_equipment(
                int(args[1]),
                int(args[2]) if len(args) > 2 else None,
                args[3] if len(args) > 3 else None,
            )
    elif args[0] == "character":
        if len(args) < 3:
            print(HELP)
        else:
            query_character_overview(
                int(args[1]),
                int(args[2]),
                args[3] if len(args) > 3 else None,
            )
    elif args[0] == "sanity":
        if len(args) < 2:
            print(HELP)
        else:
            query_sanity(int(args[1]), int(args[2]) if len(args) > 2 else 20)
    elif args[0] == "balance":
        query_balance(int(args[1]) if len(args) > 1 else None)
    elif args[0] == "sql":
        if len(args) < 2:
            print(HELP)
        else:
            raw_sql(args[1])
    else:
        print(HELP)