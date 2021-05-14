

const { MessageEmbed } = require('discord.js');
module.exports = {
	name: 'ajuda',
	description: 'Menu de ajuda',
	usage: '[comando]',
	aliases: ['command', 'commands', 'comandos', 'help'],
	example: 'ajuda suporte',
	args: false,
	execute(client, message, args, log, { config }) {
		const guild = client.guilds.cache.get(config.guild);

		const commands = Array.from(client.commands.values());

		if (!args.length) {
			let cmds = [];

			for (let command of commands) {
				if (command.hide || command.disabled) continue;
				if (command.permission && !message.member.hasPermission(command.permission)) continue;

				let desc = command.description;

				if (desc.length > 50) desc = desc.substring(0, 50) + '...';
				cmds.push(`**${config.prefix}${command.name}** **·** ${desc}`);
			}
			message.react('829690849591427083')
			message.author.send(
				new MessageEmbed()
					.setTitle('<:10:829543245922304041> | Comandos disponíveis')
					.setColor(config.colour)
					.setDescription(
						`\nListando os comandos que você tem acesso abaixo. Utilize o comando \`${config.prefix}ajuda [comando]\` para mais informações sobre um comando específico
						\n${cmds.join('\n\n')}
						\nAbra um ticket de suporte caso você precise de mais ajuda.`
					)
					.setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
			).catch((error) => {
				log.warn('Não foi possível enviar o painel de ajuda');
				//`**[` + currentHour + ":" + currentMin + `]** Não foi possível enviar o painel de ajuda`)
				log.error(error);
				//error)

			});

		} else {
			const name = args[0].toLowerCase();
			const command = client.commands.get(name) || client.commands.find(c => c.aliases && c.aliases.includes(name));

			if (!command)
				return message.channel.send(
					new MessageEmbed()
						.setColor(config.err_colour)
						.setDescription(`<:8_:829543245348339752> | Nome do comando inválido! **(\`${config.prefix}ajuda\`)**`)
				);


			const cmd = new MessageEmbed()
				.setColor(config.colour)
				.setTitle(command.name);


			if (command.long) cmd.setDescription(command.long);
			else cmd.setDescription(command.description);

			if (command.aliases) cmd.addField('Sinônimos', `\`${command.aliases.join(', ')}\``, true);

			if (command.usage) cmd.addField('Como usar', `\`${config.prefix}${command.name} ${command.usage}\``, false);

			if (command.usage) cmd.addField('Exemplo', `\`${config.prefix}${command.example}\``, false);


			if (command.permission && !message.member.hasPermission(command.permission)) {
				cmd.addField('Permissão requerida', `\`${command.permission}\` <:8_:829543245348339752> | Você não tem permissão para utilizar este comando!`, true);
			} else cmd.addField('Permissão requerida', `\`${command.permission || 'none'}\``, true);

			message.channel.send(cmd);
		}

		// command ends here
	},
};