from database import get_db_connection

conn = get_db_connection()
cursor = conn.cursor(dictionary=True)

cursor.execute("SELECT * FROM occupation_data LIMIT 1")
rows = cursor.fetchall()

for row in rows:
    print(row)

cursor.close()
conn.close()