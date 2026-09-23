import { useEffect, useRef } from 'react';

export function Modal({ title, children, confirm, cancel, onConfirm, onCancel, confirmDisabled = false }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
  }, [title]);

  return (
    <div className="modal-back" role="presentation">
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h2 id="modal-title" ref={ref} tabIndex={-1}>{title}</h2>
        {children}
        <div className="row">
          {cancel && <button type="button" className="btn btn-ghost" onClick={onCancel}>{cancel}</button>}
          {confirm && (
            <button type="button" className="btn btn-primary" onClick={onConfirm} disabled={confirmDisabled}>
              {confirm}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function Stars({ value = 0 }) {
  const n = Math.max(0, Math.min(3, value || 0));
  return (
    <span className="stars" aria-label={`${n} of 3 stars`}>
      {[1, 2, 3].map((star) => (
        <i key={star} className={star <= n ? 'on' : ''}>★</i>
      ))}
    </span>
  );
}
