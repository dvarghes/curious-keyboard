import { avatarById } from '../data/avatars.js';
import { downloadText } from './download.js';

export function escapeCell(value) {
  const text = value == null ? '' : String(value);
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function toCsv(headers, rows) {
  const head = headers.map(escapeCell).join(',');
  const body = rows.map((row) => row.map(escapeCell).join(','));
  return [head, ...body].join('\r\n');
}

function pct(value) {
  return `${Math.round((value || 0) * 100)}%`;
}

export function runsCsv(profile) {
  const headers = ['date', 'level', 'mode', 'score', 'wpm', 'accuracy', 'stars'];
  const rows = (profile?.stats?.runs || []).map((run) => [
    run.date,
    run.levelId,
    run.mode,
    run.score,
    run.wpm,
    pct(run.accuracy),
    run.stars,
  ]);
  return toCsv(headers, rows);
}

export function levelsCsv(profile) {
  const headers = ['level', 'best_stars', 'best_score', 'best_wpm', 'best_accuracy'];
  const rows = Object.keys(profile?.levelBests || {})
    .map((key) => Number(key))
    .sort((a, b) => a - b)
    .map((level) => {
      const best = profile.levelBests[level];
      return [level, best.stars, best.score, Math.round(best.wpm || 0), pct(best.accuracy)];
    });
  return toCsv(headers, rows);
}

export function deviceCsv(board) {
  const headers = ['date', 'display_name', 'avatar', 'level', 'score', 'wpm', 'accuracy'];
  const rows = (board || []).map((row) => [
    row.date,
    row.displayName,
    avatarById(row.avatarId).name,
    row.levelId,
    row.score,
    row.wpm,
    pct(row.accuracy),
  ]);
  return toCsv(headers, rows);
}

/** Local research log. Display names are never written. */
export function researchCsv(profiles) {
  const headers = ['at', 'event', 'profile_id', 'payload'];
  const rows = [];
  for (const profile of profiles || []) {
    for (const entry of profile.analytics || []) {
      const { event, at, displayName, name, ...rest } = entry;
      void displayName;
      void name;
      rows.push([at || '', event || '', profile.id, JSON.stringify(rest)]);
    }
  }
  return toCsv(headers, rows);
}

export function exportRuns(profile) {
  downloadText(`${safeName(profile)}-runs.csv`, runsCsv(profile), 'text/csv');
}

export function exportLevels(profile) {
  downloadText(`${safeName(profile)}-levels.csv`, levelsCsv(profile), 'text/csv');
}

export function exportDevice(board) {
  downloadText('typedrop-device-board.csv', deviceCsv(board), 'text/csv');
}

export function exportResearch(profiles) {
  downloadText('typedrop-research.csv', researchCsv(profiles), 'text/csv');
}

function safeName(profile) {
  const name = (profile?.displayName || 'player').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `typedrop-${name || 'player'}`;
}
