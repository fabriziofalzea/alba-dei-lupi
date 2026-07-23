# 🎙 Narrator Recording Guide — ENGLISH (Lupus in Fabula)

Controparte inglese di `NARRATOR_RECORDING_GUIDE.md`. Da usare quando si deciderà di
registrare la voce narrante anche in inglese. **Non ancora fatto** — finché questi
file non esistono, ogni frase in inglese passa dal vivo per ElevenLabs (funziona,
ma costa una chiamata API per frase invece di riprodurre un mp3 locale).

---

## Come funziona l'aggancio nel codice

In `src/App.jsx`, `window.NARRATOR_STATIC_AUDIO` è ora organizzato per lingua:

```js
window.NARRATOR_STATIC_AUDIO = {
  it: { night_open: '/narrator/night_open.mp3', ... },  // 31 file, già presenti
  en: { /* vuoto oggi — aggiungere le chiavi qui sotto quando i file esistono */ },
};
```

Ogni chiamata a `window.speakNarration(testo, chiave)` cerca prima
`NARRATOR_STATIC_AUDIO[linguaCorrente][chiave]`. Se il file esiste lo riproduce
offline; se manca (come oggi per `en`), chiama ElevenLabs dal vivo col testo
inglese — nessuna rottura, nessun crash, solo un fallback più costoso.

**Per attivare l'audio inglese**: registrare i 31 file con voce inglese, salvarli in
`public/narrator/en/` con **lo stesso nome file** della colonna sotto, poi aggiungere
in `window.NARRATOR_STATIC_AUDIO.en` le stesse 31 chiavi con path
`/narrator/en/<nomefile>.mp3` (stesso pattern della mappa `it`). Nessun'altra modifica
al codice richiesta.

---

## Come registrare

1. Vai su **ElevenLabs → Speech Synthesis**: https://elevenlabs.io/app/speech-synthesis
2. Scegli una voce inglese naturale (maschile o femminile a scelta — quella "Daniel"
   usata in italiano è multilingue ma suona con accento; consigliata una voce
   nativa EN dal catalogo ElevenLabs per un risultato più naturale)
3. Stessi parametri usati in IT: **Speed: 1.4**, **Stability: 70%**, **Similarity: 85%**, **Style: 35%**
4. Incolla il testo, genera, scarica come **MP3**
5. Salva in `public/narrator/en/` con il nome file indicato

---

## Frasi da registrare — 31 file (stessi nomi della versione IT)

### 🌙 Night Opening
| File | Text |
|------|------|
| `night_open.mp3` | Night falls over the village. Silence swallows every sound, every movement. |

### 🎭 Night Roles (open + close per role)
| File | Text |
|------|------|
| `cupido_open.mp3` | Cupid, open your eyes. Choose the two hearts that will beat as one — your arrow will decide their fate forever. |
| `cupido_close.mp3` | Cupid, close your eyes. |
| `mitomane_open.mp3` | The Mimic, open your eyes. Choose the mask you will wear for the rest of the game. |
| `mitomane_close.mp3` | The Mimic, close your eyes. |
| `veggente_open.mp3` | The Seer, open your eyes. Choose who you want to observe tonight. |
| `veggente_close.mp3` | The Seer, close your eyes. |
| `guardia_open.mp3` | The Bodyguard, open your eyes. Who will you protect tonight with your life? |
| `guardia_close.mp3` | The Bodyguard, close your eyes. |
| `figlio_dei_lupi_open.mp3` | The Wolf Child, open your eyes. The blood calls, but does not yet answer. Watch in silence. |
| `figlio_dei_lupi_close.mp3` | The Wolf Child, close your eyes. |
| `lupi_open.mp3` | The Werewolves, open your eyes. Recognize each other in the darkness. The pack decides — who falls tonight? |
| `lupi_close.mp3` | The Werewolves, close your eyes. |
| `strega_open.mp3` | The Witch, open your eyes. The werewolves have already chosen who to kill. Save, poison, or pass? |
| `strega_close.mp3` | The Witch, close your eyes. |
| `medium_open.mp3` | The Medium, open your eyes. The dead speak, if you know how to listen. Point to a spirit — you will learn their secret. |
| `medium_close.mp3` | The Medium, close your eyes. |
| `sciamano_open.mp3` | The Shaman, open your eyes. You can call back a lost soul — choose who to bring back among the living. |
| `sciamano_close.mp3` | The Shaman, close your eyes. |

