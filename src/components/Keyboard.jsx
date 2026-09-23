import { FINGERS, KEY_ROWS, fingerById, fingerIdForKey } from '../data/fingers.js';

export function Keyboard({ target = '', targets = [], bumps = [], fingerColors = true, announce = null, wrongKey = '' }) {
  const hot = new Set(targets);
  if (target) hot.add(target);
  const finger = announce || (target ? fingerById(fingerIdForKey(target === ' ' ? ' ' : target)) : null);

  return (
    <div className="kb" aria-hidden="false">
      {KEY_ROWS.map((row) => (
        <div className="kb-row" key={row.join('')}>
          {row.map((key) => {
            const owner = fingerById(fingerIdForKey(key));
            const on = hot.has(key);
            const wrong = wrongKey === key;
            return (
              <div
                key={key}
                className={`key${on ? ' on' : ''}${wrong ? ' wrong' : ''}${bumps.includes(key) ? ' bump' : ''}`}
                style={fingerColors ? { '--finger': owner.color } : undefined}
                data-wrong={wrong ? 'true' : undefined}
              >
                {key}
                {wrong && <span className="key-x" aria-hidden="true">×</span>}
              </div>
            );
          })}
        </div>
      ))}
      <div className="kb-row">
        <div
          className={`key space${hot.has(' ') ? ' on' : ''}${wrongKey === ' ' ? ' wrong' : ''}`}
          data-wrong={wrongKey === ' ' ? 'true' : undefined}
          style={fingerColors ? { '--finger': FINGERS.thumbs.color } : undefined}
        >
          space
          {wrongKey === ' ' && <span className="key-x" aria-hidden="true">×</span>}
        </div>
      </div>
      {finger && (
        <p className="finger-label">
          <i style={{ background: finger.color }} />
          <span>{finger.name}</span>
        </p>
      )}
    </div>
  );
}
