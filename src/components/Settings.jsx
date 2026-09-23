import { useState } from 'react';
import { en } from '../strings/en.js';
import { ExportTools } from './ExportTools.jsx';

export function Settings({ profile, board, profiles, onSettings, onPin, onReset, onErase, onClearBoard, onBack }) {
  const [currentPin, setCurrentPin] = useState('');
  const [nextPin, setNextPin] = useState('');
  const [resetPin, setResetPin] = useState('');
  const [eraseText, setEraseText] = useState('');
  const [message, setMessage] = useState('');
  const settings = profile?.settings;

  function savePin(event) {
    event.preventDefault();
    setMessage(onPin(currentPin, nextPin) || 'Pin saved on this device.');
    setCurrentPin('');
    setNextPin('');
  }

  function reset(event) {
    event.preventDefault();
    const error = onReset(resetPin);
    setMessage(error || 'Progress reset. Stars start over.');
    if (!error) setResetPin('');
  }

  function erase(event) {
    event.preventDefault();
    if (eraseText !== 'ERASE') {
      setMessage('Type ERASE to confirm.');
      return;
    }
    onErase();
  }

  return (
    <section className="screen">
      <div className="card stack">
        <div className="row spread">
          <h1 id="view-title" tabIndex={-1}>{en.settings}</h1>
          <button type="button" className="btn btn-ghost" onClick={onBack}>{en.back}</button>
        </div>
        {!profile && <p>{en.noProfiles}</p>}
        {settings && (
          <>
            <fieldset className="stack">
              <legend>{en.sound}</legend>
              <label className="check"><input type="checkbox" checked={settings.music} onChange={(event) => onSettings({ music: event.target.checked })} /> {en.music}</label>
              <label className="check"><input type="checkbox" checked={settings.sfx} onChange={(event) => onSettings({ sfx: event.target.checked })} /> {en.sfx}</label>
              <label className="check"><input type="checkbox" checked={settings.quietMode} onChange={(event) => onSettings({ quietMode: event.target.checked })} /> {en.quiet}</label>
              <p className="hint">{en.quietHint}</p>
              <label className="field">
                <span>{en.volume}</span>
                <input type="range" min="0" max="100" value={Math.round(settings.volume * 100)} onChange={(event) => onSettings({ volume: Number(event.target.value) / 100 })} />
              </label>
              <label className="check">
                <input type="checkbox" checked={settings.speech} onChange={(event) => onSettings({ speech: event.target.checked })} /> {en.speech}
              </label>
              <p className="hint">{en.speechHint}</p>
            </fieldset>
            <fieldset className="stack">
              <legend>Play</legend>
              <label className="check"><input type="checkbox" checked={settings.reducedMotion} onChange={(event) => onSettings({ reducedMotion: event.target.checked })} /> {en.motion}</label>
              <label className="check"><input type="checkbox" checked={settings.highContrast} onChange={(event) => onSettings({ highContrast: event.target.checked })} /> {en.contrast}</label>
              <label className="check"><input type="checkbox" checked={settings.fingerColors} onChange={(event) => onSettings({ fingerColors: event.target.checked })} /> {en.fingerColors}</label>
              <label className="check"><input type="checkbox" checked={settings.dyslexicFont} onChange={(event) => onSettings({ dyslexicFont: event.target.checked })} /> {en.dysFont}</label>
              <label className="check"><input type="checkbox" checked={settings.muteFlashes} onChange={(event) => onSettings({ muteFlashes: event.target.checked })} /> {en.flashes}</label>
              <label className="check"><input type="checkbox" checked={settings.leftHandedHintFlip} onChange={(event) => onSettings({ leftHandedHintFlip: event.target.checked })} /> {en.flip}</label>
              <p className="hint">{en.flipHint}</p>
              <label className="field">
                <span>{en.keys}</span>
                <select value={settings.keyboard} onChange={(event) => onSettings({ keyboard: event.target.value })}>
                  <option value="auto">{en.keysAuto}</option>
                  <option value="on">{en.keysOn}</option>
                  <option value="off">{en.keysOff}</option>
                </select>
              </label>
              <label className="field">
                <span>{en.textSize}</span>
                <select value={settings.textSize} onChange={(event) => onSettings({ textSize: event.target.value })}>
                  <option value="default">{en.textDefault}</option>
                  <option value="large">{en.textLarge}</option>
                </select>
              </label>
            </fieldset>
            <form className="stack" onSubmit={savePin}>
              <h2>{en.pinLabel}</h2>
              {profile.pinHash && (
                <label className="field">
                  <span>{en.pinPrompt}</span>
                  <input value={currentPin} inputMode="numeric" maxLength={4} autoComplete="off" onChange={(event) => setCurrentPin(event.target.value.replace(/\D/g, '').slice(0, 4))} />
                </label>
              )}
              <label className="field">
                <span>New pin</span>
                <input value={nextPin} inputMode="numeric" maxLength={4} autoComplete="off" onChange={(event) => setNextPin(event.target.value.replace(/\D/g, '').slice(0, 4))} />
              </label>
              <button type="submit" className="btn">{en.save}</button>
            </form>
            <form className="stack" onSubmit={reset}>
              <h2>{en.reset}</h2>
              {profile.pinHash && (
                <label className="field">
                  <span>{en.pinPrompt}</span>
                  <input value={resetPin} inputMode="numeric" maxLength={4} autoComplete="off" onChange={(event) => setResetPin(event.target.value.replace(/\D/g, '').slice(0, 4))} />
                </label>
              )}
              <button type="submit" className="btn btn-danger">{en.reset}</button>
            </form>
          </>
        )}
        <div className="stack">
          <h2>{en.grownup}</h2>
          <button type="button" className="btn" onClick={() => { onClearBoard(); setMessage('Device board cleared. Stars stay.'); }}>{en.clearBoard}</button>
          <p className="hint">{en.clearAsk}</p>
          <ExportTools profile={profile} board={board} profiles={profiles} />
          <form className="stack" onSubmit={erase}>
            <label className="field">
              <span>{en.eraseAsk}</span>
              <input value={eraseText} onChange={(event) => setEraseText(event.target.value)} autoComplete="off" />
            </label>
            <button type="submit" className="btn btn-danger">{en.erase}</button>
          </form>
        </div>
        {message && <p role="status">{message}</p>}
      </div>
    </section>
  );
}
