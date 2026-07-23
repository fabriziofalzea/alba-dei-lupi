import { useCallback, useSyncExternalStore } from 'react';
import { IT, EN } from './translations';

const DICTS = { it: IT, en: EN };
const SUPPORTED = ['it', 'en'];
const STORAGE_KEY = 'lif_lang';

function detectInitialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (SUPPORTED.includes(saved)) return saved;
  } catch (e) {}
  const nav = (navigator.language || navigator.userLanguage || 'it').slice(0, 2).toLowerCase();
  return SUPPORTED.includes(nav) ? nav : 'it';
}

let currentLang = detectInitialLang();
const listeners = new Set();

function notify() { listeners.forEach(fn => fn()); }

export function getLang() { return currentLang; }

export function setLang(lang) {
  if (!SUPPORTED.includes(lang) || lang === currentLang) return;
  currentLang = lang;
  try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  notify();
}

export function subscribeLang(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function resolvePath(dict, key) {
  return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), dict);
}

function interpolate(str, vars) {
  if (!vars) return str;
  return Object.entries(vars).reduce((s, [k, v]) => s.split(`{{${k}}}`).join(v), str);
}

export function t(key, vars) {
  let val = resolvePath(DICTS[currentLang], key);
  if (val === undefined) val = resolvePath(IT, key);
  if (val === undefined) return key;
  return typeof val === 'string' ? interpolate(val, vars) : val;
}

export function useLanguage() {
  const lang = useSyncExternalStore(subscribeLang, getLang, getLang);
  const translate = useCallback((key, vars) => t(key, vars), [lang]);
  return { lang, setLang, t: translate };
}
