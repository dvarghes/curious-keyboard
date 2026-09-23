# TypeDrop

**Product Requirements Document / Feature Specification**  
Version 1.0 · Draft for engineering and design · 22 September 2026  
Status: Ready for review

**A two-hand touch-typing game for kids in Chrome**

> TypeDrop teaches children to type with both hands without looking by combining a guided home-row tutorial with an arcade game of falling word tiles. Kids type each word before it hits the ground, level up as words get longer and faster, then review their stats and personalize avatars and scenes.

| Field | Value |
| --- | --- |
| Document type | PRD / Feature Specification |
| Product name | TypeDrop |
| Version | 1.0 · Draft for engineering and design |
| Date | 22 September 2026 |
| Status | Ready for review |
| Platform | Google Chrome (desktop / laptop) — web app |
| Primary audience | Children ages 6–12, with parent or teacher setup |
| Core loop | Learn finger map → catch falling words → level up → review stats |
| Owner | Product · Design · Engineering |

This document defines what TypeDrop must do in version 1.0, why those features exist, how success is measured, and the acceptance criteria teams should build against. It is written so design, engineering, and QA can implement without guessing the learning model or the game rules.

---

## 1. Purpose and problem

### 1.1 Problem

Most children first meet a keyboard by pecking with one or two fingers while staring at the keys. That habit is slow to unlearn, and typical typing drills feel like homework. Schools and parents want a browser-based activity that:

- Teaches correct two-hand posture and finger-to-key mapping before free play.
- Keeps eyes on the screen, not the keyboard, through short, game-like practice.
- Scales difficulty with word length and fall speed so beginners and faster typists both stay in flow.
- Shows progress in a way a child and an adult can understand.
- Runs in Chrome with no install, suitable for school Chromebooks and home laptops.

### 1.2 Opportunity

A falling-tile mechanic creates natural urgency: type the word or lose a life. Combined with a first-run tutorial that locks in home-row posture, TypeDrop turns muscle memory into a game instead of a worksheet. Customization (avatars and scenes) and a personal leaderboard give kids a reason to return without requiring a social network.

### 1.3 Product vision

After a few weeks of short sessions, a child can rest both hands on the home row, type common words without looking down, and see their accuracy and words-per-minute improve on their own board.

---

## 2. Goals and success metrics

### 2.1 Goals

1. Teach standard QWERTY two-hand finger placement before any arcade mode.
2. Build look-at-the-screen habit by never requiring the child to hunt keys visually as the primary strategy.
3. Provide a clear difficulty ladder: longer words and faster falling tiles.
4. Let the child see personal stats and compare runs on a local leaderboard.
5. Support identity and delight through avatars and background scenes.
6. Ship a Chrome-first experience that works offline after first load where possible.

### 2.2 Success metrics (v1)

| Metric | Definition | v1 target |
| --- | --- | --- |
| Tutorial completion | % of new profiles that finish the hand-placement tutorial and letter test. A profile that uses Skip lesson is not counted as complete. | ≥ 80% |
| Look-down rate proxy | % of tutorial letter tests completed with on-screen finger hints dismissed after first pass | Tracked; no hard gate |
| Session length | Median active play per visit after tutorial | 8–15 minutes |
| Level reach | % of weekly active players who reach Level 4+ | ≥ 50% |
| Accuracy | Mean character accuracy on completed words in Levels 1–3 | ≥ 85% |
| Return play | % of profiles with a second session within 7 days | ≥ 40% |
| Customization use | % of profiles that change avatar or scene at least once | ≥ 60% |

Metrics are stored per local profile. No third-party analytics that identify a child are required for v1.

---

## 3. Audience and personas

### 3.1 Primary users

| Persona | Age / context | Needs |
| --- | --- | --- |
| Maya, beginner | 6–8, home or grade 1–3 | Large type, spoken hints, short words, celebration, cannot yet read long instructions |
| Leo, practicing | 9–12, homework + games | Faster levels, visible WPM, avatars, wants to beat yesterday’s score |
| Ms. Patel, teacher | Classroom Chromebooks | No account friction, works in Chrome, quiet mode, class-safe content |
| Dad, supervisor | Parent on family laptop | COPPA-safe, no chat, can see progress, reset if needed |

