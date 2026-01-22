export const Storage = {
	STORAGE_KEY: "ghost_type_stats",

	// GET DEFAULT STATS STRUCTURE

	getDefaultStats() {
		return {
			totalWords: 0,
			totalKeystrokes: 0,
			totalErrors: 0,
			bestStreak: 0,
			bestWPM: 0,
			totalSessions: 0,
			lastPlayed: null,
			difficultyMultiplier: 1.0,
		};
	},

	// LOAD STATS FROM LOCALSTORAGE WITH FALLBACK
	loadStats() {
		try {
			const stored = localStorage.getItem(this.STORAGE_KEY);
			if (stored) {
				return { ...this.getDefaultStats(), ...JSON.parse(stored) };
			}
		} catch (error) {
			console.warn("LocalStorage read failed (private browsing?)", error);
		}
		return this.getDefaultStats();
	},

	// Save Stats to localstorage
	saveStats(stats) {
		try {
			stats.lastPlayed = new Date().toISOString();
			localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
			return true;
		} catch (error) {
			console.warn("LocalStorage write failed", error);
			return false;
		}
	},

	// UPDATE PROGRESSION METRICS [CALLED AFTER EACH SESSION]
	updateProgression(sessionStats) {
		const allTimeStats = this.loadStats();

		allTimeStats.totalWords += sessionStats.wordsCompleted;
		allTimeStats.totalKeystrokes += sessionStats.totalKeystrokes;
		allTimeStats.totalErrors += sessionStats.totalErrors;
		allTimeStats.totalSessions += 1;

		if (sessionStats.longestStreak > allTimeStats.bestStreak) {
			allTimeStats.bestStreak = sessionStats.longestStreak;
		}

		if (sessionStats.wpm > allTimeStats.bestWPM) {
			allTimeStats.bestWPM = sessionStats.wpm;
		}

		// INCREASE DIFFICULTY MULTIPLPER BASED ON PERFORMANCE
		// CAP AT 2.0X (200% DIFFICULTY)
		if (sessionStats.wordsCompleted >= 10 && sessionStats.accuracy > 85) {
			allTimeStats.difficultyMultiplier = Math.min(
				allTimeStats.difficultyMultiplier + 0.05,
				2.0,
			);
		}

		this.saveStats(allTimeStats);
		return allTimeStats;
	},

	// GET BEST STREAK FOR DISPLAY
	getBestStreak() {
		const stats = this.loadStats();
		return stats.bestStreak;
	},

	// GET DIFFICULTY MULTIPLIER FOR RETURNING PLAYERS
	getDifficultyMultiplier() {
		const stats = this.loadStats();
		return stats.difficultyMultiplier;
	},

	// RESET ALL STATS
	resetStats() {
		try {
			localStorage.removeItem(this.STORAGE_KEY);
			return true;
		} catch (error) {
			console.warn("LocalStorage clear failed", error);
			return false;
		}
	},
};
