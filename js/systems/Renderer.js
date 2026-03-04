import {
	TILE_SIZE,
	CANVAS_WIDTH,
	CANVAS_HEIGHT,
	COLORS,
} from "../constants.js";

export class Renderer {
	constructor(ctx) {
		this.ctx = ctx;
		this.waterPhase = 0;
	}

	clear(isHorrorMode = false) {
		this.ctx.fillStyle = isHorrorMode ? "#111" : COLORS.ROAD;
		this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	}

	drawBackground(isHorrorMode = false, deadFrogs = []) {
		// Safe starting zone (bottom row, row 15)
		this.ctx.fillStyle = isHorrorMode ? "#1a0f0f" : COLORS.SAFE;
		this.ctx.fillRect(
			0,
			CANVAS_HEIGHT - TILE_SIZE,
			CANVAS_WIDTH,
			TILE_SIZE,
		);

		// Median safe zone (Row 7)
		this.ctx.fillStyle = isHorrorMode ? "#1a0f0f" : COLORS.SAFE;
		this.ctx.fillRect(0, 7 * TILE_SIZE, CANVAS_WIDTH, TILE_SIZE);

		// Water zone (Rows 1 to 6) becomes Blood River
		this.ctx.fillStyle = isHorrorMode ? "#660000" : COLORS.WATER;
		this.ctx.fillRect(0, TILE_SIZE, CANVAS_WIDTH, 6 * TILE_SIZE);

		// Water shimmer / Blood bubbling
		this.waterPhase += isHorrorMode ? 0.05 : 0.02;
		this.ctx.fillStyle = isHorrorMode
			? "rgba(255, 50, 50, 0.15)"
			: "rgba(100, 180, 255, 0.08)";
		for (let row = 1; row <= 6; row++) {
			for (let col = 0; col < 14; col++) {
				const shimmer =
					Math.sin(
						this.waterPhase +
							col * 0.8 +
							row * 1.5,
					) *
						0.5 +
					0.5;
				if (shimmer > 0.6) {
					this.ctx.fillRect(
						col * TILE_SIZE +
							(isHorrorMode
								? Math.random() *
									8
								: 4),
						row * TILE_SIZE +
							(isHorrorMode
								? Math.random() *
									16
								: 12),
						TILE_SIZE - 8,
						isHorrorMode ? 8 : 4,
					);
				}
			}
		}

		// Goal zone (Row 0)
		this.ctx.fillStyle = isHorrorMode ? "#1a0f0f" : COLORS.SAFE;
		this.ctx.fillRect(0, 0, CANVAS_WIDTH, TILE_SIZE);

		// Road lane dashed lines or Vent grates
		if (isHorrorMode) {
			this.ctx.strokeStyle = "#333";
			this.ctx.lineWidth = 1;
			for (let row = 8; row <= 13; row++) {
				for (let lx = 0; lx < CANVAS_WIDTH; lx += 20) {
					this.ctx.beginPath();
					this.ctx.moveTo(lx, row * TILE_SIZE);
					this.ctx.lineTo(
						lx + 10,
						row * TILE_SIZE + TILE_SIZE,
					);
					this.ctx.stroke();
				}
			}
		} else {
			this.ctx.strokeStyle = "#555";
			this.ctx.lineWidth = 2;
			this.ctx.setLineDash([12, 8]);
			for (let row = 8; row <= 13; row++) {
				this.ctx.beginPath();
				this.ctx.moveTo(0, row * TILE_SIZE);
				this.ctx.lineTo(CANVAS_WIDTH, row * TILE_SIZE);
				this.ctx.stroke();
			}
			this.ctx.setLineDash([]);
		}

		// Dead Frogs History (Ghost Frogs)
		const now = Date.now();
		deadFrogs.forEach((ghost) => {
			const opacity =
				Math.abs(
					Math.sin((now - ghost.timestamp) / 500),
				) * 0.4;
			if (opacity < 0.05) return; // optimization
			this.ctx.globalAlpha = opacity;

			const x = ghost.x;
			const y = ghost.y;
			const s = TILE_SIZE;

			// Ghostly body
			this.ctx.fillStyle = COLORS.FROG;
			this.ctx.fillRect(x + 4, y + 4, s - 8, s - 8);

			// Darker belly
			this.ctx.fillStyle = "#00cc00";
			this.ctx.fillRect(x + 10, y + 14, s - 20, s - 22);

			// Legs
			this.ctx.fillStyle = COLORS.FROG;
			this.ctx.fillRect(x, y + s - 10, 6, 8);
			this.ctx.fillRect(x + s - 6, y + s - 10, 6, 8);
			this.ctx.fillRect(x + 2, y + 12, 4, 6);
			this.ctx.fillRect(x + s - 6, y + 12, 4, 6);

			// Eyes
			this.ctx.fillStyle = isHorrorMode ? "#ff0000" : "#fff";
			this.ctx.fillRect(x + 4, y + 2, 10, 10);
			this.ctx.fillRect(x + s - 14, y + 2, 10, 10);

			if (!isHorrorMode) {
				// X for eyes (normal dead frog)
				this.ctx.fillStyle = "#000";
				// Left eye
				this.ctx.fillRect(x + 6, y + 4, 2, 2);
				this.ctx.fillRect(x + 10, y + 4, 2, 2);
				this.ctx.fillRect(x + 8, y + 6, 2, 2);
				this.ctx.fillRect(x + 6, y + 8, 2, 2);
				this.ctx.fillRect(x + 10, y + 8, 2, 2);
				// Right eye
				this.ctx.fillRect(x + s - 12, y + 4, 2, 2);
				this.ctx.fillRect(x + s - 8, y + 4, 2, 2);
				this.ctx.fillRect(x + s - 10, y + 6, 2, 2);
				this.ctx.fillRect(x + s - 12, y + 8, 2, 2);
				this.ctx.fillRect(x + s - 8, y + 8, 2, 2);
			} else {
				// Horror pupils & details
				this.ctx.fillStyle = "#ffff00";
				this.ctx.fillRect(x + 8, y + 4, 2, 6);
				this.ctx.fillRect(x + s - 10, y + 4, 2, 6);

				this.ctx.fillStyle = "#8b0000"; // blood veins
				this.ctx.fillRect(x + 12, y + 8, 2, 8);
				this.ctx.fillRect(x + 10, y + 12, 4, 2);
				this.ctx.fillRect(x + 24, y + 10, 2, 6);
				this.ctx.fillRect(x + 26, y + 20, 6, 2);
				this.ctx.fillRect(x + 14, y + 24, 2, 8);
				this.ctx.fillRect(x + 18, y + 18, 4, 2);
			}

			this.ctx.globalAlpha = 1.0;
		});
	}

