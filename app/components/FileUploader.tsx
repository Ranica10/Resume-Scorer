import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

// Props that get passed to this component
interface FileUploaderProps {
    // Function that gets called when a file is selected
    onFileSelect?: (file: File | null) => void
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
    // Handle file drop
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0] || null;

        // Call the onFileSelect function with the selected file
        onFileSelect?.(file);
    }, [onFileSelect])

    const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({ 
        onDrop, 
        multiple: false, 
        accept: { 'application/pdf': ['.pdf'] }, 
        maxSize: 20 * 1024 * 1024 // 20 MB
    });

    const file = acceptedFiles[0] || null;

    return (
        <div className="w-full gradient-border">
            <div {...getRootProps()}>
                <input {...getInputProps()} />
                
                <div className="space-y-4 cursor-pointer">
                    {/* Info icon */}
                    <div className="mx-auto w-16 h-16 flex items-center justify-center">
                        <img src="/icons/info.svg" alt="upload" className="size-20"/>
                    </div>
                    
                    {file ? (
                        <div>

                        </div>
                    ) : (
                        // Nothing uploaded yet
                        <div>
                            <p className="text-lg text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-med text-gray-500">PDF (max 20 MB)</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FileUploader