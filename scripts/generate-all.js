#!/usr/bin/env node
/**
 * Batch generate mobile assets for a product:
 * - mobile-cn.png (from mobile.html, Chinese)
 * - mobile-en.png (from mobile.html, English)
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generateProduct(productDir) {
  const mobilePath = path.join(productDir, 'mobile.html');
  const assetsDir = path.join(productDir, 'assets');
  
  if (!fs.existsSync(mobilePath)) {
    console.error(`❌ mobile.html not found: ${mobilePath}`);
    return;
  }
  
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({ headless: 'new' });
  const fileUrl = 'file://' + path.resolve(mobilePath);

  // Generate mobile-cn.png
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 430, height: 800, deviceScaleFactor: 2 });
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    const output = path.join(assetsDir, 'mobile-cn.png');
    await page.screenshot({ path: output, fullPage: true });
    const stats = fs.statSync(output);
    console.log(`  ✅ mobile-cn.png (${(stats.size/1024).toFixed(1)} KB)`);
    await page.close();
  }

  // Generate mobile-en.png
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 430, height: 800, deviceScaleFactor: 2 });
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));
    
    // Toggle English using multiple strategies
    await page.evaluate(() => {
      // Strategy 1: body.lang-en class (used by newer mobile.html)
      document.body.classList.add('lang-en');
      
      // Strategy 2: .lang-cn.active / .lang-en.active (used by 01, 02 mobile.html)
      document.querySelectorAll('.lang-cn.active').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.lang-en').forEach(el => el.classList.add('active'));
      
      // Strategy 3: Click EN button if present
      const enBtn = document.querySelector('[data-lang-btn="en"], .lang-btn:last-child');
      if (enBtn) enBtn.click();
    });
    
    await new Promise(r => setTimeout(r, 300));
    const output = path.join(assetsDir, 'mobile-en.png');
    await page.screenshot({ path: output, fullPage: true });
    const stats = fs.statSync(output);
    console.log(`  ✅ mobile-en.png (${(stats.size/1024).toFixed(1)} KB)`);
    await page.close();
  }

  await browser.close();
  console.log(`✅ All mobile assets generated for ${path.basename(productDir)}\n`);
}

async function main() {
  const products = [
    '01-working-memory',
    '02-spaced-repetition', 
    '03-chunking',
    '04-cognitive-load',
    '05-flow',
    '06-retrieval-practice',
    '07-metacognition'
  ];
  
  for (const product of products) {
    const productDir = path.join(__dirname, '..', 'products', product);
    console.log(`\n📦 Generating mobile assets for ${product}...`);
    await generateProduct(productDir);
  }
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
