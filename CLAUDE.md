# LUPUS IN FABULA — Claude Code Instructions

> Agente specializzato di Jarvis per lo sviluppo e la gestione dell'app Lupus In Fabula.
> Versione: 1.4 (web) / 1.3.1 (iOS) | Aggiornato: 2026-08-09

---

## Ruolo

Sei il dev assistant dedicato per Lupus In Fabula. Hai piena conoscenza dell'architettura, dello stato di sviluppo, delle decisioni prese e dei fix critici. Non proponi modifiche architetturali senza aver letto `AI_SYNC.md` — è la fonte di verità del progetto.

Regole comportamentali: vedi `../Jarvis/CLAUDE.md` (profilo utente, stile, proattività).

---

## App

| Info | Valore |
|---|---|
| **Nome** | Lupus In Fabula |
| **Bundle ID** | `com.lupusinfabula.app` |
| **App Store ID** | `id6764061104` |
| **App Store URL** | `https://apps.apple.com/app/lupus-in-fabula/id6764061104` |
| **Web (Vercel)** | `https://lupus-in-fabula-eight.vercel.app` |
| **Stato** | iOS: v1.3.1 (build 5) live dal 2026-07-27, 16 paesi. Web: avanti a iOS con le modifiche gameplay del 2026-08-09 |
| **Live iOS** | v1.3.1 (build 5) |
| **Live web** | modifiche gameplay 2026-08-09 (non ancora nell'app nativa) |

---

## Stack

| Layer | Tecnologia |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Mobile | Capacitor (iOS) |
| Backend API | Vercel Serverless Functions (`api/speak.js`, `api/voices.js`) |
| Database/Auth | Firebase Realtime Database + Email Auth (Google/Apple rimandati a v1.3+) |
| Voce AI | ElevenLabs — voce Daniel (`onwK4e9ZLuTAKqWW03F9`) |
| Monetizzazione | RevenueCat + App Store Connect IAP |
| Deep linking | Schema `lupus://` |

---

## Modello di business

Freemium con pack IAP:

| Pack | Prezzo | Contenuto |
|---|---|---|
| Pack Ombre | €1,99 | strega, figlio_dei_lupi, cacciatore, medium, **indemoniato** |
| Pack Villaggio | €1,99 | cupido, sindaco, sciamano, mitomane |
| Pack Narratore | €1,99 | Voce AI narratore |
| Combo | €4,99 | Tutti e tre |

Prodotti App Store Connect: `pack_ombre`, `pack_villaggio`, `pack_narratore`, `pack_combo`.

---

## File di riferimento

| File | Contenuto |
|---|---|
| `AI_SYNC.md` | **Fonte di verità** — architettura, fix critici, to-do |
| `NARRATOR_RECORDING_GUIDE.md` | Guida registrazione 31 MP3 statici narratore (IT) |
| `NARRATOR_RECORDING_GUIDE_EN.md` | Stessa guida in inglese — audio EN non ancora registrato |
| `src/App.jsx` | Entry point principale — `APP_STORE_URL`, `FIREBASE_CONFIG`, `PACKS`, `needsUpdate()` |
| `src/i18n/translations.js` | Dizionari IT/EN (i18n, aggiunto 2026-07-22) |
| `src/i18n/i18n.js` | Store lingua + `t()` + hook `useLanguage()` (i18n, aggiunto 2026-07-22) |
| `src/hooks/usePurchases.js` | Hook RevenueCat — accetta `userId` per RC.logIn |
| `api/speak.js` | Proxy ElevenLabs TTS |
| `api/voices.js` | Lista voci ElevenLabs |
| `vercel.json` | Config deploy Vercel |
| `public/narrator/` | 31 MP3 statici narratore IT (risparmio ~94% API) — `public/narrator/en/` non ancora popolata |

---

## Note critiche

- **Leggere sempre `AI_SYNC.md` prima di proporre modifiche**
- Modalità narratore default: **Script** (solo testo). Voce AI va attivata nelle impostazioni
- Su iOS nativo: chiamate TTS usano dominio hardcoded `lupus-in-fabula-eight.vercel.app`
- Su web: chiamate TTS usano `window.location.origin`
- `APP_STORE_URL` in cima a `src/App.jsx` — punto unico di modifica
- Il push git **NON** triggera deploy automatico — usare sempre `npx vercel --prod`
- Stats tracciate solo per utenti registrati (leva conversione registrazione)
- **Force update**: attivare con `config/minVersion` su Firebase Console — NON farlo prima che la versione target sia live su App Store
- **RC identificazione**: `usePurchases(userId)` — passare sempre `user?.uid` dalle schermate che usano l'hook

---

## Deploy (workflow completo)

```bash
# 1. Build web + deploy Vercel
cd "/Users/fabriziofalzea/Documents/Claude/Projects/Lupus In Fabula"
npx vercel --prod

# 2. Sync iOS
npx cap sync ios

# 3. Bump versione in project.pbxproj (MARKETING_VERSION + CURRENT_PROJECT_VERSION)

# 4. Archive
xcodebuild \
  -workspace "ios/App/App.xcworkspace" \
  -scheme App -configuration Release \
  -archivePath "/tmp/LupusInFabula.xcarchive" \
  -destination "generic/platform=iOS" \
  CODE_SIGN_STYLE=Automatic DEVELOPMENT_TEAM=38498XM6PJ \
  archive

# 5. Upload via Xcode Organizer
open -a Xcode "/tmp/LupusInFabula.xcarchive"
```

---

## Rilasci

| Versione | Build | Data | Stato |
|---|---|---|---|
| 1.0 | 1 | 2026-05-09 | ✅ Live |
| 1.1 | 2 | 2026-05-09 | ✅ Live (fix paywall Voce AI) |
| 1.2 | 3 | 2026-05-12 | ✅ Live (RC login UID + force update) |
| 1.3 | 4 | 2026-07-24 | ✅ Live — approvata 2026-07-25/26, disponibile in 16 paesi (Italia + 15 esteri) |
| 1.3.1 | 5 | 2026-07-26 | ✅ Live — approvata 2026-07-27, Firebase Analytics (paywall_view, purchase_attempt/success/cancel/error) |
| 1.4 | — | 2026-08-09 | 🟡 **Solo web** — gameplay (Indemoniato, Mitomane, voto palese, fix QR). Build iOS non ancora fatta |

**Storia sblocco upload 1.3(4) (2026-07-23):** tre ostacoli in sequenza, tutti risolti:
1. `403 REQUIRED_AGREEMENTS_MISSING_OR_EXPIRED` — Apple Developer Program License Agreement da riaccettare (solo titolare account, no via API). Fabrizio l'ha accettato su developer.apple.com → risolto (con qualche minuto di propagazione lato Apple).
2. `No signing certificate "iOS Distribution" found` — la API key (`AuthKey_5BYRV5N922.p8`, ruolo "Gestore dell'app") non basta a firmare per la distribuzione, serve un certificato di Distribuzione nel keychain locale.
3. `Cloud signing permission error` — anche con `-allowProvisioningUpdates`, la API key non ha permesso di generare certificati (limite di ruolo). **Fix:** Fabrizio ha fatto login in Xcode → Settings → Accounts col proprio Apple ID (sessione utente, non API key). Rilanciando `xcodebuild -exportArchive` **senza** i flag `-authenticationKey*` (lasciando xcodebuild usare la sessione Xcode invece della API key) → certificato generato al volo, upload riuscito.

Comando finale funzionante: `xcodebuild -exportArchive -archivePath releases/LupusInFabula-1.3-build4.xcarchive -exportPath /tmp/export -exportOptionsPlist <plist method=app-store-connect,destination=upload> -allowProvisioningUpdates` (richiede un Apple ID loggato in Xcode con permessi da account holder — la API key locale non basta per firmare, solo per chiamate API pure).

Archive originale conservato in `releases/LupusInFabula-1.3-build4.xcarchive` (gitignored, 93MB) per eventuali re-upload futuri.

**Submission completata (2026-07-24):** conformità crittografica compilata (standard/exempt — solo HTTPS), 15 paesi attivati (Italia + USA, UK, Canada, Australia, Irlanda, Islanda, Nuova Zelanda, Paesi Bassi, Norvegia, Danimarca, Svezia, Svizzera, Singapore, Albania), versione 1.3 creata con build 4 agganciata, localizzazione English (U.S.) aggiunta (nome/sottotitolo su "Informazioni sull'app", il resto su pagina versione), screenshot EN caricati, "Aggiungi alla verifica" + invio finale fatto da Fabrizio. **In revisione Apple.**

⚠️ **Da fare quando si riapre l'app (non bloccante, scadenza 7 settembre 2026):** rispondere alle nuove domande di classificazione età sulle funzionalità social in "Informazioni sull'app" — l'app non ha chat/UGC/messaggistica, risposte attese "No" — da confermare leggendo le domande esatte.

✅ **Deploy WEB sbloccato (2026-07-26):** Fabrizio ha rifatto `vercel login` (device auth flow), token rinnovato. `lupus-in-fabula-eight.vercel.app` ora live con i18n IT/EN + Firebase Analytics — deploy fatto con `npx vercel --prod`.

**1.3.1 (build 5, 2026-07-26):** aggiunta instrumentazione Firebase Analytics — colma il gap noto (nessun evento tracciato) citato in "Monitoraggio stats" più sotto. Google Analytics abilitato sul progetto Firebase (property GA4, `measurementId: G-C4H6ZQC34H`, aggiunto a `FIREBASE_CONFIG` in `src/App.jsx`). Nuovo file `src/lib/analytics.js` (wrapper `trackEvent`, si aggancia all'app Firebase già inizializzata, no doppia init). Eventi: `paywall_view` (in `PaywallModal`), `purchase_attempt`/`purchase_success`/`purchase_cancel`/`purchase_error` (in `usePurchases.js`, solo path nativo RevenueCat, non nel mock web/dev). Archive + export + upload su App Store Connect fatti da Claude Code via `xcodebuild` (stesso comando/flusso documentato per 1.3/4 — sessione Xcode con Apple ID, no API key). Build agganciata, testo promozionale e novità versione (IT/EN) compilati, conformità crittografica confermata esente (solo HTTPS via API di sistema, "Nessuno degli algoritmi citati sopra"), "Aggiungi alla verifica" + invio finale fatti da Fabrizio (2026-07-26). **Approvata e live dal 2026-07-27.**

---

## Monitoraggio stats (attivo dal 2026-07-24)

- **App Store Connect Analytics**: nessuno script — check diretto via browser (sessione autenticata) su richiesta.
- **RevenueCat**: `monitor_revenuecat.mjs` — API v2 `/metrics/overview`. Credenziali in `.env` (gitignored): `REVENUECAT_SECRET_KEY` (⚠️ deve essere formato **V2**, la dashboard distingue le chiavi legacy da quelle v2 alla creazione) + `REVENUECAT_PROJECT_ID=f64d78ac`.
- **Limite noto RevenueCat**: la metrica "Revenue" dell'endpoint overview **non include gli acquisti non-subscription** (i pack sono "non consumable") — mostra $0 anche con vendite reali. Per il dato preciso: endpoint `non-subscription_purchases` o "Recent Transactions" nella dashboard.
- **Decisione (2026-07-24):** niente spesa pubblicitaria finché la conversione a pagamento resta bassa (2% dopo 35gg) e manca instrumentazione Firebase Analytics nel codice (nessun evento tracciato — gap identificato dalla code-review, mai chiuso). Vedi `Product & Growth/piano_vendite_lupus_2026-07.md` per il piano completo.

---

## To-do (v1.3+)

| Priorità | Azione |
|---|---|
| 🔴 | **Build iOS 1.4** — le modifiche gameplay del 2026-08-09 sono live solo sul web, l'app nativa è ferma a 1.3.1 |
| 🔴 | **Partita di prova multi-dispositivo** prima della submission 1.4: Mitomane, Indemoniato, voto palese e fix QR non sono mai stati provati in una partita vera |
| 🟡 | Verificare restrizione geografica (Afghanistan, Marocco — 13+) |
| 🟡 | Sign in with Apple — Xcode entitlement + Firebase provider Apple |
| 🟡 | UX: feedback post-acquisto pack narratore |
| 🟡 | Rispondere alle domande di classificazione età sulle funzionalità social (scadenza **7 settembre 2026**) — risposte attese "No", l'app non ha chat/UGC |
| 🟢 | Universal Links (`apple-app-site-association` su Vercel) — da includere nella build 1.4: renderebbero superfluo il pulsante "Apri app" |
| ✅ | ~~Attivare `config/minVersion`~~ — fatto per v1.2 |

### Sviluppi futuri (idee, non pianificate)

| Idea | Note |
|---|---|
| **Share del QR per giocare a distanza** | Oggi il QR presuppone che tutti siano nella stessa stanza (lo si inquadra dallo schermo del narratore). Poter *condividere* il link del giocatore (WhatsApp, AirDrop…) aprirebbe al gioco da remoto. ⚠️ Da valutare con attenzione: il gioco da remoto rende necessaria una qualche forma di comunicazione fra giocatori → si ricade nel problema UGC/moderazione già scartato per la chat lupi (Guideline 1.2 + classificazione età). Verificare anche che la guardia `deviceToken` non blocchi il flusso di condivisione. |
| ✅ | ~~Traduzioni EN~~ — sistema i18n IT/EN + audio narratore EN + prezzi localizzati FATTI in locale (branch `feat/i18n-en`, 2026-07-23), da rivedere e deployare — vedi AI_SYNC.md |

---

*Lupus In Fabula v1.2 — Agente Jarvis*

---

## Sessione 2026-08-09 — gameplay + fix

**Deployata solo sul web** (`lupus-in-fabula-eight.vercel.app`). L'app nativa resta a 1.3.1.

### Nuovo ruolo: Indemoniato (`indemoniato`)
Traditore nel villaggio. `team: 'villaggio'` (conta come villico nel calcolo vittoria **e la Veggente lo vede innocente**) ma `winsWith: 'lupi'`. Flag `knowsWolves: true` → vede la lista lupi. Si sveglia la prima notte senza azione (auto-avanza come il Figlio dei Lupi). Assegnato al **Pack Ombre**. Nome EN: *Minion*. Audio narratore IT+EN generati.

### Modifiche gameplay
- **Mitomane**: eredita **subito** ruolo, poteri e squadra dell'imitato (prima era solo un camuffamento per la Veggente — la funzione non era mai stata implementata)
- **Lupi/Indemoniato si riconoscono**: pannello "Il tuo branco" nella schermata giocatore, lista ricalcolata dal vivo → il Figlio dei Lupi ci entra appena si trasforma
- **Voto palese/segreto**: toggle a inizio partita (`gameData.publicVote`, default palese). Se palese: nomi dei votanti, conteggio voti ricevuti, elenco di chi non ha ancora votato
- **Nascondi ruolo**: pulsante 🙈 sulla carta girata (`RoleCard` prop `onHide`)
- **Narratore vota**: il voto c'era già ma era sepolto dietro il FAB "Il mio ruolo" — ora il FAB diventa rosso e pulsa
- **Log partita**: gli eventi `day` registrano anche `votes` e `tally`, il recap mostra chi ha votato chi
- **Bilanciamento**: il consigliere contava solo `wolfCount`, quindi con l'Indemoniato dichiarava "bilanciamento perfetto" mentre il villaggio era in svantaggio. Ora conta le **forze del male totali** (`wolfCount` + ruoli con `winsWith: 'lupi'`) contro lo stesso `recommended`, e al passo 3 mostra la composizione (`🐺 2 + 😈 1 = 3`). ⚠️ La soglia `recommended` **non è stata ritarata**: l'assunzione è che un Indemoniato pesi quanto un lupo. Da rivedere dopo qualche partita reale — l'Indemoniato non uccide, ma nel calcolo vittoria vale come villico, quindi non cambia il numero di morti necessari ai lupi e regala loro un informatore

### Bug risolti (non erano in lista)
1. **Sequenza notturna in desync** — `nightStep` è un indice in un array ricalcolato a ogni render da `presentRoleIds`. Qualunque cambio di ruolo a notte in corso (Mitomane, Strega che avvelena) riordinava l'array facendo saltare o ripetere uno step. Ora `buildNightSteps()` la congela a inizio notte, in **tutti e 4** i punti d'ingresso alla fase notte. `pStatesRef` serve a leggere lo stato aggiornato dentro i `setTimeout` (la closure è vecchia di 10s e non vedrebbe l'eliminazione appena avvenuta).
2. **Chiave ElevenLabs invalida su Vercel** — conteneva un *API key ID* invece della chiave. Il demo "Ascolta un esempio" nel paywall del Pack Narratore era **muto in produzione**, con fallimento silenzioso: danno diretto alla conversione del pack. Risolto sostituendo la env var. ⚠️ `vercel env ls` mostra i valori in un involucro cifrato (`eyJ2IjoidjIi…` = `{"v":"v2","c":…` in base64) e la colonna data è la *creazione*, non l'aggiornamento: **non è utilizzabile per verificare** se una variabile è stata aggiornata — testare sempre l'endpoint.
3. **Pulsante "Apri app" dal QR sempre rotto** — la guardia anti-furto salva un `deviceToken` su Firebase, ma Safari e la WebView nativa hanno `localStorage` separati: l'app generava un token nuovo sullo stesso telefono e veniva scambiata per un ladro di QR, senza via d'uscita. Ora il deep link trasporta il token (`&dt=`) e l'app lo adotta; in più la schermata d'errore ha un pulsante "Continua su questo dispositivo".

### Generazione audio narratore
`generate_narrator_audio.mjs` e `_en.mjs` ora usano la chiave locale da `.env` se presente (`node --env-file=.env generate_narrator_audio.mjs`), altrimenti il proxy Vercel. Parametri voce identici a `api/speak.js` così i file nuovi suonano come i 31 esistenti.

### Scartato consapevolmente
**Chat fra lupi**: richiederebbe filtro contenuti, segnalazione e blocco utenti (Guideline 1.2) e ribalterebbe la risposta al questionario di classificazione età in scadenza. Il bisogno di coordinamento è coperto dal pannello "Il tuo branco".
