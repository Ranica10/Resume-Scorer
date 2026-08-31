import { useState, type FormEvent } from "react";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";

import {
  RedirectToSignIn,
  Show,
} from "@clerk/react-router";

import { useSession, useUser } from "@clerk/react-router";
import { createClerkSupabaseClient } from "~/lib/supabase";

import { GoogleGenAI } from "@google/genai";

import { prepareInstructions } from "~/constants";
import { convertPdfToImage, convertPdfToText } from "~/lib/pdf";
import { useNavigate } from "react-router";

function UploadPage() {
  const { user } = useUser();
  const { session } = useSession();

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const navigate = useNavigate();

  const handleFileSelect = (selectedFile: File | null) => {
    setFile(selectedFile);
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
  }) => {
    if (!file || !user || !session) return;

    setIsProcessing(true);
    setStatusText("Preparing resume...");

    // Create supabase client
    const supabase = createClerkSupabaseClient(() =>
      session.getToken()
    );

    // new uuid for each resume
    const resumeId = crypto.randomUUID();

    // File pathes for the current resume
    const resumePath = `${user.id}/${resumeId}.pdf`;
    const imagePath = `${user.id}/${resumeId}.png`;

    // Upload the resume to the resumes bucket in supabase
    const { error: resumeUploadError } = await supabase.storage
      .from("resumes")
      .upload(resumePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (resumeUploadError) {
      throw resumeUploadError;
    }

    // Convert the PDF to an image and upload it to the images bucket in supabase
    setStatusText("Creating image...");

    const imageFile = await convertPdfToImage(file);

    if (!imageFile.file) {
      throw new Error("Could not generate resume preview");
    }

    // Upload the image of the resume to the resume-images bucket in supabase
    const { error: imageUploadError } = await supabase.storage
      .from("resume-images")
      .upload(imagePath, imageFile.file, {
        contentType: "image/png",
        upsert: false,
      });

    if (imageUploadError) {
      throw imageUploadError;
    }

    setStatusText("Extracting text...");

    const resumeText = await convertPdfToText(file);

    if (!resumeText) {
      throw new Error("Could not extract text");
    }

    // console.log("Extracted text:", resumeText);

    // Analyze the resume with gemini-3.1-flash-lite and get feedback
    setStatusText("Analyzing resume...");

    const ai = new GoogleGenAI({
      apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    });

    const interaction = await ai.interactions.create({
      model: "gemini-3.1-flash-lite",
      input: prepareInstructions({
        jobTitle,
        jobDescription,
        resumeText
      }),
    });

    const feedback = JSON.parse(interaction.output_text || "{}");

    // console.log("Feedback received:", feedback);

    setStatusText("Saving resume...");

    // Save the resume into the table with its relevant info
    const { data: resume, error: insertError } = await supabase
      .from("resumes")
      .insert({
        id: resumeId,

        user_id: user.id,

        company_name: companyName,
        job_title: jobTitle,
        job_description: jobDescription,

        resume_path: resumePath,
        resume_text: resumeText,
        image_path: imagePath,

        feedback: feedback
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Navigate to the resume page w/ the feedback displayed
    navigate(`/resume/${resumeId}`);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      alert("[ERR]: Please upload a resume file before submitting.");
      return;
    }

    // Get form data
    const formData = new FormData(e.currentTarget);

    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    try {
      // Analyze the resume and save it to the database
      await handleAnalyze({
        companyName,
        jobTitle,
        jobDescription,
      });
    } catch (error) {
      console.error("Resume preparation failed:", error);
      setStatusText("[ERR]: Resume preparation failed. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Smart feedback for your dream job</h1>

          {/* Scanning resume gif if processing */}
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img src="/images/resume-scan.gif" className="w-full" />
            </>
          ) : (
            <>
              <h2>Drop your resume for an ATS score and improvement tips</h2>
            </>
          )}

          {/* Display form if not processing */}
          {!isProcessing && (
            // Upload form
            <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
              {/* Company name */}
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
              </div>

              {/* Job title */}
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
              </div>

              {/* Job description */}
              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
              </div>

              {/* Dropbox for resume */}
              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>

              {/* Submit button */}
              <button className="primary-button" type="submit">Analyze Resume</button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default function Upload() {
  return (
    <>
      <Show when="signed-out">
        <RedirectToSignIn />
      </Show>

      <Show when="signed-in">
        <UploadPage />
      </Show>
    </>
  );
}