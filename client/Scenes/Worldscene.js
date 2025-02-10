import { Scene } from "phaser";

let w
let a
let s
let d

class WorldScene extends Scene {

    constructor (sprites) {
        super({key: 'WorldScene'})
        this.sprites = sprites
    }

    startText () {
        this.enemy.destroy()
        this.scene.pause('WorldScene')
        this.scene.launch('Textbox')
    }

    preload () {
        this.load.image('limestone', 'assets/Limestone.png')
		for (const sprite of this.sprites){
            if (sprite.image) this.load.image(sprite.name, sprite.image)
            else if (sprite.spritesheet) this.load.spritesheet(sprite.name, sprite.spritesheet, sprite.framesize)
		}
    }

    create () {
        this.limestone = this.add.tileSprite(0, 0, 1000, 1000, 'limestone').setOrigin(0)

        const player = this.player = this.physics.add.sprite(50, 50, this.sprites[0].name)
        player.setScale(this.sprites[0].scale)

        player.setCollideWorldBounds(true);

        const enemy = this.enemy = this.physics.add.sprite(200, 200, this.sprites[1].name)
        enemy.setScale(this.sprites[1].scale)

        // move to battlescene when player and enemy collide
        this.physics.add.collider(player, enemy, this.startText, null, this)

        // keyboard inputs for movement
        w = this.input.keyboard.addKey('w')
        a = this.input.keyboard.addKey('a')
        s = this.input.keyboard.addKey('s')
        d = this.input.keyboard.addKey('d')

        // animations for Chexter
        player.forwards = true
        this.anims.create({
            key: 'frontMove',
            defaultTextureKey: 'chexter',
            frames: [
                {frame: 1},
                {frame: 2}
            ],
            frameRate: 10
        })
        this.anims.create({
            key: 'backMove',
            defaultTextureKey: 'chexter',
            frames: [
                {frame: 4},
                {frame: 5}
            ],
            frameRate: 10
        })
    }

    update() {
        const player = this.player

        // player movement and orientation
        if (w.isDown){
            player.setVelocityY(-100)
            player.forwards = false
        } else if (s.isDown){
            player.setVelocityY(100)
            player.forwards = true
        } else {
            player.setVelocityY(0)
        }
        if (a.isDown){
            player.setVelocityX(-100)
            player.setFlipX(true)
        } else if (d.isDown){
            player.setVelocityX(100)
            player.setFlipX(false)
        } else {
            player.setVelocityX(0)
        }

        // player animation
        if (player.body.velocity.x == 0 && player.body.velocity.y == 0){
            if (player.forwards) player.setFrame(0)
            else player.setFrame(3)
        } else {
            if (player.forwards) player.anims.play('frontMove', true)
            else player.anims.play('backMove', true)
        }
    }

}

export default WorldScene;