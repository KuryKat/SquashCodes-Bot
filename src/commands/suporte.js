

const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const { join } = require('path');
const config = require(join(__dirname, '../../user/', require('../').config));
module.exports = {
	name: 'suporte',
	description: 'Criar um novo ticket de suporte',
	usage: '[descrição curta]',
	aliases: ['ticket', 'open'],
	example: 'Servidor não inicia',
	args: false,
	disabled: !config.commands.new.enabled,
	async execute(client, message, args, log, { config, Ticket }) {

		if (!config.commands.new.enabled) return; // stop if the command is disabled


		const guild = client.guilds.cache.get(config.guild);

		const supportRole = guild.roles.cache.get(config.staff_role);
		
		if (!supportRole)
			return message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setTitle('<:8_:829543245348339752> |  **Error**')
					.setDescription(`${config.name} Não foi configurado corretamente. Não foi possível encontrar o cargo de suporte com o ID \`${config.staff_role}\``)
					.setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
			);


		let tickets = await Ticket.findAndCountAll({
			where: {
				creator: message.author.id,
				open: true
			},
			limit: config.tickets.max
		});

		if (tickets.count >= config.tickets.max) {
			let ticketList = [];
			for (let t in tickets.rows) {
				let desc = tickets.rows[t].topic.substring(0, 30);
				ticketList
					.push(`<#${tickets.rows[t].channel}>: \`${desc}${desc.length > 30 ? '...' : ''}\``);
			}

			let m = await message.channel.send(
				new MessageEmbed()
					.setColor(config.err_colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle(`<:8_:829543245348339752> |  Você já tem **${tickets.count}** ticket aberto.`)
					.setDescription(`Utilize ** \`${config.prefix}close\` ** para fechar tickets de suporte sem uso.\n\n${ticketList.join(',\n')}`)
					.setFooter('Sistema de suporte | ' + guild.name + ' | Esta mensagem será deletada automaticamente em 15 segundos', guild.iconURL())
			);

			return setTimeout(async () => {
				await message.delete();
				await m.delete();
			}, 15000);
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
		else if (topic.length < 1) {
			topic = config.tickets.default_topic.command;
		}

		let ticket = await Ticket.create({
			channel: '',
			creator: message.author.id,
			open: true,
			archived: false,
			topic: topic
		});

		let name = message.author.username + '-' + ticket.get('id');

		guild.channels.create(name, {
			type: 'text',
			topic: `${message.author} | ${topic}`,
			parent: config.tickets.category,
			permissionOverwrites: [{
				id: guild.roles.everyone,
				deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
			},
			{
				id: client.user,
				allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY']
			},
			{
				id: message.member,
				allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY']
			},
			{
				id: supportRole,
				allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY']
			}
			],
			reason: 'User requested a new support ticket channel'
		}).then(async c => {

			Ticket.update({
				channel: c.id
			}, {
				where: {
					id: ticket.id
				}
			});

			let m = await message.channel.send(
				new MessageEmbed()
					.setColor(config.colour)
					.setAuthor(message.author.username, message.author.displayAvatarURL())
					.setTitle('<:23:829543246027030609> | Ticket criado com sucesso ')
					.setDescription(`Seu ticket foi criado no canal: ${c}`)
					.setFooter('Sistema de suporte | ' + client.user.username + ' | Esta mensagem será deletada automaticamente em 15 segundos', client.user.displayAvatarURL())
			);

			setTimeout(async () => {
				await message.delete();
				await m.delete();
			}, 15000);

			// require('../modules/archive').create(client, c); // create files

			let ping;
			switch (config.tickets.ping) {
			case 'staff':
				ping = `<@&${config.staff_role}>, `;
				break;
			case false:
				ping = '';
				break;
			default:
				ping = `@${config.tickets.ping}, `;
			}

			await c.send(ping + `${message.author}`);

			if (config.tickets.send_img) {
				const images = fs.readdirSync(join(__dirname, '../../user/images'));
				await c.send({
					files: [
						join(__dirname, '../../user/images', images[Math.floor(Math.random() * images.length)])
					]
				});
			}

			let text = config.tickets.text
				.replace(/{{ ?name ?}}/gmi, message.author.username)
				.replace(/{{ ?(tag|mention) ?}}/gmi, message.author);


			let w = await c.send(
				new MessageEmbed()
					.setColor(config.colour)
					.setAuthor('Suporte de ' + message.author.username, message.author.displayAvatarURL())
					.setDescription(text)
					.addField('<:14:829543245784023050> | Topico: ', `\`${topic}\``)
					.setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
			);

			if (config.tickets.pin) await w.pin();
			// await w.pin().then(m => m.delete()); // oopsie, this deletes the pinned message

			if (config.logs.discord.enabled)
				client.channels.cache.get(config.logs.discord.channel).send(
					new MessageEmbed()
						.setColor(config.colour)
						.setAuthor(message.author.username, message.author.displayAvatarURL())
						.setTitle('Novo ticket')
						.setDescription(`\`${topic}\``)
						.addField('Criador', message.author, true)
						.addField('Canal', c, true)
						.setFooter('Sistema de suporte | ' +  guild.name, guild.iconURL())
						.setTimestamp()
				);

			log.info(`${message.author.tag} criou um novo ticket (#${name})`);
			//`**[` + currentHour + ":" + currentMin + `]** ${message.author.tag} criou um novo ticket (#${name})`)

		}).catch(log.error);

	},
};
