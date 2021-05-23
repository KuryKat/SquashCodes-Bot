
const { MessageEmbed } = require('discord.js')
module.exports = {
  name: 'remove',
  description: 'Remove um membro de um canal de suporte',
  usage: '<@user> [... #canal]',
  aliases: ['remover'],
  example: 'remove @user #suporte-23',
  args: true,
  async execute (client, message, args, log, { config, Ticket }) {
    const guild = client.guilds.cache.get(config.guild)

    const notTicket = new MessageEmbed()
      .setColor(config.err_colour)
      .setAuthor(message.author.username, message.author.displayAvatarURL())
      .setTitle('<:8_:829543245348339752> | Este não é um canal de suporte!')
      .setDescription('Use este comando em um canal de suporte, ou mencione o canal.')
      .addField('Como usar', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
      .addField('Ajuda', `Digite \`${config.prefix}ajuda ${this.name}\` para mais informações`)
      .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())

    let ticket

    let channel = message.mentions.channels.first()

    if (!channel) {
      channel = message.channel
      ticket = await Ticket.findOne({ where: { channel: message.channel.id } })
      if (!ticket) { return message.channel.send(notTicket) }
    } else {
      ticket = await Ticket.findOne({ where: { channel: channel.id } })
      if (!ticket) {
        notTicket
          .setTitle('<:8_:829543245348339752> | O canal não é um ticket')
          .setDescription(`${channel} não é um canal de suporte.`)
        return message.channel.send(notTicket)
      }
    }

    if (message.author.id !== ticket.creator && !message.member.roles.cache.has(config.staff_role)) {
      return message.channel.send(
        new MessageEmbed()
          .setColor(config.err_colour)
          .setAuthor(message.author.username, message.author.displayAvatarURL())
          .setTitle('<:8_:829543245348339752> | Sem permissão')
          .setDescription('Você não tem permissão para remover um usuário deste canal.')
          .addField('Como usar', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
          .addField('Ajuda', `Digite \`${config.prefix}ajuda ${this.name}\` para mais informações`)
          .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
      )
    }

    const member = guild.member(message.mentions.users.first() || guild.members.cache.get(args[0]))

    if (!member || member.id === message.author.id || member.id === guild.me.id) {
      return message.channel.send(
        new MessageEmbed()
          .setColor(config.err_colour)
          .setAuthor(message.author.username, message.author.displayAvatarURL())
          .setTitle('<:8_:829543245348339752> | Usuário inválido')
          .setDescription('Por favor mencione uma pessoa válida.')
          .addField('Como usar', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
          .addField('Ajuda', `Digite \`${config.prefix}ajuda ${this.name}\` para mais informações`)
          .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
      )
    }

    try {
      channel.updateOverwrite(member.user, {
        VIEW_CHANNEL: false,
        SEND_MESSAGES: false,
        ATTACH_FILES: false,
        READ_MESSAGE_HISTORY: false
      })

      if (channel.id !== message.channel.id) {
        channel.send(
          new MessageEmbed()
            .setColor(config.colour)
            .setAuthor(member.user.username, member.user.displayAvatarURL())
            .setTitle('**<:37:829543246286815242> | Membro removido**')
            .setDescription(`${member} foi removido por ${message.author}`)
            .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
        )
      }

      message.channel.send(
        new MessageEmbed()
          .setColor(config.colour)
          .setAuthor(member.user.username, member.user.displayAvatarURL())
          .setTitle('<:37:829543246286815242> | Membro removido')
          .setDescription(`${member} foi removido do suporte <#${ticket.channel}>`)
          .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
      )

      log.info(`${message.author.tag} removeu um usuário do ticket (#${message.channel.id})`)
      // `**[` + currentHour + ":" + currentMin + `]** ${message.author.tag} removeu um usuário do ticket (#${message.channel.id})`)
    } catch (error) {
      log.error(error)
      // error)
    }
  }
}
