# Lupus In Fabula - AI Sync Document

Questo file serve a mantenere sincronizzati gli assistenti IA (come me e Claude) sullo stato del progetto, le architetture scelte e i fix critici effettuati. **Leggere sempre questo file prima di proporre nuove modifiche architetturali.**

## 🏗 Architettura Attuale
- **Frontend**: React 18, Vite, Tailwind CSS. Cartella di build: `www`.
- **Backend/Funzioni**: Vercel Serverless Functions (cartella `api/`). Sostituisce il vecchio Netlify. Le funzioni proxyano ElevenLabs (`api/speak.js` e `api/voices.js`).
- **Mobile**: L'app nativa viene generata e incapsulata su iOS e Android tramite **Capacitor**.
- **Database/Auth**: Firebase Realtime Database + Google Auth / Email Auth. Le chiavi sono preconfigurate.

## ✅ Ultimi Lavori Svolti

1. **Fix: Blocco "Schermata dello Stregone/Narratore" su iOS (WKWebView)**
   - *Problema*: Su iPhone, Safari blocca l'auto-riproduzione dell'audio se non c'è interazione utente diretta per quell'azione. Il codice andava in scarto (`.catch()`) sulla Promise di `audio.play()`, ma **non** inviava l'evento globale `narrator_end`. La state machine del gioco restava "appesa" in attesa della fine della voce.
   - *Soluzione*: Aggiunto in `src/App.jsx` (`window._playAudioBlob`) un blocco catch esplicito che forza l'esecuzione di `window.dispatchEvent(new Event('narrator_end'))`, sbloccando la fase del gioco anche in assenza di modulo voce.

2. **Migrazione Backend API da Netlify a Vercel**
   - Rimossa la dipendenza da Netlify per le operazioni Text-To-Speech.
   - Creati script standard cloud per Vercel: `api/speak.js` e `api/voices.js`.
   - Aggiunto file `vercel.json` per forzare comandi personalizzati (installazione di `vite build` su directory finale `www`) ed esplicitato le intestazioni CORS.

3. **Integrazione Vercel Origin Handler**
   - Su web: `src/App.jsx` ora rileva in assoluto l'host web chiamante (`window.location.origin`), rendendo perfette e sicure le chiamate backend aggirando il "Vercel Authentication block".
   - Su mobile: L'app iOS interroga un host virtuale (`capacitor://localhost`). Siccome questo invalida il path relativo, il codice prevede il fallback *hardcoded* su dominio assoluto pubblico.

4. **Fix: EL_DEFAULT_VOICE e EL_VOICES non definiti (crash voce AI)**
   - *Problema*: `EL_DEFAULT_VOICE` e `window.EL_VOICES` erano usati in `window.getELConfig()` e nel fallback del caricamento voci ma mai dichiarati → `ReferenceError` a runtime, la voce AI crashava silenziosamente.
   - *Soluzione*: Aggiunte le definizioni in cima a `src/App.jsx` prima di `window.getELConfig`. Default voice: Daniel (`onwK4e9ZLuTAKqWW03F9`). Lista statica di 6 voci ElevenLabs come fallback.

5. **Feature: Monetizzazione — UI Gate (Fase 1)**
   - Rimosso ruolo `lupo_alfa` (semplificazione roster).
   - Aggiunti campi `pack` ai ruoli: `strega`, `figlio_dei_lupi`, `cacciatore`, `medium` → pack `ombre`; `cupido`, `sindaco`, `sciamano`, `mitomane` → pack `villaggio`.
   - Costante `PACKS`: `ombre` (€1,99), `villaggio` (€1,99), `narratore` (€1,99), `combo` (€4,99, include tutti e tre).
   - Role picker ristrutturato in card per pack: ruoli bloccati → opacity 0.55 + 🔒 badge + onClick apre `PaywallModal`.
   - `PaywallModal`: gestisce pack singoli, pack `narratore` (senza ruoli), pack `combo` (prezzi barrati + CTA upsell).
   - `purchasedPacks` in `localStorage` chiave `lif_purchased_packs`. Il bottone "Acquista" salva in localStorage (test UI, non IAP reale).
   - **Prossimo step**: Fase 2 — RevenueCat + App Store Connect product IDs.

