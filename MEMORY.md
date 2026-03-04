# Project Memory

## Identity & Role
Principal Software Engineer acting as a pair programmer.

## Project State
**Theme**: Retro Arcade (Vibathon)
**Game**: Frogger
**Tech Stack**: Vanilla JS, HTML, CSS (No frameworks, DBs, or backend). SPA only.
**Current Phase**: Horror Bonus Features Complete.

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

### Next Steps (Next Feature)
- None. The Vibathon submission is fully loaded with extra surprises.

## Architectural Decisions
- Componentized architecture using ES6 Modules (no bundlers necessary).
- Centralized Game Loop mapped to `requestAnimationFrame` with safety clamped `dt` boundaries.
- Procedural audio using `AudioContext` and oscillators for 8-bit sound without external assets.
- Temporary visual elements isolated strictly to the new `EffectManager.js`.
- LocalStorage caching applied to leaderboard persistence.
