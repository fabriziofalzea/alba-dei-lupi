/**
 * simulate_balance.mjs — Monte Carlo sul bilanciamento delle composizioni.
 *
 * Risponde a UNA domanda: quanto pesa davvero un Indemoniato rispetto a un lupo?
 * Il consigliere di bilanciamento oggi assume "1 indemoniato ≈ 1 lupo": qui si verifica.
 *
 * Diverso da simulate.js, che testa la correttezza delle regole su scenari fissi.
 * Qui le regole si danno per corrette e si misura l'ESITO su molte partite.
 *
 * Esegui con: node simulate_balance.mjs
 *
 * ── MODELLO DI COMPORTAMENTO (le assunzioni contano più dei numeri) ──────────
 * - I lupi NON sanno chi è l'Indemoniato (come nel gioco): di notte possono
 *   sprecare un'uccisione proprio su di lui. È il fattore che più lo svaluta.
 * - L'Indemoniato conosce i lupi: di giorno non li vota mai e segue il loro voto.
 * - I villici votano a caso fra i vivi. È pessimista per il villaggio (nella
 *   realtà deducono), ma serve a confrontare le composizioni FRA LORO: l'errore
 *   è lo stesso in tutte, quindi il confronto relativo regge.
 * - Nessun ruolo speciale attivo (Veggente, Guardia, Strega): si misura lo
 *   scheletro numerico, non l'effetto dei poteri.
 */

const TEAM = { LUPO: 'lupi', VILLAGGIO: 'villaggio' };

// Rispecchia checkWin() di src/App.jsx: l'Indemoniato ha team 'villaggio',
// quindi conta fra i villici per la parità — ma vince con i lupi.
function checkWin(players) {
  const alive = players.filter(p => p.alive);
  const wolves = alive.filter(p => p.team === TEAM.LUPO);
  const villagers = alive.filter(p => p.team === TEAM.VILLAGGIO);
  if (wolves.length === 0) return 'villaggio';
  if (wolves.length >= villagers.length) return 'lupi';
  return null;
}

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

function playGame({ nPlayers, nWolves, nMinions, competence = 0 }) {
  const players = [];
  for (let i = 0; i < nPlayers; i++) {
    let role;
    if (i < nWolves) role = 'lupo';
    else if (i < nWolves + nMinions) role = 'indemoniato';
    else role = 'villico';
    players.push({
      id: i,
      role,
      team: role === 'lupo' ? TEAM.LUPO : TEAM.VILLAGGIO,
      isMinion: role === 'indemoniato',
      alive: true,
    });
  }

  let guard = 0;
  while (guard++ < 200) {
    // ── NOTTE ──
    const alive = players.filter(p => p.alive);
    const wolves = alive.filter(p => p.team === TEAM.LUPO);
    // I lupi scelgono fra tutti i non-lupi: non sanno chi è l'Indemoniato,
    // quindi possono ucciderlo per errore.
    const nightTargets = alive.filter(p => p.team !== TEAM.LUPO);
    if (nightTargets.length) pick(nightTargets).alive = false;

    let w = checkWin(players);
    if (w) return w;

    // ── GIORNO ──
    const voters = players.filter(p => p.alive);
    const aliveWolves = voters.filter(p => p.team === TEAM.LUPO);
    const votes = {};
    const addVote = id => { votes[id] = (votes[id] || 0) + 1; };

    // I lupi si coordinano su un bersaglio non-lupo (può essere l'Indemoniato)
    const wolfChoices = voters.filter(p => p.team !== TEAM.LUPO);
    const wolfTarget = wolfChoices.length ? pick(wolfChoices) : null;
    aliveWolves.forEach(() => { if (wolfTarget) addVote(wolfTarget.id); });

    voters.forEach(p => {
      if (p.team === TEAM.LUPO) return; // già votato sopra
      if (p.isMinion) {
        // Segue il branco, ma non vota se stesso
        if (wolfTarget && wolfTarget.id !== p.id) addVote(wolfTarget.id);
        else {
          const alt = voters.filter(x => x.id !== p.id && x.team !== TEAM.LUPO);
          if (alt.length) addVote(pick(alt).id);
        }
        return;
      }
      // Villico: con probabilità `competence` deduce e vota un lupo vero
      // (indizi, comportamento, info della Veggente), altrimenti vota a caso.
      // L'Indemoniato non è deducibile: la Veggente lo vede innocente.
      if (Math.random() < competence && aliveWolves.length) {
        addVote(pick(aliveWolves).id);
      } else {
        const others = voters.filter(x => x.id !== p.id);
        if (others.length) addVote(pick(others).id);
      }
    });

    const entries = Object.entries(votes);
    if (entries.length) {
      const max = Math.max(...entries.map(([, c]) => c));
      const top = entries.filter(([, c]) => c === max);
      const condemnedId = Number(pick(top)[0]);
      const condemned = players.find(p => p.id === condemnedId);
      if (condemned) condemned.alive = false;
    }

    w = checkWin(players);
    if (w) return w;
  }
  return 'stallo';
}

