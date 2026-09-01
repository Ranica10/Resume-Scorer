import ScoreBadge from "./ScoreBadge";
import ScoreGauge from "./ScoreGauge"

// Different categories of resume feedback with their respective scores
const Category = ({ title, score }: { title: string, score: number }) => {
    // Determine the text color based on the score
    const textColour = score > 70 ? 'text-badge-green-text'
                        : score > 49 ? 'text-badge-yellow-text'
                        : 'text-badge-red-text';

    return (
        <div className="resume-summary">
            {/* Each category displays its title and score */}
            <div className="category">
                <div className="flex flex-row gap-2 items-center justify-center">
                    <p className="text-xl font-serif">{title}</p>
                    <ScoreBadge score={score} />
                </div>
                <p className="text-xl font-serif">
                    {/* The score is displayed in a color that indicates its level */}
                    <span className={textColour}>{score}</span>/100
                </p>
            </div>
        </div>
    )
}

const Summary = ({ feedback }: { feedback: Feedback }) => {
    return (
        <div className="bg-paper-card border border-line rounded-sm w-full">
            {/* Gauge graphic w/ score progress bar */}
            <div className="flex flex-row items-center p-6 gap-8 border-b border-line">
                <ScoreGauge score={feedback.overallScore} />

                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-serif font-medium text-ink">Your Resume Score</h2>
                    <p className="text-sm text-ink-soft">This score is calculated based on the variables below:</p>
                </div>
            </div>

            {/* List of categories with their scores */}
            <Category title="Tone & Style" score={feedback.toneAndStyle.score} />
            <Category title="Content" score={feedback.content.score} />
            <Category title="Structure" score={feedback.structure.score} />
            <Category title="Skills" score={feedback.skills.score} />
        </div>
    )
}

export default Summary