### 3.2 Assumptions

- Physical QWERTY keyboard (not on-screen tablet keyboard) is the intended input.
- English words and A–Z letters for v1. Shift / punctuation are not required to finish the core loop.
- One browser profile may hold several child profiles on the same device.
- An adult may help start the first session; the child should be able to replay tutorial alone.

---

## 4. Product principles

- **Hands first, speed later.** A new profile opens the tutorial first, and the lesson still teaches posture and the finger map. Skip lesson stays on screen for a child, parent, or teacher who already knows the home row.
- **Eyes up.** The playfield, not the physical keys, is where attention belongs. Hints live on screen.
- **Fail kindly.** Missed words cost a life, not shame. Feedback is specific (“left index — F”) not punitive.
- **Short sessions win.** Levels last 60–90 seconds. A child can succeed in one recess or snack break.
- **Safe by default.** No chat, no public usernames that look like real names, no ads, no tracking pixels.
- **Readable at a glance.** High-contrast tiles, large type, color is never the only signal.

---

## 5. Platform and constraints

### 5.1 Must run in

- Google Chrome current stable and previous two majors, desktop/laptop.
- Chromebooks used in schools (Chrome OS).
- Minimum viewport: 1280 × 720. Game scales down to 1024 × 600 with simplified HUD.
- Keyboard: standard FI-fi QWERTY. Detect and warn if a non-QWERTY layout is reported.

### 5.2 Out of scope for v1 platform

- Native mobile apps, iPad-only layouts, on-screen keyboards as the primary trainer.
- Multiplayer live races.
- Account systems that require an email from the child.

### 5.3 Technical shape

Single-page web app. Recommended stack is implementation-flexible (for example Canvas or DOM tiles + Web Audio). Persist profiles in `localStorage` or IndexedDB. Optional later sync is not in v1. Must remain playable if the network drops after assets are cached (service worker recommended).

---

## 6. End-to-end user journey

1. Open TypeDrop in Chrome. Landing screen: Start, How to Play, Profiles, Leaderboard.
2. Create or pick a child profile. Choose an avatar and a display name (first name or nickname only).
3. First-time profile enters Tutorial. Skip lesson is available on every step. Skipping or graduating both open Home with Level 1 unlocked. The lesson can be replayed later.
4. Tutorial: posture → home row → finger map → letter test → short recap.
5. Player reaches Home. Can play next unlocked level, change scene/avatar, or view stats.
6. In a level: word tiles fall; player types the focused word; correct words pop; missed words hit the ground and cost a life.
7. Level ends by clearing the wave, running out of lives, or timer. Results screen shows accuracy, WPM, combo, stars.
8. Stars unlock the next level. High scores write to the local leaderboard for that profile and for the device.

---

## 7. Feature specification

### 7.1 Profiles

A profile is the unit of progress, cosmetics, and stats. v1 stores profiles only on the device.

**Requirements**

- Create up to 6 profiles per browser origin.
- Fields: display name (2–12 characters, letters/numbers/spaces/hyphen), avatar id, scene id, `tutorialCompleted` flag, `highestUnlockedLevel`, settings (sound, reduced motion, left-handed hint flip off by default).
- Adult pin optional: 4-digit local pin to delete a profile or reset progress. Not an online password.
- Switch profile from the header without losing the current run’s autosave of completed levels.
- Delete profile with a typed confirm of the display name.

### 7.2 Avatars

Avatars are kid-safe illustrated characters, not photo uploads and not free-form dress-up that could produce inappropriate combinations.

**v1 avatar set (minimum 8)**

| ID | Name | Notes |
| --- | --- | --- |
| fox | Flicker the Fox | Default. Orange scarf, friendly |
| panda | Pip Panda | Round, high contrast |
| owl | Nia Owl | Glasses motif — “watch the screen” |
| robot | Dot the Robot | LED smile, gender-neutral |
| dragon | Ember Dragon | Small, non-scary |
| cat | Key Cat | Paws on home row pose |
| astronaut | Nova | Helmet up so face is visible |
| dino | Type-o-saur | Tiny arms joke, still two-handed |

