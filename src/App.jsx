import { useEffect, useRef, useState } from 'react';
import { en } from './strings/en.js';
import { getLevel } from './data/levels.js';
import { primeAudio } from './audio/sfx.js';
import {
  acceptPrivacy,
  clearDeviceBoard,
  createProfile,
  eraseAll,
  loadState,
  patchSettings,
  removeProfile,
  saveState,
  setActive,
  setProfilePin,
  writeProfile,
} from './storage/db.js';
import {
  applyRun,
  completeTutorial,
  skipTutorial,
  makeId,
  noteSession,
  pinMatches,
  pushAnalytics,
  replaceProfile,
  resetProgress,
  validatePin,
} from './storage/model.js';
import { Avatar } from './components/Avatar.jsx';
import { SceneBits } from './components/SceneBits.jsx';
import { Modal } from './components/Modal.jsx';
import { Landing } from './components/Landing.jsx';
import { Profiles } from './components/Profiles.jsx';
import { Customize } from './components/Customize.jsx';
import { Tutorial } from './components/Tutorial.jsx';
import { Home } from './components/Home.jsx';
import { Playfield } from './components/Playfield.jsx';
import { Results } from './components/Results.jsx';
import { Stats } from './components/Stats.jsx';
import { Leaderboard } from './components/Leaderboard.jsx';
import { Settings } from './components/Settings.jsx';
import { Help } from './components/Help.jsx';

function activeProfile(current) {
  return current.profiles.find((item) => item.id === current.activeProfileId) || null;
}

