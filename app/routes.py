from flask import Blueprint, render_template

from app.database import get_db_connection # for getting information from database

main = Blueprint("main", __name__)

@main.route("/")
def index():
    return render_template("index.html", title="Home")