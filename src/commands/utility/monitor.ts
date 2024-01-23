import {
	ChatInputCommandInteraction,
	ForumChannel,
	SlashCommandBuilder,
} from 'discord.js'
import { capitalize } from '../../utils/capitalize'
import dayjs from 'dayjs'
import { env } from '../../env'
import { getRepositoryReleases } from '../../services/getRepositoryRelease'

type Release = {
	html_url: string
	name: string
	publised_at: string
	body: string
	prerelease: boolean
}

const monitorCommand = {
	data: new SlashCommandBuilder()
		.setName('monitor')
		.setDescription('Type which repository you want to monitor.')
		.addStringOption((option) =>
			option
				.setName('repository')
				.setDescription('Repository you want to monitor')
				.setRequired(true),
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const client = interaction.client

		const repositoryToMonitor = interaction.options
			.getString('repository')
			?.trim()
			.match(/.*\/.[^\\]+/g)
			?.join('')

		if (!repositoryToMonitor) {
			return interaction.reply({
				content:
					'## Incorrect repository formatting\nPlease make sure you followed the correct formatting: OWNER/REPOSITORY',
			})
		}

		const threadName = repositoryToMonitor
			.split('/')
			.map((word) => capitalize(word))
			.join(' | ')

		const channel = (await client.channels.fetch(
			env.RELEASE_CHANNEL_ID,
		)) as unknown as ForumChannel

		const duplicateThread = channel.threads.cache.find(
			(thread) => thread.name === threadName,
		)

		if (duplicateThread) {
			return interaction.reply({
				content: `## Duplicate repository\nThis repository is already being monitored here: ${duplicateThread.url}`,
			})
		}

		const releasesData = await getRepositoryReleases<Release[] | Error>(
			repositoryToMonitor,
		)

		if (releasesData instanceof Error) {
			return interaction.reply({
				content: `## ${releasesData.message}\nPlease make sure you typed the name correctly and followed the formatting: OWNER/REPOSITORY`,
			})
		}

		const lastRelease = releasesData.find((release) => !release.prerelease)

		if (!lastRelease) {
			return interaction.reply({
				content:
					'## No release found\nThere was no release found for this repository!',
			})
		}

		const createdThread = await channel.threads.create({
			name: threadName,
			message: {
				content: `## Releases from:\nhttps://github.com/${repositoryToMonitor}`,
			},
		})

		let formattedBody = lastRelease.body

		if (lastRelease.body.length >= 4000) {
			formattedBody = `${lastRelease.body.substring(0, 1800)}...`
		}

		createdThread.send(
			`# [${lastRelease.name}](${lastRelease.html_url})\n**Publised:** ${dayjs(
				lastRelease.publised_at,
			).format('dddd, DD/MM/YYYY')}\n${formattedBody}`,
		)

		return interaction.reply({
			content: `Monitoring ${repositoryToMonitor} at ${createdThread.url}`,
		})
	},
}

export default monitorCommand
