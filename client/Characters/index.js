import Chexter from "./Chexter";
import Oyster from "./Oyster";

const characters = {
	Chexter,
	Oyster
}

// make animation configs have character name built in
for (const key in characters){
	const character = characters[key]
	const newAnim = {}
	// replace animation config name with adding the character name
	for (const anim in character.animFrames){
		const newConfig = character.animFrames[anim]
		const newName = anim + character.name

		newConfig.defaultTextureKey = character.name
		newConfig.key = newName

		newAnim[newName] = newConfig
	}

	character.animFrames = newAnim
}

export {
	Chexter,
	Oyster
}