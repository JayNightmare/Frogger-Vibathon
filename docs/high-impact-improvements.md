# 🔴 High Impact Improvements

---

## 1. Mobile / Touch Controls

**Category:** Gameplay  
**Effort:** Medium  
**Files:** `Input.js`, `index.html`

The game is keyboard-only — zero mobile/tablet support. Adding swipe detection or an on-screen D-pad would massively expand the playable audience.

### Approach
- Detect `touchstart` / `touchend` events and calculate swipe direction.
- Map swipe vectors to the existing `justPressed` flags in `Input.js`.
- Optional: render semi-transparent directional buttons overlaid on the canvas for non-swipe users.

---

## 2. Fix Unbounded `deadFrogs` Array

**Category:** Bug  
**Effort:** Low  
**File:** `Game.js` (lines 105–114)

Every death pushes to `this.deadFrogs` but entries are **never pruned**. Over extended play sessions this array grows without limit, causing:
- Increasing per-frame iteration cost (ghost rendering + horror chase logic).
- Unbounded memory consumption.

### Approach
- Cap the array at a maximum (e.g. 10 entries).
- Shift the oldest entry when pushing a new one past the cap.

```js
this.deadFrogs.push({ /* ... */ });
if (this.deadFrogs.length > 10) this.deadFrogs.shift();
```

---

## 3. Pause Functionality

**Category:** UX  
**Effort:** Low  
**Files:** `Game.js`, `index.html`, `style.css`

There is no way to pause the game. Players must either die or close the tab. Pressing `Escape` or `P` should toggle a pause overlay and freeze the game loop.

### Approach
- Add a `"PAUSED"` state to the state machine in `Game.js`.
- In the `loop()` method, skip updates when paused.
- Show/hide a "PAUSED" overlay in the DOM.
- Resume on second press of the same key.

---

## 4. Responsive Canvas Scaling

**Category:** UX  
**Effort:** Low  
**Files:** `style.css`, `main.js`

The canvas is hardcoded at 560×640px. On small screens it overflows; on large screens it's tiny. The game should scale to fit the viewport while maintaining aspect ratio.

### Approach
- Use CSS `transform: scale()` on `.canvas-wrapper` based on `window.innerWidth` / `window.innerHeight`.
- Recalculate on `resize` events.
- No game logic changes needed — only visual scaling.
