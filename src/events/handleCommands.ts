import { ChatInputCommandInteraction, Events } from 'discord.js'
import { getLocalCommands } from '../utils/getLocalCommands'

const handleCommands = {
	name: Events.InteractionCreate,
	execute: async (interaction: ChatInputCommandInteraction) => {
		const localCommands = await getLocalCommands()

		try {
			const commandObject = localCommands.find(
				(command) => command.data.name === interaction.commandName,
			)

			if (!commandObject) {
				return
			}

			await commandObject.execute(interaction)
		} catch (err) {
			console.log('handleCommands > error', err)
		}
	},
}

export default handleCommands
