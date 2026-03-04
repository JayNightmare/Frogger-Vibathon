/**
 * Manages game audio using pre-recorded sound files and
 * procedural Web Audio API fallbacks for unmapped effects.
 */
export class SoundManager {
	constructor() {
		this.ctx = null;
		this.enabled = true;
		this.initialized = false;

		// Load saved volume or default to 0.4
		const saved = parseFloat(localStorage.getItem("froggerVolume"));
		this.volume = Number.isFinite(saved) ? saved : 0.4;

		this.sounds = {};
		this.bgMusic = null;
		this.bgMusicPlaying = false;
	}

	init() {
		if (this.initialized) return;
		try {
			this.ctx = new (
				window.AudioContext || window.webkitAudioContext
			)();
			this.initialized = true;
			this.preload();
		} catch (e) {
			this.enabled = false;
		}
	}

	preload() {
		const manifest = {
			hop: "assets/sounds/jump.wav",
			death: "assets/sounds/hitHurt.wav",
			pickup: "assets/sounds/powerUp.wav",
			horrorTransition: "assets/sounds/scene-change.wav",
		};

		Object.entries(manifest).forEach(([name, path]) => {
			fetch(path)
				.then((res) => res.arrayBuffer())
				.then((buf) => this.ctx.decodeAudioData(buf))
				.then((decoded) => {
					this.sounds[name] = decoded;
				})
				.catch((err) =>
					console.warn(
						`[SoundManager] Failed to load "${name}":`,
						err,
					),
				);
		});

		// Background music (looping)
		this.bgMusic = new Audio("assets/sounds/background-sound.mp4");
		this.bgMusic.loop = true;
		this.bgMusic.volume = this.volume * 0.375; // BG music at ~37.5% of master
		this.bgMusic.currentTime = 3;
		this.horrorMusicActive = false;
		this.bgMusic.addEventListener("timeupdate", () => {
			if (
				!this.horrorMusicActive &&
				this.bgMusic.currentTime >= 46
			) {
				this.bgMusic.currentTime = 3;
			}
		});
	}

	startBGMusic() {
		if (!this.bgMusic || this.bgMusicPlaying) return;
		this.bgMusic
			.play()
			.then(() => {
				this.bgMusicPlaying = true;
			})
			.catch((err) =>
				console.warn(
					"[SoundManager] BG music blocked:",
					err,
				),
			);
	}

	stopBGMusic() {
		if (!this.bgMusic) return;
		this.bgMusic.pause();
		this.bgMusicPlaying = false;
	}

	startHorrorMusic() {
		if (!this.bgMusic) return;
		this.bgMusic.currentTime = 61;
		// Remove normal loop boundary temporarily
		this.horrorMusicActive = true;
		this.bgMusic
			.play()
			.then(() => {
				this.bgMusicPlaying = true;
			})
			.catch(() => {});
	}

	stopHorrorMusic() {
		if (!this.bgMusic) return;
		this.bgMusic.pause();
		this.bgMusic.currentTime = 3;
		this.horrorMusicActive = false;
		this.bgMusicPlaying = false;
	}

	play(name) {
		if (!this.enabled) return;
		this.init();
		if (!this.ctx) return;

		if (this.ctx.state === "suspended") {
			this.ctx.resume();
		}

		try {
			// If we have a pre-loaded buffer for this sound, use it
			if (this.sounds[name]) {
				this.playSample(this.sounds[name]);
				return;
			}

			// Procedural fallbacks for sounds without files
			const procedural = {
				goalReached: () =>
					this.playArpeggio(
						[660, 770, 880, 990, 1100],
						0.12,
						"square",
					),
				levelUp: () =>
					this.playArpeggio(
						[523, 659, 784, 1047],
						0.15,
						"triangle",
					),
				stomp: () =>
					this.playTone(80, 0.15, "sine", 0.5),
				squelch: () => this.playNoise(0.3, 300),
				bloodSplash: () => this.playNoise(0.5, 500),
			};

			const fn = procedural[name];
			if (fn) fn();
		} catch (err) {
			console.warn(
				`[SoundManager] Failed to play "${name}":`,
				err,
			);
		}
	}

	playSample(buffer) {
		const source = this.ctx.createBufferSource();
		source.buffer = buffer;
		const gain = this.ctx.createGain();
		gain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
		source.connect(gain);
		gain.connect(this.ctx.destination);
		source.start(0);
	}

	playTone(freq, duration, type = "square", vol = null) {
		const osc = this.ctx.createOscillator();
		const gain = this.ctx.createGain();
		osc.type = type;
		osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

		gain.gain.setValueAtTime(
			vol ?? this.volume,
			this.ctx.currentTime,
		);
		gain.gain.exponentialRampToValueAtTime(
			0.001,
			this.ctx.currentTime + duration,
		);

		osc.connect(gain);
		gain.connect(this.ctx.destination);
		osc.start();
		osc.stop(this.ctx.currentTime + duration);
	}

	playArpeggio(freqs, noteDuration, type = "square", customVol = null) {
		freqs.forEach((freq, i) => {
			const startTime =
				this.ctx.currentTime + i * noteDuration;
			const osc = this.ctx.createOscillator();
			const gain = this.ctx.createGain();
			osc.type = type;
			osc.frequency.setValueAtTime(freq, startTime);

			gain.gain.setValueAtTime(
				customVol ?? this.volume,
				startTime,
			);
			gain.gain.exponentialRampToValueAtTime(
				0.001,
				startTime + noteDuration,
			);

			osc.connect(gain);
			gain.connect(this.ctx.destination);
			osc.start(startTime);
			osc.stop(startTime + noteDuration);
		});
	}

	playNoise(duration, cutoff = 800) {
		const bufferSize = this.ctx.sampleRate * duration;
		const buffer = this.ctx.createBuffer(
			1,
			bufferSize,
			this.ctx.sampleRate,
		);
		const data = buffer.getChannelData(0);

		for (let i = 0; i < bufferSize; i++) {
			data[i] = Math.random() * 2 - 1;
		}

		const source = this.ctx.createBufferSource();
		source.buffer = buffer;

		const gain = this.ctx.createGain();
		gain.gain.setValueAtTime(
			this.volume * 0.5,
			this.ctx.currentTime,
		);
		gain.gain.exponentialRampToValueAtTime(
			0.001,
			this.ctx.currentTime + duration,
		);

		const filter = this.ctx.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.value = cutoff;

		source.connect(filter);
		filter.connect(gain);
		gain.connect(this.ctx.destination);
		source.start();
		source.stop(this.ctx.currentTime + duration);
	}

	/**
	 * Sets master volume (0–1). Scales SFX gain and BG music proportionally.
	 * Persists to localStorage.
	 */
	setVolume(val) {
		this.volume = Math.max(0, Math.min(1, val));
		if (this.bgMusic) {
			this.bgMusic.volume = this.volume * 0.375;
		}
		localStorage.setItem("froggerVolume", this.volume);
	}
}
