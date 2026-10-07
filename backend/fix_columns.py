import os
import sqlite3

db_path = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "instance", "carmarket_v3.db"
)

if not os.path.exists(db_path):
    print("Database not found:", db_path)
    raise SystemExit

conn = sqlite3.connect(db_path)
existing = [row[1] for row in conn.execute("PRAGMA table_info(car)")]

needed = {
    "area": "VARCHAR(100)",
    "paint": "VARCHAR(30)",
    "video": "VARCHAR(255)",
    "views": "INTEGER NOT NULL DEFAULT 0",
    "status": "VARCHAR(20) NOT NULL DEFAULT 'available'",
    "condition": "VARCHAR(10) NOT NULL DEFAULT 'used'",
}

for name, definition in needed.items():
    if name in existing:
        print(f"{name}: already exists")
    else:
        conn.execute(f'ALTER TABLE car ADD COLUMN "{name}" {definition}')
        print(f"{name}: ADDED")

conn.commit()

user_cols = [row[1] for row in conn.execute("PRAGMA table_info(user)")]
if "is_admin" not in user_cols:
    conn.execute("ALTER TABLE user ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT 0")
    conn.commit()
    print("user.is_admin: ADDED (run make_admin.py again to set your admin)")

conn.close()
print("Done.")