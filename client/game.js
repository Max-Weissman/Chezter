import { Game, Scene, GameObjects, AUTO } from "phaser";

let w

class Unit extends GameObjects.Sprite {

    constructor(scene, x, y, texture, frame, type, hp, damage) {
        super(scene, x, y, texture, frame)
        this.type = type;
        this.maxHp = this.hp = hp;
        this.damage = damage; // default damage            
    }

    attack(target){
        target.takeDamage(this.damage)
    }

    takeDamage(damage) {
        this.hp -= damage
        this.healthbar.update()
    }
}

class Healthbar extends GameObjects.Sprite{

    constructor(scene, unit) {
        const unitWidth = unit.width * 0.02
        const unitHeight = unit.height * 0.02

        const x = unit.x - ((unitWidth + 45) / 2)
        const y = unit.y - ((unitHeight + 20) / 2)

        const texture = scene.add.graphics()

        texture.lineStyle(2, 0xffffff);
        texture.fillStyle(0x0FFF00, 1); // green
        
        texture.strokeRect(x, y, 90, 5);
        texture.fillRect(x, y, 90, 5);

        super(scene, x, y, texture)

        this.texture = texture
        this.unit = unit
    }

    update(){
        // calculate missing hp
        let ratio = (this.unit.maxHp - this.unit.hp) / this.unit.maxHp

        // cant miss more than 100% of hp
        if (ratio > 1) ratio = 1

        this.texture.fillStyle(0x0FFF00, 1); // green
        this.texture.fillRect(this.x, this.y, 90, 5);

        this.texture.fillStyle(0xFF0000, 1) // red
        this.texture.fillRect(this.x + (90 * (1 - ratio)), this.y, 90 * ratio, 5);
    }

}

class BattleScene extends Scene {

    preload () {
        this.load.image('cracker', 'assets/Cracker.jfif');
    }

    create () {
        this.cameras.main.setBackgroundColor(0x0FFF00) // green

        const player = new Unit(this, 250, 50, 'cracker', null, 'Player', 100, 20);
        player.setScale(0.02, 0.02)    
        this.add.existing(player);

        const enemy = new Unit(this, 450, 50, 'cracker', null, 'Enemy', 100, 20);
        enemy.setScale(0.02, 0.02)
        this.add.existing(enemy)

        this.units = [player, enemy]

        // Add healthbars
        for (const unit of this.units) {
            unit.healthbar = new Healthbar(this, unit)
        }

        w = this.input.keyboard.addKey('w')
    }

    update() {
        if (w.isDown){
            this.units[0].attack(this.units[1])
        }
    }

}

const config = {
	type: AUTO,
	width: 800,
	height: 600,
	scene: BattleScene,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 }
		}
	}
};

const game = new Game(config);