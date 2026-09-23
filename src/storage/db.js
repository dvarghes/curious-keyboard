import {
  STORAGE_KEY,
  MAX_PROFILES,
  blankProfile,
  blankState,
  repair,
  replaceProfile,
  validateDisplayName,
  validatePin,
  hashPin,
} from './model.js';

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankState();
    return repair(JSON.parse(raw));
  } catch {
    return blankState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* Storage can be full or blocked. The run still finishes in memory. */
  }
  return state;
}

export function eraseAll() {
  localStorage.removeItem(STORAGE_KEY);
  return blankState();
}

export function acceptPrivacy(state) {
  const next = structuredClone(state);
  next.privacyAccepted = true;
  return next;
}

export function createProfile(state, input) {
  const error = validateDisplayName(input.displayName);
  if (error) return { error, state };
  if (state.profiles.length >= MAX_PROFILES) return { error: 'This device already has 6 players.', state };
  if (input.pin && !validatePin(input.pin)) return { error: 'A pin is 4 digits, or leave it blank.', state };
  const profile = blankProfile({
    displayName: input.displayName,
    avatarId: input.avatarId,
    pin: input.pin || '',
    reducedMotion: input.reducedMotion,
  });
  const next = structuredClone(state);
  next.profiles.push(profile);
  next.activeProfileId = profile.id;
  return { error: '', state: next, profile };
}

export function setActive(state, profileId) {
  const next = structuredClone(state);
  if (!next.profiles.some((profile) => profile.id === profileId)) return next;
  next.activeProfileId = profileId;
  return next;
}

export function removeProfile(state, profileId) {
  const next = structuredClone(state);
  next.profiles = next.profiles.filter((profile) => profile.id !== profileId);
  next.deviceLeaderboard = next.deviceLeaderboard.filter((row) => row.profileId !== profileId);
  if (next.activeProfileId === profileId) next.activeProfileId = next.profiles[0]?.id || null;
  return next;
}

export function patchProfile(state, profileId, patch) {
  const next = structuredClone(state);
  const profile = next.profiles.find((item) => item.id === profileId);
  if (!profile) return next;
  Object.assign(profile, patch);
  return next;
}

export function patchSettings(state, profileId, patch) {
  const next = structuredClone(state);
  const profile = next.profiles.find((item) => item.id === profileId);
  if (!profile) return next;
  profile.settings = { ...profile.settings, ...patch };
  return next;
}

export function setProfilePin(state, profileId, pin) {
  const next = structuredClone(state);
  const profile = next.profiles.find((item) => item.id === profileId);
  if (!profile) return next;
  profile.pinHash = pin ? hashPin(pin, profile.id) : null;
  return next;
}

export function clearDeviceBoard(state) {
  const next = structuredClone(state);
  next.deviceLeaderboard = [];
  return next;
}

export function writeProfile(state, profile, deviceBoard) {
  const next = replaceProfile(state, profile);
  if (deviceBoard) next.deviceLeaderboard = deviceBoard;
  return next;
}
