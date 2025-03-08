import { Scene, GameObjects } from "phaser";

const keyNames = ['a', 'd', 'space']
const keys = {}
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
        timeout = 'attack'

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
            keys.space.on('up', () => {
                const time = Date.now() - timer

                if (time > preAttack / 3 && time < preAttack * 2 / 3) {
                    quickTime = 2
                } else {
                    keys.space.off('up')
                }
            })

            setTimeout(() => {
                keys.space.off('up')
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
            let damage
            let stun = false

            if (player) {
                // use selected attack from buttons
                if (this.buttons){
                    const selectedButton = this.buttons.getChildren()[this.buttons.center]
                    const attack = selectedButton.attack
                    let increase = 1

                    if (this.increase){ // multiply damage by 2 and reduce turn count by 1
                        increase = 2
                        this.increase--
                    }

                    if (attack.effect){ // check attacks for effects
                        switch(attack.effect){
                            case 'reduce': // reduce damage by half
                                this.reduce = 3
                                break
                            case 'increase': // increase damage by x2
                                this.increase = 3
                                break
                            case 'stun': // stun enemy for one turn
                                if (Math.random() > 0.5) stun = true
                                break
                        }
                    }

                    
                    damage = attack.damage * selectedButton.alpha * increase
                }
            } else { // use selected projected attack
                const attack = this.selectedAttack
                let increase = 1

                if (this.increase){ // multiply damage by 2 and reduce turn count by 1
                    increase = 2
                    this.increase--
                }

                if (attack.effect){ // check attacks for effects
                    switch(attack.effect){
                        case 'increase': // increase damage by x2
                            this.increase = 3
                            break
                    }
                }

                damage = attack.damage * increase
                this.text.setText('')
            }

            target.takeDamage(damage * quickTime, stun)
            setTimeout(() => {
                if (!player) this.selectAttack()

                this.scene.nextUnit()
                timeout = false
            }, postAttack)
        }, preAttack)

    }

    takeDamage(damage, stun) {
        let reduce = 1
        if (this.reduce){
            reduce = 2
            this.reduce--
        }

        this.hp -= damage / reduce
        this.healthbar.update()

        if (stun){
            this.stunned = true
        }

        // lower opacity of attack if selected when hit by damaging attack
        const buttons = this.buttons
        if (damage && buttons){
            const children = buttons.getChildren()
            const selectedButton = children[buttons.center]

            // decreease number of uses by 1 
            selectedButton.uses--
            selectedButton.setAlpha(selectedButton.uses / selectedButton.attack.uses)
            
            if (!selectedButton.alpha){ // remove buttons with alpha (opacity) 0
                buttons.removeButton()
            }

            // update the active button based on changes
            buttons.activeButton()
        }
    }

    activeTurn(){
        this.clearTint()
    }

    endTurn(){
        this.setTint(0xffaaff, 0xffffff, 0xffffff, 0xffffff)
    }

    selectAttack() { // pick an attack and forecast it
        this.totalChance = this.attacks.reduce((prev, current) => {
            return prev + current.chance
        }, 0)
        let chance = Math.floor(Math.random() * this.totalChance)
        for (const attack of this.attacks){
            if (attack.chance - 1 >= chance){
                this.selectedAttack = attack
                break
            }
            chance -= attack.chance
        }

        this.text.setText(this.selectedAttack.description)
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

class Buttons extends GameObjects.Group{

    constructor(scene, unit) {
        const frames = 5

        super(scene, [{
            key: 'buttons',
            frame: Array(frames).fill(0).map((_, i) => i),
            setXY: {
                x: unit.x - ((frames - 1) / 2) * 100,
                y: unit.y - 150,
                stepX: 100
            }
        }])

        unit.attacks.forEach((attack, index) => {
            const button = this.getChildren()[index]
            button.attack = attack
            button.uses = attack.uses
        })

        this.frames = frames
        this.center = (frames - 1) / 2

        this.description = scene.add.text(unit.x, unit.y - 200, '', {color: 'black'})
        this.uses = scene.add.text(unit.x, unit.y - 125, '', {color: 'black'})
        this.activeButton()
    }

    right () { // move button coords when left or right
        const coords = this.getChildren().map(child => child.x)
        this.getChildren().forEach((child, index) => {
            if (index === 0){
                child.setX(coords[this.frames - 1])
            } else {
                child.setX(coords[index - 1])
            }
        })

        this.center++
        if (this.center >= this.frames) this.center = 0
        this.activeButton()
    }

    left () {
        const coords = this.getChildren().map(child => child.x)
        this.getChildren().forEach((child, index) => {
            if (index === this.frames - 1){
                child.setX(coords[0])
            } else {
                child.setX(coords[index + 1])
            }
        })

        this.center--
        if (this.center < 0) this.center = this.frames - 1
        this.activeButton()
    }

    activeButton () { // update text for active button
        const children = this.getChildren()
        children.forEach(child => child.setScale(1))

        const selectedButton = children[this.center]
        selectedButton.setScale(1.5)

        this.description.setText(selectedButton.attack.description)

        let used = `    ${selectedButton.uses}/${selectedButton.attack.uses} Uses`
        if (selectedButton.uses === Infinity) used = ''

        let effectiveness = Math.floor(selectedButton.uses / selectedButton.attack.uses * 100)
        if (isNaN(effectiveness)) effectiveness = 100

        this.uses.setText(`${effectiveness}% Effective${used}`)
    }

    removeButton () {
        let rightRemove = true
        if (this.frames % 2 === 0) rightRemove = false

        this.frames--

        const children = this.getChildren()
        const selectedButton = children[this.center]
        const coords = children.map(child => child.x)

        if (coords.indexOf(selectedButton.x) === coords.length - 1){ // center index resets to 0 if at end, otherwise stays the same
            this.center = 0
        }

        // shift left side to the center
        if (rightRemove){
            children.forEach((child, index) => {
                if (child.x > selectedButton.x){
                    let prevIndex = index - 1
                    if (prevIndex < 0) prevIndex = coords.length - 1
                    child.setX(coords[prevIndex])
                }
            })
        } else { //shift right side to the center
            children.forEach((child, index) => {
                if (child.x < selectedButton.x){
                    let nextIndex = index + 1
                    if (nextIndex > coords.length - 1) nextIndex = 0
                    child.setX(coords[nextIndex])
                }
            })
        }

        selectedButton.destroy()
    }
}

class BattleScene extends Scene {

    constructor (units) {
        super({key: 'BattleScene'})
        this.unitIds = units
    }

    toWorld () {
        this.scene.stop('BattleScene')
        this.scene.wake('WorldScene')
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
        this.load.spritesheet('buttons', 'assets/Buttons.png', {frameWidth: 32, frameHeight: 32 })
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
            sprite.attacks = unit.attacks
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
 
            // add attackbar and buttons
            if (unit.type === 'Player'){
                unit.attackBar = new Attackbar(this, unit)
                this.buttons = new Buttons(this, unit)
                unit.buttons = this.buttons
                this.add.existing(this.buttons)
            } else { // add enemy intent
                unit.text = this.add.text(unit.x, unit.y - 125, '', {color: 'black'})
                unit.selectAttack()
            }
            
            unit.endTurn()
        }

        // Player action text and event tracker
        for (const key of keyNames){
            keys[key] = this.input.keyboard.addKey(key)
        }

        // turn order index tracker
        this.turn = 0
        this.units[this.turn].activeTurn()
    }

    update() {
        const current_unit = this.units[this.turn]
       
        // play all animations
        for (const unit of this.units){
            // attack animations occur on units turn when attacking
            if (timeout === 'attack' && current_unit === unit && unit.animFrames.includes('attack' + unit.name)){
                unit.anims.play('attack' + unit.name, true)
            } else {
                unit.anims.play('idle' + unit.name, true)
            }
        }

        // Dont update during this time
        if (timeout){
            return
        }

        if (current_unit.stunned){ // lose a turn if stunned
            current_unit.stunned = false
            this.nextUnit()
            return
        }

        // perform actions of all units
        if (current_unit.type === 'Player'){
            if (keys.space.isDown){
                current_unit.attack(this.units[1], 1000, 500) 
            } else if (keys.a.isDown){
                timeout = true
                this.buttons.left()
                setTimeout(() => {
                    timeout = false
                }, 300)
            } else if (keys.d.isDown){
                timeout = true
                this.buttons.right()
                setTimeout(() => {
                    timeout = false
                }, 300)
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