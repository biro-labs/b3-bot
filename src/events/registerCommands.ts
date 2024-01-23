import { Client, Events } from 'discord.js'
import { env } from '../env'

import { getLocalCommands } from '../utils/getLocalCommands'
import { getApplicationCommands } from '../utils/getApplicationCommands'
import { areCommandsDifferent } from '../utils/areCommandsDifferent'

const registerCommands = {
	name: Events.ClientReady,
	execute: async (client: Client) => {
		try {
			const localCommands = await getLocalCommands()

			const applicationCommands = await getApplicationCommands(
				client,
				env.GUILD_ID,
			)

			for (const localCommand of localCommands) {
				const {
					name,
					name_localizations,
					description,
					description_localizations,
					default_member_permissions,
					dm_permission,
					options,
				} = localCommand.data

				const existingCommand = applicationCommands.cache.find(
					(command) => command.name === name,
				)

				if (existingCommand) {
					if (localCommand.deleted) {
						await applicationCommands.delete(existingCommand.id)

						console.log(
							`Skipping registering command "${name}" as it's set to delete.`,
						)

						continue
					}

					if (areCommandsDifferent(existingCommand, localCommand)) {
						await applicationCommands.edit(existingCommand.id, {
							description,
							options,
						})

						console.log(`Editing command: ${name}`)
					}
				} else {
					await applicationCommands.create({
						name,
						name_localizations,
						description,
						description_localizations,
						default_member_permissions,
						dm_permission,
						options,
					})

					console.log(`Registered command: ${name}`)
				}
			}
		} catch (err) {
			console.log('registerCommands > error', err)
		}
	},
}

export default registerCommands
