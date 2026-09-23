import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyRun,
  blankProfile,
  compareBoard,
  completeTutorial,
  skipTutorial,
  resetProgress,
  topBoard,
  validateDisplayName,
  validatePin,
  hashPin,
  pinMatches,
} from './model.js';
import { clearDeviceBoard } from './db.js';

function player() {
  const profile = blankProfile({ displayName: 'Maya', avatarId: 'fox' });
  profile.tutorialCompleted = true;
  profile.highestUnlockedLevel = 3;
  return profile;
}

function summary(overrides) {
  return {
    id: 'r1',
    date: '2026-01-02T00:00:00.000Z',
    mode: 'campaign',
    levelId: 3,
    score: 80,
    stars: 1,
    wpm: 12,
    accuracy: 0.9,
    caught: 10,
    missed: 2,
    elapsedMs: 40000,
    peakCombo: 4,
    livesLeft: 1,
    cleared: true,
    eyesUp: false,
    wordEvents: [],
    ...overrides,
  };
}

test('display names reject emails and odd characters', () => {
  assert.equal(validateDisplayName('Maya'), '');
  assert.equal(validateDisplayName('Ann-Marie'), '');
  assert.equal(validateDisplayName('Kid 2'), '');
  assert.notEqual(validateDisplayName('a@b.com'), '');
  assert.notEqual(validateDisplayName('M'), '');
  assert.notEqual(validateDisplayName('Hello!!!!'), '');
  assert.equal(validatePin('1234'), true);
  assert.equal(validatePin('123'), false);
});

test('a failed level does not unlock the next one', () => {
  const profile = player();
  const { profile: next } = applyRun(profile, [], summary({ cleared: false, stars: 0, livesLeft: 0 }));
  assert.equal(next.highestUnlockedLevel, 3);
  assert.equal(next.levelBests[3], undefined);
});

test('one star unlocks the next level and keeps the best', () => {
  const profile = player();
  const first = applyRun(profile, [], summary({ score: 80, stars: 1, wpm: 12 }));
  const second = applyRun(first.profile, first.deviceBoard, summary({
    id: 'r2',
    score: 40,
    stars: 1,
    wpm: 20,
    date: '2026-01-03T00:00:00.000Z',
  }));
  assert.equal(second.profile.highestUnlockedLevel, 4);
  assert.equal(second.profile.levelBests[3].score, 80);
  assert.equal(second.profile.levelBests[3].wpm, 20);
  assert.equal(second.profile.levelBests[3].stars, 1);
  assert.equal(second.deviceBoard[0].score, 80);
});

test('skipping a new lesson unlocks level 1 without scores', () => {
  const profile = blankProfile({ displayName: 'Maya', avatarId: 'fox' });
  const next = skipTutorial(profile, { stepId: 'welcome', replay: false });
  assert.equal(next.tutorialCompleted, true);
  assert.ok(next.tutorialCompletedAt);
  assert.equal(next.homeRowScore, null);
  assert.equal(next.reachScore, null);
  assert.equal(next.suggestHomeRow, true);
  assert.equal(next.highestUnlockedLevel, 1);
  assert.equal(next.analytics.at(-1).event, 'tutorial_skipped');
  assert.equal(next.analytics.at(-1).step_id, 'welcome');
  assert.equal(next.analytics.some((entry) => entry.event === 'tutorial_finished'), false);
});

test('skip on the graduation step keeps scores just earned', () => {
  const fresh = blankProfile({ displayName: 'Maya', avatarId: 'fox' });
  const done = completeTutorial(fresh, { homeRowScore: 12, reachScore: 16, replay: false });
  const next = skipTutorial(done, { stepId: 'graduation', replay: false });
  assert.equal(next.homeRowScore, 12);
  assert.equal(next.reachScore, 16);
  assert.equal(next.suggestHomeRow, false);
  assert.equal(next.highestUnlockedLevel, 1);
});

test('skipping a replay keeps stars, unlocks, and letter scores', () => {
  const profile = player();
  profile.homeRowScore = 12;
  profile.reachScore = 16;
  profile.suggestHomeRow = false;
  profile.levelBests = { 1: { stars: 3, score: 50, wpm: 20, accuracy: 1 } };
  profile.highestUnlockedLevel = 4;
  const next = skipTutorial(profile, { stepId: 'reach_test', replay: true });
  assert.equal(next.levelBests[1].stars, 3);
  assert.equal(next.highestUnlockedLevel, 4);
  assert.equal(next.homeRowScore, 12);
  assert.equal(next.reachScore, 16);
  assert.equal(next.suggestHomeRow, false);
  assert.equal(next.analytics.at(-1).event, 'tutorial_skipped');
  assert.equal(next.analytics.at(-1).replay, true);
});

test('tutorial replay does not wipe stars', () => {
  const profile = player();
  profile.levelBests = { 1: { stars: 3, score: 50, wpm: 20, accuracy: 1 } };
  profile.highestUnlockedLevel = 4;
  const next = completeTutorial(profile, { homeRowScore: 8, reachScore: 10, replay: true });
  assert.equal(next.levelBests[1].stars, 3);
  assert.equal(next.highestUnlockedLevel, 4);
  assert.equal(next.suggestHomeRow, true);
  assert.equal(next.tutorialCompleted, true);
});

test('clearing the device board leaves stars alone', () => {
  const profile = player();
  profile.levelBests = { 1: { stars: 2, score: 10, wpm: 9, accuracy: 0.9 } };
  const state = {
    version: 1,
    privacyAccepted: true,
    activeProfileId: profile.id,
    profiles: [profile],
    deviceLeaderboard: [{ id: 'r', profileId: profile.id, score: 10, date: '2026-01-01T00:00:00.000Z', accuracy: 1, displayName: 'Maya' }],
  };
  const cleared = clearDeviceBoard(state);
  assert.equal(cleared.deviceLeaderboard.length, 0);
  assert.equal(cleared.profiles[0].levelBests[1].stars, 2);
});

test('tied scores rank the earlier run first', () => {
  const rows = [
    { score: 100, date: '2026-05-02T00:00:00.000Z', accuracy: 0.9 },
    { score: 100, date: '2026-05-01T00:00:00.000Z', accuracy: 0.7 },
    { score: 100, date: '2026-05-01T00:00:00.000Z', accuracy: 0.95 },
    { score: 90, date: '2026-01-01T00:00:00.000Z', accuracy: 1 },
  ];
  const ranked = topBoard(rows, 4);
  assert.equal(ranked[0].accuracy, 0.95);
  assert.equal(ranked[1].accuracy, 0.7);
  assert.equal(ranked[2].date.startsWith('2026-05-02'), true);
  assert.equal(ranked[3].score, 90);
  assert.ok(compareBoard(ranked[0], ranked[1]) < 0);
});

test('pin hash is not the pin itself', () => {
  const profile = blankProfile({ displayName: 'Leo', avatarId: 'owl', pin: '2468' });
  assert.notEqual(profile.pinHash, '2468');
  assert.equal(pinMatches(profile, '2468'), true);
  assert.equal(pinMatches(profile, '0000'), false);
  assert.equal(hashPin('2468', profile.id), profile.pinHash);
});

test('reset progress keeps the lesson badge and drops stars', () => {
  const profile = player();
  profile.stats.badges = ['home-row-hero', 'first-word'];
  profile.levelBests = { 2: { stars: 3, score: 10, wpm: 10, accuracy: 1 } };
  const next = resetProgress(profile);
  assert.equal(next.highestUnlockedLevel, 1);
  assert.deepEqual(next.levelBests, {});
  assert.deepEqual(next.stats.badges, ['home-row-hero']);
});
