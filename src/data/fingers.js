/** Finger colors from the PRD appendix. Each key has one owner. */

export const FINGERS = {
  lpinky: { id: 'lpinky', name: 'left pinky', home: 'A', color: '#E85D4C', keys: ['q', 'a', 'z'] },
  lring: { id: 'lring', name: 'left ring', home: 'S', color: '#F2A03D', keys: ['w', 's', 'x'] },
  lmiddle: { id: 'lmiddle', name: 'left middle', home: 'D', color: '#E7C445', keys: ['e', 'd', 'c'] },
  lindex: { id: 'lindex', name: 'left index', home: 'F', color: '#3CB371', keys: ['r', 't', 'f', 'g', 'v', 'b'] },
  thumbs: { id: 'thumbs', name: 'thumb', home: 'Space', color: '#6B7C8A', keys: [' '] },
  rindex: { id: 'rindex', name: 'right index', home: 'J', color: '#3D9CF2', keys: ['y', 'u', 'h', 'j', 'n', 'm'] },
  rmiddle: { id: 'rmiddle', name: 'right middle', home: 'K', color: '#6C7CFF', keys: ['i', 'k'] },
  rring: { id: 'rring', name: 'right ring', home: 'L', color: '#9B6BDB', keys: ['o', 'l'] },
  rpinky: { id: 'rpinky', name: 'right pinky', home: ';', color: '#D65CA9', keys: ['p', ';'] },
};

export const KEY_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

const KEY_TO_FINGER = {};
for (const finger of Object.values(FINGERS)) {
  for (const key of finger.keys) KEY_TO_FINGER[key] = finger.id;
}

export function fingerIdForKey(key) {
  if (key == null || key === ' ') return 'thumbs';
  return KEY_TO_FINGER[String(key).toLowerCase()] || 'lindex';
}

export function fingerById(id) {
  return FINGERS[id] || FINGERS.lindex;
}

export const LESSON_COPY = {
  lpinky: 'Left pinky lives on A. It also reaches Q and Z.',
  lring: 'Left ring finger lives on S. It also reaches W and X.',
  lmiddle: 'Left middle finger lives on D. It also reaches E and C.',
  lindex: 'Left index finger lives on F. It also reaches R, T, G, V, and B.',
  rindex: 'Right index finger lives on J. It also reaches Y, U, H, N, and M.',
  rmiddle: 'Right middle finger lives on K. It also reaches I.',
  rring: 'Right ring finger lives on L. It also reaches O.',
  rpinky: 'Right pinky lives on the semicolon key. It also reaches P.',
  thumbs: 'Both thumbs rest on the space bar. They press space and nothing else.',
};

const LEFT = ['lpinky', 'lring', 'lmiddle', 'lindex'];
const RIGHT = ['rindex', 'rmiddle', 'rring', 'rpinky'];

/** Right hand leads when the left-handed hint flip is on. Keys stay QWERTY. */
export function lessonOrder(flip) {
  return flip ? [...RIGHT, ...LEFT, 'thumbs'] : [...LEFT, ...RIGHT, 'thumbs'];
}

export function promptLabel(prompt) {
  if (prompt === ' ') return 'space';
  if (prompt === ';') return ';';
  return String(prompt || '').toUpperCase();
}
