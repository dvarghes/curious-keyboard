import { avatarById } from '../data/avatars.js';

export const STORAGE_KEY = 'typedrop.v1';
export const MAX_PROFILES = 6;

export const defaultSettings = {
  volume: 0.7,
  music: true,
  sfx: true,
  reducedMotion: false,
  highContrast: false,
  keyboard: 'auto',
  fingerColors: true,
  textSize: 'default',
  dyslexicFont: false,
  muteFlashes: false,
  quietMode: false,
  speech: false,
  leftHandedHintFlip: false,
};

export function blankStats() {
  return {
    sessions: 0,
    totalWords: 0,
    bestWpm: 0,
    accuracySum: 0,
    accuracyN: 0,
    playTimeMs: 0,
    runs: [],
    badges: [],
  };
}

export function makeId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;
}

export function validateDisplayName(raw) {
  if (typeof raw !== 'string') return 'Type a name to use.';
  if (raw.includes('@')) return 'Use a first name or nickname. No email.';
  const name = raw.trim();
  if (name.length < 2 || name.length > 12) return 'Use 2 to 12 characters.';
  if (!/^[A-Za-z0-9 \-]+$/.test(name)) return 'Use letters, numbers, spaces, or a hyphen.';
  return '';
}

export function validatePin(pin) {
  return typeof pin === 'string' && /^\d{4}$/.test(pin);
}

