from app.database import get_db_connection # for getting information from database

def score_resume(resume_text, job):
    """
    The function that gets called when the user submits a resume and job, 
    and returns a dict of information based on how well the resume matches the job description.
    """

    # Placeholders
    score = [85, 91, 78, 64]
    keywords = ["Kubernetes", "CI/CD", "observability"]
    suggestions = [
        "Add more measurable impact.",
        "Include missing job-specific keywords.",
        "Make experience bullets more specific."
    ]

    feedback = {
        "overall_score": score[0],
        "keywords_score": score[1],
        "experience_clarity": score[2],
        "impact_metrics": score[3],
        "missing_keywords": keywords,
        "suggestions": suggestions
    }

    return feedback