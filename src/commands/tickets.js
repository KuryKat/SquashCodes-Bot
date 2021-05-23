
const { MessageEmbed } = require('discord.js')
const fs = require('fs')
const { join } = require('path')

module.exports = {
  name: 'tickets',
  description: 'Lista seus tickets recentes para acessar seus transcripts.',
  usage: '[@user]',
  aliases: ['list'],
  args: false,
  async execute (client, message, args, _log, { config, Ticket }) {
    const guild = client.guilds.cache.get(config.guild)

    const supportRole = guild.roles.cache.get(config.staff_role)
    if (!supportRole) {
      return message.channel.send(
        new MessageEmbed()
          .setColor(config.err_colour)
          .setTitle('<:8_:829543245348339752> |  **Error**')
          .setDescription(`${config.name} Não foi configurado corretamente. Não foi possível encontrar o cargo de suporte com o ID \`${config.staff_role}\``)
          .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
      )
    }

    let context = 'self'
    let user = message.mentions.users.first() || guild.members.cache.get(args[0])

    if (user) {
      if (!message.member.roles.cache.has(config.staff_role)) {
        return message.channel.send(
          new MessageEmbed()
            .setColor(config.err_colour)
            .setAuthor(message.author.username, message.author.displayAvatarURL())
            .setTitle('<:8_:829543245348339752> | Sem permissão')
            .setDescription('Você não tem permissão de listar os tickets de outros membros.')
            .addField('Como usar', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
            .addField('Ajuda', `Digite \`${config.prefix}ajuda ${this.name}\` para mais informações`)
            .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
        )
      }

      context = 'staff'
    } else user = message.author

    const openTickets = await Ticket.findAndCountAll({
      where: {
        creator: user.id,
        open: true
      }
    })

    const closedTickets = await Ticket.findAndCountAll({
      where: {
        creator: user.id,
        open: false
      }
    })

    closedTickets.rows = closedTickets.rows.slice(-10) // get most recent 10

    const embed = new MessageEmbed()
      .setColor(config.colour)
      .setAuthor(user.username, user.displayAvatarURL())
      .setTitle(`${context === 'self' ? 'Seus' : user.username + '\'s'} tickets`)
      .setFooter('Sistema de suporte | ' + guild.name + ' | Esta mensagem será deletada em 60 segundos', guild.iconURL())

    /* if (config.transcripts.web.enabled) {
embed.setDescription(`You can access all of your ticket archives on the [web portal](${config.transcripts.web.server}/${user.id}).`);
 */

    const open = []
    const closed = []

    for (const t in openTickets.rows) {
      const desc = openTickets.rows[t].topic.substring(0, 30)
      open.push(`> <#${openTickets.rows[t].channel}>: \`${desc}${desc.length > 20 ? '...' : ''}\``)
    }

    for (const t in closedTickets.rows) {
      const desc = closedTickets.rows[t].topic.substring(0, 30)
      let transcript = ''
      const c = closedTickets.rows[t].channel
      if (config.transcripts.web.enabled || fs.existsSync(join(__dirname, `../../user/transcripts/text/${c}.txt`))) {
        transcript = `\n> Digite \`${config.prefix}transcript ${closedTickets.rows[t].id}\` para visualizar.`
      }

      closed.push(`> **#${closedTickets.rows[t].id}**: \`${desc}${desc.length > 20 ? '...' : ''}\`${transcript}`)
    }

    const pre = context === 'self' ? 'Você tem' : user.username + ' tem'
    embed.addField('Tickets abertos', openTickets.count === 0 ? `${pre} nenhum ticket aberto.` : open.join('\n\n'), false)
    embed.addField('Tickets fechados', closedTickets.count === 0 ? `${pre} nenhum ticket fechado.` : closed.join('\n\n'), false)

    message.delete({ timeout: 15000 })

    let channel
    try {
      channel = message.author.dmChannel || await message.author.createDM()
      message.channel.send('<:50:829690849591427083> | Enviado via **DM**!').then(msg => msg.delete({ timeout: 15000 }))
    } catch (e) {
      channel = message.channel
    }

    const m = await channel.send(embed)
    m.delete({ timeout: 60000 })
  }
}