export function hashPin(pin, salt) {
  const source = `typedrop:${salt}:${pin}`;
  let hash = 5381;
  for (let i = 0; i < source.length; i += 1) {
    hash = Math.imul(hash, 33) ^ source.charCodeAt(i);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function pinMatches(profile, pin) {
  if (!profile?.pinHash) return true;
  return hashPin(pin || '', profile.id) === profile.pinHash;
}

export function blankState() {
  return {
    version: 1,
    privacyAccepted: false,
    activeProfileId: null,
    deviceLeaderboard: [],
    profiles: [],
  };
}

export function blankProfile({ displayName, avatarId, pin, reducedMotion = false }) {
  const id = makeId('p');
  return {
    id,
    displayName: displayName.trim(),
    avatarId: avatarId || 'fox',
    sceneId: 'meadow',
    tutorialCompleted: false,
    tutorialCompletedAt: null,
    homeRowScore: null,
    reachScore: null,
    suggestHomeRow: false,
    highestUnlockedLevel: 0,
    levelBests: {},
    pinHash: pin ? hashPin(pin, id) : null,
    settings: { ...defaultSettings, reducedMotion },
    stats: blankStats(),
    analytics: [],
    createdAt: new Date().toISOString(),
    lastPlayedAt: null,
  };
}

function clampAnalytics(profile) {
  if (profile.analytics.length > 240) {
    profile.analytics.splice(0, profile.analytics.length - 240);
  }
}

export function pushAnalytics(profile, event, payload = {}) {
  const next = structuredClone(profile);
  const safe = { ...payload };
  delete safe.displayName;
  delete safe.name;
  next.analytics.push({ event, at: new Date().toISOString(), ...safe });
  clampAnalytics(next);
  return next;
}

export function compareBoard(a, b) {
  if (b.score !== a.score) return b.score - a.score;
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  return (b.accuracy || 0) - (a.accuracy || 0);
}

export function topBoard(board, limit = 10) {
  return [...(board || [])].sort(compareBoard).slice(0, limit);
}

function addBadge(profile, id) {
  if (!profile.stats.badges.includes(id)) profile.stats.badges.push(id);
}

export function completeTutorial(profile, { homeRowScore, reachScore, replay }) {
  const next = structuredClone(profile);
  next.homeRowScore = homeRowScore;
  next.reachScore = reachScore;
  next.suggestHomeRow = homeRowScore < 10 || reachScore < 12;
  if (!replay) {
    next.tutorialCompleted = true;
    next.tutorialCompletedAt = next.tutorialCompletedAt || new Date().toISOString();
    next.highestUnlockedLevel = Math.max(next.highestUnlockedLevel || 0, 1);
  }
  if (homeRowScore >= 10) addBadge(next, 'home-row-hero');
  next.analytics.push({
    event: 'tutorial_finished',
    at: new Date().toISOString(),
    home_row_score: homeRowScore,
    reach_score: reachScore,
    replay: Boolean(replay),
  });
  clampAnalytics(next);
  return next;
}

/** Leave the lesson without letter-test scores. Replay keeps stars and unlocks. */
export function skipTutorial(profile, { stepId, replay } = {}) {
  const next = structuredClone(profile);
  if (!replay) {
    const alreadyScored = next.homeRowScore != null || next.reachScore != null;
    next.tutorialCompleted = true;
    next.tutorialCompletedAt = next.tutorialCompletedAt || new Date().toISOString();
    next.highestUnlockedLevel = Math.max(next.highestUnlockedLevel || 0, 1);
    if (!alreadyScored) next.suggestHomeRow = true;
  }
  next.analytics.push({
    event: 'tutorial_skipped',
    at: new Date().toISOString(),
    step_id: stepId,
    replay: Boolean(replay),
  });
  clampAnalytics(next);
  return next;
}

export function applyRun(profile, deviceBoard, summary) {
  const next = structuredClone(profile);
  const board = structuredClone(deviceBoard || []);
  next.stats.totalWords += summary.caught || 0;
  next.stats.playTimeMs += summary.elapsedMs || 0;
  next.stats.accuracySum += summary.accuracy || 0;
  next.stats.accuracyN += 1;
  if ((summary.wpm || 0) > next.stats.bestWpm) next.stats.bestWpm = summary.wpm;
  next.stats.runs.unshift({
    id: summary.id,
    date: summary.date,
    levelId: summary.levelId,
    mode: summary.mode,
    score: summary.score,
    wpm: Math.round(summary.wpm || 0),
    accuracy: summary.accuracy || 0,
    stars: summary.mode === 'campaign' ? summary.stars : 0,
  });
  next.stats.runs = next.stats.runs.slice(0, 10);
  if ((summary.caught || 0) > 0) addBadge(next, 'first-word');
  if ((summary.peakCombo || 0) >= 10) addBadge(next, 'combo-10');

  if (summary.mode === 'campaign' && summary.cleared) {
    const prev = next.levelBests[summary.levelId] || { stars: 0, score: 0, wpm: 0, accuracy: 0 };
    const stars = summary.stars || 0;
    next.levelBests[summary.levelId] = {
      stars: Math.max(prev.stars, stars),
      score: Math.max(prev.score, summary.score || 0),
      wpm: Math.max(prev.wpm, summary.wpm || 0),
      accuracy: Math.max(prev.accuracy, summary.accuracy || 0),
    };
    if (stars >= 1 && summary.levelId < 8) {
      next.highestUnlockedLevel = Math.max(next.highestUnlockedLevel || 1, summary.levelId + 1);
    }
    if (summary.levelId === 1 && next.levelBests[1].stars >= 3) addBadge(next, 'star-l1');
    if (summary.eyesUp) addBadge(next, 'eyes-up');
    board.push({
      id: summary.id,
      profileId: next.id,
      displayName: next.displayName,
      avatarId: next.avatarId,
      levelId: summary.levelId,
      score: summary.score,
      wpm: Math.round(summary.wpm || 0),
      accuracy: summary.accuracy || 0,
      date: summary.date,
    });
  }

  for (const wordEvent of summary.wordEvents || []) {
    next.analytics.push({ ...wordEvent, at: summary.date, level_id: summary.levelId, practice_mode: summary.mode });
  }
  next.analytics.push({
    event: 'level_end',
    at: summary.date,
    level_id: summary.levelId,
    practice_mode: summary.mode,
    stars: summary.mode === 'campaign' ? summary.stars : 0,
    score: summary.score,
    wpm: Math.round(summary.wpm || 0),
    accuracy: Number((summary.accuracy || 0).toFixed(4)),
    lives_left: summary.livesLeft,
  });
  clampAnalytics(next);
  next.lastPlayedAt = summary.date;
  board.sort(compareBoard);
  return { profile: next, deviceBoard: board.slice(0, 40) };
}

export function resetProgress(profile) {
  const next = structuredClone(profile);
  const tutorialBadges = (profile.stats?.badges || []).filter((badge) => badge === 'home-row-hero');
  next.highestUnlockedLevel = next.tutorialCompleted ? 1 : 0;
  next.levelBests = {};
  next.stats = blankStats();
  next.stats.badges = tutorialBadges;
  return next;
}

export function noteSession(profile, seen) {
  if (!profile || seen.has(profile.id)) return profile;
  seen.add(profile.id);
  const next = structuredClone(profile);
  next.stats.sessions += 1;
  return next;
}

export function repair(raw) {
  const state = blankState();
  if (!raw || typeof raw !== 'object') return state;
  state.privacyAccepted = Boolean(raw.privacyAccepted);
  state.deviceLeaderboard = Array.isArray(raw.deviceLeaderboard) ? raw.deviceLeaderboard : [];
  state.profiles = (Array.isArray(raw.profiles) ? raw.profiles : []).slice(0, MAX_PROFILES).map((profile) => ({
    id: profile.id || makeId('p'),
    displayName: profile.displayName || 'Player',
    avatarId: avatarById(profile.avatarId).id,
    sceneId: profile.sceneId || 'meadow',
    tutorialCompleted: Boolean(profile.tutorialCompleted),
    tutorialCompletedAt: profile.tutorialCompletedAt || null,
    homeRowScore: profile.homeRowScore ?? null,
    reachScore: profile.reachScore ?? null,
    suggestHomeRow: Boolean(profile.suggestHomeRow),
    highestUnlockedLevel: profile.highestUnlockedLevel || 0,
    levelBests: profile.levelBests || {},
    pinHash: profile.pinHash || null,
    settings: { ...defaultSettings, ...(profile.settings || {}) },
    stats: { ...blankStats(), ...(profile.stats || {}) },
    analytics: Array.isArray(profile.analytics) ? profile.analytics : [],
    createdAt: profile.createdAt || new Date().toISOString(),
    lastPlayedAt: profile.lastPlayedAt || null,
  }));
  const active = state.profiles.find((profile) => profile.id === raw.activeProfileId);
  state.activeProfileId = active ? active.id : state.profiles[0]?.id || null;
  return state;
}

export function replaceProfile(state, profile) {
  const next = structuredClone(state);
  const index = next.profiles.findIndex((item) => item.id === profile.id);
  if (index >= 0) next.profiles[index] = profile;
  return next;
}
