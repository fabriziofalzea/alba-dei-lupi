/**
 * capture_screenshots_it.mjs
 * Genera screenshot IT per App Store (Dynamic Island — 1206x2622) via Playwright headless.
 * Usa il dev server locale (localhost:5173), forza lingua IT, naviga le schermate chiave.
 * Esegui con: node capture_screenshots_it.mjs
 * Output: screenshots_it/*.png
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIR = 'screenshots_it';
const BASE_URL = 'http://localhost:5173';

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 402, height: 874 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    locale: 'it-IT',
  });
  const page = await context.newPage();

  // Primo load per poter scrivere localStorage sullo stesso origin
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('lif_lang', 'it');
    localStorage.setItem('lif_privacy_accepted', 'true');
    localStorage.setItem('lif_tutorial_done', 'true');
  });
  await page.reload({ waitUntil: 'networkidle' });
  await sleep(1200); // assestamento animazioni CSS (nebula drift, shimmer)

  // 1. Home screen
  await page.screenshot({ path: path.join(OUT_DIR, '01_home.png') });
  console.log('✅ 01_home.png');

  // 2. New Game -> step 1 (who's playing)
  await page.click('text=Crea Nuova Partita');
  await sleep(600);
  await page.screenshot({ path: path.join(OUT_DIR, '02_new_game_step1.png') });
  console.log('✅ 02_new_game_step1.png');

  // Aggiungi qualche giocatore — Enter nel campo chiama addPlayer() (App.jsx:2482), più affidabile di un click
  // Nota: il placeholder usa l'ellissi unicode "…" (U+2026), non tre punti ASCII — match parziale per sicurezza
  const names = ['Alice', 'Marco', 'Giulia', 'Luca', 'Sara'];
  const nameInput = page.getByPlaceholder(/Nome giocatore/);
  for (const name of names) {
    await nameInput.fill(name);
    await nameInput.press('Enter');
    await sleep(300);
  }
  await sleep(300);
  await page.screenshot({ path: path.join(OUT_DIR, '03_new_game_players.png') });
  console.log('✅ 03_new_game_players.png');

  // Step 1 -> 2: "→ Continue"
  await page.getByRole('button', { name: /Continua|Avanti/i }).first().click();
  await sleep(700);
  await page.screenshot({ path: path.join(OUT_DIR, '04_werewolf_count.png') });
  console.log('✅ 04_werewolf_count.png');

  // Step 2 -> 3: "→ Choose the roles" (screen pack/paywall, la più importante per l'ASO)
  await page.getByRole('button', { name: /Scegli i ruoli/i }).first().click();
  await sleep(700);
  await page.screenshot({ path: path.join(OUT_DIR, '05_choose_roles.png') });
  console.log('✅ 05_choose_roles.png');

  await browser.close();
  console.log('\n🎉 Screenshot generati in ' + OUT_DIR + '/');
}

main().catch(e => { console.error('❌', e); process.exit(1); });
