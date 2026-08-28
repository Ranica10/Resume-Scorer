import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar"
import { prepareInstructions } from "~/constants";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";

const upload = () => {
  // fs = file storage, kv = key-value storage functions
  const { auth, isLoading, fs, ai, kv } = usePuterStore();

  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("")

  // State to hold the selected file
  const [file, setFile] = useState<File | null>(null);

  // Handle file selection from the FileUploader component
  const handleFileSelect = (file: File | null) => {
    setFile(file);
  }

  // Analyze the resume w/ the provided info in the form
  const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: {
    companyName: string,
    jobTitle: string,
    jobDescription: string,
    file: File
  }) => {
    setIsProcessing(true);

    setStatusText("Uploading the file...")
    // get the uploaded resume
    const uploadedFile = await fs.upload([file])

    if (!uploadedFile) {
      setIsProcessing(false)
      return setStatusText("[ERR]: Failed to upload file :(")
    }

    setStatusText("Converting to image...");
    // Get the resume as a picture
    const imageFile = await convertPdfToImage(file);

    if (!imageFile?.file) {
      setIsProcessing(false)
      return setStatusText("[ERR]: Failed to convert PDF to image :(")
    }

    setStatusText("Uploading image...");
    // Upload the img to puter storage
    const uploadedImage = await fs.upload([imageFile.file])

    if (!uploadedImage) {
      setIsProcessing(false)
      return setStatusText("[ERR]: Failed to upload image :(")
    }

    setStatusText("Preparing data...")

    // generate new unique id for this instance
    const uuid = generateUUID();

    // Format the data
    const data = {
      id: uuid,
      resumePath: uploadedFile.path,
      imagePath: uploadedImage.path,
      companyName,
      jobTitle,
      jobDescription,
      feedback: {},
    };

    // Store in puter
    await kv.set(`resume:${uuid}`, JSON.stringify(data))

    setStatusText("Analyzing...")

    // Use puter ai for the resume feedback
    const feedback = await ai.feedback(
      uploadedImage.path,
      prepareInstructions({ jobTitle, jobDescription }) // use the prepared instructions to give to the ai
    )

    if (!feedback) {
      setIsProcessing(false)
      return setStatusText("[ERR]: Failed to analyze resume :(")
    }

    // Get the actual feedback text from the ai response
    const feedbackText = typeof feedback.message.content === "string"
      ? feedback.message.content
      : feedback.message.content[0];

    // Update the data with the feedback
    data.feedback = JSON.parse(feedbackText)
    await kv.set(`resume:${uuid}`, JSON.stringify(data))

    setStatusText("Analysis complete, redirecting...")

    console.log(data);
  }

  const handleSubmit = (async (e: FormEvent<HTMLFormElement>) => {
    // Prevent the default form submission behavior (refreshing the page)
    e.preventDefault();

    // Get access to the form element
    const form = e.currentTarget.closest("form")
    if (!form) return;

    // Get the form data
    const formData = new FormData(form);

    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    if (!file) {
      alert("[ERR]: Please upload a resume file before submitting.");
      return;
    }

    try {
      await handleAnalyze({
        companyName,
        jobTitle,
        jobDescription,
        file,
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      setStatusText("[ERR]: Resume analysis failed. Please try again.");
      setIsProcessing(false);
    }
  })

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
  )
}

export default upload