6. **Feature: Profilo, Stats, Avatar, Classifica**
   - Costanti: `BG_GRADIENTS` (8 sfondi radiali), `AVATAR_ICONS` (12 emoji), `AURA_COLORS` (4 colori anello), `DEFAULT_AVATAR`.
   - `generateProfileComment(stats)` — commenti ironici/cinematografici template-based, nessun costo API.
   - `AvatarDisplay({ config, size })` — avatar circolare con sfondo gradiente, emoji e anello colorato.
   - `AvatarCreator({ config, onChange })` — editor interattivo (sfondo, icona, aura).
   - `writeGameStats(uid, gameResult)` — scrive su `users/{uid}/stats` in Firebase: gamesHosted, villaggioWins, lupiWins, rolesUsed, lastGame.
   - `ProfileScreen({ user, onBack })` — schermata completa con avatar editor, stats cards, win rate bar, commento cinematografico, classifica top-10.
   - Avatar salvato su `users/{uid}/avatar` (Firebase) + localStorage fallback (`lif_avatar`).
   - Stats scritte in `handleEndGame` quando utente loggato. Classifica = top 10 per gamesHosted.
   - HomeScreen: aggiunto bottone "👤 Il mio Profilo". App router: screen `'profile'` → `<ProfileScreen>`.

7. **Redesign UI/UX Ultra-Premium (Fase 2 Completata)**
   - Font primario `Lato` → **`Outfit`**; mantenuto `Cinzel` per titoli ed elementi gotici.
   - Paradigma **Glassmorphism**: overlay neri opachi → `backdrop-filter: blur(16px)` `.glass`.
   - Texture Film Noise diegetica via SVG `feTurbulence` sul `body::before` (poi rimossa in Fase 3).
   - Nuovo logo AI ad alta risoluzione integrato.
   - Palette: `#0b0a14` (bg), `#b91c1c` (rosso), `#eacc85` (oro). Bordi con inset shadow luminoso.
   - `GameMasterScreen`: `.sticky-bottom-bar` per comandi di avanzamento (ergonomia mobile).
   - 3D Narrator Face: anello luminoso pulsante in fase `speaking`.
   - HomeScreen: nebula drift, shimmer buttons, sfondi dinamici CSS.

8. **Redesign "Silente" & Pulizia (Fase 3 Completata)**
   - **Avatar Generator in Stile Silente**: placeholder emoji → avatar mezzo-busto esoterici (colori flat, linework vettoriale, border runici blu/oro).
   - **Restauro Logo App**: nuovo stemma ufficiale ad alta risoluzione (vettoriale + geometrie dark runiche narratore).
   - **Fix Build Xcode**: risolto crash `@capacitor/assets` per voci duplicate in `Contents.json` AppIcon. Rigenerate icone iOS e splash screen.
   - **Modernizzazione Testuale**: rimossi `text-shadow` glow/neon → oro metallico solido via `-webkit-background-clip: text` + `drop-shadow` minimalista.
   - **Rimozione Noise & Clouds**: eliminati `mist-layer` e layer SVG `feTurbulence` globale. Nitidezza totale su Desktop HD e mobile.
   - **Revert HomeScreen**: ripristinato anello CSS Luna rotante in attesa di grafica Luna 8K definitiva.
   - Etichetta Profilo rinominata da "Notti Sovrintese" → **"Partite Narrate"**.

9. **Feature: Deep Linking — Gioca dall'App via QR**
   - Registrato scheme `lupus://` in `ios/App/App/Info.plist` (CFBundleURLTypes).
   - Aggiunto `@capacitor/app ^6.0.0` in `package.json`.
   - In `App()`: handler `appUrlOpen` con dynamic import `@capacitor/app` — cold start (getLaunchUrl) + app già aperta.
   - Deep link format: `lupus://join?game=GAMEID&player=PLAYERID`.
   - Fix `appUrl` fallback: `fabriziofalzea.github.io/lupus-in-fabula/` → `lupus-in-fabula-eight.vercel.app/`.
   - `PlayerScreen` web: banner con CTA doppia — "Apri →" (deep link) + "Scarica" (App Store). Nascosto nell'app nativa via `window.Capacitor.isNativePlatform()`.

