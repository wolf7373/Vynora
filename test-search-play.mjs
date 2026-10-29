import puppeteer from 'puppeteer-core';
import path from 'path';

const SCREENSHOT_DIR = 'C:\\Users\\visha\\.gemini\\antigravity\\brain\\a481922a-93fd-4687-8e36-e394234872cf\\e2e-screenshots';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  // Navigate to Search tab
  console.log('Navigating to Search tab...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const searchBtn = btns.find(b => b.innerText.trim() === 'Search');
    if (searchBtn) searchBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Type search query "Tum Hi Ho"
  console.log('Typing query Tum Hi Ho...');
  const input = await page.$('input[placeholder*="Search"]');
  if (input) {
    await input.type('Tum Hi Ho', { delay: 50 });
    await new Promise(r => setTimeout(r, 3000));
  }

  // Click on the song row directly
  console.log('Clicking the full song row...');
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('div[class*="grid-cols-12"][class*="cursor-pointer"]'));
    if (rows[0]) {
      rows[0].click();
    }
  });
  await new Promise(r => setTimeout(r, 3500));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14_desktop_row_clicked_playing.png') });

  // Open right dock video tab
  console.log('Opening right dock video tab...');
  await page.evaluate(() => {
    const dockVideoBtn = document.querySelector('button[title*="video" i], button[aria-label*="video" i]');
    if (dockVideoBtn) dockVideoBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15_desktop_dock_video_open.png') });

  await browser.close();
  console.log('Search row click test completed!');
}

run().catch(console.error);

