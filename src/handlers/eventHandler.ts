import path from 'node:path'
import { Client } from 'discord.js'
import { getAllFiles } from '../utils/getAllFiles'

export async function eventHandler(client: Client) {
	const eventFiles = getAllFiles(path.join(__dirname, '../events'))

	for (const eventFile of eventFiles) {
		const { default: event } = await import(eventFile)

		if (event.once) {
			client.once(event.name, async (...args) => event.execute(...args))
		} else {
			client.on(event.name, async (...args) => event.execute(...args))
		}
	}
}
