
const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'add',
  description: 'Adiciona um membro em um canal de suporte',
  usage: '<@user> [... #canal]',
  aliases: ['adicionar'],
  example: 'add @user #suporte-23',
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
      if (!ticket) return message.channel.send(notTicket)
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
          .setDescription('Você não tem permissão para adicionar um usuário a este canal.')
          .addField('Como usar', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
          .addField('Ajuda', `Digite \`${config.prefix}ajuda ${this.name}\` para mais informações`)
          .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
      )
    }

    const member = guild.member(message.mentions.users.first() || guild.members.cache.get(args[0]))

    if (!member) {
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
        VIEW_CHANNEL: true,
        SEND_MESSAGES: true,
        ATTACH_FILES: true,
        READ_MESSAGE_HISTORY: true
      })

      if (channel.id !== message.channel.id) {
        channel.send(
          new MessageEmbed()
            .setColor(config.colour)
            .setAuthor(member.user.username, member.user.displayAvatarURL())
            .setTitle('**<:37:829543246286815242> | Membro adicionado**')
            .setDescription(`${member} foi adicionado no canal por ${message.author}`)
            .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
        )
      }

      message.channel.send(
        new MessageEmbed()
          .setColor(config.colour)
          .setAuthor(member.user.username, member.user.displayAvatarURL())
          .setTitle('**<:37:829543246286815242> | Membro adicionado**')
          .setDescription(`${member} foi adicionado ao canal <#${ticket.channel}>`)
          .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
      )

      log.info(`${message.author.tag} adicionou um usuario no ticket (#${message.channel.id})`)
      // `**[` + currentHour + ":" + currentMin + `]** ${message.author.tag} adicionou um usuario no ticket (#${message.channel.id})`)
    } catch (error) {
      log.error(error)
      // error)
    }
    // command ends here
  }
}
