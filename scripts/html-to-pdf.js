#!/usr/bin/env node
/**
 * Generate A4 Landscape PDF from HTML
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function generatePDF(inputPath, outputPath) {
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ File not found: ${inputPath}`);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const fileUrl = 'file://' + path.resolve(inputPath);
  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  await page.pdf({
    path: outputPath,
    width: '297mm',
    height: '210mm',
    printBackground: true,
    preferCSSPageSize: true
  });

  await browser.close();

  const stats = fs.statSync(outputPath);
  console.log(`✅ PDF: ${outputPath} (${(stats.size/1024).toFixed(1)} KB)`);
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node html-to-pdf.js <input.html> <output.pdf>');
  process.exit(1);
}

generatePDF(args[0], args[1])
  .catch(err => { console.error('Error:', err.message); process.exit(1); });