function run(cfg, runs = 20000) {
  const tally = { lupi: 0, villaggio: 0, stallo: 0 };
  for (let i = 0; i < runs; i++) tally[playGame(cfg)]++;
  return {
    ...cfg,
    evilWinPct: (tally.lupi / runs) * 100,
    stalli: tally.stallo,
  };
}

// ── Quanto vale un Indemoniato in "lupi equivalenti"? ────────────────────────
// Si misura di quanto sale la vittoria del male aggiungendo 1 indemoniato,
// e lo si rapporta all'aumento dato da 1 lupo in più. Se il rapporto è ~1
// l'assunzione del consigliere ("1 indemoniato = 1 lupo") è giusta.
// Il rapporto si calcola a più livelli di bravura del villaggio: se resta
// stabile, la conclusione non dipende dal modello di comportamento.
const RUNS = 20000;
const COMPETENCES = [0, 0.15, 0.3, 0.45];
const SETUPS = [
  { nPlayers: 8,  nWolves: 1 },
  { nPlayers: 8,  nWolves: 2 },
  { nPlayers: 12, nWolves: 2 },
  { nPlayers: 12, nWolves: 3 },
];

console.log(`\n🎲  Monte Carlo bilanciamento — ${RUNS.toLocaleString('it-IT')} partite per cella`);
console.log('    Domanda: quanto vale 1 Indemoniato rispetto a 1 Lupo in più?\n');

for (const c of COMPETENCES) {
  console.log(`    ── Bravura del villaggio: ${(c * 100).toFixed(0)}% ${c === 0 ? '(voto totalmente cieco)' : ''}`);
  console.log('       Base                 solo lupi   +1 indem.   +1 lupo    1 indem. vale');
  for (const s of SETUPS) {
    const base  = run({ ...s, nMinions: 0, competence: c }, RUNS).evilWinPct;
    const minion= run({ ...s, nMinions: 1, competence: c }, RUNS).evilWinPct;
    const wolf  = run({ ...s, nWolves: s.nWolves + 1, nMinions: 0, competence: c }, RUNS).evilWinPct;
    const dMin = minion - base, dWolf = wolf - base;
    // Se aggiungere un lupo non sposta nulla (saturazione al 100%) il rapporto
    // non è calcolabile: meglio dirlo che stampare un numero senza senso.
    const ratio = dWolf > 1 ? (dMin / dWolf) : null;
    const label = `${s.nPlayers}p ${s.nWolves} lup${s.nWolves > 1 ? 'i' : 'o'}`;
    console.log(
      `       ${label.padEnd(20)} ${base.toFixed(1).padStart(6)}%  ${minion.toFixed(1).padStart(7)}%  ${wolf.toFixed(1).padStart(7)}%   ` +
      (ratio === null ? '— (saturo)' : `${ratio.toFixed(2)} lupi`)
    );
  }
  console.log();
}
console.log('    Nota: le percentuali assolute non sono predizioni — i villici del modello');
console.log('    sono molto peggiori di quelli veri. Conta solo il rapporto fra le colonne.\n');
