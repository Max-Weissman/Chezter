import { Game, AUTO } from "phaser";

import WorldScene from "./Scenes/Worldscene";
import BattleScene from "./Scenes/Battlescene";
import Textbox from './Scenes/Textbox'

import { Chexter, Oyster } from './Characters/index'

const conversation = [
	{text: 'hey', name: 'Cracker', color: 'green'},
	{text: 'I Can not staND YOU ASLF:DFLK:KLDS:FK:LDFSKLM:DSF:LK:LSKDKJFA:LDSKFJ:LASKJDF:LAKDJF:LSDKJF:LAKSJDF:LAKSJDF:LAKSJD:LKASJF', name: 'Evil Cracker', color: 'red'},
	{text: 'oh...', name: 'Cracker', color: 'green'},
]

const world = new WorldScene([Chexter, Oyster])
const crackerFight = new BattleScene([Chexter, Oyster])
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