### ⚔️ Game Opening
| File | Text |
|------|------|
| `role_reveal.mp3` | Every face hides the truth. Discover who you really are. |

### 🌅 Dawn — No-victim variants
| File | Text |
|------|------|
| `dawn_no_victim.mp3` | Everyone, open your eyes. Dawn arrives quietly. The shadows retreat. The night passed without blood. The village finds itself intact at the new day. |
| `dawn_strega_heal.mp3` | Everyone, open your eyes. Dawn arrives quietly. The shadows retreat. A mysterious potion pushed death away. There are no victims tonight. |
| `dawn_figlio_transformed.mp3` | Everyone, open your eyes. Dawn arrives quietly. The shadows retreat. In the woods, a creature has awakened. The village remains intact — for now. |
| `dawn_victim_reveal.mp3` | Everyone, open your eyes. The night has claimed a victim. Their name will now appear on your screens. |

### ☀️ Day — Vote outcome
| File | Text |
|------|------|
| `day_victim_reveal.mp3` | The one who was named will now appear on your screens. |
| `day_no_majority.mp3` | No one reaches a majority. The village remains divided. Night is coming… |

### 🏁 Game End
| File | Text |
|------|------|
| `end_lupi_win.mp3` | The village has fallen. The werewolves emerge from the shadows, their howl echoing through the night. The pack has triumphed. |
| `end_villaggio_win.mp3` | The last werewolf revealed. The village rejoices — peace returns among the houses, the doors open again, the candles are relit. |
| `end_lupi_win_short.mp3` | The pack has triumphed. The village has fallen. |
| `end_villaggio_win_short.mp3` | The village has won. Peace has returned. |

### 🔊 Voice Test (settings panel)
| File | Text |
|------|------|
| `test_voice.mp3` | The night. The secrets of the village awaken. |

---

## Facoltativo — 2 frasi extra mai registrate nemmeno in italiano

Queste due frasi passano dal vivo per l'API anche oggi in IT (non hanno mai avuto un
mp3 statico, in nessuna lingua). Se un giorno si vuole coprirle, i nomi file suggeriti
sono già usati come chiave nel codice (`night_close`, `voting_start`) — basta
registrarle e aggiungerle alla mappa, sia IT che EN:

| Chiave | File suggerito | Testo IT | Testo EN |
|---|---|---|---|
| `night_close` | `night_close.mp3` | Tutti, chiudano gli occhi. | Everyone, close your eyes. |
| `voting_start` | `voting_start.mp3` | La discussione è finita. Il silenzio della votazione può cominciare. Scegliete dal vostro telefono. | The discussion is over. The silence of the vote may begin. Choose from your phone. |

---

## Testi ancora dinamici (via API, non coperti da file statici — in nessuna lingua)

Nessuno — a differenza di quanto indicato in una versione precedente di questa guida,
il codice attuale (`processNightStep`, `resolveDayVoting`, `eliminate`) non inserisce
mai il nome del giocatore dentro il testo inviato al narratore: il nome compare solo
a schermo (via Firebase), mentre l'audio resta un testo fisso e quindi sempre
copribile da un file statico. Le uniche frasi realmente dinamiche/mai statiche sono
le due sopra (`night_close`, `voting_start`), non per via di nomi giocatore ma
perché non sono ancora state registrate nemmeno in italiano.
