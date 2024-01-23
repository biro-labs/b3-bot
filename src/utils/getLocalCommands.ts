import path from 'node:path'
import { getAllDirectories } from './getAllDirectories'
import { getAllFiles } from './getAllFiles'
import { LocalCommand } from '../@types/discord'

export async function getLocalCommands() {
	const localCommands: LocalCommand[] = []

	const commandCategories = getAllDirectories(
		path.join(__dirname, '../commands'),
	)

	for (const category of commandCategories) {
		const commandFiles = getAllFiles(category)

		for (const file of commandFiles) {
			const { default: command } = await import(file)

			localCommands.push(command)
		}
	}

	return localCommands
}
