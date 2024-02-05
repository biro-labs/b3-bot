import dayjs from 'dayjs'
import {
	ChatInputCommandInteraction,
	ForumChannel,
	SlashCommandBuilder,
	ThreadChannel,
} from 'discord.js'
import { getRepositoryReleases } from '../../services/getRepositoryRelease'
import { env } from '../../env'

export type Release = {
	html_url: string
	name: string
	publised_at: string
	body: string
	prerelease: boolean
}

const releasesCommand = {
	data: new SlashCommandBuilder()
		.setName('releases')
		.setDescription('Fetch all releases.'),

	async execute(interaction: ChatInputCommandInteraction) {
		const response: string[] = []
		const client = interaction.client

		const channels = client.channels.cache.get(
			env.RELEASE_CHANNEL_ID,
		) as unknown as ForumChannel

		const { threads } = channels.toJSON() as unknown as { threads: string[] }

		if (!threads.length) {
			return interaction.reply({
				content:
					'## Monitored repositories not found.\nType `/monitor <owner/repository>` to start monitoring a repository.',
			})
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

			const releasesData =
				await getRepositoryReleases<Release[]>(repositoryName)

			const lastRelease = releasesData.find((release) => !release.prerelease)

			if (!lastRelease) {
				response.push(`- There were no releases found for ${repositoryName}\n`)

				continue
			}

			const [lastMessage] = (await thread.messages.fetch({ limit: 1 })).toJSON()

			if (lastMessage) {
				const regex = /\[(.*?)\]/
				const [_, lastVersion] = regex.exec(lastMessage.content) ?? []

				if (lastVersion) {
					if (lastVersion === lastRelease.name) {
						response.push(
							`- Latest version of ${repositoryName} is already posted at: ${thread.url}\n`,
						)

						continue
					}

					// const createdThread = await channels.threads.create({
					// 	name: thread.name,
					// 	message: {
					// 		content: `## Releases from:\nhttps://github.com/${repositoryName}`,
					// 	},
					// })

					const formattedBody =
						lastRelease.body.length >= 1800
							? `${lastRelease.body.substring(0, 1800)}...`
							: lastRelease.body

					thread.send(
						`# [${lastRelease.name}](${
							lastRelease.html_url
						})\n**Publised:** ${dayjs(lastRelease.publised_at).format(
							'dddd, DD/MM/YYYY',
						)}\n${formattedBody}`,
					)

					response.push(
						`- New release from ${repositoryName}, find out more about here: ${thread.url}\n`,
					)
				}
			}
		}

		const contentResponse = response.join('')

		return interaction.reply({ content: contentResponse, ephemeral: true })
	},
}

export default releasesCommand
