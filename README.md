# Resume Scorer

Resume Scorer is an AI-powered web application that analyzes a user’s resume against a target job description and provides structured feedback, ATS scoring, and improvement suggestions.

Users can securely sign in, upload a PDF resume, receive AI-generated feedback, and revisit their previous resume analyses from a personal dashboard.

<img width="1297" height="776" alt="Screenshot 2026-09-01 015506" src="https://github.com/user-attachments/assets/235fcb84-d24b-40b5-9a1f-c2b5bba3e17f" />

## Deployment
Live demo: https://resume-scorer-zeta.vercel.app/

## Features

- Secure authentication with Clerk
- PDF resume upload
- Resume preview generation
- PDF-to-text extraction
- AI-powered resume analysis with Google Gemini
- ATS score and improvement suggestions
- Private resume storage with Supabase Storage
- Resume metadata and feedback stored in Supabase Postgres

## Tech Stack

### Frontend

- React
- React Router
- TypeScript
- Tailwind CSS

### Authentication

- Clerk

### Database and Storage

- Supabase Postgres
- Supabase Storage

### AI

- Google Gemini API
- `@google/genai`

### PDF Processing

- `pdfjs-dist`

## How It Works

```text
User
  ↓
Clerk Authentication
  ↓
Upload PDF Resume
  ↓
┌─────────────────────────────┐
│                             │
▼                             ▼
Supabase Storage        PDF Text Extraction
PDF + Preview Image            │
                               ▼
                        Gemini Analysis
                               │
                               ▼
                        Structured Feedback
                               │
                               ▼
                        Supabase Database
                               │
                               ▼
                       Resume Review Page
```
