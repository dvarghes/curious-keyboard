import { useState } from 'react';
import { LEVELS } from '../data/levels.js';
import { en } from '../strings/en.js';
import { formatPct, formatWhen, formatWpm } from '../format.js';
import { topBoard } from '../storage/model.js';
import { Avatar } from './Avatar.jsx';

export function Leaderboard({ profile, board, onBack }) {
  const [tab, setTab] = useState(profile ? 'mine' : 'device');
  const device = topBoard(board, 10);
  return (
    <section className="screen">
      <div className="card stack">
        <div className="row spread">
          <h1 id="view-title" tabIndex={-1}>{en.leaderboard}</h1>
          <button type="button" className="btn btn-ghost" onClick={onBack}>{en.back}</button>
        </div>
        <p className="hint">{en.boardNote}</p>
        <div className="tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'mine'} className={tab === 'mine' ? 'tab on' : 'tab'} onClick={() => setTab('mine')}>{en.myRecords}</button>
          <button type="button" role="tab" aria-selected={tab === 'device'} className={tab === 'device' ? 'tab on' : 'tab'} onClick={() => setTab('device')}>{en.thisDevice}</button>
        </div>
        {tab === 'mine' && (
          profile ? (
            <div className="table">
              {LEVELS.map((level) => {
                const best = profile.levelBests[level.id];
                return (
                  <div key={level.id} className="table-row">
                    <span>{level.id}. {level.name}</span>
                    <span>{best ? `Score ${best.score}` : '—'}</span>
                    <span>{best ? `${formatWpm(best.wpm)} ${en.wpm}` : ''}</span>
                  </div>
                );
              })}
            </div>
          ) : <p>{en.noProfiles}</p>
        )}
        {tab === 'device' && (
          device.length === 0 ? <p>{en.boardEmpty}</p> : (
            <ol className="board">
              {device.map((row) => (
                <li key={row.id}>
                  <Avatar id={row.avatarId} size={42} />
                  <span>{row.displayName}</span>
                  <span>L{row.levelId}</span>
                  <strong>{row.score}</strong>
                  <span>{formatWpm(row.wpm)} {en.wpm}</span>
                  <span>{formatPct(row.accuracy)}</span>
                  <span>{formatWhen(row.date)}</span>
                </li>
              ))}
            </ol>
          )
        )}
      </div>
    </section>
  );
}
