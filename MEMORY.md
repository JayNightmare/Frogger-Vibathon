# Project Memory

## Identity & Role
Principal Software Engineer acting as a pair programmer.

## Project State
**Theme**: Retro Arcade (Vibathon)
**Game**: Frogger
**Tech Stack**: Vanilla JS, HTML, CSS (No frameworks, DBs, or backend). SPA only.
**Current Phase**: High-Impact Improvements Complete.

## Active Tasks
### Completed
- Initialized core game (HTML/CSS, Entities, Game Loop).
- Tier 1: Fixed dt spike, innerHTML mutation, dead guards, extracted utils.js.
- Tier 2: SoundManager (Web Audio), Renderer polish (death anim, shake, road lanes, water shimmer, detailed cars).
- Tier 3: 3-life system, difficulty HUD, top-5 leaderboard with initials.
- **Phase 8 (Horror Bonus)**:
  - Random 20% chance to trigger Horror Mode on reaching the goal.
  - Blood water with bubbling effect and Vent Grate roads with steam.
  - Cars replaced with animated stomping shoes.
  - `EffectManager` handling exact 450ms bloody footprint lifetimes.
  - Game death history array powering flickering ghost frogs on the road.
  - Added new dissonant and visceral SFX (`squelch`, `stomp`, `bloodSplash`, `horrorTransition`).
- **Phase 9 (High-Impact Improvements)**:
  - Fixed unbounded `deadFrogs` array (capped at 10, reset on restart).
  - Fixed `restartHandler` listener leak in `gameOver()`.
  - Added pause functionality (Escape/P key) with overlay.
  - Added responsive canvas scaling via CSS `--game-scale` custom property.
  - Added mobile/touch support: swipe detection on canvas, on-screen D-pad (auto-hidden on desktop), touch-to-start.
  - Updated start screen instructions for mobile users.
- **Phase 10 (Bug Fix & Win State)**:
  - Fixed horror BG music not stopping on game over / restart.
  - Added WIN state: 7 frogs reaching the goal triggers a golden "YOU WIN!" overlay with 50-point completion bonus, leaderboard entry, and replay.
  - Rewrote `ObstacleManager.js` with gradual density transitions — obstacles now spawn/despawn off-screen instead of teleporting on difficulty change.
- **Phase 12 (Settings Page)**:
  - Added settings page with volume slider (gear icon in HUD, Escape to close).
  - Volume persisted in `localStorage`, applied to both SFX and BG music.

### Next Steps (Next Feature)
- Medium-impact improvements: score popups, DRY frog drawing, combo system, frog direction, hop animation.

## Architectural Decisions
- Componentized architecture using ES6 Modules (no bundlers necessary).
- Centralized Game Loop mapped to `requestAnimationFrame` with safety clamped `dt` boundaries.
- Procedural audio using `AudioContext` and oscillators for 8-bit sound without external assets.
- Temporary visual elements isolated strictly to the new `EffectManager.js`.
- LocalStorage caching applied to leaderboard persistence.
- Responsive scaling via CSS custom property `--game-scale` set by JS on resize.
- Mobile D-pad auto-shown on touch devices via `@media (hover: none) and (pointer: coarse)`.