- Avatar appears on the HUD during play, on the results screen, and on leaderboard rows.
- Selection grid on profile create and in a Customize screen. Hover/focus announces name.
- No user-generated images. No camera access.

### 7.3 Background scenes

A scene is a full-playfield backdrop plus matching ground strip and particle style. Scenes must never reduce tile contrast below WCAG AA for the word text.

**v1 scene set (minimum 6)**

| ID | Scene | Mood / motion |
| --- | --- | --- |
| meadow | Sunny Meadow | Default. Soft hills, slow clouds |
| space | Star Lane | Gentle parallax stars, no flicker |
| ocean | Coral Bay | Slow caustics, fish in margins |
| forest | Lantern Woods | Fireflies, dusk-safe contrast |
| castle | Cloud Castle | Banners, static architecture |
| lab | Gadget Lab | Soft grid, kid-science |

- Scene can be changed from Home and from the pause menu. Change applies next level or immediately in the lobby preview.
- Reduced-motion setting freezes parallax and particles.
- Word tiles use a consistent plate (rounded rectangle + drop shadow) so scene art cannot wash out letters.

### 7.4 Tutorial — hand placement and letter test

The tutorial is the product’s teaching core. A new profile always opens it before arcade play. It is a full lesson, and Skip lesson is available on every step.

**Tutorial goals**

- Child can sit with both feet down (illustrated), shoulders relaxed, screen at eye line.
- Child places left hand on `A S D F` and right hand on `J K L ;` with thumbs on the space bar.
- Child can name which finger owns which home-row key.
- Child types prompted letters using the assigned finger, looking at the on-screen keyboard — not hunting on the physical board as the primary strategy.

**Tutorial flow (gated steps)**

1. **Welcome.** Short spoken-optional + written line: “We will put both hands on the keyboard and keep our eyes on the screen.” Avatar waves.
2. **Posture card.** Illustration: chair, screen, wrists floating (not collapsed), fingers curved. Adult-helper note in smaller type.
3. **Home-row drop.** Animated top-down keyboard. Left hand highlights A–F, right hand J–;. Bumps on F and J called out: “Feel the little bumps. Those are home.”
4. **Finger map.** One finger at a time lights up with color + label. Example: “Left pointer finger lives on F. It also reaches R, T, G, V, B.” Child taps Continue after each hand.
5. **Guided rest.** Prompt: “Place your fingers now. Press the space bar when both thumbs are ready.” Space bar advances. If no space after 20s, show the helper prompt again.
6. **Letter test — home row.** 12 prompts (`F J D K S L A ; F J space D`). Each prompt shows the letter large, the ghost keyboard with correct finger colored, and a finger name. Wrong key: same rule as below.
7. **Letter test — reach keys.** 16 prompts mixing home row plus E, I, R, U, G, H, C, N (high-frequency reaches). Wrong key: same rule as below.
8. **Graduation.** Score: letters correct, time, “eyes up” reminder. Unlock Level 1. Offer Replay tutorial anytime from Help.

**Wrong key during either letter test**

- The prompt stays on the same letter.
- The big letter shakes for 1s.
- Copy names the pressed key and keeps the finger line: “G is the wrong key. Try the finger that is glowing.”
- That key on the on-screen keyboard shows a red × for no more than 1s. The correct key stays lit, and the finger name stays on screen.
- The app does not vibrate the device or change the feel of the physical key. The only touch cue in the lesson is step 3, where the child feels the bumps already on F and J.

**Finger-to-key map (v1 teaching model)**

Standard QWERTY touch-typing. Colors below are on-screen hints only; color is paired with a finger name and a keyboard glow.

