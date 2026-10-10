'use strict';

/* =========================================================================
   ¿Quién es el Impostor? — lógica del juego
   Todo el estado de la ronda (palabra secreta, roles) vive únicamente en
   memoria. Nunca se guarda en localStorage, así que recargar la página lo
   borra por completo. Solo los ajustes, los nombres y tus palabras
   personalizadas (nada secreto) se recuerdan entre partidas.
   ========================================================================= */

/* ------------------------------- Constantes ------------------------------- */

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 15;
const TIMER_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 8, 10]; // minutos (0 = sin cronómetro)
const TIMER_STEP = 30;
const SETTINGS_KEY = 'impostor-settings-v2';
const LEGACY_SETTINGS_KEY = 'impostor-settings-v1';
const CUSTOM_KEY = 'impostor-custom-words-v1';
const CUSTOM_CAT = 'custom';
const RECENT_LIMIT = 80;

const MODES = [
  { key: 'clasico', emoji: '🕵️', label: 'Clásico', sub: 'El impostor no sabe la palabra' },
  { key: 'pista', emoji: '💡', label: 'Con pista', sub: 'El impostor recibe una pista relacionada' },
  { key: 'infiltrado', emoji: '🥸', label: 'Infiltrado', sub: 'Palabra parecida… y no sabe que es el impostor' },
  { key: 'caos', emoji: '🌀', label: 'Caos', sub: '¿Uno, varios, ninguno, todos? Nadie lo sabe' }
];

const MODE_HELP = {
  clasico: 'Por turnos, cada uno dice <strong>una palabra relacionada</strong> con la secreta, sin decirla. El impostor tiene que disimular… y adivinarla. Haced 2 o 3 vueltas.',
  pista: 'Por turnos, cada uno dice <strong>una palabra relacionada</strong> con la secreta. Ojo: el impostor tiene una pista, así que no os lo pondrá fácil.',
  infiltrado: 'Por turnos, cada uno dice <strong>una palabra relacionada</strong> con la suya. Alguien tiene una palabra parecida pero distinta… y puede que seas tú.',
  caos: 'Por turnos, cada uno dice <strong>una palabra relacionada</strong> con la secreta. ¿Hay impostor? ¿Hay varios? ¿Sois todos? Desconfiad de todo.'
};

/* --------------------------------- Estado ---------------------------------- */

let settings = {
  mode: 'clasico',
  playerCount: 5,
  impostorCount: 1,
  categories: CATEGORY_KEYS.slice(),
  timerMinutes: 3,
  showCategory: true,
  secretVote: false
};

let impostorManuallySet = false;
let customText = '';
let custom = { words: [], pairs: [] };

/** Estado de la ronda actual, SOLO en memoria. null cuando no hay ronda. */
let round = null;
let isAdvancing = false;
const recent = [];
const scores = Kit.createScores();
let timer = null;

/* --------------------------------- Utilidades ------------------------------- */

function maxImpostorsFor(playerCount) {
  // Los impostores deben ser siempre MENOS de la mitad de los jugadores.
  return Math.max(1, Math.floor((playerCount - 1) / 2));
}

function suggestedImpostorCount(playerCount) {
  return playerCount >= 7 ? Math.min(2, maxImpostorsFor(playerCount)) : 1;
}

function modeInfo(key) {
  return MODES.find((m) => m.key === key) || MODES[0];
}

function parseCustom(text) {
  const words = [];
  const pairs = [];
  text.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean).forEach((item) => {
    const clean = item.replace(/\|/g, ' ').slice(0, 40);
    if (clean.includes('/')) {
      const [a, b] = clean.split('/').map((s) => s.trim());
      if (a && b) pairs.push([a, b]);
      if (a) words.push(`${a}|`);
    } else {
      words.push(`${clean}|`);
    }
  });
  return { words, pairs };
}

function getCategory(key) {
  if (key === CUSTOM_CAT) {
    return { label: 'Tus palabras', emoji: '✍️', words: custom.words, pairs: custom.pairs };
  }
  return CATEGORIES[key];
}

function availableCategoryKeys() {
  return custom.words.length ? CATEGORY_KEYS.concat(CUSTOM_CAT) : CATEGORY_KEYS.slice();
}

function itemsFor(key, mode) {
  const cat = getCategory(key);
  if (!cat) return [];
  return mode === 'infiltrado' ? cat.pairs : cat.words;
}

