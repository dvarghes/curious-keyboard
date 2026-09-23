import { useEffect, useRef, useState } from 'react';
import { HOME_PROMPTS, REACH_PROMPTS } from '../data/levels.js';
import { LESSON_COPY, fingerById, fingerIdForKey, lessonOrder, promptLabel } from '../data/fingers.js';
import { en } from '../strings/en.js';
import { speak } from '../audio/sfx.js';
import { normalizeGameKey } from '../game/engine.js';
import { Avatar } from './Avatar.jsx';
import { Keyboard } from './Keyboard.jsx';

const STEP_IDS = ['welcome', 'posture', 'homerow', 'fingermap', 'rest', 'home_row_test', 'reach_test', 'graduation'];
const WRONG_MARK_MS = 1000;

function startBatch(prompts) {
  return {
    prompts,
    source: prompts,
    total: prompts.length,
    index: 0,
    correct: 0,
    missed: [],
    wrong: false,
    mode: 'main',
  };
}

function finishBatch(state, correct, missed) {
  const threshold = state.phase === 5 ? 10 : 12;
  if (state.batch.mode === 'main' && correct < threshold && missed.length) {
    return {
      ...state,
      flash: false,
      batch: {
        prompts: missed.map((index) => state.batch.source[index]),
        source: state.batch.source,
        total: state.batch.total,
        index: 0,
        correct,
        missed: [],
        wrong: false,
        mode: 'retry',
      },
    };
  }
  if (state.phase === 5) {
    return { ...state, phase: 6, homeScore: correct, batch: startBatch(REACH_PROMPTS), flash: false };
  }
  return { ...state, phase: 7, reachScore: correct, batch: null, flash: false };
}

function onMatch(state) {
  const batch = state.batch;
  const base = { ...state, flash: false, wrongKey: '' };
  const missed = batch.wrong && batch.mode === 'main' ? [...batch.missed, batch.index] : batch.missed;
  const correct = batch.wrong ? batch.correct : batch.correct + 1;
  if (batch.index + 1 < batch.prompts.length) {
    return {
      ...base,
      batch: { ...batch, index: batch.index + 1, correct, missed, wrong: false },
    };
  }
  return finishBatch(base, correct, missed);
}

function reduce(state, action) {
  if (action.type === 'help') return { ...state, help: true };
  if (action.type === 'flash-off') return { ...state, flash: false };
  if (action.type === 'continue') {
    if (state.phase <= 2) return { ...state, phase: state.phase + 1 };
    if (state.phase === 3) {
      if (state.finger + 1 >= action.orderLength) return { ...state, phase: 4 };
      return { ...state, finger: state.finger + 1 };
    }
    return state;
  }
  if (action.type === 'key') {
    if (state.phase === 4) {
      if (action.key !== ' ') return state;
      return { ...state, phase: 5, help: false, batch: startBatch(HOME_PROMPTS) };
    }
    if ((state.phase === 5 || state.phase === 6) && state.batch) {
      const expected = state.batch.prompts[state.batch.index];
      if (action.key !== expected) {
        return {
          ...state,
          flash: true,
          flashId: state.flashId + 1,
          wrongKey: action.key,
          batch: { ...state.batch, wrong: true },
        };
      }
      return onMatch(state);
    }
  }
  return state;
}

const initial = {
  phase: 0,
  finger: 0,
  batch: null,
  homeScore: null,
  reachScore: null,
  flash: false,
  flashId: 0,
  wrongKey: '',
  help: false,
};

function handOf(id) {
  if (id === 'thumbs') return 'thumbs';
  return id.startsWith('l') ? 'left' : 'right';
}

