#!/usr/bin/env node
/**
 * Generate Portrait/Mobile Version from Landscape Infographic
 * Creates a tall, phone-friendly PNG from HTML
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function generatePortrait(inputPath, outputPath) {
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ File not found: ${inputPath}`);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const fileUrl = 'file://' + path.resolve(inputPath);
  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Set viewport to phone portrait
  await page.setViewportSize({ width: 430, height: 932 });

  // Inject portrait stylesheet
  await page.addStyleTag({
    content: `
      body { width: 430px !important; height: auto !important; min-height: 932px; }
      .poster { width: 430px !important; height: auto !important; min-height: 932px; padding: 24px 16px !important; }
      .main { flex-direction: column !important; }
      .left-col, .right-col { width: 100% !important; }
      .why-grid { grid-template-columns: 1fr !important; }
    `
  });

  await page.waitForTimeout(500);
  const height = await page.evaluate(() => document.body.scrollHeight);
  await page.setViewportSize({ width: 430, height: Math.max(height, 932) });

  await page.screenshot({ path: outputPath, fullPage: true, type: 'png' });
  await browser.close();

  const stats = fs.statSync(outputPath);
  console.log(`✅ Portrait PNG: ${outputPath} (${(stats.size/1024).toFixed(1)} KB, 430×${Math.max(height,932)})`);
}

const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('Usage: node generate-portrait.js <input.html> [output.png]');
  process.exit(1);
}

generatePortrait(args[0], args[1] || args[0].replace('.html', '-mobile.png'))
  .catch(err => { console.error('Error:', err.message); process.exit(1); });
