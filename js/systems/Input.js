export class Input {
	constructor() {
		this.keys = {
			up: false,
			down: false,
			left: false,
			right: false,
		};

		// Track the frame in which a key was first pressed to prevent continuous rapid firing
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
	}

	handleKeyDown(e) {
		// Only mark justPressed true if it wasn't already held down
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

	// This must be called at the end of every frame to reset justPressed triggers
	reset() {
		this.justPressed.up = false;
		this.justPressed.down = false;
		this.justPressed.left = false;
		this.justPressed.right = false;
	}
}
