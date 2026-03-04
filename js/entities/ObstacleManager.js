import { TILE_SIZE, CANVAS_WIDTH, COLORS } from "../constants.js";

const CAR_COLORS = [
	COLORS.CAR_RED,
	COLORS.CAR_BLUE,
	COLORS.CAR_YELLOW,
	"#ff6600",
	"#cc00ff",
	"#00ff88",
];

class Obstacle {
	constructor(x, y, width, height, speed, color) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.speed = speed;
		this.color = color || null;
		this.stompTimer = 0;
	}

	update(dt, speedMultiplier, isHorrorMode, effects) {
		this.x += this.speed * speedMultiplier * dt;

		if (this.speed > 0 && this.x > CANVAS_WIDTH) {
			this.x = -this.width;
		} else if (this.speed < 0 && this.x < -this.width) {
			this.x = CANVAS_WIDTH;
		}

		// In horror mode, cars become stomping feet leaving bloody prints
		if (isHorrorMode && effects && this.color) {
			this.stompTimer -= dt;
			if (this.stompTimer <= 0) {
				effects.addFootprint(
					this.x + this.width / 2 - 4,
					this.y + this.height / 2 - 4,
				);
				this.stompTimer = 0.3; // Stomp every 300ms
			}
		}
	}
}

export class ObstacleManager {
	constructor(difficulty = "EASY") {
		this.cars = [];
		this.logs = [];
		this.speedMultiplier = 1;
		this.initLanes(difficulty);
	}

	initLanes(difficulty) {
		this.cars = [];
		this.logs = [];

		const roadConfigs = [
			{ row: 13, speed: -60, size: 1.5, space: 200 },
			{ row: 12, speed: 70, size: 1, space: 150 },
			{ row: 11, speed: -80, size: 1.5, space: 220 },
			{ row: 10, speed: 120, size: 1, space: 250 },
			{ row: 9, speed: -60, size: 2, space: 300 },
			{ row: 8, speed: 90, size: 1, space: 160 },
		];

		const waterConfigs = [
			{ row: 6, speed: -60, size: 3, space: 250 },
			{ row: 5, speed: 80, size: 4, space: 300 },
			{ row: 4, speed: -100, size: 2, space: 200 },
			{ row: 3, speed: 60, size: 3, space: 220 },
			{ row: 2, speed: -90, size: 2, space: 180 },
			{ row: 1, speed: 110, size: 4, space: 350 },
		];

		// Determine spawn densities based on difficulty
		let minCars = 1,
			maxCars = 2;
		let minLogs = 2,
			maxLogs = 3;

		if (difficulty === "MEDIUM") {
			minCars = 2;
			maxCars = 3;
			minLogs = 2;
			maxLogs = 3;
		} else if (difficulty === "HARD" || difficulty === "EXPERT") {
			minCars = 4;
			maxCars = 4;
			minLogs = 1;
			maxLogs = 2;
		}

		roadConfigs.forEach((cfg, laneIndex) => {
			const y = cfg.row * TILE_SIZE;
			const w = cfg.size * TILE_SIZE;
			const color = CAR_COLORS[laneIndex % CAR_COLORS.length];
			let startX = 0;
			// Randomize car count for this lane within the density bounds
			const carCount =
				Math.floor(
					Math.random() * (maxCars - minCars + 1),
				) + minCars;

			for (let i = 0; i < carCount; i++) {
				this.cars.push(
					new Obstacle(
						startX,
						y,
						w,
						TILE_SIZE,
						cfg.speed,
						color,
					),
				);
				startX += w + cfg.space;
			}
		});

		waterConfigs.forEach((cfg) => {
			const y = cfg.row * TILE_SIZE;
			const w = cfg.size * TILE_SIZE;
			let startX = 0;
			// Randomize log count for this lane within the density bounds
			const logCount =
				Math.floor(
					Math.random() * (maxLogs - minLogs + 1),
				) + minLogs;

			for (let i = 0; i < logCount; i++) {
				this.logs.push(
					new Obstacle(
						startX,
						y,
						w,
						TILE_SIZE,
						cfg.speed,
					),
				);
				// To keep logs from bunching too much when there are fewer, increase gap slightly
				startX += w + cfg.space + (4 - logCount) * 50;
			}
		});
	}

	calculateDifficulty(score) {
		let mult = 1.0;
		if (score > 50 && score <= 100) mult = 1.2;
		else if (score > 100 && score <= 500) mult = 1.5;
		else if (score > 500) {
			const increments = Math.floor((score - 500) / 10);
			mult = 1.5 * Math.pow(1.15, increments);
		}
		this.speedMultiplier = mult;
	}

	update(dt, score, isHorrorMode, effects) {
		this.calculateDifficulty(score);
		this.cars.forEach((car) =>
			car.update(
				dt,
				this.speedMultiplier,
				isHorrorMode,
				effects,
			),
		);
		this.logs.forEach((log) =>
			log.update(dt, this.speedMultiplier, false, null),
		);
	}
}
