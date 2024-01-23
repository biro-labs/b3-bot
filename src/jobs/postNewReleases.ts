import { Client, ForumChannel, ThreadChannel } from 'discord.js'
import { env } from '../env'
import { getRepositoryReleases } from '../services/getRepositoryRelease'
import { Release } from '../commands/utility/releases'
import dayjs from 'dayjs'

export async function postNewReleases(client: Client) {
	const releaseChannel = client.channels.cache.get(
		env.RELEASE_CHANNEL_ID,
	) as unknown as ForumChannel

	const { threads } = releaseChannel.toJSON() as unknown as {
		threads: string[]
	}

	if (!threads.length) {
		return
	}

	for (const threadId of threads) {
		const thread = client.channels.cache.get(
			threadId,
		) as unknown as ThreadChannel

		const repositoryName = thread.name
			.split(' ')
			.join('')
			.replace(/\|/g, '/')
			.toLowerCase()

		const releasesData = await getRepositoryReleases<Release[]>(repositoryName)

		const lastRelease = releasesData.find((release) => !release.prerelease)

		if (!lastRelease) {
			continue
		}

		const [lastMessage] = (await thread.messages.fetch({ limit: 1 })).toJSON()

		if (lastMessage) {
			const regex = /\[(.*?)\]/
			const [_, lastVersion] = regex.exec(lastMessage.content) ?? []

			if (lastVersion) {
				if (lastVersion === lastRelease.name) {
					continue
				}

				const formattedBody =
					lastRelease.body.length >= 4000
						? `${lastRelease.body.substring(0, 1800)}...`
						: lastRelease.body

				console.log(`New release found for ${repositoryName}`)

				thread.send(
					`# [${lastRelease.name}](${
						lastRelease.html_url
					})\n**Publised:** ${dayjs(lastRelease.publised_at).format(
						'dddd, DD/MM/YYYY',
					)}\n${formattedBody}`,
				)
			}
		}
	}
}
