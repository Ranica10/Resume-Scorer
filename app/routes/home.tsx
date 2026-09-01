import { useEffect, useState } from "react";

import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";

import type { Route } from "./+types/home";

import { useSession, useUser } from "@clerk/react-router";
import { createClerkSupabaseClient } from "~/lib/supabase";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resume Scorer" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

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

  created_at?: string;

  // generated client-side so ResumeCard can display the image
  imageUrl?: string;
};

export default function Home() {
  const { user } = useUser();
  const { session } = useSession();

  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResumes = async () => {
      // Clerk may still be loading
      if (!user || !session) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError("");

        const supabase = createClerkSupabaseClient(() =>
          session.getToken()
        );

        // Get all resumes owned by this user.
        // Your RLS policy should also enforce this server-side.
        const { data, error: fetchError } = await supabase
          .from("resumes")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        if (!data) {
          setResumes([]);
          return;
        }

        // Generate signed image URLs because resume-images is private
        const resumesWithImages = await Promise.all(
          data.map(async (resume) => {
            if (!resume.image_path) {
              return {
                ...resume,
                imageUrl: "",
              };
            }

            const { data: signedImage, error: signedImageError } =
              await supabase.storage
                .from("resume-images")
                .createSignedUrl(resume.image_path, 60 * 60);

            if (signedImageError) {
              console.error(
                `Failed to create image URL for resume ${resume.id}:`,
                signedImageError
              );

              return {
                ...resume,
                imageUrl: "",
              };
            }

            return {
              ...resume,
              imageUrl: signedImage.signedUrl,
            };
          })
        );

        setResumes(resumesWithImages);
      } catch (error) {
        console.error("Failed to load resumes:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Could not load resumes"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadResumes();
  }, [user, session]);

  return (
    <main className="bg-paper min-h-screen">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications & Resume Ratings</h1>
          <h2>Review your submissions and check AI-powered feedback.</h2>
        </div>

        {isLoading && (
          <div className="text-center">
            <p className="text-ink-soft">Loading resumes...</p>
          </div>
        )}

        {error && (
          <div className="text-center">
            <p className="text-rust">{error}</p>
          </div>
        )}

        {!isLoading && !error && resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
              />
            ))}
          </div>
        )}

        {!isLoading && !error && resumes.length === 0 && (
          <div className="text-center">
            <p className="text-ink-soft">No resumes uploaded yet.</p>
          </div>
        )}
      </section>
    </main>
  );
}