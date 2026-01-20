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
