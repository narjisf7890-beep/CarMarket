import os
import sqlite3

db_path = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "instance", "carmarket_v3.db"
)

conn = sqlite3.connect(db_path)
columns = [row[1] for row in conn.execute("PRAGMA table_info(car)")]

if "paint" in columns:
    print("paint column already exists.")
else:
    conn.execute("ALTER TABLE car ADD COLUMN paint VARCHAR(30)")
    conn.commit()
    print("paint column added.")

conn.close()