| Finger | Home key | Also teaches in v1 |
| --- | --- | --- |
| Left pinky | A | Q, W (intro only in later tutorial replay), Caps not required |
| Left ring | S | W, E (E in letter test) |
| Left middle | D | E, C |
| Left index | F | R, T, G, V, B |
| Left thumb | Space | Space only |
| Right thumb | Space | Space only |
| Right index | J | Y, U, H, N, M |
| Right middle | K | I, comma (not scored in v1 words) |
| Right ring | L | O |
| Right pinky | ; | P (intro in Level 5+ words as needed) |

> **Design rule.** During tutorial letter tests, the physical key the child should press is always mirrored on a large on-screen keyboard. The correct finger is named in words (“left index”) every time. Do not rely on color alone. Do not show a red X for more than 1 s.

**Tutorial pass criteria**

- Home-row test: at least 10 of 12 correct. Retry the missed letters once; then continue even if imperfect so the child is not trapped.
- Reach test: at least 12 of 16 correct, same retry rule.
- Always mark `tutorialCompleted = true` after graduation so the child can play. Weak scores flag “Practice home row” as a suggested extra mode, not a lock.

**Skip lesson**

- Show a Skip lesson button on steps 1–8, including both letter tests and Graduation. Copy is grade 2: “Skip lesson”.
- One activation is enough. Do not add a second confirm.
- Skip sets `tutorialCompleted = true` and `tutorialCompletedAt`, leaves `homeRowScore` and `reachScore` empty, turns on the “Practice home row” suggestion, unlocks Level 1, and opens Home.
- A skipped profile is not counted in the tutorial-completion metric in section 2.2.
- During a replay from Help, Skip lesson returns to Home and does not change stars, the unlocked level, or stored letter-test scores.

### 7.5 Core game — falling word tiles

**Playfield**

- Vertical lane or open sky occupying ~70% of the viewport. Ground line at the bottom 12%.
- HUD top: avatar + name, level number, lives (stars or hearts, 3 by default), score, combo, current WPM (rolling 5 seconds), pause.
- Input is captured globally while the level is running. A hidden text buffer matches against the active word. Visible caret optional on the active tile.
- Only one word is “active” (the lowest tile, or the tile the player has already started typing). Other tiles continue falling but do not accept input until they become active.

**Tile behavior**

1. A tile spawns at a random X within safe margins, displaying one word in large, high-contrast type.
2. Tile falls at the level’s pixels-per-second rate. Slight horizontal drift is optional and off when reduced motion is on.
3. As the player types, matching letters fill on the tile (typed prefix turns gold). Wrong letter: see the rule below).
***Wrong letter while typing a word***

• The letter is not added. The gold letters already typed stay as they are, and the same word stays active.
• The active tile shakes for 1 second.
• A line under the word names the pressed key and keeps the finger cue: "G is the wrong key. Try the finger that is glowing."
• When the on-screen keyboard is visible, the pressed key shows a red × for no more than 1 second. The next correct key stays lit, and its finger name stays on screen.
• The combo resets to 0. v1 does not freeze the tile.
• The app does not vibrate the device or change the feel of the physical key.
• If the keyboard is hidden, the shake and the named-key line still appear.

4. Complete word: pop animation, score = base × combo × speed bonus, next lowest tile becomes active.
5. Tile reaches the ground unfinished: life −1, word discarded, brief “miss” chime, next tile activates.
6. Lives reach 0: level failed. Player may retry the same level with no penalty to unlock state.

**Input rules**

- Case-insensitive. v1 words are lowercase on tiles; Shift is not required.
- Backspace allowed on the current word. It does not un-pop completed words.
- Space submits only if the word is fully correct; otherwise space is ignored for words that contain no space (all v1 words are single tokens).
- Holding a key does not type repeats into the buffer.
- IME / dead keys: ignore composition except for direct A–Z and backspace.

**Scoring**

| Event | Points |
| --- | --- |
| Complete a word | 10 × letter count |
| Combo 2, 3, 4+ in a row | ×1.2, ×1.5, ×2.0 |
| Speed bonus (finished in top 40% of allowed fall time) | +25% |
| Perfect level (no misses, no typos) | +100 flat |
| Miss (hits ground) | 0 and combo = 0 |
| Typo | 0 extra; combo = 0 |

