

const { MessageEmbed } = require('discord.js');
const { staff_role } = require('../../user/config');

module.exports = {
	name: 'clear',
	description: 'Limpa as mensagens do canal onde o comando foi executado',
	usage: '[quantidade]',
	aliases: ["clean", "limpar", "limpe", "clearchannel", "clearmessages", "clearmensagens", "cleanchannel", "cleanmessages", "deletarmensagens"],
	example: 'clear 20',
	args: true,
    permission: 'MANAGE_MESSAGES',

	async execute(client, message, args, _log, { config, Ticket }) {
		const guild = client.guilds.cache.get(config.guild);
        if(!message.member.roles.cache.has(config.staff_role)) return message.channel.send(
            new MessageEmbed()
                .setColor(config.err_colour)
                .setAuthor(message.author.username, message.author.displayAvatarURL())
                .setTitle('<:8_:829543245348339752> | Sem permissão')
                .setDescription('Você não tem permissão para limpar as mensagens desse canal.')
                .addField('Como usar', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
                .addField('Ajuda', `Digite \`${config.prefix}ajuda ${this.name}\` para mais informações`)
                .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
        );

        const qtd = Number(args[0])

        if(isNaN(qtd) || qtd > 100 || qtd < 2) return message.channel.send(
            new MessageEmbed()
                .setColor(config.err_colour)
                .setAuthor(message.author.username, message.author.displayAvatarURL())
                .setTitle('<:8_:829543245348339752> | Quantidade inválida! ')
                .setDescription('Quantidade de mensagens inválida, o valor deve ser entre 2 e 100 mensagens!')
                .addField('Como usar', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
                .addField('Ajuda', `Digite \`${config.prefix}ajuda ${this.name}\` para mais informações`)
                .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
        );
        
        await message.channel.messages.fetch({ limit: qtd }).then(async messages => {
            await message.channel.bulkDelete(messages.filter(m => !m.pinned)).then(() => { return message.channel.send(`Chat limpo por **${message.author}**!`) })
            if (qtd - messages.size > 0) messages.channel.send(`**${qtd-messages.size}** mensagens não foram deletadas pois tinham mais de duas semanas!`)
        });

	}
};
