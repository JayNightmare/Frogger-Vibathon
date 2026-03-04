/**
 * Manages short-lived visual effects like footprints and steam.
 */
export class EffectManager {
	constructor() {
		this.effects = [];
	}

	addFootprint(x, y) {
		// Footprint lifetime is exactly 450ms (0.45 seconds)
		this.effects.push({
			type: "FOOTPRINT",
			x: x,
			y: y,
			lifetime: 0.45,
			maxLifetime: 0.45,
		});
	}

	addSteam(x, y) {
		// Steam cloud drifting upwards
		this.effects.push({
			type: "STEAM",
			x: x,
			y: y,
			vx: (Math.random() - 0.5) * 20,
			vy: -15 - Math.random() * 20,
			radius: 4 + Math.random() * 6,
			lifetime: 1.0 + Math.random() * 0.5,
			maxLifetime: 1.5,
		});
	}

	update(dt) {
		for (let i = this.effects.length - 1; i >= 0; i--) {
			const effect = this.effects[i];
			effect.lifetime -= dt;

			if (effect.type === "STEAM") {
				effect.x += effect.vx * dt;
				effect.y += effect.vy * dt;
				effect.radius += 5 * dt; // expand while rising
			}

			if (effect.lifetime <= 0) {
				this.effects.splice(i, 1);
			}
		}
	}
}