10. **Feature: App Store CTA — Conversione Giocatori**
    - Aggiunta costante `APP_STORE_URL` in cima a `src/App.jsx` (sopra FIREBASE_CONFIG). Placeholder `id000000000` da aggiornare al momento della pubblicazione — punto unico di modifica.
    - **Banner PlayerScreen aggiornato**: "Lupus in Fabula è su App Store · Gratuita · Voce AI · Profilo · Classifiche" con due bottoni affiancati: "Apri →" (deep link per chi ha già l'app) e "Scarica" (App Store per nuovi utenti).
    - **Card fine partita**: compare nel blocco `phase === 'ended'` solo su browser (nascosta nell'app nativa). CTA primaria "⬇ Scarica Gratis su App Store" con gradient oro, testo secondario "L'app è gratuita · Pacchetti aggiuntivi da €1,99" per chiarire il modello freemium. Momento di massima conversione: il giocatore ha appena terminato la partita ed è coinvolto.

11. **Feature: Hybrid Narrator System — Risparmio ~94% API**
    - **Problema**: ElevenLabs a €0,07-0,15/partita rende il pack Narratore a €1,99/anno insostenibile.
    - **Soluzione**: sistema ibrido pre-registrati + API. Le 30 frasi standard (apertura notte, ruoli, fine partita, ecc.) vengono riprodotte da file MP3 locali in `public/narrator/`. Solo i testi con nomi giocatori (alba con vittima, eliminazione di giorno) chiamano l'API — ~2 chiamate/turno invece di ~15.
    - **Architettura**: `window.NARRATOR_STATIC_AUDIO` = mappa testo → path file; `window._playStaticAudio(path)` = player per file statici con iOS audio unlock; `window.speakNarration` controlla la mappa prima di chiamare l'API.
    - **Files**: `public/narrator/*.mp3` (30 file da registrare con ElevenLabs Playground). I file non presenti → silenzio graceful senza bloccare la partita.
    - **Debug**: console stampa `🎵 Statico: /narrator/xxx.mp3` o `🤖 API ElevenLabs` per ogni chiamata.
    - **Guida registrazione**: `NARRATOR_RECORDING_GUIDE.md` con tutti i 30 testi e nomi file corrispondenti.
    - **Testi ancora dinamici** (con nomi giocatori → API): alba con vittima, eliminazione di giorno, veleno strega, criceto colpito dalla Veggente.

12. **Redesign Step 2 — Selezione Ruoli (Variant C)**
    - **Problema**: la schermata era "troppo confusionaria" con troppi elementi visibili contemporaneamente.
    - **Nuovo componente `RoleCardC`**: tap sul corpo della card = aggiungi ruolo; tap sul badge sovrapposto (top-right) = rimuove ultima occorrenza; bottone "i" circolare = apre modale info.
    - **Struttura Step 2**: stepper lupi in alto con hint bilanciamento (verde/giallo/rosso) → grid 3 colonne ruoli liberi (solo `veggente` + `guardia`) → pack collassati (Pack Ombre, Pack Villaggio, Pack Narratore, Combo) → sticky bottom bar con composizione attuale + CTA "Inizia Partita".
    - **State refactor**: `wolfCount` (state separato, stepper) + `roles` (solo speciali) + `villiciAuto` (calcolato automaticamente). I lupi e i villici non compaiono nel picker.
    - **Preset automatico**: al click "Continua" in Step 1 applica un preset per numero di giocatori (es. 6 → 2 lupi, veggente, guardia).
    - **Pack corretti**: Ombre = strega, figlio_dei_lupi, cacciatore, medium; Villaggio = cupido, sindaco, sciamano, mitomane.

13. **UX: Bottone "i" (info ruolo) — Fix visibilità**
    - Il pulsante info era colorato con `r.color` (spesso invisibile su sfondi scuri).
    - Nuovo stile: cerchio bianco 22px, posizionato **fuori** dalla card (bottom -6, left -6, z-index 10), sfondo `rgba(30,30,40,0.92)`, bordo bianco semitrasparente — visibile su qualsiasi ruolo.

14. **UX: Tasto ← su Step 2 → torna a Step 1 (non alla Home)**
    - Prima: il tasto ← chiamava sempre `onBack()` → HomeScreen, perdendo i nomi dei giocatori inseriti.
    - Ora: `onClick={step===1 ? onBack : ()=>setStep(1)}` — Step 2 torna a Step 1 preservando `players` state.

15. **Feature: Rivincita — Stessi Giocatori e Ruoli**
    - In `GameMasterScreen` (fase `ended`): aggiunto bottone "🔄 Rivincita — stessi giocatori e ruoli" che raccoglie `{ playerNames, wolfCount, specialRoles }` e chiama `onEndGame(result, setup)`.
    - `handleEndGame(result, setup)` nel root App: se `setup` è presente → salva in `lastGameSetup` e naviga a `screen='create'`; altrimenti → torna alla home.
    - `CreateGameScreen` accetta prop `initialSetup`: se presente, inizia da **Step 2** con players/wolfCount/roles già popolati — modificabili prima di rilanciare.

17. **Feature: Narratore giocatore — "Partecipo anch'io"**
    - Toggle 🎭 **fisso in cima** allo Step 1 (non in fondo). Quando attivo + nome inserito: riga dorata in cima alla lista, counter include narratore.
    - `canStep1 = rolesNeeded >= 4` (conta narratore). `pb-32` sul div Step 1 evita che la lista finisca sotto il tasto fisso.
    - Il narratore riceve un ruolo random (`isNarrator: true` nel player object). `rolesNeeded` include il narratore quando `narratorActive`.
    - `GameMasterScreen`: FAB "Il mio ruolo" fisso bottom-right, visibile solo se `pStates[*].isNarrator` e fase ≠ `waiting`. Overlay fullscreen con solo la scheda ruolo — **nessun log visibile** (anti-cheat).
    - Rivincita e back-from-QR preservano `narratorName` nel setup.

18. **Feature: Haptic feedback**
    - `window.haptic(type)` wrapper globale in cima ad `App.jsx` (prima di `playSfx`).
    - Usa `@capacitor/haptics` su nativo iOS/Android; `navigator.vibrate()` su Android web; silenzioso su iOS Safari web.
    - Tipi: `light/medium/heavy/success/warning/error/select`.
    - Applicato su: flip card ruolo (heavy), "Sono pronto" (medium), cala la notte (heavy), alba (medium), voto notte/giorno (select), inizio votazione (medium), condannato (error/warning), fine partita (success/error).

16. **Fix: Win condition "amore" rimossa + fix stats Firebase**
    - Rimossa la win condition speciale Cupido (`return 'amore'` in `checkWin`): se restano 1 lupo e 1 villico innamorati, vince il branco normalmente (`wolves.length >= villagers.length → 'lupi'`). L'amore non vince le partite.
    - `writeGameStats`: `lupiWins` ora conta anche `winner === 'amore'` (retrocompatibilità con partite salvate prima del fix).
    - `statsRef.set(updated)` → `statsRef.update(updated)` per evitare sovrascrittura di altri campi utente su Firebase.
    - `initialSetup.initialStep || 2` → `initialSetup.initialStep ?? 2` (fix falsy check).

19. **Fix critico: Paywall Voce AI mancante (v1.1)**
    - *Problema*: il bottone "🎙️ Voce AI" in `GameMasterScreen` impostava `ttsMode='voice'` e chiamava la funzione ElevenLabs su Vercel **senza nessun controllo acquisto**. Chiunque usava la voce AI a spese del proprietario dell'API key.
    - *Soluzione*: aggiunto `usePurchases()` direttamente in `GameMasterScreen` per ottenere `purchasedPacks` e `purchasePackage`. Il bottone ora controlla `purchasedPacks.includes('narratore')` — se non acquistato apre `PaywallModal('narratore')`. Aggiunto `useEffect` che resetta `ttsMode` a `'script'` se rimane `'voice'` in localStorage senza acquisto (difesa contro bypass manuale). `PaywallModal` aggiunto nel JSX di `GameMasterScreen`.
    - *Versione rilasciata*: v1.1 (build 2) — inviata su App Store Connect il 2026-05-09.

20. **Pulizia: rimosso login Google/Apple e SetupModal**
    - Login Google e Sign in with Apple rimossi dalla schermata auth (rimandati a v1.2+).
    - `SetupModal` rimosso — era stato flaggato da Apple (Guideline 2.2) nella review della build 1.
    - Questi cambi erano già presenti localmente ma non committati — inclusi nel commit v1.1.

21. **Feature: Sistema i18n IT/EN — lavoro in locale, NON deployato (2026-07-22)**
    - *Obiettivo*: preparare la traduzione inglese dell'app senza toccare il comportamento italiano esistente.
    - *Architettura*: due nuovi file — `src/i18n/translations.js` (dizionari `IT`/`EN`, struttura a namespace per schermata) e `src/i18n/i18n.js` (store esterno minimale con `useSyncExternalStore`, funzione `t(key, vars)` con fallback IT, hook `useLanguage()` per componenti reattivi).
    - *Rilevamento lingua*: `navigator.language` al primo avvio (fallback IT se non IT/EN), poi override persistito in `localStorage['lif_lang']`. Nessuna dipendenza nuova installata — approccio idiomatico coerente con lo stile del codice esistente (stato globale + localStorage, come `lif_tts_mode`, `lif_el_key`, ecc.).
    - *Switch lingua*: pulsante IT/EN in alto a sinistra su `HomeScreen` (unico punto in cui si cambia lingua — evita corner-case di cambio lingua a metà partita). `App()` e `HomeScreen` sottoscrivono `useLanguage()` per re-render reattivo; le altre schermate leggono `t()` al mount (si aggiornano perché vengono rimontate ad ogni cambio schermata).
    - ⚠️ *Regola anti-regressione i18n (verifica code-review 2026-07-22)*: la propagazione del cambio lingua ai ~640 punti che chiamano `t()` funziona **perché `App()` (root) è sottoscritto a `useLanguage()` e NESSUN componente del file è memoizzato** — quindi al cambio lingua il root si ri-renderizza e trascina tutto l'albero. È corretto ma fragile: **se in futuro si introduce `React.memo`/`useMemo` su un componente, quel componente NON deve leggere la `t` dalla import globale ma consumarla da `useLanguage()` localmente**, altrimenti si congela sulla lingua precedente (bug subdolo). Non aggiungere memoizzazione senza questa accortezza.
    - *ROLES / PACKS / NIGHT_NARRATION / NIGHT_STEPS*: rimangono oggetti mutabili module-level come prima (nessun refactor dei ~40 punti che li leggono per riferimento). Nuova funzione `applyLanguageToStaticData()` li **muta in place** con i testi della lingua corrente, chiamata all'avvio e ad ogni cambio lingua (`subscribeLang`). Le chiavi/id dei ruoli (`lupo`, `veggente`, ecc.) restano invariate — solo `name`/`description`/`tip` cambiano.
    - *Terminologia EN*: nomi ruolo consolidati del genere Werewolf (Werewolf, Villager, Seer, Bodyguard, Witch, Hunter, Cupid, Mayor, Medium, Wolf Child, Shaman; "Mitomane" → **Mimic**, unico ruolo senza corrispettivo standard).
    - *Narratore audio — punto critico*: `window.NARRATOR_STATIC_AUDIO` ristrutturato da mappa testo→file a mappa **lingua→chiave semantica→file** (`{it: {night_open: '/narrator/night_open.mp3', ...31 chiavi}, en: {}}`). `window.speakNarration(testo, chiave)` ora accetta una chiave opzionale; se il file per la lingua corrente non esiste, fallback automatico e trasparente sull'API ElevenLabs dal vivo (già multilingue, nessuna rottura). Tutti i ~15 punti del codice che chiamano `speakNarration`/`setNarrationAndPhase` sono stati aggiornati per passare la chiave giusta. **Effetto collaterale positivo**: il lookup per chiave (invece che per testo esatto) ha corretto un mismatch preesistente tra il testo di "alba con vittima" e il file statico corrispondente, che prima cadeva sempre sull'API per un carattere di differenza.
    - *Audio EN*: ✅ **GENERATO E APPROVATO ALL'ASCOLTO da Fabrizio (2026-07-23)**, confronto diretto IT vs EN su tutte le 31 frasi (pagina di test temporanea `public/_voice_test.html`, RIMUOVERE prima del deploy). 31 MP3 in `public/narrator/en/` incisi con voce Daniel (`onwK4e9ZLuTAKqWW03F9`, madrelingua EN britannica) via `generate_narrator_audio_en.mjs` (gemello dello script IT, stesso proxy Vercel — nessuna API key locale). `NARRATOR_STATIC_AUDIO.en` popolato con le 31 chiavi → `/narrator/en/<file>.mp3`. Verificato: 31/31 file validi, chiavi en allineate 1:1 con it, build Vite pulita, file serviti dal dev server (HTTP 200 audio/mpeg), zero errori console. Ora l'inglese usa audio statici come l'italiano — risolto il rischio costo ElevenLabs ~16x segnalato dalla code-review (finding 🟡 #2). Testi in `NARRATOR_RECORDING_GUIDE_EN.md`.
    - *Copertura traduzione*: tutte le schermate (Home, CreateGame, GameMaster, PlayerScreen, Profile+Avatar, Paywall, Tutorial/Onboarding, Privacy consent, Auth/login, History, force-update modal) + tutti i ruoli/pack/narrazione. Verificato a mano nel dev server locale (build Vite pulita, nessun errore console, toggle IT⇄EN live testato su Home/CreateGame/GameMaster/Paywall/Login/History/Tutorial).
    - ✅ *Correzione (2026-07-23)*: `public/privacy.html` **era già bilingue IT/EN** (sezioni GDPR-compliant complete in entrambe le lingue, toggle JS vanilla funzionante, `setLang()`) — la nota precedente che lo dava "solo IT" era sbagliata, verificato e corretto ora. Nessuna azione necessaria su questo file.
    - ✅ *UX fix (2026-07-23)*: il selettore lingua era presente solo su `HomeScreen`, quindi il consenso privacy e il tutorial di onboarding (le primissime schermate viste da un nuovo utente) apparivano sempre in italiano prima che si potesse cambiare lingua. Spostato il toggle su `PrivacyConsentModal` (ora usa `useLanguage()` invece del `t` globale non reattivo) — è la prima schermata in assoluto (z-index 999, sopra tutto). Verificato: toggle IT⇄EN istantaneo su questa schermata, build pulita.
    - *Prezzi localizzati* ✅ **FIX 2026-07-23 (code-review finding 🟡 #1)**: prima i display mostravano i valori EUR hardcoded in `PACKS` anche a utenti non-EUR (rischio rifiuto App Store + prezzo incoerente col reale). Ora `usePurchases` legge `RC.getOfferings()` → `product.priceString` (già localizzato da StoreKit) e lo scrive in `window.PACKS[id].price`; tutti i 6 punti di display (PaywallModal, role picker, upsell combo) leggono `PACKS[id].price` e prendono quindi il prezzo reale localizzato su iOS. Su web/senza IAP `prices` resta `{}` e vale il fallback EUR hardcoded (nessuna regressione). `usePurchases` ora espone anche `prices`. Verificato: build pulita, web invariato, mutazione global funzionante, zero errori console. **Da testare su device/simulatore iOS con account sandbox StoreKit** (il path RevenueCat non è esercitabile dal dev server web).
    - *Prezzi confermati (2026-07-23)*: i prezzi reali a listino sono quelli del codice — ombre/villaggio/narratore **€1,99**, combo **€4,99** (confermato da Fabrizio). La doc precedente (CLAUDE.md, memoria) che riportava €2,99/€5,99 era obsoleta ed è stata allineata. I fallback EUR hardcoded in `PACKS` sono quindi corretti; su iOS il `priceString` di RevenueCat li localizza comunque per store region.
    - **NON deployato**: nessun `npx vercel --prod`, nessun `npx cap sync`, nessuna build Xcode. Modifiche solo su `src/App.jsx` (esteso, non riscritto) + 2 file nuovi in `src/i18n/`. Da rivedere prima di un eventuale deploy.
    - *Cleanup post-review (2026-07-23)*: applicati 4 dei 7 finding 🟢 (verificati dead/sicuri, build pulita): nome fallback player localizzato (`getLang()==='en'?'Player':'Giocatore'`), `freeAppNote` EN senza valuta ambigua, `_speakBrowser` reso lang-aware (`utterance.lang`), rimossa entry morta `NIGHT_NARRATION.close` (residuo confermato dal commento a codice). **Lasciati intenzionalmente** (rischio > beneficio alla vigilia del deploy): #7 duplicazione ROLES/translations (refactor strutturale), #8 label toggle IT/EN (UX funzionante, non un bug), #9 suffissi plurale (trascurabile, stesso difetto già in IT).

## 📝 To-Do Aperti per l'Utente

### ✅ Completato
- ~~Dominio Vercel~~ → `lupus-in-fabula-eight.vercel.app`
- ~~ElevenLabs API Key~~ → presente e funzionante
- ~~Deploy web~~ → voce AI attiva
- ~~Firebase Security Rules~~ → `users/{uid}` protetti
- ~~Privacy Policy~~ → `public/privacy.html` completa (IT/EN), consent modal in app
- ~~Narrator MP3s~~ → 31 file presenti in `public/narrator/`, mappa statica completa
- ~~Sign in with Apple (codice)~~ → `@capacitor-community/apple-sign-in` installato, `loginApple()` implementato

### ✅ Completato (maggio 2026)
- **RevenueCat IAP reali**: integrazione completa con `@revenuecat/purchases-capacitor`. 4 prodotti su App Store Connect: `pack_ombre`, `pack_villaggio`, `pack_narratore`, `pack_combo`. Entitlement collegati. Testati in sandbox — acquisti e ripristino funzionanti.
- **App Store Connect**: app `com.lupusinfabula.app` (ID: 6764061104) inviata per revisione il 3 maggio 2026. Build 2 selezionato. Classificazione 13+. Prezzi, screenshot, descrizione, keywords, privacy policy compilati.
- **`APP_STORE_URL`**: aggiornato a `https://apps.apple.com/app/lupus-in-fabula/id6764061104`.
- **v1.1 approvata e live** (2026-05-12): fix paywall Voce AI.
- **v1.2 approvata e live** (2026-05-12, build 3 — #104 categoria Famiglia al lancio):
  - RC login con Firebase UID (`usePurchases(userId)`) — acquisti ora persistenti su cambio device
  - Force update via Firebase `config/minVersion` — modal bloccante se versione obsoleta
  - Fix `target="_blank"` link App Store nel modal force-update

### 🔴 Bloccanti (risolti)
- ~~Sign in with Apple~~ — non implementato per v1.0, rimandato a v1.2+
- ~~RevenueCat / IAP reali~~ → completato
- ~~APP_STORE_URL~~ → aggiornato
- ~~RC utenti anonimi~~ → risolto in v1.2 con logIn Firebase UID

### 🟡 Da fare (v1.3+)
1. **Afghanistan e Marocco**: verificare restrizione geografica su App Store Connect.
2. **Sign in with Apple**: Xcode entitlement + Firebase provider Apple.
3. **Voce AI feedback post-acquisto**: UX — indicare dove trovare la feature dopo acquisto pack narratore.
4. **Force update attivazione**: quando serve, impostare `config/minVersion` su Firebase Console.

### 🟢 Opzionale (post-lancio)
5. **Universal Links**: `apple-app-site-association` su Vercel.
6. ~~**Traduzioni EN**~~ → sistema i18n IT/EN implementato in locale (2026-07-22, punto #21) — **da rivedere e deployare**. Resta da fare: registrare i 31 audio narratore in inglese (vedi `NARRATOR_RECORDING_GUIDE_EN.md`), poi `npx vercel --prod` + `npx cap sync` quando Fabrizio approva.
7. **Modello finanziario**: rivedere proiezioni senza costi ElevenLabs (MP3 statici 94%).

## 🚀 Comandi Deploy

```bash
# Deploy web (produzione Vercel) — eseguire dal Mac
cd "/Users/fabriziofalzea/Documents/Claude/Projects/Lupus In Fabula"
npx vercel --prod

# Build app iOS — eseguire dal Mac
npm install && npm run ios
```

> Il push git **non** triggera automaticamente il deploy. Usare sempre `npx vercel --prod` per aggiornare `lupus-in-fabula-eight.vercel.app`.

## ⚠️ Note Critiche
- La modalità default del narratore è **Script** (solo testo, nessun audio). Per la voce AI occorre selezionare esplicitamente "Voce AI" nelle impostazioni.
- Su iOS (app nativa), le chiamate TTS usano il dominio hardcoded `lupus-in-fabula-eight.vercel.app`.
- Su web, le chiamate TTS usano `window.location.origin` (relativo al sito Vercel deployato).
- Le stats sono tracciate **solo per utenti registrati** (host). Diventa leva di conversione alla registrazione.
- `APP_STORE_URL` è un unico punto di modifica: aggiornarlo aggiorna automaticamente banner + card fine partita.