	drawFrog(frog) {
		const x = frog.x;
		const y = frog.y;
		const s = TILE_SIZE;

		// Body
		this.ctx.fillStyle = COLORS.FROG;
		this.ctx.fillRect(x + 4, y + 4, s - 8, s - 8);

		// Darker belly
		this.ctx.fillStyle = "#00cc00";
		this.ctx.fillRect(x + 10, y + 14, s - 20, s - 22);

		// Eyes (bigger, with pupils)
		this.ctx.fillStyle = "#fff";
		this.ctx.fillRect(x + 4, y + 2, 10, 10);
		this.ctx.fillRect(x + s - 14, y + 2, 10, 10);
		this.ctx.fillStyle = "#000";
		this.ctx.fillRect(x + 8, y + 4, 4, 6);
		this.ctx.fillRect(x + s - 12, y + 4, 4, 6);

		// Legs
		this.ctx.fillStyle = COLORS.FROG;
		// Back legs
		this.ctx.fillRect(x, y + s - 10, 6, 8);
		this.ctx.fillRect(x + s - 6, y + s - 10, 6, 8);
		// Front legs
		this.ctx.fillRect(x + 2, y + 12, 4, 6);
		this.ctx.fillRect(x + s - 6, y + 12, 4, 6);
	}

	drawObstacles(obstacleManager, isHorrorMode = false) {
		// Draw logs with wood grain
		obstacleManager.logs.forEach((log) => {
			// Logs are the same across modes for now, just darker maybe
			this.ctx.fillStyle = isHorrorMode
				? "#3a1505"
				: COLORS.LOG;
			this.ctx.fillRect(log.x, log.y, log.width, log.height);

			// Wood grain lines
			this.ctx.strokeStyle = isHorrorMode
				? "#1a0500"
				: "#6b3410";
			this.ctx.lineWidth = 1;
			for (
				let lx = log.x + 10;
				lx < log.x + log.width - 5;
				lx += 16
			) {
				this.ctx.beginPath();
				this.ctx.moveTo(lx, log.y + 8);
				this.ctx.lineTo(lx + 8, log.y + log.height - 8);
				this.ctx.stroke();
			}

			// Log ends
			this.ctx.fillStyle = isHorrorMode
				? "#4a220d"
				: "#a0522d";
			this.ctx.fillRect(log.x, log.y + 4, 4, log.height - 8);
			this.ctx.fillRect(
				log.x + log.width - 4,
				log.y + 4,
				4,
				log.height - 8,
			);
		});

		// Draw cars or stomping shoes
		obstacleManager.cars.forEach((car) => {
			if (isHorrorMode) {
				// Stomping shoe
				const bounce =
					Math.abs(Math.sin(car.x / 40)) * 6; // bobbing uncomfortably

				// Shoe upper
				this.ctx.fillStyle = "#8b4513"; // Brown shoe
				this.ctx.fillRect(
					car.x + 4,
					car.y + 8 - bounce,
					car.width - 8,
					car.height - 12 + bounce,
				);

				// Shoe details (laces/tread)
				this.ctx.fillStyle = "#3e1c04";
				this.ctx.fillRect(
					car.x + 8,
					car.y + 12 - bounce,
					car.width - 16,
					4,
				); // laces
				this.ctx.fillRect(
					car.x + 8,
					car.y + car.height - 8,
					car.width - 16,
					4,
				); // tread base

				// Red bloody sole if moving
				this.ctx.fillStyle = "#aa0000";
				this.ctx.fillRect(
					car.x + 4,
					car.y + car.height - 4,
					car.width - 8,
					4,
				);
			} else {
				// Normal Car
				this.ctx.fillStyle =
					car.color || COLORS.CAR_RED;
				this.ctx.fillRect(
					car.x,
					car.y + 4,
					car.width,
					car.height - 8,
				);

				// Roof
				this.ctx.fillStyle = this.darkenColor(
					car.color || COLORS.CAR_RED,
					0.6,
				);
				const roofInset = car.width * 0.2;
				this.ctx.fillRect(
					car.x + roofInset,
					car.y + 8,
					car.width - roofInset * 2,
					car.height - 16,
				);

				// Windshield
				this.ctx.fillStyle = "#87CEEB";
				if (car.speed > 0) {
					this.ctx.fillRect(
						car.x +
							car.width -
							roofInset -
							4,
						car.y + 10,
						4,
						car.height - 20,
					);
				} else {
					this.ctx.fillRect(
						car.x + roofInset,
						car.y + 10,
						4,
						car.height - 20,
					);
				}

				// Headlights
				this.ctx.fillStyle = "#ffffaa";
				if (car.speed > 0) {
					this.ctx.fillRect(
						car.x + car.width - 3,
						car.y + 6,
						3,
						4,
					);
					this.ctx.fillRect(
						car.x + car.width - 3,
						car.y + car.height - 10,
						3,
						4,
					);
				} else {
					this.ctx.fillRect(
						car.x,
						car.y + 6,
						3,
						4,
					);
					this.ctx.fillRect(
						car.x,
						car.y + car.height - 10,
						3,
						4,
					);
				}

				// Taillights
				this.ctx.fillStyle = "#ff3333";
				if (car.speed > 0) {
					this.ctx.fillRect(
						car.x,
						car.y + 6,
						3,
						4,
					);
					this.ctx.fillRect(
						car.x,
						car.y + car.height - 10,
						3,
						4,
					);
				} else {
					this.ctx.fillRect(
						car.x + car.width - 3,
						car.y + 6,
						3,
						4,
					);
					this.ctx.fillRect(
						car.x + car.width - 3,
						car.y + car.height - 10,
						3,
						4,
					);
				}
			}
		});
	}

