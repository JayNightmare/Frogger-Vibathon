# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Initial project documentation (`MEMORY.md`, `CHANGELOG.md`).
- Project initialized for Vibathon.
- Retro Arcade Frogger Engine (Canvas, HTML, CSS).
- Game Entities (Frog, ObstacleManager, ItemManager).
- Retro CSS Styles with CRT scanlines overlay.
- `SoundManager.js` — procedural 8-bit SFX via Web Audio API.
- `Leaderboard.js` — top-5 arcade-style leaderboard with 3-char initials.
- `utils.js` — shared `intersect()` utility.
- Lives system (3 lives per game, 🐸 HUD icons).
- Difficulty HUD indicator (EASY/MEDIUM/HARD/EXPERT with color badges).
- Death animation (red flash, particle burst, screen shake).
- Detailed car sprites (roofs, windshields, headlights, taillights, per-lane colors).
- Wood-grain logs with end caps.
- Animated water shimmer, dashed road lane lines, goal zone lilypads.
- Golden Fly glow halo, flutter wings, countdown ring.
- Neon title glow animation, arcade cabinet CSS styling.

### Added (Bonus)
- **Horror Mode Trigger**: 20% chance to toggle upon reaching the goal zone.
- `EffectManager.js`: Handles transient visual elements (specifically, exact 450ms footprint lifespans and steam).
- Added visceral procedural sounds: `stomp`, `squelch`, `bloodSplash`, `horrorTransition`.
- Visual transformations: Water replaced by dark bubbling blood, safe roads replaced by metal grating and steam, cars replaced by bobbing oversized shoes.
- Ghost mechanism remembers player death coordinates within the session and flickers low-opacity "dead frogs" statically on the grid.

### Fixed
- First-frame `dt` spike causing obstacle teleportation.
- `innerHTML +=` DOM mutation bug in `gameOver()`.
- Dead mock-entity guard checks in `draw()`.
- `deadFrogs` array growing unbounded — now capped at 10 entries and reset on restart.
- `restartHandler` listener accumulating on repeated deaths.

### Added (Phase 9 — High-Impact Improvements)
- **Pause**: Escape/P key toggles pause overlay; freezes game loop and audio.
- **Responsive Scaling**: Game container scales to fit viewport via CSS custom property and JS resize listener.
- **Mobile Touch Controls**: Swipe detection on canvas, on-screen D-pad (auto-hidden on desktop via `@media` query), tap-to-start.
- Updated start screen text to mention mobile controls.

### Fixed (Phase 10)
- Horror BG music no longer persists after game over, win, or restart.
- `isHorrorMode` flag properly reset on game over.

### Added (Phase 10 — Win State)
- **Win condition**: Landing 7 frogs at the goal triggers a "YOU WIN!" overlay with a 50-point completion bonus.
- Golden pulsing win screen with score display, leaderboard entry, and Space-to-replay.

### Fixed (Phase 11 — Smooth Difficulty Transitions)
- Difficulty changes no longer destroy/recreate all obstacles instantly.
- `ObstacleManager` now uses `transitionTo()` which sets per-lane target densities and `_adjustDensity()` which spawns new obstacles off-screen and removes excess only when they naturally wrap around — no more random instant deaths on difficulty change.

### Added (Phase 12 — Settings Page)
- **Settings overlay**: Gear icon in HUD opens settings page (pauses game while open).
- **Volume slider**: Custom arcade-themed range input controlling master volume (0–100%).
- Volume persisted in `localStorage` and loaded on init.
- `SoundManager.setVolume()` scales both SFX gain and BG music proportionally.
