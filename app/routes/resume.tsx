import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import ATS from "~/components/ATS";
import Details from "~/components/Details";
import Summary from "~/components/Summary";

import { useSession, useUser } from "@clerk/react-router";
import { createClerkSupabaseClient } from "~/lib/supabase";

export const meta = () => [
  { title: "Resume Scorer | Review" },
  { name: "description", content: "Detailed overview of your resume" },
];

type ResumeData = {
  id: string;
  user_id: string;

  company_name: string | null;
  job_title: string | null;
  job_description: string | null;

  resume_path: string;
  image_path: string;

  resume_text: string | null;

  feedback: any;
};

const Resume = () => {
  const { id } = useParams();

  const { user } = useUser();
  const { session } = useSession();

  const [resume, setResume] = useState<ResumeData | null>(null);

  const [resumeUrl, setResumeUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResume = async () => {
      if (!id || !user || !session) return;

      try {
        setIsLoading(true);
        setError("");

        const supabase = createClerkSupabaseClient(() =>
          session.getToken()
        );

        // Get resume data from Supabase
        const { data, error: fetchError } = await supabase
          .from("resumes")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (!data) {
          throw new Error("Resume not found");
        }

        console.log("Resume row:", data);

        if (!data.resume_path) {
          throw new Error("Resume PDF path is missing");
        }

        if (!data.image_path) {
          throw new Error("Resume image path is missing");
        }

        setResume(data);

        // Generate temporary URL for the private PDF
        const {
          data: resumeSignedUrl,
          error: resumeUrlError,
        } = await supabase.storage
          .from("resumes")
          .createSignedUrl(data.resume_path, 60 * 60);

        if (resumeUrlError) {
          throw resumeUrlError;
        }

        // Generate temporary URL for the private resume image
        const {
          data: imageSignedUrl,
          error: imageUrlError,
        } = await supabase.storage
          .from("resume-images")
          .createSignedUrl(data.image_path, 60 * 60);

        if (imageUrlError) {
          throw imageUrlError;
        }

        setResumeUrl(resumeSignedUrl.signedUrl);
        setImageUrl(imageSignedUrl.signedUrl);
      } catch (error) {
        console.error("Failed to load resume:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Could not load resume"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadResume();
  }, [id, user, session]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <h2>Loading resume...</h2>
      </main>
    );
  }

  if (error || !resume) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="flex flex-col gap-4 text-center">
          <h1 className="text-4xl font-bold">
            Resume not found
          </h1>

          <p>
            {error || "Could not find this resume."}
          </p>

          <Link
            to="/upload"
            className="primary-button w-fit mx-auto"
          >
            Upload Resume
          </Link>
        </div>
      </main>
    );
  }

  const { feedback } = resume;

  return (
    <main className="!pt-0">
      <nav className="resume-nav">
        <Link to="/" className="back-button">
          <img
            src="/icons/back.svg"
            alt="go back"
            className="w-2.5 h-2.5"
          />

          <span className="text-gray-800 text-sm font-semibold">
            Back to Homepage
          </span>
        </Link>
      </nav>

      <div className="flex flex-row w-full max-lg:flex-col-reverse">

        {/* Resume preview */}
        <section className="feedback-section bg-[url('/images/bg_small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
          <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">

            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={imageUrl}
                className="w-full h-full object-contain rounded-2xl"
                title="resume"
                alt="Resume preview"
              />
            </a>

          </div>
        </section>

        {/* Feedback */}
        <section className="feedback-section">
          <h2 className="text-4xl !text-black font-bold">
            Resume Review
          </h2>

          <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
            <Summary feedback={feedback} />

            <ATS
              score={feedback?.ATS?.score || 0}
              suggestions={feedback?.ATS?.tips || []}
            />

            <Details feedback={feedback} />
          </div>
        </section>

      </div>
    </main>
  );
};

export default Resume;