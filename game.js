import { Audio } from "./audio.js";
import { Storage } from "./storage.js";

// GAME STATE MACHINE

const GAME_STATES = {
	BOOT: "boot",
	ACTIVE: "active",
	PHANTOM: "phantom",
	COLLAPSE: "collapse",
	AFTERMATH: "aftermath",
};

// WORD BANK
const WORD_BANK = {
	easy: [
		"type",
		"fear",
		"ghost",
		"dark",
		"void",
		"fade",
		"blur",
		"echo",
		"mist",
		"cold",
		"lost",
		"haunt",
		"creep",
		"drift",
		"shade",
		"grim",
		"pale",
		"hush",
		"silent",
		"shadow",
	],
	medium: [
		"whisper",
		"specter",
		"phantom",
		"tremor",
		"shiver",
		"hollow",
		"vanish",
		"flicker",
		"twisted",
		"wither",
		"decay",
		"horror",
		"terror",
		"dread",
		"madness",
		"anguish",
		"despair",
		"torment",
		"cursed",
		"haunted",
		"forgotten",
		"fractured",
		"corrupt",
	],
	hard: [
		"deteriorate",
		"dissolution",
		"manifestation",
		"apparition",
		"hallucination",
		"disintegrate",
		"obliterate",
		"aberration",
		"nightmare",
		"apocalypse",
		"cataclysm",
		"revelation",
		"metamorphosis",
		"pestilence",
		"desolation",
		"malevolent",
		"supernatural",
		"paranormal",
		"spectral",
		"ethereal",
	],
};

// GAME CONFIGURATIONS
const CONFIG = {
	BASE_TIME: 8000, // 8 seconds base time per word
	MIN_TIME: 3000, // Minimum 3 seconds
	TIME_REDUCTION_PER_LEVEL: 300, // -0.3s per level
	PHANTOM_MODE_TRIGGER: 5, // Every 5 successful words
	DIFFICULTY_SCALE: 0.15, // 15% increase in distortion per level
};

// GAME STATE
const GameState = {
	currentState: GAME_STATES.BOOT,
	level: 1,
	currentWord: "",
	playerInput: "",
	streak: 0,
	longestStreak: 0,
	wordsCompleted: 0,
	totalKeystrokes: 0,
	totalErrors: 0,
	sessionStartTime: null,
	roundStartTime: null,
	timeRemaining: 0,
	maxTime: CONFIG.BASE_TIME,
	isPhantomMode: false,
	ghostWords: [],
	difficultyMultiplier: 1.0,
	animationFrameId: null,
};

// DOM REFERENCES

const DOM = {
	bootScreen: document.getElementById("boot-screen"),
	gameArena: document.getElementById("game-arena"),
	collapseScreen: document.getElementById("collapse-screen"),
	aftermathScreen: document.getElementById("aftermath-screen"),

	mainWord: document.getElementById("main-word"),
	ghostWord1: document.getElementById("ghost-1"),
	ghostWord2: document.getElementById("ghost-2"),
	ghostWord3: document.getElementById("ghost-3"),

	hiddenInput: document.getElementById("hidden-input"),
	inputFeedback: document.getElementById("input-feedback"),
	timerBar: document.getElementById("timer-bar"),

	levelDisplay: document.getElementById("level-display"),
	streakDisplay: document.getElementById("streak-display"),
	wpmDisplay: document.getElementById("wpm-display"),

	collapseMessage: document.getElementById("collapse-message"),
	failedWordReplay: document.getElementById("failed-word-replay"),

	finalWPM: document.getElementById("final-wpm"),
	finalAccuracy: document.getElementById("final-accuracy"),
	finalStreak: document.getElementById("final-streak"),
	finalWords: document.getElementById("final-words"),

	retryButton: document.getElementById("retry-button"),
};

// INITIALIZING
function init() {
	GameState.difficultyMultiplier = Storage.getDifficultyMultiplier();

	// BOOT SCREEN LISTENER
	document.addEventListener("keydown", handleBootKeydown, { once: true });

	// RETRY BUTTON
	DOM.retryButton.addEventListener("click", resetGame);
}

function handleBootKeydown(e) {
	e.preventDefault();
	e.stopPropagation();
	// INITIALIZE AUDIO ON FIRST INTERACTION
	Audio.init();
	Audio.playKeystroke();

	// TRANSACTION TO ACTIVE GAME
	transitionToActive();
}

