const { Collection, MessageEmbed } = require('discord.js')
const archive = require('../modules/archive')

module.exports = {
  event: 'message',
  async execute (client, log, [message], { config, Ticket, Setting }) {
    const guild = client.guilds.cache.get(config.guild)
    const ticket = await Ticket.findOne({ where: { channel: message.channel.id } })
    if (ticket) {
      archive.add(message) // add message to archive
      // Update the ticket updated at so closeall can get most recent
      ticket.changed('updatedAt', true)
      ticket.save()
    }

    if (message.author.bot || message.author.id === client.user.id) return // goodbye bots

    const regex = new RegExp(`^(<@!?${client.user.id}>|\\${config.prefix.toLowerCase()})\\s*`)
    if (!regex.test(message.content.toLowerCase())) return // not a command

    const [, prefix] = message.content.toLowerCase().match(regex)
    const args = message.content.slice(prefix.length).trim().split(/ +/)
    const commandName = args.shift().toLowerCase()
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

    if (!command || commandName === 'none') return // not an existing command

    if (message.guild.id !== guild.id) return message.reply(`Este bot só pode ser utilizado no servidor da  "${guild}"!`) // not in this server

    if (command.permission && !message.member.hasPermission(command.permission)) {
      log.console(`${message.author.tag} Tentou usar o comando '${command.name}' sem ter permissão para isso.`)
      // `**[` + currentHour + ":" + Date().getMinutes() + `]** ${message.author.tag} Tentou usar o comando '${command.name}' sem ter permissão para isso.`)
      return message.channel.send(
        new MessageEmbed()
          .setColor(config.err_colour)
          .setTitle('<:8_:829543245348339752> | Sem permissão!')
          .setDescription(`Você não tem permissão para usar o comando **\`${command.name}\`**! (Requer a permissão \`${command.permission}\`).`)
          .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
      )
    }

    if (command.args && !args.length) {
      return message.channel.send(
        new MessageEmbed()
          .setColor(config.err_colour)
          .addField('Como usar', `\`${config.prefix}${command.name} ${command.usage}\`\n`)
          .addField('Ajuda', `Digite \`${config.prefix}ajuda ${command.name}\` para mais informações`)
          .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
      )
    }

    if (!client.cooldowns.has(command.name)) client.cooldowns.set(command.name, new Collection())

    const now = Date.now()
    const timestamps = client.cooldowns.get(command.name)
    const cooldownAmount = (command.cooldown || config.cooldown) * 1000

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000
        log.console(`${message.author.tag} tentou usar o comando '${command.name}' antes do cooldown acabar`)
        // `**[` + currentHour + ":" + Date().getMinutes() + `]** ${message.author.tag} tentou usar o comando '${command.name}' antes do cooldown acabar`)
        return message.channel.send(
          new MessageEmbed()
            .setColor(config.err_colour)
            .setDescription(`<:8_:829543245348339752> | Aguarde ** ${timeLeft.toFixed(1)} ** segundos antes de usar o comando ** \`${command.name}\` ** novamente.`)
            .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
        )
      }
    }

    timestamps.set(message.author.id, now)
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)

    try {
      command.execute(client, message, args, log, { config, Ticket, Setting })
      log.console(`${message.author.tag} usou o comando '${command.name}'`)
      // `**[` + currentHour + ":" + Date().getMinutes() + `]** ${message.author.tag} usou o comando '${command.name}'`)
    } catch (error) {
      log.warn(`Um erro ocorreu ao executar o comando '${command.name}'`)
      // `**[` + currentHour + ":" + Date().getMinutes() + `]** Um erro ocorreu ao executar o comando '${command.name}'`)
      log.error(error)
      // '**[' + Date().getHours() + ":" + Date().getMinutes() + ']** ``` error ``` ')
      message.channel.send(`<:8_:829543245348339752> | Um erro ocorreu ao usar o comando \`${command.name}\` !.`)
    }
  }
}
