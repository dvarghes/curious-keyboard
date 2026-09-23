# TypeDrop

TypeDrop is a two-hand touch-typing game for children ages 6–12. It runs in Google Chrome on a laptop or Chromebook. A new player starts with a home-row lesson, then catches falling words before they reach the ground. Profiles, scores, and settings stay on this device. There is no account and no install.

The product rules are in [TypeDrop_PRD_v1.md](TypeDrop_PRD_v1.md).

## Run it

Use Node.js 18, 20, or 22. Vite 6 does not start on Node 16.

```powershell
npm install
npm run dev
```

Open http://localhost:5173/.

The public site is https://dvarghes.github.io/curious-keyboard/. Pushing the `main` branch to [dvarghes/curious-keyboard](https://github.com/dvarghes/curious-keyboard) runs `.github/workflows/pages.yml`, which builds with the `/curious-keyboard/` path and publishes GitHub Pages. In the repository settings, set Pages to deploy from GitHub Actions. Local `npm run dev` stays at the site root.

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the local app |
| `npm test` | Runs the game, profile, and export tests |
| `npm run build` | Writes a production build to `dist/` |
| `npm run preview` | Serves the production build |

## What a player can do

- Create up to six profiles, each with an avatar and a scene.
- Take the tutorial, or skip it and start at Level 1.
- Play eight campaign levels. One star unlocks the next level.
- Practice in Letter Garden or Home Row Only.
- See a wrong key named on the tile. When the on-screen keyboard is visible, that key is marked and the correct key stays lit.
- Review stats and a local leaderboard.
- Export or erase the data stored in this browser.

## Layout

| Path | Contents |
| --- | --- |
| `src/components/` | Screens, including the lesson and the playfield |
| `src/game/` | Falling-word rules |
| `src/storage/` | Profiles saved in the browser |
| `src/data/` | Levels, words, avatars, and scenes |
| `public/sw.js` | Offline cache after the first visit |
