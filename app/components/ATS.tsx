import { cn } from "~/lib/utils";

const ATS = ({
  score,
  suggestions,
}: {
  score: number;
  suggestions: { type: "good" | "improve"; tip: string }[];
}) => {
  return (
    // Gradient background color changes based on the score (green, yellow, red)
    <div
      className={cn(
        "rounded-sm border w-full p-8 flex flex-col gap-4 bg-paper-card",
        score > 69
          ? "border-moss/40"
          : score > 49
            ? "border-badge-yellow"
            : "border-rust/40"
      )}
    >
      <div className="flex flex-row gap-4 items-center border-b border-line pb-4">
        <img
          src={
            score > 69
              ? "/icons/ats-good.svg"
              : score > 49
                ? "/icons/ats-warning.svg"
                : "/icons/ats-bad.svg"
          }
          alt="ATS"
          className="w-10 h-10"
        />
        {/* ATS score description */}
        <p className="text-2xl font-serif font-medium text-ink">ATS Score &mdash; {score}/100</p>
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-medium text-xl text-ink">
          How well does your resume pass through Applicant Tracking Systems?
        </p>
        <p className="text-lg text-ink-soft">
          Your resume was scanned like an employer would. Here's how it
          performed:
        </p>
        {/* List of suggestions for improving the resume */}
        {suggestions.map((suggestion, index) => (
          <div className="flex flex-row gap-2 items-center" key={index}>
            <img
              src={
                suggestion.type === "good"
                  ? "/icons/check.svg"
                  : "/icons/warning.svg"
              }
              alt="ATS"
              className="w-4 h-4"
            />
            <p className="text-lg text-ink-soft">{suggestion.tip}</p>
          </div>
        ))}
        <p className="text-lg text-ink-soft">
          Want a better score? Improve your resume by applying the suggestions
          listed below:
        </p>
      </div>
    </div>
  );
};

export default ATS;