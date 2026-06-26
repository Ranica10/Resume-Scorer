from werkzeug.utils import secure_filename
from pathlib import Path
import uuid

from flask import Blueprint, redirect, render_template, request, session, url_for

from app.database import get_db_connection  # for getting information from database

main = Blueprint("main", __name__)

@main.route("/")
@main.route("/index")
def index():
    return render_template("index.html", title="Home", total=0)


UPLOAD_FOLDER = Path("uploads/resumes")
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {"pdf", "doc", "docx", "txt"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@main.route("/upload-resume", methods=["POST"])
def upload_resume():
    file = request.files.get("resume")

    if not file or file.filename == "":
        return "No file uploaded", 400

    if not allowed_file(file.filename):
        return "Invalid file type", 400

    original_filename = secure_filename(file.filename)
    extension = original_filename.rsplit(".", 1)[1].lower()

    unique_filename = f"{uuid.uuid4().hex}.{extension}"
    saved_path = UPLOAD_FOLDER / unique_filename

    file.save(saved_path)

    session["resume_path"] = str(saved_path)
    session["resume_original_name"] = original_filename

    return redirect(url_for("main.additional_info"))

def get_job_titles():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM job_titles")
    titles = cursor.fetchall()

    return titles

@main.route("/additional-info", methods=["GET"])
def additional_info():
    if "resume_path" not in session:
        return redirect(url_for("main.index"))

    return render_template(
        "additional_info.html",
        title="Additional Info",
        resume_name=session.get("resume_original_name"),
        job_titles=get_job_titles()
    )


@main.route("/analyze-resume", methods=["POST"])
def analyze_resume():
    resume_path = session.get("resume_path")

    if not resume_path:
        return redirect(url_for("main.index"))

    target_role = request.form.get("target_role")
    role_type = request.form.get("role_type")
    experience_level = request.form.get("experience_level")
    job_description = request.form.get("job_description")
    job_url = request.form.get("job_url")

    print("Resume path:", resume_path)
    print("Target role:", target_role)
    print("Role type:", role_type)
    print("Experience level:", experience_level)
    print("Job description:", job_description)
    print("Job URL:", job_url)

    # return render_template(
    #     "results.html",
    #     title="Results",
    #     resume_name=session.get("resume_original_name"),
    #     target_role=target_role,
    #     role_type=role_type,
    #     experience_level=experience_level,
    #     job_description=job_description,
    #     job_url=job_url
    # )