function transitionToActive() {
	DOM.bootScreen.classList.add("hidden");
	DOM.gameArena.classList.remove("hidden");

	GameState.currentState = GAME_STATES.ACTIVE;
	GameState.sessionStartTime = Date.now();

	// Focus hidden input for keyboard capture
	DOM.hiddenInput.focus();
	DOM.hiddenInput.addEventListener("input", handlePlayerInput);

	startRound();
}

// Round Management
function startRound() {
	// Select word based on level

	const wordTier = getWordTier();
	GameState.currentWord = selectRandomWord(wordTier);

	// Calculate time for this round (decreases with level)
	GameState.maxTime = Math.max(
		CONFIG.MIN_TIME,
		CONFIG.BASE_TIME -
			GameState.level *
				CONFIG.TIME_REDUCTION_PER_LEVEL *
				GameState.difficultyMultiplier,
	);
	GameState.timeRemaining = GameState.maxTime;
	GameState.roundStartTime = Date.now();

	// RESET INPUT
	GameState.playerInput = "";
	DOM.hiddenInput.value = "";
	DOM.inputFeedback.textContent = "";

	// DISPLAY WORD
	DOM.mainWord.textContent = GameState.currentWord;
	DOM.mainWord.setAttribute("data-word", GameState.currentWord);

	// RESET CSS VARIABLES
	updateVisualEffects(100); // 100% time remaining

	// PHANTOM MODE
	if (
		GameState.wordsCompleted > 0 &&
		GameState.wordsCompleted % CONFIG.PHANTOM_MODE_TRIGGER === 0
	) {
		activatePhantomMode();
	} else {
		deactivatePhantomMode();
	}

	Audio.playWhisper();

	// START GAME LOOP
	GameState.animationFrameId = requestAnimationFrame(gameLoop);
}

function getWordTier() {
	if (GameState.level <= 3) return "easy";
	if (GameState.level <= 8) return "medium";
	return "hard";
}

function selectRandomWord(tier) {
	const words = WORD_BANK[tier];
	return words[Math.floor(Math.random() * words.length)];
}

// Game Loop
function gameLoop(timestamp) {
	const elapsed = Date.now() - GameState.roundStartTime;
	GameState.timeRemaining = Math.max(0, GameState.maxTime - elapsed);

	const percentRemaining = (GameState.timeRemaining / GameState.maxTime) * 100;

	// Update Visuals
	updateVisualEffects(percentRemaining);
	updateTimerBar(percentRemaining);

	if (percentRemaining < 20 && percentRemaining > 18) {
		Audio.playWarning();
	}

	if (GameState.timeRemaining <= 0) {
		failRound();
		return;
	}

	GameState.animationFrameId = requestAnimationFrame(gameLoop);
}

function updateVisualEffects(percentRemaining) {
	const corruption = 100 - percentRemaining;
	const difficultyFactor =
		1 +
		GameState.level * CONFIG.DIFFICULTY_SCALE * GameState.difficultyMultiplier;

	const blur = (corruption / 100) * 10 * difficultyFactor;
	const skew = (corruption / 100) * 25 * difficultyFactor;
	const opacity = Math.max(0.3, 1 - (corruption / 100) * 0.7);
	const brightness = Math.max(50, 100 - corruption * 0.5);

	document.documentElement.style.setProperty("--blur-intensity", `${blur}px`);
	document.documentElement.style.setProperty("--distortion-skew", `${skew}deg`);
	document.documentElement.style.setProperty("--opacity-jitter", opacity);
	document.documentElement.style.setProperty(
		"--brightness-level",
		`${brightness}%`,
	);
}

function updateTimerBar(percentRemaining) {
	DOM.timerBar.style.width = `${percentRemaining}%`;
}

// INPUT HANDLING
function handlePlayerInput(e) {
	const input = e.target.value.toLowerCase().trim();
	GameState.playerInput = input;
	GameState.totalKeystrokes++;

	DOM.inputFeedback.textContent = input;

	const target = GameState.currentWord.toLowerCase();

	if (target.startsWith(input)) {
		DOM.inputFeedback.className = "input-feedback correct";
		Audio.playKeystroke();

		if (input === target) {
			completeRound();
		}
	} else {
		DOM.inputFeedback.className = "input-feedback incorrect";
		Audio.playError();
		GameState.totalErrors++;
	}
}

// ROUND COMPLETION
function completeRound() {
	cancelAnimationFrame(GameState.animationFrameId);

	GameState.wordsCompleted++;
	GameState.streak++;
	GameState.level++;

	if (GameState.streak > GameState.longestStreak) {
		GameState.longestStreak = GameState.streak;
	}

	DOM.levelDisplay.textContent = GameState.level;
	DOM.streakDisplay.textContent = GameState.streak;
	updateWPMDisplay();

	Audio.playSuccess();

	setTimeout(() => {
		startRound();
	}, 500);
}

