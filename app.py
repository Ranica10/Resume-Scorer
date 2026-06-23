from database import get_db_connection

from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return "Hello world"


@app.route("/occupation-data")
def occupation_data():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM occupation_data LIMIT 10")
    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return rows
    