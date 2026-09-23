import { useState } from 'react';
import { AVATARS } from '../data/avatars.js';
import { en } from '../strings/en.js';
import { MAX_PROFILES } from '../storage/model.js';
import { starTotal } from '../format.js';
import { Avatar } from './Avatar.jsx';

export function Profiles({ state, onCreate, onUse, onDelete, onBack }) {
  const [mode, setMode] = useState(state.profiles.length ? 'list' : 'create');
  const [name, setName] = useState('');
  const [avatarId, setAvatarId] = useState('fox');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [target, setTarget] = useState(null);
  const [typed, setTyped] = useState('');
  const [pinTry, setPinTry] = useState('');

  function submitCreate(event) {
    event.preventDefault();
    const message = onCreate({ displayName: name, avatarId, pin: pin.trim() });
    setError(message || '');
  }

  function submitDelete(event) {
    event.preventDefault();
    const message = onDelete(target.id, pinTry.trim(), typed);
    if (message) {
      setError(message);
      return;
    }
    setTarget(null);
    setTyped('');
    setPinTry('');
    setError('');
    setMode('list');
  }

  return (
    <section className="screen">
      <div className="card stack">
        <div className="row spread">
          <h1 id="view-title" tabIndex={-1}>{mode === 'create' ? en.createTitle : en.profiles}</h1>
          <button type="button" className="btn btn-ghost" onClick={onBack}>{en.back}</button>
        </div>

        {mode === 'list' && (
          <>
            {state.profiles.length === 0 && <p>{en.noProfiles}</p>}
            <div className="profile-list">
              {state.profiles.map((profile) => (
                <article key={profile.id} className="profile-row">
                  <Avatar id={profile.avatarId} size={64} />
                  <div>
                    <strong>{profile.displayName}</strong>
                    <p className="hint">Level {profile.highestUnlockedLevel || 0} · {starTotal(profile)} stars</p>
                  </div>
                  <button type="button" className="btn btn-primary" onClick={() => onUse(profile.id)}>{en.play}</button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      setTarget(profile);
                      setMode('delete');
                      setError('');
                      setTyped('');
                      setPinTry('');
                    }}
                  >
                    {en.delete}
                  </button>
                </article>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={state.profiles.length >= MAX_PROFILES}
              onClick={() => { setMode('create'); setError(''); }}
            >
              {state.profiles.length >= MAX_PROFILES ? en.maxProfiles : en.create}
            </button>
          </>
        )}

        {mode === 'create' && (
          <form className="stack" onSubmit={submitCreate}>
            <label className="field">
              <span>{en.nameLabel}</span>
              <input
                value={name}
                maxLength={12}
                autoComplete="off"
                onChange={(event) => setName(event.target.value)}
                aria-describedby="name-hint"
              />
              <small id="name-hint" className="hint">{en.nameHint}</small>
            </label>
            <fieldset>
              <legend>{en.avatarLabel}</legend>
              <div className="pick-grid">
                {AVATARS.map((avatar) => (
                  <label key={avatar.id} className={avatarId === avatar.id ? 'pick on' : 'pick'}>
                    <input
                      type="radio"
                      name="avatar"
                      value={avatar.id}
                      checked={avatarId === avatar.id}
                      onChange={() => setAvatarId(avatar.id)}
                    />
                    <Avatar id={avatar.id} size={72} />
                    <span>{avatar.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="field">
              <span>{en.pinLabel}</span>
              <input
                value={pin}
                inputMode="numeric"
                maxLength={4}
                autoComplete="off"
                onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
                aria-describedby="pin-hint"
              />
              <small id="pin-hint" className="hint">{en.pinHint}</small>
            </label>
            {error && <p className="error" role="alert">{error}</p>}
            <div className="row">
              <button type="button" className="btn btn-ghost" onClick={() => setMode('list')}>{en.cancel}</button>
              <button type="submit" className="btn btn-primary">{en.create}</button>
            </div>
          </form>
        )}

        {mode === 'delete' && target && (
          <form className="stack" onSubmit={submitDelete}>
            <h2>{en.deleteTitle}</h2>
            <p>{target.displayName}</p>
            {target.pinHash && (
              <label className="field">
                <span>{en.pinPrompt}</span>
                <input
                  value={pinTry}
                  inputMode="numeric"
                  maxLength={4}
                  autoComplete="off"
                  onChange={(event) => setPinTry(event.target.value.replace(/\D/g, '').slice(0, 4))}
                />
              </label>
            )}
            <label className="field">
              <span>{en.deleteType}</span>
              <input value={typed} onChange={(event) => setTyped(event.target.value)} autoComplete="off" />
            </label>
            {error && <p className="error" role="alert">{error}</p>}
            <div className="row">
              <button type="button" className="btn btn-ghost" onClick={() => setMode('list')}>{en.cancel}</button>
              <button type="submit" className="btn btn-danger" disabled={typed !== target.displayName}>{en.delete}</button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