export default function App() {
  const [state, setState] = useState(() => loadState());
  const [view, setView] = useState('landing');
  const [replay, setReplay] = useState(false);
  const [play, setPlay] = useState(null);
  const [results, setResults] = useState(null);
  const [menu, setMenu] = useState(false);
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [layoutWarn, setLayoutWarn] = useState(false);
  const stateRef = useRef(state);
  const replayRef = useRef(false);
  const seen = useRef(new Set());
  stateRef.current = state;
  replayRef.current = replay;

  function commit(next) {
    stateRef.current = next;
    saveState(next);
    setState(next);
    return next;
  }

  const profile = activeProfile(state);
  const sceneId = profile?.sceneId || 'meadow';

  useEffect(() => {
    const title = document.getElementById('view-title');
    if (title) title.focus();
  }, [view]);

  useEffect(() => { setMenu(false); }, [view]);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        if (!navigator.keyboard?.getLayoutMap) return;
        const map = await navigator.keyboard.getLayoutMap();
        const keyQ = map.get('KeyQ');
        if (!cancel && keyQ && keyQ.toLowerCase() !== 'q') setLayoutWarn(true);
      } catch {
        /* Some Chrome builds refuse the layout map. */
      }
    })();
    return () => { cancel = true; };
  }, []);

  function onUse(id) {
    let next = setActive(stateRef.current, id);
    const chosen = next.profiles.find((item) => item.id === id);
    if (!chosen) return;
    const visited = noteSession(chosen, seen.current);
    if (visited !== chosen) next = replaceProfile(next, visited);
    commit(next);
    setReplay(false);
    setView(chosen.tutorialCompleted ? 'home' : 'tutorial');
  }

  function onStart() {
    primeAudio();
    if (!stateRef.current.privacyAccepted) return;
    const chosen = activeProfile(stateRef.current);
    if (!chosen) {
      setView('profiles');
      return;
    }
    onUse(chosen.id);
  }

  function onCreate(input) {
    let reducedMotion = false;
    try {
      reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      reducedMotion = false;
    }
    const result = createProfile(stateRef.current, { ...input, reducedMotion });
    if (result.error) return result.error;
    const visited = noteSession(result.profile, seen.current);
    const next = visited === result.profile ? result.state : replaceProfile(result.state, visited);
    commit(next);
    setReplay(false);
    setView('tutorial');
    return '';
  }

  function onDelete(id, pin, typed) {
    const chosen = stateRef.current.profiles.find((item) => item.id === id);
    if (!chosen) return 'That player is already gone.';
    if (chosen.pinHash && !pinMatches(chosen, pin)) return en.pinWrong;
    if (typed !== chosen.displayName) return 'Type the name exactly.';
    commit(removeProfile(stateRef.current, id));
    return '';
  }

  function updateActive(mutator) {
    const current = stateRef.current;
    const chosen = activeProfile(current);
    if (!chosen) return;
    commit(replaceProfile(current, mutator(chosen)));
  }

  function onAvatar(id) {
    updateActive((chosen) => pushAnalytics({ ...chosen, avatarId: id }, 'cosmetic_change', { type: 'avatar', id }));
  }

  function onScene(id) {
    updateActive((chosen) => pushAnalytics({ ...chosen, sceneId: id }, 'cosmetic_change', { type: 'scene', id }));
  }

  function onSettings(patch) {
    const id = stateRef.current.activeProfileId;
    if (!id) return;
    commit(patchSettings(stateRef.current, id, patch));
  }

  function onPin(currentPin, nextPin) {
    const chosen = activeProfile(stateRef.current);
    if (!chosen) return 'Create a player first.';
    if (chosen.pinHash && !pinMatches(chosen, currentPin)) return en.pinWrong;
    if (nextPin && !validatePin(nextPin)) return 'Use 4 digits, or leave the new pin blank to remove it.';
    commit(setProfilePin(stateRef.current, chosen.id, nextPin));
    return '';
  }

  function onReset(pin) {
    const chosen = activeProfile(stateRef.current);
    if (!chosen) return 'Create a player first.';
    if (chosen.pinHash && !pinMatches(chosen, pin)) return en.pinWrong;
    commit(replaceProfile(stateRef.current, resetProgress(chosen)));
    return '';
  }

  function onErase() {
    commit(eraseAll());
    seen.current = new Set();
    setReplay(false);
    setPlay(null);
    setResults(null);
    setView('landing');
  }

  function onStep(payload) {
    updateActive((chosen) => pushAnalytics(chosen, 'tutorial_step_complete', payload));
  }

  function onGraduated(scores) {
    updateActive((chosen) => completeTutorial(chosen, { ...scores, replay: replayRef.current }));
  }

  function onSkip(stepId) {
    updateActive((chosen) => skipTutorial(chosen, { stepId, replay: replayRef.current }));
    setReplay(false);
    setView('home');
  }

  function onPlay(levelId, mode) {
    const chosen = activeProfile(stateRef.current);
    if (!chosen?.tutorialCompleted) {
      setView('tutorial');
      return;
    }
    primeAudio();
    updateActive((profileNow) => pushAnalytics(profileNow, 'level_start', { level_id: levelId, practice_mode: mode }));
    setPlay({ levelId, mode });
    setView('play');
  }

  function onComplete(result) {
    const current = stateRef.current;
    const chosen = activeProfile(current);
    if (!chosen) return;
    const summary = { ...result, id: makeId('r'), date: new Date().toISOString() };
    const applied = applyRun(chosen, current.deviceLeaderboard, summary);
    commit(writeProfile(current, applied.profile, applied.deviceBoard));
    setResults(summary);
    setView('results');
  }

  function goHome() {
    const chosen = activeProfile(stateRef.current);
    setView(chosen?.tutorialCompleted ? 'home' : chosen ? 'tutorial' : 'landing');
  }

  const shellClass = [
    'app',
    `scene-${sceneId}`,
    profile?.settings.highContrast ? 'hc' : '',
    profile?.settings.reducedMotion ? 'reduced-motion' : '',
    profile?.settings.textSize === 'large' ? 'text-large' : '',
    profile?.settings.dyslexicFont ? 'font-dys' : '',
    profile?.settings.muteFlashes ? 'no-flash' : '',
  ].filter(Boolean).join(' ');

  const showChrome = view !== 'play';
  const lockNav = view === 'tutorial' && !replay;

  return (
    <div className={shellClass}>
      <a className="skip" href="#main">Skip to content</a>
      {showChrome && (
        <div className="scene-wash" aria-hidden="true">
          <SceneBits id={sceneId} />
        </div>
      )}
      {showChrome && (
        <header className="topbar">
          <button type="button" className="brand" onClick={() => (lockNav ? null : setView(profile ? 'home' : 'landing'))}>
            {en.appName}
          </button>
          {!lockNav && (
            <nav className="row">
              <button type="button" className="btn btn-small btn-ghost" onClick={() => setView('help')}>{en.howTo}</button>
              <button type="button" className="btn btn-small btn-ghost" onClick={() => setView('leaderboard')}>{en.leaderboard}</button>
              <button type="button" className="btn btn-small btn-ghost" onClick={() => setView('settings')}>{en.settings}</button>
            </nav>
          )}
          {profile && !lockNav && (
            <div className="switcher">
              <button type="button" className="player-chip" aria-expanded={menu} onClick={() => setMenu((open) => !open)}>
                <Avatar id={profile.avatarId} size={36} />
                <span>{profile.displayName}</span>
              </button>
              {menu && (
                <div className="menu" role="menu">
                  {state.profiles.map((item) => (
                    <button type="button" key={item.id} onClick={() => onUse(item.id)}>
                      <Avatar id={item.avatarId} size={32} /> {item.displayName}
                    </button>
                  ))}
                  <button type="button" onClick={() => setView('profiles')}>{en.manageProfiles}</button>
                </div>
              )}
            </div>
          )}
        </header>
      )}
      {layoutWarn && showChrome && <p className="banner" role="status">{en.layoutWarn}</p>}
      {offline && showChrome && <p className="banner" role="status">{en.offline}</p>}
      <main id="main">
        {view === 'landing' && <Landing onStart={onStart} onOpen={setView} />}
        {view === 'profiles' && (
          <Profiles state={state} onCreate={onCreate} onUse={onUse} onDelete={onDelete} onBack={() => setView(profile ? 'home' : 'landing')} />
        )}
        {view === 'customize' && profile && (
          <Customize profile={profile} onAvatar={onAvatar} onScene={onScene} onBack={goHome} />
        )}
        {view === 'tutorial' && profile && (
          <Tutorial profile={profile} replay={replay} onStep={onStep} onGraduated={onGraduated} onSkip={onSkip} onHome={goHome} />
        )}
        {view === 'home' && profile && (
          <Home
            profile={profile}
            onPlay={onPlay}
            onPractice={(mode) => onPlay(1, mode)}
            onOpen={setView}
          />
        )}
        {view === 'play' && profile && play && (
          <Playfield
            profile={profile}
            level={getLevel(play.levelId) || getLevel(1)}
            mode={play.mode}
            onExit={goHome}
            onComplete={onComplete}
            onScene={onScene}
          />
        )}
        {view === 'results' && profile && results && (
          <Results
            profile={profile}
            summary={results}
            onRetry={() => onPlay(results.levelId, results.mode)}
            onNext={results.mode === 'campaign' && results.stars >= 1 && results.levelId < 8 ? () => onPlay(results.levelId + 1, 'campaign') : null}
            onHome={goHome}
          />
        )}
        {view === 'stats' && profile && <Stats profile={profile} onBack={goHome} />}
        {view === 'leaderboard' && (
          <Leaderboard profile={profile} board={state.deviceLeaderboard} onBack={() => setView(profile?.tutorialCompleted ? 'home' : 'landing')} />
        )}
        {view === 'settings' && (
          <Settings
            profile={profile}
            board={state.deviceLeaderboard}
            profiles={state.profiles}
            onSettings={onSettings}
            onPin={onPin}
            onReset={onReset}
            onErase={onErase}
            onClearBoard={() => commit(clearDeviceBoard(stateRef.current))}
            onBack={() => setView(profile?.tutorialCompleted ? 'home' : 'landing')}
          />
        )}
        {view === 'help' && (
          <Help
            canReplay={Boolean(profile)}
            onReplay={() => { setReplay(true); setView('tutorial'); }}
            onBack={() => setView(profile?.tutorialCompleted ? 'home' : 'landing')}
          />
        )}
      </main>
      {!state.privacyAccepted && (
        <Modal title={en.privacyTitle} confirm={en.privacyAccept} onConfirm={() => commit(acceptPrivacy(stateRef.current))}>
          <p>{en.privacyBody}</p>
        </Modal>
      )}
    </div>
  );
}
