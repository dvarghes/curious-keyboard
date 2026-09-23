import { fingerById } from '../data/fingers.js';
import { en } from '../strings/en.js';
import { formatPct, formatTime, formatWpm } from '../format.js';
import { Avatar } from './Avatar.jsx';
import { Stars } from './Modal.jsx';

export function Results({ profile, summary, onRetry, onNext, onHome }) {
  const won = summary.status === 'won';
  const hint = summary.fingerHint;
  const finger = hint ? fingerById(hint.finger) : null;
  const celebrate = won && !profile.settings.reducedMotion;
  const confetti = celebrate && summary.stars > 0 && !profile.settings.muteFlashes;
  return (
    <section className="screen" data-testid="results">
      <div className="card stack center">
        <div className={celebrate ? 'hop-wrap' : ''}>
          <Avatar id={profile.avatarId} size={120} />
        </div>
        {confetti && <div className="confetti" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <i key={i} />)}</div>}
        <h1 id="view-title" tabIndex={-1}>{won ? en.resultsWin : en.resultsLose}</h1>
        {!won && <p>{en.loseKind}</p>}
        {summary.mode !== 'campaign' && <p className="hint">Practice stays off the star map.</p>}
        <Stars value={summary.mode === 'campaign' ? summary.stars : 0} />
        <div className="stat-row">
          <p><span className="stat-num">{summary.score}</span><span className="stat-label">{en.score}</span></p>
          <p><span className="stat-num">{summary.caught}/{summary.waveSize}</span><span className="stat-label">{en.words}</span></p>
          <p><span className="stat-num">{formatPct(summary.accuracy)}</span><span className="stat-label">{en.accuracy}</span></p>
          <p><span className="stat-num">{formatWpm(summary.wpm)}</span><span className="stat-label">{en.wpm}</span></p>
          <p><span className="stat-num">{summary.peakCombo}</span><span className="stat-label">{en.comboPeak}</span></p>
          <p><span className="stat-num">{Math.round(summary.cpm || 0)}</span><span className="stat-label">{en.cpm}</span></p>
          <p><span className="stat-num">{formatTime(summary.elapsedMs)}</span><span className="stat-label">{en.time}</span></p>
        </div>
        {finger && (
          <p className="note">
            {hint.letter
              ? `The ${hint.letter.toUpperCase()} key is your ${finger.name}.`
              : `Watch your ${finger.name}.`}
          </p>
        )}
        <div className="row wrap">
          <button type="button" className="btn" onClick={onRetry}>{en.retry}</button>
          {onNext && <button type="button" className="btn btn-primary" onClick={onNext}>{en.nextLevel}</button>}
          <button type="button" className="btn btn-ghost" onClick={onHome}>{en.home}</button>
        </div>
      </div>
    </section>
  );
}
