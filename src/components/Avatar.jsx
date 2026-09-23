import { avatarById } from '../data/avatars.js';

export function Avatar({ id, size = 72 }) {
  const avatar = avatarById(id);
  return (
    <svg className="avatar" width={size} height={size} viewBox="0 0 80 80" role="img" aria-label={avatar.name}>
      {shapes(avatar.id)}
    </svg>
  );
}

function shapes(id) {
  if (id === 'panda') return <Panda />;
  if (id === 'owl') return <Owl />;
  if (id === 'robot') return <Robot />;
  if (id === 'dragon') return <Dragon />;
  if (id === 'cat') return <Cat />;
  if (id === 'astronaut') return <Astronaut />;
  if (id === 'dino') return <Dino />;
  return <Fox />;
}

function Eyes({ left = 30, right = 50, y = 36 }) {
  return (
    <>
      <circle cx={left} cy={y} r="3.2" fill="#1c2430" />
      <circle cx={right} cy={y} r="3.2" fill="#1c2430" />
      <circle cx={left + 1} cy={y - 1} r="1" fill="#fff" />
      <circle cx={right + 1} cy={y - 1} r="1" fill="#fff" />
    </>
  );
}

function Fox() {
  return (
    <>
      <path d="M14 28 L24 10 L32 24 Z" fill="#e07a2f" />
      <path d="M66 28 L56 10 L48 24 Z" fill="#e07a2f" />
      <circle cx="40" cy="42" r="22" fill="#f4a259" />
      <ellipse cx="40" cy="50" rx="12" ry="9" fill="#ffe7c7" />
      <Eyes />
      <path d="M40 44 l4 4 -8 0 z" fill="#1c2430" />
      <path d="M22 58 q18 10 36 0" fill="#ef5d3c" />
    </>
  );
}

function Panda() {
  return (
    <>
      <circle cx="18" cy="22" r="10" fill="#1c2430" />
      <circle cx="62" cy="22" r="10" fill="#1c2430" />
      <circle cx="40" cy="44" r="24" fill="#f7f4ee" />
      <ellipse cx="28" cy="42" rx="8" ry="9" fill="#1c2430" />
      <ellipse cx="52" cy="42" rx="8" ry="9" fill="#1c2430" />
      <circle cx="28" cy="42" r="3" fill="#fff" />
      <circle cx="52" cy="42" r="3" fill="#fff" />
      <ellipse cx="40" cy="54" rx="5" ry="3.5" fill="#1c2430" />
    </>
  );
}

function Owl() {
  return (
    <>
      <path d="M16 30 L28 12 L34 28 Z" fill="#8a5a2a" />
      <path d="M64 30 L52 12 L46 28 Z" fill="#8a5a2a" />
      <ellipse cx="40" cy="46" rx="24" ry="22" fill="#c9843a" />
      <circle cx="30" cy="44" r="9" fill="#fff8ea" />
      <circle cx="50" cy="44" r="9" fill="#fff8ea" />
      <circle cx="30" cy="44" r="4" fill="#1c2430" />
      <circle cx="50" cy="44" r="4" fill="#1c2430" />
      <circle cx="30" cy="44" r="11" fill="none" stroke="#2458b5" strokeWidth="2" />
      <circle cx="50" cy="44" r="11" fill="none" stroke="#2458b5" strokeWidth="2" />
      <path d="M30 44 h20" stroke="#2458b5" strokeWidth="2" />
      <path d="M40 52 l5 5 -10 0 z" fill="#ef8a2f" />
    </>
  );
}

function Robot() {
  return (
    <>
      <line x1="40" y1="10" x2="40" y2="20" stroke="#7d8ea3" strokeWidth="3" />
      <circle cx="40" cy="9" r="4" fill="#3ecf8e" />
      <rect x="16" y="20" width="48" height="42" rx="12" fill="#d5deea" />
      <rect x="24" y="30" width="32" height="16" rx="6" fill="#1c2430" />
      <circle cx="33" cy="38" r="3" fill="#7dffa8" />
      <circle cx="47" cy="38" r="3" fill="#7dffa8" />
      <path d="M30 50 h20" stroke="#1c2430" strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

function Dragon() {
  return (
    <>
      <path d="M22 24 q-8 -16 6 -8" fill="none" stroke="#2f8f55" strokeWidth="4" strokeLinecap="round" />
      <path d="M58 24 q8 -16 -6 -8" fill="none" stroke="#2f8f55" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="18" cy="48" rx="10" ry="7" fill="#7dcea0" />
      <ellipse cx="62" cy="48" rx="10" ry="7" fill="#7dcea0" />
      <circle cx="40" cy="44" r="22" fill="#3cb371" />
      <Eyes y={40} />
      <path d="M34 52 q6 6 12 0" fill="none" stroke="#1c2430" strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

function Cat() {
  return (
    <>
      <path d="M18 36 L26 14 L36 32 Z" fill="#f2b455" />
      <path d="M62 36 L54 14 L44 32 Z" fill="#f2b455" />
      <circle cx="40" cy="46" r="22" fill="#f6c56e" />
      <Eyes y={42} />
      <path d="M40 48 l3 3 -6 0 z" fill="#e07a4a" />
      <path d="M18 48 h10 M52 48 h10" stroke="#1c2430" strokeWidth="1.5" />
      <ellipse cx="28" cy="64" rx="8" ry="5" fill="#f6c56e" />
      <ellipse cx="52" cy="64" rx="8" ry="5" fill="#f6c56e" />
    </>
  );
}

function Astronaut() {
  return (
    <>
      <rect x="22" y="50" width="36" height="18" rx="8" fill="#3d9cf2" />
      <circle cx="40" cy="36" r="20" fill="#e8eef5" />
      <circle cx="40" cy="36" r="14" fill="#c9ecff" />
      <Eyes left={33} right={47} y={36} />
      <path d="M34 44 q6 4 12 0" fill="none" stroke="#1c2430" strokeWidth="1.6" />
      <circle cx="40" cy="18" r="3" fill="#ef5d3c" />
    </>
  );
}

function Dino() {
  return (
    <>
      <path d="M18 30 q6 -16 12 0 q6 -16 12 0 q6 -16 12 0" fill="#3cb371" />
      <ellipse cx="42" cy="48" rx="24" ry="18" fill="#46c083" />
      <Eyes left={36} right={54} y={44} />
      <path d="M36 54 q8 5 16 0" fill="none" stroke="#1c2430" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 58 l-8 8 M30 62 l-6 8" stroke="#2f8f55" strokeWidth="4" strokeLinecap="round" />
      <path d="M54 58 l8 8 M62 62 l6 8" stroke="#2f8f55" strokeWidth="4" strokeLinecap="round" />
    </>
  );
}
