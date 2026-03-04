import { Input } from "./systems/Input.js";
import { Game } from "./systems/Game.js";
import { Renderer } from "./systems/Renderer.js";
import { SoundManager } from "./systems/SoundManager.js";
import { Leaderboard } from "./systems/Leaderboard.js";
import { EffectManager } from "./systems/EffectManager.js";

document.addEventListener("DOMContentLoaded", () => {
	const canvas = document.getElementById("gameCanvas");
	const ctx = canvas.getContext("2d", { alpha: false });

	const ui = {
		scoreDisplay: document.getElementById("score-display"),
		highScoreDisplay: document.getElementById("high-score-display"),
		startScreen: document.getElementById("start-screen"),
		gameOverScreen: document.getElementById("game-over-screen"),
		finalScore: document.getElementById("final-score"),
		livesDisplay: document.getElementById("lives-display"),
		difficultyDisplay:
			document.getElementById("difficulty-display"),
		leaderboardList: document.getElementById("leaderboard-list"),
		initialsPrompt: document.getElementById("initials-prompt"),
	};

	const input = new Input();
	const renderer = new Renderer(ctx);
	const soundManager = new SoundManager();
	const leaderboard = new Leaderboard(ui);
	const effectManager = new EffectManager();

	// Expose leaderboard globally so Game can access it
	window.leaderboard = leaderboard;

	const game = new Game(input, renderer, ui, soundManager, effectManager);

	renderer.clear();
	renderer.drawInitialState();

	window.addEventListener("keydown", function startGameHandler(e) {
		if (
			[
				"ArrowUp",
				"ArrowDown",
				"ArrowLeft",
				"ArrowRight",
				" ",
				"w",
				"a",
				"s",
				"d",
			].includes(e.key)
		) {
			e.preventDefault();
		}

		if (game.state === "START") {
			soundManager.init();
			game.start();
			window.removeEventListener("keydown", startGameHandler);
		}
	});
});
