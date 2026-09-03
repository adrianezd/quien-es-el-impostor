'use strict';

/* =========================================================================
   ¿Quién es el Impostor? — lógica del juego
   Todo el estado de la ronda (palabra secreta, roles) vive únicamente en
   memoria (variables JS). Nunca se guarda en localStorage, así que un
   simple refresco de página lo borra por completo ("autodestrucción").
   Solo los ajustes no secretos (nº de jugadores, categoría...) se
   recuerdan entre partidas.
   ========================================================================= */

/* ---------------------------- Banco de palabras --------------------------- */

const CATEGORIES = {
  comida: {
    label: 'Comida',
    words: [
      'pizza', 'hamburguesa', 'sushi', 'tacos', 'paella', 'ensalada', 'sopa',
      'pasta', 'arroz', 'pan', 'queso', 'jamón', 'chocolate', 'helado',
      'tarta', 'galleta', 'huevo', 'tortilla', 'croquetas', 'lentejas',
      'garbanzos', 'pescado', 'pollo', 'carne', 'salchicha', 'patatas fritas',
      'palomitas', 'sandía', 'manzana', 'plátano', 'naranja', 'fresa', 'uva',
      'piña', 'mango', 'aguacate', 'tomate', 'lechuga', 'zanahoria',
      'cebolla', 'pepino', 'calabacín', 'brócoli', 'espinacas', 'miel',
      'mermelada', 'yogur', 'churros', 'empanada', 'gazpacho', 'flan'
    ]
  },
  animales: {
    label: 'Animales',
    words: [
      'perro', 'gato', 'elefante', 'león', 'tigre', 'jirafa', 'mono', 'oso',
      'lobo', 'zorro', 'conejo', 'caballo', 'vaca', 'cerdo', 'oveja', 'cabra',
      'gallina', 'pato', 'ganso', 'pavo', 'águila', 'búho', 'loro',
      'pingüino', 'delfín', 'ballena', 'tiburón', 'pulpo', 'cangrejo',
      'tortuga', 'serpiente', 'lagarto', 'rana', 'mariposa', 'abeja',
      'hormiga', 'araña', 'ratón', 'ardilla', 'murciélago', 'canguro',
      'koala', 'panda', 'cebra', 'hipopótamo', 'rinoceronte', 'cocodrilo',
      'camello', 'búfalo', 'erizo', 'foca', 'nutria', 'mapache', 'jabalí',
      'ciervo', 'gaviota', 'cisne', 'hiena', 'guepardo'
    ]
  },
  profesiones: {
    label: 'Profesiones',
    words: [
      'médico', 'enfermero', 'profesor', 'bombero', 'policía', 'cocinero',
      'camarero', 'panadero', 'carpintero', 'electricista', 'fontanero',
      'mecánico', 'abogado', 'juez', 'arquitecto', 'ingeniero', 'científico',
      'farmacéutico', 'veterinario', 'dentista', 'peluquero', 'pintor',
      'músico', 'actor', 'cantante', 'escritor', 'periodista', 'fotógrafo',
      'piloto', 'conductor', 'taxista', 'agricultor', 'pescador',
      'jardinero', 'albañil', 'sastre', 'zapatero', 'guía turístico',
      'guardia de seguridad', 'recepcionista', 'contable', 'banquero',
      'vendedor', 'cajero', 'repartidor', 'limpiador', 'entrenador',
      'árbitro', 'astronauta', 'buceador', 'minero', 'soldador', 'costurera'
    ]
  },
  lugares: {
    label: 'Lugares',
    words: [
      'playa', 'montaña', 'bosque', 'desierto', 'ciudad', 'pueblo',
      'aeropuerto', 'estación de tren', 'hospital', 'escuela', 'universidad',
      'biblioteca', 'museo', 'cine', 'teatro', 'parque', 'zoológico',
      'acuario', 'restaurante', 'cafetería', 'supermercado', 'mercado',
      'centro comercial', 'gimnasio', 'piscina', 'estadio', 'iglesia',
      'castillo', 'granja', 'isla', 'río', 'lago', 'cascada', 'cueva',
      'volcán', 'jungla', 'sabana', 'glaciar', 'puerto', 'faro', 'puente',
      'túnel', 'parque de atracciones', 'hotel', 'camping', 'oficina',
      'fábrica', 'banco', 'farmacia', 'gasolinera'
    ]
  },
  objetos: {
    label: 'Objetos Cotidianos',
    words: [
      'teléfono', 'mochila', 'paraguas', 'reloj', 'gafas', 'cartera',
      'llaves', 'espejo', 'cepillo de dientes', 'toalla', 'almohada',
      'manta', 'silla', 'mesa', 'lámpara', 'taza', 'plato', 'tenedor',
      'cuchara', 'cuchillo', 'tijeras', 'martillo', 'destornillador',
      'escoba', 'cubo', 'esponja', 'jabón', 'champú', 'peine', 'secador',
      'plancha', 'aspiradora', 'lavadora', 'nevera', 'horno', 'microondas',
      'televisor', 'mando a distancia', 'cargador', 'auriculares',
      'ordenador', 'teclado', 'impresora', 'libreta', 'bolígrafo', 'lápiz',
      'goma de borrar', 'sobre', 'sello', 'maleta'
    ]
  },
  deportes: {
    label: 'Deportes',
    words: [
      'fútbol', 'baloncesto', 'tenis', 'voleibol', 'natación', 'atletismo',
      'ciclismo', 'boxeo', 'judo', 'kárate', 'esgrima', 'golf', 'béisbol',
      'rugby', 'balonmano', 'hockey', 'patinaje', 'esquí', 'snowboard',
      'surf', 'remo', 'vela', 'escalada', 'senderismo', 'gimnasia',
      'halterofilia', 'bádminton', 'squash', 'billar', 'bolos', 'ajedrez',
      'tiro con arco', 'equitación', 'triatlón', 'maratón', 'buceo',
      'kayak', 'pesca deportiva', 'parkour', 'monopatín', 'motociclismo',
      'automovilismo', 'waterpolo', 'softbol', 'curling'
    ]
  },
  superpoderes: {
    label: 'Superpoderes',
    words: [
      'volar', 'invisibilidad', 'superfuerza', 'teletransportación',
      'telepatía', 'telequinesis', 'supervelocidad', 'control del fuego',
      'control del agua', 'control del hielo', 'control del rayo',
      'curación instantánea', 'visión de rayos X', 'viajar en el tiempo',
      'leer mentes', 'controlar mentes', 'invulnerabilidad', 'regeneración',
      'control del clima', 'respirar bajo el agua', 'hablar con animales',
      'transformación', 'duplicación', 'encogimiento', 'gigantismo',
      'absorción de energía', 'campo de fuerza', 'control de plantas',
      'control de metales', 'inmortalidad', 'visión nocturna',
      'súper oído', 'control de sombras', 'viaje interdimensional',
      'control del sonido', 'control de la gravedad', 'magnetismo',
      'precognición', 'suerte extrema', 'camuflaje', 'exoesqueleto mental',
      'control de la electricidad', 'súper salto', 'aliento congelante'
    ]
  }
};

