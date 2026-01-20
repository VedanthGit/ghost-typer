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
const gameState = {
	currentState: GAME_STATES.BOOT,
	level: 1,
	currentWord: "",
	playerInput: "",
	streak: 0,
	longest: 0,
	wordsCompleted: 0,
	totalKeyStrokes: 0,
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
