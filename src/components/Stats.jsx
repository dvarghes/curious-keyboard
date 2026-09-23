import { LEVELS } from '../data/levels.js';
import { BADGES } from '../data/badges.js';
import { en } from '../strings/en.js';
import { averageAccuracy, formatPct, formatTime, formatWhen, formatWpm } from '../format.js';
import { Stars } from './Modal.jsx';

export function Stats({ profile, onBack }) {
  const runs = profile.stats.runs || [];
  const maxScore = Math.max(1, ...runs.map((run) => run.score || 0));
  const earned = new Set(profile.stats.badges || []);
  return (
    <section className="screen">
      <div className="card stack">
        <div className="row spread">
          <h1 id="view-title" tabIndex={-1}>{en.stats}</h1>
          <button type="button" className="btn btn-ghost" onClick={onBack}>{en.back}</button>
        </div>
        <div className="stat-row">
          <p><span className="stat-num">{profile.stats.sessions}</span><span className="stat-label">{en.sessions}</span></p>
          <p><span className="stat-num">{profile.stats.totalWords}</span><span className="stat-label">{en.wordsTyped}</span></p>
          <p><span className="stat-num">{formatWpm(profile.stats.bestWpm)}</span><span className="stat-label">{en.bestWpm}</span></p>
          <p><span className="stat-num">{formatPct(averageAccuracy(profile))}</span><span className="stat-label">{en.avgAccuracy}</span></p>
          <p><span className="stat-num">{formatTime(profile.stats.playTimeMs)}</span><span className="stat-label">{en.playTime}</span></p>
          <p><span className="stat-num">{formatWhen(profile.tutorialCompletedAt)}</span><span className="stat-label">{en.tutorialDate}</span></p>
        </div>
        <h2>{en.badges}</h2>
        <div className="badge-row">
          {BADGES.map((badge) => (
            <article key={badge.id} className={earned.has(badge.id) ? 'badge on' : 'badge'}>
              <strong>{badge.name}</strong>
              <p className="hint">{badge.detail}</p>
            </article>
          ))}
        </div>
        <h2>{en.level}</h2>
        <div className="table">
          {LEVELS.map((level) => {
            const best = profile.levelBests[level.id];
            return (
              <div key={level.id} className="table-row">
                <span>{level.id}. {level.name}</span>
                <Stars value={best?.stars || 0} />
                <span>{best ? `${best.score} · ${formatWpm(best.wpm)} ${en.wpm}` : '—'}</span>
              </div>
            );
          })}
        </div>
        <h2>{en.recent}</h2>
        {runs.length === 0 && <p>{en.noRuns}</p>}
        <div className="bars">
          {runs.map((run) => (
            <div key={run.id} className="bar-row">
              <span>{formatWhen(run.date)} · L{run.levelId || '–'} · {formatWpm(run.wpm)} {en.wpm} · {formatPct(run.accuracy)}</span>
              <div className="bar" aria-hidden="true"><i style={{ width: `${(run.score / maxScore) * 100}%` }} /></div>
              <strong>{run.score}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
