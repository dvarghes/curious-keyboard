/**
 * Pure falling-word rules. Functions mutate the run object so the
 * frame loop can update tiles without copying the whole wave.
 */
import { fingerIdForKey } from '../data/fingers.js';
import { getLevel } from '../data/levels.js';

export const STARTING_LIVES = 3;

export function comboMultiplier(combo) {
  if (combo >= 4) return 2;
  if (combo === 3) return 1.5;
  if (combo === 2) return 1.2;
  return 1;
}

/** Speed bonus when the word is finished in the first 40% of its fall. */
export function wordPoints(word, combo, progress) {
  const base = 10 * word.length;
  const speed = progress <= 0.4 ? 1.25 : 1;
  return Math.round(base * comboMultiplier(combo) * speed);
}

export function accuracyOf(correctChars, typos) {
  const total = correctChars + typos;
  if (total <= 0) return 1;
  return correctChars / total;
}

export function finalWpm(state) {
  const start = state.firstInputMs ?? 0;
  const span = Math.max(1000, state.elapsedMs - start);
  return (state.correctChars / 5) / (span / 60000);
}

export function finalCpm(state) {
  const start = state.firstInputMs ?? 0;
  const span = Math.max(1000, state.elapsedMs - start);
  return state.correctChars / (span / 60000);
}

export function rollingWpm(state, windowMs = 5000) {
  const cutoff = state.elapsedMs - windowMs;
  let chars = 0;
  for (const mark of state.recent) {
    if (mark.t >= cutoff) chars += mark.n;
  }
  const span = Math.max(1, Math.min(windowMs, state.elapsedMs || 1));
  return (chars / 5) / (span / 60000);
}

export function starsFor({ status, lives, caught, waveSize, accuracy, wpm, targetWpm }) {
  if (status !== 'won' || lives < 1) return 0;
  const rate = waveSize > 0 ? caught / waveSize : 0;
  let stars = 0;
  if (rate >= 0.6) stars = 1;
  if (rate >= 0.8 && accuracy >= 0.85) stars = 2;
  if (lives >= STARTING_LIVES && accuracy >= 0.95 && wpm >= targetWpm && rate >= 0.6) {
    stars = 3;
  }
  return stars;
}

export function buildQueue(pool, count, rng = Math.random) {
  const words = pool.filter((word) => typeof word === 'string' && word.length > 0 && word.length <= 10);
  if (!words.length || count <= 0) return [];
  const out = [];
  let skips = 0;
  while (out.length < count) {
    const word = words[Math.floor(rng() * words.length)];
    if (word === out[out.length - 1] && words.length > 1 && skips < 6) {
      skips += 1;
      continue;
    }
    skips = 0;
    out.push(word);
  }
  return out;
}

export function placeX(tiles, rng = Math.random) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const x = 0.14 + rng() * 0.72;
    const blocked = tiles.some((tile) => tile.status === 'falling' && Math.abs(tile.x - x) < 0.18);
    if (!blocked) return x;
  }
  return 0.14 + rng() * 0.72;
}

export function createRun({ level, mode, queue }) {
  return {
    mode,
    levelId: level.id,
    levelName: level.name,
    fallSeconds: level.fallSeconds,
    spawnIntervalMs: level.spawnIntervalMs,
    maxInFlight: mode === 'letters' ? 1 : level.maxInFlight,
    waveSize: queue.length,
    targetWpm: level.targetWpm,
    queue,
    spawnedCount: 0,
    nextSpawnAt: 0,
    tiles: [],
    activeId: null,
    lives: STARTING_LIVES,
    score: 0,
    combo: 0,
    peakCombo: 0,
    caught: 0,
    missed: 0,
    correctChars: 0,
    typos: 0,
    fingerTypos: {},
    letterTypos: {},
    recent: [],
    elapsedMs: 0,
    firstInputMs: null,
    status: 'running',
    perfect: true,
    seq: 1,
    events: [],
    reducedMotion: false,
  };
}

export function makeRun(level, mode, rng = Math.random) {
  let spec = level;
  let pool = level.words;
  let count = level.waveSize;
  if (mode === 'letters') {
    pool = 'abcdefghijklmnopqrstuvwxyz'.split('');
    count = 26;
    spec = {
      ...level,
      id: 0,
      name: 'Letter Garden',
      fallSeconds: 5,
      maxInFlight: 1,
      spawnIntervalMs: 1600,
      targetWpm: 8,
    };
  } else if (mode === 'homerow') {
    pool = getLevel(1).words;
    count = 12;
    spec = {
      ...level,
      id: 0,
      name: 'Home Row Only',
      fallSeconds: 7,
      maxInFlight: 2,
      spawnIntervalMs: 1800,
      targetWpm: 8,
    };
  }
  return createRun({ level: spec, mode, queue: buildQueue(pool, count, rng) });
}

