import { Scene, GameObjects, Input } from "phaser";

let timeout = false

class WorldScene extends Scene {

    constructor (conversation) {
        super({key: 'Textbox'})
        this.conversation = conversation
        timeout = false
        this.line = 0
    }

    toBattle () {
        this.scene.switch('BattleScene')
        this.scene.stop('Textbox')
    }

    nextLine () {
        this.line++
        const textLine = this.conversation[this.line]

        if (!textLine){
            this.toBattle()
            return
        }

        // change the text
        this.name.style.color = textLine.color
        this.text.style.color = textLine.color
        this.name.text = textLine.name
        this.text.text = textLine.text

        // update name container
        this.nameGraphics.clear()

        this.nameGraphics.lineStyle(10, 0xFFFFFF);
        this.nameGraphics.fillStyle(0x000000, 1); 

        this.nameGraphics.strokeRect(0, 0, this.name.width + 20, 25)
        this.nameGraphics.fillRect(0, 0, this.name.width + 20, 25)
    }

    resume () {
        timeout = false
    }

    create () {
        // first line
        const firstLine = this.conversation[this.line]
        this.name = this.add.text(10, 5, firstLine.name, { color: firstLine.color})
        this.text = this.add.text(10, 15, firstLine.text, { color: firstLine.color})

        // textbox outline
        const graphics = new GameObjects.Graphics(this)

        graphics.lineStyle(20, 0xFFFFFF);
        graphics.fillStyle(0x000000, 1); 
        
        graphics.strokeRect(0, 0, this.game.config.width - 100, 100);
        graphics.fillRect(0, 0, this.game.config.width - 100, 100);

        this.container = this.add.container(50, this.game.config.height - 150)
        this.container.add(graphics)

        // namebox outline
        this.nameGraphics = new GameObjects.Graphics(this)

        this.nameGraphics.lineStyle(10, 0xFFFFFF);
        this.nameGraphics.fillStyle(0x000000, 1); 

        this.nameGraphics.strokeRect(0, 0, this.name.width + 20, 25)
        this.nameGraphics.fillRect(0, 0, this.name.width + 20, 25)

        this.nameContainer = this.add.container(70, this.game.config.height - 170)
        this.nameContainer.add(this.nameGraphics)
        
        // add text to containers
        this.nameContainer.add(this.name)
        this.container.add(this.text)
    
        // input events for all keys
        this.keyCodes = []
        for (const key in Input.Keyboard.KeyCodes){
            const code = Input.Keyboard.KeyCodes[key]
            this.keyCodes.push(this.input.keyboard.addKey(code))
        }
    }

    update() {
        if (timeout) return

        const resume = this.resume
        
        // check if any key is pressed
        for (const key of this.keyCodes){
            if (key.isDown){
                this.nextLine()
                timeout = true
                setTimeout(resume, 500)
                return
            }
        }
    }

}

export default WorldScene;