const CATEGORY_KEYS = Object.keys(CATEGORIES);
const MEZCLA_KEY = 'mezcla';

/* ------------------------------- Constantes ------------------------------- */

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 15;
const DEFAULT_TIMER_SECONDS = 180; // 3 minutos
const MIN_TIMER_SECONDS = 0;
const MAX_TIMER_SECONDS = 3600;
const TIMER_STEP = 30;
const SETTINGS_KEY = 'impostor-settings-v1';

/* --------------------------------- Estado ---------------------------------- */

/** Ajustes no secretos, persistidos en localStorage. */
let settings = {
  playerCount: 5,
  impostorCount: 1,
  categoryKey: MEZCLA_KEY
};

/** true si el usuario ha tocado manualmente el nº de impostores en esta sesión. */
let impostorManuallySet = false;

/** Estado de la ronda actual, SOLO en memoria. null cuando no hay ronda activa. */
let round = null;

/** Evita que doble-clicks/doble-taps desincronicen el avance de jugador. */
let isAdvancing = false;

let lastWord = null; // evita repetir la misma palabra dos rondas seguidas

/* --------------------------------- Utilidades ------------------------------- */

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function maxImpostorsFor(playerCount) {
  // Los impostores deben ser siempre MENOS de la mitad de los jugadores.
  return Math.max(1, Math.floor((playerCount - 1) / 2));
}