### 7.6 Levels and progression

Progression is linear for v1. Completing a level with at least 1 star unlocks the next. Stars are kept as the best result per level.

**Star rules**

- **1 star:** finish with ≥ 1 life and ≥ 60% words caught.
- **2 stars:** ≥ 80% words caught and accuracy ≥ 85%.
- **3 stars:** no lives lost, accuracy ≥ 95%, and at least the target WPM for that level.

**Level table (v1 ladder)**

| Lv | Theme | Word length | Fall time* | Active tiles | Word pool |
| --- | --- | --- | --- | --- | --- |
| 1 | Home Row Hop | 2–3 (home-row letters) | 7.0 s | 1–2 | as, ad, add, sad, fad, lad, all, fall, dad, jazz (simplified) |
| 2 | First Reaches | 3–4 | 6.5 s | 2 | high-frequency CVC: cat, dog, run, sit, red, big, jump |
| 3 | Sight Words | 3–5 | 6.0 s | 2–3 | Dolch pre-primer / primer subset |
| 4 | Longer Steps | 4–6 | 5.5 s | 3 | grade 2 list, no silent-letter traps yet |
| 5 | Pick Up Speed | 5–7 | 5.0 s | 3 | mixed; introduce P, W more often |
| 6 | Rain Band | 5–8 | 4.5 s | 3–4 | common phrases split to single words |
| 7 | Storm | 6–9 | 4.0 s | 4 | longer high-frequency words |
| 8 | Expert Sky | 7–10 | 3.5 s | 4 | challenge list; still child-appropriate |

\*Fall time is the seconds a tile takes from spawn to ground at that level’s speed. Implementation may use px/s derived from playfield height so different screens feel the same.

**Wave structure**

- Each level is one wave of N words (12 / 14 / 16 / 16 / 18 / 18 / 20 / 20 for levels 1–8).
- Spawn interval starts at 1.8 s and shortens with level so multiple tiles can be in flight.
- Never spawn a new tile that overlaps an existing tile’s hit box unreadable; nudge X.
- Boss beat (optional juice, not a new mechanic): last 3 words of levels 4+ fall 10% faster.

**Practice modes (unlocked after tutorial)**

- **Letter Garden:** only A–Z falling one at a time. Does not advance campaign stars.
- **Home Row Only:** campaign rules but word pool restricted. Suggested if tutorial score was weak.
- **Replay Any Unlocked Level.**

### 7.7 Results, stats, and leaderboard

**End-of-level results**

- Stars earned, score, words caught / missed, character accuracy, peak combo, WPM, characters per minute.
- Finger hint if a repeated error cluster is detected (e.g., “The E key is your left middle finger.”).
- Buttons: Replay, Next Level (if unlocked), Home.

**Profile stats screen**

- Lifetime: sessions, total words typed, best WPM, average accuracy, total play time, tutorial date.
- Per-level best stars, best score, best WPM.
- Last 10 runs sparkline or simple bar list (date, level, score, WPM, accuracy).
- Simple badge strip: First Word, Home Row Hero, 3-Star Level 1, Combo 10, Eyes Up (complete a level after dismissing the on-screen keyboard overlay).

**Leaderboard**

Two tabs, both local to the device. No global internet ranking in v1.

- **My records.** Best score and best WPM per level for the current profile.
- **This device.** Top 10 runs across all profiles on this browser origin, showing avatar, display name, level, score, WPM, date.
- Names are profile display names only. No last names, emails, or photos.
- Adult can clear the device board from Settings without deleting profiles.
- If two runs tie on score, earlier date ranks higher, then higher accuracy.

### 7.8 Settings and accessibility

- Master volume, music, SFX toggles.
- Reduced motion.
- High contrast tiles (forces dark plate + white text regardless of scene).
- Show on-screen keyboard during campaign: On / Auto (levels 1–2) / Off.
- Finger color overlay on/off.
- Text size: default / large.
- Dyslexic-friendly font option (e.g., a bundled Atkinson Hyperlegible or OpenDyslexic — pick one and license it).
- Mute celebration full-screen flashes (photosensitivity).

