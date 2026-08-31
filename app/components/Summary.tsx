import ScoreGauge from "./ScoreGauge"

// Different categories of resume feedback with their respective scores
const Category = ({ title, score }: { title: string, score: number }) => {
    // Determine the text color based on the score
    const textColour = score > 70 ? 'text-green-600'
                        : score > 49 ? 'text-yellow-600'
                        : 'text-red-600';

    return (
        <div className="resume-summary">
            {/* Each category displays its title and score */}
            <div className="category">
                <div className="flex flex-row gap-2 items-center justify-center">
                    <p className="text-2xl">{title}</p>
                </div>
                <p className="text-2xl">
                    {/* The score is displayed in a color that indicates its level */}
                    <span className={textColour}>{score}</span>/100
                </p>
            </div>
        </div>
    )
}

const Summary = ({ feedback }: { feedback: Feedback }) => {
    return (
        <div className="bg-white rounded-2xl shadow-md w-full">
            {/* Gauge graphic w/ score progress bar */}
            <div className="flex flex-row items-center p-4 gap-8">
                <ScoreGauge score={feedback.overallScore} />

                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold">Your Resume Score</h2>
                    <p className="text-sm text-gray-500">This score is calculated based on the variables below:</p>
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