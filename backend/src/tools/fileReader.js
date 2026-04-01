const pdfParse = require('pdf-parse');
const fs = require('fs');

const readPDF = async (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, error: 'File not found' };
    }

    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);

    return {
      success: true,
      text: data.text || '',
      pages: data.numpages || 0
    };
  } catch (error) {
    console.error('PDF Read Error:', error);
    return { success: false, error: 'Failed to read PDF' };
  }
};

const readTextFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, error: 'File not found' };
    }

    const content = fs.readFileSync(filePath, 'utf8');

    return { success: true, content };
  } catch (error) {
    console.error('Text Read Error:', error);
    return { success: false, error: 'Failed to read file' };
  }
};

module.exports = { readPDF, readTextFile };