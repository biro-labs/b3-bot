import { Client, Events, GatewayIntentBits } from 'discord.js'
import Cron from 'croner'
import { env } from './env'
import { eventHandler } from './handlers/eventHandler'
import { postNewReleases } from './jobs/postNewReleases'

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.on(Events.InteractionCreate, async (interaction) => {
	if (interaction.isChatInputCommand()) {
		return
	}
})

eventHandler(client)

Cron('@hourly', async () => {
	console.log('Searching for new releases...')

	postNewReleases(client).then(() => {
		console.log('Finished looking for releases.')
	})
})

// BELOW CODE WILL DELETE EVERY COMMAND
// const rest = new REST().setToken(env.TOKEN)

// rest
// 	.put(
// 		Routes.applicationGuildCommands(
// 			env.CLIENT_ID,
// 			env.GUILD_ID,
// 		),
// 		{ body: [] },
// 	)
// 	.then(() => console.log('Successfully deleted all guild commands.'))
// 	.catch(console.error)

// rest
// 	.put(Routes.applicationCommands(env.CLIENT_ID), { body: [] })
// 	.then(() => console.log('Successfully deleted all application commands.'))
// 	.catch(console.error)

client.login(env.TOKEN)