function suggestedImpostorCount(playerCount) {
  const max = maxImpostorsFor(playerCount);
  return playerCount >= 7 ? Math.min(2, max) : 1;
}

/** Fisher-Yates shuffle, no muta el array original. */
function shuffled(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickImpostorIndices(playerCount, impostorCount) {
  const indices = Array.from({ length: playerCount }, (_, i) => i);
  const chosen = shuffled(indices).slice(0, impostorCount);
  return new Set(chosen);
}

function pickWordForCategory(categoryKey) {
  let realKey = categoryKey;
  if (categoryKey === MEZCLA_KEY) {
    realKey = CATEGORY_KEYS[Math.floor(Math.random() * CATEGORY_KEYS.length)];
  }
  const list = CATEGORIES[realKey].words;
  let candidates = list;
  if (list.length > 1 && lastWord !== null) {
    const withoutLast = list.filter((w) => w !== lastWord);
    if (withoutLast.length > 0) candidates = withoutLast;
  }
  const word = candidates[Math.floor(Math.random() * candidates.length)];
  return { word, categoryLabel: CATEGORIES[realKey].label };
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* ------------------------------ Persistencia -------------------------------- */

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (typeof parsed.playerCount === 'number') {
      settings.playerCount = clamp(Math.round(parsed.playerCount), MIN_PLAYERS, MAX_PLAYERS);
    }
    if (typeof parsed.categoryKey === 'string' &&
        (parsed.categoryKey === MEZCLA_KEY || CATEGORY_KEYS.includes(parsed.categoryKey))) {
      settings.categoryKey = parsed.categoryKey;
    }
    const max = maxImpostorsFor(settings.playerCount);
    if (typeof parsed.impostorCount === 'number') {
      settings.impostorCount = clamp(Math.round(parsed.impostorCount), 1, max);
      impostorManuallySet = true;
    } else {
      settings.impostorCount = suggestedImpostorCount(settings.playerCount);
    }
  } catch (err) {
    // localStorage inaccesible o dato corrupto: seguimos con los valores por defecto.
    console.warn('No se pudieron cargar los ajustes guardados:', err);
  }
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('No se pudieron guardar los ajustes:', err);
  }
}

/* ---------------------------------- DOM -------------------------------------- */

const el = {};

