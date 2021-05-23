const { MessageEmbed } = require('discord.js')
const fs = require('fs')
const { join } = require('path')
module.exports = {
  event: 'messageReactionAdd',
  async execute (client, log, [r, u], { config, Ticket, Setting }) {
    if (r.partial) {
      try {
        await r.fetch()
      } catch (err) {
        log.error(err)
        // err)
        return
      }
    }

    const panelID = await Setting.findOne({ where: { key: 'panel_msg_id' } })
    if (!panelID) return

    if (r.message.id !== panelID.get('value')) return

    if (u.id === client.user.id) return

    if (r.emoji.name !== config.panel.reaction && r.emoji.id !== config.panel.reaction) return

    const channel = r.message.channel

    const supportRole = channel.guild.roles.cache.get(config.staff_role)
    if (!supportRole) {
      return channel.send(
        new MessageEmbed()
          .setColor(config.err_colour)
          .setTitle('<:8_:829543245348339752> |  **Error**')
          .setDescription(`${config.name} Não foi configurado corretamente. Não foi possível encontrar o cargo de suporte com o ID \`${config.staff_role}\``)
          .setFooter('Sistema de suporte | ' + channel.guild.name, channel.guild.iconURL())
      )
    }

    // everything is cool

    await r.users.remove(u.id) // effectively cancel reaction

    const tickets = await Ticket.findAndCountAll({
      where: {
        creator: u.id,
        open: true
      },
      limit: config.tickets.max
    })

    if (tickets.count >= config.tickets.max) {
      const ticketList = []
      for (const t in tickets.rows) {
        const desc = tickets.rows[t].topic.substring(0, 30)
        ticketList
          .push(`<#${tickets.rows[t].channel}>: \`${desc}${desc.length > 30 ? '...' : ''}\``)
      }
      const dm = u.dmChannel || await u.createDM()

      try {
        return dm.send(
          new MessageEmbed()
            .setColor(config.err_colour)
            .setAuthor(u.username, u.displayAvatarURL())
            .setTitle(`<:8_:829543245348339752> | **Você já tem ${tickets.count} ticket aberto**`)
            .setDescription(`Utilize o comando \`${config.prefix}close\` para fechar tickets desnecessários.\n\n${ticketList.join(',\n')}`)
            .setFooter(channel.guild.name, channel.guild.iconURL())
        )
      } catch (e) {
        const m = await channel.send(
          new MessageEmbed()
            .setColor(config.err_colour)
            .setAuthor(u.username, u.displayAvatarURL())
            .setTitle(`<:8_:829543245348339752> | **Você já tem ${tickets.count} ticket aberto**`)
            .setDescription(`Utilize o comando \`${config.prefix}close\` para fechar tickets desnecessários.\n\n${ticketList.join(',\n')}`)
            .setFooter(channel.guild.name + ' | Esta mensagem será deletada automaticamente em 15 segundos', channel.guild.iconURL())
        )
        return m.delete({ timeout: 15000 })
      }
    }

    const topic = config.tickets.default_topic.command

    const ticket = await Ticket.create({
      channel: '',
      creator: u.id,
      open: true,
      archived: false,
      topic: topic
    })

    const name = u.username + '-' + ticket.id

    channel.guild.channels.create(name, {
      type: 'text',
      topic: `${u} | ${topic}`,
      parent: config.tickets.category,
      permissionOverwrites: [{
        id: channel.guild.roles.everyone,
        deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
      },
      {
        id: client.user,
        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY']
      },
      {
        id: channel.guild.member(u),
        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY']
      },
      {
        id: supportRole,
        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY']
      }
      ],
      reason: 'User requested a new support ticket channel (panel reaction)'
    }).then(async c => {
      Ticket.update({
        channel: c.id
      }, {
        where: {
          id: ticket.id
        }
      })

      // require('../modules/archive').create(client, c); // create files

      let ping
      switch (config.tickets.ping) {
        case 'staff':
          ping = `<@&${config.staff_role}>, `
          break
        case false:
          ping = ''
          break
        default:
          ping = `@${config.tickets.ping}, `
      }

      await c.send(ping + `${u}`)

      if (config.tickets.send_img) {
        const images = fs.readdirSync(join(__dirname, '../../user/images'))
        await c.send({
          files: [
            join(__dirname, '../../user/images', images[Math.floor(Math.random() * images.length)])
          ]
        })
      }

      const text = config.tickets.text
        .replace(/{{ ?name ?}}/gmi, u.username)
        .replace(/{{ ?(tag|mention) ?}}/gmi, u)

      const w = await c.send(
        new MessageEmbed()
          .setColor(config.colour)
          .setAuthor('Suporte de ' + u.username, u.displayAvatarURL())
          .setDescription(text)
          .addField('<:14:829543245784023050> | Topico:', `\`${topic}\``)
          .setFooter('Sistema de suporte | ' + channel.guild.name, channel.guild.iconURL())
      )

      if (config.tickets.pin) await w.pin()
      // await w.pin().then(m => m.delete()); // oopsie, this deletes the pinned message

      if (config.logs.discord.enabled) {
        client.channels.cache.get(config.logs.discord.channel).send(
          new MessageEmbed()
            .setColor(config.colour)
            .setAuthor(u.username, u.displayAvatarURL())
            .setTitle('Novo ticket criado (via painel)')
            .setDescription(`\`${topic}\``)
            .addField('Criador', u, true)
            .addField('Canal', c, true)
            .setFooter('Sistema de suporte | ' + channel.guild.name, channel.guild.iconURL())
            .setTimestamp()
        )
      }

      log.info(`${u.tag} criou um novo ticket (#${name}) via painel`)
      // `**[` + currentHour + ":" + currentMin + `]** ${u.tag} criou um novo ticket (#${name}) via painel`)
    }).catch(log.error)
  }
}
