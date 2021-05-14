
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'rename',
	description: 'Renomear um canal de ticket',
	usage: '<novo nome>',
	aliases: ['renomear'],
	example: 'rename suporte-importante',
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

		if (!message.member.roles.cache.has(config.staff_role))
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('<:8_:829543245348339752> | Sem permissão')
						.setDescription('Você não tem permissão para renomear este canal.')
						.addField('Como usar', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
						.addField('Ajuda', `Digite \`${config.prefix}ajuda ${this.name}\` para mais informações`)
						.setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
			);

		message.channel.setName(args.join(' ') + '-' + ticket.id); // new channel name

		message.channel.send(
			new MessageEmbed()
				.setColor(config.colour)
				.setAuthor(message.author.username, message.author.displayAvatarURL())
				.setTitle('<:25:829543246081818634> | Ticket atualizado')
				.setDescription('O nome foi atualizado.')
				.setFooter(client.user.username, client.user.displayAvatarURL())
		);
	}
};
