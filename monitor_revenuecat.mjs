/**
 * monitor_revenuecat.mjs
 * Legge le metriche aggregate di RevenueCat (revenue, trial, conversioni) via API v2.
 * Richiede in .env: REVENUECAT_SECRET_KEY, REVENUECAT_PROJECT_ID
 *   - Secret Key: RevenueCat Dashboard → Project Settings → API Keys → Secret Keys
 *   - Project ID: visibile nell'URL della dashboard (app.revenuecat.com/projects/<PROJECT_ID>/...)
 * Esegui con: node monitor_revenuecat.mjs
 */
import fs from 'fs';

function loadEnv() {
  const text = fs.readFileSync(new URL('./.env', import.meta.url), 'utf8');
  const env = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const key = env.REVENUECAT_SECRET_KEY;
  const projectId = env.REVENUECAT_PROJECT_ID;

  if (!key) {
    console.error('❌ REVENUECAT_SECRET_KEY mancante in .env — vedi istruzioni nel commento in cima al file.');
    process.exit(1);
  }
  if (!projectId) {
    console.error('❌ REVENUECAT_PROJECT_ID mancante in .env — prendilo dall\'URL della dashboard RevenueCat.');
    process.exit(1);
  }

  const url = `https://api.revenuecat.com/v2/projects/${projectId}/metrics/overview`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    console.error(`❌ RevenueCat API ${res.status}: ${await res.text()}`);
    console.error('Se 401/403: chiave o permessi errati. Se 404: endpoint/project_id da verificare — la API v2 di RevenueCat evolve, potremmo dover aggiustare il path.');
    process.exit(1);
  }

  const data = await res.json();
  console.log('📊 RevenueCat — metriche overview\n');
  console.log(JSON.stringify(data, null, 2));
}

main().catch(e => { console.error('❌ Errore:', e.message); process.exit(1); });