function cacheDom() {
  el.screens = document.querySelectorAll('.screen');

  // Setup
  el.playerCountValue = document.getElementById('player-count-value');
  el.playerMinus = document.getElementById('btn-player-minus');
  el.playerPlus = document.getElementById('btn-player-plus');
  el.impostorCountValue = document.getElementById('impostor-count-value');
  el.impostorMinus = document.getElementById('btn-impostor-minus');
  el.impostorPlus = document.getElementById('btn-impostor-plus');
  el.impostorHint = document.getElementById('impostor-hint');
  el.categoryOptions = document.getElementById('category-options');
  el.btnStart = document.getElementById('btn-start-game');

  // Reveal
  el.revealPlayerLabel = document.getElementById('reveal-player-label');
  el.revealProgress = document.getElementById('reveal-progress');
  el.holdBtn = document.getElementById('hold-reveal-btn');
  el.holdPrompt = document.getElementById('hold-prompt');
  el.rolePanel = document.getElementById('role-panel');
  el.roleCategoryLabel = document.getElementById('role-category-label');
  el.roleContent = document.getElementById('role-content');
  el.btnNextPlayer = document.getElementById('btn-next-player');

  // Discussion
  el.timerDisplay = document.getElementById('timer-display');
  el.timerMinus = document.getElementById('btn-timer-minus');
  el.timerPlus = document.getElementById('btn-timer-plus');
  el.timerToggle = document.getElementById('btn-timer-toggle');
  el.timerSkip = document.getElementById('btn-timer-skip');
  el.btnRevealImpostor = document.getElementById('btn-reveal-impostor');

  // Results
  el.resultsWord = document.getElementById('results-word');
  el.resultsCategory = document.getElementById('results-category');
  el.resultsImpostors = document.getElementById('results-impostors');
  el.btnPlayAgain = document.getElementById('btn-play-again');
  el.btnNewGame = document.getElementById('btn-new-game');
}

function showScreen(name) {
  el.screens.forEach((section) => {
    section.hidden = section.dataset.screen !== name;
  });
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

/* -------------------------------- Pantalla: Setup ----------------------------- */

function renderCategoryOptions() {
  el.categoryOptions.innerHTML = '';

  const makePill = (key, label, count) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'category-pill';
    btn.dataset.key = key;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', String(settings.categoryKey === key));
    if (settings.categoryKey === key) btn.classList.add('is-selected');
    btn.innerHTML = `<span class="category-pill-name">${label}</span>` +
      (count ? `<span class="category-pill-count">${count} palabras</span>` : '<span class="category-pill-count">Todas las categorías</span>');
    btn.addEventListener('click', () => {
      settings.categoryKey = key;
      renderCategoryOptions();
    });
    return btn;
  };

  el.categoryOptions.appendChild(makePill(MEZCLA_KEY, 'Mezcla de todas', null));
  CATEGORY_KEYS.forEach((key) => {
    el.categoryOptions.appendChild(makePill(key, CATEGORIES[key].label, CATEGORIES[key].words.length));
  });
}

function renderSetup() {
  el.playerCountValue.textContent = String(settings.playerCount);
  el.playerMinus.disabled = settings.playerCount <= MIN_PLAYERS;
  el.playerPlus.disabled = settings.playerCount >= MAX_PLAYERS;

  const max = maxImpostorsFor(settings.playerCount);
  el.impostorCountValue.textContent = String(settings.impostorCount);
  el.impostorMinus.disabled = settings.impostorCount <= 1;
  el.impostorPlus.disabled = settings.impostorCount >= max;
  el.impostorHint.textContent = `Máximo ${max} para ${settings.playerCount} jugadores`;

  renderCategoryOptions();
}

function changePlayerCount(delta) {
  settings.playerCount = clamp(settings.playerCount + delta, MIN_PLAYERS, MAX_PLAYERS);
  const max = maxImpostorsFor(settings.playerCount);
  if (!impostorManuallySet) {
    settings.impostorCount = suggestedImpostorCount(settings.playerCount);
  } else {
    settings.impostorCount = clamp(settings.impostorCount, 1, max);
  }
  renderSetup();
}

function changeImpostorCount(delta) {
  const max = maxImpostorsFor(settings.playerCount);
  settings.impostorCount = clamp(settings.impostorCount + delta, 1, max);
  impostorManuallySet = true;
  renderSetup();
}

/* -------------------------------- Pantalla: Reveal ----------------------------- */

