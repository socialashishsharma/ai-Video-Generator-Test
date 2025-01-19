import * as pdfjsLib from 'pdfjs-dist';

// Import the worker directly from node_modules
import PDFWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = PDFWorker;

export async function readPDFContent(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .trim();
      
      if (pageText) {
        fullText += pageText + '\n\n';
      }
    }

    if (!fullText.trim()) {
      throw new Error('Could not extract text from PDF. The file might be empty or contain only images.');
    }

    // Clean up the extracted text
    return fullText
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters
      .trim();
  } catch (error) {
    console.error('PDF reading error:', error);
    throw new Error('Failed to read PDF file. Please ensure it contains extractable text.');
  }
}

export async function readTextContent(file: File): Promise<string> {
  try {
    const text = await file.text();
    const cleanedText = text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters
      .trim();

    if (!cleanedText) {
      throw new Error('Text file is empty');
    }

    return cleanedText;
  } catch (error) {
    console.error('Text file reading error:', error);
    throw new Error('Failed to read text file');
  }
}