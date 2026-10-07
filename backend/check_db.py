import os
import sqlite3

base = os.path.dirname(os.path.abspath(__file__))

found = False
for root, dirs, files in os.walk(base):
    if "venv" in root or "node_modules" in root:
        continue
    for f in files:
        if f.endswith(".db"):
            found = True
            path = os.path.join(root, f)
            print("\nFILE:", path)
            print("Size:", os.path.getsize(path), "bytes")
            try:
                conn = sqlite3.connect(path)
                tables = [r[0] for r in conn.execute(
                    "SELECT name FROM sqlite_master WHERE type='table'")]
                print("Tables:", tables)
                if "car" in tables:
                    cols = [r[1] for r in conn.execute("PRAGMA table_info(car)")]
                    count = conn.execute("SELECT COUNT(*) FROM car").fetchone()[0]
                    print("Cars:", count)
                    print("Columns:", cols)
                if "user" in tables:
                    print("Users:", conn.execute("SELECT COUNT(*) FROM user").fetchone()[0])
                conn.close()
            except Exception as e:
                print("Error:", e)

if not found:
    print("Koi .db file nahi mili")