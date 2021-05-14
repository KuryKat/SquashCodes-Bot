

const {
	MessageEmbed
} = require('discord.js');
const fs = require('fs');
const { join } = require('path');

module.exports = {
	name: 'delete',
	description: 'Deleta um ticket. Similar a fechar um ticket, porém não arquiva nenhuma mensagem',
	usage: '[ticket]',
	aliases: ['del', 'deletar'],
	example: 'delete #suporte-17',
	args: false,
	async execute(client, message, _args, log, { config, Ticket }) {
		const guild = client.guilds.cache.get(config.guild);

		const notTicket = new MessageEmbed()
			.setColor(config.err_colour)
			.setAuthor(message.author.username, message.author.displayAvatarURL())
			.setTitle('<:8_:829543245348339752> | Este não é um canal de suporte!')
			.setDescription('Use este comando em um canal de suporte, ou mencione o canal.')
			.addField('Como usar', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
			.addField('Ajuda', `Digite \`${config.prefix}ajuda ${this.name}\` para mais informações`)
			.setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())

		let ticket;
		let channel = message.mentions.channels.first();
		// || client.channels.resolve(await Ticket.findOne({ where: { id: args[0] } }).channel) // channels.fetch()

		if (!channel) {
			channel = message.channel;

			ticket = await Ticket.findOne({
				where: {
					channel: channel.id
				}
			});
			if (!ticket) return channel.send(notTicket);

		} else {
			ticket = await Ticket.findOne({
				where: {
					channel: channel.id
				}
			});
			if (!ticket) {
				notTicket
				.setTitle('<:8_:829543245348339752> | O canal não é um ticket')
				.setDescription(`${channel} não é um canal de suporte.`);
				return message.channel.send(notTicket);
			}

		}
		if (message.author.id !== ticket.creator && !message.member.roles.cache.has(config.staff_role))
			return channel.send(
				new MessageEmbed()
				.setColor(config.err_colour)
				.setAuthor(message.author.username, message.author.displayAvatarURL())
				.setTitle('<:8_:829543245348339752> | Sem permissão')
				.setDescription('Você não tem permissão para deletar este canal.')
				.addField('Como usar', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
				.addField('Ajuda', `Digite \`${config.prefix}ajuda ${this.name}\` para mais informações`)
				.setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
			);

		
		if (config.commands.delete.confirmation) {
			let success;
			let confirm = await message.channel.send(
				new MessageEmbed()
					.setColor(config.colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('<:21:829543246073298964> | Tem certeza?')
					.setDescription(
						`<:8_:829543245348339752> | Esta ação é **irreversível**, o ticket será completamente removido do banco de dados. Você ** não ** será capaz de visualizar as mensagens arquivadas / transcripts do canal depois.
						\nUtilize o comando \`close\` se você deseja apenas fechar o ticket.\n**Reaja abaixo para confirmar esta ação**`)
					.setFooter('Sistema de suporte | ' + guild.name + ' | Expira em 15 segundos', guild.iconURL())
			);

			await confirm.react('829543245318193182');

			const collector = confirm.createReactionCollector(
				(r, u) => r.emoji.id === '829543245318193182' && u.id === message.author.id, {
					time: 15000
				});

			collector.on('collect', async () => {
				if (channel.id !== message.channel.id)
					channel.send(
						new MessageEmbed()
							.setColor(config.colour)
							.setAuthor(message.author.username, message.author.displayAvatarURL())
							.setTitle('**Ticket deletado**')
							.setDescription(`Ticket deletado por ${message.author}`)
							.setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
					);

				confirm.reactions.removeAll();
				confirm.edit(
					new MessageEmbed()
						.setColor(config.colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle(`<:37:829543246286815242> | **Ticket ${ticket.id} deletado**`)
						.setDescription('Este canal será automaticamente deletado em poucos segundos.')
						.setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
				);

				if (channel.id !== message.channel.id)
					message.delete({
						timeout: 5000
					}).then(() => confirm.delete());

				success = true;
				del();
			});

			collector.on('end', () => {
				if (!success) {
					confirm.reactions.removeAll();
					confirm.edit(
						new MessageEmbed()
							.setColor(config.err_colour)
							.setAuthor(message.author.username, message.author.displayAvatarURL())
							.setTitle('<:8_:829543245348339752> | Tempo expirado')
							.setDescription('Você demorou demais para reagir, confirmação mal-sucedida.')
							.setFooter('Sistema de suporte | ' + guild.name, guild.iconURL()));

					message.delete({
						timeout: 10000
					}).then(() => confirm.delete());
				}
			});
		} else {
			del();
		}


		async function del () {
			let txt = join(__dirname, `../../user/transcripts/text/${ticket.get('channel')}.txt`),
				raw = join(__dirname, `../../user/transcripts/raw/${ticket.get('channel')}.log`),
				json = join(__dirname, `../../user/transcripts/raw/entities/${ticket.get('channel')}.json`);

			if (fs.existsSync(txt)) fs.unlinkSync(txt);
			if (fs.existsSync(raw)) fs.unlinkSync(raw);
			if (fs.existsSync(json)) fs.unlinkSync(json);

			// update database
			ticket.destroy(); // remove ticket from database

			// channel
			channel.delete({
				timeout: 5000
			});


			log.info(`${message.author.tag} Deletou um ticket (#suporte-${ticket.id})`);
			//`**[` + currentHour + ":" + currentMin + `]** ${message.author.tag} Deletou um ticket (#suporte-${ticket.id})`)

			if (config.logs.discord.enabled) {
				client.channels.cache.get(config.logs.discord.channel).send(
					new MessageEmbed()
						.setColor(config.colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle('Ticket deletado')
						.addField('Criador', `<@${ticket.creator}>`, true)
						.addField('Deletado por', message.author, true)
						.setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
						.setTimestamp()
				);
			}
		}
		
	}
};