### 7.9 Audio and feedback

- Soft music loop per scene, ducking when a word is completed.
- Distinct SFX: correct letter tick, word pop, miss, level win, level lose. No startling screams or buzzers.
- Optional letter-name speech in tutorial and Letter Garden (Web Speech API, English). Off by default in classrooms if a Quiet Mode setting is on.
- Quiet Mode: no speech, lower music, shorter fanfares.

---

## 8. Information architecture

Primary screens:

- Landing
- Profile picker / create / customize
- Tutorial (linear stepper, Skip lesson on every step)
- Home (next level CTA, customize, stats, help)
- Level play (canvas/playfield)
- Pause overlay
- Results
- Stats
- Leaderboard
- Settings
- Help / replay tutorial

Deep links are not required in v1. Back from play always confirms if a wave is in progress.

---

## 9. Content rules

- Word lists are curated. No user-generated words in v1.
- No violence, romance, insults, brand trademarks, politics, or religious instruction in words or scenes.
- Avoid easily confused look-alikes in early levels (e.g., do not pair “there/their” as falling twins).
- American English spelling for v1 lists.
- Maximum word length 10 characters so tiles stay readable.
- Copy reading level: grade 2 for UI chrome; tutorial spoken lines grade 1.

---

## 10. Data and privacy

- No account, no email, no third-party ad SDKs, no social login.
- Store only what the game needs: profile cosmetics, progress, run history, settings.
- Do not collect precise location, contacts, camera, or microphone (speech is TTS out, not mic in).
- COPPA / school-friendly: treat all profiles as children. If a privacy notice is shown, it is for the adult on first launch.
- Export/delete: Settings offers “Download my stats (JSON)” and “Erase all TypeDrop data on this device.”
- Cookies: only technical storage. No marketing cookies.

---

## 11. Non-functional requirements

| Area | Requirement |
| --- | --- |
| Performance | 60 fps on a mid-range Chromebook during 4 simultaneous tiles. Input-to-glyph latency under 50 ms. |
| Load | First useful paint of Landing under 2 s on school Wi-Fi; tutorial assets lazy-loaded. |
| Offline | After first visit, tutorial + levels 1–4 playable offline if service worker cached. |
| Reliability | A refresh mid-level does not corrupt profile; at worst the run is abandoned. |
| Compatibility | Chrome pointer + keyboard. No Flash. No plugins. |
| i18n | UI strings externalized. English only shipped in v1. |
| Analytics | Optional anonymous local counters only, unless a later school build adds a district-approved tool. |

---

## 12. Functional requirements checklist

The following IDs are the implementation contract for v1.

1. **FR-1** App loads in Chrome without install and shows Landing.
2. **FR-2** User can create, switch, edit cosmetics, and delete profiles.
3. **FR-3** First session of a new profile launches Tutorial. The user can still walk steps 1–8 in order.
4. **FR-4** Tutorial teaches posture, home row, finger map, and runs both letter tests.
5. **FR-5** On-screen keyboard and named finger highlight every tutorial prompt.
6. **FR-6** Graduation unlocks Level 1 and Home.
7. **FR-7** Campaign presents falling word tiles; typing the active word pops the tile.
8. **FR-8** A tile that reaches the ground costs a life; 0 lives ends the level.
9. **FR-9** Levels 1–8 increase word length and decrease fall time per the level table.
10. **FR-10** Stars unlock the next level; best stars persist per profile.
11. **FR-11** Results show score, accuracy, WPM, combo, stars.
12. **FR-12** Stats screen shows lifetime and per-level records.
13. **FR-13** Leaderboard has My records and This device tabs.
14. **FR-14** User can choose avatar from the v1 set.
15. **FR-15** User can choose scene from the v1 set without breaking tile contrast.
16. **FR-16** Settings include sound, reduced motion, high contrast, on-screen keyboard visibility.
17. **FR-17** Help allows full tutorial replay.
18. **FR-18** No chat, no public internet leaderboard, no child email gate.
19. **FR-19** User can skip the tutorial from any step. Skip unlocks Level 1 and Home, marks the tutorial complete, and does not record letter-test scores.

