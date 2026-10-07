import os
import sqlite3

db_path = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "instance", "carmarket_v3.db"
)

conn = sqlite3.connect(db_path)
columns = [row[1] for row in conn.execute("PRAGMA table_info(user)")]

if "is_admin" not in columns:
    conn.execute("ALTER TABLE user ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT 0")
    conn.commit()
    print("is_admin column add ho gaya.")

email = input("Jis account ko admin banana hai uski email: ").strip().lower()
cur = conn.execute("UPDATE user SET is_admin = 1 WHERE email = ?", (email,))
conn.commit()

print("Admin ban gaya." if cur.rowcount else "Ye email nahi mili.")
conn.close()