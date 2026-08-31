import { Link } from "react-router";
import ScoreCircle from "./ScoreCircle";

type ResumeCardData = {
  id: string;
  company_name: string | null;
  job_title: string | null;
  feedback: {
    overallScore?: number;
  } | null;
  imageUrl?: string;
};

const ResumeCard = ({
  resume: {
    id,
    company_name,
    job_title,
    feedback,
    imageUrl,
  },
}: {
  resume: ResumeCardData;
}) => {
  return (
    <Link
      to={`/resume/${id}`}
      className="resume-card animate-in fade-in duration-1000"
    >
      <div className="resume-card-header">
        {/* Info */}
        <div className="flex flex-col gap-2">
          <h2 className="!text-black font-bold break-words">
            {company_name || "Unknown Company"}
          </h2>

          <h3 className="text-lg break-words text-gray-500">
            {job_title || "Unknown Position"}
          </h3>
        </div>

        {/* Score */}
        <div className="flex-shrink-0">
          <ScoreCircle score={feedback?.overallScore || 0} />
        </div>
      </div>

      {/* Preview */}
      <div className="gradient-border animate-in fade-in duration-1000">
        <div className="w-full h-full">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="resume"
              className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
            />
          ) : (
            <div className="w-full h-[350px] max-sm:h-[200px] flex items-center justify-center bg-gray-100">
              <p className="text-gray-500">No preview available</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ResumeCard;