---

## 13. UX notes for design

- Typeface on tiles: a single rounded grotesque, weight 700, letter-spacing slightly open. Avoid condensed faces.
- Minimum tile type size 28 px at 1280-wide; scale up on larger monitors.
- Active tile has a thicker ring and a small triangle pointer. Inactive tiles are 15% dimmer, never unreadable.
- Pause is Esc and a visible button. Focus must not fall into the Chrome address bar mid-game; document-level `keydown` with `preventDefault` on game keys.
- Do not capture browser shortcuts the child needs (Ctrl+R confirm first). F5 / Ctrl+R should pause and ask.
- Celebration: avatar does a 1-second hop. Confetti is optional and respects reduced motion and flash settings.
- Classroom mode consideration: avoid full-screen takeover that teachers cannot exit; Esc always works.

---

## 14. Acceptance criteria (QA)

### 14.1 Tutorial

- New profile always starts in tutorial. Existing completed profile starts at Home.
- Skip lesson is visible on every tutorial step.
- Skip lesson on a new profile opens Home with Level 1 unlocked and empty letter-test scores.
- Skip lesson during a Help replay does not change stars or the unlocked level.
- Space-bar gate on “hands ready” does not accept other keys as success.
- Wrong letter in the letter test never advances the prompt.
- After two attempts on a failed batch, user still reaches Graduation.
- Replay tutorial from Help does not wipe campaign stars.

### 14.2 Gameplay

- Only the active word consumes keystrokes.
- Partial type + miss-to-ground does not apply leftover letters to the next word.
- Fall time on Level 1 vs Level 8 is measurably different (±10% of spec) on a 1080p window.
- Three lives: three ground hits end the run.
- Backspace edits the current buffer only.
- Reduced motion disables drift and background loops.
- A wrong letter during a level does not change the word, shakes the active tile for 1 second, names the pressed key, and marks that key on the on-screen keyboard when the keyboard is visible. The next correct key stays lit.    

### 14.3 Progression and meta

- Failing Level 3 does not unlock Level 4.
- One-star clear unlocks the next level.
- Leaderboard updates immediately after a run that beats a stored best.
- Switching profiles switches stars, avatar, scene, and board context.
- Clearing device leaderboard does not reset stars.

### 14.4 Customization

- Each of the 8 avatars and 6 scenes is selectable and persists after reload.
- Scene change is visible in the Home preview and in the next play session.
- High-contrast mode keeps word contrast ≥ 4.5:1 on every scene.

### 14.5 Safety

- No network calls required to play after cache, other than optional first-load assets.
- No input field accepts a full email as a profile name (block `@`).
- No microphone permission prompt appears anywhere in v1.

---

## 15. Analytics events (local or future school build)

| Event | Payload (no PII) |
| --- | --- |
| `tutorial_step_complete` | `step_id`, `duration_ms`, `errors` |
| `tutorial_finished` | `home_row_score`, `reach_score` |
| `tutorial_skipped` | `step_id` |
| `level_start` | `level_id`, `practice_mode` |
| `word_resolved` | `len`, `correct`, `ms`, `typos` |
| `level_end` | `stars`, `score`, `wpm`, `accuracy`, `lives_left` |
| `cosmetic_change` | `type=avatar\|scene`, `id` |

Do not attach display names to exported research logs.

---

## 16. Milestones

| Milestone | Scope |
| --- | --- |
| M0 — Foundations | App shell, profiles, local persistence, scene/avatar picker, settings |
| M1 — Teach | Full tutorial + letter tests + on-screen keyboard + finger map |
| M2 — Play | Falling tiles, input engine, lives, scoring, levels 1–4 |
| M3 — Progress | Levels 5–8, stars, results, stats, leaderboard |
| M4 — Polish | SFX/music, Quiet Mode, reduced motion, Chromebook QA, offline cache |
| M5 — Release candidate | Content lock, accessibility pass, privacy copy, teacher smoke test |

