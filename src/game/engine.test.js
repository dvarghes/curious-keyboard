import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, getLevel, HOME_PROMPTS, REACH_PROMPTS } from '../data/levels.js';
import {
  applyMiss,
  comboMultiplier,
  createRun,
  handleKey,
  makeRun,
  measureFallSeconds,
  normalizeGameKey,
  pickActiveId,
  starsFor,
  stepRun,
  wordPoints,
} from './engine.js';

test('combo multipliers and speed bonus', () => {
  assert.equal(comboMultiplier(1), 1);
  assert.equal(comboMultiplier(2), 1.2);
  assert.equal(comboMultiplier(3), 1.5);
  assert.equal(comboMultiplier(4), 2);
  assert.equal(comboMultiplier(9), 2);
  assert.equal(wordPoints('cat', 2, 0.2), 45);
  assert.equal(wordPoints('cat', 4, 0.5), 60);
  assert.equal(wordPoints('hi', 1, 0.4), 25);
  assert.equal(wordPoints('hi', 1, 0.41), 20);
});

test('star gates', () => {
  const base = { status: 'won', lives: 3, caught: 12, waveSize: 12, accuracy: 1, wpm: 20, targetWpm: 8 };
  assert.equal(starsFor({ ...base, status: 'lost' }), 0);
  assert.equal(starsFor({ ...base, lives: 1, caught: 8, accuracy: 1 }), 1);
  assert.equal(starsFor({ ...base, lives: 1, caught: 10, accuracy: 0.9, wpm: 10 }), 2);
  assert.equal(starsFor({ ...base, lives: 3, accuracy: 0.96, wpm: 10 }), 3);
  assert.equal(starsFor({ ...base, lives: 3, accuracy: 0.96, wpm: 5 }), 2);
  assert.equal(starsFor({ ...base, lives: 2, accuracy: 0.99, wpm: 40 }), 2);
  assert.equal(starsFor({ ...base, lives: 1, caught: 10, accuracy: 0.5 }), 1);
});

test('only the active word takes letters, backspace, and a miss clears the buffer', () => {
  const state = createRun({
    level: { ...getLevel(2), spawnIntervalMs: 99999 },
    mode: 'campaign',
    queue: ['cat', 'dog'],
  });
  state.reducedMotion = true;
  state.tiles = [
    tile('a', 'cat', 0.2, 1),
    tile('b', 'dog', 0.55, 2),
  ];
  state.activeId = pickActiveId(state.tiles);
  assert.equal(state.activeId, 'b');
  handleKey(state, 'd');
  state.tiles[0].progress = 0.95;
  handleKey(state, 'o');
  assert.equal(state.tiles.find((item) => item.id === 'b').typed, 'do');
  assert.equal(state.tiles.find((item) => item.id === 'a').typed, '');

  handleKey(state, 'backspace');
  assert.equal(state.tiles.find((item) => item.id === 'b').typed, 'd');
  const typo = handleKey(state, 'x');
  assert.equal(state.tiles.find((item) => item.id === 'b').typed, 'd');
  assert.equal(state.typos, 1);
  assert.equal(state.combo, 0);
  assert.equal(typo[0].key, 'x');
  assert.equal(typo[0].expected, 'o');
  assert.equal(state.tiles.find((item) => item.id === 'b').shakeUntil, state.elapsedMs + 1000);

  applyMiss(state, state.tiles.find((item) => item.id === 'b'));
  const next = state.tiles.find((item) => item.id === 'a');
  assert.equal(state.activeId, 'a');
  assert.equal(next.typed, '');
  handleKey(state, 'c');
  assert.equal(next.typed, 'c');
});

test('a finished word pops and a perfect wave adds 100', () => {
  const state = createRun({
    level: { id: 1, name: 't', fallSeconds: 7, maxInFlight: 1, spawnIntervalMs: 5000, targetWpm: 1 },
    mode: 'campaign',
    queue: ['as'],
  });
  state.reducedMotion = true;
  stepRun(state, 0.016, () => 0.3);
  assert.equal(handleKey(state, 'space').length, 0);
  handleKey(state, 'a');
  const events = handleKey(state, 's');
  const tile = state.tiles.find((item) => item.word === 'as');
  assert.equal(events[0].kind, 'pop');
  assert.equal(state.status, 'won');
  assert.equal(state.score, wordPoints('as', 1, tile.progress) + 100);
  assert.equal(state.result.cleared, true);
});

