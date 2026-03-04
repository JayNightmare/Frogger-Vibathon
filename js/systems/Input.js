export class Input {
	constructor() {
		this.keys = {
			up: false,
			down: false,
			left: false,
			right: false,
		};

		this.justPressed = {
			up: false,
			down: false,
			left: false,
			right: false,
		};

		window.addEventListener("keydown", (e) =>
			this.handleKeyDown(e),
		);
		window.addEventListener("keyup", (e) => this.handleKeyUp(e));

		this._initTouch();
		this._initDpad();
	}

	handleKeyDown(e) {
		if (
			(e.key === "ArrowUp" ||
				e.key === "w" ||
				e.key === "W") &&
			!this.keys.up
		) {
			this.keys.up = true;
			this.justPressed.up = true;
		}
		if (
			(e.key === "ArrowDown" ||
				e.key === "s" ||
				e.key === "S") &&
			!this.keys.down
		) {
			this.keys.down = true;
			this.justPressed.down = true;
		}
		if (
			(e.key === "ArrowLeft" ||
				e.key === "a" ||
				e.key === "A") &&
			!this.keys.left
		) {
			this.keys.left = true;
			this.justPressed.left = true;
		}
		if (
			(e.key === "ArrowRight" ||
				e.key === "d" ||
				e.key === "D") &&
			!this.keys.right
		) {
			this.keys.right = true;
			this.justPressed.right = true;
		}
	}

	handleKeyUp(e) {
		if (e.key === "ArrowUp" || e.key === "w" || e.key === "W")
			this.keys.up = false;
		if (e.key === "ArrowDown" || e.key === "s" || e.key === "S")
			this.keys.down = false;
		if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A")
			this.keys.left = false;
		if (e.key === "ArrowRight" || e.key === "d" || e.key === "D")
			this.keys.right = false;
	}

	reset() {
		this.justPressed.up = false;
		this.justPressed.down = false;
		this.justPressed.left = false;
		this.justPressed.right = false;
	}

	/**
	 * Fires a single directional press programmatically.
	 * Used by both swipe detection and D-pad buttons.
	 */
	fireDirection(dir) {
		if (["up", "down", "left", "right"].includes(dir)) {
			this.justPressed[dir] = true;
		}
	}

	/** Swipe detection on the game canvas. */
	_initTouch() {
		let startX = 0;
		let startY = 0;
		const SWIPE_THRESHOLD = 30;

		const canvas = document.getElementById("gameCanvas");
		if (!canvas) return;

		canvas.addEventListener(
			"touchstart",
			(e) => {
				const touch = e.touches[0];
				startX = touch.clientX;
				startY = touch.clientY;
			},
			{ passive: true },
		);

		canvas.addEventListener(
			"touchend",
			(e) => {
				const touch = e.changedTouches[0];
				const dx = touch.clientX - startX;
				const dy = touch.clientY - startY;

				if (
					Math.abs(dx) < SWIPE_THRESHOLD &&
					Math.abs(dy) < SWIPE_THRESHOLD
				) {
					return;
				}

				if (Math.abs(dx) > Math.abs(dy)) {
					this.fireDirection(
						dx > 0 ? "right" : "left",
					);
				} else {
					this.fireDirection(
						dy > 0 ? "down" : "up",
					);
				}
			},
			{ passive: true },
		);
	}

	/** On-screen D-pad button support. */
	_initDpad() {
		const dpad = document.getElementById("mobile-dpad");
		if (!dpad) return;

		dpad.querySelectorAll(".dpad-btn").forEach((btn) => {
			const dir = btn.dataset.dir;

			btn.addEventListener(
				"touchstart",
				(e) => {
					e.preventDefault();
					btn.classList.add("pressed");
					this.fireDirection(dir);
				},
				{ passive: false },
			);

			btn.addEventListener(
				"touchend",
				(e) => {
					e.preventDefault();
					btn.classList.remove("pressed");
				},
				{ passive: false },
			);
		});
	}
}
