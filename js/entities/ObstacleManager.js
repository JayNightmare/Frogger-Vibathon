import { TILE_SIZE, CANVAS_WIDTH, COLORS } from "../constants.js";

const CAR_COLORS = [
	COLORS.CAR_RED,
	COLORS.CAR_BLUE,
	COLORS.CAR_YELLOW,
	"#ff6600",
	"#cc00ff",
	"#00ff88",
];

const ROAD_CONFIGS = [
	{ row: 13, speed: -60, size: 1.5, space: 200 },
	{ row: 12, speed: 70, size: 1, space: 150 },
	{ row: 11, speed: -80, size: 1.5, space: 220 },
	{ row: 10, speed: 120, size: 1, space: 250 },
	{ row: 9, speed: -60, size: 2, space: 300 },
	{ row: 8, speed: 90, size: 1, space: 160 },
];

const WATER_CONFIGS = [
	{ row: 6, speed: -60, size: 3, space: 250 },
	{ row: 5, speed: 80, size: 4, space: 300 },
	{ row: 4, speed: -100, size: 2, space: 200 },
	{ row: 3, speed: 60, size: 3, space: 220 },
	{ row: 2, speed: -90, size: 2, space: 180 },
	{ row: 1, speed: 110, size: 4, space: 350 },
];

const DENSITY = {
	EASY: { minCars: 1, maxCars: 2, minLogs: 2, maxLogs: 3 },
	MEDIUM: { minCars: 2, maxCars: 3, minLogs: 2, maxLogs: 3 },
	HARD: { minCars: 4, maxCars: 4, minLogs: 1, maxLogs: 2 },
	EXPERT: { minCars: 4, maxCars: 4, minLogs: 1, maxLogs: 2 },
};

class Obstacle {
	constructor(x, y, width, height, speed, color) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.speed = speed;
		this.color = color || null;
		this.stompTimer = 0;
		this.laneRow = y / TILE_SIZE;
	}

	update(dt, speedMultiplier, isHorrorMode, effects) {
		this.x += this.speed * speedMultiplier * dt;

		if (this.speed > 0 && this.x > CANVAS_WIDTH) {
			this.x = -this.width;
		} else if (this.speed < 0 && this.x < -this.width) {
			this.x = CANVAS_WIDTH;
		}

		if (isHorrorMode && effects && this.color) {
			this.stompTimer -= dt;
			if (this.stompTimer <= 0) {
				effects.addFootprint(
					this.x + this.width / 2 - 4,
					this.y + this.height / 2 - 4,
				);
				this.stompTimer = 0.3;
			}
		}
	}
}

export class ObstacleManager {
	constructor(difficulty = "EASY") {
		this.cars = [];
		this.logs = [];
		this.speedMultiplier = 1;
		this.currentDifficulty = difficulty;

		// Track per-lane target densities for gradual transitions
		this.targetCarCounts = new Map();
		this.targetLogCounts = new Map();
		this.initLanes(difficulty);
	}