/** Palabras (o parejas) candidatas según modo y categorías elegidas. */
function buildPool() {
  const pool = [];
  settings.categories.forEach((key) => {
    const cat = getCategory(key);
    if (!cat) return;
    if (settings.mode === 'infiltrado') {
      cat.pairs.forEach(([a, b]) => pool.push({ id: `${a}/${b}`, a, b, key }));
    } else {
      cat.words.forEach((entry) => {
        const [word, hint = ''] = entry.split('|');
        pool.push({ id: word, word, hint, key });
      });
    }
  });
  return pool;
}

function pickFromPool(pool) {
  let candidates = pool.filter((item) => !recent.includes(item.id));
  if (!candidates.length) {
    recent.length = 0;
    candidates = pool;
  }
  const item = Kit.pick(candidates);
  recent.push(item.id);
  if (recent.length > RECENT_LIMIT) recent.shift();
  return item;
}

function chaosImpostorCount(n) {
  const r = Math.random();
  if (r < 0.12) return 0;
  if (r < 0.2) return n;
  return 1 + Math.floor(Math.random() * Math.max(1, Math.floor(n / 2)));
}

/* ------------------------------ Persistencia -------------------------------- */

function loadSettings() {
  const saved = Kit.load(SETTINGS_KEY, null);
  const legacy = saved ? null : Kit.load(LEGACY_SETTINGS_KEY, null);
  const parsed = saved || legacy || {};

  if (MODES.some((m) => m.key === parsed.mode)) settings.mode = parsed.mode;
  if (typeof parsed.playerCount === 'number') {
    settings.playerCount = Kit.clamp(Math.round(parsed.playerCount), MIN_PLAYERS, MAX_PLAYERS);
  }
  const max = maxImpostorsFor(settings.playerCount);
  if (typeof parsed.impostorCount === 'number') {
    settings.impostorCount = Kit.clamp(Math.round(parsed.impostorCount), 1, max);
    impostorManuallySet = true;
  } else {
    settings.impostorCount = suggestedImpostorCount(settings.playerCount);
  }
  if (Array.isArray(parsed.categories)) {
    const valid = parsed.categories.filter((k) => k === CUSTOM_CAT || CATEGORY_KEYS.includes(k));
    if (valid.length) settings.categories = valid;
  } else if (legacy && CATEGORY_KEYS.includes(legacy.categoryKey)) {
    settings.categories = [legacy.categoryKey];
  }
  if (TIMER_OPTIONS.includes(parsed.timerMinutes)) settings.timerMinutes = parsed.timerMinutes;
  if (typeof parsed.showCategory === 'boolean') settings.showCategory = parsed.showCategory;
  if (typeof parsed.secretVote === 'boolean') settings.secretVote = parsed.secretVote;

  const savedCustom = Kit.load(CUSTOM_KEY, '');
  customText = typeof savedCustom === 'string' ? savedCustom : '';
  custom = parseCustom(customText);
}

function saveSettings() {
  // en una sala no se guarda su número de jugadores como el de «mismo móvil»
  Kit.save(SETTINGS_KEY, salaBackup ? Object.assign({}, settings, salaBackup) : settings);
}

/* ---------------------------------- DOM -------------------------------------- */

const el = {};

