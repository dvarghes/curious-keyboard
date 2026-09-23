import { LEVELS } from '../data/levels.js';
import { sceneById } from '../data/scenes.js';
import { en } from '../strings/en.js';
import { averageAccuracy, formatPct, formatTime, formatWpm, starTotal } from '../format.js';
import { Avatar } from './Avatar.jsx';
import { SceneBits } from './SceneBits.jsx';
import { Stars } from './Modal.jsx';

export function Home({ profile, onPlay, onPractice, onOpen }) {
  const frontier = Math.max(1, profile.highestUnlockedLevel || 1);
  const level = LEVELS[frontier - 1];
  return (
    <section className="screen">
      <div className="home-grid">
        <div className="card stack hero-card">
          <Avatar id={profile.avatarId} size={120} />
          <h1 id="view-title" tabIndex={-1}>{profile.displayName}</h1>
          <p className="hint">{starTotal(profile)} stars · {sceneById(profile.sceneId).name}</p>
          <div className={`mini-scene scene-${profile.sceneId} preview`}>
            <SceneBits id={profile.sceneId} />
            <span className="sample-tile"><span className="gold">ty</span>pe</span>
          </div>
          {profile.suggestHomeRow && <p className="note">{en.suggestHome}</p>}
          <button type="button" className="btn btn-primary" data-testid="play-next" onClick={() => onPlay(frontier, 'campaign')}>
            {en.play} {level.name}
          </button>
          <div className="row wrap">
            <button type="button" className="btn" onClick={() => onPractice('homerow')}>{en.homeRowOnly}</button>
            <button type="button" className="btn" onClick={() => onPractice('letters')}>{en.letterGarden}</button>
          </div>
        </div>
        <div className="stack">
          <div className="stat-row">
            <p><span className="stat-num">{profile.stats.totalWords}</span><span className="stat-label">{en.wordsTyped}</span></p>
            <p><span className="stat-num">{formatWpm(profile.stats.bestWpm)}</span><span className="stat-label">{en.bestWpm}</span></p>
            <p><span className="stat-num">{formatPct(averageAccuracy(profile))}</span><span className="stat-label">{en.avgAccuracy}</span></p>
            <p><span className="stat-num">{formatTime(profile.stats.playTimeMs)}</span><span className="stat-label">{en.playTime}</span></p>
          </div>
          <div className="card">
            <h2>{en.replayLevel}</h2>
            <div className="level-grid">
              {LEVELS.map((item) => {
                const open = item.id <= (profile.highestUnlockedLevel || 0);
                const best = profile.levelBests[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="level-btn"
                    disabled={!open}
                    onClick={() => onPlay(item.id, 'campaign')}
                  >
                    <strong>{item.id}</strong>
                    <span>{open ? item.name : en.locked}</span>
                    <Stars value={best?.stars || 0} />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="row wrap">
            <button type="button" className="btn" onClick={() => onOpen('customize')}>{en.customize}</button>
            <button type="button" className="btn" onClick={() => onOpen('stats')}>{en.stats}</button>
            <button type="button" className="btn" onClick={() => onOpen('leaderboard')}>{en.leaderboard}</button>
            <button type="button" className="btn" onClick={() => onOpen('help')}>{en.help}</button>
            <button type="button" className="btn" onClick={() => onOpen('settings')}>{en.settings}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
