# 🟢 Low Impact Improvements

---

## 1. Restart Handler Listener Leak

**Category:** Bug  
**Effort:** Low  
**File:** `Game.js` (lines 239–253)

In `gameOver()`, a new `restartHandler` is added to `window` on every death. If the player dies repeatedly without pressing Space (e.g. during Skyrim sequence), stale handlers accumulate.

### Approach
- Store the handler reference on `this._restartHandler`.
- Remove any existing handler before adding a new one.

---

## 2. Smooth Difficulty Transitions

**Category:** UX  
**Effort:** Medium  
**File:** `ObstacleManager.js` (lines 54–143)

When difficulty changes, `initLanes()` destroys and recreates all cars/logs, causing a visible "pop" where obstacles vanish and reappear. This breaks immersion.

### Approach
- On difficulty change, only update `speedMultiplier` and gradually spawn/remove obstacles.
- Or: keep existing obstacles and only modify speed and spawn rates for new ones.

---

## 3. Tutorial / First-Play Hints

**Category:** UX  
**Effort:** Medium  
**Files:** `index.html`, `Game.js`, `style.css`

The start screen mentions controls but doesn't explain water/log mechanics. New players may not realize they need to land on logs to cross water.

### Approach
- Show a brief overlay during the first 2 hops: "STAY ON LOGS TO CROSS WATER!".
- Track `firstPlay` via `localStorage` to only show once.
