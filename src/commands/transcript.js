
const fs = require('fs')
const { join } = require('path')

const {
  MessageEmbed
} = require('discord.js')

module.exports = {
  name: 'transcript',
  description: 'Visualiza as mensagens arquivadas de um ticket anterior',
  usage: '<ticket-id>',
  aliases: ['archive', 'download', 'arquivos'],
  example: 'transcript 57',
  args: true,
  async execute (client, message, args, _log, { config, Ticket }) {
    const guild = client.guilds.cache.get(config.guild)
    const id = args[0]

    const ticket = await Ticket.findOne({
      where: {
        id: id,
        open: false
      }
    })

    if (!ticket) {
      return message.channel.send(
        new MessageEmbed()
          .setColor(config.err_colour)
          .setAuthor(message.author.username, message.author.displayAvatarURL())
          .setTitle('<:8_:829543245348339752> | Ticket inválido')
          .setDescription('Não foi possível encontrar nenhum ticket com este ID')
          .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
      )
    }

    if (message.author.id !== ticket.creator && !message.member.roles.cache.has(config.staff_role)) {
      return message.channel.send(
        new MessageEmbed()
          .setColor(config.err_colour)
          .setAuthor(message.author.username, message.author.displayAvatarURL())
          .setTitle('<:8_:829543245348339752> | Sem permissão')
          .setDescription(`Você não tem permissão para visualizar o ticket **${id}**`)
          .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
      )
    }

    const res = {}
    const embed = new MessageEmbed()
      .setColor(config.colour)
      .setAuthor(message.author.username, message.author.displayAvatarURL())
      .setTitle(`Ticket ${id}`)
      .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())

    const file = `../../user/transcripts/text/${ticket.channel}.txt`
    if (fs.existsSync(join(__dirname, file))) {
      const element = client.users.cache.get(ticket.creator)
      embed.addField('Mensagens arquivadas', 'Visualize o anexo')
      if (element) {
        res.files = [
          {
            attachment: join(__dirname, file),
            name: `${element.username}-${id}-${ticket.channel}.txt`
          }
        ]
      } else {
        res.files = [
          {
            attachment: join(__dirname, file),
            name: `suporte-${id}-${ticket.channel}.txt`
          }
        ]
      }
    }

    message.react('829690849591427083')

    const BASE_URL = config.transcripts.web.server
    if (config.transcripts.web.enabled) embed.addField('Web archive', `${BASE_URL}/${ticket.creator}/${ticket.channel}`)

    if (embed.fields.length < 1) embed.setDescription(`Nenhuma mensagem arquivada foi encontra para o ticket ${id}`)

    res.embed = embed

    let channel
    try {
      channel = message.author.dmChannel || await message.author.createDM()
    } catch (e) {
      channel = message.channel
    }

    channel.send(res).then(m => {
      if (channel.id === message.channel.id) m.delete({ timeout: 15000 })
    })
    message.delete({ timeout: 1500 })
  }
}
