import { Frog } from "../entities/Frog.js";
import { ObstacleManager } from "../entities/ObstacleManager.js";
import { ItemManager } from "../entities/ItemManager.js";
import { TILE_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from "../constants.js";
import { intersect } from "../utils.js";

/**
 * Core game controller. Manages state machine, score, lives,
 * difficulty progression, and orchestrates entity updates.
 */
export class Game {
	constructor(input, renderer, ui, soundManager, effectManager) {
		this.input = input;
		this.renderer = renderer;
		this.ui = ui;
		this.sound = soundManager;
		this.effects = effectManager;

		this.state = "START";
		this.firstFrame = true;
		this.lastTime = 0;

		this.score = 0;
		this.lives = 3;
		this.level = 1;
		this.highScore =
			parseInt(localStorage.getItem("froggerHighScore")) || 0;
		this.ui.highScoreDisplay.textContent = `HI-SCORE: ${this.highScore}`;

		this.frog = null;
		this.obstacleManager = null;
		this.itemManager = null;

		this.deathTimer = 0;
		this.deathDuration = 0.6;
		this.shakeTimer = 0;
		this.shakeDuration = 0.3;
		this.difficulty = "EASY";

		this.isHorrorMode = false;
		this.deadFrogs = [];
		this.skyrimActive = false;

		// Goal zone frogs (obstacles at row 0)
		this.goalFrogs = [];

		// Horror mode timer & explicit triggers
		this.horrorTimer = 0;
		this.horrorDurations = {
			EASY: 3,
			MEDIUM: 10,
			HARD: 20,
			EXPERT: Infinity,
		};
		this.triggeredHorror = {
			EASY: false,
			MEDIUM: false,
			HARD: false,
		};

		this.loop = this.loop.bind(this);
	}

	start() {
		this.state = "PLAYING";
		this.firstFrame = true;
		this.ui.startScreen.classList.remove("active");
		this.ui.startScreen.classList.add("hidden");
		this.ui.gameOverScreen.classList.remove("active");
		this.ui.gameOverScreen.classList.add("hidden");

		this.score = 0;
		this.lives = 3;
		this.level = 1;
		this.deathTimer = 0;
		this.shakeTimer = 0;
		this.updateScoreUI();
		this.updateLivesUI();
		this.updateDifficultyUI();

		this.frog = new Frog();
		this.obstacleManager = new ObstacleManager();
		this.itemManager = new ItemManager();
		this.goalFrogs = [];
		this.isHorrorMode = false;
		this.horrorTimer = 0;
		this.triggeredHorror = {
			EASY: false,
			MEDIUM: false,
			HARD: false,
		};

		this.sound.startBGMusic();
		requestAnimationFrame(this.loop);
	}

	die() {
		this.lives--;
		this.updateLivesUI();
		this.sound.play(this.isHorrorMode ? "squelch" : "death");
		this.deathTimer = this.deathDuration;
		this.shakeTimer = this.shakeDuration;

		// Record death location for horror glimpses
		this.deadFrogs.push({
			x: this.frog.x,
			y: this.frog.y,
			originX: this.frog.x,
			originY: this.frog.y,
			width: TILE_SIZE,
			height: TILE_SIZE,
			attacking: false,
			timestamp: Date.now(),
		});

		// 10% chance: Skyrim easter egg
		if (!this.skyrimActive && Math.random() < 0.1) {
			this.skyrimActive = true;
			this.sound.stopBGMusic();
			this.triggerSkyrim(() => {
				this.skyrimActive = false;
				this.sound.startBGMusic();
				if (this.lives <= 0) {
					this.gameOver();
				} else {
					this.frog.reset();
				}
			});
			return;
		}

		if (this.lives <= 0) {
			setTimeout(
				() => this.gameOver(),
				this.deathDuration * 1000,
			);
		} else {
			setTimeout(() => {
				this.frog.reset();
			}, this.deathDuration * 1000);
		}
	}

	activateHorrorMode(durationKey) {
		if (this.isHorrorMode) return;
		this.isHorrorMode = true;
		this.horrorTimer = this.horrorDurations[durationKey] ?? 10;
		this.sound.stopBGMusic();
		this.sound.startHorrorMusic();
		this.sound.play("horrorTransition");
	}

	triggerSkyrim(onComplete) {
		const overlay = document.getElementById("skyrim-overlay");
		const video = document.getElementById("skyrim-video");
		if (!overlay || !video) {
			onComplete();
			return;
		}

		// Pause the game loop visually
		this.state = "SKYRIM";

		// Fade to black
		overlay.classList.add("active");

		// Start video after fade completes
		setTimeout(() => {
			video.currentTime = 0;
			video.play().catch(() => {
				// If video fails, skip to glitch-back
				this.endSkyrim(overlay, onComplete);
			});

			video.onended = () => {
				this.endSkyrim(overlay, onComplete);
			};
		}, 1500); // Match CSS transition duration
	}

	endSkyrim(overlay, onComplete) {
		const video = document.getElementById("skyrim-video");
		if (video) {
			video.pause();
			video.currentTime = 0;
		}

		// Fade overlay out
		overlay.classList.remove("active");

		// Glitch the game container
		const container = document.getElementById("game-container");
		container.classList.add("glitch-return");

		// Resume game after glitch animation (0.6s * 3 iterations = 1.8s)
		setTimeout(() => {
			container.classList.remove("glitch-return");
			this.state = "PLAYING";
			this.firstFrame = true;
			onComplete();
			requestAnimationFrame(this.loop);
		}, 1800);
	}

	gameOver() {
		this.state = "GAMEOVER";
		this.sound.stopBGMusic();
		this.ui.gameOverScreen.classList.remove("hidden");
		this.ui.gameOverScreen.classList.add("active");
		this.ui.finalScore.textContent = `SCORE: ${this.score}`;

		// Remove any previous high-score text
		const existingHSText =
			this.ui.gameOverScreen.querySelector(".hs-notify");
		if (existingHSText) existingHSText.remove();

		if (this.score > this.highScore) {
			this.highScore = this.score;
			localStorage.setItem(
				"froggerHighScore",
				this.highScore,
			);
			this.ui.highScoreDisplay.textContent = `HI-SCORE: ${this.highScore}`;

			const hsEl = document.createElement("p");
			hsEl.className = "blink text-red mt-2 hs-notify";
			hsEl.textContent = "NEW HI-SCORE!";
			this.ui.gameOverScreen.appendChild(hsEl);
		}

		// Check leaderboard qualification
		if (
			window.leaderboard &&
			window.leaderboard.qualifies(this.score)
		) {
			window.leaderboard.promptInitials(this.score);
		}

		const restartHandler = (e) => {
			if (e.key === " " && this.state === "GAMEOVER") {
				window.removeEventListener(
					"keydown",
					restartHandler,
				);
				const hsNotify =
					this.ui.gameOverScreen.querySelector(
						".hs-notify",
					);
				if (hsNotify) hsNotify.remove();
				this.start();
			}
		};
		window.addEventListener("keydown", restartHandler);
	}

	updateScoreUI() {
		this.ui.scoreDisplay.textContent = `SCORE: ${this.score}`;
	}

	updateLivesUI() {
		if (!this.ui.livesDisplay) return;
		// Render frog emoji icons for lives
		this.ui.livesDisplay.textContent = "🐸".repeat(
			Math.max(0, this.lives),
		);
	}

	updateDifficultyUI() {
		if (!this.ui.difficultyDisplay) return;
		this.ui.difficultyDisplay.textContent = this.difficulty;
		this.ui.difficultyDisplay.className = `difficulty-${this.difficulty.toLowerCase()}`;
	}

	addScore(points) {
		this.score += points;
		this.updateScoreUI();
	}

	loop(timestamp) {
		if (this.state !== "PLAYING") return;

		// Guard against first-frame dt spike
		if (this.firstFrame) {
			this.lastTime = timestamp;
			this.firstFrame = false;
		}

		const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05); // Clamp to 50ms max
		this.lastTime = timestamp;

		this.update(dt);
		this.draw();

		this.input.reset();
		requestAnimationFrame(this.loop);
	}

	update(dt) {
		// Tick down death animation
		if (this.deathTimer > 0) {
			this.deathTimer -= dt;
			this.shakeTimer -= dt;
			return; // Freeze gameplay during death anim
		}

		this.frog.update(this.input, dt);
		this.obstacleManager.update(
			dt,
			this.score,
			this.isHorrorMode,
			this.effects,
		);
		this.itemManager.update(dt);
		this.effects.update(dt);

		// Consume forward-movement score
		const earned = this.frog.consumeScore();
		if (earned > 0) {
			this.addScore(earned);
			this.sound.play("hop");
		}

		// Update difficulty label
		const prevDifficulty = this.difficulty;
		if (this.score <= 50) this.difficulty = "EASY";
		else if (this.score <= 100) this.difficulty = "MEDIUM";
		else if (this.score <= 500) this.difficulty = "HARD";
		else this.difficulty = "EXPERT";

		if (this.difficulty !== prevDifficulty) {
			this.updateDifficultyUI();
			this.sound.play("levelUp");
			this.obstacleManager.initLanes(this.difficulty);
		}

		// Exact Horror Triggers based on score
		if (!this.triggeredHorror.MEDIUM && this.score >= 140) {
			this.triggeredHorror.MEDIUM = true;
			this.activateHorrorMode("MEDIUM");
		}
		if (!this.triggeredHorror.HARD && this.score >= 210) {
			this.triggeredHorror.HARD = true;
			this.activateHorrorMode("HARD");
		}

		// Horror mode timer tick
		if (this.isHorrorMode && this.horrorTimer !== Infinity) {
			this.horrorTimer -= dt;
			if (this.horrorTimer <= 0) {
				this.isHorrorMode = false;
				this.horrorTimer = 0;
				this.sound.stopHorrorMusic();
				this.sound.startBGMusic();
				this.sound.play("goalReached");
			}
		}

		// Update attacking goal and dead frogs in horror mode
		if (this.isHorrorMode) {
			[...this.goalFrogs, ...this.deadFrogs].forEach((gf) => {
				if (!gf.attacking) {
					gf.attacking = true;
					gf.originX = gf.x;
					gf.originY = gf.y;
				}
				// Chase the player
				const dx = this.frog.x - gf.x;
				const dy = this.frog.y - gf.y;
				const dist = Math.sqrt(dx * dx + dy * dy) || 1;
				const speed = gf.timestamp ? 60 : 80; // Dead frogs slightly slower
				gf.x += (dx / dist) * speed * dt;
				gf.y += (dy / dist) * speed * dt;
			});
		} else {
			// Return attacking frogs to their origin slots
			[...this.goalFrogs, ...this.deadFrogs].forEach((gf) => {
				if (gf.attacking) {
					gf.attacking = false;
					gf.x = gf.originX;
					gf.y = gf.originY;
				}
			});
		}

		this.checkCollisions();

		if (this.deathTimer > 0) return;

		// Goal area check (Row 0)
		if (this.frog.y <= 0) {
			// Check if this slot is already occupied
			const slotOccupied = this.goalFrogs.some(
				(gf) =>
					Math.abs(gf.originX - this.frog.x) <
					TILE_SIZE * 0.5,
			);

			if (!slotOccupied) {
				// Place frog as obstacle
				this.goalFrogs.push({
					x: this.frog.x,
					y: 0,
					originX: this.frog.x,
					originY: 0,
					width: TILE_SIZE,
					height: TILE_SIZE,
					attacking: false,
				});
			}

			this.addScore(10);
			this.level++;

			// Exact Horror Trigger for Easy Mode (Level 3 = reached goal 2 times)
			if (!this.triggeredHorror.EASY && this.level === 3) {
				this.triggeredHorror.EASY = true;
				this.activateHorrorMode("EASY");
			} else {
				if (!this.isHorrorMode)
					this.sound.play("goalReached");
			}

			this.frog.reset();
		}
	}

	checkCollisions() {
		const frogHitbox = {
			x: this.frog.x + 6,
			y: this.frog.y + 6,
			width: this.frog.width - 12,
			height: this.frog.height - 12,
		};

		// 1. Cars
		for (const car of this.obstacleManager.cars) {
			if (intersect(frogHitbox, car)) {
				this.die();
				return;
			}
		}

		// 2. Water zone (rows 1-6)
		const isOverWater =
			this.frog.y >= TILE_SIZE &&
			this.frog.y <= 6 * TILE_SIZE;
		this.frog.isOnLog = false;

		if (isOverWater) {
			let onSafeLog = false;
			for (const log of this.obstacleManager.logs) {
				if (intersect(this.frog, log)) {
					onSafeLog = true;
					this.frog.isOnLog = true;
					this.frog.dx =
						log.speed *
						this.obstacleManager
							.speedMultiplier;
					break;
				}
			}
			if (!onSafeLog) {
				this.die();
				return;
			}
		}

		// 3. Golden Fly
		for (let i = this.itemManager.items.length - 1; i >= 0; i--) {
			const item = this.itemManager.items[i];
			if (
				item.type === "GOLDEN_FLY" &&
				intersect(frogHitbox, item)
			) {
				this.addScore(10);
				this.sound.play("pickup");
				this.itemManager.items.splice(i, 1);
			}
		}

		// 4. Goal frogs and Dead frogs (obstacles or attacking)
		for (const gf of this.goalFrogs) {
			if (intersect(frogHitbox, gf)) {
				this.die();
				return;
			}
		}
		if (this.isHorrorMode) {
			for (const df of this.deadFrogs) {
				if (df.attacking && intersect(frogHitbox, df)) {
					this.die();
					return;
				}
			}
		}
	}

	draw() {
		// Screen shake offset
		let shakeX = 0,
			shakeY = 0;
		if (this.shakeTimer > 0) {
			shakeX = (Math.random() - 0.5) * 8;
			shakeY = (Math.random() - 0.5) * 8;
		}

		this.renderer.ctx.save();
		this.renderer.ctx.translate(shakeX, shakeY);

		this.renderer.clear();
		this.renderer.drawBackground(this.isHorrorMode, this.deadFrogs);
		this.renderer.drawEffects(this.effects);
		this.renderer.drawObstacles(
			this.obstacleManager,
			this.isHorrorMode,
		);
		this.renderer.drawGoalFrogs(this.goalFrogs, this.isHorrorMode);
		this.renderer.drawItems(this.itemManager);

		// Death flash effect
		if (this.deathTimer > 0) {
			this.renderer.drawDeathEffect(
				this.frog,
				this.deathTimer / this.deathDuration,
			);
		} else {
			this.renderer.drawFrog(this.frog);
		}

		this.renderer.ctx.restore();
	}
}
