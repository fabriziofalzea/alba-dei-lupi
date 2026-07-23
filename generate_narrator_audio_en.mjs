/**
 * generate_narrator_audio_en.mjs
 * Genera i 31 MP3 del narratore in INGLESE usando il proxy Vercel dell'app.
 * Gemello di generate_narrator_audio.mjs — stessa voce (Daniel, madrelingua EN),
 * stesso proxy (nessuna API key locale), output in public/narrator/en/.
 * Esegui con: node generate_narrator_audio_en.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROXY_URL = 'https://lupus-in-fabula-eight.vercel.app/api/speak';
const VOICE_ID  = 'onwK4e9ZLuTAKqWW03F9'; // Daniel — British native voice
const OUT_DIR   = path.join(__dirname, 'public', 'narrator', 'en');
const DELAY_MS  = 800;

// ── 31 frasi EN (testi da NARRATOR_RECORDING_GUIDE_EN.md, stessi nomi file dell'IT) ──
const FILES = [
  { file: 'night_open.mp3',
    text: 'Night falls over the village. Silence swallows every sound, every movement.' },

  { file: 'cupido_open.mp3',
    text: 'Cupid, open your eyes. Choose the two hearts that will beat as one — your arrow will decide their fate forever.' },
  { file: 'cupido_close.mp3',
    text: 'Cupid, close your eyes.' },

  { file: 'mitomane_open.mp3',
    text: 'The Mimic, open your eyes. Choose the mask you will wear for the rest of the game.' },
  { file: 'mitomane_close.mp3',
    text: 'The Mimic, close your eyes.' },

  { file: 'veggente_open.mp3',
    text: 'The Seer, open your eyes. Choose who you want to observe tonight.' },
  { file: 'veggente_close.mp3',
    text: 'The Seer, close your eyes.' },

  { file: 'guardia_open.mp3',
    text: 'The Bodyguard, open your eyes. Who will you protect tonight with your life?' },
  { file: 'guardia_close.mp3',
    text: 'The Bodyguard, close your eyes.' },

  { file: 'figlio_dei_lupi_open.mp3',
    text: 'The Wolf Child, open your eyes. The blood calls, but does not yet answer. Watch in silence.' },
  { file: 'figlio_dei_lupi_close.mp3',
    text: 'The Wolf Child, close your eyes.' },

  { file: 'lupi_open.mp3',
    text: 'The Werewolves, open your eyes. Recognize each other in the darkness. The pack decides — who falls tonight?' },
  { file: 'lupi_close.mp3',
    text: 'The Werewolves, close your eyes.' },

  { file: 'strega_open.mp3',
    text: 'The Witch, open your eyes. The werewolves have already chosen who to kill. Save, poison, or pass?' },
  { file: 'strega_close.mp3',
    text: 'The Witch, close your eyes.' },

  { file: 'medium_open.mp3',
    text: 'The Medium, open your eyes. The dead speak, if you know how to listen. Point to a spirit — you will learn their secret.' },
  { file: 'medium_close.mp3',
    text: 'The Medium, close your eyes.' },

  { file: 'sciamano_open.mp3',
    text: 'The Shaman, open your eyes. You can call back a lost soul — choose who to bring back among the living.' },
  { file: 'sciamano_close.mp3',
    text: 'The Shaman, close your eyes.' },

  { file: 'role_reveal.mp3',
    text: 'Every face hides the truth. Discover who you really are.' },

  { file: 'dawn_victim_reveal.mp3',
    text: 'Everyone, open your eyes. The night has claimed a victim. Their name will now appear on your screens.' },
  { file: 'dawn_no_victim.mp3',
    text: 'Everyone, open your eyes. Dawn arrives quietly. The shadows retreat. The night passed without blood. The village finds itself intact at the new day.' },
  { file: 'dawn_strega_heal.mp3',
    text: 'Everyone, open your eyes. Dawn arrives quietly. The shadows retreat. A mysterious potion pushed death away. There are no victims tonight.' },
  { file: 'dawn_figlio_transformed.mp3',
    text: 'Everyone, open your eyes. Dawn arrives quietly. The shadows retreat. In the woods, a creature has awakened. The village remains intact — for now.' },

  { file: 'day_victim_reveal.mp3',
    text: 'The one who was named will now appear on your screens.' },
  { file: 'day_no_majority.mp3',
    text: 'No one reaches a majority. The village remains divided. Night is coming…' },

  { file: 'end_lupi_win.mp3',
    text: 'The village has fallen. The werewolves emerge from the shadows, their howl echoing through the night. The pack has triumphed.' },
  { file: 'end_villaggio_win.mp3',
    text: 'The last werewolf revealed. The village rejoices — peace returns among the houses, the doors open again, the candles are relit.' },
  { file: 'end_lupi_win_short.mp3',
    text: 'The pack has triumphed. The village has fallen.' },
  { file: 'end_villaggio_win_short.mp3',
    text: 'The village has won. Peace has returned.' },

  { file: 'test_voice.mp3',
    text: 'The night. The secrets of the village awaken.' },
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function generateFile({ file, text }) {
  const outPath = path.join(OUT_DIR, file);
  if (fs.existsSync(outPath)) {
    console.log(`  ⏭  ${file} — già presente, skip`);
    return;
  }
  const res = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voiceId: VOICE_ID }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs ${res.status}: ${err}`);
  }
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(outPath, Buffer.from(buffer));
  console.log(`  ✅  ${file}`);
}

async function main() {
  console.log(`\n🎙  Generazione audio narratore EN — ${FILES.length} file\n`);
  console.log(`   Proxy    : ${PROXY_URL}`);
  console.log(`   Voice ID : ${VOICE_ID} (Daniel, EN native)`);
  console.log(`   Output   : ${OUT_DIR}\n`);

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  let ok = 0, skipped = 0, errors = 0;
  for (const item of FILES) {
    try {
      const existed = fs.existsSync(path.join(OUT_DIR, item.file));
      await generateFile(item);
      existed ? skipped++ : ok++;
    } catch (e) {
      console.error(`  ❌  ${item.file} — ${e.message}`);
      errors++;
    }
    await sleep(DELAY_MS);
  }

  console.log('\n────────────────────────────────');
  console.log(`  ✅  Generati  : ${ok}`);
  console.log(`  ⏭  Saltati   : ${skipped} (già presenti)`);
  console.log(`  ❌  Errori    : ${errors}`);
  if (errors === 0) {
    console.log('\n🎉  Tutti i file EN sono pronti in public/narrator/en/');
    console.log('   Ora popola window.NARRATOR_STATIC_AUDIO.en in src/App.jsx\n');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
