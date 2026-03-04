# 🟡 Medium Impact Improvements

---

## 1. Score Popup Particles

**Category:** Polish  
**Effort:** Low  
**Files:** `EffectManager.js`, `Renderer.js`, `Game.js`

When earning points (hop forward, golden fly, reaching goal), show floating "+10" text that rises and fades out — standard arcade juice that makes scoring feel rewarding.

### Approach
- Add a `TEXT_POPUP` effect type to `EffectManager`.
- Render it in `Renderer.drawEffects()` as rising, fading text.
- Trigger from `Game.addScore()`.

---

## 2. Extract Shared Frog Drawing (DRY)

**Category:** Code Quality  
**Effort:** Low  
**File:** `Renderer.js` (lines 171–200, 387–451, 103–168)

The frog body/eyes/legs drawing code is copy-pasted across three places:
- `drawFrog()` — the player frog.
- `drawGoalFrogs()` — placed goal frogs.
- `drawBackground()` dead frog loop — ghost frogs.

### Approach
Extract a private `_drawFrogSprite(x, y, options)` method that accepts flags for:
- `isGhost` (opacity + X eyes)
- `isAttacking` (red eyes + blood veins)
- `isHorror` (slit pupils)

---

## 3. Fix Global Leaderboard (`window.leaderboard`)

**Category:** Code Quality  
**Effort:** Low  
**File:** `main.js` (line 32), `Game.js`

The leaderboard is stuck on the global `window` object instead of being injected via constructor. This is a hidden coupling that makes the code harder to test and reason about.

### Approach
- Pass `leaderboard` as a 6th argument to the `Game` constructor.
- Store as `this.leaderboard` and reference it directly in `gameOver()`.
- Remove `window.leaderboard = leaderboard` from `main.js`.

---

## 4. Frog Facing Direction

**Category:** Polish  
**Effort:** Low  
**Files:** `Frog.js`, `Renderer.js`

The frog sprite always faces upward regardless of movement direction. It should rotate based on the last input.

### Approach
- Track `this.facing` (`'up'` | `'down'` | `'left'` | `'right'`) on `Frog`.
- In `Renderer.drawFrog()`, apply `ctx.rotate()` based on facing before drawing.

---

## 5. Combo / Streak System

**Category:** Gameplay  
**Effort:** Low  
**Files:** `Frog.js`, `Game.js`

Reward fast consecutive upward hops with a score multiplier. Display a combo counter in the HUD that decays after a short idle period.

### Approach
- Track `comboCount` and `comboTimer` on `Game`.
- Reset timer on each forward hop, increment combo.
- Multiply scored points by `1 + (combo * 0.25)`.
- Display combo in HUD when active.

---

## 6. Hop Animation (Squash & Stretch)

**Category:** Polish  
**Effort:** Medium  
**Files:** `Frog.js`, `Renderer.js`

The frog teleports tile-to-tile instantly. A quick lerp with squash-stretch would make movement feel alive.

### Approach
- Add `hopProgress`, `hopStartX/Y`, `hopTargetX/Y` to `Frog`.
- Interpolate position over ~80ms.
- Apply scale transforms in `Renderer.drawFrog()` during the hop.

---

## 7. Additional Power-ups

**Category:** Gameplay  
**Effort:** Medium–High  
**Files:** `ItemManager.js`, `Game.js`, `Renderer.js`

Only one collectible (Golden Fly) exists. Adding variety deepens gameplay:
- **Shield** — survive one hit.
- **Slow-Time** — halve obstacle speed for 5s.
- **Extra Life** — rare spawn.

### Approach
- Extend `ItemManager` with new item types.
- Add status effect tracking to `Game`.
- Draw unique sprites per power-up type.
