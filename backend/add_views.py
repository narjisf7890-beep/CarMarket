import os
import sqlite3

db_path = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "instance", "carmarket_v3.db"
)

if not os.path.exists(db_path):
    print("Database nahi mila:", db_path)
    raise SystemExit

conn = sqlite3.connect(db_path)
columns = [row[1] for row in conn.execute("PRAGMA table_info(car)")]

if "views" in columns:
    print("views column pehle se maujood hai.")
else:
    conn.execute("ALTER TABLE car ADD COLUMN views INTEGER NOT NULL DEFAULT 0")
    conn.commit()
    print("views column add ho gaya.")

conn.close()