import { Game, AUTO } from "phaser";
import BattleScene from "./Battlescene";

const player = {name: 'cracker', image: 'assets/Cracker.jfif', type: 'Player', scale: 0.02, hp: 100, damage: 20}
const enemy = {name: 'cracker', type: 'Enemy', scale: 0.02,  hp: 100, damage: 20}

const crackerFight = new BattleScene([player, enemy])

const config = {
	type: AUTO,
	width: 800,
	height: 600,
	scene: crackerFight,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 }
		}
	}
};

const game = new Game(config);