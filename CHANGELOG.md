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
