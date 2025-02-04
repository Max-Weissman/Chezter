import { Game, AUTO } from "phaser";
import WorldScene from './Worldscene'
import BattleScene from "./Battlescene";
import Textbox from './Textbox'

const player = {name: 'cracker', image: 'assets/Cracker.png', type: 'Player', scale: 0.02, hp: 100, damage: 20}
const enemy = {name: 'cracker', type: 'Enemy', scale: 0.02,  hp: 100, damage: 20}

const conversation = [
	{text: 'hey', name: 'Cracker', color: 'green'},
	{text: 'I Can not staND YOU ASLF:DFLK:KLDS:FK:LDFSKLM:DSF:LK:LSKDKJFA:LDSKFJ:LASKJDF:LAKDJF:LSDKJF:LAKSJDF:LAKSJDF:LAKSJD:LKASJF', name: 'Evil Cracker', color: 'red'},
	{text: 'oh...', name: 'Cracker', color: 'green'},
]

const world = new WorldScene([player, enemy])
const crackerFight = new BattleScene([player, enemy])
const crackerTalk = new Textbox(conversation)

const config = {
	type: AUTO,
	width: 800,
	height: 600,
	scene: [world, crackerFight, crackerTalk],
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 }
		}
	}
};

const game = new Game(config);