function failRound() {
	cancelAnimationFrame(GameState.animationFrameId);

	GameState.streak = 0;

	triggerCollapse();
}

// FAIL STATE
function triggerCollapse() {
	GameState.currentState = GAME_STATES.COLLAPSE;

	Audio.playCollapse();

	document.body.classList.add("reality-collapse");

	DOM.gameArena.classList.add("hidden");
	DOM.collapseScreen.classList.remove("hidden");
	DOM.collapseMessage.textContent = "You hesitated.";

	setTimeout(() => {
		showAftermath();
	}, 3000);
}

// AFTERMATH SCREEN
function showAftermath() {
	GameState.currentState = GAME_STATES.AFTERMATH;

	document.body.classList.remove("reality-collapse");

	DOM.collapseScreen.classList.add("hidden");

	DOM.aftermathScreen.classList.remove("hidden");

	const sessionDuration = (Date.now() - GameState.sessionStartTime) / 1000 / 60;

	const wpm = Math.round(GameState.wordsCompleted / sessionDuration);
	const accuracy =
		GameState.totalKeystrokes > 0
			? Math.round(
					((GameState.totalKeystrokes - GameState.totalErrors) /
						GameState.totalKeystrokes) *
						100,
				)
			: 0;

	DOM.finalWPM.textContent = wpm;
	DOM.finalAccuracy.textContent = `${accuracy}%`;
	DOM.finalStreak.textContent = GameState.longestStreak;
	DOM.finalWords.textContent = GameState.wordsCompleted;

	DOM.failedWordReplay.textContent = GameState.currentWord.toUpperCase();

	const statElements = document.querySelectorAll(".stat-reveal");
	statElements.forEach((el, index) => {
		setTimeout(() => {
			el.classList.add("reveal");
		}, index * 200);
	});

	setTimeout(() => {
		DOM.retryButton.classList.remove("hidden");
	}, 3000);

	const sessionStats = {
		wordsCompleted: GameState.wordsCompleted,
		totalKeystrokes: GameState.totalKeystrokes,
		totalErrors: GameState.totalErrors,
		longestStreak: GameState.longestStreak,
		wpm: wpm,
		accuracy: accuracy,
	};
	Storage.updateProgression(sessionStats);
}

// PHANTOM MODE
function activatePhantomMode() {
	GameState.isPhantomMode = true;

	const ghostCount = 2 + Math.floor(Math.random() * 2);
	const tier = getWordTier();

	GameState.ghostWords = [];
	const ghostElements = [DOM.ghostWord1, DOM.ghostWord2, DOM.ghostWord3];

	for (let i = 0; i < ghostCount; i++) {
		const ghostWord = selectRandomWord(tier);
		GameState.ghostWords.push(ghostWord);
		ghostElements[i].textContent = ghostWord.toUpperCase();
		ghostElements[i].classList.add("active");
	}

	Audio.playPhantomMode();
}

function deactivatePhantomMode() {
	GameState.isPhantomMode = false;
	GameState.ghostWords = [];

	DOM.ghostWord1.classList.remove("active");
	DOM.ghostWord2.classList.remove("active");
	DOM.ghostWord3.classList.remove("active");
}

// WPM CALCULATION
function updateWPMDisplay() {
	const sessionDuration = (Date.now() - GameState.sessionStartTime) / 1000 / 60;
	const wpm = Math.round(GameState.wordsCompleted / sessionDuration);
	DOM.wpmDisplay.textContent = wpm;
}

// RESET GAME
function resetGame() {
	GameState.currentState = GAME_STATES.ACTIVE;
	GameState.level = 1;
	GameState.streak = 0;
	GameState.longestStreak = 0;
	GameState.wordsCompleted = 0;
	GameState.totalKeystrokes = 0;
	GameState.totalErrors = 0;
	GameState.sessionStartTime = Date.now();
	GameState.isPhantomMode = false;

	GameState.difficultyMultiplier = Storage.getDifficultyMultiplier();

	DOM.aftermathScreen.classList.add("hidden");
	DOM.gameArena.classList.remove("hidden");

	DOM.retryButton.classList.add("hidden");
	document.querySelectorAll(".stat-reveal").forEach((el) => {
		el.classList.remove("reveal");
	});

	DOM.levelDisplay.textContent = "1";
	DOM.streakDisplay.textContent = "0";
	DOM.wpmDisplay.textContent = "0";

	DOM.hiddenInput.focus();

	startRound();
}

// START GAME
init();