function renderRevealForCurrentPlayer() {
  const playerNumber = round.currentIndex + 1;
  el.revealPlayerLabel.textContent = `Jugador ${playerNumber}`;
  el.revealProgress.textContent = `Jugador ${playerNumber} de ${settings.playerCount}`;

  // Oculto por defecto: el contenido solo se revela mientras se mantiene pulsado.
  el.rolePanel.hidden = true;
  el.roleContent.className = '';
  el.roleContent.textContent = '';
  el.roleCategoryLabel.textContent = '';

  round.hasRevealedCurrent = false;
  el.btnNextPlayer.disabled = true;
  el.holdBtn.classList.remove('is-held');
  el.holdPrompt.hidden = false;
}

function populateRoleContent() {
  const isImpostor = round.impostorIndices.has(round.currentIndex);
  el.roleCategoryLabel.textContent = `Categoría: ${round.categoryLabel}`;
  if (isImpostor) {
    el.roleContent.textContent = 'ERES EL IMPOSTOR';
    el.roleContent.className = 'role-impostor';
  } else {
    el.roleContent.textContent = round.secretWord;
    el.roleContent.className = 'role-word';
  }
}

function startRevealHold(evt) {
  if (evt) evt.preventDefault();
  if (!round) return;
  populateRoleContent();
  el.rolePanel.hidden = false;
  el.holdPrompt.hidden = true;
  el.holdBtn.classList.add('is-held');
  round.hasRevealedCurrent = true;
  el.btnNextPlayer.disabled = false;
}

function endRevealHold() {
  el.rolePanel.hidden = true;
  el.roleContent.textContent = '';
  el.roleCategoryLabel.textContent = '';
  el.holdBtn.classList.remove('is-held');
  if (round && !round.hasRevealedCurrent) {
    el.holdPrompt.hidden = false;
  } else if (round) {
    el.holdPrompt.hidden = true;
  }
}

function goToNextPlayer() {
  if (isAdvancing) return;
  if (!round || el.btnNextPlayer.disabled) return;
  isAdvancing = true;
  el.btnNextPlayer.disabled = true;

  round.currentIndex += 1;
  if (round.currentIndex >= settings.playerCount) {
    startDiscussionPhase();
  } else {
    renderRevealForCurrentPlayer();
  }
  isAdvancing = false;
}

/* ------------------------------ Pantalla: Discusión ----------------------------- */

function clearRoundTimer() {
  if (round && round.timerIntervalId !== null) {
    clearInterval(round.timerIntervalId);
    round.timerIntervalId = null;
  }
}

function updateTimerDisplay() {
  el.timerDisplay.textContent = formatTime(round.timerSeconds);
  el.timerDisplay.classList.toggle('is-finished', round.timerSeconds === 0);
}

function updateTimerToggleLabel() {
  el.timerToggle.textContent = round.timerRunning ? 'Pausar' : 'Reanudar';
}

function tickTimer() {
  if (!round || !round.timerRunning) return;
  if (round.timerSeconds > 0) {
    round.timerSeconds -= 1;
    updateTimerDisplay();
    if (round.timerSeconds === 0) {
      round.timerRunning = false;
      updateTimerToggleLabel();
    }
  }
}

function startDiscussionPhase() {
  clearRoundTimer();
  round.timerSeconds = DEFAULT_TIMER_SECONDS;
  round.timerRunning = true;
  round.timerIntervalId = setInterval(tickTimer, 1000);
  updateTimerDisplay();
  updateTimerToggleLabel();
  showScreen('discussion');
}

function adjustTimer(deltaSeconds) {
  if (!round) return;
  round.timerSeconds = clamp(round.timerSeconds + deltaSeconds, MIN_TIMER_SECONDS, MAX_TIMER_SECONDS);
  updateTimerDisplay();
}

function toggleTimer() {
  if (!round) return;
  if (round.timerSeconds === 0) return;
  round.timerRunning = !round.timerRunning;
  updateTimerToggleLabel();
}

function skipTimer() {
  if (!round) return;
  round.timerRunning = false;
  round.timerSeconds = 0;
  clearRoundTimer();
  updateTimerDisplay();
  updateTimerToggleLabel();
}

