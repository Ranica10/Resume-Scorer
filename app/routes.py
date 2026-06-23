from flask import Blueprint

from app.database import get_db_connection # for getting information from database

main = Blueprint("main", __name__)

@main.route("/")
def home():
    return "home page"