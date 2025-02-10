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

class Healthbar extends GameObjects.Graphics{

    constructor(scene, unit) {
        super(scene)

        const unitWidth = unit.width * unit.scale
        const unitHeight = unit.height * unit.scale

        this.x = unit.x - 45
        this.y = unit.y - ((unitHeight) / 2)

        this.lineStyle(2, 0xffffff);
        this.fillStyle(0x0FFF00, 1); // green
        
        this.strokeRect(0, 0, 90, 5);
        this.fillRect(0, 0, 90, 5);

        this.unit = unit

        scene.add.existing(this)
    }

    update(){
        // calculate missing hp
        let ratio = (this.unit.maxHp - this.unit.hp) / this.unit.maxHp

        // cant miss more than 100% of hp
        if (ratio > 1) ratio = 1

        this.fillStyle(0x0FFF00, 1); // green
        this.fillRect(0, 0, 90, 5);

        this.fillStyle(0xFF0000, 1) // red
        this.fillRect(0 + (90 * (1 - ratio)), 0, 90 * ratio, 5);
    }

}

class BattleScene extends Scene {

    constructor (units) {
        super({key: 'BattleScene'})
        this.unitIds = units
    }

    toWorld () {
        this.scene.switch('WorldScene')
    }

    // end current unit's turn and move to next
    nextUnit () {
        this.units[this.turn].endTurn()

        this.turn = this.turn + 1
        if (this.turn === this.units.length) this.turn = 0

        this.units[this.turn].activeTurn()
    }

    removeUnit (index) {
        const unit = (this.units.splice(index, 1))[0]
        unit.healthbar.destroy()
        unit.destroy()
    }

    preload () {
		for (const unit of this.unitIds){
            if (unit.image) this.load.image(unit.name, unit.image)
            else if (unit.spritesheet) this.load.spritesheet(unit.name, unit.spritesheet, unit.framesize)
		}
    }

    create () {
        this.cameras.main.setBackgroundColor(0x0FFF00) // green

        this.limestone = this.add.tileSprite(0, 0, 800, 600, 'limestone').setOrigin(0.1, -0.1).setScale(3, 2)

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
                column = 550
            }

			const sprite = new Unit(this, column, row * 50 + 300, unit.name, null, unit.type, unit.hp, unit.damage);
       		sprite.setScale(unit.scale * 5)
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

        // animations for Chexter
        this.anims.create({
            key: 'bendKnees',
            defaultTextureKey: 'chexter',
            frames: [
                {frame: 0},
                {frame: 9}
            ],
            frameRate: 10
        })
        this.anims.create({
            key: 'flailArms',
            defaultTextureKey: 'chexter',
            frames: [
                {frame: 6},
                {frame: 7},
            ],
            frameRate: 20
        })

        
        // animations for cracker
        this.anims.create({
            key: 'spinJump',
            defaultTextureKey: 'cracker',
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
        })

    }

    update() {
        const current_unit = this.units[this.turn]

        // Dont update during this time
        if (timeout){
            this.units[0].anims.play('flailArms', true)
            return
        } 

        // perform actions of all units
        if (current_unit.type === 'Player'){
            current_unit.anims.play('bendKnees', true)
            this.units[1].play('spinJump', true)
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

        // check if each unit has not health left
        for (let i = 0; i < this.units.length; i++){
            if (this.units[i].hp <= 0){
                this.removeUnit(i)
            }
        }

        // return to world if no enemy
        let noEnemy = true

        for (let unit of this.units){
            if (unit.type === 'Enemy'){
                noEnemy = false
            }
        }

        if (noEnemy){
            this.toWorld()
        }

    }

}

export default BattleScene;