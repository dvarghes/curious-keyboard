import { useEffect, useRef } from 'react';
import { stepRun } from './engine.js';

export function positionTiles(run, tileRefs, fieldRef) {
  const field = fieldRef.current;
  if (!field || !run) return;
  const sky = field.querySelector('.sky');
  const height = sky ? sky.clientHeight : field.clientHeight;
  const travel = Math.max(48, height - 76);
  const width = field.clientWidth || 1;
  for (const tile of run.tiles) {
    const node = tileRefs.current.get(tile.id);
    if (!node) continue;
    const y = Math.min(tile.progress, 1) * travel;
    node.style.transform = `translate3d(${tile.x * width}px, ${y}px, 0) translateX(-50%)`;
  }
}

export function useGameLoop({ runRef, tileRefs, fieldRef, pausedRef, onEvents }) {
  const onEventsRef = useRef(onEvents);
  onEventsRef.current = onEvents;

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      last = now;
      const run = runRef.current;
      if (run && run.status === 'running' && !pausedRef.current) {
        const events = stepRun(run, dt);
        if (events.length) onEventsRef.current(events, run);
      }
      positionTiles(run, tileRefs, fieldRef);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [runRef, tileRefs, fieldRef, pausedRef]);
}
