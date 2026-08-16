import React, { useState, useEffect, useMemo, useRef, useCallback, Suspense } from 'react';
import { usePurchases } from './hooks/usePurchases';
import { t, getLang, setLang, useLanguage, subscribeLang } from './i18n/i18n';
import { IT as I18N_IT, EN as I18N_EN } from './i18n/translations';

// === FIREBASE IMPORTS ====
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';
import { trackEvent } from './lib/analytics';

// Riassegna per i riferimenti globali
window.firebase = firebase;
window.getLang = getLang;

// === GLOBAL HELPERS E LOGIC ===

    export default function AppWrapper() { return <App />; }

      
      
      
      const checkGlobal = (name, obj) => {
        if (!obj) {
          console.log(`CHECK FAILED: ${name} is UNDEFINED`);
          throw new Error(`Libreria critica mancante: ${name}`);
        } else {
          console.log(`CHECK OK: ${name} is present`);
        }
      };

      
      
      

      // Rimuove il caricamento
      

      console.log("App Bootstrapping inside wrapper...");
    window.NARRATOR_IMG = '/narrator.png'; // Daniel — voce narratore di default

const EL_DEFAULT_VOICE = 'onwK4e9ZLuTAKqWW03F9'; // Daniel (ElevenLabs)
window.EL_VOICES = [
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam' },
  { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice' },
];

window.getELConfig = () => ({
  key:   localStorage.getItem('lif_el_key')   || '',
  voice: localStorage.getItem('lif_el_voice') || EL_DEFAULT_VOICE,
  customVoice: localStorage.getItem('lif_el_custom_voice') || '',
});

// --- AUDIO UNLOCK PER iOS SAFARI/WKWEBVIEW ---
window._elAudio = null;
window._globalAudio = new Audio();
window._globalAudio.autoplay = true;
window._audioUnlocked = false;

// Sblocca l'audio globale al primo tap sullo schermo
const unlockAudio = () => {
  if (!window._audioUnlocked) {
    window._globalAudio.play().catch(() => {});
    window._audioUnlocked = true;
    document.removeEventListener('pointerdown', unlockAudio);
    document.removeEventListener('click', unlockAudio);
  }
};
document.addEventListener('pointerdown', unlockAudio, { once: true });
document.addEventListener('click', unlockAudio, { once: true });

// Riproduce un blob audio e gestisce eventi narrator_start/end
window._playAudioBlob = (blob) => {
  const url = URL.createObjectURL(blob);
  // Usa l'audio globale pre-sbloccato se disponibile (essenziale per Capacitor/iOS)
  const audio = window._audioUnlocked ? window._globalAudio : new Audio();
  audio.src = url;
  window._elAudio = audio;
  
  audio.onended = () => { URL.revokeObjectURL(url); window.dispatchEvent(new Event('narrator_end')); };
  audio.onerror = () => { URL.revokeObjectURL(url); window.dispatchEvent(new Event('narrator_end')); };
  audio.play().catch(e => {
    console.warn("Audio play blocked by iOS:", e);
    URL.revokeObjectURL(url);
    window.dispatchEvent(new Event('narrator_end'));
  });
};

// ══════════════════════════════════════════════════════════════════
// HYBRID NARRATOR SYSTEM — Frasi statiche pre-registrate
// Mappa chiave semantica → path file MP3 in public/narrator/, una mappa
// per lingua. Le chiavi corrispondono 1:1 ai nomi dei file (vedi
// NARRATOR_RECORDING_GUIDE.md). Le frasi che non hanno un file
// (o la cui lingua non ha ancora audio registrato) vengono generate
// via ElevenLabs API — vedi window.speakNarration.
// Risparmio stimato: ~94% delle chiamate API per partita (IT).
// ══════════════════════════════════════════════════════════════════
window.NARRATOR_STATIC_AUDIO = {
  it: {
    night_open: '/narrator/night_open.mp3',
    cupido_open: '/narrator/cupido_open.mp3',
    cupido_close: '/narrator/cupido_close.mp3',
    mitomane_open: '/narrator/mitomane_open.mp3',
    mitomane_close: '/narrator/mitomane_close.mp3',
    indemoniato_open: '/narrator/indemoniato_open.mp3',
    indemoniato_close: '/narrator/indemoniato_close.mp3',
    veggente_open: '/narrator/veggente_open.mp3',
    veggente_close: '/narrator/veggente_close.mp3',
    guardia_open: '/narrator/guardia_open.mp3',
    guardia_close: '/narrator/guardia_close.mp3',
    figlio_dei_lupi_open: '/narrator/figlio_dei_lupi_open.mp3',
    figlio_dei_lupi_close: '/narrator/figlio_dei_lupi_close.mp3',
    lupi_open: '/narrator/lupi_open.mp3',
    lupi_close: '/narrator/lupi_close.mp3',
    strega_open: '/narrator/strega_open.mp3',
    strega_close: '/narrator/strega_close.mp3',
    medium_open: '/narrator/medium_open.mp3',
    medium_close: '/narrator/medium_close.mp3',
    sciamano_open: '/narrator/sciamano_open.mp3',
    sciamano_close: '/narrator/sciamano_close.mp3',
    role_reveal: '/narrator/role_reveal.mp3',
    dawn_victim_reveal: '/narrator/dawn_victim_reveal.mp3',
    dawn_no_victim: '/narrator/dawn_no_victim.mp3',
    dawn_strega_heal: '/narrator/dawn_strega_heal.mp3',
    dawn_figlio_transformed: '/narrator/dawn_figlio_transformed.mp3',
    day_victim_reveal: '/narrator/day_victim_reveal.mp3',
    day_no_majority: '/narrator/day_no_majority.mp3',
    end_lupi_win: '/narrator/end_lupi_win.mp3',
    end_villaggio_win: '/narrator/end_villaggio_win.mp3',
    end_lupi_win_short: '/narrator/end_lupi_win_short.mp3',
    end_villaggio_win_short: '/narrator/end_villaggio_win_short.mp3',
    test_voice: '/narrator/test_voice.mp3',
  },
  // EN — 31 file incisi con voce Daniel (EN native) via generate_narrator_audio_en.mjs (2026-07-23).
  en: {
    night_open: '/narrator/en/night_open.mp3',
    cupido_open: '/narrator/en/cupido_open.mp3',
    cupido_close: '/narrator/en/cupido_close.mp3',
    mitomane_open: '/narrator/en/mitomane_open.mp3',
    mitomane_close: '/narrator/en/mitomane_close.mp3',
    indemoniato_open: '/narrator/en/indemoniato_open.mp3',
    indemoniato_close: '/narrator/en/indemoniato_close.mp3',
    veggente_open: '/narrator/en/veggente_open.mp3',
    veggente_close: '/narrator/en/veggente_close.mp3',
    guardia_open: '/narrator/en/guardia_open.mp3',
    guardia_close: '/narrator/en/guardia_close.mp3',
    figlio_dei_lupi_open: '/narrator/en/figlio_dei_lupi_open.mp3',
    figlio_dei_lupi_close: '/narrator/en/figlio_dei_lupi_close.mp3',
    lupi_open: '/narrator/en/lupi_open.mp3',
    lupi_close: '/narrator/en/lupi_close.mp3',
    strega_open: '/narrator/en/strega_open.mp3',
    strega_close: '/narrator/en/strega_close.mp3',
    medium_open: '/narrator/en/medium_open.mp3',
    medium_close: '/narrator/en/medium_close.mp3',
    sciamano_open: '/narrator/en/sciamano_open.mp3',
    sciamano_close: '/narrator/en/sciamano_close.mp3',
    role_reveal: '/narrator/en/role_reveal.mp3',
    dawn_victim_reveal: '/narrator/en/dawn_victim_reveal.mp3',
    dawn_no_victim: '/narrator/en/dawn_no_victim.mp3',
    dawn_strega_heal: '/narrator/en/dawn_strega_heal.mp3',
    dawn_figlio_transformed: '/narrator/en/dawn_figlio_transformed.mp3',
    day_victim_reveal: '/narrator/en/day_victim_reveal.mp3',
    day_no_majority: '/narrator/en/day_no_majority.mp3',
    end_lupi_win: '/narrator/en/end_lupi_win.mp3',
    end_villaggio_win: '/narrator/en/end_villaggio_win.mp3',
    end_lupi_win_short: '/narrator/en/end_lupi_win_short.mp3',
    end_villaggio_win_short: '/narrator/en/end_villaggio_win_short.mp3',
    test_voice: '/narrator/en/test_voice.mp3',
  },
};

// Riproduce un file audio statico pre-registrato (path locale, es. /narrator/night_open.mp3)
window._playStaticAudio = (path) => {
  const audio = window._audioUnlocked ? window._globalAudio : new Audio();
  audio.src = path;
  window._elAudio = audio;
  audio.onended = () => window.dispatchEvent(new Event('narrator_end'));
  audio.onerror = () => {
    // File non ancora registrato — cade in silenzio (legge lo script)
    console.warn('[Narrator] File statico non trovato:', path);
    window.dispatchEvent(new Event('narrator_end'));
  };
  audio.play().catch(e => {
    console.warn('[Narrator] Static audio play blocked:', e);
    window.dispatchEvent(new Event('narrator_end'));
  });
};

window.speakNarration = (text, staticKey) => {
  if (window._elAudio) { window._elAudio.pause(); window._elAudio = null; }

  const mode = localStorage.getItem('lif_tts_mode') || 'script';

  // ── Qualsiasi modalità tranne 'voice' = script: solo testo, nessun audio ──
  if (mode !== 'voice') {
    window.dispatchEvent(new Event('narrator_start'));
    setTimeout(() => window.dispatchEvent(new Event('narrator_end')), 200);
    return;
  }

  window.dispatchEvent(new Event('narrator_start'));

  // ── HYBRID: prova il file statico pre-registrato per la lingua corrente ──
  // staticKey assente (testi dinamici con nomi giocatori) → sempre API.
  const narratorLang = window.getLang ? window.getLang() : 'it';
  const staticPath = staticKey ? window.NARRATOR_STATIC_AUDIO?.[narratorLang]?.[staticKey] : null;
  if (staticPath) {
    console.log('[Narrator] 🎵 Statico:', staticPath);
    window._playStaticAudio(staticPath);
    return;
  }

  console.log('[Narrator] 🤖 API ElevenLabs (testo dinamico):', text.substring(0, 60) + '…');

  // ── Modalità voce AI (ElevenLabs) — solo per testi dinamici con nomi ──
  const cfg    = window.getELConfig();
  const voiceId = cfg.voice === 'custom' ? cfg.customVoice : cfg.voice;

  // ── 1. Prova il proxy Vercel (produzione — key sul server) ──
  const apiBase = window.IS_NATIVE_APP ? 'https://lupus-in-fabula-eight.vercel.app' : window.location.origin;
  fetch(`${apiBase}/api/speak`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voiceId }),
  })
  .then(r => { if (!r.ok) throw new Error('proxy ' + r.status); return r.blob(); })
  .then(blob => window._playAudioBlob(blob))
  .catch(() => {
    // ── 2. Fallback: ElevenLabs diretto con key locale (sviluppo) ──
    if (cfg.key && voiceId) {
      fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: { 'xi-api-key': cfg.key, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          speed: 1.4,
          voice_settings: { stability: 0.70, similarity_boost: 0.85, style: 0.35, use_speaker_boost: true },
        }),
      })
      .then(r => { if (!r.ok) throw new Error('EL ' + r.status); return r.blob(); })
      .then(blob => window._playAudioBlob(blob))
      .catch(err => {
        console.warn('ElevenLabs diretto fallito:', err);
        window.dispatchEvent(new Event('narrator_end'));
      });
    } else {
      window.dispatchEvent(new Event('narrator_end'));
    }
  });
};

window._speakBrowser = (text) => {
  if(!window.speechSynthesis) return;

  const doSpeak = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLang()==='en' ? 'en-US' : 'it-IT';
    utterance.volume = 1.0;

    utterance.onstart = () => window.dispatchEvent(new Event('narrator_start'));
    utterance.onend   = () => window.dispatchEvent(new Event('narrator_end'));
    utterance.onerror = ()  => window.dispatchEvent(new Event('narrator_end'));

    const voices   = window.speechSynthesis.getVoices();
    const itVoices = voices.filter(v => v.lang.startsWith('it'));

    const MALE_NAMES = ['Luca','Federico','Roberto','Paolo','Filippo','Mario','Giorgio','Cosimo','Matteo'];
    const isMale = v => MALE_NAMES.some(n => v.name.includes(n));
    const isHQ   = v => v.name.includes('Enhanced') || v.name.includes('Premium')
                      || v.name.includes('Siri')    || v.name.includes('Google');

    const voice =
      itVoices.find(v => isMale(v) && isHQ(v))   ||
      itVoices.find(v => v.name.includes('Siri')) ||
      itVoices.find(v => isMale(v))               ||
      itVoices.find(v => isHQ(v))                 ||
      itVoices[0];

    if (voice) {
      utterance.voice = voice;
      const hq = isHQ(voice);
      utterance.pitch = hq ? 0.63 : 0.40;
      utterance.rate  = hq ? 0.86 : 0.80;
    } else {
      utterance.pitch = 0.25;
      utterance.rate  = 0.68;
    }

    window.speechSynthesis.speak(utterance);

    const heartbeat = setInterval(() => {
      if (!window.speechSynthesis.speaking) clearInterval(heartbeat);
      else window.speechSynthesis.resume();
    }, 5000);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => { doSpeak(); window.speechSynthesis.onvoiceschanged = null; };
  } else {
    doSpeak();
  }
};

// Esegue callback solo dopo che il narratore finisce di parlare.
// fallbackMs: timeout di sicurezza nel caso l'evento non arrivi mai.
window.afterSpeech = (callback, fallbackMs = 8000) => {
  let fired = false;
  const fire = () => {
    if (fired) return;
    fired = true;
    window.removeEventListener('narrator_end', fire);
    setTimeout(callback, 700);
  };
  window.addEventListener('narrator_end', fire);
  setTimeout(fire, fallbackMs);
};

// === HAPTIC FEEDBACK ===
// Su nativo iOS/Android usa Capacitor Haptics; su web Android usa navigator.vibrate(); su iOS web silenzioso.
window.haptic = async (type = 'medium') => {
  try {
    if (window.Capacitor?.isNativePlatform?.()) {
      const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');
      if (type === 'light')   return Haptics.impact({ style: ImpactStyle.Light });
      if (type === 'medium')  return Haptics.impact({ style: ImpactStyle.Medium });
      if (type === 'heavy')   return Haptics.impact({ style: ImpactStyle.Heavy });
      if (type === 'success') return Haptics.notification({ type: NotificationType.Success });
      if (type === 'warning') return Haptics.notification({ type: NotificationType.Warning });
      if (type === 'error')   return Haptics.notification({ type: NotificationType.Error });
      if (type === 'select')  return Haptics.selectionChanged();
    } else if (navigator.vibrate) {
      // Fallback web (Android Chrome) — pattern in ms
      if (type === 'light')   navigator.vibrate(10);
      else if (type === 'medium')  navigator.vibrate(25);
      else if (type === 'heavy')   navigator.vibrate([30, 20, 30]);
      else if (type === 'success') navigator.vibrate([15, 10, 15]);
      else if (type === 'warning') navigator.vibrate([20, 15, 20, 15, 20]);
      else if (type === 'error')   navigator.vibrate([40, 20, 40]);
      else if (type === 'select')  navigator.vibrate(8);
    }
  } catch (e) { /* silenzioso — haptics non bloccante */ }
};

window.playSfx = (id) => {
  const el = document.getElementById('sfx-'+id);
  if(!el) return;
  if(id==='night') { el.volume = 0.3; el.play().catch(e=>console.log(e)); }
  else { el.currentTime=0; el.play().catch(e=>console.log(e)); }
};
window.stopSfx = (id) => {
  const el = document.getElementById('sfx-'+id);
  if(el) { el.pause(); el.currentTime=0; }
};


/* ================================================================
   APP STORE URL — aggiorna quando l'app è live su App Store
   ================================================================ */
const APP_STORE_URL = 'https://apps.apple.com/app/lupus-in-fabula/id6764061104';

/* ================================================================
   FIREBASE CONFIG — inserisci i tuoi dati (vedi SETUP.md)
   ================================================================ */
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyCgz3kw5YESi6BYktVz3lPz4dQbXcKuUY0",
  authDomain:        "lupus-in-fabula-c1c3e.firebaseapp.com",
  databaseURL:       "https://lupus-in-fabula-c1c3e-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "lupus-in-fabula-c1c3e",
  storageBucket:     "lupus-in-fabula-c1c3e.firebasestorage.app",
  messagingSenderId: "994430330214",
  appId:             "1:994430330214:web:d6ba507899d79968b054a7",
  measurementId:     "G-C4H6ZQC34H"
};

/* ================================================================
   ROLES DATABASE
   ================================================================ */
const ROLES = {
  lupo: {
    id:'lupo', name:'Lupo', team:'lupi', color:'#c0392b', icon:'🐺',
    abbr:'L',
    category:'lupi', wakeOrder:3, nightAction:true,
    description:'Ogni notte, insieme agli altri lupi, scegli silenziosamente una vittima da eliminare. Di giorno cerca di non essere scoperto e influenza il voto del villaggio.',
    tip:'Non attaccare mai la stessa persona due notti di fila — è prevedibile.'
  },
  villico: {
    id:'villico', name:'Villico', team:'villaggio', color:'#27ae60', icon:'👨‍🌾',
    abbr:'V',
    category:'villaggio', wakeOrder:null, nightAction:false,
    description:'Sei un abitante del villaggio. Non hai poteri speciali, ma il tuo voto e la tua capacità di ragionamento sono fondamentali per scoprire i lupi.',
    tip:'Osserva chi è troppo silenzioso di notte — potrebbe essere un lupo.'
  },
  veggente: {
    id:'veggente', name:'Veggente', team:'villaggio', color:'#8e44ad', icon:'🔮',
    abbr:'Vg',
    category:'speciale', wakeOrder:1, nightAction:true,
    description:'Ogni notte puoi indicare al narratore un giocatore: lui ti rivelerà se appartiene ai lupi o al villaggio. Usa questa informazione con strategia.',
    tip:'Non rivelare il tuo ruolo troppo presto — i lupi ti elimineranno subito.'
  },
  guardia: {
    id:'guardia', name:'Guardia del Corpo', team:'villaggio', color:'#2980b9', icon:'🛡️',
    abbr:'Gd',
    category:'speciale', wakeOrder:2, nightAction:true,
    description:'Ogni notte puoi proteggere un giocatore dall\'attacco dei lupi. Non puoi proteggere te stesso due notti consecutive.',
    tip:'Proteggi il veggente nelle prime notti — è la risorsa più preziosa.'
  },
  strega: {
    id:'strega', name:'Strega', team:'villaggio', color:'#6c3483', icon:'🧙‍♀️',
    abbr:'St', pack:'ombre',
    category:'speciale', wakeOrder:4, nightAction:true,
    description:'Hai due pozioni: una di guarigione (salva la vittima dei lupi) e una di veleno (elimina chiunque). Ogni pozione si usa una sola volta in tutta la partita.',
    tip:'Tieni il veleno per quando sei sicura al 90% dell\'identità di un lupo.'
  },
  cacciatore: {
    id:'cacciatore', name:'Cacciatore', team:'villaggio', color:'#795548', icon:'🏹',
    abbr:'Ca', pack:'ombre',
    category:'speciale', wakeOrder:null, nightAction:false,
    description:'Quando vieni eliminato (di giorno o di notte), puoi portare con te un altro giocatore. Questa è la tua unica abilità ma può essere decisiva.',
    tip:'Tieni nascosto il tuo ruolo — i lupi eviteranno di eliminarti se sanno.'
  },
  cupido: {
    id:'cupido', name:'Cupido', team:'villaggio', color:'#e91e63', icon:'💘',
    abbr:'Cu', pack:'villaggio',
    category:'speciale', wakeOrder:0, nightAction:true,
    description:'Ogni notte leghi due giocatori per quella notte sola. Se uno dei due muore prima dell\'alba, l\'altro lo segue di dolore. All\'alba il legame si scioglie: il rogo del giorno non trascina nessuno. Ogni innamorato vince con la propria squadra.',
    tip:'Unire due lupi o due ruoli chiave del villaggio può essere devastante.'
  },
  sindaco: {
    id:'sindaco', name:'Sindaco', team:'villaggio', color:'#f39c12', icon:'🏛️',
    abbr:'Sd', pack:'villaggio',
    category:'speciale', wakeOrder:null, nightAction:false,
    description:'Il tuo voto vale doppio durante le votazioni del giorno. Se vieni eliminato, puoi designare il tuo successore prima di morire.',
    tip:'Rivela il tuo ruolo al momento giusto per imporre l\'eliminazione del lupo.',
    voteWeight: 2
  },
  medium: {
    id:'medium', name:'Medium', team:'villaggio', color:'#00838f', icon:'👁️',
    abbr:'Md', pack:'ombre',
    category:'speciale', wakeOrder:5, nightAction:true,
    description:'Ogni notte puoi "parlare" con uno dei giocatori eliminati e scoprirne il ruolo.',
    tip:'Usa il potere dopo almeno 2-3 eliminazioni per ottenere info utili.'
  },
  mitomane: {
    id:'mitomane', name:'Mitomane', team:'villaggio', color:'#9c27b0', icon:'🎭',
    abbr:'Mi', pack:'villaggio',
    category:'speciale', wakeOrder:0.5, nightAction:true,
    description:'La prima notte scegli un giocatore da imitare: ne assumi immediatamente il ruolo, i poteri e la squadra. Se imiti un lupo diventi un lupo a tutti gli effetti, ti svegli col branco e vinci con loro.',
    tip:'La scelta è irreversibile e vale per tutta la partita: guarda bene chi hai davanti prima di decidere.'
  },
  figlio_dei_lupi: {
    id:'figlio_dei_lupi', name:'Figlio dei Lupi', team:'villaggio', color:'#78350f', icon:'🐺',
    abbr:'Fl', pack:'ombre',
    category:'speciale', wakeOrder:3.5, nightAction:false,
    description:'Sembri un normale villico, ma nel tuo sangue scorre qualcosa di selvatico. Se i lupi ti attaccano di notte non morirai — ti unirai al branco. La Veggente ti vedrà innocente finché la trasformazione non avviene. Se vieni eliminato al rogo di giorno, muori come chiunque altro.',
    tip:'Solo tu sai chi sei. Comportati da villico — finché il momento non arriva.',
    becomesWolfIfKilled: true
  },
  sciamano: {
    id:'sciamano', name:'Sciamano', team:'villaggio', color:'#06b6d4', icon:'🪬',
    abbr:'Sc', pack:'villaggio',
    category:'speciale', wakeOrder:8, nightAction:true,
    description:'Una volta per partita, durante la notte, puoi richiamare l\'anima di un giocatore eliminato e riportarlo in vita con il suo ruolo originale. Il risorto non sa nulla di ciò che è accaduto durante la sua assenza.',
    tip:'Aspetta il momento giusto. Resuscitare un Veggente o una Strega a metà partita può ribaltare tutto.',
  },
  indemoniato: {
    id:'indemoniato', name:'Indemoniato', team:'villaggio', color:'#dc2626', icon:'😈',
    abbr:'In', pack:'ombre',
    category:'speciale', wakeOrder:3.6, nightAction:true,
    // team 'villaggio' → conta come villico nel calcolo vittoria e la Veggente lo vede innocente.
    // winsWith 'lupi'  → ma esulta con il branco quando vincono loro.
    knowsWolves: true,
    winsWith: 'lupi',
    description:'Sei un traditore in mezzo al villaggio. Non hai poteri, ma conosci l\'identità dei lupi fin dalla prima notte. La Veggente ti vede innocente. Vinci se vincono i lupi.',
    tip:'Fingi di dare la caccia al branco: guida i sospetti lontano dai tuoi alleati.',
  }
};

const DEFAULT_ROLES = ['lupo','lupo','villico','villico','villico','veggente'];

/* ================================================================
   ROLE VISUALS
   ================================================================ */
// image: null → usa il gradient CSS. Per il 3D: image: 'https://...' e il gradient sparisce.
const ROLE_VISUALS = {
  lupo:           { gradient:'linear-gradient(145deg,#1a0005,#3d0010,#1a0000)', glow:'#cc1a1a', particle:'🌑' },
  veggente:       { gradient:'linear-gradient(145deg,#0a001a,#1e0050,#0d0030)', glow:'#7c3aed', particle:'✨' },
  guardia:        { gradient:'linear-gradient(145deg,#001020,#003555,#001830)', glow:'#0ea5e9', particle:'🛡️' },
  strega:         { gradient:'linear-gradient(145deg,#001a05,#004015,#051800)', glow:'#16a34a', particle:'🌿' },
  figlio_dei_lupi:{ gradient:'linear-gradient(145deg,#1a0d00,#3d2200,#1a1200)', glow:'#b45309', particle:'🍂' },
  sciamano:       { gradient:'linear-gradient(145deg,#001a1a,#003838,#001a2a)', glow:'#06b6d4', particle:'🌀' },
  cupido:         { gradient:'linear-gradient(145deg,#1a0012,#450030,#1a001a)', glow:'#ec4899', particle:'💫' },
  sindaco:        { gradient:'linear-gradient(145deg,#1a1400,#3d2d00,#1a0e00)', glow:'#eab308', particle:'👁️'  },
  medium:         { gradient:'linear-gradient(145deg,#080812,#14142e,#080818)', glow:'#818cf8', particle:'🌀' },
  cacciatore:     { gradient:'linear-gradient(145deg,#051800,#103000,#0a1800)', glow:'#65a30d', particle:'🎯' },
  mitomane:       { gradient:'linear-gradient(145deg,#001a15,#003a30,#001a20)', glow:'#0d9488', particle:'🎭' },
  indemoniato:    { gradient:'linear-gradient(145deg,#1a0000,#3a0505,#1a0008)', glow:'#dc2626', particle:'😈' },
  villico:        { gradient:'linear-gradient(145deg,#0d0a00,#201800,#0d0900)', glow:'#a16207', particle:'🌾' },
};

/* ================================================================
   NIGHT NARRATION
   ================================================================ */
const NIGHT_NARRATION = {
  open:     { open: 'La notte cala sul villaggio. Il silenzio inghiotte ogni suono, ogni movimento.', close: 'Tutti, chiudano gli occhi.' },
  cupido:   { open: 'Cupido, apra gli occhi. Scegli i due cuori che batteranno all\'unisono — la tua freccia deciderà il loro destino per sempre.', close: 'Cupido, chiuda gli occhi.' },
  mitomane: { open: 'Il Mitomane, apra gli occhi. Scegli la maschera che indosserai per tutta la partita.', close: 'Il Mitomane, chiuda gli occhi.' },
  indemoniato: { open: 'L\'Indemoniato, apra gli occhi. Sul tuo telefono i volti che servono il branco: da stanotte il loro destino è il tuo.', close: 'L\'Indemoniato, chiuda gli occhi.' },
  veggente: { open: 'Il Veggente, apra gli occhi. Scegli chi vuoi osservare questa notte.', close: 'Il Veggente, chiuda gli occhi.' },
  guardia:  { open: 'La Guardia del Corpo, apra gli occhi. Chi proteggerai stanotte con la tua vita?', close: 'La Guardia del Corpo, chiuda gli occhi.' },
  figlio_dei_lupi: { open: 'Il Figlio dei Lupi, apra gli occhi. Il sangue chiama, ma ancora non risponde. Osserva in silenzio.', close: 'Il Figlio dei Lupi, chiuda gli occhi.' },
  lupi:     { open: 'I Lupi, aprano gli occhi. Riconoscetevi nell\'oscurità. Il branco decide — chi cade stanotte?', close: 'I Lupi, chiudano gli occhi.' },
  strega:   { open: 'La Strega, apra gli occhi. I lupi hanno già deciso chi uccidere. Salvi, avveleni, oppure passi?', close: 'La Strega, chiuda gli occhi.' },
  medium:   { open: 'Il Medium, apra gli occhi. I morti parlano, se sai ascoltare. Indica uno spirito — scoprirai il suo segreto.', close: 'Il Medium, chiuda gli occhi.' },
  sciamano: { open: 'Lo Sciamano, apra gli occhi. Puoi richiamare un\'anima perduta — scegli chi riportare tra i vivi.', close: 'Lo Sciamano, chiuda gli occhi.' },
};

// Tempo massimo di un passo notturno prima che il motore avanzi comunque. Generoso
// di proposito: se scadesse mentre qualcuno sta ancora scegliendo, il turno andrebbe
// perso in silenzio — peggio di un'attesa, che almeno il narratore può gestire.
const NIGHT_STEP_TIMEOUT_MS = 90000;

const NIGHT_STEPS = [
  { key:'open',     label:'Apertura',     icon:'🌙', hasRole:false },
  { key:'cupido',   label:'Cupido',       icon:'💘', hasRole:true,  roleId:'cupido' },
  { key:'mitomane', label:'Mitomane',     icon:'🎭', hasRole:true,  roleId:'mitomane', firstNightOnly:true },
  { key:'veggente', label:'Veggente',     icon:'🔮', hasRole:true,  roleId:'veggente' },
  { key:'guardia',         label:'Guardia',         icon:'🛡️', hasRole:true,  roleId:'guardia' },
  { key:'figlio_dei_lupi', label:'Figlio dei Lupi',  icon:'🐺', hasRole:true,  roleId:'figlio_dei_lupi' },
  { key:'indemoniato',     label:'Indemoniato',      icon:'😈', hasRole:true,  roleId:'indemoniato', firstNightOnly:true },
  { key:'lupi',            label:'Lupi',             icon:'🐺', hasRole:true,  roleId:'lupo' },
  { key:'strega',   label:'Strega',       icon:'🧙‍♀️', hasRole:true,  roleId:'strega' },
  { key:'medium',   label:'Medium',       icon:'👁️', hasRole:true,  roleId:'medium' },
  { key:'sciamano', label:'Sciamano',     icon:'🪬', hasRole:true,  roleId:'sciamano' },
  // 'close' rimosso: il testo alba è ora prefisso del dawn reveal (evita duplicati)
];

// Sequenza degli step attivi per una notte. Va calcolata UNA VOLTA quando la notte
// inizia e poi congelata: nightStep è un indice nell'array, quindi un ruolo che cambia
// a notte in corso (Mitomane che eredita, Strega che avvelena) riordinerebbe l'array
// e farebbe puntare l'indice allo step sbagliato.
function buildNightSteps(states, dayNumber) {
  // NON si filtra sui vivi: il narratore deve continuare a chiamare anche i ruoli
  // dei giocatori morti, altrimenti dal silenzio si deduce chi è già stato eliminato.
  // Si include anche originalRole, così un Figlio dei Lupi diventato lupo continua
  // a essere chiamato come Figlio e la trasformazione non trapela.
  const present = new Set();
  Object.values(states).forEach(p => {
    if (p.role) present.add(p.role);
    if (p.originalRole) present.add(p.originalRole);
  });
  return NIGHT_STEPS.filter(s =>
    (!s.hasRole || present.has(s.roleId)) && (!s.firstNightOnly || dayNumber === 1)
  );
}

/* ================================================================
   I18N — applica la lingua corrente ai dati statici (ROLES, PACKS,
   NIGHT_NARRATION, NIGHT_STEPS). Questi oggetti sono mutati in place
   così tutti i punti del codice che li leggono per riferimento
   (es. ROLES[id].name) vedono sempre il testo nella lingua attiva,
   senza dover rifattorizzare ogni chiamante.
   ================================================================ */
function applyLanguageToStaticData() {
  const dict = getLang() === 'en' ? I18N_EN : I18N_IT;

  Object.keys(ROLES).forEach(id => {
    const tr = dict.roles?.[id];
    if (!tr) return;
    ROLES[id].name = tr.name;
    ROLES[id].description = tr.description;
    if (tr.tip !== undefined) ROLES[id].tip = tr.tip;
  });

  if (typeof PACKS !== 'undefined') {
    Object.keys(PACKS).forEach(id => {
      const tr = dict.packs?.[id];
      if (!tr) return;
      PACKS[id].name = tr.name;
      PACKS[id].description = tr.description;
    });
  }

  Object.keys(NIGHT_NARRATION).forEach(key => {
    const tr = dict.narration?.steps?.[key];
    if (!tr) return;
    NIGHT_NARRATION[key].open = tr.open;
    NIGHT_NARRATION[key].close = tr.close ?? NIGHT_NARRATION[key].close;
  });

  NIGHT_STEPS.forEach(step => {
    const label = dict.narration?.stepLabels?.[step.key];
    if (label) step.label = label;
  });
}
subscribeLang(applyLanguageToStaticData);

/* ================================================================
   UTILITIES
   ================================================================ */
function uid(len=8) {
  return Math.random().toString(36).substr(2, len).toUpperCase();
}

// Token che identifica il dispositivo per la guardia anti-furto del QR.
// Attenzione: Safari e la WebView nativa hanno localStorage separati, quindi lo stesso
// telefono ne genererebbe due diversi — per questo il deep link se lo porta dietro.
// La chiave è PER PARTITA: con una chiave globale, aprire il deep link di un'altra
// partita sovrascriverebbe il token e ti farebbe espellere da quella in corso.
function deviceTokenKey(gameId) { return `lif_device_token_${gameId || 'default'}`; }

function getDeviceToken(gameId) {
  try {
    const key = deviceTokenKey(gameId);
    let tk = localStorage.getItem(key);
    if (!tk) {
      tk = Math.random().toString(36).substring(2);
      localStorage.setItem(key, tk);
    }
    return tk;
  } catch { return 'nostorage'; }
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

// Nessuna vittoria di terze parti: la vittoria "amore" è stata rimossa e ogni
// innamorato vince con la propria squadra. Il parametro `lovers` non serve più —
// prima veniva passato e ignorato, il che faceva credere il contrario.
// I rami `=== 'amore'` rimasti nelle schermate sono quindi irraggiungibili: vanno
// tolti insieme, quando si aggiungeranno eventuali ruoli con vittoria propria.
function checkWin(players) {
  const alive = Object.values(players).filter(p => p.alive);
  const wolves = alive.filter(p => ROLES[p.role]?.team === 'lupi');
  const villagers = alive.filter(p => ROLES[p.role]?.team === 'villaggio');

  if (wolves.length === 0) return 'villaggio';
  if (wolves.length >= villagers.length) return 'lupi';
  return null;
}

/* ================================================================
   RECAP — formattazione degli eventi di partita
   Condivisa fra il riepilogo finale dei giocatori e la cronaca che il
   narratore consulta durante la partita: una sola implementazione, così
   le due viste non possono raccontare storie diverse.
   ================================================================ */
function recapEventLines(ev, players) {
  const pName = id => players?.[id]?.name || '???';
  const pRole = id => { const r = ROLES[players?.[id]?.role]; return r ? `${r.icon} ${r.name}` : ''; };
  const joiner = getLang() === 'en' ? ' and ' : ' e ';
  const wolvesNames = ids => (ids || []).map(pName).join(joiner);
  const lines = [];

  if (ev.type === 'night') {
    if (ev.wolvesIds?.length) {
      const wolfStr = wolvesNames(ev.wolvesIds);
      if (ev.wolfTarget) {
        const targetStr = `${pName(ev.wolfTarget)} (${pRole(ev.wolfTarget)})`;
        if (ev.guardiaSaved)          lines.push(t('player.wolvesRepelled',   {wolves: wolfStr, target: targetStr}));
        else if (ev.stregaHealed)     lines.push(t('player.wolvesHealed',     {wolves: wolfStr, target: targetStr}));
        else if (ev.figlioTransformed)lines.push(t('player.wolvesTransformed',{wolves: wolfStr, name: pName(ev.wolfTarget)}));
        else if (ev.dawnVictim)       lines.push(t('player.wolvesKilled',     {wolves: wolfStr, target: targetStr}));
      } else {
        lines.push(t('player.wolvesNoAgreement', {wolves: wolfStr}));
      }
    }
    if (ev.stregaPoison)      lines.push(t('player.witchPoisonedLog', {target: `${pName(ev.stregaPoison)} (${pRole(ev.stregaPoison)})`}));
    if (ev.sciamanoRevived)   lines.push(t('player.shamanRevivedLog', {name: pName(ev.sciamanoRevived)}));
    // Tutte le coppie della notte; si ricade su cupidoLovers per le partite registrate
    // prima che venisse salvato l'elenco completo.
    const coppieCupido = ev.cupidoPairs?.length ? ev.cupidoPairs
                        : (ev.cupidoLovers?.length === 2 ? [ev.cupidoLovers] : []);
    coppieCupido.forEach(([a, b]) => lines.push(t('player.cupidoBoundLog', {name1: pName(a), name2: pName(b)})));
    if (ev.veggenteScans?.length) {
      lines.push(t('player.veggenteScannedLog', {
        targets: ev.veggenteScans.map(id => `${pName(id)} (${pRole(id)})`).join(joiner)
      }));
    }
    if (ev.mediumScans?.length) {
      lines.push(t('player.mediumScannedLog', {
        targets: ev.mediumScans.map(id => `${pName(id)} (${pRole(id)})`).join(joiner)
      }));
    }
    if (ev.mitomaneTarget)    lines.push(t('player.mitomaneChoseLog', {target: `${pName(ev.mitomaneTarget)} (${pRole(ev.mitomaneTarget)})`}));
    if (ev.loveVictims?.length) {
      lines.push(t('player.loveVictimsLog', {
        names: ev.loveVictims.map(id => `${pName(id)} (${pRole(id)})`).join(joiner)
      }));
    }
    if (!lines.length)        lines.push(t('player.nightSilent'));
  }

  if (ev.type === 'day') {
    lines.push(ev.noMajority
      ? t('player.dayNoAgreement')
      : t('player.dayCondemnedLog', {target: `${pName(ev.dayVictim)} (${pRole(ev.dayVictim)})`}));
  }
  return lines;
}

// Voti del giorno raggruppati per bersaglio, dal più votato in giù
function recapVoteGroups(ev, players) {
  if (!ev.votes?.length) return null;
  const byTarget = {};
  ev.votes.forEach(v => { (byTarget[v.targetId] ||= []).push(players?.[v.voterId]?.name || '???'); });
  return Object.entries(byTarget)
    .map(([tid, voters]) => ({ name: players?.[tid]?.name || '???', voters }))
    .sort((a, b) => b.voters.length - a.voters.length);
}

/* ================================================================
   FIREBASE INIT
   ================================================================ */
let db = null;
let auth = null;
const isFirebaseConfigured = () =>
  FIREBASE_CONFIG.apiKey && !FIREBASE_CONFIG.apiKey.startsWith('INSERISCI');

function initFirebase() {
  if (!isFirebaseConfigured()) return;
  try {
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.database();
    auth = firebase.auth();
  } catch(e) { console.warn('Firebase init error:', e); }
}
initFirebase();

/* ── Safe Area iOS: CSS env() diretto, nessun JS timing issue ── */
// Segnale globale: siamo in app nativa Capacitor?
window.IS_NATIVE_APP = (
  window.location.protocol === 'capacitor:' ||
  window.location.protocol === 'file:' ||
  !!(window.Capacitor?.isNativePlatform?.())
);

/* ================================================================
   USER PROFILE (Google Auth)
   ================================================================ */
function useAuth() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    if(!auth) return;
    // Gestisce il ritorno dal redirect (solo su app nativa iOS)
    const isNative = !!(window.Capacitor?.isNativePlatform?.());
    if (isNative) {
      auth.getRedirectResult()
        .then(result => { if (result?.user) setUser(result.user); })
        .catch(e => console.warn('getRedirectResult error:', e.code, e.message));
    }
    return auth.onAuthStateChanged(u => setUser(u));
  }, []);
  return user;
}

function UserProfile() {
  const user = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [mode, setMode] = useState('main'); // 'main' | 'forgot' | 'forgot_sent'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const isNativeApp = !!window.IS_NATIVE_APP;

  const AUTH_ERRORS = t('auth.errors');

  const open = () => { setShowModal(true); setMode('main'); setAuthError(''); };
  const close = () => { setShowModal(false); setEmail(''); setPassword(''); setAuthError(''); setMode('main'); };

  const loginGoogle = () => {
    if (!auth || isNativeApp) return;
    setAuthError('');
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then(close)
      .catch(e => setAuthError(AUTH_ERRORS[e.code] || e.message));
  };

  const loginApple = async () => {
    if (!auth) return;
    setLoading(true); setAuthError('');
    try {
      const { SignInWithApple } = await import('@capacitor-community/apple-sign-in');
      const result = await SignInWithApple.authorize({
        clientId: 'com.lupusinfabula.app',
        redirectURI: 'https://lupus-in-fabula-eight.vercel.app',
        scopes: 'email name',
      });
      const provider = new firebase.auth.OAuthProvider('apple.com');
      const credential = provider.credential({ idToken: result.response.identityToken });
      await auth.signInWithCredential(credential);
      close();
    } catch(e) {
      if (e?.code !== 'SIGN_IN_CANCELLED') {
        setAuthError(t('auth.appleFailed'));
      }
    } finally { setLoading(false); }
  };

  const loginEmail = async () => {
    if (!auth || !email || !password) return;
    setAuthError(''); setLoading(true);
    try {
      if (isRegister) {
        await auth.createUserWithEmailAndPassword(email, password);
      } else {
        await auth.signInWithEmailAndPassword(email, password);
      }
      close();
    } catch(e) {
      setAuthError(AUTH_ERRORS[e.code] || `${t('auth.genericErrorPrefix')}: ${e.message}`);
    } finally { setLoading(false); }
  };

  const sendPasswordReset = async () => {
    if (!auth || !email) { setAuthError(t('auth.enterEmailFirst')); return; }
    setLoading(true); setAuthError('');
    try {
      await auth.sendPasswordResetEmail(email);
      setMode('forgot_sent');
    } catch(e) {
      setAuthError(AUTH_ERRORS[e.code] || t('auth.resetEmailError'));
    } finally { setLoading(false); }
  };

  const handleLogout = () => auth.signOut();

  if (!isFirebaseConfigured()) return null;

  /* ── Utente loggato: pillola in alto a destra ── */
  if (user) {
    return (
      <div className="absolute right-4 flex items-center gap-2 z-50"
           style={{top:"calc(env(safe-area-inset-top, 16px) + 8px)"}}>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md"
             style={{background:'rgba(10,10,26,0.85)', border:'1px solid rgba(226,201,126,0.25)',
                     boxShadow:'0 0 12px rgba(226,201,126,0.08)'}}>
          {user.photoURL
            ? <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full object-cover border border-yellow-600/40" referrerPolicy="no-referrer"/>
            : <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                   style={{background:'rgba(226,201,126,0.15)', color:'#e2c97e'}}>
                {user.email?.[0]?.toUpperCase()}
              </div>
          }
          <span className="text-white text-xs font-semibold max-w-[80px] truncate">
            {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
          </span>
          <button onClick={handleLogout} className="text-gray-600 hover:text-red-400 text-xs transition-colors ml-1">
            {t('auth.exit')}
          </button>
        </div>
      </div>
    );
  }

  /* ── Non loggato: bottone + modal ── */
  return (
    <>
      {/* Trigger */}
      <div className="absolute right-4 z-50" style={{top:"calc(env(safe-area-inset-top, 16px) + 8px)"}}>
        <button onClick={open}
                className="btn-ghost px-4 py-2 rounded-full text-xs flex items-center gap-2"
                style={{boxShadow:'0 0 10px rgba(226,201,126,0.08)'}}>
          <span>👤</span> {t('auth.accessButton')}
        </button>
      </div>

      {/* Modal bottom sheet */}
      {showModal && (
        <div className="fixed inset-0 z-[998] flex items-end justify-center p-4"
             style={{background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)'}}
             onClick={close}>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden anim-fade-up"
               style={{background:'linear-gradient(180deg,#12122a 0%,#0a0a1a 100%)',
                       border:'1px solid rgba(226,201,126,0.2)'}}
               onClick={e=>e.stopPropagation()}>

            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{background:'rgba(255,255,255,0.12)'}}/>
            </div>

            <div className="px-6 pt-3 pb-7">

              {/* Header */}
              <div className="text-center mb-6">
                <div className="text-3xl mb-2">🐺</div>
                <h2 className="font-cinzel text-moon text-lg font-bold mb-1">
                  {mode==='forgot' ? t('auth.titleForgot') : mode==='forgot_sent' ? t('auth.titleForgotSent') : isRegister ? t('auth.titleRegister') : t('auth.titleLogin')}
                </h2>
                {mode==='main' && (
                  <p className="text-gray-600 text-xs">{t('auth.subtitle')}</p>
                )}
              </div>

              {/* ── Stato: email reset inviata ── */}
              {mode==='forgot_sent' && (
                <div className="text-center">
                  <div className="text-4xl mb-3">📬</div>
                  <p className="text-gray-300 text-sm mb-1">{t('auth.forgotSentCheckInbox')}</p>
                  <p className="text-gray-600 text-xs mb-6">{t('auth.forgotSentHint')}</p>
                  <button onClick={()=>setMode('main')}
                          className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
                          style={{background:'rgba(226,201,126,0.12)', border:'1px solid rgba(226,201,126,0.3)', color:'#e2c97e'}}>
                    {t('auth.backToLogin')}
                  </button>
                </div>
              )}

              {/* ── Stato: recupero password ── */}
              {mode==='forgot' && (
                <>
                  <p className="text-gray-500 text-xs mb-4 text-center">
                    {t('auth.forgotIntro')}
                  </p>
                  <input type="email" placeholder={t('auth.emailPlaceholder')} value={email}
                    onChange={e=>setEmail(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&sendPasswordReset()}
                    className="w-full px-4 py-3 rounded-xl text-sm text-white mb-3 outline-none"
                    style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)'}}/>
                  {authError && <p className="text-red-400 text-xs mb-3">{authError}</p>}
                  <button onClick={sendPasswordReset} disabled={loading}
                          className="w-full py-3.5 rounded-xl text-sm font-bold mb-3 transition-all active:scale-95"
                          style={{background:'rgba(226,201,126,0.15)', border:'1px solid rgba(226,201,126,0.35)', color:'#e2c97e'}}>
                    {loading ? '…' : t('auth.sendResetLink')}
                  </button>
                  <button onClick={()=>{setMode('main'); setAuthError('');}}
                          className="w-full text-center text-gray-600 text-xs hover:text-gray-400 transition-colors">
                    {t('auth.backToLogin')}
                  </button>
                </>
              )}

              {/* ── Stato: login / registrazione ── */}
              {mode==='main' && (
                <>
                  {/* Google e Apple login rimandati a v1.1 — solo email/password per v1.0 */}

                  {/* Email + Password */}
                  <input type="email" placeholder={t('auth.emailField')} value={email}
                    onChange={e=>setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-sm text-white mb-2 outline-none"
                    style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)'}}/>
                  <input type="password" placeholder={t('auth.passwordField')} value={password}
                    onChange={e=>setPassword(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&loginEmail()}
                    className="w-full px-4 py-3 rounded-xl text-sm text-white mb-1 outline-none"
                    style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)'}}/>

                  {/* Recupera password */}
                  {!isRegister && (
                    <div className="flex justify-end mb-3">
                      <button onClick={()=>{setMode('forgot'); setAuthError('');}}
                              className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors">
                        {t('auth.forgotPassword')}
                      </button>
                    </div>
                  )}

                  {authError && <p className="text-red-400 text-xs mb-3">{authError}</p>}

                  <button onClick={loginEmail} disabled={loading || !email || !password}
                          className="w-full py-3.5 rounded-2xl font-cinzel font-bold text-sm mb-4 transition-all active:scale-95 disabled:opacity-40"
                          style={{background:'linear-gradient(135deg, #e2c97e, #c9a84c)', color:'#0b0a14'}}>
                    {loading ? '…' : isRegister ? t('auth.createAccount') : t('auth.login')}
                  </button>

                  <button onClick={()=>{setIsRegister(v=>!v); setAuthError('');}}
                          className="w-full text-center text-gray-500 text-xs hover:text-gray-300 transition-colors">
                    {isRegister ? t('auth.haveAccount') : t('auth.noAccount')}
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ================================================================
   STAR FIELD
   ================================================================ */
const STARS = Array.from({length:60}, (_,i) => ({
  id:i,
  x: Math.random()*100,
  y: Math.random()*100,
  s: Math.random()*2+0.8,
  dur: (Math.random()*3+2).toFixed(1),
  delay: (Math.random()*4).toFixed(1),
}));

function StarField() {
  return (
    <div className="stars" aria-hidden="true">
      {STARS.map(s => (
        <div key={s.id} className="star" style={{
          left:`${s.x}%`, top:`${s.y}%`,
          width:s.s, height:s.s,
          '--dur':`${s.dur}s`, '--delay':`${s.delay}s`
        }}/>
      ))}
    </div>
  );
}

/* ================================================================
   MOON SVG
   ================================================================ */
function Moon({size=72}) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" style={{filter:'drop-shadow(0 0 16px rgba(226,201,126,0.6))'}}>
      <circle cx="36" cy="36" r="32" fill="url(#moonGrad)"/>
      <circle cx="26" cy="26" r="18" fill="rgba(0,0,0,0.12)"/>
      <circle cx="44" cy="20" r="5" fill="rgba(0,0,0,0.08)"/>
      <circle cx="52" cy="40" r="3" fill="rgba(0,0,0,0.06)"/>
      <defs>
        <radialGradient id="moonGrad" cx="38%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#f8eecc"/>
          <stop offset="60%" stopColor="#e2c97e"/>
          <stop offset="100%" stopColor="#b89440"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ================================================================
   TIMER
   ================================================================ */
function Timer({seconds, total, running, onToggle, onReset, onEdit}) {
  const R = 42, C = 2*Math.PI*R;
  const pct = total > 0 ? seconds/total : 1;
  const offset = C*(1-pct);
  const col = pct>0.5 ? '#4ade80' : pct>0.25 ? '#facc15' : '#ef4444';
  const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{width:100,height:100}}>
        <svg width="100" height="100" style={{transform:'rotate(-90deg)'}}>
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
          <circle cx="50" cy="50" r={R} fill="none" stroke={col} strokeWidth="7"
            strokeDasharray={C} strokeDashoffset={offset}
            strokeLinecap="round" className="timer-path"/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-cinzel text-lg font-bold text-white cursor-pointer" onClick={onEdit}
                title={t('common.clickToEdit')}>
            {fmt(seconds)}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onToggle} className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
          style={{background: running?'rgba(139,26,26,0.6)':'rgba(26,74,26,0.6)',
                  border:`1px solid ${running?'rgba(239,68,68,0.4)':'rgba(74,222,128,0.4)'}`,
                  color: running?'#fca5a5':'#86efac'}}>
          {running ? '⏸ Pausa' : '▶ Avvia'}
        </button>
        <button onClick={onReset} className="px-3 py-1 rounded-lg text-xs font-bold transition-all glass text-gray-400 hover:text-white">
          ↺
        </button>
      </div>
    </div>
  );
}

/* ================================================================
   QR CODE COMPONENT
   ================================================================ */
function QRCodeBox({url, size=120}) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !url) return;
    ref.current.innerHTML = '';
    try {
      new window.QRCode(ref.current, {
        text: url, width: size, height: size,
        colorDark: '#e2c97e', colorLight: '#060b10',
        correctLevel: window.QRCode.CorrectLevel.M
      });
    } catch(e) { ref.current.innerHTML = '<p style="color:#666;font-size:10px">QR non disponibile</p>'; }
  }, [url, size]);
  return <div ref={ref}/>;
}

/* ================================================================
   ROLE CARD (flip)
   ================================================================ */
function RoleCard({role, playerName, flipped, onFlip, onHide, userPhoto}) {
  const r = ROLES[role];
  const v = ROLE_VISUALS[role] || { gradient:'linear-gradient(145deg,#0d0d0d,#1a1a1a)', glow:'#e2c97e', particle:'⭐' };
  if (!r) return null;

  const PARTICLES = [
    { left:'12%', delay:'0s',   dur:'4.5s' },
    { left:'30%', delay:'1.1s', dur:'5.2s' },
    { left:'52%', delay:'0.5s', dur:'4.8s' },
    { left:'70%', delay:'1.8s', dur:'5.5s' },
    { left:'88%', delay:'0.9s', dur:'4.2s' },
  ];

  return (
    <div className={`flip-container w-full mx-auto ${flipped?'flipped':''}`}
         style={{height:460, maxWidth:300}}>
      <div className="flip-inner w-full h-full">

        {/* Back = mystery */}
        <div className={`flip-face border-2 border-yellow-600/30 cursor-pointer ${!flipped?'anim-pulse':''}`}
             style={{background:'linear-gradient(145deg,#0a0a1a,#0d1117)'}}
             onClick={!flipped ? onFlip : undefined}>
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
            <Moon size={64}/>
            <p className="font-cinzel text-moon text-base font-semibold">{t('roleCard.tapToReveal')}</p>
            <p className="text-gray-500 text-sm text-center">{t('roleCard.secretHint')}<br/>{t('roleCard.aloneHint')}</p>
          </div>
        </div>

        {/* Front = role revealed */}
        <div className="flip-face flip-back overflow-hidden"
             style={{
               background: v.image ? `url(${v.image}) center/cover no-repeat` : v.gradient,
               border: `2px solid ${r.color}99`,
             }}>

          {/* Overlay per leggibilità */}
          <div className="absolute inset-0 role-bg-shimmer"
               style={{background:'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.65) 100%)'}}/>

          {/* Particelle fluttuanti */}
          <div className="absolute inset-0 overflow-hidden">
            {PARTICLES.map((p,i) => (
              <span key={i} className="role-particle text-base"
                    style={{left:p.left, bottom:'-10%', animationDelay:p.delay, animationDuration:p.dur, opacity:0.35}}>
                {v.particle}
              </span>
            ))}
          </div>

          {/* Contenuto */}
          <div className="relative flex flex-col h-full p-5 z-10">

            {/* Header: avatar + nome */}
            <div className="flex items-center gap-2.5 mb-2">
              {userPhoto ? (
                <img src={userPhoto} alt="" referrerPolicy="no-referrer"
                     className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                     style={{border:`2px solid ${r.color}`, boxShadow:`0 0 10px ${r.color}66`}}/>
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-cinzel font-bold text-sm flex-shrink-0"
                     style={{border:`2px solid ${r.color}`, background:r.color+'22', color:r.color,
                             boxShadow:`0 0 10px ${r.color}44`}}>
                  {playerName?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-white/50 text-[9px] uppercase tracking-widest">{t('roleCard.welcome')}</p>
                <p className="font-cinzel text-white text-sm font-bold leading-tight">{playerName}</p>
              </div>
              {/* Ri-nasconde la carta: utile se qualcuno ti si avvicina dopo che l'hai girata */}
              {onHide && (
                <button onClick={(e)=>{ e.stopPropagation(); onHide(); }}
                        className="ml-auto flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-bold transition-all active:scale-95"
                        style={{background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.8)'}}>
                  🙈 {t('roleCard.hide')}
                </button>
              )}
            </div>

            {/* Icona ruolo */}
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <div className="role-icon-glow text-7xl leading-none mb-1"
                   style={{'--glow-color': v.glow}}>
                {r.icon}
              </div>
              <p className="font-cinzel text-white text-2xl font-bold tracking-wide">{r.name}</p>
              <span className="text-[11px] px-3 py-1 rounded-full font-bold"
                    style={{background:r.color+'33', border:`1px solid ${r.color}66`, color:r.color}}>
                {r.team==='lupi'?t('teamBadge.lupi'):t('teamBadge.villaggio')}
              </span>
            </div>

            {/* Descrizione */}
            <div className="mt-3 overflow-y-auto flex-shrink min-h-0" style={{maxHeight:160}}>
              <p className="text-white/80 text-sm leading-snug text-center">{r.description}</p>
              {r.tip && (
                <div className="mt-2 p-2 rounded-lg text-[11px] text-white/40 italic"
                     style={{background:'rgba(0,0,0,0.35)', border:'1px solid rgba(255,255,255,0.07)'}}>
                  💡 {r.tip}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   PRIVACY CONSENT MODAL
   ================================================================ */
function PrivacyConsentModal({ onAccept }) {
  // Prima schermata mostrata all'utente: la selezione lingua deve stare qui,
  // non solo su HomeScreen — altrimenti chi legge inglese vede il consenso
  // privacy e il tutorial in italiano prima di poter cambiare lingua.
  const { lang, setLang: changeLang, t } = useLanguage();
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-end"
         style={{background:'rgba(11,10,20,0.97)', backdropFilter:'blur(12px)'}}>

      {/* Glow decorativo */}
      <div style={{position:'absolute',top:'15%',left:'50%',transform:'translateX(-50%)',
                   width:320,height:320,borderRadius:'50%',
                   background:'radial-gradient(ellipse, rgba(185,28,28,0.15) 0%, transparent 70%)',
                   pointerEvents:'none'}}/>

      {/* Selettore lingua — stesso stile del toggle su HomeScreen */}
      <button onClick={() => changeLang(lang === 'it' ? 'en' : 'it')}
        className="absolute left-4 z-50 btn-ghost px-3 py-2 rounded-full text-xs font-bold"
        style={{top:"calc(env(safe-area-inset-top, 16px) + 8px)", boxShadow:'0 0 10px rgba(226,201,126,0.08)'}}>
        {t('home.langToggle')}
      </button>

      <div className="w-full max-w-sm px-6 pb-10 pt-6 anim-fade-up">

        {/* Icona + titolo */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🐺</div>
          <h1 className="font-cinzel text-moon text-xl font-bold mb-1">{t('privacy.title')}</h1>
          <p className="text-gray-500 text-xs">{t('privacy.subtitle')}</p>
        </div>

        {/* Punti chiave */}
        <div className="rounded-2xl p-4 mb-5 flex flex-col gap-3"
             style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)'}}>
          <div className="flex items-start gap-3">
            <span className="text-lg shrink-0 mt-0.5">🔒</span>
            <div>
              <p className="text-white text-xs font-bold leading-tight mb-0.5">{t('privacy.point1Title')}</p>
              <p className="text-gray-500 text-[11px] leading-relaxed">{t('privacy.point1Body')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg shrink-0 mt-0.5">☁️</span>
            <div>
              <p className="text-white text-xs font-bold leading-tight mb-0.5">{t('privacy.point2Title')}</p>
              <p className="text-gray-500 text-[11px] leading-relaxed">{t('privacy.point2Body')}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg shrink-0 mt-0.5">🎙️</span>
            <div>
              <p className="text-white text-xs font-bold leading-tight mb-0.5">{t('privacy.point3Title')}</p>
              <p className="text-gray-500 text-[11px] leading-relaxed">{t('privacy.point3Body')}</p>
            </div>
          </div>
        </div>

        {/* Link privacy completa */}
        <p className="text-center text-gray-600 text-[11px] mb-4">
          {t('privacy.linkPrefix')}{' '}
          <a href="/privacy.html" target="_blank" rel="noopener noreferrer"
             className="underline" style={{color:'#e2c97e'}}>
            {t('privacy.linkText')}
          </a>
          {' '}{t('privacy.linkSuffix')}
        </p>

        {/* CTA */}
        <button
          onClick={onAccept}
          className="w-full py-4 rounded-2xl font-cinzel font-bold text-sm transition-all active:scale-95"
          style={{background:'linear-gradient(135deg, #e2c97e, #c9a84c)', color:'#0b0a14',
                  boxShadow:'0 4px 24px rgba(226,201,126,0.25)'}}>
          {t('privacy.cta')}
        </button>
        <p className="text-center text-gray-700 text-[10px] mt-3">
          {t('privacy.footer')}
        </p>
      </div>
    </div>
  );
}

/* ================================================================
   ONBOARDING / TUTORIAL
   ================================================================ */
function TutorialModal({ isOpen, onClose, isOnboarding = false }) {
  const [currentStep, setCurrentStep] = useState(0);
  const touchStartX = useRef(null);

  const steps = t('tutorial.steps');

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Completa tutorial
      localStorage.setItem('lif_tutorial_done', 'true');
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const handleDone = () => {
    localStorage.setItem('lif_tutorial_done', 'true');
    setCurrentStep(0);
    onClose();
  };

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx < -50 && !isLast) handleNext();
    if (dx > 50 && !isFirst) handlePrev();
  };

  // Background diverso per ogni slide
  const slideBgs = [
    'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.18) 0%, transparent 70%)',
    'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.15) 0%, transparent 70%)',
    'radial-gradient(ellipse at 50% 0%, rgba(30,58,138,0.25) 0%, transparent 70%)',
    'radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.15) 0%, transparent 70%)',
    'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.12) 0%, transparent 70%)',
    'radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.18) 0%, transparent 70%)',
    'radial-gradient(ellipse at 50% 0%, rgba(226,201,126,0.18) 0%, transparent 70%)',
    'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%)',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col screen-safe"
      style={{background: '#08081a'}}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Glow di sfondo per slide */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: slideBgs[currentStep] || slideBgs[0],
        transition: 'background 0.5s ease',
      }} />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-4 pb-2">
        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <div key={i} className="rounded-full transition-all duration-300"
              style={{
                height: '3px',
                background: i <= currentStep ? '#e2c97e' : 'rgba(255,255,255,0.15)',
                width: i === currentStep ? '28px' : '14px',
              }} />
          ))}
        </div>
        {/* Salta — solo se non è onboarding al primo step, o se non è onboarding */}
        {(!isOnboarding || currentStep > 0) && (
          <button onClick={handleDone}
            className="text-xs font-bold uppercase tracking-widest transition-colors"
            style={{color: 'rgba(107,114,128,0.8)'}}>
            {t('tutorial.skip')}
          </button>
        )}
      </div>

      {/* Content — area principale */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="text-7xl mb-6 leading-none anim-fade-up" key={`icon-${currentStep}`}>
          {step.icon}
        </div>
        <h2 className="font-cinzel text-2xl font-bold mb-4 leading-snug anim-fade-up"
            key={`title-${currentStep}`}
            style={{color: '#e2c97e'}}>
          {step.title}
        </h2>
        <p className="text-base leading-relaxed anim-fade-up max-w-sm"
           key={`content-${currentStep}`}
           style={{color: 'rgba(209,213,219,0.85)'}}>
          {step.content}
        </p>
      </div>

      {/* Bottom navigation */}
      <div className="relative z-10 px-6 pb-8 flex flex-col gap-3">
        <button
          onClick={isLast ? handleDone : handleNext}
          className="w-full py-4 rounded-2xl font-cinzel font-bold text-base transition-all active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #e2c97e 0%, #c4931a 100%)',
            color: '#0a0a1a',
            boxShadow: '0 4px 24px rgba(226,201,126,0.3)',
          }}>
          {isLast ? t('tutorial.start') : t('tutorial.next')}
        </button>
        {!isFirst && (
          <button onClick={handlePrev}
            className="w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(156,163,175,0.8)',
            }}>
            {t('tutorial.prev')}
          </button>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   HOME SCREEN
   ================================================================ */
function HomeScreen({onCreateGame, onViewHistory, onProfile}) {
  const isFirstLaunch = !localStorage.getItem('lif_tutorial_done');
  const [showTutorial, setShowTutorial] = useState(isFirstLaunch);
  const [isOnboarding, setIsOnboarding] = useState(isFirstLaunch);
  const { lang, setLang: changeLang, t } = useLanguage();

  return (
    <div className="min-h-screen layer screen-safe flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Selettore lingua — IT/EN, default rilevato dal dispositivo */}
      <button onClick={() => changeLang(lang === 'it' ? 'en' : 'it')}
        className="absolute left-4 z-50 btn-ghost px-3 py-2 rounded-full text-xs font-bold"
        style={{top:"calc(env(safe-area-inset-top, 16px) + 8px)", boxShadow:'0 0 10px rgba(226,201,126,0.08)'}}>
        {t('home.langToggle')}
      </button>

      <UserProfile />

      <div className="anim-fade-up text-center w-full max-w-sm relative z-10">

        {/* Luna con anelli */}
        <div className="relative inline-flex items-center justify-center mb-6" style={{width:140, height:140}}>
          {/* Anelli che si espandono */}
          <div style={{
            position:'absolute', width:140, height:140, borderRadius:'50%',
            border:'1px solid rgba(234,204,133,0.3)',
            animation:'ringExpand 3.5s ease-out infinite'
          }} />
          <div style={{
            position:'absolute', width:140, height:140, borderRadius:'50%',
            border:'1px solid rgba(234,204,133,0.15)',
            animation:'ringExpand 3.5s ease-out infinite 1.2s'
          }} />
          <div style={{
            position:'absolute', width:140, height:140, borderRadius:'50%',
            border:'1px solid rgba(234,204,133,0.08)',
            animation:'ringExpand 3.5s ease-out infinite 2.4s'
          }} />
          {/* CSS Moon Premium */}
          <div className="moon-reveal">
            <div className="moon-float" style={{
              width: 140, height: 140, borderRadius: '50%', position: 'relative', zIndex: 10,
              background: 'radial-gradient(circle at 35% 35%, #fffbe6 0%, #eacc85 40%, #8a641c 100%)',
              boxShadow: '0 0 50px rgba(234, 204, 133, 0.5), inset -12px -12px 24px rgba(0,0,0,0.5)',
              overflow: 'hidden'
            }}>
              {/* Craters that spin continuously */}
              <div className="crater-group">
                <div style={{position:'absolute', width:34, height:34, borderRadius:'50%', background:'rgba(0,0,0,0.08)', top:20, left:24, boxShadow:'inset 2px 2px 5px rgba(0,0,0,0.2)'}} />
                <div style={{position:'absolute', width:50, height:50, borderRadius:'50%', background:'rgba(0,0,0,0.06)', top:60, right:15, boxShadow:'inset 3px 3px 6px rgba(0,0,0,0.15)'}} />
                <div style={{position:'absolute', width:25, height:25, borderRadius:'50%', background:'rgba(0,0,0,0.1)', bottom:20, left:40, boxShadow:'inset 2px 2px 4px rgba(0,0,0,0.2)'}} />
              </div>
            </div>
          </div>
        </div>

        {/* Titolo */}
        <h1 className="font-cinzel text-5xl font-bold moon-glow mb-1 leading-tight tracking-wide">
          Lupus<br/>in Fabula
        </h1>
        <p className="font-outfit text-xs tracking-[0.35em] font-normal uppercase mb-8 opacity-80" style={{color:'var(--moon)'}}>
          ✦ &nbsp;{t('home.tagline')}&nbsp; ✦
        </p>

        {/* Divisore dorato */}
        <div className="home-divider mb-8" />

        {/* Bottoni */}
        <div className="flex flex-col gap-3">
          <button onClick={onCreateGame}
            className="btn-gold-shimmer w-full py-4 rounded-2xl text-base shadow-2xl">
            {t('home.createGame')}
          </button>
          <button onClick={onViewHistory}
            className="btn-ghost w-full py-4 rounded-2xl text-base">
            {t('home.history')}
          </button>
          <button onClick={onProfile}
            className="btn-ghost w-full py-4 rounded-2xl text-base">
            {t('home.profile')}
          </button>
        </div>

        {/* Come si gioca */}
        <button onClick={() => { setIsOnboarding(false); setShowTutorial(true); }}
          className="w-full py-3 rounded-2xl mt-3 flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{background:'rgba(226,201,126,0.05)', border:'1px solid rgba(226,201,126,0.15)', color:'rgba(226,201,126,0.7)'}}>
          <span className="text-sm">📖</span>
          <span className="text-sm font-semibold tracking-wide">{t('home.howToPlay')}</span>
        </button>

        {/* Divisore basso */}
        <div className="home-divider mt-8 mb-4" />

        {/* Pulsante "Configura Firebase" rimosso — flaggato da Apple come beta feature */}

        <p className="text-xs mt-6 tracking-widest" style={{color:'rgba(226,201,126,0.2)'}}>{t('home.footer')}</p>
      </div>

      <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} isOnboarding={isOnboarding} />
    </div>
  );
}

/* ================================================================
   PACK DEFINITIONS
   ================================================================ */
const PACKS = {
  ombre: {
    id: 'ombre',
    name: 'Personaggi Oscuri',
    icon: '🌑',
    price: '€1,99',
    color: '#6c3483',
    description: 'Ruoli oscuri che ribaltano ogni certezza',
    roles: ['strega', 'figlio_dei_lupi', 'cacciatore', 'medium', 'indemoniato'],
  },
  villaggio: {
    id: 'villaggio',
    name: 'Figure del Villaggio',
    icon: '🏘️',
    price: '€1,99',
    color: '#f39c12',
    description: 'Intrighi e poteri speciali tra i villici',
    roles: ['cupido', 'sindaco', 'sciamano', 'mitomane'],
  },
  narratore: {
    id: 'narratore',
    name: 'Voce AI Narratore',
    icon: '🎙️',
    price: '€1,99',
    color: '#e2c97e',
    description: 'Il narratore legge ogni scena con voce cinematografica',
    roles: [],
  },
  combo: {
    id: 'combo',
    name: 'Pacchetto Completo',
    icon: '⚡',
    price: '€4,99',
    color: '#e2c97e',
    description: 'Tutti i ruoli + Narratore AI — il gioco completo',
    roles: [],
    includes: ['ombre', 'villaggio', 'narratore'],
  },
};
// Espone PACKS al global così usePurchases può scrivere i prezzi REALI localizzati
// (priceString di RevenueCat/App Store) al posto dei fallback in EUR hardcoded qui
// sopra. Su web/senza IAP resta il fallback. I `price` qui sono solo valori di
// ripiego di visualizzazione — la fonte di verità è App Store Connect.
window.PACKS = PACKS;
applyLanguageToStaticData(); // applica subito la lingua rilevata (IT è già il default hardcoded sopra)

/* ================================================================
   PAYWALL MODAL
   ================================================================ */
function PaywallModal({ packId, onClose, onPurchase, isPurchasing }) {
  const [expandedRole, setExpandedRole] = useState(null);
  const [isTrying, setIsTrying] = useState(false);
  const [triedOnce, setTriedOnce] = useState(false);

  useEffect(() => {
    if (packId) trackEvent('paywall_view', { pack_id: packId });
  }, [packId]);

  if (!packId) return null;
  const pack = PACKS[packId];
  if (!pack) return null;
  const combo = PACKS.combo;
  const isCombo = packId === 'combo';
  const isNarratore = packId === 'narratore';
  const showComboUpsell = !isCombo && combo;

  const tryNarrator = async () => {
    if (isTrying) return;
    setIsTrying(true);
    setTriedOnce(true);
    try {
      const appUrl = window.Capacitor?.isNativePlatform?.()
        ? 'https://lupus-in-fabula-eight.vercel.app'
        : window.location.origin;
      const res = await fetch(`${appUrl}/api/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: t('paywall.demoText') }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => { setIsTrying(false); URL.revokeObjectURL(url); };
      audio.onerror = () => setIsTrying(false);
      await audio.play();
    } catch {
      setIsTrying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4"
         style={{background:'rgba(0,0,0,0.82)', backdropFilter:'blur(6px)'}}
         onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden anim-fade-up"
           style={{background:'linear-gradient(180deg,#12122a 0%,#0a0a1a 100%)',
                   border:`1px solid ${pack.color}44`, maxHeight:'88vh', overflowY:'auto'}}
           onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 pt-7 pb-5 text-center"
             style={{background:`radial-gradient(ellipse at 50% 0%, ${pack.color}22 0%, transparent 70%)`}}>
          <div className="text-5xl mb-3">{pack.icon}</div>
          <h2 className="font-cinzel text-xl font-bold text-white mb-1">{pack.name}</h2>
          <p className="text-sm text-gray-400">{pack.description}</p>
        </div>

        {/* Contenuto: ruoli — cliccabili per vedere descrizione */}
        {pack.roles.length > 0 && (
          <div className="px-6 pb-4">
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">{t('paywall.tapToDiscover')}</p>
            <div className="grid grid-cols-2 gap-2">
              {pack.roles.map(rid => {
                const r = ROLES[rid]; if (!r) return null;
                const isExpanded = expandedRole === rid;
                return (
                  <button key={rid}
                          onClick={() => setExpandedRole(isExpanded ? null : rid)}
                          className="text-left rounded-xl overflow-hidden transition-all active:scale-95"
                          style={{background:`${r.color}${isExpanded ? '22' : '12'}`,
                                  border:`1px solid ${r.color}${isExpanded ? '66' : '33'}`}}>
                    <div className="flex items-center gap-2 py-2.5 px-3">
                      <span className="text-xl leading-none shrink-0">{r.icon}</span>
                      <span className="text-xs font-bold text-white leading-tight flex-1">{r.name}</span>
                      <span className="text-gray-600 text-xs shrink-0">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                    {isExpanded && (
                      <div className="px-3 pb-3">
                        <span className="inline-block text-[9px] px-1.5 py-0.5 rounded-full mb-1.5 font-bold"
                              style={{background: r.team==='lupi' ? 'rgba(239,68,68,0.15)' : 'rgba(74,222,128,0.15)',
                                      color: r.team==='lupi' ? '#f87171' : '#4ade80'}}>
                          {r.team==='lupi' ? t('teamBadge.lupi') : t('teamBadge.villaggio')}
                        </span>
                        <p className="text-gray-400 text-[11px] leading-relaxed">{r.description}</p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Contenuto: narratore — descrizione + tasto prova */}
        {isNarratore && (
          <div className="px-6 pb-4 flex flex-col gap-3">
            <div className="p-4 rounded-2xl text-sm text-gray-400 leading-relaxed"
                 style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)'}}>
              {t('paywall.narratorDescription')}<br/>
              <span className="text-xs text-gray-600 mt-1 block">{t('paywall.narratorActivateHint')}</span>
            </div>
            <button
              onClick={tryNarrator}
              disabled={isTrying}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{background:'rgba(226,201,126,0.08)', border:'1px solid rgba(226,201,126,0.25)', color:'#e2c97e'}}>
              {isTrying
                ? <><span className="animate-spin">◌</span> {t('paywall.loadingExample')}</>
                : triedOnce
                  ? t('paywall.playAgain')
                  : t('paywall.listenExample')}
            </button>
          </div>
        )}

        {/* Contenuto: combo — lista pack inclusi */}
        {isCombo && (
          <div className="px-6 pb-4">
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">{t('paywall.includes')}</p>
            <div className="flex flex-col gap-2">
              {combo.includes.map(pid => {
                const p = PACKS[pid]; if (!p) return null;
                return (
                  <div key={pid} className="flex items-center gap-3 py-2.5 px-3 rounded-xl"
                       style={{background:`${p.color}10`, border:`1px solid ${p.color}33`}}>
                    <span className="text-2xl leading-none">{p.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.description}</p>
                    </div>
                    <span className="text-xs text-gray-600 line-through">{p.price}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA principale */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          <button
            onClick={() => onPurchase(packId)}
            disabled={isPurchasing}
            className="w-full py-4 rounded-2xl font-cinzel font-bold text-base transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{background:`linear-gradient(135deg,${pack.color}cc,${pack.color}66)`,
                    color:'#0a0a1a', boxShadow:`0 0 24px ${pack.color}44`,
                    opacity: isPurchasing ? 0.7 : 1}}>
            {isPurchasing
              ? <><span className="animate-spin">◌</span> {t('paywall.purchasing')}</>
              : t('paywall.purchase', {price: pack.price})}
          </button>

          {showComboUpsell && !isPurchasing && (
            <button
              onClick={() => onPurchase('combo')}
              className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
              style={{background:'rgba(226,201,126,0.06)', border:'1px solid rgba(226,201,126,0.2)', color:'rgba(226,201,126,0.7)'}}>
              {t('paywall.orGetCombo', {price: combo.price})}
            </button>
          )}

          <button onClick={onClose}
                  className="w-full py-2 text-sm text-gray-600 hover:text-gray-400 transition-colors">
            {t('paywall.notNow')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   STATS + PROFILE + AVATAR
   ================================================================ */

const BG_GRADIENTS = [
  { id:'wolf',  css:'radial-gradient(circle at 35% 35%, #3d0010, #1a0005, #000)', label:'Branco' },
  { id:'seer',  css:'radial-gradient(circle at 35% 35%, #1e0050, #0a001a, #000)', label:'Visioni' },
  { id:'guard', css:'radial-gradient(circle at 35% 35%, #003555, #001020, #000)', label:'Acciaio' },
  { id:'witch', css:'radial-gradient(circle at 35% 35%, #004015, #001a05, #000)', label:'Erbe' },
  { id:'gold',  css:'radial-gradient(circle at 35% 35%, #3d2d00, #1a1400, #000)', label:'Oro' },
  { id:'teal',  css:'radial-gradient(circle at 35% 35%, #003838, #001a1a, #000)', label:'Acque' },
  { id:'rose',  css:'radial-gradient(circle at 35% 35%, #450030, #1a0012, #000)', label:'Rosa' },
  { id:'void',  css:'radial-gradient(circle at 35% 35%, #14142e, #080812, #000)', label:'Vuoto' },
];
const AVATAR_HEROES = [
  { id:'lupo', url:'/avatars/lupo.png' },
  { id:'strega', url:'/avatars/strega.png' },
  { id:'veggente', url:'/avatars/veggente.png' },
  { id:'cacciatore', url:'/avatars/cacciatore.png' },
  { id:'villico', url:'/avatars/villico.png' },
  { id:'sciamano', url:'/avatars/sciamano.png' },
];
const AVATAR_SIGILS = [
  { id:'none', icon:'' },
  { id:'moon', icon:'🌙' },
  { id:'blood', icon:'🩸' },
  { id:'skull', icon:'💀' },
  { id:'eye', icon:'👁️' },
  { id:'swords', icon:'⚔️' },
  { id:'crown', icon:'👑' },
];
const AURA_COLORS = [
  { id:'wolf',    color:'#c0392b' },
  { id:'village', color:'#27ae60' },
  { id:'moon',    color:'#e2c97e' },
  { id:'mystic',  color:'#7c3aed' },
];
const DEFAULT_AVATAR = { bg:'void', hero:'lupo', aura:'moon', sigil:'none' };

function generateProfileComment(stats) {
  const { gamesHosted = 0, villaggioWins = 0, rolesUsed = {} } = stats || {};
  if (gamesHosted === 0) return t('profile.comments.neverHosted');
  if (gamesHosted === 1) {
    return villaggioWins ? t('profile.comments.firstWin') : t('profile.comments.firstLoss');
  }
  const villaggioWinRate = villaggioWins / gamesHosted;
  if (villaggioWinRate >= 0.75 && gamesHosted >= 5) return t('profile.comments.villageHighWinRate');
  if (villaggioWinRate <= 0.25 && gamesHosted >= 4) return t('profile.comments.wolvesHighWinRate');
  let mostUsedRole = null;
  let maxCount = 0;
  for (const [key, count] of Object.entries(rolesUsed)) {
    if (count > maxCount) { maxCount = count; mostUsedRole = key; }
  }
  if (mostUsedRole) {
    if (mostUsedRole === 'lupo') return t('profile.comments.mostUsedLupo');
    if (mostUsedRole === 'strega') return t('profile.comments.mostUsedStrega');
    if (mostUsedRole === 'veggente') return t('profile.comments.mostUsedVeggente');
    if (mostUsedRole === 'cupido') return t('profile.comments.mostUsedCupido');
    if (mostUsedRole === 'sciamano') return t('profile.comments.mostUsedSciamano');
  }
  if (gamesHosted >= 20) return t('profile.comments.veteran20');
  if (gamesHosted >= 10) return t('profile.comments.veteran10');
  return t('profile.comments.nNights', {n: gamesHosted});
}

function AvatarDisplay({ config = DEFAULT_AVATAR, size = 72 }) {
  const auraObj = AURA_COLORS.find(a => a.id === (config.aura || 'moon')) || AURA_COLORS[2];
  const heroObj = AVATAR_HEROES.find(h => h.id === (config.hero || 'lupo')) || AVATAR_HEROES[0];
  const sigilObj = AVATAR_SIGILS.find(s => s.id === (config.sigil || 'none')) || AVATAR_SIGILS[0];

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      backgroundColor: '#0a0a1a', /* deep navy fallback */
      border: `2.5px solid ${auraObj.color}`,
      boxShadow: `0 0 ${size * 0.25}px ${auraObj.color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, position: 'relative',
    }}>
      {/* Portrait layer */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        backgroundImage: `url(${heroObj.url})`, backgroundSize: 'cover', backgroundPosition: 'center',
      }} />
      
      {/* Glow layer to restore some brightness */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        boxShadow: `inset 0 0 20px ${auraObj.color}88`, pointerEvents:'none'
      }} />
      
      {/* Sigil layer */}
      {sigilObj.id !== 'none' && (
        <div style={{
          position:'absolute', bottom:-4, right:-4, width: size*0.35, height: size*0.35,
          background:'#000', borderRadius:'50%', border:`1.5px solid ${auraObj.color}`,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize: size*0.18,
          boxShadow:`0 0 10px ${auraObj.color}`, zIndex: 10
        }}>
          {sigilObj.icon}
        </div>
      )}
    </div>
  );
}

function AvatarCreator({ config = DEFAULT_AVATAR, onChange }) {
  const current = { ...DEFAULT_AVATAR, ...config };
  const [activeTab, setActiveTab] = useState('hero');
  const [popKey, setPopKey] = useState(0);

  const triggerPop = () => setPopKey(k => k + 1);

  const handleSelect = (key, val) => {
    onChange({ ...current, [key]: val });
    triggerPop();
  };

  const handleRandomize = () => {
    const rHero = AVATAR_HEROES[Math.floor(Math.random() * AVATAR_HEROES.length)].id;
    const rSigil = AVATAR_SIGILS[Math.floor(Math.random() * AVATAR_SIGILS.length)].id;
    const rAura = AURA_COLORS[Math.floor(Math.random() * AURA_COLORS.length)].id;
    onChange({ ...current, hero: rHero, sigil: rSigil, aura: rAura });
    triggerPop();
  };

  return (
    <div className="glass anim-fade-up" style={{borderRadius:20, padding:20, marginTop:16}}>
      
      {/* Live Preview & Randomizer */}
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', marginBottom:20}}>
        <div key={popKey} className="avatar-pop-anim">
          <AvatarDisplay config={current} size={110} />
        </div>
        <button onClick={handleRandomize} className="btn-gold-shimmer" style={{marginTop:16, padding:'8px 24px', borderRadius:12, fontSize:12, display:'flex', alignItems:'center', gap:6, fontWeight:800}}>
          <span style={{fontSize:18}}>🎲</span> {t('avatarCreator.forge')}
        </button>
      </div>

      {/* Tabs */}
      <div style={{display:'flex', borderBottom:'1px solid rgba(255,255,255,0.1)', marginBottom:20}}>
        <div className={`rpg-nav-tab ${activeTab==='hero'?'active':''}`} onClick={()=>setActiveTab('hero')}>{t('avatarCreator.tabHero')}</div>
        <div className={`rpg-nav-tab ${activeTab==='sigil'?'active':''}`} onClick={()=>setActiveTab('sigil')}>{t('avatarCreator.tabSigil')}</div>
        <div className={`rpg-nav-tab ${activeTab==='aura'?'active':''}`} onClick={()=>setActiveTab('aura')}>{t('avatarCreator.tabAura')}</div>
      </div>

      {/* Tab Content */}
      <div style={{minHeight:140}}>
        {activeTab === 'hero' && (
          <div style={{display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center'}}>
            {AVATAR_HEROES.map(h => (
              <div key={h.id} onClick={() => handleSelect('hero', h.id)} style={{position:'relative', cursor:'pointer'}}>
                <div style={{
                  width:54, height:54, borderRadius:14, backgroundImage:`url(${h.url})`, backgroundSize:'cover', backgroundPosition:'center',
                  border: current.hero === h.id ? '2px solid #e2c97e' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: current.hero === h.id ? '0 0 15px rgba(226, 201, 126, 0.4)' : 'none',
                  transform: current.hero === h.id ? 'scale(1.1)' : 'scale(1)',
                  transition:'all 0.2s', filter: current.hero === h.id ? 'brightness(1.1)' : 'brightness(0.7)'
                }} />
                {current.hero === h.id && <div style={{position:'absolute', top:-6, right:-6, background:'#e2c97e', color:'#000', borderRadius:'50%', width:18, height:18, fontSize:12, display:'flex', alignItems:'center', justifyContent:'center', zIndex:5, boxShadow:'0 2px 5px rgba(0,0,0,0.5)'}}>✓</div>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'sigil' && (
          <div style={{display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center'}}>
            {AVATAR_SIGILS.map(s => (
              <button key={s.id} onClick={() => handleSelect('sigil', s.id)}
                style={{
                  width:54, height:54, borderRadius:14, fontSize:22,
                  background: current.sigil === s.id ? 'rgba(226,201,126,0.15)' : 'rgba(255,255,255,0.03)',
                  border: current.sigil === s.id ? '2px solid #e2c97e' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: current.sigil === s.id ? '0 0 15px rgba(226, 201, 126, 0.4)' : 'none',
                  transform: current.sigil === s.id ? 'scale(1.1)' : 'scale(1)',
                  cursor:'pointer', transition:'all 0.2s', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center'
                }}
              >
                {s.id === 'none' ? '🚫' : s.icon}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'aura' && (
          <div style={{display:'flex', flexWrap:'wrap', gap:16, justifyContent:'center'}}>
            {AURA_COLORS.map(a => (
              <div key={a.id} onClick={() => handleSelect('aura', a.id)}
                style={{
                  width:48, height:48, borderRadius:'50%', background:a.color, cursor:'pointer',
                  border: current.aura === a.id ? '3px solid #fff' : '2px solid rgba(255,255,255,0.2)',
                  boxShadow: current.aura === a.id ? `0 0 20px ${a.color}` : 'inset 0 0 10px rgba(0,0,0,0.5)',
                  transform: current.aura === a.id ? 'scale(1.15)' : 'scale(1)',
                  transition: 'all 0.2s', position:'relative'
                }}>
                {current.aura === a.id && <div style={{position:'absolute', top:-2, right:-4, background:'#fff', color:'#000', borderRadius:'50%', width:16, height:16, fontSize:10, display:'flex', alignItems:'center', justifyContent:'center'}}>✨</div>}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

async function writeGameStats(uid, gameResult) {
  if (!db) return;
  const { winner, players = [] } = gameResult;
  const statsRef = db.ref(`users/${uid}/stats`);
  const snapshot = await statsRef.once('value');
  const prev = snapshot.val() || { gamesHosted: 0, villaggioWins: 0, lupiWins: 0, rolesUsed: {}, lastGame: 0 };
  const rolesUsed = { ...(prev.rolesUsed || {}) };
  players.forEach(p => {
    if (p.role) rolesUsed[p.role] = (rolesUsed[p.role] || 0) + 1;
  });
  const updated = {
    gamesHosted: (prev.gamesHosted || 0) + 1,
    villaggioWins: (prev.villaggioWins || 0) + (winner === 'villaggio' ? 1 : 0),
    lupiWins: (prev.lupiWins || 0) + (winner === 'lupi' || winner === 'amore' ? 1 : 0),
    lastGame: Date.now(),
    rolesUsed,
  };
  await statsRef.update(updated);
  // Init avatar if not set
  const avatarRef = db.ref(`users/${uid}/avatar`);
  const avatarSnap = await avatarRef.once('value');
  if (!avatarSnap.val()) {
    await avatarRef.set(DEFAULT_AVATAR);
  }
}

function ProfileScreen({ user, onBack }) {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Load avatar
  useEffect(() => {
    if (!user) return;
    let localAvatar = null;
    try { localAvatar = JSON.parse(localStorage.getItem('lif_avatar')); } catch(e) {}
    if (db) {
      db.ref(`users/${user.uid}/avatar`).once('value').then(snap => {
        const val = snap.val();
        if (val) { setAvatar(val); try { localStorage.setItem('lif_avatar', JSON.stringify(val)); } catch(e) {} }
        else if (localAvatar) setAvatar(localAvatar);
      }).catch(() => { if (localAvatar) setAvatar(localAvatar); });
    } else if (localAvatar) {
      setAvatar(localAvatar);
    }
  }, [user]);

  // Load stats
  useEffect(() => {
    if (!user) { setStatsLoading(false); return; }
    if (!db) { setStatsLoading(false); return; }
    db.ref(`users/${user.uid}/stats`).once('value').then(snap => {
      setStats(snap.val() || { gamesHosted: 0, villaggioWins: 0, lupiWins: 0, rolesUsed: {} });
      setStatsLoading(false);
    }).catch(() => setStatsLoading(false));
  }, [user]);

  // Load leaderboard
  useEffect(() => {
    if (!db) { setLbLoading(false); return; }
    db.ref('users').once('value').then(snap => {
      const all = snap.val() || {};
      const rows = Object.entries(all).map(([uid, data]) => ({
        uid,
        displayName: data.displayName || data.email || '???',
        avatar: data.avatar || DEFAULT_AVATAR,
        gamesHosted: data.stats?.gamesHosted || 0,
        villaggioWins: data.stats?.villaggioWins || 0,
      }));
      rows.sort((a, b) => b.gamesHosted - a.gamesHosted);
      setLeaderboard(rows.slice(0, 10));
      setLbLoading(false);
    }).catch(() => setLbLoading(false));
  }, []);

  const handleAvatarChange = (newConfig) => {
    setAvatar(newConfig);
    try { localStorage.setItem('lif_avatar', JSON.stringify(newConfig)); } catch(e) {}
    if (db && user) db.ref(`users/${user.uid}/avatar`).set(newConfig).catch(() => {});
  };

  const handleDeleteAccount = async () => {
    if (!user || !auth) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      // 1. Cancella dati utente dal Realtime Database
      if (db) {
        await db.ref(`users/${user.uid}`).remove();
      }
      // 2. Cancella dati locali
      try {
        localStorage.removeItem('lif_avatar');
        localStorage.removeItem('lif_purchased_packs');
        localStorage.removeItem('lif_rejoin');
        localStorage.removeItem('lif_privacy_accepted');
      } catch(e) {}
      // 3. Cancella l'account Firebase Auth
      await auth.currentUser.delete();
      // 4. Torna alla home (l'app rileverà user=null)
      onBack();
    } catch(e) {
      console.error('[deleteAccount]', e);
      if (e.code === 'auth/requires-recent-login') {
        setDeleteError(t('profile.errorRecentLogin'));
      } else {
        setDeleteError(t('profile.errorGeneric'));
      }
      setDeleteLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen screen-safe flex flex-col items-center justify-center p-6" style={{background:'#0d1117'}}>
        <p style={{color:'rgba(226,201,126,0.6)'}}>{t('profile.loginPrompt')}</p>
        <button onClick={onBack} className="btn-gold mt-6 px-6 py-3 rounded-2xl">← {t('common.back')}</button>
      </div>
    );
  }

  const winRate = stats && stats.gamesHosted > 0 ? Math.round((stats.villaggioWins / stats.gamesHosted) * 100) : 0;
  let mostUsedRole = null;
  let mostUsedCount = 0;
  if (stats?.rolesUsed) {
    for (const [k, v] of Object.entries(stats.rolesUsed)) {
      if (v > mostUsedCount) { mostUsedCount = v; mostUsedRole = k; }
    }
  }
  const roleLabels = t('profile.roleLabels');
  const roleIcons = {
    lupo:'🐺', villico:'🧑‍🌾', veggente:'🔮', guardia:'🛡️',
    strega:'🧙‍♀️', cacciatore:'🏹', cupido:'💘', sindaco:'🏛️',
    medium:'👁️', mitomane:'🎭', figlio_dei_lupi:'🐾', sciamano:'🪬',
  };

  const currentUserInLb = user ? leaderboard.find(r => r.uid === user.uid) : null;
  const currentUserRank = user ? leaderboard.findIndex(r => r.uid === user.uid) + 1 : 0;

  return (
    <div className="min-h-screen screen-safe flex flex-col" style={{background:'#0d1117'}}>
      {/* Header */}
      <div style={{
        position:'sticky', top:0, zIndex:50,
        background:'rgba(13,17,23,0.92)', backdropFilter:'blur(12px)',
        borderBottom:'1px solid rgba(255,255,255,0.06)',
        padding:'14px 16px', display:'flex', alignItems:'center', gap:12,
      }}>
        <button onClick={onBack} style={{
          background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
          borderRadius:10, padding:'6px 12px', color:'#e2c97e', fontSize:16, cursor:'pointer',
        }}>←</button>
        <h2 className="font-cinzel" style={{color:'#e2c97e', fontSize:18, fontWeight:700, flex:1}}>{t('profile.title')}</h2>
      </div>

      <div className="flex flex-col gap-4 px-4 py-4" style={{maxWidth:480, margin:'0 auto', width:'100%'}}>

        {/* Section 1 — Avatar + name (RPG Hero Card) */}
        <div className="anim-fade-up glass" style={{
          borderRadius:20, border:'1px solid rgba(255,255,255,0.08)', overflow:'hidden', textAlign:'center',
          position:'relative'
        }}>
          {/* Cover Header */}
          <div className="rpg-cover" />
          
          {/* Overlapping Avatar */}
          <div style={{display:'flex', justifyContent:'center', marginTop:-50, position:'relative', zIndex:10}}>
            <AvatarDisplay config={avatar} size={100} />
          </div>
          
          <div style={{padding:'16px 20px', paddingBottom:24}}>
            <p className="font-cinzel" style={{color:'#e2c97e', fontSize:22, fontWeight:800, marginBottom:2, textShadow:'0 2px 10px rgba(226, 201, 126, 0.3)'}}>
              {user.displayName || t('profile.mysteriousPlayer')}
            </p>
            <p style={{color:'rgba(255,255,255,0.4)', fontSize:11, letterSpacing:'0.05em', marginBottom:16}}>
              {user.email || ''}
            </p>

            <button
              onClick={() => setShowAvatarEditor(v => !v)}
              className="btn-gold-shimmer"
              style={{
                borderRadius:12, padding:'10px 20px', fontSize:13, letterSpacing:'0.05em', margin:'0 auto',
              }}
            >
              {showAvatarEditor ? t('profile.close') : t('profile.customizeAvatar')}
            </button>
            
            {showAvatarEditor && (
              <div style={{marginTop:20, textAlign:'left'}}>
                <AvatarCreator config={avatar} onChange={handleAvatarChange} />
              </div>
            )}
          </div>
        </div>

        {/* Section 2 — Stats (Trading Card Format) */}
        <div className="anim-fade-up glass" style={{borderRadius:20, padding:24, border:'1px solid rgba(255,255,255,0.08)', position:'relative'}}>
          <div style={{position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:'80%', height:1, background:'radial-gradient(ellipse, rgba(226, 201, 126, 0.4), transparent)'}} />
          
          <h3 className="font-cinzel" style={{color:'#e2c97e', fontSize:14, fontWeight:700, letterSpacing:'0.15em', marginBottom:20, textAlign:'center'}}>{t('profile.compendium')}</h3>

          {statsLoading ? (
            <p style={{color:'rgba(255,255,255,0.35)', fontSize:13, textAlign:'center', padding:'16px 0'}}>{t('profile.loadingTomes')}</p>
          ) : (
            <>
              {/* Grand Stat */}
              <div style={{textAlign:'center', marginBottom:24}}>
                <p style={{color:'rgba(255,255,255,0.4)', fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:4}}>{t('profile.gamesHosted')}</p>
                <p className="golden-number">{stats?.gamesHosted || 0}</p>
              </div>

              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20}}>
                <div style={{background:'linear-gradient(135deg, rgba(39,174,96,0.1), rgba(39,174,96,0.02))', border:'1px solid rgba(39,174,96,0.2)', borderRadius:16, padding:'14px 12px', textAlign:'center', boxShadow:'inset 0 0 20px rgba(39,174,96,0.05)'}}>
                  <p style={{color:'rgba(39,174,96,0.8)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6}}>{t('profile.villaggioSafe')}</p>
                  <p style={{color:'#27ae60', fontSize:28, fontWeight:800, textShadow:'0 0 10px rgba(39,174,96,0.4)'}}>{stats?.villaggioWins || 0}</p>
                </div>
                <div style={{background:'linear-gradient(135deg, rgba(192,57,43,0.1), rgba(192,57,43,0.02))', border:'1px solid rgba(192,57,43,0.2)', borderRadius:16, padding:'14px 12px', textAlign:'center', boxShadow:'inset 0 0 20px rgba(192,57,43,0.05)'}}>
                  <p style={{color:'rgba(192,57,43,0.8)', fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6}}>{t('profile.lupiTriumph')}</p>
                  <p style={{color:'#c0392b', fontSize:28, fontWeight:800, textShadow:'0 0 10px rgba(192,57,43,0.4)'}}>{stats?.lupiWins || 0}</p>
                </div>
              </div>

              {/* Win rate bar */}
              <div style={{marginBottom:24, padding:'0 8px'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
                  <p style={{color:'rgba(255,255,255,0.4)', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase'}}>{t('profile.winRate')}</p>
                  <p style={{color:'#e2c97e', fontSize:13, fontWeight:800}}>{winRate}%</p>
                </div>
                <div style={{height:8, borderRadius:99, background:'rgba(255,255,255,0.05)', overflow:'hidden', boxShadow:'inset 0 1px 3px rgba(0,0,0,0.5)'}}>
                  <div style={{height:'100%', width:`${winRate}%`, borderRadius:99, background:'linear-gradient(90deg, #27ae60, #e2c97e)', boxShadow:'0 0 10px rgba(39,174,96,0.5)'}} />
                </div>
              </div>

              {/* Most used role badge */}
              {mostUsedRole && (
                <div style={{display:'flex', alignItems:'center', gap:14, background:'linear-gradient(90deg, rgba(226,201,126,0.08), rgba(226,201,126,0.02))', borderRadius:16, padding:'14px 16px', border:'1px solid rgba(226,201,126,0.15)', boxShadow:'inset 1px 0 0 rgba(255,255,255,0.1)'}}>
                  <div style={{width:48, height:48, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.3)', borderRadius:'50%', fontSize:24, border:'1px solid rgba(226,201,126,0.3)', boxShadow:'0 0 15px rgba(226,201,126,0.2)'}}>
                    {roleIcons[mostUsedRole] || '🎭'}
                  </div>
                  <div>
                    <p style={{color:'rgba(255,255,255,0.4)', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:2}}>{t('profile.roleMastery')}</p>
                    <p className="font-cinzel" style={{color:'#e2c97e', fontSize:16, fontWeight:800}}>{roleLabels[mostUsedRole] || mostUsedRole}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Section 3 — Cinematic comment */}
        {!statsLoading && stats && (
          <div className="anim-fade-up" style={{
            background:'#12122a', borderRadius:20, padding:20,
            border:'1px solid rgba(226,201,126,0.1)',
            position:'relative',
          }}>
            <span style={{position:'absolute', top:12, left:16, color:'rgba(226,201,126,0.2)', fontSize:32, lineHeight:1, fontFamily:'Georgia, serif'}}>"</span>
            <p style={{
              color:'#e2c97e', fontStyle:'italic', fontSize:14, lineHeight:1.7,
              padding:'10px 20px 10px 28px', textAlign:'center',
            }}>
              {generateProfileComment(stats)}
            </p>
            <span style={{position:'absolute', bottom:12, right:16, color:'rgba(226,201,126,0.2)', fontSize:32, lineHeight:1, fontFamily:'Georgia, serif'}}>"</span>
          </div>
        )}

        {/* Section 4 — Leaderboard */}
        <div className="anim-fade-up" style={{background:'#12122a', borderRadius:20, padding:20, border:'1px solid rgba(255,255,255,0.08)'}}>
          <h3 className="font-cinzel" style={{color:'#e2c97e', fontSize:14, fontWeight:700, letterSpacing:'0.1em', marginBottom:14}}>{t('profile.leaderboard')}</h3>
          {!db ? (
            <p style={{color:'rgba(255,255,255,0.35)', fontSize:13, textAlign:'center', padding:'12px 0'}}>{t('profile.connectFirebase')}</p>
          ) : lbLoading ? (
            <p style={{color:'rgba(255,255,255,0.35)', fontSize:13, textAlign:'center', padding:'12px 0'}}>{t('profile.loading')}</p>
          ) : leaderboard.length === 0 ? (
            <p style={{color:'rgba(255,255,255,0.35)', fontSize:13, textAlign:'center', padding:'12px 0'}}>{t('profile.noDataYet')}</p>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:8}}>
              {leaderboard.map((row, i) => {
                const isMe = user && row.uid === user.uid;
                return (
                  <div key={row.uid} style={{
                    display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:12,
                    background: isMe ? 'rgba(226,201,126,0.08)' : 'rgba(255,255,255,0.03)',
                    border: isMe ? '1px solid rgba(226,201,126,0.35)' : '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <span style={{color: i === 0 ? '#e2c97e' : i === 1 ? '#aaa' : i === 2 ? '#cd7f32' : 'rgba(255,255,255,0.3)', fontSize:13, fontWeight:700, width:20, textAlign:'center'}}>
                      {i + 1}
                    </span>
                    <AvatarDisplay config={row.avatar} size={32} />
                    <span style={{color: isMe ? '#e2c97e' : 'rgba(255,255,255,0.8)', fontSize:13, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                      {row.displayName}
                    </span>
                    <span style={{color:'rgba(255,255,255,0.4)', fontSize:11}}>{row.gamesHosted} {t('profile.nightsSuffix')}</span>
                    <span style={{color:'#27ae60', fontSize:11, fontWeight:700}}>{row.villaggioWins}V</span>
                  </div>
                );
              })}
              {/* Show current user below top 10 if not in it */}
              {user && !currentUserInLb && stats && (
                <div style={{
                  display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:12,
                  background:'rgba(226,201,126,0.08)', border:'1px solid rgba(226,201,126,0.35)',
                  marginTop:4,
                }}>
                  <span style={{color:'rgba(255,255,255,0.3)', fontSize:13, fontWeight:700, width:20, textAlign:'center'}}>—</span>
                  <AvatarDisplay config={avatar} size={32} />
                  <span style={{color:'#e2c97e', fontSize:13, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                    {user.displayName || t('profile.you')}
                  </span>
                  <span style={{color:'rgba(255,255,255,0.4)', fontSize:11}}>{stats.gamesHosted} {t('profile.nightsSuffix')}</span>
                  <span style={{color:'#27ae60', fontSize:11, fontWeight:700}}>{stats.villaggioWins}V</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 5 — Danger Zone */}
        <div className="anim-fade-up" style={{
          borderRadius:20, padding:20,
          border:'1px solid rgba(192,57,43,0.2)',
          background:'rgba(192,57,43,0.04)',
          marginBottom:32,
        }}>
          <h3 className="font-cinzel" style={{color:'rgba(192,57,43,0.8)', fontSize:13, fontWeight:700, letterSpacing:'0.12em', marginBottom:12}}>{t('profile.dangerZone')}</h3>
          <p style={{color:'rgba(255,255,255,0.4)', fontSize:12, lineHeight:1.6, marginBottom:16}}>
            {t('profile.dangerZoneBody')}
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              width:'100%', padding:'12px 0', borderRadius:12,
              background:'transparent', border:'1px solid rgba(192,57,43,0.5)',
              color:'rgba(192,57,43,0.9)', fontSize:13, fontWeight:600,
              cursor:'pointer', letterSpacing:'0.05em',
            }}>
            {t('profile.deleteAccount')}
          </button>
        </div>

      </div>

      {/* Modal conferma eliminazione account */}
      {showDeleteConfirm && (
        <div style={{
          position:'fixed', inset:0, zIndex:200,
          background:'rgba(0,0,0,0.85)', backdropFilter:'blur(8px)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:24,
        }}>
          <div style={{
            background:'#0d1117', borderRadius:24, padding:28,
            border:'1px solid rgba(192,57,43,0.4)',
            maxWidth:360, width:'100%',
            boxShadow:'0 0 60px rgba(192,57,43,0.15)',
          }}>
            <div style={{textAlign:'center', marginBottom:20}}>
              <div style={{fontSize:40, marginBottom:12}}>⚠️</div>
              <h3 className="font-cinzel" style={{color:'#e2c97e', fontSize:18, fontWeight:800, marginBottom:8}}>{t('profile.confirmTitle')}</h3>
              <p style={{color:'rgba(255,255,255,0.55)', fontSize:13, lineHeight:1.65}}>
                {t('profile.confirmBodyPrefix')} <strong style={{color:'rgba(192,57,43,0.9)'}}>{t('profile.confirmBodyStrong')}</strong>{t('profile.confirmBodySuffix')}
              </p>
            </div>

            {deleteError && (
              <div style={{
                background:'rgba(192,57,43,0.1)', border:'1px solid rgba(192,57,43,0.3)',
                borderRadius:12, padding:'10px 14px', marginBottom:16,
                color:'rgba(255,120,100,0.9)', fontSize:12, lineHeight:1.5,
              }}>
                {deleteError}
              </div>
            )}

            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                style={{
                  width:'100%', padding:'13px 0', borderRadius:12,
                  background:'rgba(192,57,43,0.85)', border:'none',
                  color:'#fff', fontSize:14, fontWeight:700,
                  cursor: deleteLoading ? 'not-allowed' : 'pointer',
                  opacity: deleteLoading ? 0.6 : 1,
                  letterSpacing:'0.05em',
                }}>
                {deleteLoading ? t('profile.confirmDeleting') : t('profile.confirmDelete')}
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteError(null); }}
                disabled={deleteLoading}
                style={{
                  width:'100%', padding:'13px 0', borderRadius:12,
                  background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
                  color:'rgba(255,255,255,0.7)', fontSize:14, fontWeight:600,
                  cursor:'pointer',
                }}>
                {t('profile.confirmCancel')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ================================================================
   CREATE GAME SCREEN
   ================================================================ */
/* Card ruolo — variante C: tap aggiunge, badge sovrapposto rimuove, bottone i per info */
function RoleCardC({ r, count, onAdd, onInfo, unlocked, disabled }) {
  return (
    <div className="relative" style={{overflow:'visible'}}>
      {/* Badge count — solo indicatore, nessuna azione */}
      {count > 0 && (
        <div className="absolute z-10 flex items-center justify-center font-bold pointer-events-none"
          style={{ top: -6, right: -6, width: 20, height: 20, borderRadius: '50%',
            background: r.color, color: '#0d1117', border: '2px solid #0d1117', fontSize: 9 }}>
          {count}
        </div>
      )}
      {/* Card principale */}
      <button
        onClick={onAdd}
        disabled={disabled}
        className="relative w-full flex flex-col items-center gap-1 py-3 px-1 rounded-2xl transition-all active:scale-95"
        style={{
          background: count > 0 ? `${r.color}22` : 'rgba(255,255,255,0.04)',
          border: `1px solid ${count > 0 ? r.color + '88' : r.color + '33'}`,
          minHeight: 76,
          opacity: (disabled && count === 0) ? 0.35 : unlocked ? 1 : 0.55,
        }}>
        {!unlocked && <span className="absolute top-1 right-1 text-xs leading-none">🔒</span>}
        <span className="text-2xl leading-none">{r.icon}</span>
        <span className="text-[10px] font-bold text-white text-center leading-tight px-1"
              style={{wordBreak:'break-word'}}>{r.name}</span>
      </button>
      {/* Info button */}
      <button
        onClick={e => { e.stopPropagation(); onInfo(); }}
        className="absolute flex items-center justify-center font-bold transition-all active:scale-90"
        style={{
          bottom: -6, left: -6,
          width: 22, height: 22, borderRadius: '50%',
          background: 'rgba(30,30,40,0.92)',
          border: '1.5px solid rgba(255,255,255,0.35)',
          color: '#ffffff',
          fontSize: 10,
          zIndex: 10,
        }}>
        i
      </button>
    </div>
  );
}

function CreateGameScreen({onStart, onBack, initialSetup, userId}) {
  const [step, setStep] = useState(initialSetup ? (initialSetup.initialStep ?? 2) : 1);
  const [players, setPlayers] = useState(() => initialSetup ? initialSetup.playerNames : []);
  const [inputName, setInputName] = useState('');
  const inputRef = useRef(null);
  // wolfCount separato; roles = tutti i ruoli non-lupo (incluso villico) scelti manualmente
  const [wolfCount, setWolfCount] = useState(() => initialSetup ? initialSetup.wolfCount : 1);
  const [roles, setRoles] = useState(() => initialSetup ? (initialSetup.allRoles || initialSetup.specialRoles || []) : []);
  const [expandedPacks, setExpandedPacks] = useState({});
  const [showHint, setShowHint] = useState(false);
  const [previewRole, setPreviewRole] = useState(null);
  const [paywallPack, setPaywallPack] = useState(null);
  const {
    purchasedPacks,
    isLoading: isPurchasing,
    purchasePackage,
    restorePurchases,
    isPackUnlocked,
  } = usePurchases(userId);
  // Narratore gioca?
  const [narratorPlays, setNarratorPlays] = useState(() => !!initialSetup?.narratorName);
  const [publicVote, setPublicVote] = useState(() => initialSetup?.publicVote ?? false); // voto diurno palese (default: segreto)
  const [voteInfoOpen, setVoteInfoOpen] = useState(false);
  const [narratorName, setNarratorName] = useState(() => initialSetup?.narratorName || '');

  const validPlayers = players.filter(n => n.trim().length > 0);
  const narratorActive = narratorPlays && narratorName.trim().length > 0;
  const rolesNeeded = validPlayers.length + (narratorActive ? 1 : 0);
  const canStep1 = rolesNeeded >= 4;
  const spotsLeft = rolesNeeded - wolfCount - roles.length;
  const spotsFull = spotsLeft <= 0;
  const rolesOk = wolfCount >= 1 && spotsLeft === 0;

  // Hint "fai tap" — appare entrando in step 3, scompare dopo 2.5s
  useEffect(() => {
    if (step === 3) {
      setShowHint(true);
      const hintTimer = setTimeout(() => setShowHint(false), 2500);
      return () => clearTimeout(hintTimer);
    }
  }, [step]);

  const roleCount = useMemo(() => {
    const c = {};
    roles.forEach(r => c[r] = (c[r] || 0) + 1);
    return c;
  }, [roles]);

  const setPlayerName = (i, v) => { const p = [...players]; p[i] = v; setPlayers(p); };
  const addPlayer = () => {
    const n = inputName.trim();
    if (!n) return;
    setPlayers(p => [...p, n]);
    setInputName('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };
  const removePlayer = i => setPlayers(p => p.filter((_, j) => j !== i));

  const addRole = rid => { if (!spotsFull) setRoles(r => [...r, rid]); };
  const removeLastRole = rid => setRoles(r => {
    const idx = r.lastIndexOf(rid);
    if (idx === -1) return r;
    return r.filter((_, j) => j !== idx);
  });

  const isUnlocked = rid => { const r = ROLES[rid]; return !r?.pack || purchasedPacks.includes(r.pack); };
  const handlePurchase = async (packId) => {
    if (packId === '_open_combo') { setPaywallPack('combo'); return; }
    const result = await purchasePackage(packId);
    if (result?.success) setPaywallPack(null); // chiudi modal dopo acquisto ok
  };

  const handleBack = () => { if (step === 1) onBack(); else setStep(s => s - 1); };

  // Consigli bilanciamento.
  // Contano tutte le forze del male, non solo i lupi: l'Indemoniato non uccide e nel
  // calcolo vittoria vale come villico (quindi i lupi devono comunque uccidere lo stesso
  // numero di persone), ma toglie al villaggio un alleato vero e passa informazioni al
  // branco. A parità di numeri il villaggio è più debole, e il consiglio deve dirlo.
  const traitorCount = roles.filter(rid => ROLES[rid]?.winsWith === 'lupi').length;
  const evilTotal = wolfCount + traitorCount;
  const recommended = rolesNeeded <= 5 ? 1 : rolesNeeded <= 8 ? 2 : rolesNeeded <= 11 ? 3 : 4;
  const wolfDiff = evilTotal - recommended;
  // Il Mitomane può copiare un lupo e diventarlo davvero: da quel momento conta
  // fra i lupi anche per la parità. Se i lupi sono già al massimo consigliato,
  // la trasformazione può chiudere la partita alla prima alba — va detto prima.
  // Se i Mitomani copiano tutti un lupo: lupi = W+M, villaggio = N-W-M. All'alba muore
  // un villico, quindi i lupi vincono subito quando W+M >= N-W-M-1, cioè 2(W+M)+1 >= N.
  const mitomaneCount = roles.filter(rid => rid === 'mitomane').length;
  const mitomaneRisk = mitomaneCount > 0 &&
    (2 * (wolfCount + mitomaneCount) + 1) >= rolesNeeded;
  const wolfAdvice = wolfDiff === 0
    ? { text: t('createGame.recommendedPerfect', {n: rolesNeeded}), color: '#4ade80' }
    : wolfDiff === 1 ? { text: t('createGame.recommendedHarder'), color: '#fbbf24' }
    : wolfDiff > 1  ? { text: t('createGame.recommendedTooStrong'), color: '#f87171' }
    : wolfDiff === -1 ? { text: t('createGame.recommendedEasier'), color: '#fbbf24' }
    : { text: t('createGame.recommendedTooWeak'), color: '#f87171' };

  const stepTitles = t('createGame.stepTitles');

  return (
    <div className="min-h-screen screen-safe layer pb-28">

      {/* Header con progress bar */}
      <div className="sticky top-0 z-10 px-4 pt-5 pb-3"
           style={{background:'rgba(13,17,23,0.97)', backdropFilter:'blur(12px)'}}>
        <div className="flex items-center gap-3 mb-3">
          <button onClick={handleBack} className="text-gray-500 hover:text-white text-2xl transition-colors leading-none">←</button>
          <div className="flex-1">
            <h2 className="font-cinzel text-lg font-bold text-moon leading-none">{stepTitles[step - 1]}</h2>
            <p className="text-gray-600 text-xs mt-0.5">{t('createGame.stepOf', {step})}</p>
          </div>
          <span className="font-cinzel text-xs text-gray-600">{step}/3</span>
        </div>
        <div className="h-0.5 rounded-full w-full" style={{background:'rgba(255,255,255,0.07)'}}>
          <div className="h-full rounded-full transition-all duration-500"
               style={{width: step === 1 ? '33%' : step === 2 ? '66%' : '100%',
                       background:'linear-gradient(90deg,#7a5c0e,#e2c97e)'}} />
        </div>
      </div>

      <div className="px-4 pt-4">

        {/* ── STEP 1: Giocatori ── */}
        {step === 1 && (
          <div className="anim-fade-up pb-32">

            {/* Toggle: narratore gioca — SEMPRE IN CIMA */}
            <div className="rounded-2xl px-4 py-4 mb-5"
                 style={{background:'rgba(226,201,126,0.05)', border:`1px solid ${narratorPlays ? 'rgba(226,201,126,0.3)' : 'rgba(255,255,255,0.07)'}`}}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎭</span>
                  <div>
                    <p className="text-white text-sm font-semibold">{t('createGame.imPlayingToo')}</p>
                    <p className="text-gray-600 text-xs">{t('createGame.narratorPlaysSubtitle')}</p>
                  </div>
                </div>
                <button onClick={() => setNarratorPlays(v => !v)}
                  className="relative w-12 h-6 rounded-full transition-all flex-shrink-0"
                  style={{background: narratorPlays ? 'rgba(226,201,126,0.5)' : 'rgba(255,255,255,0.1)',
                          border: `1px solid ${narratorPlays ? 'rgba(226,201,126,0.6)' : 'rgba(255,255,255,0.15)'}`}}>
                  <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                       style={{left: narratorPlays ? 'calc(100% - 22px)' : '2px',
                               boxShadow:'0 1px 4px rgba(0,0,0,0.4)'}} />
                </button>
              </div>
              {narratorPlays && (
                <div className="mt-3">
                  <input type="text" value={narratorName}
                    onChange={e => setNarratorName(e.target.value)}
                    placeholder={t('createGame.yourNamePlaceholder')}
                    className="w-full input-dark rounded-xl px-4 py-3 text-sm"/>
                </div>
              )}
            </div>

            {/* Toggle: voto palese o segreto */}
            <div className="rounded-2xl px-4 py-4 mb-5"
                 style={{background:'rgba(226,201,126,0.05)', border:`1px solid ${publicVote ? 'rgba(226,201,126,0.3)' : 'rgba(255,255,255,0.07)'}`}}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🗳️</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-white text-sm font-semibold">{t('createGame.publicVote')}</p>
                      <button onClick={() => setVoteInfoOpen(v => !v)}
                              className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold leading-none transition-all active:scale-90"
                              style={{background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.25)', color:'rgba(255,255,255,0.7)'}}>
                        i
                      </button>
                    </div>
                    <p className="text-gray-600 text-xs">
                      {publicVote ? t('createGame.publicVoteOn') : t('createGame.publicVoteOff')}
                    </p>
                  </div>
                </div>
                <button onClick={() => setPublicVote(v => !v)}
                  className="relative w-12 h-6 rounded-full transition-all flex-shrink-0"
                  style={{background: publicVote ? 'rgba(226,201,126,0.5)' : 'rgba(255,255,255,0.1)',
                          border: `1px solid ${publicVote ? 'rgba(226,201,126,0.6)' : 'rgba(255,255,255,0.15)'}`}}>
                  <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                       style={{left: publicVote ? 'calc(100% - 22px)' : '2px',
                               boxShadow:'0 1px 4px rgba(0,0,0,0.4)'}} />
                </button>
              </div>
              {voteInfoOpen && (
                <div className="mt-3 pt-3 text-xs leading-relaxed anim-fade-in"
                     style={{borderTop:'1px solid rgba(255,255,255,0.08)'}}>
                  <p className="text-gray-400 mb-2">
                    <span className="text-white font-semibold">{t('createGame.voteInfoSecretTitle')}</span> — {t('createGame.voteInfoSecretBody')}
                  </p>
                  <p className="text-gray-400">
                    <span className="text-white font-semibold">{t('createGame.voteInfoPublicTitle')}</span> — {t('createGame.voteInfoPublicBody')}
                  </p>
                </div>
              )}
            </div>

            {/* Counter — include il narratore se attivo */}
            <div className="text-center mb-6">
              <div className="inline-flex items-baseline gap-1">
                <span className="font-cinzel text-6xl font-bold moon-glow">{rolesNeeded}</span>
                <span className="font-cinzel text-2xl text-gray-600">/{Math.max(rolesNeeded, 4)}</span>
              </div>
              <p className="text-gray-600 text-xs mt-1 tracking-wider uppercase">
                {rolesNeeded < 4 ? t('createGame.addAtLeast4') : t('createGame.readyToStart')}
              </p>
            </div>

            {/* Lista giocatori */}
            <div className="flex flex-col gap-2 mb-4">
              {/* Riga narratore (se gioca) — fissa in cima alla lista */}
              {narratorActive && (
                <div className="flex items-center gap-3 rounded-2xl px-3 py-3"
                     style={{background:'rgba(226,201,126,0.07)', border:'1px solid rgba(226,201,126,0.25)'}}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-cinzel font-bold text-sm"
                       style={{background:'rgba(226,201,126,0.15)', border:'1px solid rgba(226,201,126,0.4)', color:'#e2c97e'}}>
                    🎭
                  </div>
                  <span className="flex-1 text-white text-sm font-semibold">{narratorName}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{background:'rgba(226,201,126,0.1)', border:'1px solid rgba(226,201,126,0.3)', color:'#e2c97e'}}>
                    {t('createGame.narratorBadge')}
                  </span>
                </div>
              )}
              {players.map((name, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl px-3 py-3"
                     style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)'}}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-cinzel font-bold text-sm"
                       style={{background:`hsl(${i*47+200},40%,22%)`, border:`1px solid hsl(${i*47+200},50%,35%)`, color:`hsl(${i*47+200},70%,70%)`}}>
                    {i + 1}
                  </div>
                  <input type="text" value={name}
                    onChange={e => setPlayerName(i, e.target.value)}
                    placeholder={t('createGame.playerPlaceholder', {n: i + 1})}
                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-600 font-semibold"/>
                  <button onClick={() => removePlayer(i)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all text-sm">✕</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mb-3">
              <input ref={inputRef} type="text" value={inputName}
                onChange={e => setInputName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPlayer()}
                placeholder={t('createGame.newPlayerPlaceholder')}
                className="flex-1 input-dark rounded-2xl px-4 py-3.5 text-sm"/>
              <button onClick={addPlayer}
                className="btn-gold w-12 rounded-2xl text-xl font-bold flex items-center justify-center">+</button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Lupi ── */}
        {step === 2 && (
          <div className="anim-fade-up flex flex-col items-center pt-6 px-2">
            {/* Icona grande */}
            <div className="text-7xl mb-5 leading-none"
                 style={{filter:'drop-shadow(0 0 28px rgba(192,57,43,0.65))'}}>🐺</div>

            {/* Stepper grande */}
            <div className="flex items-center gap-8 mb-6">
              <button
                onClick={() => setWolfCount(w => Math.max(1, w - 1))}
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold transition-all active:scale-90"
                style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.18)', color:'#fff'}}>
                −
              </button>
              <span className="font-cinzel font-bold text-white leading-none"
                    style={{fontSize: 72, minWidth: 64, textAlign:'center',
                            textShadow:'0 0 24px rgba(226,201,126,0.45)'}}>
                {wolfCount}
              </span>
              <button
                onClick={() => setWolfCount(w => Math.min(Math.floor(rolesNeeded / 2), w + 1))}
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold transition-all active:scale-90"
                style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.18)', color:'#fff'}}>
                +
              </button>
            </div>

            {/* Consiglio dinamico */}
            <p className="text-sm font-bold mb-1 text-center" style={{color: wolfAdvice.color}}>
              {wolfAdvice.text}
            </p>
            <p className="text-gray-600 text-xs text-center mb-8">
              {t('createGame.recommendedFor')} <span className="text-gray-400 font-semibold">
                {recommended} {recommended === 1 ? t('createGame.wolfSingular') : t('createGame.wolfPlural')}
              </span> {t('createGame.recommendedForSuffix', {n: rolesNeeded})}
            </p>

            <div className="w-full h-px mb-6" style={{background:'rgba(255,255,255,0.06)'}} />

            {/* Spiegazioni contestuali */}
            <div className="w-full space-y-3 text-sm text-gray-500">
              <p>{t('createGame.explainWolves')}</p>
              <p>{t('createGame.explainBalance')}</p>
              <p>{t('createGame.explainSpotsPrefix', {n: rolesNeeded})} <span className="text-white font-semibold">{rolesNeeded - wolfCount}</span> {t('createGame.explainSpotsSuffix')}</p>
            </div>
          </div>
        )}

        {/* ── STEP 3: Ruoli ── */}
        {step === 3 && (
          <div className="anim-fade-up pb-60">

            {/* Hint "fai tap" — scompare dopo 2.5s */}
            <div className="text-center mb-4 transition-opacity duration-700"
                 style={{opacity: showHint ? 1 : 0, pointerEvents:'none'}}>
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
                    style={{background:'rgba(226,201,126,0.08)', border:'1px solid rgba(226,201,126,0.22)', color:'#e2c97e'}}>
                {t('createGame.tapHint')}
              </span>
            </div>

            {/* Counter posti */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-500 text-xs">
                {t('createGame.wolvesAndSpots', {wolves: `🐺 ${wolfCount} ${wolfCount === 1 ? t('createGame.wolfSingular') : t('createGame.wolfPlural')}`, spots: rolesNeeded - wolfCount})}
              </p>
              <span className={`text-xs font-bold ${spotsLeft === 0 ? 'text-green-400' : 'text-gray-600'}`}>
                {spotsLeft === 0 ? t('createGame.complete') : t('createGame.spotsFreeCount', {n: spotsLeft})}
              </span>
            </div>

            {/* ── Ruoli base (villico + veggente + guardia) ── */}
            <p className="text-gray-500 text-sm uppercase tracking-wider mb-2 font-semibold">{t('createGame.baseRoles')}</p>
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              {Object.values(ROLES)
                .filter(r => !r.pack && r.id !== 'lupo')
                .map(r => (
                  <RoleCardC key={r.id} r={r}
                    count={roleCount[r.id] || 0}
                    onAdd={() => addRole(r.id)}
                    onInfo={() => setPreviewRole(r.id)}
                    unlocked={true}
                    disabled={spotsFull} />
                ))}
            </div>

            {/* ── Pack ruoli (collassabili) ── */}
            {['ombre', 'villaggio'].map(packId => {
              const pack = PACKS[packId];
              if (!pack || pack.roles.length === 0) return null;
              const unlocked = purchasedPacks.includes(pack.id);
              const expanded = !!expandedPacks[packId];
              return (
                <div key={packId} className="rounded-2xl overflow-hidden mb-3"
                     style={{border:`1px solid ${pack.color}${unlocked ? '44' : '22'}`,
                             background: unlocked ? `${pack.color}07` : 'rgba(255,255,255,0.02)'}}>
                  <div
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all active:opacity-75 cursor-pointer"
                    style={{background:`${pack.color}${unlocked ? '14' : '09'}`}}
                    onClick={() => setExpandedPacks(p => ({...p, [packId]: !p[packId]}))}>
                    <span className="text-2xl leading-none shrink-0">{pack.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-base leading-tight">{pack.name}</p>
                      <p className="text-xs text-gray-400 leading-tight mt-0.5">{pack.description}</p>
                    </div>
                    {unlocked ? (
                      <span className="text-xs text-green-400 font-bold shrink-0 px-3 py-1.5 rounded-full"
                            style={{background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.25)'}}>✓</span>
                    ) : (
                      <button
                        onClick={e => { e.stopPropagation(); setPaywallPack(packId); }}
                        className="text-xs font-bold shrink-0 px-3 py-1.5 rounded-full transition-all active:scale-95"
                        style={{background:`${pack.color}25`, border:`1px solid ${pack.color}55`, color:pack.color}}>
                        🔒 {pack.price}
                      </button>
                    )}
                    <span className="text-gray-500 text-base ml-1 shrink-0">{expanded ? '↑' : '↓'}</span>
                  </div>
                  {expanded && (
                    <div className="grid grid-cols-3 gap-2.5 p-3">
                      {pack.roles.map(rid => {
                        const r = ROLES[rid]; if (!r) return null;
                        return (
                          <RoleCardC key={rid} r={r}
                            count={roleCount[rid] || 0}
                            onAdd={() => unlocked ? addRole(rid) : setPaywallPack(packId)}
                            onInfo={() => setPreviewRole(rid)}
                            unlocked={unlocked}
                            disabled={unlocked ? spotsFull : false} />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* ── Pack Narratore ── */}
            {!purchasedPacks.includes('narratore') && (
              <div
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-3 text-left transition-all active:opacity-75 cursor-pointer"
                style={{background:'rgba(226,201,126,0.04)', border:'1px solid rgba(226,201,126,0.15)'}}
                onClick={() => setPaywallPack('narratore')}>
                <span className="text-2xl leading-none shrink-0">🎙️</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-base leading-tight">{t('createGame.aiNarratorVoice')}</p>
                  <p className="text-xs text-gray-400 leading-tight mt-0.5">{t('createGame.aiNarratorHint')}</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setPaywallPack('narratore'); }}
                  className="text-xs font-bold shrink-0 px-3 py-1.5 rounded-full transition-all active:scale-95"
                  style={{background:'rgba(226,201,126,0.15)', border:'1px solid rgba(226,201,126,0.35)', color:'#e2c97e'}}>
                  🔒 {PACKS.narratore.price}
                </button>
              </div>
            )}

            {/* ── Combo ── */}
            {!PACKS.combo.includes.every(id => purchasedPacks.includes(id)) && (
              <div
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-3 text-left transition-all active:opacity-75 cursor-pointer"
                style={{background:'rgba(226,201,126,0.03)', border:'1px solid rgba(226,201,126,0.12)'}}
                onClick={() => setPaywallPack('combo')}>
                <span className="text-2xl leading-none shrink-0">⚡</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-base leading-tight">{PACKS.combo.name}</p>
                  <p className="text-xs text-gray-400 leading-tight mt-0.5">{PACKS.combo.description}</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setPaywallPack('combo'); }}
                  className="text-xs font-bold shrink-0 px-3 py-1.5 rounded-full transition-all active:scale-95"
                  style={{background:'rgba(226,201,126,0.15)', border:'1px solid rgba(226,201,126,0.35)', color:'#e2c97e'}}>
                  {PACKS.combo.price}
                </button>
              </div>
            )}

            {/* ── Ripristina acquisti ── */}
            <button
              onClick={restorePurchases}
              disabled={isPurchasing}
              className="w-full py-2 mb-3 rounded-xl text-xs text-gray-600 hover:text-gray-400 transition-colors text-center">
              {isPurchasing ? t('createGame.restoringPurchases') : t('createGame.restorePurchases')}
            </button>

            {/* ── Ruoli attuali — griglia 3 per riga (lupi inclusi) ── */}
            {(wolfCount > 0 || roles.length > 0) && (
              <div className="mt-5">
                <p className="text-gray-600 text-xs uppercase tracking-wider mb-2">{t('createGame.currentRoles')}</p>
                <div className="grid grid-cols-3 gap-2">

                  {/* Card Lupi — sempre presente */}
                  <div className="rounded-2xl flex flex-col items-center py-2.5 px-1 gap-1"
                       style={{background:'rgba(192,57,43,0.22)', border:'1px solid rgba(192,57,43,0.55)'}}>
                    <span className="text-xl leading-none">🐺</span>
                    <span className="text-[10px] font-bold text-white text-center leading-tight">{ROLES.lupo.name}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <button
                        onClick={() => setWolfCount(w => Math.max(1, w - 1))}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-all active:scale-90"
                        style={{background:'rgba(255,255,255,0.1)', color:'#fff'}}>
                        −
                      </button>
                      <span className="text-white text-xs font-bold w-4 text-center">{wolfCount}</span>
                      <button
                        onClick={() => setWolfCount(w => Math.min(Math.floor(rolesNeeded / 2), w + 1))}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-all active:scale-90"
                        style={{background:'rgba(255,255,255,0.1)', color:'#fff'}}>
                        +
                      </button>
                    </div>
                  </div>

                  {/* Card altri ruoli */}
                  {Object.entries(roleCount).map(([rid, cnt]) => {
                    const r = ROLES[rid]; if (!r) return null;
                    return (
                      <div key={rid} className="rounded-2xl flex flex-col items-center py-2.5 px-1 gap-1"
                           style={{background:`${r.color}28`, border:`1px solid ${r.color}66`}}>
                        <span className="text-xl leading-none">{r.icon}</span>
                        <span className="text-[10px] font-bold text-white text-center leading-tight w-full px-0.5"
                              style={{wordBreak:'break-word'}}>{r.name}</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <button
                            onClick={() => removeLastRole(rid)}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-all active:scale-90"
                            style={{background:'rgba(255,255,255,0.1)', color:'#fff'}}>
                            −
                          </button>
                          <span className="text-white text-xs font-bold w-4 text-center">{cnt}</span>
                          <button
                            onClick={() => addRole(rid)}
                            disabled={spotsFull}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-all active:scale-90"
                            style={{background: spotsFull ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.1)',
                                    color: spotsFull ? '#444' : '#fff'}}>
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Modal info ruolo */}
            {previewRole && (() => {
              const r = ROLES[previewRole];
              const vis = ROLE_VISUALS[previewRole];
              if (!r) return null;
              return (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                     style={{background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)'}}
                     onClick={() => setPreviewRole(null)}>
                  <div className="w-full max-w-sm rounded-2xl p-5 anim-fade-up"
                       style={{background: vis ? vis.gradient : '#0d1117', border:`1px solid ${r.color}44`}}
                       onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl" style={{filter: vis ? `drop-shadow(0 0 12px ${vis.glow})` : 'none'}}>{r.icon}</span>
                        <div>
                          <p className="font-cinzel text-white font-bold text-lg leading-tight">{r.name}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full"
                                style={{background:r.color+'33', border:`1px solid ${r.color}55`, color:r.color}}>
                            {r.team === 'lupi' ? t('teamBadge.lupi') : t('teamBadge.villaggio')}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => setPreviewRole(null)}
                              className="text-gray-500 hover:text-white text-xl leading-none px-1">✕</button>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed mb-3">{r.description}</p>
                    {r.tip && (
                      <div className="p-3 rounded-xl text-xs text-white/50 italic mb-4"
                           style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)'}}>
                        💡 {r.tip}
                      </div>
                    )}
                    {isUnlocked(r.id) ? (
                      <button
                        onClick={() => { if (!spotsFull) { addRole(r.id); setPreviewRole(null); } }}
                        disabled={spotsFull}
                        className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                        style={{
                          background: spotsFull ? 'rgba(255,255,255,0.05)' : r.color+'33',
                          border:`1px solid ${spotsFull ? 'rgba(255,255,255,0.1)' : r.color+'66'}`,
                          color: spotsFull ? '#555' : 'white'
                        }}>
                        {spotsFull ? t('createGame.noSpotsLeft') : t('createGame.addRole', {name: r.name})}
                      </button>
                    ) : (
                      <button
                        onClick={() => { setPreviewRole(null); setPaywallPack(r.pack); }}
                        className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                        style={{background:'rgba(226,201,126,0.12)', border:'1px solid rgba(226,201,126,0.3)', color:'#e2c97e'}}>
                        {t('createGame.unlockPack', {pack: PACKS[r.pack]?.name})}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* ── Fixed bottom: Step 1 ── */}
      {step === 1 && (
        <div className="fixed bottom-0 left-0 right-0 p-4"
             style={{background:'linear-gradient(to top, rgba(13,17,23,1) 65%, transparent)'}}>
          <button
            onClick={() => { if (canStep1) setStep(2); }}
            disabled={!canStep1}
            className="btn-gold w-full py-4 rounded-2xl text-base">
            {t('createGame.continue')}
          </button>
        </div>
      )}

      {/* ── Fixed bottom: Step 2 ── */}
      {step === 2 && (
        <div className="fixed bottom-0 left-0 right-0 p-4"
             style={{background:'linear-gradient(to top, rgba(13,17,23,1) 65%, transparent)'}}>
          <button
            onClick={() => setStep(3)}
            className="btn-gold w-full py-4 rounded-2xl text-base">
            {t('createGame.chooseRoles')}
          </button>
        </div>
      )}

      {/* ── Fixed bottom: Step 3 — counter + CTA ── */}
      {step === 3 && (
        <div className="fixed bottom-0 left-0 right-0 px-4 pt-3 pb-6"
             style={{background:'linear-gradient(to top, rgba(13,17,23,1) 75%, transparent)'}}>
          {/* Composizione delle forze del male — appare solo se ci sono traditori in gioco */}
          {traitorCount > 0 && (
            <p className="text-[11px] text-center mb-2 px-1 leading-snug"
               style={{color: evilTotal > recommended ? '#f87171' : '#9ca3af'}}>
              🐺 {wolfCount} + 😈 {traitorCount} = <strong>{evilTotal}</strong> {t('createGame.evilForces')}
              {evilTotal > recommended && ` · ${t('createGame.evilTooMany', {n: recommended})}`}
            </p>
          )}
          {/* Il Mitomane può trasformarsi in lupo e far saltare la parità */}
          {mitomaneRisk && (
            <p className="text-[11px] text-center mb-2 px-1 leading-snug" style={{color:'#fbbf24'}}>
              🎭 {t('createGame.mitomaneRisk', {n: wolfCount + mitomaneCount})}
            </p>
          )}
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-gray-600 text-xs">🐺 ×{wolfCount} · {wolfCount + roles.length}/{rolesNeeded}</span>
            <span className={`text-xs font-bold ${spotsLeft === 0 ? 'text-green-400' : 'text-gray-500'}`}>
              {spotsLeft === 0 ? t('createGame.allAssigned') : t('createGame.spotsFreeLong', {n: spotsLeft})}
            </span>
          </div>
          <button
            onClick={() => {
              if (!rolesOk) return;
              const finalRoles = [...Array(wolfCount).fill('lupo'), ...roles];
              // Costruisci lista giocatori: prima i giocatori normali, poi il narratore (se gioca)
              const allNames = [...validPlayers];
              if (narratorActive) allNames.push(narratorName.trim());
              const vp = allNames.map((n, idx) => ({
                id: uid(6), name: n,
                ...(narratorActive && idx === allNames.length - 1 ? {isNarrator: true} : {})
              }));
              const shuffledRoles = shuffleArray(finalRoles);
              const withRoles = vp.map((p, i) => ({...p, role: shuffledRoles[i], alive: true, ready: false}));
              onStart(withRoles, uid(6), narratorActive ? narratorName.trim() : null, publicVote);
            }}
            disabled={!rolesOk}
            className="btn-gold w-full py-4 rounded-2xl text-base">
            {t('createGame.startGame')}
          </button>
        </div>
      )}

      {/* Paywall Modal */}
      <PaywallModal
        packId={paywallPack}
        onClose={() => !isPurchasing && setPaywallPack(null)}
        onPurchase={handlePurchase}
        isPurchasing={isPurchasing}
      />
    </div>
  );
}

/* ================================================================
   GAME MASTER SCREEN
   ================================================================ */
function GameMasterScreen({gameId, players, onEndGame, onBack, onBackToCreate, userId}) {
  const [phase, setPhase] = useState('waiting');
  const [nightStep, setNightStep] = useState(0);
  const [dayNum, setDayNum] = useState(1);
  const [activeQrIndex, setActiveQrIndex] = useState(0);
  const [pStates, setPStates] = useState(() =>
    players.reduce((acc,p)=>({...acc,[p.id]:{...p,alive:true,ready:false}}),{})
  );
  const [timer, setTimer] = useState(300);
  const [timerTotal, setTimerTotal] = useState(300);
  const [timerOn, setTimerOn] = useState(false);
  const [showVotesPanel, setShowVotesPanel] = useState(false);
  const [narration, setNarration] = useState('');
  const [showNarrationLog, setShowNarrationLog] = useState(false);
  const [showChronicle, setShowChronicle] = useState(false); // cronaca notti per il narratore
  const [chronicleVersion, setChronicleVersion] = useState(0); // forza il ridisegno quando arriva un evento
  const [narrationLog, setNarrationLog] = useState([]);
  const [readyCount, setReadyCount] = useState(0);
  const [winner, setWinner] = useState(null);
  const [showEliminate, setShowEliminate] = useState(false);
  const [showCupidoModal, setShowCupidoModal] = useState(null); // id del primo innamorato
  const [showHunterModal, setShowHunterModal] = useState(false); // cacciatore morente
  const [showTimerEdit, setShowTimerEdit] = useState(false);
  const [timerInput, setTimerInput] = useState('');
  const [showRoleInfo, setShowRoleInfo] = useState(null);
  const [showRolesPanel, setShowRolesPanel] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [elKey, setElKey] = useState(() => localStorage.getItem('lif_el_key') || '');
  const [elVoice, setElVoice] = useState(() => localStorage.getItem('lif_el_voice') || '');
  const [elCustomVoice, setElCustomVoice] = useState(() => localStorage.getItem('lif_el_custom_voice') || '');
  const [elTestStatus, setElTestStatus] = useState('');
  const [elVoiceList, setElVoiceList] = useState([]);
  const [elVoicesLoading, setElVoicesLoading] = useState(false);
  const [ttsMode, setTtsMode] = useState(() => localStorage.getItem('lif_tts_mode') || 'script');
  const [dayTimerMins, setDayTimerMins] = useState(() => parseInt(localStorage.getItem('lif_day_timer') || '5'));
  const [votePrompt, setVotePrompt] = useState(false); // sollecito votazione
  const [showMyCard, setShowMyCard] = useState(false); // narratore vede la sua scheda personaggio
  const [narratorLocalVote, setNarratorLocalVote] = useState(null); // voto locale del narratore-giocatore
  const eventLogRef = useRef([]); // log eventi per il recap finale (ref = no stale closure)
  const [frozenNightSteps, setFrozenNightSteps] = useState(null); // sequenza notte congelata (vedi buildNightSteps)
  // pStates aggiornato leggibile dentro i setTimeout, dove la closure catturerebbe un valore stantio
  const pStatesRef = useRef(pStates);
  useEffect(() => { pStatesRef.current = pStates; }, [pStates]);
  // Guardia di rientranza di processNightStep, liberata a ogni transizione di stato:
  // così non serve ricordarsi di azzerarla su ognuna delle uscite della funzione.
  const stepBusy = useRef(false);
  useEffect(() => { stepBusy.current = false; }, [phase, nightStep]);
  // Morti per amore accumulate nel tick corrente, da annunciare e mettere in cronaca
  const loveVictimsRef = useRef([]);
  // Timer delle fasi transitorie (alba 12s, verdetto 10s). Vanno cancellati quando la
  // partita finisce o il narratore esce: altrimenti scattano comunque e riscrivono
  // `phase` su Firebase sopra una partita già chiusa.
  const phaseTimer = useRef(null);
  useEffect(() => () => clearTimeout(phaseTimer.current), []);
  useEffect(() => { if (winner) clearTimeout(phaseTimer.current); }, [winner]);

  const { purchasedPacks, purchasePackage, isLoading: isPurchasing } = usePurchases(userId);
  const [paywallPack, setPaywallPack] = useState(null);

  // Se ttsMode='voice' è rimasto in localStorage senza acquisto, lo resettiamo
  useEffect(() => {
    if (ttsMode === 'voice' && !purchasedPacks.includes('narratore')) {
      setTtsMode('script');
      localStorage.setItem('lif_tts_mode', 'script');
    }
  }, [purchasedPacks, ttsMode]);

  const toggleTtsMode = () => {
    const next = ttsMode === 'voice' ? 'script' : 'voice';
    setTtsMode(next);
    localStorage.setItem('lif_tts_mode', next);
  };

  const loadELVoices = () => {
    if (elVoiceList.length > 0) return; // già caricate
    setElVoicesLoading(true);
    const apiBaseVoices = window.IS_NATIVE_APP ? 'https://lupus-in-fabula-eight.vercel.app' : window.location.origin;
    fetch(`${apiBaseVoices}/api/voices`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(list => {
        const withCustom = [...list, { id: 'custom', name: 'Voice ID personalizzato…' }];
        setElVoiceList(withCustom);
        // Se non c'è ancora una voce salvata, imposta la prima della lista
        if (!localStorage.getItem('lif_el_voice') && list.length > 0) {
          setElVoice(list[0].id);
        }
      })
      .catch(() => {
        // Fallback alla lista statica se il proxy non è disponibile (sviluppo locale)
        setElVoiceList(window.EL_VOICES);
      })
      .finally(() => setElVoicesLoading(false));
  };

  const saveELConfig = () => {
    localStorage.setItem('lif_el_key', elKey);
    localStorage.setItem('lif_el_voice', elVoice);
    localStorage.setItem('lif_el_custom_voice', elCustomVoice);
    setElTestStatus(t('gameMaster.saved'));
    setTimeout(() => setElTestStatus(''), 2000);
  };
  const testELVoice = () => {
    localStorage.setItem('lif_el_key', elKey);
    localStorage.setItem('lif_el_voice', elVoice);
    localStorage.setItem('lif_el_custom_voice', elCustomVoice);
    setElTestStatus(t('gameMaster.testInProgress'));
    window.afterSpeech(() => setElTestStatus(t('gameMaster.testComplete')), 10000);
    window.speakNarration(t('narration.testVoice'), 'test_voice');
  };
  // Ref per dayTimerMins — evita stale closure nei setTimeout del night engine
  const dayTimerMinsRef = useRef(dayTimerMins);
  useEffect(() => { dayTimerMinsRef.current = dayTimerMins; }, [dayTimerMins]);

  // Sollecito votazione quando il timer giorno arriva a zero
  useEffect(() => {
    if (phase === 'day' && timer === 0 && !timerOn) {
      setVotePrompt(true);
    }
    if (phase !== 'day') {
      setVotePrompt(false);
    }
  }, [phase, timer, timerOn]);

  // Reset voto locale del narratore-giocatore a ogni cambio fase o turno notturno
  useEffect(() => { setNarratorLocalVote(null); }, [phase, nightStep]);

  const [alfaMark, setAlfaMark] = useState(null);        // id del giocatore marcato dal Lupo Alfa
  const [mitomaneTarget, setMitomaneTarget] = useState(null); // legacy: primo Mitomane (partite vecchie)
  const [mitomaneTargets, setMitomaneTargets] = useState({}); // { mitomaneId: imitatoId } — supporta più Mitomani
  const [lastGuardedId, setLastGuardedId] = useState(null); // id protetto dalla Guardia la notte precedente
  const [mitomaneFallito, setMitomaneFallito] = useState(null); // Mitomani che hanno imitato un Mitomane
  // Poteri già consumati, per giocatore. Sono ref e non stato perché vanno letti
  // dentro proceedToDawn, dove una closure vecchia leggerebbe valori superati.
  const pozioniUsateRef   = useRef({}); // { playerId: {heal, poison} }
  const sciamanoUsatoRef  = useRef({}); // { playerId: true }
  const timerRef = useRef(null);
  let appUrl = window.location.href.split('?')[0];
  if (appUrl.includes('localhost') || appUrl.startsWith('capacitor://') || appUrl.startsWith('file://')) {
    appUrl = 'https://lupus-in-fabula-eight.vercel.app/';
  }

  // Timer tick
  useEffect(()=>{
    clearTimeout(timerRef.current);
    if(timerOn && timer>0) {
      timerRef.current = setTimeout(()=>setTimer(t=>t-1), 1000);
    } else if(timer===0) setTimerOn(false);
    return ()=>clearTimeout(timerRef.current);
  },[timerOn, timer]);

  const [nightVotes, setNightVotes] = useState({});
  const [dayVotes, setDayVotes] = useState({});
  const [nightDecisions, setNightDecisions] = useState({});
  // Cupido agisce ogni notte e i legami si sommano, quindi un giocatore può avere
  // più partner: { playerId: [partnerIds] }. Le partite salvate col vecchio formato
  // (un solo partner come stringa) restano leggibili grazie a loversOf().
  const [lovers, setLovers] = useState({});
  // Il legame di Cupido dura UNA SOLA notte: vale per le morti dell'alba e poi si
  // scioglie. Quindi c'è al massimo una coppia attiva alla volta, i legami non si
  // accumulano e non esiste propagazione a catena.
  const loversOf = useCallback((id) => {
    const v = lovers?.[id];
    if (!v) return [];
    return Array.isArray(v) ? v : [v]; // le partite vecchie salvavano una stringa
  }, [lovers]);
  // Sostituisce il legame precedente invece di aggiungersi
  const linkLovers = useCallback((a, b) => ({ [a]: [b], [b]: [a] }), []);
  const [dawnInfo, setDawnInfo] = useState(null); // info GM sull'alba: { victimId, poisonVictimId, stregaHealed, figlioTransformed, mediumResults, sciamanoResult }

  // Firebase listener for ready count and night votes
  useEffect(()=>{
    if(!db || !gameId) return;
    const ref = db.ref(`games/${gameId}`);
    ref.on('value', snap=>{
      const data = snap.val()||{};
      const playersData = data.players||{};
      setReadyCount(Object.values(playersData).filter(p=>p.ready).length);
      setPStates(prev => {
        let changed = false;
        const next = {...prev};
        for(let pid in playersData){
          if(next[pid] && next[pid].ready !== playersData[pid].ready){
            next[pid] = {...next[pid], ready: playersData[pid].ready};
            changed = true;
          }
        }
        return changed ? next : prev;
      });
      setNightVotes(data.nightVotes||{});
      setDayVotes(data.dayVotes||{});
      // Consumi per giocatore, tenuti allineati con Firebase: il motore li usa per
      // rifiutare un potere già speso. Prima erano controllati SOLO nella schermata
      // del giocatore, quindi il narratore che gioca aveva poteri illimitati.
      if (data.witchPotions) pozioniUsateRef.current  = { ...data.witchPotions };
      if (data.shamanUsedBy) sciamanoUsatoRef.current = { ...data.shamanUsedBy };
      if(data.lovers) setLovers(data.lovers);
    });
    return ()=>ref.off();
  },[gameId]);

  const fbUpdate = useCallback((data)=>{
    if(db && gameId) db.ref(`games/${gameId}`).update(data);
  },[gameId]);

  // Aggiunge un evento al log locale (usato per costruire il recap a fine partita)
  const pushEvent = useCallback((entry) => {
    const next = [...eventLogRef.current, entry];
    eventLogRef.current = next;
    // Il ref da solo non ridisegna: senza questo la cronaca del narratore resterebbe indietro
    setChronicleVersion(v => v + 1);
    // Persistita su Firebase: senza, basta che il telefono del narratore ricarichi la
    // pagina e il resoconto delle notti sparisce proprio quando deve raccontarlo.
    // ⚠️ Sta dentro games/<id> perché le regole del database consentono solo quel
    // percorso (un ramo separato dà PERMISSION_DENIED). Di conseguenza la cronaca
    // arriva anche nel payload dei giocatori: non è un peggioramento reale, perché
    // quel payload contiene già il ruolo di tutti — ma per chiuderla davvero servono
    // regole Firebase più strette, non solo spostare questo campo.
    if (db && gameId) db.ref(`games/${gameId}/narratorLog`).set(next);
  }, [gameId]);

  // ── REIDRATAZIONE NARRATORE ────────────────────────────────────────────────
  // Fase, giorno, passo notturno e decisioni vivono solo in memoria: dopo un
  // ricaricamento la partita sarebbe ingiocabile. Qui si rileggono da Firebase.
  // `rehydrated` fa anche da guardia allo specchio più sotto: non si scrive nulla
  // finché non si è letto, altrimenti i valori iniziali sovrascriverebbero quelli veri.
  const [rehydrated, setRehydrated] = useState(false);
  useEffect(() => {
    if (!db || !gameId || rehydrated) return;
    db.ref(`games/${gameId}`).once('value').then(snap => {
      const g = snap.val();
      if (!g) { setRehydrated(true); return; }
      if (g.players) {
        setPStates(prev => {
          const next = { ...prev };
          Object.entries(g.players).forEach(([id, p]) => {
            next[id] = { ...(next[id] || {}), ...p, id };
          });
          return next;
        });
      }
      if (typeof g.dayNum === 'number')   setDayNum(g.dayNum);
      if (typeof g.nightStep === 'number') setNightStep(g.nightStep);
      if (g.nightDecisions)  setNightDecisions(g.nightDecisions);
      if (g.lovers)          setLovers(g.lovers);
      if (g.mitomaneTarget)  setMitomaneTarget(g.mitomaneTarget);
      if (g.mitomaneTargets) setMitomaneTargets(g.mitomaneTargets);
      // Senza questi, dopo un rientro del narratore le pozioni e la resurrezione
      // tornerebbero disponibili: il controllo di consumo li legge da qui.
      if (g.witchPotions)  pozioniUsateRef.current  = { ...g.witchPotions };
      if (g.shamanUsedBy)  sciamanoUsatoRef.current = { ...g.shamanUsedBy };
      // Fasi transitorie: avanzano solo grazie a un setTimeout in memoria (12s l'alba,
      // 10s il verdetto) e non hanno né un ramo nel motore né un pulsante nella UI.
      // Ripristinarle così com'è lascerebbe il narratore su una schermata senza uscita:
      // si rientra quindi nella fase successiva, quella che il timer avrebbe raggiunto.
      const FASI_TRANSITORIE = { dawn_reveal: 'day', ended_voting: 'night' };
      const faseRipristinata = FASI_TRANSITORIE[g.phase] || g.phase;
      if (faseRipristinata === 'day' && g.phase === 'dawn_reveal') {
        const secs = (parseInt(localStorage.getItem('lif_day_timer') || '5', 10)) * 60;
        setTimer(secs); setTimerTotal(secs); setTimerOn(true);
      }
      if (faseRipristinata === 'night' && g.phase === 'ended_voting') {
        setNightStep(0); setNightDecisions({});
      }
      // La fase per ultima: fa ripartire il motore, e vuole il resto già a posto
      if (faseRipristinata && faseRipristinata !== 'waiting') setPhase(faseRipristinata);
      setRehydrated(true);
    }).catch(() => setRehydrated(true));
  }, [gameId, rehydrated]);

  // Specchia su Firebase ciò che prima viveva solo in locale
  useEffect(() => {
    if (!rehydrated || !db || !gameId) return;
    fbUpdate({ dayNum, nightStep, nightDecisions: nightDecisions || null });
  }, [rehydrated, dayNum, nightStep, nightDecisions, gameId, fbUpdate]);

  // Ripristina la cronaca se il narratore ricarica la pagina a partita in corso
  useEffect(() => {
    if (!db || !gameId) return;
    db.ref(`games/${gameId}/narratorLog`).once('value').then(snap => {
      const raw = snap.val();
      if (!raw) return;
      // Firebase restituisce un oggetto (non un array) se gli indici non sono contigui
      const restored = Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw);
      // Solo se il ripristino è più completo di quanto già in memoria: così non
      // sovrascrive eventi appena aggiunti in locale e non ancora scritti
      if (restored.length > eventLogRef.current.length) {
        eventLogRef.current = restored;
        setChronicleVersion(v => v + 1);
      }
    }).catch(() => {});
  }, [gameId]);

  // Pubblica il recap completo su Firebase quando la partita finisce
  const publishRecap = useCallback((winnerTeam, finalStates) => {
    if (!db || !gameId) return;
    // Snapshot dei giocatori con nome + ruolo + sopravvissuto
    const playersSnapshot = Object.fromEntries(
      Object.entries(finalStates).map(([id, p]) => [id, {
        name: p.name, role: p.role, alive: p.alive,
      }])
    );
    db.ref(`games/${gameId}/gameRecap`).set({
      winner: winnerTeam,
      players: playersSnapshot,
      eventLog: eventLogRef.current,
    });
  }, [gameId]);

  const setNarrationAndPhase = (p, narr, timerSecs=null, extraData={}, narrKey=null) => {
    setPhase(p);
    setNarration(narr);
    if(narr && narr.length > 0) {
      window.speakNarration(narr, narrKey);
      const ts = new Date().toLocaleTimeString(getLang()==='en' ? 'en-US' : 'it-IT', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
      setNarrationLog(prev => [...prev, { time: ts, text: narr }]);
    }
    if(timerSecs!==null){setTimer(timerSecs); setTimerTotal(timerSecs); setTimerOn(true);}
    fbUpdate({ phase:p, ...extraData });
  };

  const eliminate = (pid, silent=false) => {
    // Base = pStatesRef, non la closure pStates: all'alba possono cadere più giocatori
    // nello stesso tick (veleno della Strega + vittima dei lupi). Partendo dalla closure
    // ogni chiamata ripartirebbe dallo stato iniziale e l'ultima resusciterebbe le altre.
    const base = pStatesRef.current;
    let newStates = {...base, [pid]:{...base[pid], alive:false}};
    if(db && gameId) db.ref(`games/${gameId}/players/${pid}/alive`).set(false);
    if(!silent) window.playSfx('dead');

    // Cupido: muore anche il partner legato QUESTA notte. Una sola coppia alla volta,
    // quindi niente catene — e il legame viene sciolto all'alba, così il rogo diurno
    // non trascina più nessuno.
    for (const partnerId of loversOf(pid)) {
      if (newStates[partnerId]?.alive) {
        newStates = {...newStates, [partnerId]:{...newStates[partnerId], alive:false}};
        // Raccolto per essere annunciato: senza, questo morto comparirebbe solo come
        // 💀 sul telefono, senza che il narratore sappia di doverlo nominare
        loveVictimsRef.current = [...loveVictimsRef.current, partnerId];
        if(db && gameId) db.ref(`games/${gameId}/players/${partnerId}/alive`).set(false);
      }
    }

    pStatesRef.current = newStates; // subito, così la prossima eliminazione dello stesso tick la vede
    setPStates(newStates);
    const w = checkWin(newStates);
    if(w) {
      const endMsg = w==='lupi' ? t('narration.endLupiWin')
        : w==='amore' ? t('narration.endAmoreWin')
        : t('narration.endVillaggioWin');
      const endMsgKey = w==='lupi' ? 'end_lupi_win' : w==='amore' ? null : 'end_villaggio_win';
      setWinner(w);
      setNarrationAndPhase('ended', endMsg, null, {}, endMsgKey);
      fbUpdate({winner:w, phase:'ended'});
      publishRecap(w, newStates);
    }

    // Lupo Alfa: se eliminato, porta con sé il giocatore marcato
    if(pStates[pid]?.role === 'lupo_alfa' && alfaMark && newStates[alfaMark]?.alive) {
      newStates = {...newStates, [alfaMark]:{...newStates[alfaMark], alive:false}};
      if(db && gameId) db.ref(`games/${gameId}/players/${alfaMark}/alive`).set(false);
      setAlfaMark(null);
      const w2 = checkWin(newStates);
      if(w2 && !w) {
        setPStates(newStates);
        const endMsg2 = w2==='lupi' ? t('narration.endLupiWinShort') : w2==='amore' ? t('narration.endAmoreWinShort') : t('narration.endVillaggioWinShort');
        const endMsg2Key = w2==='lupi' ? 'end_lupi_win_short' : w2==='amore' ? null : 'end_villaggio_win_short';
        setWinner(w2); setNarrationAndPhase('ended', endMsg2, null, {}, endMsg2Key); fbUpdate({winner:w2, phase:'ended'});
        publishRecap(w2, newStates);
        return w2;
      }
    }

    // Cacciatore: se eliminato, può portare qualcuno con sé
    if(pStates[pid]?.role === 'cacciatore' && !w) {
      setShowHunterModal(true);
    }

    return w;
  };

  const startGame = ()=>{
    setNarrationAndPhase('role_reveal', t('narration.roleReveal'), null, {}, 'role_reveal');
  };

  const goFirstNight = ()=>{
    setNightStep(0);
    setFrozenNightSteps(buildNightSteps(pStates, 1));
    setNarrationAndPhase('night', NIGHT_NARRATION.open.open, null, { currentNightStep: null, nightVotes: null, dayVotes: null, nightDecisions: null }, 'night_open');
    setDayNum(1);
    window.playSfx('night');
  };

  const goNight = () => {
    setNightStep(0);
    setNightDecisions({});
    setFrozenNightSteps(buildNightSteps(pStatesRef.current, dayNum));
    setNarrationAndPhase('night', NIGHT_NARRATION.open.open, null, { currentNightStep: null, nightVotes: null, dayVotes: null }, 'night_open');
    window.playSfx('night');
  };

  const processNightStep = ()=>{
    if (phase !== 'night') return; // Blocca timer stantii che sparano dopo il cambio fase
    // Guardia di rientranza: all'ultimo passo il lavoro vero (proceedToDawn) è differito
    // da afterSpeech, e nel frattempo il pulsante resta premibile e la UI non cambia.
    // Due tap raddoppierebbero dayNum, l'evento in cronaca e il consumo delle pozioni.
    if (stepBusy.current) return;
    stepBusy.current = true;
    // Se il narratore avanza a mano mentre un timer è armato, quel timer scadrebbe
    // dopo il cambio di step e ne farebbe saltare uno: va disinnescato qui.
    clearTimeout(engineTimer.current);
    // La chiave NON va azzerata: va marcata come già consumata per QUESTO passo.
    // Azzerandola, un render intermedio (prima che setNightStep si applichi) rientra
    // nel motore, ripianifica l'avanzamento dello stesso passo, e quel timer scatta
    // quando siamo già su quello dopo — saltandolo. Succede in modo eclatante al passo
    // del Mitomane: appena cambia ruolo, aliveOfRole('mitomane') è 0 e il motore
    // pianifica un avanzamento "a vuoto" a 7 secondi che ricade sul ruolo successivo.
    scheduledKey.current = `${phase}-${nightStep}-processNightStep`;
    const step = activeNightSteps[nightStep];
    let newDecisions = { ...nightDecisions };
    
    // Tally votes for this step
    if (step && step.hasRole) {
      const tally = {};
      Object.entries(nightVotes).forEach(([vid, tId]) => {
         if(pStates[vid]?.role === step.roleId) tally[tId] = (tally[tId]||0)+1;
      });
      let maxVotes = 0; let target = null;
      Object.entries(tally).forEach(([tId, count]) => {
         if(count > maxVotes) { maxVotes = count; target = tId; }
      });
      if(target) newDecisions[step.key] = target;

      // Il Mitomane si SOMMA al ruolo imitato: due Streghe hanno due set di pozioni,
      // due Guardie proteggono due bersagli diversi. La decisione unica per ruolo qui
      // sopra basta ai Lupi (che decidono in gruppo) ma perderebbe una delle due azioni
      // individuali, quindi le conserviamo tutte indicizzate per giocatore.
      const perPlayer = {};
      Object.entries(nightVotes).forEach(([vid, tId]) => {
        if(pStates[vid]?.role === step.roleId) perPlayer[vid] = tId;
      });
      newDecisions[step.key + 'ByPlayer'] = perPlayer;

      // Cupido agisce OGNI notte e lega una coppia valida per quella notte sola.
      // Si itera per giocatore: col Mitomane i Cupido possono essere due, e usando
      // solo il vincitore del tally il secondo legame sparirebbe in silenzio mentre
      // il suo telefono mostra "in attesa", come se avesse agito.
      if (step.key === 'cupido' && target) {
        const coppie = Object.values(perPlayer).filter(v => typeof v === 'string' && v.includes(','));
        if (coppie.length) {
          // I legami si ACCUMULANO invece di sovrascriversi: con due Cupidi che
          // scelgono coppie che condividono una persona (A-B e B-C), lo spread
          // sostituiva la voce di B e restava legato solo a C — con A che lo
          // credeva ancora suo partner. Grafo asimmetrico, morti sbagliate.
          const newLovers = {};
          const lega = (a, b) => { newLovers[a] = [...new Set([...(newLovers[a] || []), b])]; };
          coppie.forEach(v => {
            const [l1, l2] = v.split(',');
            if (l1 && l2 && pStates[l1] && pStates[l2] && l1 !== l2) {
              lega(l1, l2); lega(l2, l1);
            }
          });
          if (Object.keys(newLovers).length) {
            setLovers(newLovers);
            fbUpdate({ lovers: newLovers });
          }
        } else {
          // Fallback: solo il primo innamorato scelto, il narratore completa da modal.
          // Qui non cambia né fase né passo, quindi la guardia va liberata a mano:
          // altrimenti la conferma dalla modale troverebbe processNightStep bloccato.
          setShowCupidoModal(target);
          setNightDecisions(newDecisions);
          stepBusy.current = false;
          return;
        }
      }

      // Mitomane: eredita SUBITO il ruolo (e la squadra) del giocatore imitato.
      // Il ruolo copiato appartiene per forza a un giocatore vivo, quindi il suo step
      // è già dentro la sequenza congelata di stanotte: il Mitomane agisce da subito.
      // Si itera per giocatore: il setup consente più Mitomani, e prendendone uno solo
      // il secondo resterebbe senza poteri e la Veggente leggerebbe il bersaglio altrui.
      if (step.key === 'mitomane') {
        const scelte = Object.entries(newDecisions['mitomaneByPlayer'] || {});
        const targets = {};
        let next = { ...pStatesRef.current };
        let cambiato = false;
        // Il ruolo copiato si risolve sullo stato INIZIALE, non su quello che si sta
        // aggiornando: così due Mitomani che si imitano a vicenda, o in catena, danno
        // sempre lo stesso risultato indipendentemente dall'ordine delle chiavi Firebase.
        // Chi copia un Mitomane ne eredita il ruolo di partenza, cioè resta Mitomane:
        // in quel caso non si trasforma, e va detto al narratore invece di lasciarlo
        // con un ruolo che il resto del codice dà per impossibile.
        const ruoloIniziale = {};
        Object.entries(pStatesRef.current).forEach(([id, p]) => { ruoloIniziale[id] = p.role; });
        const nonRiusciti = [];
        scelte.forEach(([mitoId, tgt]) => {
          const copiedRole = ruoloIniziale[tgt];
          if (!tgt || !copiedRole || copiedRole === 'mitomane') {
            if (ruoloIniziale[mitoId] === 'mitomane') nonRiusciti.push(mitoId);
            return;
          }
          targets[mitoId] = tgt;
          next = { ...next, [mitoId]: { ...next[mitoId], role: copiedRole, originalRole: 'mitomane' } };
          cambiato = true;
          if(db && gameId) {
            db.ref(`games/${gameId}/players/${mitoId}/role`).set(copiedRole);
            // serve al recap: senza, a fine partita il Mitomane sparisce e sembra che i lupi fossero uno in più
            db.ref(`games/${gameId}/players/${mitoId}/originalRole`).set('mitomane');
          }
        });
        if (nonRiusciti.length) {
          setMitomaneFallito(nonRiusciti.map(id => pStatesRef.current[id]?.name).filter(Boolean));
        }
        if (cambiato) {
          pStatesRef.current = next;
          setPStates(next);
          // Mappa per-Mitomane: `mitomaneTarget` singolo faceva leggere alla Veggente
          // il bersaglio di un altro Mitomane quando ne erano in gioco due.
          setMitomaneTargets(prev => ({ ...prev, ...targets }));
          if(db && gameId) db.ref(`games/${gameId}/mitomaneTargets`).update(targets);
          const primo = Object.values(targets)[0];
          if (primo && !mitomaneTarget) { // retrocompatibilità col campo singolo
            setMitomaneTarget(primo);
            db && gameId && db.ref(`games/${gameId}/mitomaneTarget`).set(primo);
          }
        }
      }
    }
    setNightDecisions(newDecisions);

    const next = nightStep+1;
    if(next >= activeNightSteps.length){
      // ── Prima riproduci il close dell'ultimo step, poi vai all'alba ──
      const lastStepKey = activeNightSteps[nightStep]?.key;
      const lastStepClose = NIGHT_NARRATION[lastStepKey]?.close || '';
      const lastStepCloseKey = lastStepKey ? (lastStepKey === 'open' ? 'night_close' : `${lastStepKey}_close`) : null;
      const proceedToDawn = () => {
      loveVictimsRef.current = []; // si raccolgono le morti per amore di QUESTA alba
      let partitaFinita = false;   // vittoria dichiarata da un eliminate: si registra comunque la notte
      // ── Dawn Reveal — calcolo vittime ──
      let dawnVictim = newDecisions['lupi'];
      if(dawnVictim && ROLES[pStates[dawnVictim]?.role]?.immuneToWolves) dawnVictim = null;
      // Ogni Guardia protegge il proprio bersaglio: col Mitomane possono essercene due.
      const guardiaTargets = Object.values(newDecisions['guardiaByPlayer'] || {});
      if(guardiaTargets.length ? guardiaTargets.includes(dawnVictim)
                               : dawnVictim === newDecisions['guardia']) dawnVictim = null;

      // Figlio dei Lupi: si trasforma invece di morire
      let figlioTransformed = false;
      let pStatesForLog = pStatesRef.current; // stato più aggiornato, non la closure
      if(dawnVictim && ROLES[pStatesForLog[dawnVictim]?.role]?.becomesWolfIfKilled) {
        const figlioId = dawnVictim;
        pStatesForLog = {...pStatesForLog, [figlioId]: {...pStatesForLog[figlioId], role: 'lupo', originalRole: 'figlio_dei_lupi'}};
        pStatesRef.current = pStatesForLog;
        setPStates(pStatesForLog);
        if(db && gameId) {
          db.ref(`games/${gameId}/players/${figlioId}/role`).set('lupo');
          db.ref(`games/${gameId}/players/${figlioId}/originalRole`).set('figlio_dei_lupi');
        }
        dawnVictim = null;
        figlioTransformed = true;
      }

      // Streghe: ognuna ha le SUE pozioni (il Mitomane si somma, non le condivide),
      // quindi nella stessa notte possono esserci più cure e più veleni.
      const stregaByPlayer = Object.keys(newDecisions['stregaByPlayer'] || {}).length
        ? newDecisions['stregaByPlayer']
        : (newDecisions['strega'] ? { _single: newDecisions['strega'] } : {});
      // Il consumo delle pozioni va verificato QUI, non nella UI: la scheda del
      // narratore-giocatore è una seconda interfaccia che non conosce quei vincoli,
      // e senza questo controllo un narratore-Strega curerebbe e avvelenerebbe ogni notte.
      const pozioniUsate = pozioniUsateRef.current;
      const stregaEntries = Object.entries(stregaByPlayer)
        .filter(([vid, d]) => {
          if (d === 'HEAL')  return !pozioniUsate[vid]?.heal;
          if (d && d !== 'PASS') return !pozioniUsate[vid]?.poison;
          return true;
        });
      const healers   = stregaEntries.filter(([, d]) => d === 'HEAL').map(([vid]) => vid);
      const poisoners = stregaEntries.filter(([, d]) => d && d !== 'HEAL' && d !== 'PASS');
      const stregaUsedHeal   = healers.length > 0;
      const stregaUsedPoison = poisoners.length > 0;
      if(stregaUsedHeal && dawnVictim) {
        dawnVictim = null;
        healers.forEach(vid => { if (vid !== '_single') {
          pozioniUsateRef.current[vid] = { ...(pozioniUsateRef.current[vid]||{}), heal:true };
          fbUpdate({ [`witchPotions/${vid}/heal`]: true });
        }});
      }

      // Medium: ognuno consulta il proprio spirito, quindi col Mitomane le visioni
      // possono essere due e vanno mostrate entrambe al narratore.
      const mediumByPlayer = Object.keys(newDecisions['mediumByPlayer'] || {}).length
        ? newDecisions['mediumByPlayer']
        : (newDecisions['medium'] ? { _single: newDecisions['medium'] } : {});
      const mediumResults = [];
      for (const [vid, tgt] of Object.entries(mediumByPlayer)) {
        const spirit = pStatesRef.current[tgt];
        if(tgt && spirit && !spirit.alive) {
          mediumResults.push({
            medium: pStatesRef.current[vid]?.name || null, // chi ha guardato, se sono più d'uno
            name: spirit.name,
            role: ROLES[spirit.role],
          });
        }
      }

      // Sciamani: ognuno ha la propria resurrezione, per lo stesso motivo delle Streghe
      const sciamanoByPlayer = Object.keys(newDecisions['sciamanoByPlayer'] || {}).length
        ? newDecisions['sciamanoByPlayer']
        : (newDecisions['sciamano'] ? { _single: newDecisions['sciamano'] } : {});
      let sciamanoResult = null;
      let sciamanoRevivedId = null;
      for (const [vid, tgt] of Object.entries(sciamanoByPlayer)) {
        if (sciamanoUsatoRef.current[vid]) continue; // una resurrezione a testa
        if(tgt && tgt !== 'PASS' && pStatesRef.current[tgt] && !pStatesRef.current[tgt].alive) {
          const risorto = {...pStatesRef.current, [tgt]: {...pStatesRef.current[tgt], alive: true}};
          pStatesRef.current = risorto;
          setPStates(risorto);
          if(db && gameId) db.ref(`games/${gameId}/players/${tgt}/alive`).set(true);
          if (vid !== '_single') {
            sciamanoUsatoRef.current[vid] = true;
            fbUpdate({ [`shamanUsedBy/${vid}`]: true });
          }
          if(!sciamanoResult) { sciamanoResult = risorto[tgt].name; sciamanoRevivedId = tgt; }
        }
      }

      // Criceto eliminato dalla Veggente
      const veggenteScanTarget = newDecisions['veggente'];
      if(veggenteScanTarget && pStates[veggenteScanTarget]?.alive && ROLES[pStates[veggenteScanTarget]?.role]?.diesFromVeggente) {
        // Non si esce subito: la notte va comunque registrata in cronaca, altrimenti
        // proprio la notte che chiude la partita sparisce dal racconto finale.
        if (eliminate(veggenteScanTarget, true)) partitaFinita = true;
      }

      // Veleni: uno per ogni Strega che lo ha usato
      let poisonVictimId = null;
      for (const [vid, tgt] of poisoners) {
        if(pStatesRef.current[tgt]?.alive) {
          if(!poisonVictimId) poisonVictimId = tgt; // il primo alimenta narrazione e recap
          if (vid !== '_single') {
            pozioniUsateRef.current[vid] = { ...(pozioniUsateRef.current[vid]||{}), poison:true };
            fbUpdate({ [`witchPotions/${vid}/poison`]: true });
          }
          if (eliminate(tgt, true)) partitaFinita = true;
        }
      }

      // Elimina la vittima dei lupi
      if(!partitaFinita && dawnVictim && pStates[dawnVictim]) {
        if (eliminate(dawnVictim, true)) partitaFinita = true;
      }

      // ── Sceglie la frase statica del narratore (nessuna API call) ──
      let narr, narrKey;
      // Conta QUALUNQUE morto della notte, non solo la vittima dei lupi: con il solo
      // dawnVictim il narratore annunciava "notte senza sangue" mentre sui telefoni
      // compariva il morto per veleno o quello che ha seguito il partner.
      const cadutiStanotte = (dawnVictim && pStates[dawnVictim]) || poisonVictimId || loveVictimsRef.current.length > 0;
      if(cadutiStanotte) {
        narr = t('narration.dawnVictimReveal'); narrKey = 'dawn_victim_reveal';
      } else if(figlioTransformed) {
        narr = t('narration.dawnFiglioTransformed'); narrKey = 'dawn_figlio_transformed';
      } else if(stregaUsedHeal) {
        narr = t('narration.dawnStregaHeal'); narrKey = 'dawn_strega_heal';
      } else {
        narr = t('narration.dawnNoVictim'); narrKey = 'dawn_no_victim';
      }

      // ── Registra evento notte nel log recap ──
      // Usa pStatesForLog (aggiornato con eventuale trasformazione Figlio) per includere il nuovo lupo
      // ── Il legame di Cupido si scioglie QUI: ha coperto le morti della notte,
      // dal giorno in poi non trascina più nessuno. Va fatto dopo tutte le
      // eliminazioni dell'alba e prima che la notte successiva ne leghi un'altra.
      if (Object.keys(lovers).length) {
        setLovers({});
        if(db && gameId) db.ref(`games/${gameId}/lovers`).remove();
      }

      const wolvesIds = Object.keys(pStatesForLog).filter(id => pStatesForLog[id]?.alive && ROLES[pStatesForLog[id]?.role]?.team === 'lupi');
      pushEvent({
        type: 'night',
        turn: dayNum,
        wolvesIds,
        wolfTarget:         newDecisions['lupi'] || null,
        guardiaSaved:       !!(newDecisions['lupi'] && guardiaTargets.includes(newDecisions['lupi'])),
        stregaHealed:       stregaUsedHeal && !!newDecisions['lupi'],
        stregaPoison:       poisonVictimId,
        dawnVictim:         dawnVictim || null,
        poisonVictim:       poisonVictimId,
        figlioTransformed,
        sciamanoRevived:    sciamanoRevivedId,
        // La coppia legata QUESTA notte: Cupido agisce ogni notte, non solo la prima
        cupidoLovers:       newDecisions['cupido']?.includes(',') ? newDecisions['cupido'].split(',') : null,
        // TUTTE le coppie: col Mitomane i Cupidi possono essere due e la cronaca ne
        // registrava una sola, facendo sparire dal racconto un legame che però uccide.
        cupidoPairs:        Object.values(newDecisions['cupidoByPlayer'] || {})
                              .filter(v => typeof v === 'string' && v.includes(','))
                              .map(v => v.split(',')),
        // Veggente e Medium non finivano in cronaca: il narratore non poteva raccontare
        // le indagini, e a fine partita mancava metà di quello che era successo.
        veggenteScans:      Object.values(newDecisions['veggenteByPlayer'] || {}).filter(Boolean),
        mediumScans:        Object.values(newDecisions['mediumByPlayer'] || {}).filter(v => v && v !== 'PASS'),
        mitomaneTarget:     dayNum === 1 && mitomaneTarget ? mitomaneTarget : null,
        // Chi è morto di dolore stanotte, seguendo il partner legato da Cupido:
        // senza questo il narratore non saprebbe di doverlo nominare
        loveVictims:        loveVictimsRef.current.length ? [...loveVictimsRef.current] : null,
      });

      // La notte è registrata: ora si può uscire. `eliminate` ha già dichiarato il
      // vincitore e portato la fase a 'ended', quindi non serve annunciare l'alba.
      if (partitaFinita) return;

      // ── Salva dawnInfo per il GM e push dawnVictimId su Firebase per i giocatori ──
      const info = {
        victimId: dawnVictim || null,
        poisonVictimId,
        stregaHealed: stregaUsedHeal && !!newDecisions['lupi'],
        figlioTransformed,
        mediumResults,
        sciamanoResult,
        loveVictims: loveVictimsRef.current.length ? [...loveVictimsRef.current] : null,
      };
      setDawnInfo(info);

      // Guardia: aggiorna lastGuardedId per bloccare la stessa protezione due notti di fila
      const guardiaChoice = newDecisions['guardia'] || null;
      setLastGuardedId(guardiaChoice);
      if(db && gameId) fbUpdate({ lastGuardedId: guardiaChoice });

      // TUTTI i caduti della notte, non solo la vittima dei lupi: con il veleno della
      // Strega e la morte per dolore i telefoni ne mostravano uno solo e gli altri
      // sparivano, lasciando il tavolo a chiedersi chi fosse ancora vivo.
      const mortiStanotte = [...new Set([
        (dawnVictim && pStates[dawnVictim]) ? dawnVictim : null,
        poisonVictimId,
        ...(loveVictimsRef.current || []),
      ].filter(Boolean))];

      // Causa per ciascun caduto: sotto l'elenco c'era una frase fissa "I lupi hanno
      // colpito" anche quando qualcuno era morto di veleno o di dolore.
      const causeMorte = {};
      if (dawnVictim && pStates[dawnVictim]) causeMorte[dawnVictim] = 'lupi';
      if (poisonVictimId) causeMorte[poisonVictimId] = 'veleno';
      (loveVictimsRef.current || []).forEach(id => { causeMorte[id] = 'amore'; });

      setNarrationAndPhase('dawn_reveal', narr, null, {
        currentNightStep: null,
        nightVotes: null,
        currentNightVictim: null,
        dawnVictimId:  mortiStanotte[0] || null,   // compatibilità con le partite in corso
        dawnVictimIds: mortiStanotte.length ? mortiStanotte : null,
        dawnCauses:    Object.keys(causeMorte).length ? causeMorte : null,
        dawnRevivedId: sciamanoRevivedId || null,  // la resurrezione va annunciata all'alba
      }, narrKey);
      setDayNum(d=>d+1);
      window.stopSfx('night');
      window.playSfx('dawn');

      // Quando la notte ha lasciato dei morti (o restituito un vivo) l'alba dura di
      // più: 12 secondi non bastavano a leggere i nomi e a lasciare reagire il tavolo.
      // dawnInfo NON viene azzerato: il narratore deve poterlo rileggere di giorno.
      const albaLunga = mortiStanotte.length > 0 || !!sciamanoRevivedId;
      phaseTimer.current = setTimeout(() => {
        setNarrationAndPhase('day', '', dayTimerMinsRef.current * 60,
          { dawnVictimId: null, dawnVictimIds: null, dawnRevivedId: null });
      }, albaLunga ? 22000 : 12000);
      }; // fine proceedToDawn

      // Riproduci il close dell'ultimo step (es. "I Lupi, chiudano gli occhi.")
      // poi procedi all'alba
      if (lastStepClose) {
        window.speakNarration(lastStepClose, lastStepCloseKey);
        window.afterSpeech(proceedToDawn);
      } else {
        proceedToDawn();
      }

    } else {
      const currentStepObj = activeNightSteps[nightStep];
      // Legge il testo di chiusura dalla struttura open/close di NIGHT_NARRATION
      const closingMsg = NIGHT_NARRATION[currentStepObj.key]?.close || '';
      const closingMsgKey = currentStepObj.key === 'open' ? 'night_close' : `${currentStepObj.key}_close`;

      const nextStepObj = activeNightSteps[next];
      const goNextStep = () => {
        // Legge il testo di apertura del prossimo step
        const narrationText = NIGHT_NARRATION[nextStepObj.key]?.open || '';
        const narrationTextKey = nextStepObj.key === 'open' ? 'night_open' : `${nextStepObj.key}_open`;
        setNightStep(next);
        setNarration(narrationText);
        window.speakNarration(narrationText, narrationTextKey);
        const fbData = { currentNightStep: nextStepObj.hasRole ? nextStepObj : null, nightVotes: null };
        if (nextStepObj.key === 'strega') fbData.currentNightVictim = newDecisions['lupi'] || null;
        fbUpdate(fbData);
        if(nextStepObj.key==='lupi') window.playSfx('wolf');
      };

      if(closingMsg) {
        // Aspetta che il narratore finisca di parlare, poi passa allo step successivo
        window.speakNarration(closingMsg, closingMsgKey);
        window.afterSpeech(goNextStep);
      } else {
        goNextStep();
      }
    }
  };

  const resolveDayVoting = () => {
      const tally = {};
      Object.entries(dayVotes).forEach(([voterId, tId]) => {
        const weight = ROLES[pStates[voterId]?.role]?.voteWeight || 1;
        tally[tId] = (tally[tId]||0) + weight;
      });
      let maxVotes = 0; let target = null;
      Object.entries(tally).forEach(([tId, count]) => {
         if(count > maxVotes) { maxVotes = count; target = tId; }
      });
      
      // Snapshot dei voti per il recap: chi ha votato chi, e quanti voti ha preso ciascuno
      const voteDetail = Object.entries(dayVotes).map(([voterId, tId]) => ({ voterId, targetId: tId }));

      if(target && pStates[target]) {
         pushEvent({ type: 'day', turn: currentDayNum, dayVictim: target, noMajority: false, votes: voteDetail, tally });
         const w = eliminate(target);
         if(w) return;
         // Frase statica → MP3 pre-registrato, nessuna API call
         // Il nome del condannato arriva sui telefoni dei giocatori via Firebase (dayVictimId)
         setNarrationAndPhase('ended_voting',
           t('narration.dayVictimReveal'),
           null, { dayVotes: null, dayVictimId: target }, 'day_victim_reveal'
         );
         phaseTimer.current = setTimeout(() => {
           setNightStep(0); setNightDecisions({});
           // pStatesRef, non pStates: qui la closure è vecchia di 10s e non vedrebbe l'eliminazione appena avvenuta
           setFrozenNightSteps(buildNightSteps(pStatesRef.current, dayNum));
           setNarrationAndPhase('night', NIGHT_NARRATION.open.open, null,
             { currentNightStep: null, nightVotes: null, dayVictimId: null }, 'night_open'
           );
           window.playSfx('night');
         }, 10000);
      } else {
         pushEvent({ type: 'day', turn: currentDayNum, dayVictim: null, noMajority: true, votes: voteDetail, tally });
         setNarrationAndPhase('ended_voting',
           t('narration.dayNoMajority'),
           null, { dayVotes: null, dayVictimId: null }, 'day_no_majority'
         );
         phaseTimer.current = setTimeout(() => {
           setNightStep(0); setNightDecisions({});
           // pStatesRef, non pStates: qui la closure è vecchia di 10s e non vedrebbe l'eliminazione appena avvenuta
           setFrozenNightSteps(buildNightSteps(pStatesRef.current, dayNum));
           setNarrationAndPhase('night', NIGHT_NARRATION.open.open, null,
             { currentNightStep: null, nightVotes: null, dayVictimId: null }, 'night_open'
           );
           window.playSfx('night');
         }, 10000);
      }
  };

  const goVoting = ()=>{
    setNarrationAndPhase('voting', t('narration.votingStart'), null, {}, 'voting_start');
  };

  const clearVotes = ()=>{
    fbUpdate({ nightVotes: null, dayVotes: null });
    setNightVotes({});
    setDayVotes({});
  };

  const alivePlayers = Object.values(pStates).filter(p=>p.alive);
  const deadPlayers  = Object.values(pStates).filter(p=>!p.alive);

  // dayNum viene incrementato all'ALBA, quindi durante il giorno vale già il numero
  // della notte successiva: la giornata in corso è quella appena cominciata, cioè una
  // in meno. Senza questo, la prima giornata si presentava come "Seconda giornata".
  const currentDayNum = Math.max(1, dayNum - 1);

  const phaseLabel = {
    waiting: t('gameMaster.phaseLabelWaiting'), role_reveal: t('gameMaster.phaseLabelRoleReveal'),
    night: t('gameMaster.phaseLabelNight', {n: dayNum}), day: t('gameMaster.phaseLabelDay', {n: currentDayNum}),
    voting: t('gameMaster.phaseLabelVoting'), ended: t('gameMaster.phaseLabelEnded'),
  }[phase]||'';

  // Durante la notte usa la sequenza congelata all'inizio della notte stessa: ricalcolarla
  // a ogni render manderebbe fuori sync nightStep (che è un indice) appena un ruolo cambia.
  const activeNightSteps = (phase === 'night' && frozenNightSteps)
    ? frozenNightSteps
    : buildNightSteps(pStates, dayNum);

  // ===================== AUTOMATED ENGINE =====================
  const engineTimer = useRef(null);
  const scheduledKey = useRef(null);
  const [actionPulse, setActionPulse] = useState(null);

  // Esegue l'azione pianificata (al sicuro da stale closures poiché al re-render le ref sono aggiornate!)
  useEffect(() => {
    if (actionPulse === 'goFirstNight') goFirstNight();
    if (actionPulse === 'processNightStep') processNightStep();
    if (actionPulse === 'goVoting') goVoting();
    if (actionPulse === 'resolveDayVoting') resolveDayVoting();
    if (actionPulse) setActionPulse(null); // reset immediato
  }, [actionPulse]);

  useEffect(() => {
    if(winner || actionPulse) return;
    // Finché la reidratazione non ha finito, lo stato è quello iniziale: fase 'waiting'
    // e tutti vivi. Il listener però popola readyCount subito, e in una partita in corso
    // tutti risultano pronti — il motore pianificherebbe goFirstNight e 4 secondi dopo
    // riporterebbe la partita alla notte 1, azzerando le decisioni.
    if (!rehydrated) return;

    let plannedAction = null;
    let delay = 0;

    if (phase === 'role_reveal' || phase === 'waiting') {
      const totalPlayers = Object.keys(pStates).length;
      if (totalPlayers > 0 && readyCount === totalPlayers) {
        plannedAction = 'goFirstNight'; delay = 4000;
      }
    } else if (phase === 'night') {
      const step = activeNightSteps[nightStep];
      if (step) {
        if (step.hasRole) {
          const aliveOfRole = Object.values(pStates).filter(p => p.alive && p.role === step.roleId);
          if (aliveOfRole.length === 0) {
            plannedAction = 'processNightStep'; delay = 7000;
          } else if (step.roleId === 'figlio_dei_lupi' || step.roleId === 'indemoniato') {
            // Nessuna azione notturna (osservano soltanto): avanza dopo il delay narrativo
            plannedAction = 'processNightStep'; delay = 7000;
          } else {
            const votersOfRole = Object.keys(nightVotes).filter(vid => pStates[vid]?.role === step.roleId);
            if (votersOfRole.length >= aliveOfRole.length) {
              plannedAction = 'processNightStep'; delay = 3500;
            } else {
              // Un giocatore vivo che non tocca lo schermo — distratto, telefono in tasca,
              // o che non ha capito cosa fare — bloccherebbe il passo per sempre: la
              // condizione qui sopra non si avvera mai. Il narratore dovrebbe forzare, ma
              // non può chiedere "hai giocato?" senza far uscire allo scoperto il ruolo.
              // Si avanza comunque, così la durata del passo non dipende da chi lo interpreta.
              plannedAction = 'processNightStep'; delay = NIGHT_STEP_TIMEOUT_MS;
            }
          }
        } else {
          plannedAction = 'processNightStep'; delay = 9000;
        }
      }
    } else if (phase === 'day') {
      // Nessun auto-avanzamento: il GM decide quando andare al voto (con sollecito votePrompt)
    } else if (phase === 'voting') {
      const aliveCount = Object.values(pStates).filter(p=>p.alive).length;
      const voteCount = Object.keys(dayVotes).length;
      if (aliveCount > 0 && voteCount === aliveCount) {
        plannedAction = 'resolveDayVoting'; delay = 4000;
      }
    }

    if (plannedAction) {
      // Il delay fa parte della chiave: senza, il timeout lungo armato quando ancora
      // nessuno aveva votato non verrebbe riprogrammato a 3,5s appena i voti arrivano,
      // e il passo resterebbe fermo fino alla scadenza pur avendo già tutte le scelte.
      const currentKey = `${phase}-${nightStep}-${plannedAction}-${delay}`;
      if (scheduledKey.current !== currentKey) {
        scheduledKey.current = currentKey;
        clearTimeout(engineTimer.current);
        engineTimer.current = setTimeout(() => {
          setActionPulse(plannedAction);
        }, delay);
      }
    } else {
      // Nessuna azione valida per lo stato attuale: un timer armato per lo stato
      // PRECEDENTE va disinnescato, altrimenti scatta più tardi su una fase diversa.
      // È la porta d'ingresso con cui un goFirstNight residuo riportava la partita
      // alla notte 1 subito dopo il rientro del narratore.
      clearTimeout(engineTimer.current);
      scheduledKey.current = null;
    }
  }, [phase, nightStep, readyCount, pStates, nightVotes, dayVotes, activeNightSteps, timer, timerOn, winner, actionPulse]);

  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsSpeaking(true);
    const handleEnd = () => setIsSpeaking(false);
    
    if (window.speechSynthesis && window.speechSynthesis.speaking) setIsSpeaking(true);

    window.addEventListener('narrator_start', handleStart);
    window.addEventListener('narrator_end', handleEnd);
    return () => {
      window.removeEventListener('narrator_start', handleStart);
      window.removeEventListener('narrator_end', handleEnd);
    };
  }, []);

  return (
    <div className={`min-h-screen layer screen-safe pb-6 ${ phase==='night'||phase==='role_reveal'||phase==='waiting' ? 'overlay-night' : phase==='dawn_reveal' ? 'overlay-dawn' : phase==='day'||phase==='voting' ? 'overlay-day' : '' }`}
         style={{maxWidth:480, margin:'0 auto'}}>

      {/* Glow atmosferico di fase */}
      {(phase==='night'||phase==='role_reveal'||phase==='waiting') && (
        <div className="phase-glow" style={{top:'-60px',width:320,height:320,
          background:'radial-gradient(ellipse, rgba(80,40,200,0.18) 0%, transparent 70%)',
          animation:'nightGlow 4s ease-in-out infinite'}} />
      )}
      {phase==='dawn_reveal' && (
        <div className="phase-glow" style={{bottom:0,top:'auto',width:420,height:260,
          background:'radial-gradient(ellipse at bottom, rgba(255,110,30,0.22) 0%, rgba(200,60,10,0.08) 50%, transparent 75%)',
          animation:'dawnGlow 3s ease-in-out infinite'}} />
      )}
      {(phase==='day'||phase==='voting') && (
        <div className="phase-glow" style={{top:'-40px',width:360,height:280,
          background:'radial-gradient(ellipse, rgba(200,140,20,0.12) 0%, transparent 70%)',
          animation:'dayGlow 5s ease-in-out infinite'}} />
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 pt-5 pb-3"
           style={{background: phase==='night'||phase==='role_reveal'||phase==='waiting' ? 'rgba(10,5,25,0.95)' : phase==='dawn_reveal' ? 'rgba(25,10,0,0.95)' : 'rgba(15,10,0,0.95)', backdropFilter:'blur(10px)', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
        <button onClick={() => {
          if (phase === 'waiting' && onBackToCreate) {
            db?.ref(`games/${gameId}`).remove().catch(()=>{});
            const narratorP = players.find(p => p.isNarrator);
            onBackToCreate({
              playerNames: players.filter(p => !p.isNarrator).map(p => p.name),
              wolfCount: players.filter(p => p.role === 'lupo').length,
              allRoles: players.map(p => p.role).filter(r => r !== 'lupo'),
              initialStep: 3,
              narratorName: narratorP ? narratorP.name : null,
            });
          } else { onBack(); }
        }} className="text-gray-500 hover:text-white text-2xl leading-none transition-colors">←</button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-cinzel text-moon font-bold text-base leading-none truncate">{t('gameMaster.narratorTitle')}</h2>
            <span className="badge" style={{background:'rgba(226,201,126,0.1)', border:'1px solid rgba(226,201,126,0.2)', color:'rgba(226,201,126,0.7)', fontSize:'0.65rem'}}>
              #{gameId}
            </span>
          </div>
          <p className="text-gray-500 text-xs mt-0.5">{phaseLabel} · {alivePlayers.length}/{Object.keys(pStates).length} {t('gameMaster.aliveSuffix')}</p>
        </div>
        {/* Phase dot indicator */}
        <div className="flex gap-1">
          {['waiting','role_reveal','night','day','voting','ended'].map((p,i)=>(
            <div key={i} className="w-1.5 h-1.5 rounded-full transition-all"
                 style={{background: p===phase||(['night','day','voting'].includes(phase)&&['night','day','voting'].includes(p)&&i<=(['waiting','role_reveal','night','day','voting','ended'].indexOf(phase)))
                   ?'#e2c97e':'rgba(255,255,255,0.12)'}}/>
          ))}
        </div>
      </div>

      <div className="px-4 mt-2">

        {/* Narrator Avatar 3D Style */}
        {phase !== 'waiting' && phase !== 'ended' && (
          <div className="flex flex-col items-center justify-center mb-8 mt-6 anim-fade-in relative z-0 narrator-3d-container">
            <div className={`narrator-3d-avatar w-40 h-40 rounded-full overflow-hidden border-4 shadow-2xl ${isSpeaking ? 'speaking' : ''}`}
                 style={{ 
                   borderColor: isSpeaking ? 'rgba(226,201,126,0.8)' : 'rgba(226,201,126,0.2)',
                   background: '#0d1117'
                 }}>
              <img src={window.NARRATOR_IMG || 'narrator.png'} alt="Silente" className="w-full h-full object-cover"
                   onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML='<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:4rem;">🧙</div>'; }} />
            </div>
            
            {/* Magical Aura Rings */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-moon/20 pointer-events-none transition-all duration-1000 ${isSpeaking ? 'scale-110 opacity-60 rotate-45' : 'scale-100 opacity-20'}`}></div>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-moon/10 pointer-events-none transition-all duration-1000 delay-100 ${isSpeaking ? 'scale-125 opacity-40 -rotate-45' : 'scale-100 opacity-0'}`}></div>

            {isSpeaking && (
              <div className="mt-2 flex justify-center gap-1 items-end h-4">
                {[0.6, 1, 0.4, 0.8].map((h, i) => (
                  <div key={i} className="w-1 bg-moon rounded-full"
                       style={{ height: `${h*100}%`, animation: `bar-pulse 0.8s ${i*0.15}s ease-in-out infinite` }}/>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Script card — testo da leggere ad alta voce */}
        {narration && ttsMode === 'script' && (
          <div className="mb-5 anim-fade-up rounded-2xl p-5 relative"
               style={{background:'rgba(226,201,126,0.05)', border:'1px solid rgba(226,201,126,0.25)',
                       boxShadow:'0 0 30px rgba(226,201,126,0.06)'}}>
            {/* Icona rotolo */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📜</span>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{color:'rgba(226,201,126,0.5)'}}>
                {t('gameMaster.readAloud')}
              </span>
            </div>
            {/* Testo narrazione */}
            <p className="font-cinzel text-white text-base leading-relaxed italic">
              "{narration}"
            </p>
          </div>
        )}

        {/* ── CRONACA DELLE NOTTI — serve al narratore per raccontare cosa è successo ──
            Sta solo qui: i giocatori la vedono soltanto a partita finita. */}
        {eventLogRef.current.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setShowChronicle(v => !v)}
              className="flex items-center gap-2 text-xs transition-colors"
              style={{color:'rgba(226,201,126,0.75)'}}
            >
              <span>{showChronicle ? '▾' : '▸'}</span>
              <span>📖 {t('gameMaster.chronicle')}</span>
            </button>
            {showChronicle && (
              <div className="mt-2 rounded-xl px-3 py-3 max-h-72 overflow-y-auto space-y-3"
                   style={{background:'rgba(226,201,126,0.05)', border:'1px solid rgba(226,201,126,0.18)'}}>
                {eventLogRef.current.map((ev, i) => {
                  const ordinals = t('player.ordinals');
                  const ordinal = ordinals[ev.turn-1] || t('player.turnFallback', {n: ev.turn});
                  const lines = recapEventLines(ev, pStates);
                  const groups = ev.type === 'day' ? recapVoteGroups(ev, pStates) : null;
                  return (
                    <div key={i}>
                      <p className="font-cinzel text-[11px] font-bold uppercase tracking-wider mb-1"
                         style={{color: ev.type === 'night' ? '#a5b4fc' : '#fcd34d'}}>
                        {ev.type === 'night' ? '🌙' : '☀️'} {ordinal} {ev.type === 'night' ? t('player.nightSuffix') : t('player.daySuffix')}
                      </p>
                      {lines.map((l, li) => (
                        <p key={li} className="text-gray-300 text-xs leading-relaxed mb-0.5">{l}</p>
                      ))}
                      {groups && (
                        <div className="mt-1 pl-2" style={{borderLeft:'2px solid rgba(255,255,255,0.12)'}}>
                          {groups.map((g, gi) => (
                            <p key={gi} className="text-gray-500 text-[11px] leading-snug">
                              <span className="text-gray-400 font-bold">{g.name}</span> ← {g.voters.join(', ')}
                              <span className="text-gray-600"> ({g.voters.length})</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Log narrazione collassabile */}
        {narrationLog.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowNarrationLog(v => !v)}
              className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              <span>{showNarrationLog ? '▾' : '▸'}</span>
              <span>{t('gameMaster.narratorLog', {n: narrationLog.length})}</span>
            </button>
            {showNarrationLog && (
              <div className="mt-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2 max-h-40 overflow-y-auto space-y-1">
                {narrationLog.map((entry, i) => (
                  <p key={i} className="text-[11px] text-gray-400 leading-snug">
                    <span className="text-gray-600 mr-1">[{entry.time}]</span>
                    <span className="italic">{entry.text}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================== WAITING ===================== */}
        {phase==='waiting' && (
          <div className="anim-fade-up flex flex-col items-center">
            <p className="text-gray-400 text-sm mb-4 text-center">
              {t('gameMaster.waitingScanQr')}
            </p>

            <div className="flex items-center gap-4 mb-6 w-full max-w-sm">
              <button 
                onClick={() => setActiveQrIndex(i => Math.max(0, i - 1))}
                disabled={activeQrIndex === 0}
                className="w-12 h-12 rounded-full glass hover:bg-white/10 active:scale-95 disabled:opacity-20 flex items-center justify-center text-2xl transition-all pb-1">
                ←
              </button>
              
              <div className="flex-1">
                {players.map((p, i) => {
                  if (i !== activeQrIndex) return null;
                  const playerUrl = `${appUrl}?game=${gameId}&player=${p.id}`;
                  const isReady = pStates[p.id]?.ready;
                  
                  return (
                    <div key={p.id} className="glass rounded-2xl p-4 text-center anim-fade-in w-full relative">
                      {isReady && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-[0_0_10px_#22c55e]">✓</div>
                      )}
                      <a href={playerUrl} target="_blank" rel="noreferrer" className="block" title={t('gameMaster.clickToOpenRoleTab')}>
                        <div className="flex justify-center rounded-xl overflow-hidden mb-3 mx-auto max-w-[150px]" style={{background:'#060b10'}}>
                          <QRCodeBox url={playerUrl} size={150}/>
                        </div>
                        <p className="font-cinzel font-bold text-white text-lg truncate" style={{color: isReady?'#4ade80':''}}>{p.name}</p>
                        <p className="text-gray-500 text-[10px] uppercase mt-1">{t('gameMaster.playerOf', {i: i+1, total: players.length})}</p>
                      </a>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => setActiveQrIndex(i => Math.min(players.length - 1, i + 1))}
                disabled={activeQrIndex === players.length - 1}
                className="w-12 h-12 rounded-full glass hover:bg-white/10 active:scale-95 disabled:opacity-20 flex items-center justify-center text-2xl transition-all pb-1">
                →
              </button>
            </div>

            {isFirebaseConfigured() && (
              <div className="glass rounded-xl p-3 mb-4 flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">{t('gameMaster.readyPlayers')}</p>
                  <p className="font-cinzel text-white font-bold">{readyCount} / {players.length}</p>
                </div>
                <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all"
                       style={{width:`${(readyCount/players.length)*100}%`}}/>
                </div>
              </div>
            )}

            <div className="text-center mt-2 mb-2">
              {readyCount === players.length ? (
                <p className="text-green-400 text-sm font-bold flex items-center justify-center gap-2"><span className="animate-spin">⏳</span> {t('gameMaster.startingSoon')}</p>
              ) : (
                <p className="text-gray-500 text-sm italic">{t('gameMaster.waitingForPlayers')}</p>
              )}
            </div>

            {/* ---- Modalità voce ---- */}
            <div className="mt-4 w-full">
              <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">{t('gameMaster.narratorVoice')}</p>
              <div className="flex gap-1 rounded-xl overflow-hidden p-0.5"
                     style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)'}}>
                <button
                  onClick={()=>{ setTtsMode('script'); localStorage.setItem('lif_tts_mode','script'); }}
                  className="flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all"
                  style={ttsMode==='script'
                    ? {background:'rgba(226,201,126,0.2)', color:'#e2c97e', border:'1px solid rgba(226,201,126,0.3)'}
                    : {color:'#6b7280'}}>
                  {t('gameMaster.scriptMode')}
                </button>
                <button
                  onClick={()=>{
                    if (purchasedPacks.includes('narratore')) {
                      setTtsMode('voice');
                      localStorage.setItem('lif_tts_mode','voice');
                    } else {
                      setPaywallPack('narratore');
                    }
                  }}
                  className="flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all"
                  style={ttsMode==='voice'
                    ? {background:'rgba(139,92,246,0.2)', color:'#a78bfa', border:'1px solid rgba(139,92,246,0.3)'}
                    : {color:'#6b7280'}}>
                  {t('gameMaster.voiceMode')} {!purchasedPacks.includes('narratore') && '🔒'}
                </button>
              </div>
            </div>

            {/* ---- Test voce narratore ---- */}
            <div className="mt-3 w-full flex gap-2">
              <button
                onClick={testELVoice}
                className="flex-1 py-3 rounded-xl text-sm font-cinzel font-bold transition-all active:scale-95"
                style={{background:'rgba(226,201,126,0.08)', border:'1px solid rgba(226,201,126,0.25)', color:'#e2c97e'}}
              >
                {t('gameMaster.testNarrator')}
              </button>
              {elTestStatus && (
                <div className="flex items-center px-3 rounded-xl text-sm" style={{background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.2)', color:'#4ade80'}}>
                  {elTestStatus}
                </div>
              )}
            </div>

            {/* ---- Personaggi in gioco ---- */}
            <div className="mt-4 w-full">
              <button
                onClick={()=>setShowRolesPanel(v=>!v)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl glass hover:bg-white/10 active:scale-95 transition-all text-sm font-cinzel text-moon"
              >
                <span>{t('gameMaster.charactersInPlay', {n: [...new Set(players.map(p=>p.role))].length})}</span>
                <span style={{fontSize:'0.9rem',transition:'transform 0.3s',display:'inline-block',transform:showRolesPanel?'rotate(180deg)':'rotate(0deg)'}}>▾</span>
              </button>
              {showRolesPanel && (
                <div className="mt-2 flex flex-col gap-2 anim-fade-up">
                  {[...new Set(players.map(p=>p.role))].map(roleId=>{
                    const r = ROLES[roleId];
                    if(!r) return null;
                    const teamColor = r.team==='lupi'?'#c0392b':'#27ae60';
                    return (
                      <div key={roleId} className="glass rounded-xl px-4 py-3 flex gap-3 items-start"
                           style={{borderLeft:`3px solid ${teamColor}`}}>
                        <span className="text-2xl shrink-0 mt-0.5">{r.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-cinzel font-bold text-white text-sm">{r.name}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded-full"
                                  style={{background:`${teamColor}22`,color:teamColor,border:`1px solid ${teamColor}44`}}>
                              {r.team==='lupi'?t('teams.lupi'):t('teams.villaggio')}
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs leading-relaxed">{r.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== ROLE REVEAL ===================== */}
        {phase==='role_reveal' && (
          <div className="anim-fade-up">
            <div className="glass rounded-2xl p-4 mb-5">
              <p className="text-gray-400 text-sm mb-3">{t('gameMaster.playersDiscoveringRoles')}</p>
              {isFirebaseConfigured() && (
                <>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">{t('gameMaster.ready')}</span>
                    <span className="font-bold text-white">{readyCount}/{players.length}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full transition-all"
                         style={{width:`${(readyCount/players.length)*100}%`}}/>
                  </div>
                </>
              )}
            </div>
            <div className="text-center mt-2 mb-2">
              {readyCount === players.length ? (
                <p className="text-green-400 text-sm font-bold flex items-center justify-center gap-2"><span className="animate-spin">⏳</span> {t('gameMaster.enteringNight')}</p>
              ) : (
                <p className="text-gray-500 text-sm italic">{t('gameMaster.waitingRolesConfirm')}</p>
              )}
            </div>

            {/* ---- Personaggi in gioco ---- */}
            <div className="mt-3 w-full">
              <button
                onClick={()=>setShowRolesPanel(v=>!v)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl glass hover:bg-white/10 active:scale-95 transition-all text-sm font-cinzel text-moon"
              >
                <span>{t('gameMaster.charactersInPlay', {n: [...new Set(players.map(p=>p.role))].length})}</span>
                <span style={{fontSize:'0.9rem',transition:'transform 0.3s',display:'inline-block',transform:showRolesPanel?'rotate(180deg)':'rotate(0deg)'}}>▾</span>
              </button>
              {showRolesPanel && (
                <div className="mt-2 flex flex-col gap-2 anim-fade-up">
                  {[...new Set(players.map(p=>p.role))].map(roleId=>{
                    const r = ROLES[roleId];
                    if(!r) return null;
                    const teamColor = r.team==='lupi'?'#c0392b':'#27ae60';
                    return (
                      <div key={roleId} className="glass rounded-xl px-4 py-3 flex gap-3 items-start"
                           style={{borderLeft:`3px solid ${teamColor}`}}>
                        <span className="text-2xl shrink-0 mt-0.5">{r.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-cinzel font-bold text-white text-sm">{r.name}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded-full"
                                  style={{background:`${teamColor}22`,color:teamColor,border:`1px solid ${teamColor}44`}}>
                              {r.team==='lupi'?t('teams.lupi'):t('teams.villaggio')}
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs leading-relaxed">{r.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== NIGHT ===================== */}
        {phase==='night' && (
          <div className="anim-fade-up">
            {/* Night steps progress */}
            <div className="glass rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-500 text-xs uppercase tracking-wider">{t('gameMaster.nightStepsProgress')}</p>
                <span className="text-gray-500 text-xs">{nightStep+1}/{activeNightSteps.length}</span>
              </div>
              <div className="flex gap-1 mb-3">
                {activeNightSteps.map((_,i)=>(
                  <div key={i} className="night-step flex-1"
                       style={{background:i<nightStep?'#6366f1':i===nightStep?'#a5b4fc':'rgba(255,255,255,0.08)'}}/>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeNightSteps[nightStep]?.icon}</span>
                <div>
                  <p className="font-cinzel text-indigo-300 font-bold text-sm">{activeNightSteps[nightStep]?.label}</p>
                  {activeNightSteps[nightStep]?.hasRole && (
                    <p className="text-gray-600 text-xs">{t('gameMaster.wakeThisRole')}</p>
                  )}
                </div>
              </div>

              {activeNightSteps[nightStep]?.hasRole && (
                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-[10px] uppercase tracking-wider">
                      {t('gameMaster.votesReceived', {n: Object.keys(nightVotes).length})}
                    </span>
                    <button
                      onClick={() => setShowVotesPanel(v => !v)}
                      className="text-gray-500 text-[10px] underline hover:text-gray-300"
                    >
                      {showVotesPanel ? t('gameMaster.hideChoices') : t('gameMaster.showChoices')}
                    </button>
                  </div>
                  {showVotesPanel && (
                    <div className="mt-2 p-3 rounded-xl border border-white/10 bg-black/20">
                      {Object.keys(nightVotes).length===0 ? (
                        <p className="text-gray-600 text-xs italic">{t('gameMaster.noOneChoseYet')}</p>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {Object.entries(nightVotes).map(([vid, targetId]) => {
                            const voter = pStates[vid];
                            if(!voter) return null;
                            // Cupido: voto doppio "id1,id2"
                            if(typeof targetId === 'string' && targetId.includes(',')) {
                              const [id1, id2] = targetId.split(',');
                              const t1 = pStates[id1], t2 = pStates[id2];
                              return (
                                <div key={vid} className="flex justify-between items-center text-xs">
                                  <span className="text-gray-300">{voter.name}</span>
                                  <span className="text-pink-400 mx-2">💘</span>
                                  <span className="font-bold text-white px-2 py-0.5 rounded" style={{background:'rgba(233,30,99,0.15)'}}>
                                    {t1?.name} &amp; {t2?.name}
                                  </span>
                                </div>
                              );
                            }
                            const target = pStates[targetId];
                            if(!target) return null;
                            // Veggente: mostra l'allineamento reale (Mitomane appare come imitato)
                            const isVeggStep = activeNightSteps[nightStep]?.key === 'veggente';
                            let teamHint = null;
                            if(isVeggStep) {
                              // Bersaglio DI QUEL Mitomane: con la mappa globale la Veggente
                              // leggeva il ruolo copiato da un altro Mitomane
                              // Il campo singolo vale solo per le partite iniziate prima
                              // della mappa: usarlo come fallback per-giocatore faceva
                              // leggere alla Veggente il bersaglio di un ALTRO Mitomane.
                              const suoTarget = Object.keys(mitomaneTargets).length
                                ? mitomaneTargets[target.id] : mitomaneTarget;
                              const realRoleId = (target.role === 'mitomane' && suoTarget)
                                ? pStates[suoTarget]?.role
                                : target.role;
                              const realTeam = ROLES[realRoleId]?.team;
                              teamHint = realTeam === 'lupi' ? t('gameMaster.wolfReveal') : t('gameMaster.villageReveal');
                            }
                            return (
                              <div key={vid} className="flex justify-between items-center text-xs">
                                <span className="text-gray-300">{voter.name}</span>
                                <span className="text-white mx-2">➔</span>
                                <span className="font-bold text-white px-2 py-0.5 rounded" style={{background:'rgba(255,255,255,0.1)'}}>
                                  {target.name}{teamHint ? <span className="ml-1 text-yellow-300">{teamHint}</span> : null}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      <button onClick={clearVotes} className="text-gray-500 text-[10px] underline mt-3 hover:text-white">{t('gameMaster.clearChoices')}</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Timer */}
            <div className="sticky-bottom-bar flex items-center justify-between gap-4">
              <Timer
                seconds={timer} total={timerTotal} running={timerOn}
                onToggle={()=>setTimerOn(v=>!v)}
                onReset={()=>{setTimer(timerTotal);setTimerOn(false);}}
                onEdit={()=>{setTimerInput(String(Math.floor(timer/60)));setShowTimerEdit(true);}}
              />
              <div className="flex flex-col gap-2 flex-1">
                <button onClick={processNightStep} className="btn-night w-full py-4 rounded-2xl text-sm font-bold shadow-lg">
                  {nightStep<activeNightSteps.length-1?t('gameMaster.nextStep'):t('gameMaster.goToDay')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== DAWN REVEAL ===================== */}
        {phase==='dawn_reveal' && (
          <div className="anim-fade-up">
            <div className="glass rounded-2xl p-5 mb-4 text-center">
              <span className="text-4xl mb-2 block">🌅</span>
              <p className="font-cinzel text-white text-lg font-bold mb-2">{t('gameMaster.dawnRises')}</p>
              <p className="text-gray-400 text-sm">{t('gameMaster.villageWaking')}</p>
            </div>
            {/* Info GM — visibili solo qui, non parlate */}
            {dawnInfo && (
              <div className="glass rounded-2xl p-4 mb-4 flex flex-col gap-2 text-sm">
                {dawnInfo.victimId && (
                  <p>🐺 <span className="text-white font-bold">{pStates[dawnInfo.victimId]?.name}</span> <span className="text-gray-400">{t('gameMaster.killedByWolves')}</span></p>
                )}
                {dawnInfo.poisonVictimId && (
                  <p>☠️ <span className="text-white font-bold">{pStates[dawnInfo.poisonVictimId]?.name}</span> <span className="text-gray-400">{t('gameMaster.poisonedByWitch')}</span></p>
                )}
                {dawnInfo.stregaHealed && (
                  <p>💚 <span className="text-gray-400">{t('gameMaster.witchUsedHeal')}</span></p>
                )}
                {dawnInfo.figlioTransformed && (
                  <p>🐺 <span className="text-gray-400">{t('gameMaster.wolfChildTransformed')}</span></p>
                )}
                {dawnInfo.mediumResults?.map((m, mi) => (
                  <p key={mi}>👁️ {dawnInfo.mediumResults.length > 1 && m.medium && (
                    <span className="text-gray-500">{m.medium}: </span>
                  )}<span className="text-white font-bold">{m.name}</span> <span className="text-gray-400">{t('gameMaster.mediumSaw')}</span> <span className="text-white">{m.role?.icon} {m.role?.name}</span></p>
                ))}
                {dawnInfo.loveVictims?.length > 0 && (
                  <p>💔 <span className="text-white font-bold">
                    {dawnInfo.loveVictims.map(id => pStates[id]?.name).filter(Boolean).join(getLang()==='en'?' and ':' e ')}
                  </span> <span className="text-gray-400">{t('gameMaster.diedOfGrief')}</span></p>
                )}
                {dawnInfo.sciamanoResult && (
                  <p>🪬 <span className="text-white font-bold">{dawnInfo.sciamanoResult}</span> <span className="text-gray-400">{t('gameMaster.shamanRevived')}</span></p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===================== DAY ===================== */}
        {phase==='day' && (
          <div className="anim-fade-up">

            {/* Riepilogo della notte appena passata: dawnInfo non viene più azzerato al
                passaggio al giorno, così il narratore può ancora raccontare o rispondere
                a "chi è morto?" senza riaprire la cronaca. */}
            {dawnInfo && (dawnInfo.victimId || dawnInfo.poisonVictimId || dawnInfo.loveVictims?.length || dawnInfo.sciamanoResult) && (
              <div className="glass rounded-2xl p-4 mb-4 flex flex-col gap-1.5 text-sm">
                <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-1">{t('gameMaster.phaseDawn')}</p>
                {dawnInfo.victimId && (
                  <p>🐺 <span className="text-white font-bold">{pStates[dawnInfo.victimId]?.name}</span> <span className="text-gray-400">{t('gameMaster.killedByWolves')}</span></p>
                )}
                {dawnInfo.poisonVictimId && (
                  <p>☠️ <span className="text-white font-bold">{pStates[dawnInfo.poisonVictimId]?.name}</span> <span className="text-gray-400">{t('gameMaster.poisonedByWitch')}</span></p>
                )}
                {dawnInfo.loveVictims?.length > 0 && (
                  <p>💔 <span className="text-white font-bold">
                    {dawnInfo.loveVictims.map(id => pStates[id]?.name).filter(Boolean).join(getLang()==='en'?' and ':' e ')}
                  </span> <span className="text-gray-400">{t('gameMaster.diedOfGrief')}</span></p>
                )}
                {dawnInfo.sciamanoResult && (
                  <p>🪬 <span className="text-white font-bold">{dawnInfo.sciamanoResult}</span> <span className="text-gray-400">{t('gameMaster.shamanRevived')}</span></p>
                )}
              </div>
            )}

            {/* Sollecito votazione */}
            {votePrompt && (
              <div className="glass rounded-2xl p-4 mb-4 text-center anim-fade-up"
                   style={{border:'2px solid rgba(220,38,38,0.5)', background:'rgba(220,38,38,0.08)'}}>
                <p className="text-3xl mb-1">🗳️</p>
                <p className="font-cinzel text-white font-bold text-base mb-1">{t('gameMaster.timeUp')}</p>
                <p className="text-gray-400 text-sm mb-3">{t('gameMaster.villageShouldVote')}</p>
                <button
                  onClick={() => {
                    setVotePrompt(false);
                    setTimer(0); setTimerOn(false);
                    setNarrationAndPhase('voting', t('narration.votingStart'), null, {}, 'voting_start');
                  }}
                  className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-95"
                  style={{background:'rgba(220,38,38,0.2)', border:'1px solid rgba(220,38,38,0.5)', color:'#f87171'}}>
                  {t('gameMaster.startVoting')}
                </button>
              </div>
            )}

            <div className="glass rounded-2xl p-4 mb-4">
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-3 text-center">{t('gameMaster.debateTimeLeft')}</p>

              {/* Countdown circolare semplificato */}
              <div className="flex items-center justify-center mb-3">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5"/>
                    <circle cx="18" cy="18" r="15.9" fill="none"
                      stroke={timer < 30 ? '#f87171' : timer < 60 ? '#fbbf24' : '#e2c97e'}
                      strokeWidth="2.5" strokeDasharray="100" strokeLinecap="round"
                      className="timer-path"
                      strokeDashoffset={timerTotal > 0 ? 100 - (timer / timerTotal * 100) : 100}/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`font-cinzel font-bold text-xl leading-none ${timer<30?'text-red-400':timer<60?'text-yellow-400':'text-moon'}`}>
                      {String(Math.floor(timer/60)).padStart(2,'0')}:{String(timer%60).padStart(2,'0')}
                    </span>
                    <span className="text-gray-600 text-[9px] mt-0.5">{timerOn ? t('gameMaster.running') : t('gameMaster.paused')}</span>
                  </div>
                </div>
              </div>

              {/* Controlli */}
              <div className="flex gap-2 mb-3">
                <button onClick={()=>setTimerOn(v=>!v)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                  style={{background:timerOn?'rgba(248,113,113,0.1)':'rgba(74,222,128,0.1)',
                          border:`1px solid ${timerOn?'rgba(248,113,113,0.3)':'rgba(74,222,128,0.3)'}`,
                          color:timerOn?'#f87171':'#4ade80'}}>
                  {timerOn ? t('gameMaster.pause') : t('gameMaster.play')}
                </button>
                <button onClick={()=>{setTimer(dayTimerMins*60);setTimerTotal(dayTimerMins*60);setTimerOn(false);setVotePrompt(false);}}
                  className="px-4 py-2.5 rounded-xl text-sm text-gray-400 transition-all active:scale-95"
                  style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)'}}>
                  ↺
                </button>
              </div>

              {/* Durata rapida */}
              <div className="flex gap-1.5 mb-1">
                <p className="text-gray-600 text-[10px] self-center mr-1">{t('gameMaster.duration')}</p>
                {[3,5,8,10].map(m=>(
                  <button key={m}
                    onClick={()=>{ setDayTimerMins(m); localStorage.setItem('lif_day_timer',String(m)); setTimer(m*60); setTimerTotal(m*60); setTimerOn(false); setVotePrompt(false); }}
                    className="flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95"
                    style={dayTimerMins===m
                      ? {background:'rgba(226,201,126,0.2)',border:'1px solid rgba(226,201,126,0.4)',color:'#e2c97e'}
                      : {background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',color:'#6b7280'}}>
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            {/* Vai al voto manuale test */}
            <div className="sticky-bottom-bar">
              <button
                onClick={() => {
                  setVotePrompt(false); setTimer(0); setTimerOn(false);
                  setNarrationAndPhase('voting', t('narration.votingStart'), null, {}, 'voting_start');
                }}
                className="btn-danger w-full py-4 rounded-2xl font-bold text-sm">
                {t('gameMaster.voteNowBtn')}
              </button>
            </div>
          </div>
        )}

        {/* ===================== VOTING ===================== */}
        {phase==='voting' && (
          <div className="anim-fade-up">
            <div className="glass rounded-2xl p-4 mb-4 flex flex-col items-center">
              <p className="font-cinzel text-white text-lg font-bold mb-3">{t('gameMaster.votingInProgress')}</p>
              <p className="text-gray-400 text-sm mb-4">{t('gameMaster.votesOutOf', {n: Object.keys(dayVotes).length, total: alivePlayers.length})}</p>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full transition-all"
                     style={{width:`${(Object.keys(dayVotes).length/Math.max(1, alivePlayers.length))*100}%`}}/>
              </div>
              <p className="text-gray-500 text-xs italic mt-3">{t('gameMaster.voteResolvesAuto')}</p>
            </div>
          </div>
        )}

        {/* ===================== ENDED ===================== */}
        {phase==='ended' && (
          <div className="anim-fade-up py-6">
            {/* Titolo vincitore */}
            <div className="text-center mb-5">
              <div className="text-6xl mb-3" style={{filter:'drop-shadow(0 0 20px gold)'}}>
                {winner==='lupi'?'🐺':winner==='amore'?'💘':'🌾'}
              </div>
              <h3 className="font-cinzel text-2xl font-bold text-moon mb-1 win-glow">
                {winner==='lupi'?t('gameMaster.winnersLupi'):winner==='amore'?t('gameMaster.winnersAmore'):t('gameMaster.winnersVillaggio')}
              </h3>
              {/* La partita finisce di giorno o all'alba: vale la giornata in corso, non la notte successiva */}
              <p className="text-gray-500 text-sm">{t('gameMaster.matchNumDay', {id: gameId, day: currentDayNum})}</p>
            </div>

            {/* Recap narrativo */}
            {(()=>{
              const allPlayers = Object.values(pStates);
              const wolves     = allPlayers.filter(p=>ROLES[p.role]?.team==='lupi');
              const villagers  = allPlayers.filter(p=>ROLES[p.role]?.team==='villaggio' && p.role!=='villico');
              const dead       = allPlayers.filter(p=>!p.alive);
              const survivors  = allPlayers.filter(p=>p.alive);

              const winReason = winner==='lupi'
                ? t('gameMaster.winReasonLupi', {names: wolves.map(p=>p.name).join(', ')})
                : winner==='amore'
                ? t('gameMaster.winReasonAmore')
                : wolves.length===0
                ? t('gameMaster.winReasonVillaggio', {names: wolves.map(p=>p.name).join(', ') || t('gameMaster.winReasonVillaggioFallback')})
                : t('gameMaster.winReasonVillaggioGeneric');

              return (
                <div className="rounded-2xl p-4 mb-4 text-left"
                     style={{background:'rgba(226,201,126,0.05)', border:'1px solid rgba(226,201,126,0.15)'}}>
                  <p className="text-moon text-xs font-bold uppercase tracking-widest mb-2">{t('gameMaster.howItWent')}</p>
                  <p className="text-gray-300 text-sm leading-relaxed mb-3">{winReason}</p>

                  {survivors.length > 0 && (
                    <div className="mb-2">
                      <p className="text-green-400 text-[10px] uppercase tracking-widest mb-1.5">{t('gameMaster.survivors')}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {survivors.map(p=>{
                          const r=ROLES[p.role];
                          return <span key={p.id} className="text-xs px-2 py-0.5 rounded-full font-bold"
                                   style={{background:r?.color+'22',border:`1px solid ${r?.color}44`,color:'#fff'}}>
                            {r?.icon} {p.name} <span style={{color:r?.color}}>({r?.name})</span>
                          </span>;
                        })}
                      </div>
                    </div>
                  )}
                  {dead.length > 0 && (
                    <div>
                      <p className="text-red-400 text-[10px] uppercase tracking-widest mb-1.5 mt-2">{t('gameMaster.eliminated')}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {dead.map(p=>{
                          const r=ROLES[p.role];
                          return <span key={p.id} className="text-xs px-2 py-0.5 rounded-full opacity-70"
                                   style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#9ca3af'}}>
                            💀 {p.name} <span style={{color:r?.color+'cc'}}>({r?.name})</span>
                          </span>;
                        })}
                      </div>
                    </div>
                  )}
                  {villagers.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-1.5">{t('gameMaster.specialRolesPresent')}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {villagers.map(p=>{
                          const r=ROLES[p.role];
                          return <span key={p.id} className="text-[11px] px-2 py-0.5 rounded-full"
                                   style={{background:r?.color+'18',border:`1px solid ${r?.color}33`,color:r?.color}}>
                            {r?.icon} {p.name}
                          </span>;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Scoreboard compatto */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {Object.values(pStates).map(p=>{
                const r=ROLES[p.role];
                return (
                  <div key={p.id} className="rounded-xl p-2.5 text-center"
                       style={{background:r?.color+'1a', border:`1px solid ${r?.color}33`,
                               opacity:p.alive?1:0.4, filter:p.alive?'':'grayscale(0.5)'}}>
                    <div className="text-xl mb-0.5">{p.alive?r?.icon:'💀'}</div>
                    <p className="text-white text-xs font-bold truncate">{p.name}</p>
                    <p className="text-[10px] font-bold" style={{color:r?.color+'cc'}}>{r?.name}</p>
                  </div>
                );
              })}
            </div>

            {/* Rivincita rapida */}
            <button onClick={()=>{
                const narratorP = players.find(p => p.isNarrator);
                const setup = {
                  playerNames: players.filter(p => !p.isNarrator).map(p => p.name),
                  wolfCount: players.filter(p => p.role === 'lupo').length,
                  allRoles: players.map(p => p.role).filter(r => r !== 'lupo'),
                  narratorName: narratorP ? narratorP.name : null,
                };
                onEndGame({ winner, gameId, date:new Date().toISOString(), players:Object.values(pStates) }, setup);
              }}
              className="w-full py-4 rounded-2xl text-base font-bold mb-3 transition-all active:scale-95"
              style={{background:'rgba(226,201,126,0.12)', border:'1px solid rgba(226,201,126,0.35)', color:'#e2c97e'}}>
              {t('gameMaster.rematch')}
            </button>
            <button onClick={()=>{
                onEndGame({ winner, gameId, date:new Date().toISOString(), players:Object.values(pStates) }, null);
              }}
              className="btn-gold w-full py-4 rounded-2xl text-base">
              {t('gameMaster.saveAndHome')}
            </button>
          </div>
        )}

        {/* ===================== PLAYER LIST (always shown) ===================== */}
        {!['waiting','ended'].includes(phase) && (
          <div className="mt-5">
            <p className="text-gray-600 text-xs uppercase tracking-wider mb-2">
              {t('gameMaster.playersAliveDead', {alive: alivePlayers.length, dead: deadPlayers.length})}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(pStates).map(p=>{
                return (
                  <div key={p.id}
                    className={`rounded-xl p-2 text-center transition-all ${!p.alive?'opacity-50 grayscale':''}`}
                    style={{background:'rgba(255,255,255,0.05)', border:`1px solid rgba(255,255,255,${p.alive?'0.1':'0.05'})`}}>
                    <div className="text-xl mb-1">{p.alive?'👤':'💀'}</div>
                    <p className="text-xs text-white font-bold truncate">{p.name}</p>
                  </div>
                );
              })}
            </div>

            {/* Quick actions */}
            {(phase==='day'||phase==='voting') && (
              <div className="mt-3">
                <p className="text-gray-600 text-xs uppercase tracking-wider mb-2">{t('gameMaster.eliminateManually')}</p>
                <div className="flex flex-wrap gap-2">
                  {alivePlayers.map(p=>(
                    <button key={p.id}
                      onClick={()=>{
                        const w = eliminate(p.id);
                        if(!w){
                          setNarration(t('gameMaster.eliminatedWasLine', {name: p.name, icon: ROLES[p.role]?.icon, role: ROLES[p.role]?.name}));
                          if(phase==='voting') goNight();
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                      style={{background:'rgba(139,26,26,0.2)', border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5'}}>
                      💀 {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Timer edit modal */}
      {showTimerEdit && (
        <div className="modal-backdrop" onClick={()=>setShowTimerEdit(false)}>
          <div className="modal-box p-6 glass" style={{maxWidth:280, background:'#0d1117', border:'1px solid rgba(226,201,126,0.2)'}}>
            <h4 className="font-cinzel text-moon font-bold mb-4">{t('gameMaster.setTimer')}</h4>
            <div className="flex gap-2 mb-4">
              {[1,2,3,5,8,10].map(m=>(
                <button key={m} onClick={()=>{setTimer(m*60);setTimerTotal(m*60);setTimerOn(false);setShowTimerEdit(false);}}
                  className="flex-1 py-2 rounded-lg text-sm font-bold glass text-white hover:text-moon transition-colors">
                  {m}m
                </button>
              ))}
            </div>
            <button onClick={()=>setShowTimerEdit(false)} className="w-full py-3 rounded-xl btn-ghost text-sm">{t('common.close')}</button>
          </div>
        </div>
      )}

      {/* Avviso: un Mitomane ha imitato un altro Mitomane e resta tale.
          Senza dirlo, il narratore avrebbe un giocatore con un ruolo che il resto
          delle regole considera impossibile, e non capirebbe perché. */}
      {mitomaneFallito?.length > 0 && (
        <div className="modal-backdrop" onClick={() => setMitomaneFallito(null)}>
          <div className="modal-box p-6 glass" style={{background:'#0d1117', border:'1px solid rgba(156,39,176,0.45)'}}
               onClick={e=>e.stopPropagation()}>
            <h4 className="font-cinzel text-purple-300 font-bold mb-3 text-lg">🎭 {t('gameMaster.mitomaneFailedTitle')}</h4>
            <p className="text-gray-300 text-sm mb-4">
              {t('gameMaster.mitomaneFailedBody', {names: mitomaneFallito.join(', ')})}
            </p>
            <button onClick={() => setMitomaneFallito(null)} className="btn-gold w-full py-3 rounded-xl text-sm">
              {t('gameMaster.understood')}
            </button>
          </div>
        </div>
      )}

      {/* ===== MODAL CUPIDO: scegli il secondo innamorato ===== */}
      {showCupidoModal && (
        <div className="modal-backdrop">
          <div className="modal-box p-6 glass" style={{background:'#0d1117', border:'1px solid rgba(233,30,99,0.4)'}}>
            <h4 className="font-cinzel text-pink-400 font-bold mb-2 text-lg">{t('gameMaster.cupidoSecondLoverTitle')}</h4>
            <p className="text-gray-300 text-sm mb-1">
              <strong className="text-white">{pStates[showCupidoModal]?.name}</strong> {t('gameMaster.cupidoFirstLoverIs')}
            </p>
            <p className="text-gray-400 text-xs mb-4">{t('gameMaster.cupidoChooseSecond')}</p>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {Object.values(pStates).filter(p=>p.alive && p.id !== showCupidoModal).map(p=>(
                <button key={p.id}
                  onClick={()=>{
                    const newLovers = linkLovers(showCupidoModal, p.id);
                    setLovers(newLovers);
                    fbUpdate({lovers: newLovers});
                    setShowCupidoModal(null);
                    // I voti vanno ripuliti PRIMA di riavviare processNightStep: il ramo
                    // Cupido esce senza avanzare quando trova un id singolo, quindi
                    // rientrando sugli stessi voti riaprirebbe questa modale all'infinito.
                    setNightVotes({});
                    if (db && gameId) db.ref(`games/${gameId}/nightVotes`).remove();
                    setNightDecisions(prev => ({ ...prev, cupido: `${showCupidoModal},${p.id}` }));
                    setActionPulse('processNightStep');
                  }}
                  className="p-3 rounded-xl text-left flex items-center gap-3 hover:bg-white/10 transition-all"
                  style={{background:'rgba(233,30,99,0.1)', border:'1px solid rgba(233,30,99,0.2)'}}>
                  <span className="text-xl">{ROLES[p.role]?.icon}</span>
                  <span className="font-bold text-white">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL CACCIATORE: sceglie chi portare con sé ===== */}
      {showHunterModal && (
        <div className="modal-backdrop">
          <div className="modal-box p-6 glass" style={{background:'#0d1117', border:'1px solid rgba(121,85,72,0.5)'}}>
            <h4 className="font-cinzel text-amber-600 font-bold mb-2 text-lg">{t('gameMaster.hunterShootsTitle')}</h4>
            <p className="text-gray-300 text-sm mb-4">{t('gameMaster.hunterShootsBody')}</p>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {alivePlayers.map(p=>(
                <button key={p.id}
                  onClick={()=>{
                    setShowHunterModal(false);
                    eliminate(p.id, false);
                  }}
                  className="p-3 rounded-xl text-left flex items-center gap-3 hover:bg-white/10 transition-all"
                  style={{background:'rgba(121,85,72,0.15)', border:'1px solid rgba(121,85,72,0.3)'}}>
                  <span className="text-xl">{ROLES[p.role]?.icon}</span>
                  <span className="font-bold text-white">{p.name}</span>
                </button>
              ))}
            </div>
            <button onClick={()=>setShowHunterModal(false)}
              className="w-full mt-3 py-2 rounded-xl btn-ghost text-sm text-gray-500">
              {t('gameMaster.hunterPass')}
            </button>
          </div>
        </div>
      )}

      {/* ===== BOTTONE 🎭 "La mia scheda" (solo se narratore gioca) ===== */}
      {(() => {
        const narratorP = Object.values(pStates).find(p => p.isNarrator);
        if (!narratorP || phase === 'waiting') return null;
        const myRole = ROLES[narratorP.role];
        // Il narratore-giocatore vota da dentro la sua scheda: senza un richiamo esplicito
        // sul FAB sembra che non possa votare affatto.
        const needsDayVote   = narratorP.alive && phase === 'voting'
                               && !narratorLocalVote && !dayVotes[narratorP.id];
        const needsNightVote = narratorP.alive && phase === 'night'
                               && activeNightSteps[nightStep]?.roleId === narratorP.role
                               && !narratorLocalVote && !nightVotes[narratorP.id];
        const needsAction = needsDayVote || needsNightVote;
        const fabColor = needsAction ? '#ef4444' : (myRole?.color || '#e2c97e');
        return (
          <>
            {/* FAB fisso bottom-right */}
            <button
              onClick={() => setShowMyCard(true)}
              className={`fixed bottom-24 right-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full transition-all active:scale-95 shadow-lg ${needsAction ? 'anim-pulse' : ''}`}
              style={{background: needsAction ? 'rgba(239,68,68,0.22)' : 'rgba(13,17,23,0.95)',
                      border:`1px solid ${fabColor}${needsAction ? 'cc' : '55'}`,
                      boxShadow:`0 0 ${needsAction ? '26px' : '16px'} ${fabColor}${needsAction ? '77' : '22'}`}}>
              <span className="text-lg leading-none">{needsAction ? '🗳️' : (myRole?.icon || '🎭')}</span>
              <span className="text-xs font-bold" style={{color: needsAction ? '#fff' : fabColor}}>
                {needsDayVote ? t('gameMaster.fabVoteNow')
                  : needsNightVote ? t('gameMaster.fabYourTurn')
                  : t('gameMaster.myRoleFab')}
              </span>
            </button>

            {/* Overlay scheda personaggio — NESSUN LOG VISIBILE */}
            {showMyCard && (
              <div className="fixed inset-0 z-50 flex flex-col"
                   style={{background:'#0b0a14'}}>
                {/* Header */}
                <div className="flex items-center gap-3 px-4 pt-safe pt-5 pb-4"
                     style={{background:'rgba(13,17,23,0.97)', borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                  <button onClick={() => setShowMyCard(false)}
                    className="text-gray-500 hover:text-white text-2xl leading-none transition-colors">←</button>
                  <div className="flex-1">
                    <h2 className="font-cinzel text-moon font-bold text-base leading-none">{t('gameMaster.myCardTitle')}</h2>
                    <p className="text-gray-600 text-xs mt-0.5">{narratorP.name}</p>
                  </div>
                  {/* Stato vita */}
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${narratorP.alive ? 'text-green-400' : 'text-red-400'}`}
                        style={{background: narratorP.alive ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                                border: `1px solid ${narratorP.alive ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`}}>
                    {narratorP.alive ? t('gameMaster.alive') : t('gameMaster.eliminatedBadge')}
                  </span>
                </div>

                {/* Contenuto */}
                <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col items-center">

                  {/* Fase attuale — info minima */}
                  <div className="w-full max-w-sm rounded-2xl px-4 py-3 text-center mb-4"
                       style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)'}}>
                    <p className="text-gray-500 text-xs">{t('gameMaster.currentPhase')}</p>
                    <p className="text-white text-sm font-semibold mt-0.5 font-cinzel capitalize">
                      {phase === 'night' ? t('gameMaster.phaseNight') : phase === 'day' ? t('gameMaster.phaseDay') : phase === 'voting' ? t('gameMaster.phaseVoting') : phase === 'dawn_reveal' ? t('gameMaster.phaseDawn') : phase === 'role_reveal' ? t('gameMaster.phaseRoleReveal') : '⏳ ' + phase}
                    </p>
                  </div>

                  {/* ── AZIONE NOTTE: vota se è il proprio turno ── */}
                  {narratorP.alive && phase === 'night' && activeNightSteps[nightStep]?.roleId === narratorP.role && (() => {
                    const myVote = narratorLocalVote || nightVotes[narratorP.id];
                    const castNarratorNightVote = (targetId) => {
                      if (narratorLocalVote || nightVotes[narratorP.id]) return;
                      window.haptic('select');
                      setNarratorLocalVote(targetId);
                      db.ref(`games/${gameId}/nightVotes/${narratorP.id}`).set(targetId);
                    };
                    if (myVote) {
                      // Veggente: mostra l'allineamento del giocatore osservato
                      let veggResult = null;
                      if (narratorP.role === 'veggente' && pStates[myVote]) {
                        const targetP = pStates[myVote];
                        const suoTarget = Object.keys(mitomaneTargets).length
                          ? mitomaneTargets[myVote] : mitomaneTarget;
                        const realRoleId = (targetP.role === 'mitomane' && suoTarget)
                          ? pStates[suoTarget]?.role
                          : targetP.role;
                        const isWolf = ROLES[realRoleId]?.team === 'lupi';
                        veggResult = (
                          <div className="mt-3 rounded-xl px-4 py-3 text-center"
                               style={{background: isWolf ? 'rgba(192,57,43,0.18)' : 'rgba(39,174,96,0.18)',
                                       border: `1px solid ${isWolf ? 'rgba(192,57,43,0.45)' : 'rgba(39,174,96,0.45)'}`}}>
                            <p className="text-white text-xs font-bold mb-0.5">{targetP.name}</p>
                            <p className="font-cinzel font-bold text-base" style={{color: isWolf ? '#e74c3c' : '#2ecc71'}}>
                              {isWolf ? t('gameMaster.isWolfReveal') : t('gameMaster.isVillageReveal')}
                            </p>
                          </div>
                        );
                      }
                      return (
                        <div className="w-full max-w-sm rounded-2xl px-4 py-4 text-center mb-4"
                             style={{background:`${myRole?.color || '#555'}18`, border:`1px solid ${myRole?.color || '#555'}44`}}>
                          <p className="text-white text-sm font-bold">{t('gameMaster.voteSent')}</p>
                          <p className="text-gray-500 text-xs mt-1">{t('gameMaster.waitingNarratorAdvance')}</p>
                          {veggResult}
                        </div>
                      );
                    }
                    // La Strega sceglie fra i VIVI (veleno), Medium e Sciamano fra i MORTI:
                    // mostrare sempre i vivi rendeva impossibile al narratore giocare
                    // quei ruoli, e per la Strega trasformava ogni tocco in un veleno.
                    const suiMorti = narratorP.role === 'medium' || narratorP.role === 'sciamano';
                    const scelte = Object.entries(pStates).filter(([id, p]) =>
                      (suiMorti ? !p.alive : p.alive) && id !== narratorP.id);
                    const isStrega = narratorP.role === 'strega';
                    const puoPassare = isStrega || narratorP.role === 'sciamano' || narratorP.role === 'medium';
                    return (
                      <div className="w-full max-w-sm mb-4">
                        <div className="rounded-2xl p-4 mb-3"
                             style={{background:`${myRole?.color || '#555'}18`, border:`1px solid ${myRole?.color || '#555'}44`}}>
                          <p className="font-cinzel font-bold text-white text-sm mb-1">
                            <span className="text-lg mr-1">{myRole?.icon}</span> {t('gameMaster.yourTurn')}
                          </p>
                          <p className="text-gray-400 text-xs">{t('gameMaster.chooseSilently')}</p>
                        </div>
                        {isStrega && (
                          <button onClick={() => castNarratorNightVote('HEAL')}
                            className="w-full p-4 mb-3 rounded-2xl flex justify-between items-center touch-manipulation transition-all active:scale-95 shadow-lg"
                            style={{background:'rgba(22,163,74,0.18)', border:'2px solid rgba(22,163,74,0.55)'}}>
                            <span className="font-bold text-white text-lg pr-4">💚 {t('gameMaster.witchHealAction')}</span>
                          </button>
                        )}
                        <div className="flex flex-col gap-3">
                          {scelte.length === 0 && (
                            <p className="text-gray-500 text-xs text-center py-2">{t('gameMaster.noTargets')}</p>
                          )}
                          {scelte.map(([id, p]) => (
                            <button key={id}
                              onClick={() => castNarratorNightVote(id)}
                              className="w-full p-4 rounded-2xl flex justify-between items-center bg-white/10 touch-manipulation transition-all active:scale-95 shadow-lg"
                              style={{border:`2px solid rgba(255,255,255,0.2)`, pointerEvents:'auto', zIndex:999}}>
                              <span className="font-bold text-white text-xl pr-4">{suiMorti ? '💀 ' : ''}{p.name}</span>
                              <div className="w-10 h-10 rounded-full border-2 border-white/40"></div>
                            </button>
                          ))}
                        </div>
                        {puoPassare && (
                          <button onClick={() => castNarratorNightVote('PASS')}
                            className="w-full mt-3 py-3 rounded-xl text-sm font-bold text-gray-400"
                            style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)'}}>
                            {t('gameMaster.passTurn')}
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  {/* ── AZIONE GIORNO: vota durante la votazione ── */}
                  {narratorP.alive && phase === 'voting' && (() => {
                    const myDayVote = narratorLocalVote || dayVotes[narratorP.id];
                    const castNarratorDayVote = (targetId) => {
                      window.haptic('select');
                      setNarratorLocalVote(targetId);
                      db.ref(`games/${gameId}/dayVotes/${narratorP.id}`).set(targetId);
                    };
                    const alivePlayers = Object.entries(pStates).filter(([id, p]) => p.alive && id !== narratorP.id);
                    return (
                      <div className="w-full max-w-sm mb-4">
                        <div className="rounded-2xl p-4 mb-3"
                             style={{background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.35)'}}>
                          <p className="font-cinzel font-bold text-white text-sm mb-1">{t('gameMaster.voteCondemn')}</p>
                          <p className="text-gray-400 text-xs">{t('gameMaster.tapToVote')}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                          {alivePlayers.map(([id, p]) => {
                            const isSel = myDayVote === id;
                            return (
                              <button key={id}
                                onClick={() => castNarratorDayVote(id)}
                                className={`w-full p-4 rounded-2xl flex justify-between items-center touch-manipulation transition-all active:scale-95 shadow-lg ${isSel ? 'bg-white/40 scale-[1.02]' : 'bg-white/10'}`}
                                style={{border: isSel ? '4px solid #ef4444' : '3px solid rgba(255,255,255,0.2)',
                                        boxShadow: isSel ? '0 0 35px rgba(239,68,68,0.7)' : 'none',
                                        pointerEvents:'auto', zIndex:999}}>
                                <span className="font-bold text-white text-xl pr-4">{p.name}</span>
                                {isSel ? <span className="text-3xl">🔥</span> : <div className="w-10 h-10 rounded-full border-2 border-white/40"></div>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Card ruolo — in fondo, compatta */}
                  <div className="w-full max-w-sm rounded-2xl p-4 mt-2 mb-2"
                       style={{background:`linear-gradient(145deg, ${myRole?.color || '#333'}14, ${myRole?.color || '#333'}06)`,
                               border:`1px solid ${myRole?.color || '#555'}33`}}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-4xl leading-none"
                            style={{filter:`drop-shadow(0 0 10px ${myRole?.color || '#fff'}55)`}}>
                        {myRole?.icon || '❓'}
                      </span>
                      <div>
                        <h3 className="font-cinzel text-white font-bold text-base leading-tight">{myRole?.name || '—'}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                              style={{background:`${myRole?.color || '#555'}22`,
                                      border:`1px solid ${myRole?.color || '#555'}44`,
                                      color: myRole?.color || '#aaa'}}>
                          {myRole?.team === 'lupi' ? t('teamBadge.lupi') : t('teamBadge.villaggio')}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">{myRole?.description}</p>
                    {myRole?.tip && (
                      <p className="text-white/30 text-[10px] italic mt-2">💡 {myRole.tip}</p>
                    )}
                  </div>

                  <p className="text-gray-700 text-xs mt-2 mb-1 text-center italic">
                    {t('gameMaster.matchLogHidden')}
                  </p>
                </div>

                {/* Bottone torna */}
                <div className="px-4 pb-safe pb-6 pt-3"
                     style={{background:'rgba(13,17,23,0.97)', borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                  <button onClick={() => setShowMyCard(false)}
                    className="btn-gold w-full py-4 rounded-2xl text-base">
                    {t('gameMaster.backToPanel')}
                  </button>
                </div>
              </div>
            )}
          </>
        );
      })()}

      <PaywallModal
        packId={paywallPack}
        onClose={() => !isPurchasing && setPaywallPack(null)}
        onPurchase={async (packId) => {
          if (packId === '_open_combo') { setPaywallPack('combo'); return; }
          const result = await purchasePackage(packId);
          if (result?.success) setPaywallPack(null);
        }}
        isPurchasing={isPurchasing}
      />
    </div>
  );
}

/* ================================================================
   PLAYER SCREEN (each player's device)
   ================================================================ */
function PlayerScreen({gameId, playerId}) {
  const user = useAuth();
  const [gameData, setGameData] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [markedReady, setMarkedReady] = useState(false);
  const [localVote, setLocalVote] = useState(null);
  const [debugLog, setDebugLog] = useState('');
  const [error, setError] = useState(null);
  const [deviceConflict, setDeviceConflict] = useState(false); // token QR di un altro dispositivo
  const [showPack, setShowPack] = useState(false); // elenco lupi scoperto di giorno
  const [loverDraft, setLoverDraft] = useState(null); // primo innamorato scelto, non ancora confermato
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const [showRolesInGame, setShowRolesInGame] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Helper per log
  const contextLog = (msg) => { console.log(msg); };

  // Salva sessione per recupero (se chiude per sbaglio)
  useEffect(() => {
    if (gameId && playerId) {
      localStorage.setItem('lif_rejoin', JSON.stringify({ gameId, playerId, savedAt: Date.now() }));
    }
  }, [gameId, playerId]);

  useEffect(()=>{
    if(!gameId || !playerId) { setError(t('player.invalidLink')); return; }
    if(!db){
      // Demo mode without Firebase
      setGameData({ phase:'role_reveal', players:{ [playerId]:{ name: getLang()==='en'?'Player':'Giocatore', role:'villico', alive:true, ready:false } } });
      return;
    }

    const deviceToken = getDeviceToken(gameId);

    const ref = db.ref(`games/${gameId}`);
    ref.on('value', snap=>{
      const data = snap.val();
      if(!data){ setError(t('player.gameNotFound')); return; }

      // Controllo esclusività QR
      const playerInfo = data.players?.[playerId];
      if (playerInfo) {
        if (!playerInfo.deviceToken) {
          db.ref(`games/${gameId}/players/${playerId}/deviceToken`).set(deviceToken);
        } else if (playerInfo.deviceToken !== deviceToken) {
          setError(t('player.deviceStolenWarning'));
          setDeviceConflict(true); // sblocca il pulsante "continua qui" invece di lasciare un vicolo cieco
          return;
        }
      }

      setGameData(data);
    });
    return ()=>ref.off();
  },[gameId, playerId]);

  const markReady = ()=>{
    if(markedReady) return;
    setMarkedReady(true);
    window.haptic('medium');
    if(db && gameId && playerId) {
      db.ref(`games/${gameId}/players/${playerId}/ready`).set(true);
      window.playSfx('night'); // Unlock audio context
    }
  };

  // Spostiamo il calcolo di player e phase prima degli handler per sicurezza di scope
  const player = gameData?.players?.[playerId];
  const phase = gameData?.phase || 'waiting';
  const role = player ? ROLES[player.role] : null;
  // Il Mitomane e il Figlio dei Lupi cambiano ruolo a partita in corso: senza un avviso
  // esplicito la carta cambierebbe sotto gli occhi del giocatore senza spiegazioni.
  const transformedFrom = player?.originalRole ? ROLES[player.originalRole] : null;

  const castVote = (targetId) => {
    if (localVote || gameData?.nightVotes?.[playerId]) return;
    contextLog('Tentativo voto notte -> ' + targetId);
    if(!db || !gameId || !playerId || !player?.alive || phase!=='night') {
      contextLog('Voto respinto: ' + (!player?.alive ? 'morto' : 'fase errata ('+phase+')'));
      return;
    }
    window.haptic('select');
    setLocalVote(targetId);
    db.ref(`games/${gameId}/nightVotes/${playerId}`).set(targetId)
      .then(()=>contextLog('Voto salvato su FB!'))
      .catch(e=>contextLog('Errore FB: ' + e.message));
  };

  const castDayVote = (targetId) => {
    contextLog('Tentativo voto giorno -> ' + targetId);
    if(!db || !gameId || !playerId || !player?.alive || phase!=='voting') return;
    window.haptic('select');
    setLocalVote(targetId);
    db.ref(`games/${gameId}/dayVotes/${playerId}`).set(targetId);
  };

  // Reset del voto locale quando cambia la fase o il turno
  useEffect(() => {
    setLocalVote(null);
    setLoverDraft(null); // Cupido agisce ogni notte: la bozza non deve sopravvivere al turno
  }, [phase, gameData?.currentNightStep?.key]);

  // Pulisce il rejoin salvato quando la partita termina
  useEffect(() => {
    if (phase === 'ended') localStorage.removeItem('lif_rejoin');
  }, [phase]);

  // Haptic su cambio fase — feedback tattile contestuale
  const prevPhaseRef = useRef(null);
  useEffect(() => {
    if (!phase || phase === prevPhaseRef.current) return;
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = phase;
    if (!prev) return; // primo render, nessun feedback
    if (phase === 'night')        window.haptic('heavy');   // cala la notte
    if (phase === 'dawn_reveal')  window.haptic('medium');  // alba
    if (phase === 'voting')       window.haptic('medium');  // inizia la votazione
    if (phase === 'ended_voting') {
      // Condannato? Feedback più forte per la vittima
      const isVictim = gameData?.dayVictimId === playerId;
      window.haptic(isVictim ? 'error' : 'warning');
    }
    if (phase === 'ended') {
      const w = gameData?.winner;
      const myTeam = player?.role ? ROLES[player.role]?.team : null;
      const won = (w === 'lupi' && myTeam === 'lupi') || (w === 'villaggio' && myTeam === 'villaggio');
      window.haptic(won ? 'success' : 'error');
    }
  }, [phase]);

  // Pulsazione a ogni cambio di passo notturno, IDENTICA per tutti e su ogni telefono.
  // Serve a chi non sta guardando lo schermo: nessuno può dire al narratore "ho giocato"
  // senza scoprirsi, quindi l'unico modo di richiamare l'attenzione è il telefono.
  // Deve vibrare a TUTTI, non solo a chi è di turno: al buio un ronzio isolato che arriva
  // mentre il narratore chiama un ruolo rivelerebbe al tavolo chi lo interpreta.
  // ⚠️ Su Safari iOS non esiste navigator.vibrate: chi gioca dal QR su iPhone non la sente
  // (vedi window.haptic). Per questo il timeout del motore resta la vera garanzia.
  const prevStepRef = useRef(null);
  useEffect(() => {
    const chiave = gameData?.currentNightStep?.key;
    if (phase !== 'night' || !chiave) { prevStepRef.current = null; return; }
    if (prevStepRef.current && prevStepRef.current !== chiave) window.haptic('medium');
    prevStepRef.current = chiave;
  }, [phase, gameData?.currentNightStep?.key]);

  if(error) return (
    <div className="min-h-screen layer flex flex-col items-center justify-center p-6 text-center">
      <Moon size={56}/>
      <p className="font-cinzel text-moon text-xl mt-4 mb-2">{t('player.error')}</p>
      <p className="text-gray-500 text-sm">{error}</p>
      {/* Conflitto di dispositivo: quasi sempre è lo stesso giocatore che passa
          da Safari all'app nativa (localStorage separati). Deve poter proseguire. */}
      {deviceConflict && (
        <>
          <button
            onClick={() => {
              if (db && gameId && playerId) {
                db.ref(`games/${gameId}/players/${playerId}/deviceToken`).set(getDeviceToken(gameId));
              }
              setDeviceConflict(false);
              setError(null); // il listener Firebase è ancora attivo e ricaricherà la partita
            }}
            className="btn-gold mt-6 px-6 py-3 rounded-2xl text-sm">
            {t('player.takeOverDevice')}
          </button>
          <p className="text-gray-600 text-xs mt-3 max-w-xs">{t('player.takeOverHint')}</p>
        </>
      )}
    </div>
  );

  if(!gameData) return (
    <div className="min-h-screen layer flex flex-col items-center justify-center p-6 text-center">
      <Moon size={56}/>
      <p className="font-cinzel text-moon text-lg mt-4">{t('player.connecting')}</p>
      <p className="text-gray-600 text-sm mt-2">{t('player.waitingGameData')}</p>
    </div>
  );

  // Rimossi doppioni (spostati sopra)

  const PHASE_DISPLAY_ICONS = {
    waiting:'⏳', role_reveal:'🌙', night:'🌙', dawn_reveal:'🌅',
    day:'☀️', voting:'🗳️', ended_voting:'⚖️', ended:'🏁',
  };
  const phaseDisplay = phase in PHASE_DISPLAY_ICONS
    ? { icon: PHASE_DISPLAY_ICONS[phase], label: t(`player.phase.${phase}.label`), tip: t(`player.phase.${phase}.tip`),
        bg: {waiting:'overlay-night', role_reveal:'overlay-night', night:'overlay-night', dawn_reveal:'overlay-dawn', day:'overlay-day', voting:'overlay-day', ended_voting:'overlay-day', ended:''}[phase] }
    : { icon:'⏳', label:'…', bg:'', tip:'' };

  // Mostra banner "Apri nell'App" solo su browser mobile (non in-app nativa)
  const isNativePlatform = typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.();
  // Il token viaggia nel deep link: Safari e la WebView nativa hanno localStorage separati,
  // quindi senza passarlo l'app genererebbe un token nuovo e la guardia anti-furto
  // bloccherebbe il giocatore sul suo stesso telefono.
  const deepLinkUrl = `lupus://join?game=${gameId}&player=${playerId}&dt=${encodeURIComponent(getDeviceToken(gameId))}`;

  return (
    <div className={`min-h-screen layer screen-safe px-4 pb-44 ${(phase === 'role_reveal' || phase === 'waiting') ? 'pt-3' : 'py-6'} ${phaseDisplay.bg}`} style={{ pointerEvents: 'auto' }}>

      {/* Banner "Apri/Scarica l'App" — visibile solo su browser, nascosto nell'app nativa e durante la scoperta del ruolo */}
      {!isNativePlatform && phase !== 'role_reveal' && phase !== 'waiting' && (
        <div className="mb-4 rounded-2xl flex items-center gap-3 px-4 py-3"
             style={{background:'rgba(226,201,126,0.06)', border:'1px solid rgba(226,201,126,0.2)'}}>
          <span className="text-2xl shrink-0">🐺</span>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-bold leading-tight">{t('player.appBannerTitle')}</p>
            <p className="text-gray-500 text-[10px] leading-tight">{t('player.appBannerSubtitle')}</p>
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <a href={deepLinkUrl}
               className="text-[10px] font-bold px-2.5 py-1 rounded-full text-center transition-all active:scale-95"
               style={{background:'rgba(226,201,126,0.15)', border:'1px solid rgba(226,201,126,0.4)', color:'#e2c97e'}}>
              {t('player.openApp')}
            </a>
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer"
               className="text-[10px] font-bold px-2.5 py-1 rounded-full text-center transition-all active:scale-95"
               style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.18)', color:'#fff'}}>
              {t('player.download')}
            </a>
          </div>
        </div>
      )}

      {/* Glow atmosferico di fase */}
      {(phase==='night'||phase==='role_reveal'||phase==='waiting') && (
        <div className="phase-glow" style={{top:'-60px',width:320,height:320,
          background:'radial-gradient(ellipse, rgba(80,40,200,0.18) 0%, transparent 70%)',
          animation:'nightGlow 4s ease-in-out infinite'}} />
      )}
      {phase==='dawn_reveal' && (
        <div className="phase-glow" style={{bottom:0,top:'auto',width:420,height:260,
          background:'radial-gradient(ellipse at bottom, rgba(255,110,30,0.22) 0%, rgba(200,60,10,0.08) 50%, transparent 75%)',
          animation:'dawnGlow 3s ease-in-out infinite'}} />
      )}
      {(phase==='day'||phase==='voting') && (
        <div className="phase-glow" style={{top:'-40px',width:360,height:280,
          background:'radial-gradient(ellipse, rgba(200,140,20,0.12) 0%, transparent 70%)',
          animation:'dayGlow 5s ease-in-out infinite'}} />
      )}

      {/* Logger di debug — visibile SOLO in sviluppo (localhost) */}
      {window.location.hostname === 'localhost' && debugLog && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 text-[8px] text-green-400 p-1 font-mono pointer-events-none z-[9999] opacity-40">
          {debugLog}
        </div>
      )}

      {/* Phase banner */}
      <div className={`text-center ${(phase === 'role_reveal' || phase === 'waiting') ? 'mb-2' : 'mb-4'}`}>
        <div className="text-4xl mb-1">{phaseDisplay.icon}</div>
        <p className="font-cinzel text-moon text-base font-semibold">{phaseDisplay.label}</p>
        {phaseDisplay.tip && <p className="text-gray-600 text-xs mt-1">{phaseDisplay.tip}</p>}
      </div>


      {/* Role reveal */}
      {(phase==='role_reveal' || phase==='waiting') && (
        <div className="mb-5">
          <RoleCard
            role={player.role} playerName={player.name}
            flipped={flipped} onFlip={()=>{ window.haptic('heavy'); setFlipped(true); }}
            onHide={()=>{ window.haptic('light'); setFlipped(false); }}
            userPhoto={user?.photoURL}
          />
        </div>
      )}

      {/* Role info modal */}
      {showRoleInfo && role && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4"
             style={{background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)'}}
             onClick={()=>setShowRoleInfo(false)}>
          <div className="w-full max-w-sm rounded-2xl p-5 anim-fade-up"
               style={{background:'#0d1117', border:`1px solid ${role.color}44`}}
               onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{role.icon}</span>
                <p className="font-cinzel text-white font-bold text-lg">{role.name}</p>
              </div>
              <button onClick={()=>setShowRoleInfo(false)}
                      className="text-gray-500 hover:text-white text-xl leading-none px-1">✕</button>
            </div>
            <span className="text-[11px] px-3 py-1 rounded-full font-bold"
                  style={{background:role.color+'33', border:`1px solid ${role.color}66`, color:role.color}}>
              {role.team==='lupi'?t('teamBadge.lupi'):t('teamBadge.villaggio')}
            </span>
            <p className="text-gray-300 text-sm leading-relaxed mt-4">{role.description}</p>
            {role.tip && (
              <div className="mt-3 p-2 rounded-lg text-[11px] text-white/50 italic"
                   style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)'}}>
                💡 {role.tip}
              </div>
            )}
            <button onClick={()=>setShowRoleInfo(false)}
                    className="w-full mt-4 py-3 rounded-xl text-sm font-bold text-gray-400"
                    style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)'}}>
              {t('player.roleInfoClose')}
            </button>
          </div>
        </div>
      )}

      {/* ══ ALBA — reveal della vittima notturna sui telefoni ══ */}
      {phase === 'dawn_reveal' && (() => {
        // Elenco completo dei caduti: prima si leggeva il solo dawnVictimId e con più
        // morti nella stessa notte (veleno, morte per dolore) gli altri sparivano.
        const caduti   = gameData?.dawnVictimIds?.length
                       ? gameData.dawnVictimIds
                       : (gameData?.dawnVictimId ? [gameData.dawnVictimId] : []);
        const resuscitatoId = gameData?.dawnRevivedId || null;
        const nome = id => gameData.players?.[id]?.name || '???';
        const ruolo = id => ROLES[gameData.players?.[id]?.role];
        const sonoIo = caduti.includes(playerId);
        if (!caduti.length && !resuscitatoId) return null; // notte senza sangue — UI normale

        const bloccoResurrezione = resuscitatoId && (
          <div className="mt-6 pt-5" style={{borderTop:'1px solid rgba(255,255,255,0.12)'}}>
            <p className="text-5xl mb-2">🪬</p>
            <p className="text-cyan-300 text-sm uppercase tracking-widest mb-1">{t('player.revivedAtDawn')}</p>
            <p className="font-cinzel text-white text-2xl font-bold">{nome(resuscitatoId)}</p>
          </div>
        );

        if (sonoIo) return (
          <div className="text-center py-10 anim-fade-up">
            <div className="text-8xl mb-4" style={{filter:'drop-shadow(0 0 30px rgba(220,38,38,0.8))'}}>💀</div>
            <p className="font-cinzel text-red-400 text-2xl font-bold mb-2 tracking-wide">{t('player.youEliminated')}</p>
            <p className="font-cinzel text-white text-3xl font-bold mb-3">{player.name}</p>
            <p className="text-gray-500 text-sm italic">{t('player.wolvesGotYou')}</p>
            {caduti.length > 1 && (
              <p className="text-gray-400 text-sm mt-4">
                {t('player.fellWithYou', {names: caduti.filter(id=>id!==playerId).map(nome).join(getLang()==='en'?' and ':' e ')})}
              </p>
            )}
            <p className="text-gray-700 text-xs mt-4">{t('player.putPhoneAway')}</p>
            {bloccoResurrezione}
          </div>
        );

        return (
          <div className="text-center py-10 anim-fade-up">
            <div className="text-7xl mb-4" style={{filter:'drop-shadow(0 0 20px rgba(220,38,38,0.5))'}}>🌅</div>
            {caduti.length > 0 && (
              <>
                <p className="text-gray-400 text-sm mb-3 uppercase tracking-widest">
                  {caduti.length > 1 ? t('player.fallenTonightPlural', {n: caduti.length}) : t('player.fallenTonight')}
                </p>
                {/* Un blocco per ciascun caduto, col ruolo scoperto: il tavolo deve
                    capire subito chi non c'è più e cosa ha perso il villaggio. */}
                {caduti.map(id => {
                  const causa = gameData?.dawnCauses?.[id];
                  return (
                  <div key={id} className="mb-4">
                    <p className="font-cinzel text-white text-4xl font-bold"
                       style={{textShadow:'0 0 20px rgba(220,38,38,0.6)'}}>
                      {nome(id)}
                    </p>
                    {ruolo(id) && (
                      <p className="text-sm mt-1" style={{color: ruolo(id).color}}>
                        {ruolo(id).icon} {ruolo(id).name}
                      </p>
                    )}
                    {/* La causa per ciascuno: prima una frase unica diceva "i lupi hanno
                        colpito" anche per chi era morto di veleno o di dolore. */}
                    {causa && (
                      <p className="text-gray-500 text-xs italic mt-0.5">
                        {causa === 'veleno' ? t('player.causePoison')
                         : causa === 'amore' ? t('player.causeGrief')
                         : t('player.causeWolves')}
                      </p>
                    )}
                  </div>
                  );
                })}
                {!gameData?.dawnCauses && <p className="text-gray-500 text-sm italic">{t('player.wolvesStruck')}</p>}
              </>
            )}
            {bloccoResurrezione}
          </div>
        );
      })()}

      {/* ══ VERDETTO DI GIORNO — reveal del condannato sui telefoni ══ */}
      {phase === 'ended_voting' && (() => {
        const victimId   = gameData?.dayVictimId;
        const victimName = victimId ? (gameData.players?.[victimId]?.name || '???') : null;
        const isMe       = victimId === playerId;
        if (!victimName) return (
          // Nessun condannato (parità di voti) — messaggio neutro
          <div className="text-center py-10 anim-fade-up">
            <p className="text-4xl mb-3">⚖️</p>
            <p className="font-cinzel text-white text-lg font-bold mb-1">{t('player.noVerdict')}</p>
            <p className="text-gray-500 text-sm">{t('player.noMajorityBody')}</p>
          </div>
        );
        if (isMe) return (
          // Sei TU il condannato
          <div className="text-center py-10 anim-fade-up">
            <div className="text-8xl mb-4" style={{filter:'drop-shadow(0 0 30px rgba(220,38,38,0.7))'}}>🔥</div>
            <p className="font-cinzel text-red-400 text-2xl font-bold mb-2 tracking-wide">{t('player.youCondemned')}</p>
            <p className="font-cinzel text-white text-3xl font-bold mb-3">{player.name}</p>
            <p className="text-gray-500 text-sm italic">{t('player.villageChoseYou')}</p>
            <p className="text-gray-700 text-xs mt-4">{t('player.putPhoneAway')}</p>
          </div>
        );
        return (
          // Qualcun altro è stato condannato
          <div className="text-center py-10 anim-fade-up">
            <div className="text-7xl mb-4" style={{filter:'drop-shadow(0 0 20px rgba(220,38,38,0.5))'}}>⚖️</div>
            <p className="text-gray-400 text-sm mb-2 uppercase tracking-widest">{t('player.villageDecided')}</p>
            <p className="font-cinzel text-white text-4xl font-bold mb-3"
               style={{textShadow:'0 0 20px rgba(220,38,38,0.6)'}}>
              {victimName}
            </p>
            <p className="text-gray-500 text-sm italic">{t('player.wasCondemned')}</p>
          </div>
        );
      })()}

      {/* During game */}
      {['night','dawn_reveal','day','voting'].includes(phase) && (
        <div className="text-center py-6 anim-fade-up">

          {/* Schermata morto — schermo bloccato, nessuna info sugli altri */}
          {!player.alive ? (
            <div className="flex flex-col items-center py-8">
              <div className="text-7xl mb-4">💀</div>
              <p className="font-cinzel text-white text-2xl font-bold mb-1">{player.name}</p>
              <span className="text-xs px-3 py-1 rounded-full mb-4"
                    style={{background:role?.color+'22', border:`1px solid ${role?.color}44`, color:role?.color}}>
                {role?.icon} {role?.name}
              </span>
              <p className="text-gray-600 text-sm italic">{t('player.youAreEliminated')}</p>
              <p className="text-gray-700 text-xs mt-2">{t('player.putPhoneAway')}</p>
            </div>
          ) : (
          <>
          <div className="text-7xl mb-3 leading-none"
               style={{filter:`drop-shadow(0 0 20px ${role?.color})`}}>
            {phase==='night' ? '😴' : role?.icon}
          </div>
          <p className="font-cinzel text-xl text-white font-bold mb-1">{player.name}</p>
          <button onClick={()=>setShowRoleInfo(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-1 transition-all active:scale-95"
                  style={{background:role?.color+'33', border:`1px solid ${role?.color}66`}}>
            <span>{role?.icon}</span>
            <span className="font-bold text-white text-sm">{role?.name}</span>
          </button>
          <p className="text-gray-600 text-[10px] mb-3">{t('player.tapToReviewRole')}</p>
          </>
          )}

          {/* ── TRASFORMAZIONE: spiega perché la carta è cambiata ── */}
          {player.alive && transformedFrom && role && (
            <div className="w-full mb-3 p-3 rounded-2xl text-center anim-fade-in"
                 style={{background:`${role.color}1f`, border:`1px solid ${role.color}66`}}>
              <p className="text-[11px] leading-snug" style={{color:'#e2c97e'}}>
                {transformedFrom.icon} {transformedFrom.name} → {role.icon} <strong>{role.name}</strong>
              </p>
              <p className="text-gray-400 text-[11px] mt-1 leading-snug">
                {t('player.nowWinsWith', {team: role.team === 'lupi' ? t('teams.lupi') : t('teams.villaggio')})}
              </p>
            </div>
          )}

          {/* ── ALLEATI: i lupi si riconoscono fra loro; l'Indemoniato conosce i lupi ── */}
          {player.alive && (() => {
            const iAmWolf    = ROLES[player.role]?.team === 'lupi';
            const iKnowWolves = !!ROLES[player.role]?.knowsWolves;
            if (!iAmWolf && !iKnowWolves) return null;
            // Ricalcolata dal vivo a ogni render: così il Figlio dei Lupi compare
            // nel branco appena si trasforma, e i lupi morti restano visibili barrati.
            const wolves = Object.entries(gameData.players || {})
              .filter(([, p]) => ROLES[p.role]?.team === 'lupi');
            // L'Indemoniato ha team 'villaggio' (serve perché la Veggente lo veda
            // innocente), quindi non finiva in questa lista nemmeno per sé stesso: col
            // Mitomane possono essere due e si votavano a vicenda credendosi villici.
            // Restano visibili SOLO fra loro: i lupi non devono sapere chi è il proprio
            // informatore, è ciò che tiene il ruolo a mezzo lupo di valore.
            const iAmMinion = player.role === 'indemoniato';
            const minions = iAmMinion
              ? Object.entries(gameData.players || {}).filter(([, p]) => p.role === 'indemoniato')
              : [];
            const allies = [...wolves, ...minions];
            if (!allies.length) return null;
            // Di giorno e in votazione i telefoni sono esposti agli sguardi dei vicini:
            // l'elenco resta accessibile ma va scoperto apposta.
            const daylight = phase === 'day' || phase === 'voting';
            if (daylight && !showPack) {
              return (
                <button onClick={() => setShowPack(true)}
                        className="w-full mt-1 mb-3 p-2.5 rounded-2xl text-[11px] font-bold transition-all active:scale-95"
                        style={{background:'rgba(192,57,43,0.10)', border:'1px solid rgba(192,57,43,0.3)', color:'#ef8a80'}}>
                  🐺 {t('player.revealPack')}
                </button>
              );
            }
            return (
              <div className="w-full mt-1 mb-3 p-3 rounded-2xl text-left anim-fade-in"
                   style={{background:'rgba(192,57,43,0.12)', border:'1px solid rgba(192,57,43,0.4)'}}>
                <p className="text-[10px] uppercase tracking-widest mb-2 flex items-center justify-between" style={{color:'#ef8a80'}}>
                  <span>🐺 {iAmWolf ? t('player.yourPack') : t('player.wolvesYouKnow')}</span>
                  {daylight && (
                    <button onClick={() => setShowPack(false)}
                            className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{background:'rgba(0,0,0,0.35)', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.7)'}}>
                      🙈
                    </button>
                  )}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {allies.map(([wid, w]) => {
                    const eIndemoniato = w.role === 'indemoniato';
                    return (
                    <span key={wid} className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{background: w.alive ? (eIndemoniato ? 'rgba(139,92,246,0.28)' : 'rgba(192,57,43,0.28)') : 'rgba(255,255,255,0.05)',
                                  border:`1px solid ${eIndemoniato ? 'rgba(139,92,246,0.45)' : 'rgba(192,57,43,0.45)'}`,
                                  color: w.alive ? '#fff' : 'rgba(255,255,255,0.38)',
                                  textDecoration: w.alive ? 'none' : 'line-through'}}>
                      {/* player.you vale già '(tu)' / '(you)': le parentesi qui intorno
                          producevano "Anna ((tu))". Alla riga ~6100 la chiave è usata nuda. */}
                      {eIndemoniato ? '😈 ' : ''}{w.name}{wid === playerId ? ` ${t('player.you')}` : ''}
                    </span>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* NIGHT VOTING UI */}
          {player.alive && phase==='night' && gameData.currentNightStep?.roleId === player.role && (
            <div className="mt-6 p-4 rounded-2xl anim-fade-up text-left" style={{background:role?.color+'1a', border:`1px solid ${role?.color}44`}}>
              <p className="font-cinzel font-bold text-white mb-1"><span className="text-xl">{role?.icon}</span> {t('player.yourTurn')}</p>

              {/* ── FIGLIO DEI LUPI: nessuna azione ── */}
              {player.role === 'figlio_dei_lupi' ? (
                <div className="text-center py-4 mt-2">
                  <p className="text-3xl mb-2">🐺</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{t('player.wolfChildStayStill')}<br/>{t('player.wolfChildObserve')}</p>
                  <p className="text-gray-600 text-xs mt-3">{t('player.shamanWaitingAdvance')}</p>
                </div>
              ) : /* ── INDEMONIATO: nessuna azione, osserva il branco (lista qui sopra) ── */
              player.role === 'indemoniato' ? (
                <div className="text-center py-4 mt-2">
                  <p className="text-3xl mb-2">😈</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{t('player.minionObserve')}</p>
                  <p className="text-gray-600 text-xs mt-3">{t('player.shamanWaitingAdvance')}</p>
                </div>
              ) : /* ── STREGA: scelta pozioni ── */
              player.role === 'strega' ? (() => {
                const victimId   = gameData.currentNightVictim;
                const victimName = victimId ? (gameData.players?.[victimId]?.name || '???') : null;
                // Pozioni per giocatore: con due Streghe (Mitomane) ognuna ha le sue.
                // I flag globali restano come ripiego per le partite iniziate prima.
                const myPotions  = gameData.witchPotions?.[playerId] || {};
                const healUsed   = myPotions.heal   ?? (gameData.witchHealUsed   || false);
                const poisonUsed = myPotions.poison ?? (gameData.witchPoisonUsed || false);
                const voted      = localVote || gameData.nightVotes?.[playerId];

                if (voted) {
                  const label = voted === 'HEAL' ? t('player.witchUsedHeal')
                              : voted === 'PASS' ? t('player.witchUsedPass')
                              : t('player.witchUsedPoison', {name: gameData.players?.[voted]?.name || '???'});
                  return (
                    <div className="text-center py-3 mt-2">
                      <p className="text-white font-bold text-sm">{label}</p>
                      <p className="text-gray-500 text-xs mt-2">{t('player.shamanWaitingAdvance')}</p>
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col gap-3 mt-3 relative z-50">
                    <p className="text-gray-400 text-xs">{t('player.witchChooseOneAction')}</p>

                    {victimName && (
                      <div className="p-3 rounded-xl text-center" style={{background:'rgba(139,26,26,0.25)', border:'1px solid rgba(239,68,68,0.3)'}}>
                        <p className="text-gray-400 text-xs">{t('player.witchWolvesWantToKill')}</p>
                        <p className="font-cinzel text-white font-bold text-lg">{victimName}</p>
                      </div>
                    )}

                    {!healUsed && victimName && (
                      <button onClick={(e)=>{e.stopPropagation();castVote('HEAL');}}
                        className="w-full p-4 rounded-2xl flex items-center gap-3 bg-white/10 touch-manipulation transition-all active:scale-95"
                        style={{border:'2px solid rgba(74,222,128,0.6)', pointerEvents:'auto', zIndex:999}}>
                        <span className="text-3xl">💚</span>
                        <div className="text-left">
                          <p className="font-bold text-white">{t('player.witchSave', {name: victimName})}</p>
                          <p className="text-gray-400 text-xs">{t('player.witchHealHint')}</p>
                        </div>
                      </button>
                    )}

                    {!poisonUsed && (
                      <div>
                        <p className="text-gray-500 text-xs mb-2">{t('player.witchPoisonHint')}</p>
                        <div className="flex flex-col gap-2">
                          {Object.entries(gameData.players||{}).filter(([id,p])=>p.alive && id!==playerId).map(([id,p])=>(
                            <button key={id} onClick={(e)=>{e.stopPropagation();castVote(id);}}
                              className="w-full p-4 rounded-2xl flex items-center gap-3 bg-white/10 touch-manipulation transition-all active:scale-95"
                              style={{border:'2px solid rgba(139,26,26,0.5)', pointerEvents:'auto', zIndex:999}}>
                              <span className="text-2xl">☠️</span>
                              <p className="font-bold text-white">{p.name}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <button onClick={(e)=>{e.stopPropagation();castVote('PASS');}}
                      className="w-full p-3 rounded-2xl text-center text-gray-400 text-sm bg-white/5 touch-manipulation transition-all active:scale-95"
                      style={{border:'1px solid rgba(255,255,255,0.1)', pointerEvents:'auto', zIndex:999}}>
                      {t('player.witchPass')}
                    </button>
                  </div>
                );
              })() : (
                /* ── MEDIUM: vota tra i giocatori eliminati ── */
              player.role === 'medium' ? (() => {
                const mortiOra = Object.entries(gameData.players||{}).filter(([,p])=>!p.alive);
                const scelto   = localVote || gameData.nightVotes?.[playerId];

                // Prima notte, o comunque nessun morto: qui c'era solo una frase e
                // nessun pulsante, quindi il passo non riceveva mai un voto e restava
                // appeso. Serve un modo esplicito di dire "ho finito".
                if (mortiOra.length === 0) {
                  return (
                    <div className="text-center py-4 mt-2">
                      <p className="text-3xl mb-2">👁️</p>
                      <p className="text-gray-400 text-sm mb-4">{t('player.mediumNoneEliminated')}</p>
                      {scelto !== 'PASS' ? (
                        <button onClick={(e)=>{e.stopPropagation(); castVote('PASS');}}
                          className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 touch-manipulation"
                          style={{background:'rgba(139,92,246,0.12)', border:'1px solid rgba(139,92,246,0.35)', color:'#c4b5fd', pointerEvents:'auto', zIndex:999}}>
                          {t('player.shamanPassTurn')}
                        </button>
                      ) : (
                        <p className="text-gray-600 text-xs">{t('player.shamanWaitingAdvance')}</p>
                      )}
                    </div>
                  );
                }

                // Il risultato dell'indagine compariva SOLO sullo schermo del narratore:
                // il Medium usava il potere e non scopriva nulla dal proprio telefono.
                if (scelto && scelto !== 'PASS') {
                  const rs = ROLES[gameData.players?.[scelto]?.role];
                  const eLupo = rs?.team === 'lupi';
                  return (
                    <div className="mt-2 p-4 rounded-2xl text-center anim-fade-in"
                         style={{background: eLupo ? 'rgba(139,26,26,0.35)' : 'rgba(26,74,26,0.35)',
                                 border: `2px solid ${eLupo ? 'rgba(239,68,68,0.6)' : 'rgba(74,222,128,0.6)'}`}}>
                      <p className="text-4xl mb-1">{rs?.icon || '👁️'}</p>
                      <p className="font-cinzel text-white font-bold text-lg">
                        {gameData.players?.[scelto]?.name} {t('gameMaster.mediumSaw')} {rs?.name || '???'}
                      </p>
                      <p className={`text-sm font-bold mt-1 ${eLupo ? 'text-red-300' : 'text-green-300'}`}>
                        {eLupo ? t('player.veggenteIsWolf') : t('player.veggenteIsInnocent')}
                      </p>
                      <p className="text-gray-400 text-xs mt-2">{t('player.veggenteOnlyYouSee')}</p>
                    </div>
                  );
                }

                return (
                <>
                  <p className="text-gray-400 text-xs mb-3 mt-1">{t('player.mediumChooseSpirit')}</p>
                  <div className="flex flex-col gap-3 relative z-50">
                    {mortiOra.map(([id,p])=>{
                      const isSel = localVote===id || (gameData.nightVotes?.[playerId]===id);
                      return (
                        <button key={id}
                          onClick={(e)=>{e.stopPropagation(); castVote(id);}}
                          className={`w-full p-5 rounded-2xl flex justify-between items-center transition-all cursor-pointer active:brightness-150 touch-manipulation shadow-lg ${isSel?'bg-white/40 scale-[1.02]':'bg-white/10'}`}
                          style={{border:isSel?`4px solid ${role?.color}`:'2px solid rgba(255,255,255,0.2)',
                                  boxShadow:isSel?`0 0 35px ${role?.color}aa`:'none',
                                  pointerEvents:'auto', position:'relative', zIndex:999}}>
                          <span className="font-bold text-white text-2xl pr-4 pointer-events-none">💀 {p.name}</span>
                          {isSel?<span className="text-4xl pointer-events-none">👁️</span>:<div className="w-10 h-10 rounded-full border-2 border-white/40 pointer-events-none"></div>}
                        </button>
                      );
                    })}
                  </div>
                </>
                );
              })() : player.role === 'sciamano' ? (() => {
              /* ── SCIAMANO: resuscita un morto (una volta per partita) ── */
                // Per giocatore: due Sciamani (Mitomane) hanno una resurrezione a testa
                const shamanUsed = gameData.shamanUsedBy?.[playerId] ?? (gameData.shamanUsed || false);
                const deadPlayers = Object.entries(gameData.players||{}).filter(([id,p])=>!p.alive);
                const voted = localVote || gameData.nightVotes?.[playerId];

                if (shamanUsed) {
                  const alreadyPassed = localVote === 'PASS' || gameData.nightVotes?.[playerId] === 'PASS';
                  return (
                    <div className="text-center py-4 mt-2">
                      <p className="text-3xl mb-2">🪬</p>
                      <p className="text-gray-400 text-sm mb-4">{t('player.shamanPowerUsed')}</p>
                      {!alreadyPassed ? (
                        <button onClick={(e)=>{e.stopPropagation(); castVote('PASS');}}
                          className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 touch-manipulation"
                          style={{background:'rgba(6,182,212,0.1)', border:'1px solid rgba(6,182,212,0.3)', color:'#67e8f9', pointerEvents:'auto', zIndex:999}}>
                          {t('player.shamanPassTurn')}
                        </button>
                      ) : (
                        <p className="text-gray-600 text-xs">{t('player.shamanWaitingAdvance')}</p>
                      )}
                    </div>
                  );
                }

                if (voted) {
                  return (
                    <div className="text-center py-3 mt-2">
                      <p className="text-cyan-400 font-bold text-sm">{t('player.shamanRevived', {name: gameData.players?.[voted]?.name})}</p>
                      <p className="text-gray-500 text-xs mt-2">{t('player.shamanWaitingAdvance')}</p>
                    </div>
                  );
                }

                if (deadPlayers.length === 0) {
                  return (
                    <div className="text-center py-4 mt-2">
                      <p className="text-3xl mb-2">🌿</p>
                      <p className="text-gray-400 text-sm mb-4">{t('player.shamanNoneEliminated')}<br/>{t('player.shamanPowerUnavailable')}</p>
                      <button onClick={(e)=>{e.stopPropagation(); castVote('PASS');}}
                        className="w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-95 touch-manipulation"
                        style={{background:'rgba(6,182,212,0.1)', border:'1px solid rgba(6,182,212,0.3)', color:'#67e8f9', pointerEvents:'auto', zIndex:999}}>
                        {t('player.shamanPassTurn')}
                      </button>
                    </div>
                  );
                }

                return (
                  <>
                    <p className="text-gray-400 text-xs mb-3 mt-1">{t('player.shamanChooseRevive')}</p>
                    <div className="flex flex-col gap-3 relative z-50">
                      {deadPlayers.map(([id,p])=>{
                        const isSel = localVote===id || (gameData.nightVotes?.[playerId]===id);
                        return (
                          <button key={id}
                            onClick={(e)=>{e.stopPropagation(); castVote(id);}}
                            className={`w-full p-5 rounded-2xl flex justify-between items-center transition-all cursor-pointer active:brightness-150 touch-manipulation shadow-lg ${isSel?'bg-white/40 scale-[1.02]':'bg-white/10'}`}
                            style={{border:isSel?`4px solid #06b6d4`:'2px solid rgba(255,255,255,0.2)',
                                    boxShadow:isSel?`0 0 35px #06b6d4aa`:'none',
                                    pointerEvents:'auto', position:'relative', zIndex:999}}>
                            <span className="font-bold text-white text-2xl pr-4 pointer-events-none">💀 {p.name}</span>
                            {isSel?<span className="text-4xl pointer-events-none">🪬</span>:<div className="w-10 h-10 rounded-full border-2 border-white/40 pointer-events-none"></div>}
                          </button>
                        );
                      })}
                    </div>
                  </>
                );
              })() : player.role === 'cupido' ? (() => {
              /* ── CUPIDO: sceglie due innamorati dal telefono ── */
                // La scelta del PRIMO innamorato è una bozza (loverDraft), non un voto:
                // se usasse localVote, la guardia in cima a castVote respingerebbe la
                // conferma del secondo e Cupido non riuscirebbe mai a legare nessuno.
                const submitted = (gameData.nightVotes?.[playerId] || '').includes(',') ||
                                  (localVote || '').includes(',');
                const savedVote = gameData.nightVotes?.[playerId] || localVote || '';
                if (submitted) {
                  const [n1, n2] = savedVote.split(',');
                  return (
                    <div className="text-center py-3 mt-2">
                      <p className="text-pink-300 text-sm font-bold">
                        💘 {gameData.players?.[n1]?.name} &amp; {gameData.players?.[n2]?.name}
                      </p>
                      <p className="text-gray-500 text-xs mt-2">{t('player.cupidoWaitingAdvance')}</p>
                    </div>
                  );
                }
                const firstPick = loverDraft;
                const alivePlayers = Object.entries(gameData.players||{}).filter(([id,p])=>p.alive && id!==playerId);
                return (
                  <div className="flex flex-col gap-2 mt-2 relative z-50">
                    {firstPick ? (
                      <>
                        <div className="p-2 rounded-xl text-center mb-1" style={{background:'rgba(233,30,99,0.15)',border:'1px solid rgba(233,30,99,0.35)'}}>
                          <p className="text-pink-300 text-xs">{t('player.cupidoFirstLover')} <span className="font-bold text-white">{gameData.players?.[firstPick]?.name}</span></p>
                        </div>
                        <p className="text-gray-400 text-xs mb-1">{t('player.cupidoChooseSecond')}</p>
                        {alivePlayers.filter(([id])=>id!==firstPick).map(([id,p])=>(
                          <button key={id}
                            onClick={(e)=>{e.stopPropagation(); setLoverDraft(null); castVote(firstPick+','+id);}}
                            className="w-full p-5 rounded-2xl flex justify-between items-center bg-white/10 touch-manipulation transition-all active:brightness-150 shadow-lg"
                            style={{border:'2px solid rgba(233,30,99,0.5)', pointerEvents:'auto', zIndex:999}}>
                            <span className="font-bold text-white text-2xl pr-4 pointer-events-none">{p.name}</span>
                            <div className="w-10 h-10 rounded-full border-2 border-pink-400/40 pointer-events-none"></div>
                          </button>
                        ))}
                        <button onClick={(e)=>{e.stopPropagation(); setLoverDraft(null);}}
                          className="text-xs text-gray-500 mt-1 text-center py-2 touch-manipulation">
                          {t('player.cupidoChangeChoice')}
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-gray-400 text-xs mb-1">{t('player.cupidoChooseFirst')}</p>
                        {alivePlayers.map(([id,p])=>(
                          <button key={id}
                            onClick={(e)=>{e.stopPropagation(); setLoverDraft(id);}}
                            className="w-full p-5 rounded-2xl flex justify-between items-center bg-white/10 touch-manipulation transition-all active:brightness-150 shadow-lg"
                            style={{border:'2px solid rgba(233,30,99,0.25)', pointerEvents:'auto', zIndex:999}}>
                            <span className="font-bold text-white text-2xl pr-4 pointer-events-none">{p.name}</span>
                            <div className="w-10 h-10 rounded-full border-2 border-white/30 pointer-events-none"></div>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                );
              })() : (
              /* ── ALTRI RUOLI: voto standard ── */
                <>
                  <p className="text-gray-400 text-xs mb-3 mt-1">{t('player.selectSilently')}</p>
                  {player.role === 'guardia' && gameData.lastGuardedId && (
                    <p className="text-yellow-600 text-xs mb-2 italic">
                      {t('player.guardiaCannotProtectAgain', {name: gameData.players?.[gameData.lastGuardedId]?.name})}
                    </p>
                  )}
                  <div className="flex flex-col gap-3 relative z-50">
                    {Object.entries(gameData.players||{}).filter(([id, p])=>p.alive && id!==playerId).map(([id, p])=>{
                      const isSelected = localVote === id || (gameData.nightVotes?.[playerId] === id);
                      // Guardia: non può proteggere la stessa persona due notti di fila
                      const isBlocked = player.role === 'guardia' && id === gameData.lastGuardedId;
                      return (
                        <button key={id}
                          onClick={(e) => { e.stopPropagation(); if(!isBlocked) castVote(id); }}
                          disabled={isBlocked}
                          className={`w-full p-5 rounded-2xl flex justify-between items-center transition-all touch-manipulation shadow-lg ${isSelected ? 'bg-white/40 scale-[1.02]' : isBlocked ? 'opacity-30' : 'bg-white/10'} ${!isBlocked ? 'cursor-pointer active:brightness-150' : 'cursor-not-allowed'}`}
                          style={{
                            border: isSelected ? `4px solid ${role?.color}` : isBlocked ? '2px solid rgba(255,255,255,0.08)' : '2px solid rgba(255,255,255,0.2)',
                            boxShadow: isSelected ? `0 0 35px ${role?.color}aa` : 'none',
                            pointerEvents: 'auto', position: 'relative', zIndex: 999
                          }}>
                          <span className="font-bold text-white text-2xl pr-4 pointer-events-none">{p.name}{isBlocked ? ' 🚫' : ''}</span>
                          {/* L'icona era 🔮 fissa: un lupo che votava si vedeva confermare
                              la scelta dalla sfera della Veggente. Ora è la propria. */}
                          {isSelected ? <span className="text-4xl pointer-events-none">{role?.icon || '✓'}</span> : <div className="w-10 h-10 rounded-full border-2 border-white/40 pointer-events-none"></div>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Conferma esplicita del voto. Strega, Sciamano e Cupido la avevano già;
                      qui l'unico segnale era il bordo della riga, e chi votava non capiva se
                      il tap fosse stato registrato. Per i ruoli con più giocatori (i lupi)
                      mostra anche quanti del gruppo hanno scelto: è informazione che il
                      branco ha già fra sé, e risolve il "abbiamo votato tutti?". */}
                  {(() => {
                    const mioVoto = localVote || gameData.nightVotes?.[playerId];
                    const nomeScelto = mioVoto && gameData.players?.[mioVoto]?.name;
                    if (!nomeScelto) return null;
                    const delMioRuolo = Object.entries(gameData.players || {})
                      .filter(([, p]) => p.alive && p.role === player.role);
                    const hannoScelto = delMioRuolo
                      .filter(([vid]) => (gameData.nightVotes || {})[vid]).length;
                    return (
                      <div className="mt-4 p-3 rounded-2xl text-center anim-fade-in"
                           style={{background:'rgba(74,222,128,0.12)', border:'1px solid rgba(74,222,128,0.4)'}}>
                        <p className="text-white text-sm font-bold">{t('player.voteRegistered', {name: nomeScelto})}</p>
                        <p className="text-gray-400 text-xs mt-1">
                          {delMioRuolo.length > 1
                            ? t('player.voteGroupProgress', {done: hannoScelto, total: delMioRuolo.length})
                            : t('player.shamanWaitingAdvance')}
                        </p>
                      </div>
                    );
                  })()}

                  {/* ── VEGGENTE: rivela l'allineamento dopo il voto ── */}
                  {player.role === 'veggente' && localVote && (() => {
                    const rawRole = gameData.players?.[localVote]?.role;
                    // Mitomane: la Veggente vede il ruolo imitato, non "mitomane"
                    const mt = gameData.mitomaneTargets;
                    const suoTarget = mt && Object.keys(mt).length ? mt[localVote] : gameData.mitomaneTarget;
                    const effectiveRoleId = (rawRole === 'mitomane' && suoTarget)
                      ? gameData.players?.[suoTarget]?.role
                      : rawRole;
                    const isWolf = ROLES[effectiveRoleId]?.team === 'lupi';
                    return (
                      <div className="mt-4 p-4 rounded-2xl text-center anim-fade-in"
                           style={{background: isWolf ? 'rgba(139,26,26,0.35)' : 'rgba(26,74,26,0.35)',
                                   border: `2px solid ${isWolf ? 'rgba(239,68,68,0.6)' : 'rgba(74,222,128,0.6)'}`}}>
                        <p className="text-4xl mb-1">{isWolf ? '🐺' : '✨'}</p>
                        <p className="font-cinzel text-white font-bold text-lg">
                          {isWolf ? t('player.veggenteIsWolf') : t('player.veggenteIsInnocent')}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">{t('player.veggenteOnlyYouSee')}</p>
                      </div>
                    );
                  })()}
                </>
              ))}
            </div>
          )}

          {/* DAY VOTING UI */}
          {player.alive && phase==='voting' && (() => {
            // publicVote assente = partite create prima di questa opzione → palese (com'era al tavolo)
            const isPublic = gameData.publicVote !== false;
            const castVotes = gameData.dayVotes || {};
            // targetId → nomi di chi lo ha votato
            // Il peso deve combaciare con resolveDayVoting, dove il Sindaco vale 2:
            // mostrare le teste farebbe sbagliare i conti al tavolo proprio nel momento
            // in cui il voto palese serve a farli tornare.
            const votersByTarget = {};
            const weightByTarget = {};
            Object.entries(castVotes).forEach(([voterId, targetId]) => {
              const vp = gameData.players?.[voterId];
              const w = ROLES[vp?.role]?.voteWeight || 1;
              (votersByTarget[targetId] ||= []).push(vp?.name ? (w > 1 ? `${vp.name} ×${w}` : vp.name) : '?');
              weightByTarget[targetId] = (weightByTarget[targetId] || 0) + w;
            });
            return (
            <div className="mt-6 p-4 rounded-2xl anim-fade-up text-left" style={{background:role?.color+'1a', border:`1px solid ${role?.color}44`}}>
              <p className="font-cinzel font-bold text-white mb-1"><span className="text-xl">🗳️</span> {t('player.dayVoteCondemn')}</p>
              <p className="text-gray-400 text-xs mb-3">
                {t('player.dayVoteTap')} · {isPublic ? t('player.voteModePublic') : t('player.voteModeSecret')}
              </p>
              <div className="flex flex-col gap-3 relative z-50">
                {Object.entries(gameData.players||{}).filter(([id, p])=>p.alive && id!==playerId).map(([id, p])=>{
                  const isSelected = localVote === id || (castVotes[playerId] === id);
                  const voters = isPublic ? (votersByTarget[id] || []) : [];
                  return (
                    <button key={id}
                      onClick={(e) => { e.stopPropagation(); castDayVote(id); }}
                      className={`w-full p-5 rounded-2xl flex justify-between items-center gap-3 transition-all cursor-pointer active:brightness-150 touch-manipulation shadow-lg ${isSelected ? 'bg-white/40 scale-[1.02]' : 'bg-white/10'}`}
                      style={{
                        border: isSelected ? `4px solid #ef4444` : '3px solid rgba(255,255,255,0.2)',
                        boxShadow: isSelected ? '0 0 35px rgba(239,68,68,0.7)' : 'none',
                        pointerEvents: 'auto',
                        position: 'relative',
                        zIndex: 999
                      }}>
                      <div className="flex-1 min-w-0 text-left pointer-events-none">
                        <span className="font-bold text-white text-2xl">{p.name}</span>
                        {voters.length > 0 && (
                          <p className="text-[11px] text-white/60 mt-1 leading-tight break-words">{voters.join(', ')}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 pointer-events-none">
                        {voters.length > 0 && (
                          <span className="text-sm font-bold px-2.5 py-1 rounded-full"
                                style={{background:'rgba(239,68,68,0.3)', border:'1px solid rgba(239,68,68,0.65)', color:'#fff'}}>
                            {weightByTarget[id] || voters.length}
                          </span>
                        )}
                        {isSelected ? <span className="text-4xl">🔥</span> : <div className="w-10 h-10 rounded-full border-2 border-white/40"></div>}
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* Chi non ha ancora votato — solo in modalità palese */}
              {isPublic && (() => {
                const missing = Object.entries(gameData.players||{})
                  .filter(([id, p]) => p.alive && !castVotes[id])
                  .map(([, p]) => p.name);
                if (!missing.length) return null;
                return (
                  <p className="text-gray-500 text-[11px] mt-3 leading-tight">
                    ⏳ {t('player.stillToVote')}: {missing.join(', ')}
                  </p>
                );
              })()}
            </div>
            );
          })()}
        </div>
      )}

      {/* End game */}
      {phase==='ended' && (
        <div className="py-6 anim-fade-up">
          {/* Intestazione */}
          <div className="text-center mb-5">
            <div className="text-6xl mb-3">{gameData.winner==='lupi'?'🐺':gameData.winner==='amore'?'💘':'🌾'}</div>
            <p className="font-cinzel text-moon text-2xl font-bold mb-1">
              {gameData.winner==='lupi'?t('gameMaster.winnersLupi'):gameData.winner==='amore'?t('gameMaster.winnersAmore'):t('gameMaster.winnersVillaggio')}
            </p>
            <p className="text-gray-500 text-sm">{t('player.matchEnded')}</p>
          </div>

          {/* Il tuo ruolo + esito personale */}
          <div className="p-4 rounded-2xl mb-4"
               style={{background:role?.color+'1a', border:`1px solid ${role?.color}44`}}>
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">{t('player.yourRole')}</p>
            <p className="font-cinzel text-white text-xl mb-1">{role?.icon} {role?.name}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{background:role?.color+'22',border:`1px solid ${role?.color}44`,color:role?.color}}>
                {role?.team==='lupi'?t('teamBadge.lupi'):t('teamBadge.villaggio')}
              </span>
              {/* Indemoniato: sta col villaggio nei numeri, ma esulta col branco */}
              {role?.winsWith === 'lupi' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{background:'rgba(220,38,38,0.18)', border:'1px solid rgba(220,38,38,0.45)', color:'#f87171'}}>
                  {t('player.winsWithWolves')}
                </span>
              )}
              <span className={`text-xs font-bold ${player?.alive?'text-green-400':'text-red-400'}`}>
                {player?.alive ? t('player.survived') : t('player.eliminated')}
              </span>
            </div>
            {(() => {
              const myWinTeam = role?.winsWith || role?.team;
              const iWon = gameData.winner === myWinTeam;
              return (
                <p className={`mt-3 font-cinzel font-bold text-lg ${iWon ? 'text-green-400' : 'text-red-400'}`}>
                  {iWon ? t('player.youWon') : t('player.youLost')}
                </p>
              );
            })()}
          </div>

          {/* ── Tutti i ruoli rivelati ── */}
          <div className="rounded-2xl p-4 mb-4"
               style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)'}}>
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">{t('player.allRolesRevealed')}</p>
            <div className="flex flex-col gap-2">
              {Object.entries(gameData.players||{}).map(([pid, p])=>{
                const r = ROLES[p.role];
                const isMe = pid === playerId;
                return (
                  <div key={pid} className="flex items-center gap-2.5 py-1"
                       style={{opacity: p.alive ? 1 : 0.55}}>
                    <span className="text-xl w-7 text-center shrink-0">{p.alive ? r?.icon : '💀'}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-white text-sm font-bold">{p.name}</span>
                      {isMe && <span className="text-[10px] text-gray-500 ml-1">{t('player.you')}</span>}
                    </div>
                    <span className="text-xs shrink-0" style={{color:r?.color}}>{r?.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Cronaca turno per turno ── */}
          {gameData.gameRecap?.eventLog?.length > 0 && (() => {
            const recap    = gameData.gameRecap;
            const allPlayers = recap.players || gameData.players || {};
            const ordinals = t('player.ordinals');

            return (
              <div className="rounded-2xl p-4 mb-4"
                   style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)'}}>
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-4">{t('player.chronicleTitle')}</p>
                <div className="flex flex-col gap-5">
                  {recap.eventLog.map((ev, i) => {
                    const ordinal = ordinals[ev.turn-1] || t('player.turnFallback', {n: ev.turn});
                    // Stessa formattazione della cronaca del narratore: una sola fonte
                    const lines  = recapEventLines(ev, allPlayers);
                    const groups = ev.type === 'day' ? recapVoteGroups(ev, allPlayers) : null;
                    return (
                      <div key={i}>
                        <p className="font-cinzel text-moon text-xs font-bold mb-2 uppercase tracking-wider">
                          {ev.type === 'night' ? '🌙' : '☀️'} {ordinal} {ev.type === 'night' ? t('player.nightSuffix') : t('player.daySuffix')}
                        </p>
                        {lines.map((l, li) => (
                          <p key={li} className="text-gray-300 text-sm leading-relaxed mb-1">{l}</p>
                        ))}
                        {groups && (
                          <div className="mt-2 pl-3" style={{borderLeft:'2px solid rgba(255,255,255,0.1)'}}>
                            {groups.map((g, gi) => (
                              <p key={gi} className="text-gray-500 text-xs leading-snug">
                                <span className="text-gray-400 font-bold">{g.name}</span>{' '}←{' '}{g.voters.join(', ')}
                                <span className="text-gray-600"> ({g.voters.length})</span>
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* CTA Fine Partita — scarica l'app (solo su browser) */}
          {!isNativePlatform && (
            <div className="rounded-2xl overflow-hidden anim-fade-up"
                 style={{background:'linear-gradient(135deg, rgba(226,201,126,0.09) 0%, rgba(185,28,28,0.11) 100%)',
                         border:'1px solid rgba(226,201,126,0.22)'}}>
              <div className="p-5 text-center">
                <div className="text-4xl mb-2">🐺</div>
                <p className="font-cinzel text-moon text-base font-bold mb-1">
                  {t('player.readyForNarrator')}
                </p>
                <p className="text-gray-400 text-xs mb-4 leading-relaxed">
                  {t('player.readyForNarratorBody')}
                </p>
                <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer"
                   className="block w-full py-3 rounded-xl font-cinzel font-bold text-sm mb-2 transition-all active:scale-95"
                   style={{background:'linear-gradient(135deg, #e2c97e, #c9a84c)', color:'#0b0a14'}}>
                  {t('player.downloadFree')}
                </a>
                <p className="text-gray-600 text-[10px]">{t('player.freeAppNote')}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modale ruoli in gioco */}
      {showRolesInGame && gameData?.players && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4"
             style={{background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)'}}
             onClick={()=>setShowRolesInGame(false)}>
          <div className="w-full max-w-sm rounded-2xl p-5 anim-fade-up"
               style={{background:'#0d1117', border:'1px solid rgba(255,255,255,0.1)', maxHeight:'80vh', overflowY:'auto'}}
               onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-white font-cinzel font-bold">{t('player.rolesInGameTitle')}</span>
              <button onClick={()=>setShowRolesInGame(false)}
                      className="text-gray-500 hover:text-white text-xl leading-none px-1">✕</button>
            </div>
            {(()=>{
              const allPlayers = Object.entries(gameData.players || {});
              const alivePlayers = allPlayers.filter(([,p]) => p.alive !== false);
              const deadPlayers  = allPlayers.filter(([,p]) => p.alive === false);
              // Da TUTTI i giocatori, non solo dai vivi: quando l'ultimo di un ruolo
              // moriva, il ruolo spariva dall'elenco con la sua descrizione, proprio
              // quando serve per capire cosa è appena successo al tavolo.
              const roleIds = [...new Set(allPlayers.map(([,p])=>p.role))];
              return (
                <>
                  {roleIds.map(rid=>{
                    const r = ROLES[rid];
                    if(!r) return null;
                    const teamColor = r.team==='lupi'?'#c0392b':'#27ae60';
                    const isMyRole = rid === player?.role;
                    return (
                      <div key={rid} className="flex gap-3 items-start px-3 py-2.5 rounded-xl mb-1"
                           style={{background: isMyRole ? r.color+'18' : 'rgba(255,255,255,0.03)',
                                   border: isMyRole ? `1px solid ${r.color}44` : '1px solid rgba(255,255,255,0.05)'}}>
                        <span className="text-xl shrink-0 mt-0.5">{r.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-white text-sm font-bold">{r.name}</span>
                            {isMyRole && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                                              style={{background:r.color+'33',color:r.color}}>{t('player.you2')}</span>}
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto"
                                  style={{background:`${teamColor}18`,color:teamColor,border:`1px solid ${teamColor}33`}}>
                              {r.team==='lupi'?t('teams.lupi'):t('teams.villaggio')}
                            </span>
                          </div>
                          <p className="text-gray-500 text-[11px] leading-relaxed">{r.description}</p>
                        </div>
                      </div>
                    );
                  })}
                  {deadPlayers.length > 0 && (
                    <div className="mt-4">
                      <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mb-2 px-1">{t('gameMaster.eliminated')}</p>
                      <div className="flex flex-wrap gap-2">
                        {/* Il ruolo di chi è morto è già pubblico (compare nella cronaca
                            e all'alba): mostrarlo qui evita di dover rileggere il log. */}
                        {deadPlayers.map(([id, p]) => {
                          const dr = ROLES[p.role];
                          return (
                            <span key={id}
                                  className="text-gray-500 text-xs px-3 py-1 rounded-full"
                                  style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)'}}>
                              {p.name}{dr ? ` · ${dr.icon} ${dr.name}` : ''}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
            <button onClick={()=>setShowRolesInGame(false)}
                    className="w-full mt-4 py-3 rounded-xl text-sm font-bold text-gray-400"
                    style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)'}}>
              {t('player.close')}
            </button>
          </div>
        </div>
      )}

      {/* Tutorial modal */}
      {showTutorial && <TutorialModal isOpen={true} onClose={()=>setShowTutorial(false)} />}

      {/* Barra fissa in fondo — info + ready button sempre accessibili */}
      {phase !== 'ended' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-5 pt-3"
             style={{background:'linear-gradient(to top, rgba(11,10,20,1) 70%, transparent)'}}>

          {/* Bottoni info — sempre presenti */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={()=>setShowRolesInGame(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-gray-400 transition-all active:scale-95"
              style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)'}}>
              {t('player.rolesInGame')}
            </button>
            <button
              onClick={()=>setShowTutorial(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-gray-400 transition-all active:scale-95"
              style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)'}}>
              {t('player.howToPlay')}
            </button>
          </div>

          {/* Bottone "Sono pronto" — solo in fase role_reveal/waiting dopo aver visto la carta */}
          {(phase==='role_reveal' || phase==='waiting') && flipped && (
            !markedReady ? (
              <button onClick={markReady}
                      className="btn-gold w-full py-4 rounded-2xl text-base font-bold shadow-[0_0_20px_rgba(226,201,126,0.35)] transition-all active:scale-95">
                {t('player.imReady')}
              </button>
            ) : (
              <div className="text-center py-3 rounded-2xl"
                   style={{background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.2)'}}>
                <p className="text-green-400 font-bold text-sm">{t('player.readyBanner')}</p>
                <p className="text-gray-500 text-xs mt-0.5">{t('player.waitingOthers')}</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   HISTORY SCREEN
   ================================================================ */
function HistoryScreen({onBack}) {
  const [history, setHistory] = useState([]);

  useEffect(()=>{
    try {
      const h = JSON.parse(localStorage.getItem('lupus_history')||'[]');
      setHistory(h);
    } catch(e) {}
  },[]);

  const clear = ()=>{
    localStorage.removeItem('lupus_history');
    setHistory([]);
  };

  const stats = useMemo(()=>{
    const total = history.length;
    const lupiWins = history.filter(g=>g.winner==='lupi').length;
    return { total, lupiWins, villaggioWins: total-lupiWins };
  },[history]);

  return (
    <div className="min-h-screen layer pb-6">
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 pt-5 pb-3"
           style={{background:'rgba(13,17,23,0.95)', backdropFilter:'blur(10px)', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
        <button onClick={onBack} className="text-gray-500 hover:text-white text-2xl leading-none transition-colors">←</button>
        <h2 className="font-cinzel text-moon text-lg font-bold flex-1">{t('history.title')}</h2>
        {history.length>0 && (
          <button onClick={clear} className="text-red-500 text-xs hover:text-red-400 transition-colors">{t('history.clear')}</button>
        )}
      </div>

      <div className="px-4 pt-4">
        {history.length>0 && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              {l:t('history.statGames'), v:stats.total, c:'#e2c97e'},
              {l:t('history.statWolves'), v:stats.lupiWins, c:'#c0392b'},
              {l:t('history.statVillage'), v:stats.villaggioWins, c:'#27ae60'},
            ].map(s=>(
              <div key={s.l} className="glass rounded-xl p-3 text-center">
                <p className="font-cinzel font-bold text-xl" style={{color:s.c}}>{s.v}</p>
                <p className="text-gray-500 text-xs">{s.l}</p>
              </div>
            ))}
          </div>
        )}

        {history.length===0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📜</div>
            <p className="font-cinzel text-moon text-lg mb-2">{t('history.emptyTitle')}</p>
            <p className="text-gray-600 text-sm">{t('history.emptyBody')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((game,i)=>(
              <div key={i} className="glass rounded-2xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl leading-none">{game.winner==='lupi'?'🐺':'🌾'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-cinzel font-bold text-white">
                      {game.winner==='lupi'?t('history.wolvesWin'):t('history.villageWin')}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(game.date).toLocaleDateString(getLang()==='en'?'en-US':'it-IT',{day:'numeric',month:'long',year:'numeric'})}
                      {' · '}{t('history.matchNum', {id: game.gameId})}
                    </p>
                  </div>
                  <span className="text-gray-600 text-sm shrink-0">{game.players?.length} {t('history.playersCount')}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {game.players?.map((p,j)=>{
                    const r=ROLES[p.role];
                    return (
                      <div key={j} className={`px-2 py-1 rounded-lg text-xs font-bold ${!p.alive?'opacity-40':''}`}
                           style={{background:r?.color+'33', border:`1px solid ${r?.color}44`, color:'rgba(255,255,255,0.9)'}}>
                        {r?.icon} {p.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


/* ================================================================
   MAIN APP — ROUTER
   ================================================================ */
function needsUpdate(current, minimum) {
  const c = current.split('.').map(Number);
  const m = minimum.split('.').map(Number);
  for (let i = 0; i < Math.max(c.length, m.length); i++) {
    if ((c[i] || 0) < (m[i] || 0)) return true;
    if ((c[i] || 0) > (m[i] || 0)) return false;
  }
  return false;
}

function App() {
  useEffect(() => { const status = document.getElementById('boot-status'); if (status) status.style.display = 'none'; }, []);

  // Sottoscrive il root alla lingua corrente: garantisce che PrivacyConsentModal
  // e il modal di force-update (renderizzati qui, fuori da HomeScreen) si
  // aggiornino subito se la lingua cambia mentre sono visibili.
  const { t } = useLanguage();

  const user = useAuth();

  // ── RC login globale — registra l'utente in RevenueCat non appena Firebase autentica ──
  useEffect(() => {
    if (!window.IS_NATIVE_APP || !user?.uid) return;
    import('@revenuecat/purchases-capacitor').then(({ Purchases: RC }) => {
      RC.logIn({ appUserID: user.uid })
        .catch(e => console.warn('[App] RC logIn error:', e));
    });
  }, [user?.uid]);

  const [forceUpdate, setForceUpdate] = useState(false);

  useEffect(() => {
    if (!window.IS_NATIVE_APP || !db) return;
    (async () => {
      try {
        const { App: CapApp } = await import('@capacitor/app');
        const info = await CapApp.getInfo();
        db.ref('config/minVersion').once('value').then(snap => {
          const min = snap.val();
          if (min && needsUpdate(info.version, min)) setForceUpdate(true);
        });
      } catch (e) {
        console.warn('[forceUpdate] check failed:', e);
      }
    })();
  }, []);

  const [privacyAccepted, setPrivacyAccepted] = useState(
    () => !!localStorage.getItem('lif_privacy_accepted')
  );
  const [screen, setScreen] = useState('home');
  const [gameId, setGameId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isPlayer, setIsPlayer] = useState(false);
  const [playerId, setPlayerId] = useState(null);

  const [lastGameSetup, setLastGameSetup] = useState(null);
  const [rejoinInfo, setRejoinInfo] = useState(null); // {gameId, playerId, playerName}
  const [gmResumeInfo, setGmResumeInfo] = useState(null); // {gameId, phase} — rientro narratore

  // Helper: naviga al PlayerScreen dai parametri game+player
  const openPlayerScreen = useCallback((g, p) => {
    if (!g || !p) return;
    setGameId(g);
    setPlayerId(p);
    setIsPlayer(true);
    setScreen('player');
  }, []);

  useEffect(()=>{
    console.log("App Initialized. Bootstrapping completed.");
    console.log("React App Mounted.");

    // 1) Web: leggi parametri dall'URL (browser o webview)
    const params = new URLSearchParams(window.location.search);
    const g = params.get('game');
    const p = params.get('player');
    if(g && p){ openPlayerScreen(g, p); return; }

    // 2b) Controlla sessione salvata per recupero (chiusura accidentale)
    try {
      const saved = localStorage.getItem('lif_rejoin');
      if (saved) {
        const { gameId: sg, playerId: sp, savedAt } = JSON.parse(saved);
        const age = Date.now() - (savedAt || 0);
        if (sg && sp && age < 12 * 60 * 60 * 1000) { // valida 12 ore
          if (db) {
            db.ref(`games/${sg}/phase`).once('value').then(snap => {
              const ph = snap.val();
              if (ph && ph !== 'ended') {
                // Recupera anche il nome del giocatore
                db.ref(`games/${sg}/players/${sp}/name`).once('value').then(ns => {
                  setRejoinInfo({ gameId: sg, playerId: sp, playerName: ns.val() || '?' });
                });
              } else {
                localStorage.removeItem('lif_rejoin');
              }
            }).catch(() => {});
          }
        } else {
          localStorage.removeItem('lif_rejoin');
        }
      }
    } catch(e) { localStorage.removeItem('lif_rejoin'); }

    // 2c) Sessione NARRATORE: senza questo, un ricaricamento della sua pagina
    // lascia il tavolo senza narratore e la partita è irrecuperabile.
    try {
      const savedGm = localStorage.getItem('lif_gm_session');
      if (savedGm) {
        const { gameId: mg, savedAt } = JSON.parse(savedGm);
        const age = Date.now() - (savedAt || 0);
        if (mg && age < 12 * 60 * 60 * 1000 && db) {
          db.ref(`games/${mg}/phase`).once('value').then(snap => {
            const ph = snap.val();
            if (ph && ph !== 'ended') setGmResumeInfo({ gameId: mg, phase: ph });
            else localStorage.removeItem('lif_gm_session');
          }).catch(() => {});
        } else if (!mg || age >= 12 * 60 * 60 * 1000) {
          localStorage.removeItem('lif_gm_session');
        }
      }
    } catch(e) { localStorage.removeItem('lif_gm_session'); }

    // 2) Native app: gestisci deep link lupus://join?game=XXX&player=YYY&dt=TOKEN
    // Il parametro dt trasporta il token dispositivo dalla pagina web: senza, l'app
    // ne genererebbe uno nuovo (localStorage separato) e verrebbe scambiata per un ladro di QR.
    const adoptDeviceToken = (url) => {
      const dt = url.searchParams.get('dt');
      const g  = url.searchParams.get('game');
      if (!dt || !g) return;
      try {
        // Solo se non abbiamo già un token per QUESTA partita: altrimenti un link
        // ricevuto da qualcun altro sovrascriverebbe il nostro e ci farebbe espellere.
        const key = deviceTokenKey(g);
        if (!localStorage.getItem(key)) localStorage.setItem(key, dt);
      } catch {}
    };
    const setupDeepLink = async () => {
      try {
        const { App: CapApp } = await import('@capacitor/app');
        // App già aperta — gestisci il link in arrivo
        CapApp.addListener('appUrlOpen', (event) => {
          try {
            const url = new URL(event.url);
            adoptDeviceToken(url);
            openPlayerScreen(url.searchParams.get('game'), url.searchParams.get('player'));
          } catch(e) { console.warn('Deep link parse error:', e); }
        });
        // App appena aperta tramite deep link (cold start)
        const launchUrl = await CapApp.getLaunchUrl();
        if (launchUrl?.url) {
          try {
            const url = new URL(launchUrl.url);
            adoptDeviceToken(url);
            openPlayerScreen(url.searchParams.get('game'), url.searchParams.get('player'));
          } catch(e) {}
        }
      } catch(e) {
        // @capacitor/app non disponibile (web build) — nessun problema
      }
    };
    setupDeepLink();
  },[openPlayerScreen]);

  const handleCreateGame = (withRoles, gid, _narratorName, publicVote = true) => {
    // Save to Firebase
    if(db){
      // isNarrator va salvato: senza, al rientro del narratore in una partita in corso
      // si perderebbe chi è il narratore-giocatore e la sua scheda ruolo sparirebbe.
      const fbPlayers = withRoles.reduce((acc,p)=>({...acc,[p.id]:{
        name:p.name, role:p.role, alive:true, ready:false,
        ...(p.isNarrator ? {isNarrator:true} : {})
      }}),{});
      db.ref(`games/${gid}`).set({ id:gid, phase:'waiting', createdAt:Date.now(), players:fbPlayers, publicVote });
    }
    // Sessione narratore: permette di rientrare se la pagina ricarica a partita in corso
    try {
      localStorage.setItem('lif_gm_session', JSON.stringify({ gameId: gid, savedAt: Date.now() }));
    } catch(e) {}
    setPlayers(withRoles);
    setGameId(gid);
    setScreen('master');
  };

  // Rientro del narratore in una partita in corso dopo un ricaricamento.
  // Ricostruisce la lista giocatori da Firebase: GameMasterScreen la riceve come prop
  // e da lì reidrata il resto (fase, giorno, passo notturno) al montaggio.
  const resumeAsNarrator = useCallback(async (gid) => {
    if (!db || !gid) return;
    const snap = await db.ref(`games/${gid}`).once('value');
    const g = snap.val();
    if (!g || !g.players) return;
    const rebuilt = Object.entries(g.players).map(([id, p]) => ({
      id, name: p.name, role: p.role,
      alive: p.alive !== false, ready: !!p.ready,
      ...(p.originalRole ? { originalRole: p.originalRole } : {}),
      ...(p.isNarrator ? { isNarrator: true } : {}),
    }));
    setPlayers(rebuilt);
    setGameId(gid);
    setScreen('master');
    setGmResumeInfo(null);
  }, []);

  const handleEndGame = (result, setup) => {
    // Partita chiusa: la sessione narratore non serve più, altrimenti al prossimo
    // avvio comparirebbe un banner che invita a rientrare in una partita finita.
    try { localStorage.removeItem('lif_gm_session'); } catch(e) {}
    setGmResumeInfo(null);
    try {
      const h = JSON.parse(localStorage.getItem('lupus_history')||'[]');
      h.unshift(result);
      localStorage.setItem('lupus_history', JSON.stringify(h.slice(0,30)));
    } catch(e){}
    // Write stats if user is logged in
    if (user?.uid) {
      writeGameStats(user.uid, result).catch(e => console.warn('Stats write error:', e));
    }
    // Richiesta recensione App Store — dopo la 2a e la 5a partita
    try {
      const gamesPlayed = parseInt(localStorage.getItem('lif_games_played') || '0', 10) + 1;
      localStorage.setItem('lif_games_played', String(gamesPlayed));
      if (gamesPlayed === 2 || gamesPlayed === 5) {
        const isNative = !!(window.Capacitor?.isNativePlatform?.());
        if (isNative && APP_STORE_URL && !APP_STORE_URL.includes('id000000000')) {
          const reviewUrl = APP_STORE_URL
            .replace('https://apps.apple.com', 'itms-apps://itunes.apple.com')
            + '?action=write-review';
          window.open(reviewUrl, '_system');
        }
      }
    } catch(e){}
    if (setup) {
      setLastGameSetup(setup);
      setScreen('create');
    } else {
      setLastGameSetup(null);
      setScreen('home');
    }
  };

  if(screen==='player') {
    return (
      <div style={{background:'#0d1117', minHeight:'100vh'}}>
        <StarField/>
        <PlayerScreen gameId={gameId} playerId={playerId}/>
      </div>
    );
  }

  const handlePrivacyAccept = () => {
    localStorage.setItem('lif_privacy_accepted', 'true');
    setPrivacyAccepted(true);
  };

  return (
    <div style={{background:'#0d1117', minHeight:'100vh'}}>
      <StarField/>

      {/* Gate privacy — blocca tutto finché l'utente non accetta */}
      {!privacyAccepted && <PrivacyConsentModal onAccept={handlePrivacyAccept} />}

      {screen==='home' && (
        <>
          <HomeScreen
            onCreateGame={()=>setScreen('create')}
            onViewHistory={()=>setScreen('history')}
            onProfile={()=>setScreen('profile')}
          />
          {/* Banner rientro NARRATORE — ha la precedenza: senza narratore il tavolo è fermo */}
          {/* Il narratore ha la precedenza sul rientro da giocatore. Prima era il
              contrario e la sessione giocatore nascondeva del tutto questo banner: chi
              aveva giocato una partita precedente sullo stesso telefono, e poi ospitava,
              si ritrovava nella schermata del vecchio giocatore. Senza narratore il
              tavolo è bloccato; un giocatore invece può sempre rifare il QR. */}
          {gmResumeInfo && (
            <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-3"
                 style={{background:'linear-gradient(to top, rgba(11,10,20,1) 60%, transparent)'}}>
              <div className="rounded-2xl px-4 py-4"
                   style={{background:'rgba(226,201,126,0.12)', border:'1px solid rgba(226,201,126,0.45)',
                           boxShadow:'0 0 24px rgba(226,201,126,0.15)'}}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">📜</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold leading-tight">{t('rejoin.gmInProgress')}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {t('rejoin.gmMatch')} <span className="text-white font-semibold">#{gmResumeInfo.gameId}</span>
                    </p>
                  </div>
                  <button onClick={() => { localStorage.removeItem('lif_gm_session'); setGmResumeInfo(null); }}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors text-lg leading-none"
                    style={{background:'rgba(255,255,255,0.07)'}}>✕</button>
                </div>
                <button onClick={() => resumeAsNarrator(gmResumeInfo.gameId)}
                        className="btn-gold w-full py-3 rounded-xl text-sm">
                  {t('rejoin.gmResume')}
                </button>
              </div>
            </div>
          )}

          {/* Banner recupero sessione — appare se il giocatore aveva una partita aperta */}
          {rejoinInfo && !gmResumeInfo && (
            <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-3"
                 style={{background:'linear-gradient(to top, rgba(11,10,20,1) 60%, transparent)'}}>
              <div className="rounded-2xl px-4 py-4"
                   style={{background:'rgba(185,28,28,0.12)', border:'1px solid rgba(185,28,28,0.4)',
                           boxShadow:'0 0 24px rgba(185,28,28,0.15)'}}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🔴</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold leading-tight">{t('rejoin.inProgress')}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {t('rejoin.connectedAs')} <span className="text-white font-semibold">{rejoinInfo.playerName}</span>
                    </p>
                  </div>
                  <button onClick={() => { localStorage.removeItem('lif_rejoin'); setRejoinInfo(null); }}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:text-white transition-colors text-lg leading-none"
                    style={{background:'rgba(255,255,255,0.07)'}}>✕</button>
                </div>
                <button
                  onClick={() => {
                    openPlayerScreen(rejoinInfo.gameId, rejoinInfo.playerId);
                    setRejoinInfo(null);
                  }}
                  className="btn-gold w-full py-3.5 rounded-xl text-sm font-bold">
                  {t('rejoin.resume')}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {screen==='profile' && (
        <ProfileScreen user={user} onBack={()=>setScreen('home')} />
      )}

      {screen==='create' && (
        <CreateGameScreen
          onStart={handleCreateGame}
          onBack={()=>{ setLastGameSetup(null); setScreen('home'); }}
          initialSetup={lastGameSetup}
          userId={user?.uid}
        />
      )}

      {screen==='master' && (
        <GameMasterScreen
          gameId={gameId}
          players={players}
          onEndGame={handleEndGame}
          onBack={()=>setScreen('home')}
          onBackToCreate={(setup)=>{ setLastGameSetup(setup || null); setScreen('create'); }}
          userId={user?.uid}
        />
      )}

      {screen==='history' && (
        <HistoryScreen onBack={()=>setScreen('home')}/>
      )}

      {/* SetupModal rimosso — era flaggato da Apple come beta feature (Guideline 2.2) */}

      {forceUpdate && (
        <div style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(11,10,20,0.97)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem',textAlign:'center'}}>
          <div style={{fontSize:'4rem',marginBottom:'1.5rem'}}>🐺</div>
          <h2 style={{fontSize:'1.5rem',fontWeight:'bold',color:'#eacc85',marginBottom:'0.75rem',fontFamily:'Cinzel,serif'}}>{t('forceUpdate.title')}</h2>
          <p style={{color:'rgba(255,255,255,0.65)',marginBottom:'2rem',maxWidth:'280px'}}>{t('forceUpdate.body')}</p>
          <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" style={{background:'#eacc85',color:'#0b0a14',fontWeight:'bold',padding:'1rem 2rem',borderRadius:'1rem',fontSize:'1.1rem',textDecoration:'none'}}>
            {t('forceUpdate.cta')}
          </a>
        </div>
      )}
    </div>
  );
}
