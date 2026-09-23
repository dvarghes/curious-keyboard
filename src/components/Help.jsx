import { en } from '../strings/en.js';

export function Help({ canReplay, onReplay, onBack }) {
  return (
    <section className="screen">
      <div className="card stack">
        <div className="row spread">
          <h1 id="view-title" tabIndex={-1}>{en.howTo}</h1>
          <button type="button" className="btn btn-ghost" onClick={onBack}>{en.back}</button>
        </div>
        <h2>Hands</h2>
        <p>{en.helpHands}</p>
        <h2>The game</h2>
        <p>{en.helpPlay}</p>
        <h2>Stars</h2>
        <p>{en.helpStars}</p>
        <h2>Keys</h2>
        <p>{en.helpKeys}</p>
        {canReplay && <button type="button" className="btn btn-primary" onClick={onReplay}>{en.replayLesson}</button>}
      </div>
    </section>
  );
}
