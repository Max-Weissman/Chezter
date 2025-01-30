import { Scene, GameObjects } from "phaser";

let w
let timeout = false

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

    activeTurn(){
        this.clearTint()
    }

    endTurn(){
        this.setTint(0xffaaff, 0xffffff, 0xffffff, 0xffffff)
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

    constructor (units) {
        super()
        this.unitIds = units
    }

    // end current unit's turn and move to next
    nextUnit () {
        this.units[this.turn].endTurn()

        this.turn = this.turn + 1
        if (this.turn === this.units.length) this.turn = 0

        this.units[this.turn].activeTurn()
    }

    preload () {
		for (const unit of this.unitIds){
            if (unit.image) this.load.image(unit.name, unit.image)
		}
    }

    create () {
        this.cameras.main.setBackgroundColor(0x0FFF00) // green

        this.units = []
        this.players = 0
        this.enemies = 0

		// create sprites for players and enemies
		for (const unit of this.unitIds){
            let row
            let column

            if (unit.type == 'Player') {
                this.players++
                row = this.players
                column = 250
            } else {
                this.enemies++
                row = this.enemies
                column = 450
            }

			const sprite = new Unit(this, column, row * 50, unit.name, null, unit.type, unit.hp, unit.damage);
       		sprite.setScale(unit.scale)
        	this.add.existing(sprite);
			this.units.push(sprite)
		}


        // Add healthbars
        for (const unit of this.units) {
            unit.healthbar = new Healthbar(this, unit)
            unit.endTurn()
        }

        // Player action text and event tracker
        w = this.input.keyboard.addKey('w')
        this.add.text(this.units[0].x, this.units[0].y + 100, 'W: Attack')

        // turn order index tracker
        this.turn = 0
        this.units[this.turn].activeTurn()
    }

    update() {
        // Dont update during this time
        if (timeout) return

        const current_unit = this.units[this.turn]

        // perform actions of all units
        if (current_unit.type === 'Player'){
            if (w.isDown){
                current_unit.attack(this.units[1])
                this.nextUnit()
            }
        } else {
            timeout = true
            setTimeout(() => {
                current_unit.attack(this.units[0])
                this.nextUnit()
                timeout = false
            }, 1000)

        }

    }

}

export default BattleScene;