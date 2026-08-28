/**
 * Format a file size in bytes into a human-readable string (Bytes, KB, MB, GB, TB)
 * @param bytes 
 * @returns A formatted string w/ the appropriate unit
 */
export function formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    // Determine the appropriate size unit based on the number of bytes
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    // Format the size to two decimal places and append the appropriate unit
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const generateUUID = () => crypto.randomUUID;