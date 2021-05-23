
const { MessageEmbed } = require('discord.js')
const fs = require('fs')
const { join } = require('path')
const archive = require('../modules/archive')

module.exports = {
  name: 'close',
  description: 'Fecha um ticket específico (mencionando o canal) ou o canal onde o comando foi executado.',
  usage: '[ticket]',
  aliases: ['fechar'],
  example: 'close #suporte-17',
  args: false,
  async execute (client, message, _args, log, { config, Ticket }) {
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
    // || client.channels.resolve(await Ticket.findOne({ where: { id: args[0] } }).channel) // channels.fetch()

    if (!channel) {
      channel = message.channel

      ticket = await Ticket.findOne({
        where: {
          channel: channel.id
        }
      })
      if (!ticket) return message.channel.send(notTicket)
    } else {
      ticket = await Ticket.findOne({
        where: {
          channel: channel.id
        }
      })
      if (!ticket) {
        notTicket
          .setTitle('<:8_:829543245348339752> | O canal não é um ticket')
          .setDescription(`${channel} não é um canal de suporte.`)
        return message.channel.send(notTicket)
      }
    }

    const paths = {
      text: join(__dirname, `../../user/transcripts/text/${ticket.get('channel')}.txt`),
      log: join(__dirname, `../../user/transcripts/raw/${ticket.get('channel')}.log`),
      json: join(__dirname, `../../user/transcripts/raw/entities/${ticket.get('channel')}.json`)
    }

    if (message.author.id !== ticket.creator && !message.member.roles.cache.has(config.staff_role)) {
      return message.channel.send(
        new MessageEmbed()
          .setColor(config.err_colour)
          .setAuthor(message.author.username, message.author.displayAvatarURL())
          .setTitle('<:8_:829543245348339752> | Sem permissão')
          .setDescription('Você não tem permissão para fechar este canal.')
          .addField('Como usar', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
          .addField('Ajuda', `Digite \`${config.prefix}ajuda ${this.name}\` para mais informações`)
          .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
      )
    }

    if (config.commands.close.confirmation) {
      let success
      const pre = fs.existsSync(paths.text) || fs.existsSync(paths.log)
        ? `Você poderá visualizar este ticket novamente utilizando o comando \`${config.prefix}transcript ${ticket.id}\``
        : ''

      const confirm = await message.channel.send(
        new MessageEmbed()
          .setColor(config.colour)
          .setAuthor(message.author.username, message.author.displayAvatarURL())
          .setTitle('<:21:829543246073298964> | Tem certeza?')
          .setDescription(`${pre}\n**Reaja abaixo para confirmar esta ação.**`)
          .setFooter('Sistema de suporte | ' + guild.name + ' |  Expira em 15 segundos', guild.iconURL())
      )

      await confirm.react('829543245318193182')

      const collector = confirm.createReactionCollector(
        (r, u) => r.emoji.id === '829543245318193182' && u.id === message.author.id, {
          time: 15000
        })

      collector.on('collect', async () => {
        if (channel.id !== message.channel.id) {
          channel.send(
            new MessageEmbed()
              .setColor(config.colour)
              .setAuthor(message.author.username, message.author.displayAvatarURL())
              .setTitle('**Ticket fechado**')
              .setDescription(`Ticket fechado por ${message.author}`)
              .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
          )
        }

        confirm.reactions.removeAll()
        confirm.edit(
          new MessageEmbed()
            .setColor(config.colour)
            .setAuthor(message.author.username, message.author.displayAvatarURL())
            .setTitle(`<:37:829543246286815242> | **Ticket ${ticket.id} fechado**`)
            .setDescription('As mensagens sendo arquivadas, este canal será fechado em poucos segundos.')
            .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
        )

        if (channel.id !== message.channel.id) {
          message.delete({
            timeout: 5000
          }).then(() => confirm.delete())
        }

        success = true
        close()
      })

      collector.on('end', () => {
        if (!success) {
          confirm.reactions.removeAll()
          confirm.edit(
            new MessageEmbed()
              .setColor(config.err_colour)
              .setAuthor(message.author.username, message.author.displayAvatarURL())
              .setTitle('<:8_:829543245348339752> | Tempo expirado')
              .setDescription('Você demorou demais para reagir, confirmação mal-sucedida.')
              .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL()))

          message.delete({
            timeout: 10000
          }).then(() => confirm.delete())
        }
      })
    } else {
      close()
    }

    async function close () {
      const users = []

      if (config.transcripts.text.enabled || config.transcripts.web.enabled) {
        let u = await client.users.fetch(ticket.creator)
        if (u) {
          let dm
          try {
            dm = u.dmChannel || await u.createDM()
          } catch (e) {
            log.warn(`Não foi possivel criar uma dm com ${u.tag}`)
          }

          const res = {}
          const embed = new MessageEmbed()
            .setColor(config.colour)
            .setAuthor(message.author.username, message.author.displayAvatarURL())
            .setTitle(`Ticket ${ticket.id}`)
            .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())

          if (fs.existsSync(paths.text)) {
            const element = client.users.cache.get(ticket.creator)
            const file = `../../user/transcripts/text/${ticket.channel}.txt`
            embed.addField('Mensagens arquivadas', 'Verifique o anexo')
            if (element) {
              res.files = [
                {
                  attachment: join(__dirname, file),
                  name: `${element.username}-${ticket.id}-${ticket.channel}.txt`
                }
              ]
            } else {
              res.files = [
                {
                  attachment: join(__dirname, file),
                  name: `suporte-${ticket.id}-${ticket.channel}.txt`
                }
              ]
            }
          }

          if (fs.existsSync(paths.log) && fs.existsSync(paths.json)) {
            const data = JSON.parse(fs.readFileSync(paths.json))
            for (u in data.entities.users) users.push(u)
            embed.addField('Web archive', await archive.export(Ticket, channel)) // this will also delete these files
          }

          if (embed.fields.length < 1) {
            embed.setDescription(`Nenhuma mensagem foi arquivada para o ticket #${ticket.id}`)
          }

          res.embed = embed

          try {
            if (config.commands.close.send_transcripts) dm.send(res)
            if (config.transcripts.channel.length > 1) client.channels.cache.get(config.transcripts.channel).send(res)
          } catch (e) {
            message.channel.send('<:8_:829543245348339752> | Não foi possível enviar a mensagem na DM!')
          }
        }
      }

      // update database
      ticket.update({
        open: false
      }, {
        where: {
          channel: channel.id
        }
      })

      // delete channel
      channel.delete({
        timeout: 5000
      })

      log.info(`${message.author.tag} fechou o ticket (#ticket-${ticket.id})`)
      // `**[` + currentHour + ":" + currentMin + `]** ${message.author.tag} fechou o ticket (#ticket-${ticket.id})`)

      if (config.logs.discord.enabled) {
        const embed = new MessageEmbed()
          .setColor(config.colour)
          .setAuthor(message.author.username, message.author.displayAvatarURL())
          .setTitle(`Ticket ${ticket.id} fechado`)
          .addField('Criador', `<@${ticket.creator}>`, true)
          .addField('Fechado por', message.author, true)
          .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
          .setTimestamp()

        if (users.length > 1) { embed.addField('Membros', users.map(u => `<@${u}>`).join('\n')) }

        client.channels.cache.get(config.logs.discord.channel).send(embed)
      }
    }
  }
}
