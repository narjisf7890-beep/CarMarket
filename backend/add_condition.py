import os
import sqlite3

db_path = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "instance", "carmarket_v3.db"
)

conn = sqlite3.connect(db_path)
columns = [row[1] for row in conn.execute("PRAGMA table_info(car)")]

if "condition" in columns:
    print("condition column pehle se maujood hai.")
else:
    conn.execute(
        "ALTER TABLE car ADD COLUMN condition VARCHAR(10) NOT NULL DEFAULT 'used'"
    )
    conn.commit()
    print("condition column add ho gaya.")

conn.close()