import { en } from '../strings/en.js';
import { Avatar } from './Avatar.jsx';

export function Landing({ onStart, onOpen }) {
  return (
    <section className="screen landing">
      <div className="card hero stack">
        <div className="wave-wrap"><Avatar id="fox" size={128} /></div>
        <h1 id="view-title" tabIndex={-1}>{en.appName}</h1>
        <p className="lead">{en.tagline}</p>
        <div className="float-words" aria-hidden="true">
          <span>cat</span><span>sun</span><span>play</span>
        </div>
        <button type="button" className="btn btn-primary btn-large" data-testid="start" onClick={onStart}>{en.start}</button>
        <div className="row wrap">
          <button type="button" className="btn" onClick={() => onOpen('help')}>{en.howTo}</button>
          <button type="button" className="btn" onClick={() => onOpen('profiles')}>{en.profiles}</button>
          <button type="button" className="btn" onClick={() => onOpen('leaderboard')}>{en.leaderboard}</button>
          <button type="button" className="btn btn-ghost" onClick={() => onOpen('settings')}>{en.settings}</button>
        </div>
      </div>
    </section>
  );
}
