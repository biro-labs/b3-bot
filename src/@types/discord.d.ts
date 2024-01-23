import { Collection, APIApplicationCommand } from 'discord.js'

// export interface SlashCommand {
// 	command: SlashCommandBuilder
// 	execute: (interaction: ChatInputCommandInteraction) => void
// 	autocomplete?: (interaction: AutocompleteInteraction) => void
// 	modal?: (interaction: ModalSubmitInteraction<CacheType>) => void
// 	cooldown?: number // in seconds
// }

// export interface Command {
// 	name: string
// 	execute: (message: Message, args: Array<string>) => void
// 	permissions: Array<PermissionResolvable>
// 	aliases: Array<string>
// 	cooldown?: number
// }
export interface LocalCommand extends APIApplicationCommand {
	deleted?: boolean
	[key: string]: any
}

declare module 'discord.js' {
	export interface Client {
		commands: Collection<string, Command>
	}
}