	drawGoalFrogs(goalFrogs, isHorrorMode) {
		const s = TILE_SIZE;
		goalFrogs.forEach((gf) => {
			this.ctx.save();

			// If attacking in horror mode, add a jump bounce and shake
			let x = gf.x;
			let y = gf.y;

			if (gf.attacking) {
				const bounce =
					Math.abs(Math.sin(Date.now() / 150)) *
					8;
				const jitterX = (Math.random() - 0.5) * 2;
				x += jitterX;
				y -= bounce;
			}

			// Body
			this.ctx.fillStyle = COLORS.FROG;
			this.ctx.fillRect(x + 4, y + 4, s - 8, s - 8);

			// Darker belly
			this.ctx.fillStyle = "#00cc00";
			this.ctx.fillRect(x + 10, y + 14, s - 20, s - 22);

			// Eyes
			this.ctx.fillStyle = gf.attacking ? "#ff0000" : "#fff";
			this.ctx.fillRect(x + 4, y + 2, 10, 10);
			this.ctx.fillRect(x + s - 14, y + 2, 10, 10);

			// Pupils
			this.ctx.fillStyle = gf.attacking ? "#ffff00" : "#000";
			if (gf.attacking) {
				// Angry slits
				this.ctx.fillRect(x + 8, y + 4, 2, 6);
				this.ctx.fillRect(x + s - 10, y + 4, 2, 6);
			} else {
				this.ctx.fillRect(x + 8, y + 4, 4, 6);
				this.ctx.fillRect(x + s - 12, y + 4, 4, 6);
			}

			// Legs
			this.ctx.fillStyle = COLORS.FROG;
			// Back legs
			this.ctx.fillRect(x, y + s - 10, 6, 8);
			this.ctx.fillRect(x + s - 6, y + s - 10, 6, 8);
			// Front legs
			this.ctx.fillRect(x + 2, y + 12, 4, 6);
			this.ctx.fillRect(x + s - 6, y + 12, 4, 6);

			// Horror Details: Blood veins on the body
			if (gf.attacking) {
				this.ctx.fillStyle = "#8b0000"; // Dark blood red
				this.ctx.fillRect(x + 12, y + 8, 2, 8);
				this.ctx.fillRect(x + 10, y + 12, 4, 2);
				this.ctx.fillRect(x + 24, y + 10, 2, 6);
				this.ctx.fillRect(x + 26, y + 20, 6, 2);
				this.ctx.fillRect(x + 14, y + 24, 2, 8);
				this.ctx.fillRect(x + 18, y + 18, 4, 2);
			}

			this.ctx.restore();
		});
	}

