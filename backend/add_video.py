import os
import sqlite3

db_path = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "instance", "carmarket_v3.db"
)

conn = sqlite3.connect(db_path)
columns = [row[1] for row in conn.execute("PRAGMA table_info(car)")]

if "video" in columns:
    print("video column already exists.")
else:
    conn.execute("ALTER TABLE car ADD COLUMN video VARCHAR(255)")
    conn.commit()
    print("video column added.")

conn.close()