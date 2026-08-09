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
