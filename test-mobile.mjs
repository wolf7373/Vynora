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
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  // Click Play Instant Mix on Mobile Home
  console.log('Clicking Play Instant Mix on Mobile...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.innerText && b.innerText.includes('Play Instant Mix'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_mobile_playing_home.png') });

  // Check the player bar on mobile
  console.log('Clicking PlayerBar to open drawer on mobile...');
  await page.evaluate(() => {
    const footer = document.querySelector('footer');
    if (footer) footer.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_mobile_drawer_open.png') });

  // Switch to Search tab on mobile while playing
  console.log('Closing drawer and switching to search on mobile...');
  await page.evaluate(() => {
    // Click close or outside or mobile nav
    const closeBtn = document.querySelector('button[aria-label*="close" i], button[aria-label*="Close" i]');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));
  
  await page.evaluate(() => {
    const navItems = Array.from(document.querySelectorAll('nav[aria-label="Mobile Navigation"] button'));
    if (navItems[1]) navItems[1].click(); // Search is 2nd tab
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13_mobile_search_while_playing.png') });

  await browser.close();
  console.log('Mobile test completed!');
}

run().catch(console.error);

