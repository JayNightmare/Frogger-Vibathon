import { Input } from "./systems/Input.js";
import { Game } from "./systems/Game.js";
import { Renderer } from "./systems/Renderer.js";
import { SoundManager } from "./systems/SoundManager.js";
import { Leaderboard } from "./systems/Leaderboard.js";
import { EffectManager } from "./systems/EffectManager.js";

document.addEventListener("DOMContentLoaded", () => {
	// Responsive scaling — fit game container to viewport
	const container = document.getElementById("game-container");
	const BASE_WIDTH = 646; // container width + padding + borders
	const BASE_HEIGHT = 760;

	function updateScale() {
		const scaleX = window.innerWidth / BASE_WIDTH;
		const scaleY = window.innerHeight / BASE_HEIGHT;
		const scale = Math.min(scaleX, scaleY, 1);
		container.style.setProperty("--game-scale", scale.toFixed(4));
	}
	updateScale();
	window.addEventListener("resize", updateScale);

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

	// Settings overlay wiring
	const settingsOverlay = document.getElementById("settings-screen");
	const settingsBtn = document.getElementById("settings-btn");
	const volumeSlider = document.getElementById("volume-slider");
	const volumeValue = document.getElementById("volume-value");
	let settingsOpen = false;
	let stateBeforeSettings = null;

	// Initialize slider with saved volume
	const initialVol = Math.round(soundManager.volume * 100);
	volumeSlider.value = initialVol;
	volumeValue.textContent = `${initialVol}%`;

	function openSettings() {
		if (settingsOpen) return;
		settingsOpen = true;
		stateBeforeSettings = game.state;
		if (game.state === "PLAYING") {
			game.state = "SETTINGS";
			game.sound.stopBGMusic();
		}
		settingsOverlay.classList.remove("hidden");
		settingsOverlay.classList.add("active");
	}

	function closeSettings() {
		if (!settingsOpen) return;
		settingsOpen = false;
		settingsOverlay.classList.remove("active");
		settingsOverlay.classList.add("hidden");
		if (stateBeforeSettings === "PLAYING") {
			game.state = "PLAYING";
			game.firstFrame = true;
			if (game.isHorrorMode) {
				game.sound.startHorrorMusic();
			} else {
				game.sound.startBGMusic();
			}
			requestAnimationFrame(game.loop);
		}
		stateBeforeSettings = null;
	}

	settingsBtn.addEventListener("click", () => {
		if (settingsOpen) {
			closeSettings();
		} else {
			openSettings();
		}
	});

	volumeSlider.addEventListener("input", (e) => {
		const pct = parseInt(e.target.value, 10);
		volumeValue.textContent = `${pct}%`;
		soundManager.setVolume(pct / 100);
	});

	// Pause / Settings key handler (always active)
	window.addEventListener("keydown", (e) => {
		if (e.key === "Escape") {
			if (settingsOpen) {
				closeSettings();
			} else if (
				game.state === "PLAYING" ||
				game.state === "PAUSED"
			) {
				game.togglePause();
			}
		} else if ((e.key === "p" || e.key === "P") && !settingsOpen) {
			game.togglePause();
		}
	});

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

	// Touch-to-start for mobile
	window.addEventListener(
		"touchstart",
		function startTouchHandler() {
			if (game.state === "START") {
				soundManager.init();
				game.start();
				window.removeEventListener(
					"touchstart",
					startTouchHandler,
				);
			}
		},
		{ once: false, passive: true },
	);
});
