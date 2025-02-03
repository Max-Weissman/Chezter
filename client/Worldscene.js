import { Scene, GameObjects } from "phaser";

let w
let a
let s
let d

class WorldScene extends Scene {

    constructor (sprites) {
        super({key: 'WorldScene'})
        this.sprites = sprites
    }

    toBattle () {
        this.enemy.destroy()
        this.scene.switch('BattleScene')
    }

    preload () {
		for (const sprite of this.sprites){
            if (sprite.image) this.load.image(sprite.name, sprite.image)
		}
    }

    create () {
        this.limestone = this.add.tileSprite(0, 0, 1000, 1000, 'limestone').setOrigin(0).setScrollFactor(0)

        this.player = this.physics.add.sprite(50, 50, this.sprites[0].name)
        this.player.setScale(this.sprites[0].scale)

        this.player.setCollideWorldBounds(true);

        this.enemy = this.physics.add.sprite(200, 200, this.sprites[1].name)
        this.enemy.setScale(this.sprites[1].scale)

        // move to battlescene when player and enemy collide
        this.physics.add.collider(this.player, this.enemy, this.toBattle, null, this)

        w = this.input.keyboard.addKey('w')
        a = this.input.keyboard.addKey('a')
        s = this.input.keyboard.addKey('s')
        d = this.input.keyboard.addKey('d')
    }

    update() {
        // player movement
       if (w.isDown){
        this.player.setVelocityY(-100)
       } else if (s.isDown){
        this.player.setVelocityY(100)
       } else {
        this.player.setVelocityY(0)
       }
       if (a.isDown){
        this.player.setVelocityX(-100)
       } else if (d.isDown){
        this.player.setVelocityX(100)
       } else {
        this.player.setVelocityX(0)
       }

    }

}

export default WorldScene;