test('three ground hits end the run and do not type into the next word', () => {
  const state = createRun({
    level: { id: 1, name: 't', fallSeconds: 0.2, maxInFlight: 1, spawnIntervalMs: 1, targetWpm: 1 },
    mode: 'campaign',
    queue: ['as', 'ad', 'add', 'sad'],
  });
  state.reducedMotion = true;
  let guard = 0;
  while (state.status === 'running' && guard < 5000) {
    stepRun(state, 0.05, () => 0.2 + (guard % 5) * 0.1);
    guard += 1;
  }
  assert.equal(state.status, 'lost');
  assert.equal(state.lives, 0);
  assert.equal(state.missed, 3);
  assert.equal(state.result.stars, 0);
});

test('level 1 fall is about twice level 8', () => {
  const slow = measureFallSeconds(7);
  const fast = measureFallSeconds(3.5);
  assert.ok(Math.abs(slow - 7) / 7 < 0.1, `level 1 fall ${slow}`);
  assert.ok(Math.abs(fast - 3.5) / 3.5 < 0.1, `level 8 fall ${fast}`);
  assert.ok(Math.abs(slow / fast - 2) / 2 < 0.1, `ratio ${slow / fast}`);
});

test('key filter ignores repeats, handles reload, and lowercases letters', () => {
  assert.equal(normalizeGameKey({ key: 'F5' }), 'reload');
  assert.equal(normalizeGameKey({ key: 'r', ctrlKey: true }), 'reload');
  assert.equal(normalizeGameKey({ key: 'a', repeat: true }), null);
  assert.equal(normalizeGameKey({ key: 'C' }), 'c');
  assert.equal(normalizeGameKey({ key: ';'}), ';');
  assert.equal(normalizeGameKey({ key: 'Backspace' }), 'backspace');
  assert.equal(normalizeGameKey({ key: ' ', ctrlKey: true }), null);
});

test('home row practice does not use the campaign level pool', () => {
  const run = makeRun(getLevel(8), 'homerow', sequenceRng());
  assert.equal(run.levelId, 0);
  assert.equal(run.queue.length, 12);
  for (const word of run.queue) assert.ok(getLevel(1).words.includes(word));
});

test('word lists stay inside the level bands and the safety rules', () => {
  const banned = ['there', 'their', 'gun', 'kill', 'hate', 'knife', 'sword', 'blood'];
  assert.equal(HOME_PROMPTS.length, 12);
  assert.equal(REACH_PROMPTS.length, 16);
  for (const level of LEVELS) {
    assert.equal(level.words.length > 0, true);
    for (const word of level.words) {
      assert.match(word, /^[a-z]+$/);
      assert.ok(word.length >= level.minLen && word.length <= level.maxLen, `${level.id} ${word}`);
      assert.equal(word.includes(';'), false);
      assert.equal(banned.includes(word), false);
    }
  }
  assert.equal(getLevel(3).words.includes('there') && getLevel(3).words.includes('their'), false);
});

test('last three tiles of level 4+ fall faster', () => {
  const level = getLevel(4);
  const state = createRun({
    level,
    mode: 'campaign',
    queue: Array.from({ length: level.waveSize }, () => 'tree'),
  });
  state.reducedMotion = true;
  state.lives = 40;
  const recorded = [];
  const seen = new Set();
  let steps = 0;
  while (recorded.length < level.waveSize && steps < 20000) {
    stepRun(state, 0.05, () => ((steps * 17) % 70) / 100);
    for (const tile of state.tiles) {
      if (!seen.has(tile.id)) {
        seen.add(tile.id);
        recorded.push(tile.fallSeconds);
      }
    }
    const falling = state.tiles.filter((tile) => tile.status === 'falling');
    if (falling.length >= level.maxInFlight) applyMiss(state, falling[0]);
    steps += 1;
  }
  assert.equal(recorded.length, level.waveSize);
  assert.equal(recorded[0], level.fallSeconds);
  for (const value of recorded.slice(-3)) {
    assert.ok(Math.abs(value - level.fallSeconds * 0.9) < 0.001);
  }
});

function tile(id, word, progress, seq) {
  return {
    id,
    seq,
    word,
    x: 0.4,
    baseX: 0.4,
    progress,
    typed: '',
    typos: 0,
    status: 'falling',
    fallSeconds: 6,
    bornAt: 0,
    shakeUntil: 0,
    popUntil: 0,
    driftPhase: 0,
  };
}

function sequenceRng() {
  let n = 0;
  return () => {
    n += 1;
    return (n % 10) / 10;
  };
}
