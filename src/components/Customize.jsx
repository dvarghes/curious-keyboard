import { AVATARS } from '../data/avatars.js';
import { SCENES } from '../data/scenes.js';
import { en } from '../strings/en.js';
import { Avatar } from './Avatar.jsx';
import { SceneBits } from './SceneBits.jsx';

export function Customize({ profile, onAvatar, onScene, onBack }) {
  return (
    <section className="screen">
      <div className="card stack">
        <div className="row spread">
          <h1 id="view-title" tabIndex={-1}>{en.customize}</h1>
          <button type="button" className="btn btn-ghost" onClick={onBack}>{en.back}</button>
        </div>
        <fieldset>
          <legend>{en.avatarLabel}</legend>
          <div className="pick-grid">
            {AVATARS.map((avatar) => (
              <label key={avatar.id} className={profile.avatarId === avatar.id ? 'pick on' : 'pick'}>
                <input
                  type="radio"
                  name="avatar"
                  value={avatar.id}
                  checked={profile.avatarId === avatar.id}
                  onChange={() => onAvatar(avatar.id)}
                />
                <Avatar id={avatar.id} />
                <span>{avatar.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>{en.sceneLabel}</legend>
          <div className="pick-grid scenes">
            {SCENES.map((scene) => (
              <label key={scene.id} className={profile.sceneId === scene.id ? 'pick on' : 'pick'}>
                <input
                  type="radio"
                  name="scene"
                  value={scene.id}
                  checked={profile.sceneId === scene.id}
                  onChange={() => onScene(scene.id)}
                />
                <span className={`mini-scene scene-${scene.id}`}>
                  <SceneBits id={scene.id} />
                  <span className="sample-tile">type</span>
                </span>
                <span>{scene.name}</span>
                <small className="hint">{scene.mood}</small>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </section>
  );
}
