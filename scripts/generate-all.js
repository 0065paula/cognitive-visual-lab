#!/usr/bin/env node
/**
 * Batch generate mobile assets for a product:
 * - mobile-cn.png (430px portrait, Chinese)
 * - mobile-en.png (430px portrait, English)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function generateProduct(productDir) {
  const indexPath = path.join(productDir, 'index.html');
  const assetsDir = path.join(productDir, 'assets');
  
  if (!fs.existsSync(indexPath)) {
    console.error(`❌ index.html not found: ${indexPath}`);
    return;
  }
  
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const fileUrl = 'file://' + path.resolve(indexPath);

  // Generate mobile-cn.png
  {
    const page = await browser.newPage();
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.setViewportSize({ width: 430, height: 932 });
    await page.addStyleTag({
      content: `
        body { width: 430px !important; height: auto !important; min-height: 932px; overflow: visible !important; }
        .plate { width: 430px !important; height: auto !important; min-height: 932px; padding: 24px 16px !important; }
        .main { flex-direction: column !important; gap: 16px !important; }
        .left-col, .right-col { flex: none !important; width: 100% !important; }
        .lang-toggle { display: none !important; }
        .juggler-visual .load-label { width: 60px !important; font-size: 7pt !important; }
        .retrieval-visual { gap: 20px !important; }
        .bar { width: 30px !important; }
        .flow-channel { height: 100px !important; }
      `
    });
    await page.waitForTimeout(500);
    const height = await page.evaluate(() => document.body.scrollHeight);
    await page.setViewportSize({ width: 430, height: Math.max(height, 932) });
    const output = path.join(assetsDir, 'mobile-cn.png');
    await page.screenshot({ path: output, fullPage: true, type: 'png' });
    const stats = fs.statSync(output);
    console.log(`  ✅ mobile-cn.png (${(stats.size/1024).toFixed(1)} KB, 430×${Math.max(height,932)})`);
    await page.close();
  }

  // Generate mobile-en.png
  {
    const page = await browser.newPage();
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.evaluate(() => { document.body.classList.add('lang-en'); });
    await page.setViewportSize({ width: 430, height: 932 });
    await page.addStyleTag({
      content: `
        body { width: 430px !important; height: auto !important; min-height: 932px; overflow: visible !important; }
        .plate { width: 430px !important; height: auto !important; min-height: 932px; padding: 24px 16px !important; }
        .main { flex-direction: column !important; gap: 16px !important; }
        .left-col, .right-col { flex: none !important; width: 100% !important; }
        .lang-toggle { display: none !important; }
        .juggler-visual .load-label { width: 60px !important; font-size: 7pt !important; }
        .retrieval-visual { gap: 20px !important; }
        .bar { width: 30px !important; }
        .flow-channel { height: 100px !important; }
      `
    });
    await page.waitForTimeout(500);
    const height = await page.evaluate(() => document.body.scrollHeight);
    await page.setViewportSize({ width: 430, height: Math.max(height, 932) });
    const output = path.join(assetsDir, 'mobile-en.png');
    await page.screenshot({ path: output, fullPage: true, type: 'png' });
    const stats = fs.statSync(output);
    console.log(`  ✅ mobile-en.png (${(stats.size/1024).toFixed(1)} KB, 430×${Math.max(height,932)})`);
    await page.close();
  }

  await browser.close();
  console.log(`✅ All assets generated for ${path.basename(productDir)}\n`);
}

async function main() {
  const products = ['04-cognitive-load', '05-flow', '06-retrieval-practice'];
  
  for (const product of products) {
    const productDir = path.join(__dirname, '..', 'products', product);
    console.log(`\n📦 Generating assets for ${product}...`);
    await generateProduct(productDir);
  }
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
