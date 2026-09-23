export function formatPct(value) {
  return `${Math.round((value || 0) * 100)}%`;
}

export function formatWpm(value) {
  return String(Math.round(value || 0));
}

export function formatTime(ms) {
  const total = Math.max(0, Math.round((ms || 0) / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  if (minutes <= 0) return `${seconds}s`;
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hr ${minutes % 60} min`;
}

export function formatWhen(iso) {
  if (!iso) return 'Not yet';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Not yet';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function starTotal(profile) {
  return Object.values(profile?.levelBests || {}).reduce((sum, best) => sum + (best.stars || 0), 0);
}

export function averageAccuracy(profile) {
  const count = profile?.stats?.accuracyN || 0;
  if (!count) return 0;
  return profile.stats.accuracySum / count;
}
