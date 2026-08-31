import { useState, type FormEvent } from "react";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { convertPdfToImage } from "~/lib/pdf2img";

import {
  RedirectToSignIn,
  Show,
} from "@clerk/react-router";

import { useSession, useUser } from "@clerk/react-router";
import { createClerkSupabaseClient } from "~/lib/supabase";

function UploadPage() {
  const { user } = useUser();
  const { session } = useSession();

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);

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
        image_path: imagePath,

        feedback: null, // later w/ ollama
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      alert("[ERR]: Please upload a resume file before submitting.");
      return;
    }

    try {
      await handleAnalyze({ file });
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