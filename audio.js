export const Audio = {
	audioContext: null,
	isInitialized: false,
	isMuted: false,

	// Initialize Web Audio Context
	init() {
		if (this.isInitialized) return;

		try {
			this.audioContext = new (
				window.AudioContext || window.webkitAudioContext
			)();
			this.isInitialized = true;
		} catch (error) {
			console.warn("Web Audio API not supported", error);
		}
	},

	playTone(frequency, duration, type = "sine", volume = 0.3) {
		if (!this.isInitialized || this.isMuted) return;

		try {
			const oscillator = this.audioContext.createOscillator();
			const gainNode = this.audioContext.createGain();

			oscillator.connect(gainNode);
			gainNode.connect(this.audioContext.destination);

			oscillator.type = type;
			oscillator.frequency.value = frequency;

			gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
			gainNode.gain.exponentialRampToValueAtTime(
				0.01,
				this.audioContext.currentTime + duration,
			);

			oscillator.start(this.audioContext.currentTime);
			oscillator.stop(this.audioContext.currentTime + duration);
		} catch (error) {
			console.warn("Audio playback failed", error);
		}
	},

	playKeystroke() {
		this.playTone(800, 0.05, "square", 0.1);
	},

	playWhisper() {
		this.playTone(60, 0.4, "sawtooth", 0.2);
		setTimeout(() => {
			this.playTone(65, 0.5, "sawtooth", 0.15);
		}, 100);
	},

	playSuccess() {
		this.playTone(440, 0.15, "sine", 0.2);
		setTimeout(() => {
			this.playTone(554, 0.15, "sine", 0.15);
		}, 50);
		setTimeout(() => {
			this.playTone(659, 0.2, "sine", 0.1);
		}, 100);
	},

	playError() {
		this.playTone(150, 0.1, "square", 0.15);
		setTimeout(() => {
			this.playTone(140, 0.1, "square", 0.1);
		}, 50);
	},

	playCollapse() {
		this.playTone(440, 0.3, "sawtooth", 0.3);
		setTimeout(() => {
			this.playTone(330, 0.3, "sawtooth", 0.25);
		}, 150);
		setTimeout(() => {
			this.playTone(220, 0.4, "sawtooth", 0.2);
		}, 300);
		setTimeout(() => {
			this.playTone(110, 0.5, "square", 0.15);
		}, 450);
	},

	playPhantomMode() {
		this.playTone(220, 0.5, "triangle", 0.2);
		setTimeout(() => {
			this.playTone(233, 0.5, "triangle", 0.15);
		}, 200);
	},

	playWarning() {
		this.playTone(880, 0.1, "square", 0.15);
	},

	toggleMute() {
		this.isMuted = !this.isMuted;
		return this.isMuted;
	},
};
