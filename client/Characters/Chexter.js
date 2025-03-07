export default {
  name: "chexter",
  spritesheet: "assets/Chexter.png",
  framesize: { frameWidth: 32, frameHeight: 32 },
  type: "Player",
  hp: 200,
  damage: 20,
  scale: 1.2,
  animFrames: {
	idle: {
		key: 'idle',
		defaultTextureKey: 'chexter',
		frames: [
			{frame: 0},
			{frame: 6}
		],
		frameRate: 10
	},
	attack: {
		key: 'attack',
		defaultTextureKey: 'chexter',
		frames: [
			{frame: 7},
			{frame: 8},
		],
		frameRate: 20
	}
  },
  attacks: [
	{damage: 10, uses: Infinity, description: '10 damage - Halves incoming damage for 3 turns', effect: 'reduce'},
	{damage: 20, uses: Infinity, description: '20 damage - Taunt an enemy for this turn', effect: 'taunt'},
	{damage: 30, uses: 4, description: '30 damage - Doubles damage dealt for 3 turns', effect: 'increase'},
	{damage: 40, uses: 2, description: '40 damage - 50% chance to stun the enemy', effect: 'stun'},
	{damage: 50, uses: 4, description: '50 damage', effect: ''},
  ]
};
