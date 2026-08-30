import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { usePuterStore } from "~/lib/puter";

export const meta = () => {[
    { title: "Resume Scorer | Review" },
    { name: "description", content: "Detailed overview of your resume" },
]}

const resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();

    // Unique uuid generated per resume
    const { id } = useParams();

    const [imageUrl, setImageUrl] = useState("");
    const [resumeUrl, setResumeUrl] = useState("");
    const [feedback, setFeedback] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const loadResume = async () => {
            // Fetch the current resume by its uuid
            const resume = await kv.get(`resume:${id}`);
            if (!resume) return;

            // Get the data associated w/ the resume
            const data = JSON.parse(resume);
            
            // Read the resume file
            const resumeBlob = await fs.read(data.resumePath)
            if (!resumeBlob) return;

            // Create a URL for the resume file to display it in the browser
            const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" })
            const resumeUrl = URL.createObjectURL(pdfBlob)

            setResumeUrl(resumeUrl);

            // Read the image file
            const imageBlob = await fs.read(data.imagePath)
            if (!imageBlob) return;

            // Create a URL for the image file to display it in the browser
            const imageUrl = URL.createObjectURL(imageBlob)
            setImageUrl(imageUrl); 

            console.log({resumeUrl, imageUrl, feedback: data.feedback})
        }

        // Load the resume
        loadResume();
    }, [id])

    return (
        <main className="!pt-0">
            {/* Navbar */}
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="go back" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>

            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section bg-[url('/images/bg_small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
                    {imageUrl && resumeUrl && (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img 
                                    src={imageUrl}
                                    className="w-full h-full object-contain rounded-2xl"
                                    title="resume"
                                />
                            </a>
                        </div>
                    )}
                </section>
            </div>
        </main>
    )
}

export default resume