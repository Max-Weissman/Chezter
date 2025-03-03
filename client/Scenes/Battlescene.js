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

    attack(target, preAttack, postAttack){
        // pause update during attacks
        timeout = true

        const player = this.type === 'Player'
        let quickTime = 1

        // attackbar animation for player
        if (player){
            const attackBar = this.attackBar

            attackBar.show()

            this.scene.tweens.add({
                targets: this.attackBar.attackArrow,
                ease: 'linear',
                x: '+=85',
                duration: preAttack,
                onComplete: () => {
                    attackBar.hide()
                    attackBar.attackArrow.x -= 85
                }
            })

            const timer = Date.now()

            // check when w key is released for quick time multiplier
            w.on('up', () => {
                const time = Date.now() - timer

                if (time > preAttack / 3 && time < preAttack * 2 / 3) {
                    quickTime = 2
                } else {
                    w.off('up')
                }
            })

            setTimeout(() => {
                w.off('up')
            }, preAttack)
        }

        // animation to move sprites when attacking
        const x = '+=200'
        const reverseX = '-=200'

        this.scene.tweens.chain({
            targets: this,
            ease: 'linear',
            tweens: [
                {
                    x: player ? x : reverseX,
                    duration: preAttack,
                    rotation: 0.25
                }, {
                    x: player ? reverseX : x,
                    duration: postAttack,
                    rotation: 0
                }
            ],
        })

        // take damage when attack hits
        setTimeout(() => {
            target.takeDamage(this.damage * quickTime)
            setTimeout(() => {
                this.scene.nextUnit()
                timeout = false
            }, postAttack)
        }, preAttack)

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

class Attackbar extends GameObjects.Graphics{

    constructor(scene, unit) {
        super(scene)

        const unitHeight = unit.height * unit.scale

        this.x = unit.x - 45
        this.y = unit.y - ((unitHeight) / 2) - 50

        this.lineStyle(2, 0xffffff);
        this.fillStyle(0x0FFF00, 1); // green
        
        this.strokeRect(0, 0, 90, 5);
        this.fillRect(0, 0, 90, 5);

        this.fillStyle(0x0000FF, 1); // blue
        this.fillRect(30, 0, 30, 5)

        this.attackArrow = new Attackarrow(scene, unit)

        this.unit = unit

        this.hide()
        scene.add.existing(this)
        scene.add.existing(this.attackArrow)
    }

    hide () {
        this.setVisible(false)
        this.attackArrow.setVisible(false)
    }

    show () {
        this.setVisible(true)
        this.attackArrow.setVisible(true)
    }
}

class Attackarrow extends GameObjects.Graphics{

    constructor(scene, unit) {
        super(scene)

        const unitHeight = unit.height * unit.scale

        this.x = unit.x - 45
        this.y = unit.y - ((unitHeight) / 2) - 55

        this.fillStyle(0x000000, 1); // black
        
        this.fillRect(0, 0, 5, 8);
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
            sprite.name = unit.name
            sprite.animFrames = Object.keys(unit.animFrames)
       		sprite.setScale(unit.scale * 5)

        	this.add.existing(sprite);
			this.units.push(sprite)

            // add animations
            for (const key in unit.animFrames){
                this.anims.create(unit.animFrames[key])
            }
		}

        // Add healthbars
        for (const unit of this.units) {
            unit.healthbar = new Healthbar(this, unit)

            if (unit.type === 'Player'){
                unit.attackBar = new Attackbar(this, unit)
            }
            
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
        const current_unit = this.units[this.turn]
       
        // play all animations
        for (const unit of this.units){
            // attack animations occur on units turn when attacking
            if (timeout && current_unit === unit && unit.animFrames.includes('attack' + unit.name)){
                unit.anims.play('attack' + unit.name, true)
            } else {
                unit.anims.play('idle' + unit.name, true)
            }
        }

        // Dont update during this time
        if (timeout){
            return
        } 

        // perform actions of all units
        if (current_unit.type === 'Player'){
            if (w.isDown){
                current_unit.attack(this.units[1], 1000, 500) 
            }
        } else {
            current_unit.attack(this.units[0], 1000, 1000)
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