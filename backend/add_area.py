import os
import sqlite3

db_path = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "instance", "carmarket_v3.db"
)

conn = sqlite3.connect(db_path)
columns = [row[1] for row in conn.execute("PRAGMA table_info(car)")]

if "area" in columns:
    print("area column already exists.")
else:
    conn.execute("ALTER TABLE car ADD COLUMN area VARCHAR(100)")
    conn.commit()
    print("area column added.")

conn.close()