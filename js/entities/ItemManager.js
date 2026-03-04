import { TILE_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from "../constants.js";

class GoldenFly {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.width = TILE_SIZE;
		this.height = TILE_SIZE;
		this.type = "GOLDEN_FLY";
		this.lifetime = 10; // seconds before despawn
	}

	update(dt) {
		this.lifetime -= dt;
	}
}

export class ItemManager {
	constructor() {
		this.items = [];
		this.spawnTimer = 0;
		this.spawnInterval = 10; // Try spawning every 10 secs
	}

	update(dt) {
		// Despawn flies that ran out of time
		this.items = this.items.filter((item) => item.lifetime > 0);
		this.items.forEach((item) => item.update(dt));

		this.spawnTimer += dt;
		if (this.spawnTimer >= this.spawnInterval) {
			this.spawnTimer = 0;
			this.trySpawnFly();
		}
	}

	trySpawnFly() {
		// Only one at a time for rarity
		if (this.items.length > 0) return;

		// Spawn either on median (row 7) or some log row (we'll just pick randomly amongst safe or water zones)
		// Since water is dangerous without logs, let's keep it simpler for player:
		// Spawns randomly in the median or the top goal area

		const isGoalArea = Math.random() > 0.5;
		const row = isGoalArea ? 0 : 7;
		const col = Math.floor(
			Math.random() * (CANVAS_WIDTH / TILE_SIZE),
		);

		this.items.push(
			new GoldenFly(col * TILE_SIZE, row * TILE_SIZE),
		);
	}
}
