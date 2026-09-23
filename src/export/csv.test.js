import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeCell, levelsCsv, researchCsv, runsCsv, toCsv } from './csv.js';

test('csv quotes commas and escaped quotes', () => {
  assert.equal(escapeCell('ok'), 'ok');
  assert.equal(escapeCell('hello, there'), '"hello, there"');
  assert.equal(escapeCell('say "hi"'), '"say ""hi"""');
  assert.equal(toCsv(['a', 'b'], [['hello, there', 'say "hi"']]), 'a,b\r\n"hello, there","say ""hi"""');
});

test('run and level exports include the score columns', () => {
  const profile = {
    displayName: 'Pip',
    stats: {
      runs: [{ date: '2026-02-01T00:00:00.000Z', levelId: 2, mode: 'campaign', score: 40, wpm: 11, accuracy: 0.5, stars: 1 }],
    },
    levelBests: { 2: { stars: 1, score: 40, wpm: 11.2, accuracy: 0.5 } },
  };
  assert.match(runsCsv(profile), /campaign,40,11,50%,1/);
  assert.match(levelsCsv(profile), /2,1,40,11,50%/);
});

test('research export drops display names', () => {
  const csv = researchCsv([
    {
      id: 'p_abc',
      displayName: 'Maya',
      analytics: [{ event: 'level_end', at: '2026-01-01T00:00:00.000Z', displayName: 'Maya', stars: 2, score: 10 }],
    },
  ]);
  assert.equal(csv.includes('Maya'), false);
  assert.match(csv, /level_end/);
  assert.match(csv, /p_abc/);
  assert.match(csv, /stars.:2/);
});
