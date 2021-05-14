
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'eval',
	description: 'eval',
	usage: '',
	aliases: [],
  permission: 'ADMINISTRATOR',
	
	args: false,
	async execute(client, message, args, _log, { config, Ticket }) {
    const evalContent = args.join(' ')
    const evalEmbed = new MessageEmbed()
      .setAuthor(message.author.username, message.author.displayAvatarURL())
      .setTimestamp()
      .setFooter(`Gerenciamento ${client.user.username}`, client.user.displayAvatarURL())
    if(!evalContent) return message.reply('insira um valor válido!')
    try {
      evalEmbed.setColor(config.colour)
      evalEmbed.addFields(
        { name: '<:29:829543246195589130> Input', value: `\`\`\`${evalContent}\`\`\`` },
        { name: '<:28:829543246174617600> Output', value:  `\`\`\`${`${eval(evalContent)}`.slice(0, 1000)}\`\`\``}
      )
    } catch (err) {
      evalEmbed.setColor(config.err_colour)
      evalEmbed.addFields(
        { name: '<:29:829543246195589130> Input', value: `\`\`\`${evalContent}\`\`\`` },
        { name: '<:28:829543246174617600> Output', value: `\`\`\`${err}\`\`\`` }
      )
    }
    
    const msg = await message.channel.send(evalEmbed)
    msg.react('829543246119436328')
    const filter = (react, user) => react.emoji.id === '829543246119436328' && config.owners.includes(user.id)
    const collector = msg.createReactionCollector(filter, { time: 600000 })
        collector.on('collect', (react, user) => {
          msg.edit(`<:27:829543246119436328> Este eval foi trancado!`, { embed: null })
          const reaction = msg.reactions.cache.find(react => react.emoji.id === '829543246119436328')
          if(reaction) reaction.users.remove(client.user.id)
        })
	}
};