export function pickActiveId(tiles) {
  const falling = tiles.filter((tile) => tile.status === 'falling');
  if (!falling.length) return null;
  const started = falling.filter((tile) => tile.typed.length > 0);
  const pool = started.length ? started : falling;
  pool.sort((a, b) => b.progress - a.progress || a.seq - b.seq);
  return pool[0].id;
}

function activeTile(state) {
  return state.tiles.find((tile) => tile.id === state.activeId && tile.status === 'falling') || null;
}

export function nextExpected(state) {
  const tile = activeTile(state);
  if (!tile) return '';
  return tile.word[tile.typed.length] || '';
}

function pushWordEvent(state, tile, correct) {
  state.events.push({
    event: 'word_resolved',
    len: tile.word.length,
    correct,
    ms: Math.max(0, state.elapsedMs - tile.bornAt),
    typos: tile.typos,
  });
}

function maybeFinish(state) {
  if (state.status !== 'running') return;
  const falling = state.tiles.some((tile) => tile.status === 'falling');
  if (falling || state.spawnedCount < state.waveSize) return;
  finish(state, 'won');
}

function finish(state, status) {
  if (state.status !== 'running') return;
  state.status = status;
  if (status === 'won' && state.perfect && state.missed === 0 && state.typos === 0) {
    state.score += 100;
  }
  const accuracy = accuracyOf(state.correctChars, state.typos);
  const wpm = finalWpm(state);
  state.result = {
    status,
    mode: state.mode,
    levelId: state.levelId,
    levelName: state.levelName,
    score: state.score,
    stars: starsFor({
      status,
      lives: state.lives,
      caught: state.caught,
      waveSize: state.waveSize,
      accuracy,
      wpm,
      targetWpm: state.targetWpm,
    }),
    wpm,
    cpm: finalCpm(state),
    accuracy,
    caught: state.caught,
    missed: state.missed,
    waveSize: state.waveSize,
    peakCombo: state.peakCombo,
    livesLeft: state.lives,
    typos: state.typos,
    correctChars: state.correctChars,
    elapsedMs: state.elapsedMs,
    cleared: status === 'won',
    fingerHint: fingerHint(state),
    wordEvents: state.events.slice(),
  };
}

export function fingerHint(state) {
  let letter = '';
  let count = 0;
  for (const [key, n] of Object.entries(state.letterTypos)) {
    if (n >= 3 && n > count) {
      letter = key;
      count = n;
    }
  }
  if (letter) {
    const finger = fingerIdForKey(letter);
    return { letter, finger };
  }
  let finger = '';
  count = 0;
  for (const [id, n] of Object.entries(state.fingerTypos)) {
    if (n >= 3 && n > count) {
      finger = id;
      count = n;
    }
  }
  return finger ? { letter: '', finger } : null;
}

function completeTile(state, tile) {
  state.combo += 1;
  state.peakCombo = Math.max(state.peakCombo, state.combo);
  const points = wordPoints(tile.word, state.combo, tile.progress);
  state.score += points;
  state.caught += 1;
  tile.status = 'popped';
  tile.popUntil = state.elapsedMs + 380;
  pushWordEvent(state, tile, true);
  state.activeId = pickActiveId(state.tiles);
  maybeFinish(state);
  return { kind: 'pop', tileId: tile.id, points };
}

export function applyMiss(state, tile) {
  if (tile.status !== 'falling') return [];
  tile.status = 'missed';
  tile.progress = 1;
  state.lives -= 1;
  state.missed += 1;
  state.combo = 0;
  state.perfect = false;
  tile.typed = '';
  pushWordEvent(state, tile, false);
  if (state.lives <= 0) {
    state.activeId = null;
    finish(state, 'lost');
    return [{ kind: 'fail', tileId: tile.id }];
  }
  state.activeId = pickActiveId(state.tiles);
  maybeFinish(state);
  return [{ kind: 'miss', tileId: tile.id }];
}

