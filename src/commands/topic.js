

const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'topic',
	description: 'Edita o tópico de um ticket',
	usage: '<topic>',
	aliases: ['topico'],
	example: 'topic preciso de ajuda',
	args: true,
	async execute(client, message, args, _log, { config, Ticket }) {
		const guild = client.guilds.cache.get(config.guild);

		let ticket = await Ticket.findOne({
			where: {
				channel: message.channel.id
			}
		});

		if (!ticket) {
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('<:8_:829543245348339752> | Este não é um canal de suporte!')
					.setDescription('Use este comando em um canal de suporte, ou mencione o canal.')
					.addField('Como usar', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
					.addField('Ajuda', `Digite \`${config.prefix}ajuda ${this.name}\` para mais informações`)
					.setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
			);
		}

		let topic = args.join(' ');
		if (topic.length > 256) {
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('<:8_:829543245348339752> | Descrição muito longa!')
					.setDescription('Por favor limite o tópico do seu ticket para 256 caracteres.')
					.setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
			);
		}

		message.channel.setTopic(`<@${ticket.creator}> | ` + topic);

		Ticket.update({
			topic: topic
		}, {
			where: {
				channel: message.channel.id
			}
		});

		message.channel.send(
			new MessageEmbed()
				.setColor(config.colour)
				.setAuthor(message.author.username, message.author.displayAvatarURL())
				.setTitle('<:25:829543246081818634> | Tópico atualizado')
				.setDescription('O tópico foi atualizado com sucesso.')
				.setFooter(client.user.username, client.user.displayAvatarURL())
		);
	}
};