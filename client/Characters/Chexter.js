export default {
  name: "chexter",
  spritesheet: "assets/Chexter.png",
  framesize: { frameWidth: 32, frameHeight: 32 },
  type: "Player",
  hp: 100,
  damage: 20,
  scale: 1.2,
  animFrames: {
	idle: {
		key: 'idle',
		defaultTextureKey: 'chexter',
		frames: [
			{frame: 0},
			{frame: 9}
		],
		frameRate: 10
	},
	attack: {
		key: 'attack',
		defaultTextureKey: 'chexter',
		frames: [
			{frame: 6},
			{frame: 7},
		],
		frameRate: 20
	}
  }
};