	drawItems(itemManager) {
		itemManager.items.forEach((item) => {
			if (item.type === "GOLDEN_FLY") {
				const t = Date.now() / 150;
				const pulse = Math.sin(t) * 3;

				// Glow halo
				this.ctx.fillStyle = "rgba(255, 215, 0, 0.25)";
				this.ctx.beginPath();
				this.ctx.arc(
					item.x + TILE_SIZE / 2,
					item.y + TILE_SIZE / 2,
					18 + pulse,
					0,
					Math.PI * 2,
				);
				this.ctx.fill();

				// Body
				this.ctx.fillStyle = COLORS.GOLDEN_FLY;
				this.ctx.fillRect(
					item.x + 12 - pulse / 2,
					item.y + 12 - pulse / 2,
					item.width - 24 + pulse,
					item.height - 24 + pulse,
				);

				// Wings with flutter
				this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
				const wingFlutter = Math.sin(t * 5) * 2;
				this.ctx.fillRect(
					item.x + 4,
					item.y + 6 + wingFlutter,
					10,
					8,
				);
				this.ctx.fillRect(
					item.x + item.width - 14,
					item.y + 6 - wingFlutter,
					10,
					8,
				);

				// Countdown ring (shows remaining lifetime)
				if (item.lifetime < 4) {
					this.ctx.strokeStyle =
						item.lifetime < 2
							? "#ff0000"
							: "#ffaa00";
					this.ctx.lineWidth = 2;
					this.ctx.beginPath();
					this.ctx.arc(
						item.x + TILE_SIZE / 2,
						item.y + TILE_SIZE / 2,
						16,
						-Math.PI / 2,
						-Math.PI / 2 +
							(item.lifetime / 10) *
								Math.PI *
								2,
					);
					this.ctx.stroke();
				}
			}
		});
	}

	drawEffects(effectManager) {
		if (!effectManager) return;
		effectManager.effects.forEach((eff) => {
			if (eff.type === "FOOTPRINT") {
				const opacity = Math.max(
					0,
					eff.lifetime / eff.maxLifetime,
				);
				this.ctx.globalAlpha = opacity;
				this.ctx.fillStyle = "#aa0000"; // Deep blood red
				// simple shoe print
				this.ctx.fillRect(eff.x, eff.y, 8, 12);
				this.ctx.fillRect(eff.x + 1, eff.y - 3, 6, 3); // toe
				this.ctx.globalAlpha = 1.0;
			} else if (eff.type === "STEAM") {
				const opacity =
					Math.max(
						0,
						eff.lifetime / eff.maxLifetime,
					) * 0.4;
				this.ctx.globalAlpha = opacity;
				this.ctx.fillStyle = "#ffffff";
				this.ctx.beginPath();
				this.ctx.arc(
					eff.x,
					eff.y,
					eff.radius,
					0,
					Math.PI * 2,
				);
				this.ctx.fill();
				this.ctx.globalAlpha = 1.0;
			}
		});
	}

	drawDeathEffect(frog, progress) {
		// Flash the frog on and off
		if (Math.floor(progress * 10) % 2 === 0) {
			this.ctx.fillStyle = "#ff003c";
			this.ctx.fillRect(
				frog.x,
				frog.y,
				frog.width,
				frog.height,
			);
		}

		// Particle burst
		this.ctx.fillStyle = "#ff003c";
		const cx = frog.x + frog.width / 2;
		const cy = frog.y + frog.height / 2;
		const spread = (1 - progress) * 30;
		for (let i = 0; i < 8; i++) {
			const angle = (i / 8) * Math.PI * 2;
			const px = cx + Math.cos(angle) * spread;
			const py = cy + Math.sin(angle) * spread;
			this.ctx.fillRect(px - 2, py - 2, 4, 4);
		}
	}

	drawInitialState() {
		this.clear();
		this.drawBackground();
		this.ctx.fillStyle = COLORS.FROG;
		this.ctx.fillRect(
			CANVAS_WIDTH / 2 - TILE_SIZE / 2,
			CANVAS_HEIGHT - TILE_SIZE,
			TILE_SIZE,
			TILE_SIZE,
		);
	}

	darkenColor(hex, factor) {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
	}
}
