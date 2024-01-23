export async function getRepositoryReleases<T>(repositoryName: string) {
	const data: T = await fetch(
		`https://api.github.com/repos/${repositoryName}/releases`,
	).then((response) => response.json())

	return data
}
