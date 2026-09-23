import { downloadText } from './download.js';

/** Profile stats download. The pin hash is omitted. */
export function statsDocument(profile) {
  return {
    exportedAt: new Date().toISOString(),
    game: 'TypeDrop',
    version: 1,
    displayName: profile.displayName,
    avatarId: profile.avatarId,
    sceneId: profile.sceneId,
    tutorialCompleted: profile.tutorialCompleted,
    tutorialCompletedAt: profile.tutorialCompletedAt,
    homeRowScore: profile.homeRowScore,
    reachScore: profile.reachScore,
    highestUnlockedLevel: profile.highestUnlockedLevel,
    levelBests: profile.levelBests,
    stats: profile.stats,
    settings: profile.settings,
  };
}

export function exportStatsJson(profile) {
  const name = (profile.displayName || 'player').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  downloadText(`typedrop-${name || 'player'}-stats.json`, JSON.stringify(statsDocument(profile), null, 2), 'application/json');
}