export function Tutorial({ profile, replay, onStep, onGraduated, onSkip, onHome }) {
  const [state, setState] = useState(initial);
  const stateRef = useRef(initial);
  const started = useRef(Date.now());
  const phaseStart = useRef(Date.now());
  const saved = useRef(false);
  const dispatchRef = useRef(() => {});
  const order = lessonOrder(profile.settings.leftHandedHintFlip);

  function dispatch(action) {
    const prev = stateRef.current;
    const next = reduce(prev, action);
    stateRef.current = next;
    setState(next);
    if (next.phase !== prev.phase) {
      const errors = prev.batch ? Math.max(0, prev.batch.total - (prev.phase === 5 ? next.homeScore ?? prev.batch.correct : prev.batch.correct)) : 0;
      onStep?.({
        step_id: STEP_IDS[prev.phase],
        duration_ms: Date.now() - phaseStart.current,
        errors,
      });
      phaseStart.current = Date.now();
    }
    if (next.phase === 7 && prev.phase !== 7 && !saved.current) {
      saved.current = true;
      onGraduated({
        homeRowScore: next.homeScore,
        reachScore: next.reachScore,
        elapsedMs: Date.now() - started.current,
      });
    }
  }
  dispatchRef.current = dispatch;

  useEffect(() => {
    const onKey = (event) => {
      const action = normalizeGameKey(event);
      if (!action || action === 'reload' || action === 'escape') return;
      const phase = stateRef.current.phase;
      if (phase < 4 || phase > 6) return;
      event.preventDefault();
      const key = action === 'space' ? ' ' : action;
      if (key === 'backspace') return;
      dispatchRef.current({ type: 'key', key });
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (state.phase !== 4) return undefined;
    const id = setTimeout(() => dispatch({ type: 'help' }), 20000);
    return () => clearTimeout(id);
  }, [state.phase]);

  useEffect(() => {
    if (!state.flash) return undefined;
    const id = setTimeout(() => dispatch({ type: 'flash-off' }), WRONG_MARK_MS);
    return () => clearTimeout(id);
  }, [state.flashId]);

  useEffect(() => {
    if (state.phase !== 5 && state.phase !== 6) return;
    const prompt = state.batch?.prompts[state.batch.index];
    if (!prompt) return;
    const finger = fingerById(fingerIdForKey(prompt));
    speak(`${promptLabel(prompt)}. ${finger.name}`, profile.settings);
  }, [state.phase, state.batch?.index, state.batch?.mode]);

  const fingerId = order[state.finger] || order[0];
  const nextFinger = order[state.finger + 1];
  const endOfHand = !nextFinger || handOf(nextFinger) !== handOf(fingerId);
  const prompt = state.batch?.prompts[state.batch.index];
  const promptFinger = prompt ? fingerById(fingerIdForKey(prompt)) : null;

  return (
    <section className="screen">
      <div className="card stack tutorial">
        <div className="row spread">
          <p className="dots" aria-hidden="true">
            {STEP_IDS.map((id, index) => <i key={id} className={index === state.phase ? 'on' : index < state.phase ? 'done' : ''} />)}
          </p>
          <div className="row">
            {replay && <button type="button" className="btn btn-ghost" onClick={onHome}>{en.exitReplay}</button>}
            <button type="button" className="btn btn-ghost" data-testid="skip-lesson" onClick={() => onSkip?.(STEP_IDS[state.phase])}>{en.skipLesson}</button>
          </div>
        </div>

        {state.phase === 0 && (
          <>
            <div className="wave-wrap"><Avatar id={profile.avatarId} size={120} /></div>
            <h1 id="view-title" tabIndex={-1}>{en.appName}</h1>
            <p className="lead">{en.welcome}</p>
            <button type="button" className="btn btn-primary" onClick={() => dispatch({ type: 'continue' })}>{en.continue}</button>
          </>
        )}

        {state.phase === 1 && (
          <>
            <h1 id="view-title" tabIndex={-1}>{en.postureTitle}</h1>
            <Posture />
            <p className="lead">{en.postureBody}</p>
            <p className="hint">{en.postureAdult}</p>
            <button type="button" className="btn btn-primary" onClick={() => dispatch({ type: 'continue' })}>{en.continue}</button>
          </>
        )}

        {state.phase === 2 && (
          <>
            <h1 id="view-title" tabIndex={-1}>{en.homeRowTitle}</h1>
            <p className="lead">{en.homeRowBody}</p>
            <p><strong>{en.bumps}</strong></p>
            <Keyboard targets={['a', 's', 'd', 'f', 'j', 'k', 'l', ';']} bumps={['f', 'j']} fingerColors={profile.settings.fingerColors} />
            <button type="button" className="btn btn-primary" onClick={() => dispatch({ type: 'continue' })}>{en.continue}</button>
          </>
        )}

        {state.phase === 3 && (
          <>
            <h1 id="view-title" tabIndex={-1}>{fingerById(fingerId).name}</h1>
            <p className="lead">{LESSON_COPY[fingerId]}</p>
            <Keyboard
              targets={fingerById(fingerId).keys}
              bumps={fingerId === 'lindex' || fingerId === 'rindex' ? [fingerById(fingerId).home.toLowerCase()] : []}
              fingerColors={profile.settings.fingerColors}
              announce={fingerById(fingerId)}
            />
            <button type="button" className="btn btn-primary" onClick={() => dispatch({ type: 'continue', orderLength: order.length })}>
              {endOfHand ? en.continue : en.nextFinger}
            </button>
          </>
        )}

        {state.phase === 4 && (
          <>
            <h1 id="view-title" tabIndex={-1}>{en.restTitle}</h1>
            <p className="lead">{en.restBody}</p>
            {state.help && <p className="hint" role="status">{en.restHelp}</p>}
            <Keyboard target=" " fingerColors={profile.settings.fingerColors} />
          </>
        )}

        {(state.phase === 5 || state.phase === 6) && state.batch && (
          <>
            <h1 id="view-title" tabIndex={-1}>{state.batch.mode === 'retry' ? en.retryTitle : state.phase === 5 ? en.letterTitle : en.reachTitle}</h1>
            <p className={`prompt-letter${state.flash ? ' flash-no' : ''}`} key={state.flashId} aria-live="assertive">{promptLabel(prompt)}</p>
            {state.wrongKey && (
              <p className="error" role="status" data-testid="wrong-key">
                {promptLabel(state.wrongKey)} {en.wrongKey} {en.tryFinger}
              </p>
            )}
            <Keyboard target={prompt} wrongKey={state.flash ? state.wrongKey : ''} fingerColors={profile.settings.fingerColors} announce={promptFinger} />
            <p className="hint">{state.batch.index + 1} / {state.batch.prompts.length}</p>
          </>
        )}

        {state.phase === 7 && (
          <>
            <div className="hop-wrap"><Avatar id={profile.avatarId} size={120} /></div>
            <h1 id="view-title" tabIndex={-1}>{en.gradTitle}</h1>
            <p className="lead">{en.gradEyes}</p>
            <div className="stat-row">
              <p><span className="stat-num">{state.homeScore}/12</span><span className="stat-label">Home row</span></p>
              <p><span className="stat-num">{state.reachScore}/16</span><span className="stat-label">Reaches</span></p>
            </div>
            {(state.homeScore < 10 || state.reachScore < 12) && <p>{en.suggestHome}</p>}
            <button type="button" className="btn btn-primary" onClick={onHome}>{en.playLevel1}</button>
          </>
        )}
      </div>
    </section>
  );
}

function Posture() {
  return (
    <svg className="posture" viewBox="0 0 320 160" role="img" aria-label="Child sitting tall with floating wrists">
      <rect x="210" y="18" width="86" height="58" rx="8" fill="#d7ecff" stroke="#1c2430" />
      <rect x="236" y="76" width="34" height="8" fill="#1c2430" />
      <circle cx="78" cy="48" r="16" fill="#f6c56e" />
      <path d="M62 70 h32 l10 36 h-52 z" fill="#3d9cf2" />
      <path d="M64 78 q-20 10 -8 24" fill="none" stroke="#f6c56e" strokeWidth="6" strokeLinecap="round" />
      <path d="M94 78 q20 10 8 24" fill="none" stroke="#f6c56e" strokeWidth="6" strokeLinecap="round" />
      <path d="M70 106 l-8 28 M90 106 l8 28" stroke="#1c2430" strokeWidth="4" strokeLinecap="round" />
      <rect x="40" y="128" width="70" height="8" rx="3" fill="#8d6a45" />
    </svg>
  );
}
