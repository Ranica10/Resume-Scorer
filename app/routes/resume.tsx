import { Link, useParams } from "react-router";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import Summary from "~/components/Summary";
import { resumes } from "~/constants";

export const meta = () => [
  { title: "Resume Scorer | Review" },
  { name: "description", content: "Detailed overview of your resume" },
];

const Resume = () => {
  const { id } = useParams();
  const resume = resumes.find((item) => item.id === id);

  if (!resume) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="flex flex-col gap-4 text-center">
          <h1 className="text-4xl font-bold">Resume not found</h1>
          <p>
            Persistent resume storage is not connected yet. Once a storage
            provider is added, saved resume reviews can be loaded here.
          </p>
          <Link to="/upload" className="primary-button w-fit mx-auto">
            Upload Resume
          </Link>
        </div>
      </main>
    );
  }

  const { imagePath, resumePath, feedback } = resume;

  return (
    <main className="!pt-0">
      <nav className="resume-nav">
        <Link to="/" className="back-button">
          <img src="/icons/back.svg" alt="go back" className="w-2.5 h-2.5" />
          <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
        </Link>
      </nav>

      <div className="flex flex-row w-full max-lg:flex-col-reverse">
        <section className="feedback-section bg-[url('/images/bg_small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
          <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
            <a href={resumePath} target="_blank" rel="noopener noreferrer">
              <img
                src={imagePath}
                className="w-full h-full object-contain rounded-2xl"
                title="resume"
                alt="Resume preview"
              />
            </a>
          </div>
        </section>

        <section className="feedback-section">
          <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
          <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
            <Summary feedback={feedback} />
            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
            <Details feedback={feedback} />
          </div>
        </section>
      </div>
    </main>
  );
};

export default Resume;
