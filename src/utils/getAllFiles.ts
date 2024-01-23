import fs from 'node:fs'
import path from 'node:path'

export function getAllFiles(directory: string) {
	const fileNames: string[] = []
  
	const files = fs.readdirSync(directory, { withFileTypes: true })

	for (const file of files) {
		const filePath = path.join(directory, file.name)

		if (file.isFile()) {
			fileNames.push(filePath)
		}
	}

	return fileNames
}
