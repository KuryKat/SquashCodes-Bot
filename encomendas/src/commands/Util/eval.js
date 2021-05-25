// eslint-disable-next-line no-unused-vars
const { Client, Message, MessageEmbed } = require('discord.js')

const { join } = require('path')
const config = require(join(__dirname, '../../../../user/', 'config.js'))
const { getUser } = require('../../utils/database/user')
const { Roles } = require('../../utils/enums')

module.exports = {
  names: ['eval', 'e'],
  help: {
    visible: false
  },
  /**
   *
   * @param {Client} client
   * @param {string[]} args
   * @param {Message} message
   */
  exe: async function (client, args, message) {
    const member = await getUser(message.author.id)
    if (member.details.role < Roles.OWNER) return

    const evalContent = args.join(' ')
    const evalEmbed = new MessageEmbed()
      .setAuthor(message.author.username, message.author.displayAvatarURL())
      .setTimestamp()
      .setFooter(`Gerenciamento ${client.user.username}`, client.user.displayAvatarURL())

    if (!evalContent) return message.reply('insira um valor válido!')
    try {
      evalEmbed.setColor(config.colour)
      evalEmbed.addFields(
        { name: '⬆️ Input', value: `\`\`\`js\n${evalContent}\`\`\`` },
        // eslint-disable-next-line no-eval
        { name: '⬇️ Output', value: `\`\`\`js\n${`${eval(evalContent)}`.slice(0, 1000)}\`\`\`` }
      )
    } catch (err) {
      evalEmbed.setColor(config.err_colour)
      evalEmbed.addFields(
        { name: '⬆️ Input', value: `\`\`\`js\n${evalContent}\`\`\`` },
        { name: '⬇️ Output', value: `\`\`\`js\n${err}\`\`\`` }
      )
    }

    const msg = await message.channel.send(evalEmbed)
    msg.react('🔒')
    const filter = (react, user) => react.emoji.name === '🔒' && config.owners.includes(user.id)
    const collector = msg.createReactionCollector(filter, { time: 600000 })
    collector.on('collect', (reaction) => {
      msg.edit('🔒 Este eval foi trancado!', { embed: null })
      reaction.remove()
    })
  }
}
