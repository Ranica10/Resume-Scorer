import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

import { formatSize } from "~/lib/utils";

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

    const maxFileSize = 20 * 1024 * 1024; // 20 MB

    const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({ 
        onDrop, 
        multiple: false, 
        accept: { 'application/pdf': ['.pdf'] }, 
        maxSize: maxFileSize,
    });

    const file = acceptedFiles[0] || null;

    return (
        <div className="w-full gradient-border">
            <div {...getRootProps()}>
                <input {...getInputProps()} />
                
                <div className="space-y-4 cursor-pointer">
                    {/* File got uploaded */}
                    {file ? (
                        <div className="uploader-selected-file" onClick={(e) => e.stopPropagation}>
                            <img src="/images/pdf.png" alt="pdf" className="size-10" />
                            <div className="flex items-center space-x-3">
                                <div>
                                    {/* File info */}
                                    <p className="text-sm font-medium text-gray-700 truncate max-w-xs">{file.name}</p>
                                    <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Nothing uploaded yet
                        <div>
                            <div className="mx-auto w-16 h-16 flex items-center justify-center">
                                <img src="/icons/info.svg" alt="upload" className="size-20 mb-2"/>
                            </div>
                            <p className="text-lg text-gray-500">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-med text-gray-500">PDF (max {formatSize(maxFileSize)})</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FileUploader