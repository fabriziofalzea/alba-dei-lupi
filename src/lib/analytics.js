/**
 * Wrapper minimo per Firebase Analytics.
 * Non inizializza l'app Firebase: si aggancia a quella già avviata da App.jsx
 * (initFirebase()) così l'ordine di import di moduli come usePurchases.js
 * non conta e non c'è rischio di doppia inizializzazione con config diversa.
 */
import firebase from 'firebase/compat/app';
import 'firebase/compat/analytics';

let analytics = null;
let tried = false;

/**
 * Accende Analytics all'avvio dell'app. Senza questa chiamata, Analytics si
 * attivava solo alla prima trackEvent (tutte nel paywall): chi non apriva il
 * paywall non veniva contato nemmeno come sessione, e la console mostrava
 * zero utenti attivi mentre il database macinava traffico vero.
 */
export function initAnalytics() {
  try {
    if (tried) return;
    tried = true;
    if (firebase.apps.length) analytics = firebase.analytics();
  } catch (e) {
    console.warn('[analytics] init error:', e?.message);
  }
}

export function trackEvent(name, params = {}) {
  try {
    if (!tried) {
      tried = true;
      if (firebase.apps.length) analytics = firebase.analytics();
    }
    analytics?.logEvent(name, params);
  } catch (e) {
    console.warn('[analytics] logEvent error:', e?.message);
  }
}
