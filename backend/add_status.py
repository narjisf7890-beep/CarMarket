import os
import sqlite3

db_path = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "instance",
    "carmarket_v3.db",
)

if not os.path.exists(db_path):
    print("Database nahi mila:", db_path)
    raise SystemExit

conn = sqlite3.connect(db_path)

columns = [row[1] for row in conn.execute("PRAGMA table_info(car)")]

if "status" in columns:
    print("status column pehle se maujood hai, kuch karne ki zaroorat nahi.")
else:
    conn.execute(
        "ALTER TABLE car ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'available'"
    )
    conn.commit()
    print("status column add ho gaya.")

conn.close()