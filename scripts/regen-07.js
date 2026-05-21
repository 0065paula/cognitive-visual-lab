const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function generateProduct(productDir) {
  const indexPath = path.join(productDir, 'index.html');
  const assetsDir = path.join(productDir, 'assets');
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const fileUrl = 'file://' + path.resolve(indexPath);

  // CN PDF
  const page1 = await browser.newPage();
  await page1.goto(fileUrl, { waitUntil: 'networkidle' });
  await page1.waitForTimeout(1000);
  await page1.pdf({ path: path.join(assetsDir, 'poster-cn.pdf'), width: '297mm', height: '210mm', printBackground: true, preferCSSPageSize: true });
  console.log('✅ poster-cn.pdf');
  await page1.close();

  // EN PDF
  const page2 = await browser.newPage();
  await page2.goto(fileUrl, { waitUntil: 'networkidle' });
  await page2.waitForTimeout(1000);
  await page2.evaluate(() => document.body.classList.add('lang-en'));
  await page2.waitForTimeout(500);
  await page2.pdf({ path: path.join(assetsDir, 'poster-en.pdf'), width: '297mm', height: '210mm', printBackground: true, preferCSSPageSize: true });
  console.log('✅ poster-en.pdf');
  await page2.close();

  // CN Mobile PNG
  const page3 = await browser.newPage();
  await page3.goto(fileUrl, { waitUntil: 'networkidle' });
  await page3.waitForTimeout(1000);
  await page3.setViewportSize({ width: 430, height: 932 });
  await page3.addStyleTag({ content: `
    body { width: 430px !important; height: auto !important; min-height: 932px; overflow: visible !important; }
    .plate { width: 430px !important; height: auto !important; min-height: 932px; padding: 24px 16px !important; }
    .main { flex-direction: column !important; gap: 16px !important; }
    .left-col, .right-col { flex: none !important; width: 100% !important; }
    .lang-toggle { display: none !important; }
  `});
  await page3.waitForTimeout(500);
  const h1 = await page3.evaluate(() => document.body.scrollHeight);
  await page3.setViewportSize({ width: 430, height: Math.max(h1, 932) });
  await page3.screenshot({ path: path.join(assetsDir, 'mobile-cn.png'), fullPage: true, type: 'png' });
  console.log('✅ mobile-cn.png');
  await page3.close();

  // EN Mobile PNG
  const page4 = await browser.newPage();
  await page4.goto(fileUrl, { waitUntil: 'networkidle' });
  await page4.waitForTimeout(1000);
  await page4.evaluate(() => document.body.classList.add('lang-en'));
  await page4.setViewportSize({ width: 430, height: 932 });
  await page4.addStyleTag({ content: `
    body { width: 430px !important; height: auto !important; min-height: 932px; overflow: visible !important; }
    .plate { width: 430px !important; height: auto !important; min-height: 932px; padding: 24px 16px !important; }
    .main { flex-direction: column !important; gap: 16px !important; }
    .left-col, .right-col { flex: none !important; width: 100% !important; }
    .lang-toggle { display: none !important; }
  `});
  await page4.waitForTimeout(500);
  const h2 = await page4.evaluate(() => document.body.scrollHeight);
  await page4.setViewportSize({ width: 430, height: Math.max(h2, 932) });
  await page4.screenshot({ path: path.join(assetsDir, 'mobile-en.png'), fullPage: true, type: 'png' });
  console.log('✅ mobile-en.png');
  await page4.close();

  await browser.close();
}

generateProduct(path.join(__dirname, '..', 'products', '07-metacognition')).catch(console.error);