/* -------------------------------- Pantalla: Resultados --------------------------- */

function endRound() {
  if (!round) return;
  clearRoundTimer();

  el.resultsWord.textContent = round.secretWord;
  el.resultsCategory.textContent = round.categoryLabel;

  const impostorNumbers = Array.from(round.impostorIndices)
    .map((i) => i + 1)
    .sort((a, b) => a - b);

  el.resultsImpostors.innerHTML = '';
  impostorNumbers.forEach((num) => {
    const li = document.createElement('li');
    li.textContent = `Jugador ${num}`;
    el.resultsImpostors.appendChild(li);
  });

  lastWord = round.secretWord;
  showScreen('results');
}

/* ---------------------------------- Ronda ----------------------------------- */

function startNewRound() {
  const picked = pickWordForCategory(settings.categoryKey);
  round = {
    secretWord: picked.word,
    categoryLabel: picked.categoryLabel,
    impostorIndices: pickImpostorIndices(settings.playerCount, settings.impostorCount),
    currentIndex: 0,
    hasRevealedCurrent: false,
    timerSeconds: DEFAULT_TIMER_SECONDS,
    timerRunning: false,
    timerIntervalId: null
  };
  showScreen('reveal');
  renderRevealForCurrentPlayer();
}

function backToSetup() {
  clearRoundTimer();
  round = null;
  renderSetup();
  showScreen('setup');
}

/* --------------------------------- Eventos ----------------------------------- */

function bindEvents() {
  el.playerMinus.addEventListener('click', () => changePlayerCount(-1));
  el.playerPlus.addEventListener('click', () => changePlayerCount(1));
  el.impostorMinus.addEventListener('click', () => changeImpostorCount(-1));
  el.impostorPlus.addEventListener('click', () => changeImpostorCount(1));

  el.btnStart.addEventListener('click', () => {
    saveSettings();
    startNewRound();
  });

  // Mantener pulsado para revelar: cubrimos punteros (táctil + ratón) y añadimos
  // touch/mouse como refuerzo por compatibilidad. Nunca se muestra nada al
  // simple "click"; solo mientras el dedo/ratón permanece pulsado.
  const press = (e) => startRevealHold(e);
  const release = (e) => { if (e) e.preventDefault(); endRevealHold(); };

  el.holdBtn.addEventListener('pointerdown', press);
  el.holdBtn.addEventListener('pointerup', release);
  el.holdBtn.addEventListener('pointerleave', release);
  el.holdBtn.addEventListener('pointercancel', release);
  el.holdBtn.addEventListener('touchstart', press, { passive: false });
  el.holdBtn.addEventListener('touchend', release);
  el.holdBtn.addEventListener('touchcancel', release);
  el.holdBtn.addEventListener('contextmenu', (e) => e.preventDefault());
  el.holdBtn.addEventListener('dragstart', (e) => e.preventDefault());

  el.btnNextPlayer.addEventListener('click', goToNextPlayer);

  el.timerMinus.addEventListener('click', () => adjustTimer(-TIMER_STEP));
  el.timerPlus.addEventListener('click', () => adjustTimer(TIMER_STEP));
  el.timerToggle.addEventListener('click', toggleTimer);
  el.timerSkip.addEventListener('click', skipTimer);
  el.btnRevealImpostor.addEventListener('click', endRound);

  el.btnPlayAgain.addEventListener('click', startNewRound);
  el.btnNewGame.addEventListener('click', backToSetup);

  // Si el usuario recarga o cierra mientras hay una ronda activa, no hay nada
  // que limpiar: `round` vive solo en memoria y desaparece automáticamente.
}

/* ---------------------------------- Init ------------------------------------- */

function init() {
  cacheDom();
  loadSettings();
  renderSetup();
  bindEvents();
  showScreen('setup');
}

document.addEventListener('DOMContentLoaded', init);