function cacheDom() {
  [
    'mode-options', 'player-count-value', 'btn-player-minus', 'btn-player-plus',
    'impostor-row', 'impostor-count-value', 'btn-impostor-minus', 'btn-impostor-plus', 'impostor-hint',
    'chaos-hint', 'names-grid', 'btn-shuffle-names', 'category-options', 'category-summary',
    'category-warning', 'btn-cat-all', 'btn-cat-none', 'custom-words', 'time-value', 'timer-hint',
    'btn-time-minus', 'btn-time-plus', 'show-category-row', 'opt-show-category', 'opt-secret-vote',
    'opt-sound', 'opt-vibrate', 'setup-scoreline', 'setup-score-text', 'btn-reset-scores', 'btn-start-game',
    'game-bar-title', 'btn-exit',
    'reveal-dots', 'reveal-player', 'hold-reveal-btn', 'role-panel', 'role-category-label', 'role-emoji',
    'role-content', 'role-extra', 'btn-next-player',
    'starter-name', 'starter-direction', 'discussion-help', 'timer-block', 'timer-display', 'timer-ring',
    'btn-timer-minus', 'btn-timer-toggle', 'btn-timer-plus', 'btn-go-vote', 'btn-reveal-direct',
    'vote-title', 'vote-area',
    'verdict', 'verdict-emoji', 'verdict-title', 'verdict-text', 'guess-box', 'guess-text',
    'btn-guess-yes', 'btn-guess-no', 'reveal-box', 'results-word-label', 'results-word', 'results-category',
    'results-alt-wrap', 'results-alt-word', 'results-impostors-label', 'results-impostors', 'vote-summary',
    'scoreboard-card', 'scoreboard', 'results-actions', 'btn-play-again', 'btn-new-game'
  ].forEach((id) => {
    el[id.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = document.getElementById(id);
  });
}

/* -------------------------------- Pantalla: Setup ----------------------------- */

function renderModes() {
  Kit.renderOptions(el.modeOptions, MODES, {
    className: 'mode-card',
    isSelected: (key) => settings.mode === key,
    onSelect: (key) => {
      settings.mode = key;
      saveSettings();
      renderSetup();
    }
  });
}

function renderCategories() {
  const keys = availableCategoryKeys();
  const infiltrado = settings.mode === 'infiltrado';
  Kit.renderOptions(el.categoryOptions, keys.map((key) => {
    const cat = getCategory(key);
    const count = itemsFor(key, settings.mode).length;
    return { key, emoji: cat.emoji, label: cat.label, sub: String(count), disabled: count === 0 };
  }), {
    multi: true,
    isSelected: (key) => settings.categories.includes(key) && itemsFor(key, settings.mode).length > 0,
    onSelect: (key) => {
      settings.categories = settings.categories.includes(key)
        ? settings.categories.filter((k) => k !== key)
        : settings.categories.concat(key);
      saveSettings();
      renderSetup();
    }
  });

  const pool = buildPool();
  const unit = infiltrado ? 'parejas' : 'palabras';
  el.categorySummary.textContent = `${pool.length} ${unit}`;
  el.categoryWarning.hidden = pool.length > 0;
  el.categoryWarning.textContent = infiltrado
    ? 'Elige al menos una categoría con parejas para el modo Infiltrado.'
    : 'Elige al menos una categoría.';
  el.btnStartGame.disabled = pool.length === 0;
}

function renderSetup() {
  renderModes();

  el.playerCountValue.textContent = String(settings.playerCount);
  el.btnPlayerMinus.disabled = settings.playerCount <= MIN_PLAYERS;
  el.btnPlayerPlus.disabled = settings.playerCount >= MAX_PLAYERS;

  const isChaos = settings.mode === 'caos';
  const max = maxImpostorsFor(settings.playerCount);
  el.impostorRow.hidden = isChaos;
  el.chaosHint.hidden = !isChaos;
  el.impostorCountValue.textContent = String(settings.impostorCount);
  el.btnImpostorMinus.disabled = settings.impostorCount <= 1;
  el.btnImpostorPlus.disabled = settings.impostorCount >= max;
  el.impostorHint.textContent = `Máximo ${max} para ${settings.playerCount} jugadores`;

  Kit.renderNameInputs(el.namesGrid, settings.playerCount);
  renderCategories();

  const idx = TIMER_OPTIONS.indexOf(settings.timerMinutes);
  el.timeValue.textContent = settings.timerMinutes ? `${settings.timerMinutes}′` : '—';
  el.timerHint.textContent = settings.timerMinutes ? 'Con cronómetro' : 'Sin cronómetro';
  el.btnTimeMinus.disabled = idx <= 0;
  el.btnTimePlus.disabled = idx >= TIMER_OPTIONS.length - 1;

  el.showCategoryRow.hidden = settings.mode === 'infiltrado';
  el.optShowCategory.checked = settings.showCategory;
  el.optSecretVote.checked = settings.secretVote;

  el.setupScoreline.hidden = scores.rounds === 0;
  el.setupScoreText.textContent = `🏆 Marcador: ${scores.rounds} ${scores.rounds === 1 ? 'ronda' : 'rondas'}`;
}

function changePlayerCount(delta) {
  settings.playerCount = Kit.clamp(settings.playerCount + delta, MIN_PLAYERS, MAX_PLAYERS);
  const max = maxImpostorsFor(settings.playerCount);
  settings.impostorCount = impostorManuallySet
    ? Kit.clamp(settings.impostorCount, 1, max)
    : suggestedImpostorCount(settings.playerCount);
  saveSettings();
  renderSetup();
}

function changeImpostorCount(delta) {
  const max = maxImpostorsFor(settings.playerCount);
  settings.impostorCount = Kit.clamp(settings.impostorCount + delta, 1, max);
  impostorManuallySet = true;
  saveSettings();
  renderSetup();
}

function changeTimer(delta) {
  const idx = Kit.clamp(TIMER_OPTIONS.indexOf(settings.timerMinutes) + delta, 0, TIMER_OPTIONS.length - 1);
  settings.timerMinutes = TIMER_OPTIONS[idx];
  saveSettings();
  renderSetup();
}

/* -------------------------------- Pantalla: Reparto ----------------------------- */

function renderRevealForCurrentPlayer() {
  const i = round.current;
  el.revealPlayer.textContent = round.names[i];
  el.revealDots.innerHTML = round.names
    .map((_, idx) => `<li class="${idx < i ? 'is-done' : idx === i ? 'is-current' : ''}"></li>`)
    .join('');
  clearRole();
  el.btnNextPlayer.disabled = true;
  el.btnNextPlayer.textContent = i === round.names.length - 1 ? 'Ya lo vi, ¡a debatir!' : 'Ya lo vi, pasar al siguiente';
}

function clearRole() {
  el.holdRevealBtn.classList.remove('is-held');
  el.rolePanel.classList.remove('is-alert');
  el.roleCategoryLabel.textContent = '';
  el.roleEmoji.textContent = '';
  el.roleContent.textContent = '';
  el.roleContent.className = 'role-content';
  el.roleExtra.innerHTML = '';
}

/** Lo que ve el jugador i en su carta (también lo usa la sala). extra va en HTML. */
function roleCard(r, i) {
  const isImpostor = r.impostors.has(i);
  const catText = `Categoría: ${r.catLabel}`;

  if (r.mode === 'infiltrado') {
    return { label: catText, emoji: r.catEmoji, content: isImpostor ? r.altWord : r.word, extra: 'Da pistas sin decir tu palabra' };
  }
  if (!isImpostor) {
    return { label: catText, emoji: r.catEmoji, content: r.word, extra: r.mode === 'caos' ? '¿Habrá impostor? 🌀' : 'Da pistas sin decirla' };
  }
  let extra = 'Disimula y descubre la palabra';
  if (r.mode === 'pista') {
    extra = r.hint ? `Pista: <strong>${Kit.esc(r.hint)}</strong>` : 'Esta palabra no tiene pista: ¡improvisa!';
  } else if (r.mode === 'caos') {
    extra = '¿Estarás solo? 🌀';
  }
  return {
    label: settings.showCategory ? catText : 'Categoría secreta',
    emoji: '🕵️', content: 'Eres el impostor', extra, alert: true, impostor: true
  };
}

function populateRole() {
  const c = roleCard(round, round.current);
  el.rolePanel.classList.toggle('is-alert', Boolean(c.alert));
  el.roleCategoryLabel.textContent = c.label;
  el.roleEmoji.textContent = c.emoji;
  el.roleContent.textContent = c.content;
  el.roleContent.classList.toggle('is-impostor', Boolean(c.impostor));
  el.roleExtra.innerHTML = c.extra;
}

function startRevealHold() {
  if (!round) return;
  populateRole();
  el.holdRevealBtn.classList.add('is-held');
  el.btnNextPlayer.disabled = false;
  Kit.buzz(20);
}

function endRevealHold() {
  el.holdRevealBtn.classList.remove('is-held');
  // Se vacía tras la animación de giro para no mostrar nada al soltar.
  setTimeout(() => {
    if (!el.holdRevealBtn.classList.contains('is-held')) clearRole();
  }, 300);
}

function goToNextPlayer() {
  if (isAdvancing || !round || el.btnNextPlayer.disabled) return;
  isAdvancing = true;
  clearRole();
  round.current += 1;
  if (round.current >= round.names.length) {
    startDiscussionPhase();
  } else {
    renderRevealForCurrentPlayer();
    Kit.sfx.tap();
  }
  isAdvancing = false;
}

/* ------------------------------ Pantalla: Debate ----------------------------- */

function startDiscussionPhase() {
  const starter = Math.floor(Math.random() * round.names.length);
  el.starterName.textContent = round.names[starter];
  el.starterDirection.textContent = Math.random() < 0.5
    ? 'y seguid en el sentido de las agujas del reloj ↻'
    : 'y seguid en sentido contrario a las agujas del reloj ↺';
  el.discussionHelp.innerHTML = MODE_HELP[round.mode];

  el.timerBlock.hidden = settings.timerMinutes === 0;
  if (settings.timerMinutes > 0) timer.start(settings.timerMinutes * 60);
  Kit.sfx.reveal();
  Kit.showScreen('discussion');
}

/* ------------------------------ Pantalla: Votación ---------------------------- */

function startVote() {
  timer.stop();
  el.voteTitle.textContent = round.mode === 'infiltrado'
    ? '¿Quién es el infiltrado?'
    : round.mode === 'caos' ? '¿Quién es impostor?' : '¿Quién es el impostor?';
  Kit.runVote(el.voteArea, {
    names: round.names,
    secret: settings.secretVote,
    allowNone: round.mode === 'caos',
    noneLabel: '🙅 No hay impostor',
    onDone: finishVote
  });
  Kit.showScreen('vote');
}

function finishVote(result) {
  const n = round.names.length;
  const k = round.impostors.size;
  round.vote = result;
  round.tally = Kit.tally(result, Kit.clamp(k, 1, n));
  showResultsScreen();

  if (k > 0 && k < n) {
    const caught = round.tally.accused.filter((i) => round.impostors.has(i));
    round.allCaught = caught.length === k;
    if (round.allCaught && round.mode !== 'infiltrado') {
      askForGuess();
      return;
    }
  }
  finalizeRound(false);
}

/* ------------------------------ Pantalla: Resultados -------------------------- */

function showResultsScreen() {
  timer.stop();
  el.guessBox.hidden = true;
  el.revealBox.hidden = true;
  el.scoreboardCard.hidden = true;
  el.resultsActions.hidden = true;
  Kit.showScreen('results');
}

function setVerdict(type, emoji, title, text) {
  el.verdict.className = 'verdict' + (type ? ` is-${type}` : '');
  el.verdictEmoji.textContent = emoji;
  el.verdictTitle.textContent = title;
  el.verdictText.innerHTML = text;
  // Reinicia la animación del emoji.
  el.verdictEmoji.style.animation = 'none';
  void el.verdictEmoji.offsetWidth;
  el.verdictEmoji.style.animation = '';
}

function namesOf(indices) {
  return indices.map((i) => `<strong>${Kit.esc(round.names[i])}</strong>`).join(' y ');
}

function impostorList() {
  return Array.from(round.impostors).sort((a, b) => a - b);
}

function askForGuess() {
  const imps = impostorList();
  const plural = imps.length > 1;
  setVerdict('', '🎯', plural ? '¡Pillados!' : '¡Pillado!',
    `Habéis descubierto a ${namesOf(imps)}. Pero aún ${plural ? 'pueden' : 'puede'} ganar…`);
  el.guessText.innerHTML = `Última oportunidad: ${namesOf(imps)}, decid en voz alta cuál creéis que es la palabra secreta.`;
  el.guessBox.hidden = false;
  Kit.sfx.reveal();
}

function finalizeRound(guessed) {
  const n = round.names.length;
  const imps = impostorList();
  const k = imps.length;
  const t = round.tally;
  const isInf = round.mode === 'infiltrado';
  const who = isInf ? 'infiltrado' : 'impostor';
  const crew = round.names.map((_, i) => i).filter((i) => !round.impostors.has(i));

  scores.startRound();
  let crewWins = false;
  let scored = true;

  if (k === 0) {
    scored = false;
    if (t.noneWins) {
      crewWins = true;
      scored = true;
      setVerdict('win', '😇', '¡No había impostor!', 'Lo habéis clavado: esta ronda no había ningún impostor. Todos ganáis 1 punto.');
    } else {
      setVerdict('lose', '😇', 'No había ningún impostor', t.accused.length
        ? `Habéis acusado a ${namesOf(t.accused)}… que era inocente. Nadie puntúa.`
        : 'Nadie era impostor y nadie puntúa esta ronda.');
    }
  } else if (k === n) {
    scored = false;
    setVerdict('lose', '🤯', '¡Todos erais impostores!', 'Nadie tenía la palabra… y nadie se dio cuenta. Ronda sin puntos, pero con historia.');
  } else if (round.allCaught && !guessed) {
    crewWins = true;
    const label = isInf ? (k > 1 ? 'Infiltrados' : 'Infiltrado') : (k > 1 ? 'Impostores' : 'Impostor');
    setVerdict('win', '🎉', `¡${label} descubierto${k > 1 ? 's' : ''}!`,
      `Bien jugado: ${namesOf(imps)} no ${k > 1 ? 'pudieron' : 'pudo'} engañaros. El grupo gana 1 punto cada uno.`);
  } else if (round.allCaught && guessed) {
    setVerdict('lose', '😈', '¡Os la ha colado!', `Pillasteis a ${namesOf(imps)}, pero ${k > 1 ? 'adivinaron' : 'adivinó'} la palabra. 2 puntos por ${who}.`);
  } else if (t.noneWins) {
    setVerdict('lose', '🙈', '¡Sí que había impostor!', `Votasteis que no había nadie, pero ${namesOf(imps)} ${k > 1 ? 'eran impostores' : 'era el impostor'}. 2 puntos por impostor.`);
  } else if (t.tie) {
    setVerdict('lose', '🤝', 'Empate en la votación', `No se expulsa a nadie y ${k > 1 ? 'los impostores se escapan' : `el ${who} se escapa`}. 2 puntos por ${who}.`);
  } else {
    const innocents = t.accused.filter((i) => !round.impostors.has(i));
    setVerdict('lose', '😬', innocents.length ? '¡Expulsasteis a un inocente!' : `El ${who} se ha librado`,
      (innocents.length ? `${namesOf(innocents)} no ${innocents.length > 1 ? 'eran' : 'era'} ${who}. ` : '') +
      `${namesOf(imps)} gana${k > 1 ? 'n' : ''} 2 puntos.`);
  }

  if (scored) {
    if (crewWins) {
      (k === 0 ? round.names.map((_, i) => i) : crew).forEach((i) => scores.add(round.names[i], 1));
    } else {
      imps.forEach((i) => scores.add(round.names[i], 2));
    }
  }
  scores.endRound();
  if (crewWins) {
    Kit.sfx.win();
    Kit.confetti();
  } else {
    Kit.sfx.lose();
  }
  Kit.buzz(crewWins ? [60, 40, 60] : 200);

  renderRevealBox();
  scores.render(el.scoreboard, round.names);
  el.guessBox.hidden = true;
  el.scoreboardCard.hidden = false;
  el.resultsActions.hidden = false;
}

function renderRevealBox() {
  const imps = impostorList();
  const isInf = round.mode === 'infiltrado';
  el.resultsWordLabel.textContent = isInf ? 'La palabra del grupo era' : 'La palabra secreta era';
  el.resultsWord.textContent = round.word;
  el.resultsCategory.textContent = `${round.catEmoji} ${round.catLabel}` +
    (round.mode === 'pista' && round.hint ? ` · Pista del impostor: ${round.hint}` : '');
  el.resultsAltWrap.hidden = !isInf;
  el.resultsAltWord.textContent = round.altWord || '';

  el.resultsImpostorsLabel.textContent = isInf
    ? (imps.length > 1 ? 'Los infiltrados eran' : 'El infiltrado era')
    : (imps.length > 1 ? 'Los impostores eran' : 'El impostor era');
  el.resultsImpostors.classList.toggle('is-neutral', imps.length === 0);
  el.resultsImpostors.innerHTML = imps.length
    ? imps.map((i) => `<li>${Kit.esc(round.names[i])}</li>`).join('')
    : '<li>Nadie 😇</li>';

  if (round.vote) {
    const ranked = round.vote.votes
      .map((v, i) => ({ v, name: round.names[i] }))
      .filter((x) => x.v > 0)
      .sort((a, b) => b.v - a.v);
    if (round.vote.none) ranked.push({ v: round.vote.none, name: 'No hay impostor' });
    el.voteSummary.textContent = ranked.length
      ? 'Votos: ' + ranked.map((x) => `${x.name} ${x.v}`).join(' · ')
      : '';
  } else {
    el.voteSummary.textContent = '';
  }
  el.revealBox.hidden = false;
}

function revealWithoutVote() {
  round.vote = null;
  showResultsScreen();
  setVerdict('', '👀', 'Revelación', 'Sin votación no hay puntos esta ronda.');
  renderRevealBox();
  if (scores.rounds > 0) {
    scores.startRound();
    scores.render(el.scoreboard, round.names);
    el.scoreboardCard.hidden = false;
  }
  el.resultsActions.hidden = false;
  Kit.sfx.reveal();
}

/* ---------------------------------- Ronda ----------------------------------- */

function startNewRound() {
  const pool = buildPool();
  if (!pool.length) {
    backToSetup();
    return;
  }
  const n = settings.playerCount;
  const item = pickFromPool(pool);
  const cat = getCategory(item.key);
  const k = settings.mode === 'caos'
    ? chaosImpostorCount(n)
    : Kit.clamp(settings.impostorCount, 1, maxImpostorsFor(n));

  let word = item.word;
  let altWord = null;
  if (settings.mode === 'infiltrado') {
    const swap = Math.random() < 0.5;
    word = swap ? item.b : item.a;
    altWord = swap ? item.a : item.b;
  }

  round = {
    mode: settings.mode,
    names: Kit.playerNames(n),
    impostors: Kit.pickIndices(n, k),
    word,
    altWord,
    hint: item.hint || '',
    catLabel: cat.label,
    catEmoji: cat.emoji,
    current: 0,
    vote: null,
    tally: null,
    allCaught: false
  };

  el.gameBarTitle.textContent = `Ronda ${scores.rounds + 1} · ${modeInfo(round.mode).label}`;
  Kit.keepAwake(true);
  Kit.showScreen('reveal');
  renderRevealForCurrentPlayer();
}

function backToSetup() {
  if (timer) timer.stop();
  round = null;
  Kit.keepAwake(false);
  renderSetup();
  Kit.showScreen('setup');
}

function confirmExit() {
  if (!round) return true;
  return window.confirm('¿Salir de la partida? Se perderá la ronda actual (el marcador se mantiene).');
}

/* --------------------------- Con código de sala ------------------------------ */

// Mientras se configura una sala, los jugadores son los que han entrado:
// aquí se guarda el número de «mismo móvil» para devolverlo al salir.
let salaBackup = null;

function salaHosting(on, players) {
  if (on) {
    if (!salaBackup) salaBackup = { playerCount: settings.playerCount };
    settings.playerCount = Kit.clamp(players, MIN_PLAYERS, MAX_PLAYERS);
    settings.impostorCount = Kit.clamp(settings.impostorCount, 1, maxImpostorsFor(settings.playerCount));
  } else if (salaBackup) {
    settings.playerCount = salaBackup.playerCount;
    salaBackup = null;
  }
  renderSetup();
}

/** Reparto de una ronda de sala para n jugadores, con los ajustes actuales. */
function salaDeal(n) {
  const pool = buildPool();
  if (!pool.length) return { error: 'Elige al menos una categoría' };
  const item = pickFromPool(pool);
  const cat = getCategory(item.key);
  const k = settings.mode === 'caos' ? chaosImpostorCount(n) : Kit.clamp(settings.impostorCount, 1, maxImpostorsFor(n));
  let word = item.word;
  let altWord = null;
  if (settings.mode === 'infiltrado') {
    const swap = Math.random() < 0.5;
    word = swap ? item.b : item.a;
    altWord = swap ? item.a : item.b;
  }
  const r = {
    mode: settings.mode, impostors: Kit.pickIndices(n, k), word, altWord,
    hint: item.hint || '', catLabel: cat.label, catEmoji: cat.emoji
  };
  const inf = r.mode === 'infiltrado';
  return {
    cards: Array.from({ length: n }, (_, i) => roleCard(r, i)),
    special: Array.from(r.impostors),
    info: { mode: r.mode, word, altWord, hint: r.hint, catLabel: r.catLabel, catEmoji: r.catEmoji },
    title: modeInfo(r.mode).label,
    help: MODE_HELP[r.mode],
    seconds: settings.timerMinutes * 60,
    voteTitle: inf ? '¿Quién es el infiltrado?' : r.mode === 'caos' ? '¿Quién es impostor?' : '¿Quién es el impostor?',
    allowNone: r.mode === 'caos',
    noneLabel: '🙅 No hay impostor',
    who: inf ? { one: 'infiltrado', many: 'infiltrados', One: 'Infiltrado', Many: 'Infiltrados', the: 'el infiltrado', The: 'El infiltrado' } : { one: 'impostor', many: 'impostores', One: 'Impostor', Many: 'Impostores', the: 'el impostor', The: 'El impostor' }
  };
}

Sala.configure({
  id: 'impostor',
  maxPlayers: MAX_PLAYERS,
  timerStep: TIMER_STEP,
  holdPrompt: 'Mantén pulsado para ver tu rol',
  who: { one: 'impostor', many: 'impostores', One: 'Impostor', Many: 'Impostores', the: 'el impostor', The: 'El impostor' },
  hosting: salaHosting,
  deal: salaDeal,
  onRoundEnd: () => {},
  resultsHtml(info, { names, special, esc }) {
    const inf = info.mode === 'infiltrado';
    const k = special.length;
    return `<p class="results-label">${inf ? 'La palabra del grupo era' : 'La palabra secreta era'}</p>` +
      `<p class="results-word">${esc(info.word)}</p>` +
      `<p class="results-meta">${esc(`${info.catEmoji} ${info.catLabel}`)}${info.mode === 'pista' && info.hint ? ` · Pista del impostor: ${esc(info.hint)}` : ''}</p>` +
      (inf ? `<p class="results-label">${k > 1 ? 'Los infiltrados tenían' : 'El infiltrado tenía'}</p><p class="results-word is-alt">${esc(info.altWord)}</p>` : '') +
      `<p class="results-label">${inf ? (k > 1 ? 'Los infiltrados eran' : 'El infiltrado era') : (k > 1 ? 'Los impostores eran' : 'El impostor era')}</p>` +
      `<ul class="chips${k ? '' : ' is-neutral'}">${k ? special.slice().sort((a, b) => a - b).map((i) => `<li>${esc(names[i])}</li>`).join('') : '<li>Nadie 😇</li>'}</ul>`;
  }
});

/* --------------------------------- Eventos ----------------------------------- */

function bindEvents() {
  el.btnPlayerMinus.addEventListener('click', () => changePlayerCount(-1));
  el.btnPlayerPlus.addEventListener('click', () => changePlayerCount(1));
  el.btnImpostorMinus.addEventListener('click', () => changeImpostorCount(-1));
  el.btnImpostorPlus.addEventListener('click', () => changeImpostorCount(1));
  el.btnTimeMinus.addEventListener('click', () => changeTimer(-1));
  el.btnTimePlus.addEventListener('click', () => changeTimer(1));
  el.btnShuffleNames.addEventListener('click', () => {
    Kit.shuffleNames(el.namesGrid, settings.playerCount);
    Kit.toast('Orden mezclado 🔀');
  });

  el.btnCatAll.addEventListener('click', () => {
    settings.categories = availableCategoryKeys();
    saveSettings();
    renderSetup();
  });
  el.btnCatNone.addEventListener('click', () => {
    settings.categories = [];
    saveSettings();
    renderSetup();
  });

  el.customWords.value = customText;
  el.customWords.addEventListener('input', () => {
    const hadCustom = custom.words.length > 0;
    customText = el.customWords.value;
    custom = parseCustom(customText);
    Kit.save(CUSTOM_KEY, customText);
    if (custom.words.length && !hadCustom && !settings.categories.includes(CUSTOM_CAT)) {
      settings.categories = settings.categories.concat(CUSTOM_CAT);
      saveSettings();
    }
    renderCategories();
  });

  el.optShowCategory.addEventListener('change', () => {
    settings.showCategory = el.optShowCategory.checked;
    saveSettings();
  });
  el.optSecretVote.addEventListener('change', () => {
    settings.secretVote = el.optSecretVote.checked;
    saveSettings();
  });
  Kit.bindPrefToggle(el.optSound, 'sound');
  Kit.bindPrefToggle(el.optVibrate, 'vibrate');

  el.btnResetScores.addEventListener('click', () => {
    scores.reset();
    renderSetup();
    Kit.toast('Marcador a cero');
  });

  el.btnStartGame.addEventListener('click', () => {
    saveSettings();
    try { history.pushState({ inGame: true }, ''); } catch (err) { /* sin historial */ }
    startNewRound();
  });

  Kit.bindHold(el.holdRevealBtn, startRevealHold, endRevealHold);
  el.btnNextPlayer.addEventListener('click', goToNextPlayer);

  timer = Kit.createTimer({
    display: el.timerDisplay,
    ring: el.timerRing,
    toggleBtn: el.btnTimerToggle,
    onEnd: () => Kit.toast('⏰ ¡Se acabó el tiempo! A votar')
  });
  el.btnTimerMinus.addEventListener('click', () => timer.adjust(-TIMER_STEP));
  el.btnTimerPlus.addEventListener('click', () => timer.adjust(TIMER_STEP));
  el.btnTimerToggle.addEventListener('click', () => timer.toggle());
  el.btnGoVote.addEventListener('click', startVote);
  el.btnRevealDirect.addEventListener('click', revealWithoutVote);

  el.btnGuessYes.addEventListener('click', () => finalizeRound(true));
  el.btnGuessNo.addEventListener('click', () => finalizeRound(false));

  el.btnPlayAgain.addEventListener('click', startNewRound);
  el.btnNewGame.addEventListener('click', backToSetup);
  el.btnExit.addEventListener('click', () => {
    if (confirmExit()) backToSetup();
  });

  // El botón «atrás» del móvil no saca de la página en mitad de una ronda.
  window.addEventListener('popstate', () => {
    if (!round) return;
    if (confirmExit()) {
      backToSetup();
    } else {
      try { history.pushState({ inGame: true }, ''); } catch (err) { /* sin historial */ }
    }
  });
}

/* ---------------------------------- Init ------------------------------------- */

function init() {
  cacheDom();
  loadSettings();
  bindEvents();
  renderSetup();
  Kit.showScreen('setup');
}

document.addEventListener('DOMContentLoaded', init);
