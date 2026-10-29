import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = 'C:\\Users\\visha\\.gemini\\antigravity\\brain\\a481922a-93fd-4687-8e36-e394234872cf\\e2e-screenshots';
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  
  // Monitor console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Monitor failed network requests
  const failedRequests = [];
  page.on('requestfailed', request => {
    failedRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
  });

  console.log('Navigating to http://localhost:5173 (Desktop 1440x900)...');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Initial Desktop Home
  console.log('1. Capturing Initial Desktop Home...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_desktop_home_initial.png'), fullPage: false });

  // 2. Click "Play Instant Mix"
  console.log('2. Clicking Play Instant Mix...');
  const instantMixBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.innerText && b.innerText.includes('Play Instant Mix')) || null;
  });
  if (instantMixBtn && instantMixBtn.asElement()) {
    await instantMixBtn.asElement().click();
    await new Promise(r => setTimeout(r, 3000));
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_desktop_playing_track.png'), fullPage: false });

  // 3. Navigate to Search View
  console.log('3. Navigating to Search...');
  const searchBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button, a'));
    return buttons.find(b => b.innerText.trim() === 'Search' || b.getAttribute('aria-label')?.includes('Search'));
  });
  if (searchBtn && searchBtn.asElement()) {
    await searchBtn.asElement().click();
    await new Promise(r => setTimeout(r, 1500));
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_desktop_search_initial.png'), fullPage: false });

  // 4. Type search query "brooklyn baby"
  console.log('4. Typing search query "brooklyn baby"...');
  const searchInput = await page.$('input[placeholder*="Search"]');
  if (searchInput) {
    await searchInput.type('brooklyn baby', { delay: 50 });
    await new Promise(r => setTimeout(r, 4000));
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_desktop_search_results.png'), fullPage: false });

  // 5. Click the first song result
  console.log('5. Clicking first search result...');
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('.group.cursor-pointer, [role="row"], div[class*="cursor-pointer"]'));
    const target = rows.find(el => el.innerText && el.innerText.includes('Brooklyn Baby')) || rows[0];
    if (target) {
      target.scrollIntoView();
      target.click();
    }
  });
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_desktop_search_playing.png'), fullPage: false });

  // 6. Test Add to Playlist Modal
  console.log('6. Clicking Add to Playlist (+) button...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const plus = buttons.find(b => b.getAttribute('aria-label')?.includes('playlist') || b.querySelector('svg.lucide-plus') || b.innerHTML.includes('lucide-plus'));
    if (plus) {
      plus.click();
    }
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_desktop_add_to_playlist_modal.png'), fullPage: false });

  // 7. Mobile Viewport (iPhone 390x844)
  console.log('7. Switching to Mobile Viewport (390x844)...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_mobile_home.png'), fullPage: false });

  // 8. Mobile Search View
  console.log('8. Mobile Search View...');
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('button, nav a, div[role="button"]'));
    const searchTab = items.find(el => el.innerText?.trim() === 'Search' || el.getAttribute('aria-label')?.toLowerCase().includes('search'));
    if (searchTab) searchTab.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_mobile_search.png'), fullPage: false });

  // 9. Mobile Now Playing Bar & Drawer
  console.log('9. Mobile Play Track & Open Drawer...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const playBtn = buttons.find(b => b.innerText && b.innerText.includes('Play Instant Mix')) || buttons.find(b => b.querySelector('svg.lucide-play'));
    if (playBtn) playBtn.click();
  });
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_mobile_player_bar.png'), fullPage: false });

  // Click player bar to open mobile drawer
  await page.evaluate(() => {
    const bar = document.querySelector('footer') || document.querySelector('[class*="PlayerBar"]');
    if (bar) bar.click();
  });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_mobile_drawer_open.png'), fullPage: false });

  console.log('Console Errors found:', consoleErrors);
  console.log('Failed Requests found:', failedRequests.slice(0, 10));

  await browser.close();
  console.log('Testing completed! Screenshots saved to:', SCREENSHOT_DIR);
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
