export default {
	name: "oyster",
	spritesheet: "assets/Oyster.png",
	framesize: { frameWidth: 32, frameHeight: 32 },
	type: "Enemy",
	scale: 1.2,
	hp: 1000,
	damage: 20,
	animFrames: {
		idle:{
			key: 'idle',
			frames: [
				{frame: 0},
				{frame: 1},
				{frame: 2},
				{frame: 1},
				{frame: 0},
				{frame: 3},
				{frame: 4},
				{frame: 3},
				{frame: 0},
				{frame: 0},
				{frame: 0},
				{frame: 0},
				{frame: 5},
				{frame: 0},
				{frame: 0},
				{frame: 0},
				{frame: 0},	
			],
		frameRate: 10
		}
	},
	attacks: [
		{damage: 20, chance: 3, description: '20'},
		{damage: 0, effect: '↑', chance: 1, description: '↑'}
	  ]
  };