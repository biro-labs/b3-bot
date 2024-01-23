import {
	ApplicationCommandManager,
	Client,
	GuildApplicationCommandManager,
} from 'discord.js'

export async function getApplicationCommands(client: Client, guildId: string) {
	let applicationCommands:
		| GuildApplicationCommandManager
		| ApplicationCommandManager

	if (guildId) {
		const guild = await client.guilds.fetch(guildId)
		applicationCommands = guild.commands
	} else {
		applicationCommands = await client.application!.commands
	}

	// @ts-expect-error params are optional in documentation
	await applicationCommands.fetch()
	return applicationCommands
}
