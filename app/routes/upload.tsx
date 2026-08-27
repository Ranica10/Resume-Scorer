import { useState, type FormEvent } from "react"
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar"

const upload = () => {
  const [ isProcessing, setIsProcessing ] = useState(false);
  const [statusText, setStatusText] = useState("")

  // State to hold the selected file
  const [file, setFile] = useState<File | null>(null);

  // Handle file selection from the FileUploader component
  const handleFileSelect = (file: File | null) => {
    setFile(file);
  }

  const handleSubmit = ((e: FormEvent<HTMLFormElement>)=> {
    // Prevent the default form submission behavior (refreshing the page)
    e.preventDefault();

    // Get access to the form element
    const form = e.currentTarget.closest("form")
    if (!form) return;

    // Get the form data
    const formData = new FormData(form);

    const companyName = formData.get("company-name")
    const jobTitle = formData.get("job-title")
    const jobDescription = formData.get("job-description")

    // console.log({
    //   companyName, jobTitle, jobDescription, file
    // })
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