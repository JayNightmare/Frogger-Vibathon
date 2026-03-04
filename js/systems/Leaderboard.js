/**
 * Arcade-style top-5 leaderboard persisted in localStorage.
 * Supports 3-character initial entry.
 */
export class Leaderboard {
	constructor(ui) {
		this.ui = ui;
		this.storageKey = "froggerLeaderboard";
		this.maxEntries = 5;
		this.entries = this.load();
		this.pendingScore = 0;
		this.render();
	}

	load() {
		try {
			const data = localStorage.getItem(this.storageKey);
			return data ? JSON.parse(data) : [];
		} catch {
			return [];
		}
	}

	save() {
		localStorage.setItem(
			this.storageKey,
			JSON.stringify(this.entries),
		);
	}

	qualifies(score) {
		if (score <= 0) return false;
		if (this.entries.length < this.maxEntries) return true;
		return score > this.entries[this.entries.length - 1].score;
	}

	addEntry(initials, score) {
		const name = initials.toUpperCase().slice(0, 3).padEnd(3, " ");
		this.entries.push({ name, score });
		this.entries.sort((a, b) => b.score - a.score);
		this.entries = this.entries.slice(0, this.maxEntries);
		this.save();
		this.render();
	}

	promptInitials(score) {
		this.pendingScore = score;
		const prompt = this.ui.initialsPrompt;
		if (!prompt) return;

		prompt.classList.add("active");
		const input = prompt.querySelector("input");
		if (!input) return;

		input.value = "";
		input.focus();

		const handler = (e) => {
			if (
				e.key === "Enter" &&
				input.value.trim().length > 0
			) {
				e.stopPropagation();
				this.addEntry(
					input.value.trim(),
					this.pendingScore,
				);
				prompt.classList.remove("active");
				input.removeEventListener("keydown", handler);
			}
		};
		input.addEventListener("keydown", handler);
	}

	render() {
		const list = this.ui.leaderboardList;
		if (!list) return;

		list.innerHTML = "";
		if (this.entries.length === 0) {
			const li = document.createElement("li");
			li.textContent = "NO SCORES YET";
			list.appendChild(li);
			return;
		}

		this.entries.forEach((entry, i) => {
			const li = document.createElement("li");
			const rank = document.createElement("span");
			rank.textContent = `${i + 1}. ${entry.name}`;
			const score = document.createElement("span");
			score.textContent = entry.score;
			li.appendChild(rank);
			li.appendChild(score);
			list.appendChild(li);
		});
	}
}
