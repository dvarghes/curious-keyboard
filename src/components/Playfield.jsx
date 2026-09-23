import { useEffect, useRef, useState } from 'react';
import { SCENES } from '../data/scenes.js';
import { en } from '../strings/en.js';
import { fingerById, fingerIdForKey, promptLabel } from '../data/fingers.js';
import {
  handleKey,
  makeRun,
  nextExpected,
  normalizeGameKey,
  rollingWpm,
} from '../game/engine.js';
import { positionTiles, useGameLoop } from '../game/useGameLoop.js';
import { applyMix, playLose, playMiss, playPop, playTick, playWin, startBed, stopBed } from '../audio/sfx.js';
import { Avatar } from './Avatar.jsx';
import { Keyboard } from './Keyboard.jsx';
import { SceneBits } from './SceneBits.jsx';

function keyboardInitially(settings, levelId, mode) {
  if (mode === 'letters' || mode === 'homerow') return true;
  if (settings.keyboard === 'on') return true;
  if (settings.keyboard === 'off') return false;
  return levelId <= 2;
}

function viewOf(run) {
  return run.tiles.map((tile) => ({
    id: tile.id,
    word: tile.word,
    typed: tile.typed,
    status: tile.status,
    active: tile.id === run.activeId && tile.status === 'falling',
  }));
}

