export async function convertPdfToText(file: File): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("convertPdfToText must run in the browser");
  }

  const pdfjsLib = await import("pdfjs-dist");

  // Tell PDF.js where its worker is
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).href;

  const arrayBuffer = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
  }).promise;

  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);

    const content = await page.getTextContent();

    const pageText = content.items
      .map((item) => {
        if ("str" in item) {
          return item.str;
        }

        return "";
      })
      .join(" ");

    pages.push(pageText);
  }

  return pages.join("\n").trim();
}