import mammoth from 'mammoth';

export async function processDocxFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Error processing DOCX file:', error);
    throw new Error('Failed to process DOCX file. Please ensure it\'s a valid Word document.');
  }
}

export function generateCSV(results: any[]): string {
  const headers = ['Rank', 'Resume Title', 'Match Score', 'Percentage', 'Skills Matched', 'Experience Matched', 'Education Matched', 'General Matched'];
  
  const rows = results.map((result, index) => [
    index + 1,
    result.resume.title,
    result.score.toFixed(1),
    `${result.percentage}%`,
    result.breakdown.skills,
    result.breakdown.experience,
    result.breakdown.education,
    result.breakdown.general
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  return csvContent;
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}