	/**
	 * Only called once at game start. Populates initial obstacles.
	 */
	initLanes(difficulty) {
		this.cars = [];
		this.logs = [];
		this.currentDifficulty = difficulty;
		const { minCars, maxCars, minLogs, maxLogs } =
			DENSITY[difficulty];

		ROAD_CONFIGS.forEach((cfg, laneIndex) => {
			const y = cfg.row * TILE_SIZE;
			const w = cfg.size * TILE_SIZE;
			const color = CAR_COLORS[laneIndex % CAR_COLORS.length];
			let startX = 0;
			const carCount =
				Math.floor(
					Math.random() * (maxCars - minCars + 1),
				) + minCars;

			this.targetCarCounts.set(cfg.row, carCount);

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

		WATER_CONFIGS.forEach((cfg) => {
			const y = cfg.row * TILE_SIZE;
			const w = cfg.size * TILE_SIZE;
			let startX = 0;
			const logCount =
				Math.floor(
					Math.random() * (maxLogs - minLogs + 1),
				) + minLogs;

			this.targetLogCounts.set(cfg.row, logCount);

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
				startX += w + cfg.space + (4 - logCount) * 50;
			}
		});
	}

	/**
	 * Called on difficulty change. Updates target densities
	 * but does NOT destroy existing obstacles. Adjustments
	 * happen gradually in update() as obstacles wrap off-screen.
	 */
	transitionTo(difficulty) {
		if (difficulty === this.currentDifficulty) return;
		this.currentDifficulty = difficulty;
		const { minCars, maxCars, minLogs, maxLogs } =
			DENSITY[difficulty];

		ROAD_CONFIGS.forEach((cfg) => {
			const target =
				Math.floor(
					Math.random() * (maxCars - minCars + 1),
				) + minCars;
			this.targetCarCounts.set(cfg.row, target);
		});

		WATER_CONFIGS.forEach((cfg) => {
			const target =
				Math.floor(
					Math.random() * (maxLogs - minLogs + 1),
				) + minLogs;
			this.targetLogCounts.set(cfg.row, target);
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

	/**
	 * Counts how many obstacles in an array belong to a given lane row.
	 */
	_countInLane(arr, row) {
		return arr.filter((o) => o.laneRow === row).length;
	}

	/**
	 * Gradually adjusts obstacle counts towards targets.
	 * - Cars: spawns off-screen when count is below target;
	 *         marks for removal when count is above target and obstacle wraps.
	 * - Logs: same approach but only removes excess, never drops below 1
	 *         to prevent impossible lanes.
	 */
	_adjustDensity() {
		// Adjust cars
		ROAD_CONFIGS.forEach((cfg, laneIndex) => {
			const row = cfg.row;
			const current = this._countInLane(this.cars, row);
			const target = this.targetCarCounts.get(row) ?? current;

			if (current < target) {
				const w = cfg.size * TILE_SIZE;
				const color =
					CAR_COLORS[
						laneIndex % CAR_COLORS.length
					];
				// Spawn off-screen on the incoming side
				const spawnX =
					cfg.speed > 0
						? -w - 20
						: CANVAS_WIDTH + 20;
				this.cars.push(
					new Obstacle(
						spawnX,
						row * TILE_SIZE,
						w,
						TILE_SIZE,
						cfg.speed,
						color,
					),
				);
			} else if (current > target) {
				// Remove the first obstacle in this lane that has wrapped off-screen
				for (let i = 0; i < this.cars.length; i++) {
					const c = this.cars[i];
					if (c.laneRow !== row) continue;
					const offScreen =
						(c.speed > 0 &&
							c.x <= -c.width) ||
						(c.speed < 0 &&
							c.x >= CANVAS_WIDTH);
					if (offScreen) {
						this.cars.splice(i, 1);
						break;
					}
				}
			}
		});

		// Adjust logs
		WATER_CONFIGS.forEach((cfg) => {
			const row = cfg.row;
			const current = this._countInLane(this.logs, row);
			const target = this.targetLogCounts.get(row) ?? current;

			if (current < target) {
				const w = cfg.size * TILE_SIZE;
				const spawnX =
					cfg.speed > 0
						? -w - 20
						: CANVAS_WIDTH + 20;
				this.logs.push(
					new Obstacle(
						spawnX,
						row * TILE_SIZE,
						w,
						TILE_SIZE,
						cfg.speed,
					),
				);
			} else if (current > target && current > 1) {
				// Only remove if at least 1 log remains to keep lane traversable
				for (let i = 0; i < this.logs.length; i++) {
					const l = this.logs[i];
					if (l.laneRow !== row) continue;
					const offScreen =
						(l.speed > 0 &&
							l.x <= -l.width) ||
						(l.speed < 0 &&
							l.x >= CANVAS_WIDTH);
					if (offScreen) {
						this.logs.splice(i, 1);
						break;
					}
				}
			}
		});
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

		// Gradually adjust lane density towards targets
		this._adjustDensity();
	}
}
