import fs from 'node:fs'
import path from 'node:path'

export function getAllDirectories(directory: string) {
	const directoryNames: string[] = []
	const directories = fs.readdirSync(directory, { withFileTypes: true })

	for (const file of directories) {
		const directoryPath = path.join(directory, file.name)

		if (file.isDirectory()) {
			directoryNames.push(directoryPath)
		}
	}

	return directoryNames
}
