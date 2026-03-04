const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const PDFS_DIR = path.join(__dirname, '..', '..', 'pdfs');

// Ensure pdfs directory exists
if (!fs.existsSync(PDFS_DIR)) {
  fs.mkdirSync(PDFS_DIR, { recursive: true });
}

/**
 * Generate a PDF from an HTML string using Puppeteer.
 * @param {string} html - Full HTML document string
 * @param {number|string} templateId - Template ID for filename
 * @returns {Promise<string>} Absolute path to the generated PDF file
 */
async function generatePdf(html, templateId) {
  const timestamp = Date.now();
  const filename = `${timestamp}-${templateId}.pdf`;
  const filePath = path.join(PDFS_DIR, filename);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true,
    });
  } finally {
    await browser.close();
  }

  return filePath;
}

module.exports = { generatePdf };
