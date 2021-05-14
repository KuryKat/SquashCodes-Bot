

const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'stats',
	description: 'Visualiza as estatísticas gerais dos tickets',
	usage: '',
	aliases: ['data', 'statistics'],
	
	args: false,
	async execute(client, message, _args, _log, { config, Ticket }) {
		const guild = client.guilds.cache.get(config.guild);

		let open = await Ticket.count({ where: { open: true } });
		let closed = await Ticket.count({ where: { open: false } });

		message.channel.send(
			new MessageEmbed()
				.setColor(config.colour)
				.setTitle('<:35:829543246316699698> | Estatísticas de suporte')
				.addField('Tickets abertos', open, true)
				.addField('Tickets fechados', closed, true)
				.addField('Total de tickets', open + closed, true)
				.setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
		);
	}
};