export function Playfield({ profile, level, mode, onExit, onComplete, onScene }) {
  const runRef = useRef(null);
  const tileRefs = useRef(new Map());
  const fieldRef = useRef(null);
  const pausedRef = useRef(false);
  const doneRef = useRef(false);
  const eyesRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const settingsRef = useRef(profile.settings);
  settingsRef.current = profile.settings;

  const [snap, setSnap] = useState([]);
  const [hud, setHud] = useState({ lives: 3, score: 0, combo: 0, wpm: 0 });
  const [paused, setPaused] = useState(false);
  const [ask, setAsk] = useState(null);
  const [showKeys, setShowKeys] = useState(false);
  const [ready, setReady] = useState(false);
  const [mistake, setMistake] = useState(null);
  const askRef = useRef(null);
  const mistakeTimer = useRef(0);
  const shakeFlip = useRef(false);

  function clearMistake() {
    window.clearTimeout(mistakeTimer.current);
    setMistake(null);
  }

  function armMistake(key, tileId) {
    window.clearTimeout(mistakeTimer.current);
    shakeFlip.current = !shakeFlip.current;
    setMistake({ key, tileId, flip: shakeFlip.current ? 'a' : 'b' });
    mistakeTimer.current = window.setTimeout(() => setMistake(null), 1000);
  }

  function publish(run) {
    setSnap(viewOf(run));
    setHud({
      lives: run.lives,
      score: run.score,
      combo: run.combo,
      wpm: Math.round(rollingWpm(run)),
    });
  }

  const onEventsRef = useRef(() => {});
  onEventsRef.current = (events, run) => {
    for (const event of events) {
      if (event.kind === 'tick') {
        playTick();
        clearMistake();
      }
      if (event.kind === 'pop') {
        playPop();
        clearMistake();
      }
      if (event.kind === 'miss' || event.kind === 'fail') {
        playMiss();
        clearMistake();
      }
      if (event.kind === 'edit') clearMistake();
      if (event.kind === 'typo') armMistake(event.key, event.tileId);
    }
    publish(run);
    if (run.result && !doneRef.current) {
      doneRef.current = true;
      pausedRef.current = true;
      if (run.result.status === 'won') playWin();
      else playLose();
      const result = {
        ...run.result,
        eyesUp: eyesRef.current,
        levelId: mode === 'campaign' ? run.result.levelId : level.id,
      };
      setTimeout(() => onCompleteRef.current(result), 420);
    }
  };

  useGameLoop({
    runRef,
    tileRefs,
    fieldRef,
    pausedRef,
    onEvents: (events, run) => onEventsRef.current(events, run),
  });

  useEffect(() => {
    const run = makeRun(level, mode);
    run.reducedMotion = Boolean(profile.settings.reducedMotion);
    runRef.current = run;
    const visible = keyboardInitially(profile.settings, level.id, mode);
    setShowKeys(visible);
    eyesRef.current = !visible;
    doneRef.current = false;
    pausedRef.current = false;
    setPaused(false);
    clearMistake();
    publish(run);
    setReady(true);
    return () => {
      runRef.current = null;
      window.clearTimeout(mistakeTimer.current);
    };
  }, [level, mode]);

  useEffect(() => {
    if (runRef.current) runRef.current.reducedMotion = Boolean(profile.settings.reducedMotion);
  }, [profile.settings.reducedMotion]);

  useEffect(() => {
    applyMix(profile.settings);
    startBed(profile.sceneId);
    return () => stopBed();
  }, [profile.sceneId, profile.settings.music, profile.settings.volume, profile.settings.quietMode, profile.settings.sfx]);

  useEffect(() => {
    const onKey = (event) => {
      const action = normalizeGameKey(event);
      if (!action) return;
      if (action === 'reload') {
        event.preventDefault();
        pausedRef.current = true;
        setPaused(true);
        askRef.current = 'reload';
        setAsk('reload');
        return;
      }
      if (action === 'escape') {
        event.preventDefault();
        if (askRef.current) {
          askRef.current = null;
          setAsk(null);
          return;
        }
        pausedRef.current = !pausedRef.current;
        setPaused(pausedRef.current);
        return;
      }
      if (pausedRef.current || !runRef.current || runRef.current.status !== 'running') return;
      event.preventDefault();
      const events = handleKey(runRef.current, action);
      if (events.length) onEventsRef.current(events, runRef.current);
    };
    const onHide = () => {
      if (document.hidden && runRef.current?.status === 'running') {
        pausedRef.current = true;
        setPaused(true);
      }
    };
    const onLeave = (event) => {
      if (runRef.current?.status === 'running' && !doneRef.current) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('beforeunload', onLeave);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('beforeunload', onLeave);
    };
  }, []);

  useEffect(() => {
    positionTiles(runRef.current, tileRefs, fieldRef);
  }, [snap]);

  useEffect(() => {
    const id = setInterval(() => {
      const run = runRef.current;
      if (!run || pausedRef.current || run.status !== 'running') return;
      setHud((prev) => ({ ...prev, wpm: Math.round(rollingWpm(run)) }));
    }, 200);
    return () => clearInterval(id);
  }, []);

  function toggleKeys() {
    setShowKeys((visible) => {
      const next = !visible;
      eyesRef.current = !next;
      return next;
    });
  }

  function resume() {
    askRef.current = null;
    setAsk(null);
    pausedRef.current = false;
    setPaused(false);
  }

  function restart() {
    const run = makeRun(level, mode);
    run.reducedMotion = Boolean(settingsRef.current.reducedMotion);
    runRef.current = run;
    doneRef.current = false;
    clearMistake();
    resume();
    publish(run);
  }

  const active = snap.find((tile) => tile.active);
  const expected = runRef.current ? nextExpected(runRef.current) : '';
  const finger = expected ? fingerById(fingerIdForKey(expected)) : null;
  const title = mode === 'letters' ? 'Letter Garden' : mode === 'homerow' ? 'Home Row Only' : level.name;

  return (
    <section className={`play-root scene-${profile.sceneId}`} data-testid="playfield" data-fall={level.fallSeconds}>
      <header className="hud">
        <div className="hud-group">
          <Avatar id={profile.avatarId} size={42} />
          <span className="hide-slim">{profile.displayName}</span>
        </div>
        <div className="hud-group">
          <span>{en.level} {mode === 'campaign' ? level.id : ''}</span>
          <span className="hide-slim">{title}</span>
        </div>
        <div className="hud-group" aria-label={en.lives}>
          {[0, 1, 2].map((index) => (
            <span key={index} className={index < hud.lives ? 'heart on' : 'heart'}>♥</span>
          ))}
        </div>
        <div className="hud-group"><span className="hide-slim">{en.score}</span> {hud.score}</div>
        <div className="hud-group hide-slim">{en.combo} {hud.combo}</div>
        <div className="hud-group hide-slim">{en.wpm} {hud.wpm}</div>
        <button type="button" className="btn btn-small" onClick={toggleKeys}>{showKeys ? en.hideKeys : en.showKeys}</button>
        <button type="button" className="btn btn-small" data-testid="pause" onClick={() => { pausedRef.current = true; setPaused(true); }}>{en.pause}</button>
      </header>
      <div className="stage" ref={fieldRef}>
        <div className="sky">
          <SceneBits id={profile.sceneId} />
          {ready && snap.map((tile) => (
            <div
              key={tile.id}
              className="tile-slot"
              ref={(node) => {
                if (node) tileRefs.current.set(tile.id, node);
                else tileRefs.current.delete(tile.id);
              }}
            >
              <div className={`tile${tile.active ? ' active' : ' inactive'}${tile.status === 'popped' ? ' pop' : ''}${mistake && mistake.tileId === tile.id ? ` shake-${mistake.flip}` : ''}`} data-testid={tile.active ? 'active-tile' : 'tile'}>
                <p className="tile-word">
                  <span className="gold">{tile.typed}</span>
                  <span>{tile.word.slice(tile.typed.length)}</span>
                  {tile.active && <span className="caret" />}
                </p>
                {mistake && mistake.tileId === tile.id && (
                  <p className="tile-wrong" role="status" data-testid="tile-wrong">
                    {promptLabel(mistake.key)} {en.wrongKey} {en.tryFinger}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="ground" />
      </div>
      {showKeys && (
        <div className="key-dock">
          <Keyboard target={expected} wrongKey={mistake ? mistake.key : ''} fingerColors={profile.settings.fingerColors} announce={finger} />
        </div>
      )}
      {(paused || ask) && (
        <div className="modal-back">
          <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="pause-title">
            <h2 id="pause-title">{ask === 'quit' ? en.quitAsk : ask === 'reload' ? en.reloadAsk : en.paused}</h2>
            {ask === 'quit' && (
              <div className="row">
                <button type="button" className="btn btn-ghost" onClick={resume}>{en.stay}</button>
                <button type="button" className="btn btn-danger" onClick={onExit}>{en.quit}</button>
              </div>
            )}
            {ask === 'reload' && (
              <div className="row">
                <button type="button" className="btn btn-ghost" onClick={resume}>{en.stay}</button>
                <button type="button" className="btn btn-danger" onClick={() => window.location.reload()}>{en.reload}</button>
              </div>
            )}
            {!ask && (
              <div className="stack">
                <div className="row wrap">
                  <button type="button" className="btn btn-primary" onClick={resume}>{en.resume}</button>
                  <button type="button" className="btn" onClick={restart}>{en.retry}</button>
                  <button type="button" className="btn btn-ghost" onClick={() => { askRef.current = 'quit'; setAsk('quit'); }}>{en.quit}</button>
                </div>
                <p className="hint">{en.sceneLabel}</p>
                <div className="row wrap">
                  {SCENES.map((scene) => (
                    <button
                      key={scene.id}
                      type="button"
                      className={scene.id === profile.sceneId ? 'btn btn-small on' : 'btn btn-small'}
                      onClick={() => onScene(scene.id)}
                    >
                      {scene.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <p className="sr-only" aria-live="polite">{paused ? en.paused : ''}</p>
      {active && <p className="sr-only">Active word has {active.word.length} letters.</p>}
    </section>
  );
}