---

## 17. Non-goals for v1

- Live PvP, clans, or public internet leaderboards.
- AI-generated word lists or open chat with a character.
- Full number row, numpad, or shortcut-key training.
- Non-QWERTY layouts (AZERTY, Dvorak, Colemak) as first-class teachers.
- Parent cloud dashboard or school roster sync.
- Mobile phone as the primary device.
- In-app purchases or ad-supported unlocks.
- Photo avatars or drawing tools.

---

## 18. Open questions

1. Should Level 1 include the semicolon key in words, or only teach it in the map and avoid it in early tiles?
2. Is a left-handed visual flip needed, or is standard QWERTY mapping enough with larger labels?
3. Do classrooms need a teacher kiosk PIN that locks Customize during a lesson?
4. Target languages after English — Spanish first, or keep English-only through v1.1?
5. Is Web Speech API reliable enough on managed Chromebooks to ship letter-name audio on by default for ages 6–8?

---

## 19. Risks

| Risk | Mitigation |
| --- | --- |
| Kids still look down at keys | On-screen keyboard + named finger + score bonus badge for Eyes Up; never punish looking down verbally |
| Frustration on speed ramps | Retry any level; practice modes; fall time tuned in playtests with 7- and 10-year-olds |
| Chromebook keyboard variance | QA on at least 2 ChromeOS form factors; avoid depending on key-repeat timing |
| Word readability on busy scenes | Mandatory tile plate; contrast QA checklist per scene |
| Shared-device profile mix-ups | Large avatar on Home; confirm switch; max 6 profiles |
| Accessibility gaps | High contrast, reduced motion, no color-only hints, large hit-free text |

---

## 20. Launch checklist (product)

- Final word lists reviewed by an elementary educator.
- Privacy notice written for adults; no dark patterns.
- Tutorial timed: target 4–7 minutes for a 7-year-old with light adult help.
- Chromebook lab pass: 10 consecutive Level 2 runs without input loss.
- Screen-reader: Landing, profile, and Settings reachable; playfield is visual and not required to be fully SR-played in v1, but pause and quit must be.
- Legal: music/SFX licenses, font licenses, character art ownership.

---

## 21. Appendix A — Suggested word seeds

Illustrative only. Final lists live in a data file, not hardcoded in this PRD.

### Level 1 (home-row flavored)

`as`, `a`, `sad`, `dad`, `add`, `lad`, `fall`, `all`, `flask` (if F taught), `ask`, `salad` (split if too long — prefer `sad`, `lass`, `all`). Prefer 2–3 letters until the player has 3-starred Level 1.

### Level 2–3 samples

`cat`, `dog`, `sun`, `run`, `hop`, `sit`, `red`, `blue`, `jump`, `play`, `come`, `look`, `said`, `they`, `where`, `friend` (level 3 end).

### Banned in v1 lists

Proper names of living public figures, slang insults, brand names, weapon words, anatomical words, anything above grade-appropriate reading.

---

## 22. Appendix B — Finger color tokens

Use these design tokens so tutorial and in-game overlays match. Always pair with a text label.

| Token | Finger | Hex (example) |
| --- | --- | --- |
| `finger.lpinky` | Left pinky | `#E85D4C` |
| `finger.lring` | Left ring | `#F2A03D` |
| `finger.lmiddle` | Left middle | `#E7C445` |
| `finger.lindex` | Left index | `#3CB371` |
| `finger.thumbs` | Thumbs | `#6B7C8A` |
| `finger.rindex` | Right index | `#3D9CF2` |
| `finger.rmiddle` | Right middle | `#6C7CFF` |
| `finger.rring` | Right ring | `#9B6BDB` |
| `finger.rpinky` | Right pinky | `#D65CA9` |

---

**Document end.** TypeDrop v1 is successful if a child can finish the tutorial, play a falling-word level with both hands on the home row, beat their own score, and change how they look in the world — all inside Chrome, without an account and without looking at the keys as their main strategy. Questions on this spec should be resolved in product review before M1 leaves the branch.