function spawnOne(state, rng) {
  const index = state.spawnedCount;
  const word = state.queue[index];
  let fallSeconds = state.fallSeconds;
  if (state.mode === 'campaign' && state.levelId >= 4 && index >= state.waveSize - 3) {
    fallSeconds *= 0.9;
  }
  const tile = {
    id: `t${state.seq}`,
    seq: state.seq,
    word,
    x: placeX(state.tiles, rng),
    baseX: 0,
    progress: 0,
    typed: '',
    typos: 0,
    status: 'falling',
    fallSeconds,
    bornAt: state.elapsedMs,
    shakeUntil: 0,
    popUntil: 0,
    driftPhase: rng() * Math.PI * 2,
  };
  tile.baseX = tile.x;
  state.seq += 1;
  state.tiles.push(tile);
  state.spawnedCount += 1;
  state.nextSpawnAt = state.elapsedMs + state.spawnIntervalMs;
  state.activeId = pickActiveId(state.tiles);
  return { kind: 'spawn', tileId: tile.id };
}

export function stepRun(state, dtSec, rng = Math.random) {
  if (!state || state.status !== 'running') return [];
  const dt = Math.max(0, Math.min(dtSec, 0.05));
  state.elapsedMs += dt * 1000;
  const events = [];

  if (state.spawnedCount < state.waveSize && state.elapsedMs >= state.nextSpawnAt) {
    const inFlight = state.tiles.filter((tile) => tile.status === 'falling').length;
    if (inFlight < state.maxInFlight) events.push(spawnOne(state, rng));
  }

  for (const tile of state.tiles) {
    if (tile.status !== 'falling') continue;
    tile.progress += dt / tile.fallSeconds;
    if (!state.reducedMotion) {
      tile.driftPhase += dt;
      const drift = Math.sin(tile.driftPhase * 0.8) * 0.012;
      tile.x = Math.min(0.86, Math.max(0.14, tile.baseX + drift));
    }
    if (tile.progress >= 1) {
      events.push(...applyMiss(state, tile));
      if (state.status !== 'running') break;
    }
  }

  state.tiles = state.tiles.filter((tile) => {
    if (tile.status === 'popped' && state.elapsedMs > tile.popUntil) return false;
    if (tile.status === 'missed') return false;
    return true;
  });

  const cutoff = state.elapsedMs - 6000;
  if (state.recent.length > 40) {
    state.recent = state.recent.filter((mark) => mark.t >= cutoff);
  }
  return events;
}

export function handleKey(state, key) {
  if (!state || state.status !== 'running') return [];
  const tile = activeTile(state);
  if (!tile) return [];

  if (key === 'backspace') {
    if (!tile.typed) return [];
    tile.typed = tile.typed.slice(0, -1);
    return [{ kind: 'edit', tileId: tile.id }];
  }

  if (key === 'space' || key == null || key.length !== 1) return [];

  const expected = tile.word[tile.typed.length];
  if (key !== expected) {
    state.typos += 1;
    tile.typos += 1;
    state.combo = 0;
    state.perfect = false;
    const finger = fingerIdForKey(expected);
    state.fingerTypos[finger] = (state.fingerTypos[finger] || 0) + 1;
    state.letterTypos[expected] = (state.letterTypos[expected] || 0) + 1;
    tile.shakeUntil = state.elapsedMs + 1000;
    return [{ kind: 'typo', tileId: tile.id, finger, expected, key }];
  }

  if (state.firstInputMs == null) state.firstInputMs = state.elapsedMs;
  tile.typed += key;
  state.correctChars += 1;
  state.recent.push({ t: state.elapsedMs, n: 1 });
  if (tile.typed.length === tile.word.length) return [completeTile(state, tile)];
  return [{ kind: 'tick', tileId: tile.id }];
}

export function normalizeGameKey(event) {
  if (!event) return null;
  const key = event.key || '';
  if (key === 'F5') return 'reload';
  if ((event.ctrlKey || event.metaKey) && key.toLowerCase() === 'r') return 'reload';
  if (event.ctrlKey || event.metaKey || event.altKey) return null;
  if (event.repeat || event.isComposing) return null;
  if (key === 'Escape') return 'escape';
  if (key === 'Backspace') return 'backspace';
  if (key === ' ') return 'space';
  if (/^[a-zA-Z;]$/.test(key)) return key.toLowerCase();
  return null;
}

/** Seconds from spawn until the tile is removed at the ground. */
export function measureFallSeconds(fallSeconds) {
  const dt = 1 / 60;
  const state = createRun({
    level: {
      id: 1,
      name: 'measure',
      fallSeconds,
      maxInFlight: 1,
      spawnIntervalMs: 1e9,
      targetWpm: 1,
    },
    mode: 'campaign',
    queue: ['aa'],
  });
  state.reducedMotion = true;
  let born = null;
  for (let i = 0; i < 100000 && state.missed === 0; i += 1) {
    stepRun(state, dt, () => 0.4);
    if (born == null && state.tiles[0]) born = state.tiles[0].bornAt;
  }
  return (state.elapsedMs - (born ?? 0)) / 1000;
}
