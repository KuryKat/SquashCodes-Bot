
const { MessageEmbed } = require('discord.js')
const fs = require('fs')
const { join } = require('path')
const config = require(join(__dirname, '../../user/', require('../').config))
const archive = require('../modules/archive')
const { plural } = require('../modules/utils')
const { Op } = require('sequelize')
const toTime = require('to-time-monthsfork')
// A slight modification to the 'close' command to allow multiple tickets to be closed at once

module.exports = {
  name: 'closeall',
  description: 'Fecha todos os tickets abertos ou em um tempo especifico',
  usage: '[tepo]',
  aliases: ['fechartudo'],
  args: false,
  permission: 'MANAGE_GUILD',
  disabled: !config.commands.closeall.enabled,
  async execute (client, message, args, log, { config, Ticket }) {
    const guild = client.guilds.cache.get(config.guild)

    if (!message.member.roles.cache.has(config.staff_role)) {
      return message.channel.send(
        new MessageEmbed()
          .setColor(config.err_colour)
          .setAuthor(message.author.username, message.author.displayAvatarURL())
          .setTitle('<:8_:829543245348339752> | Sem permissão')
          .setDescription('Você não tem permissão para fechar os canais de suporte.')
          .addField('Como usar', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
          .addField('Ajuda', `Digite \`${config.prefix}ajuda ${this.name}\` para mais informações`)
          .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
      )
    }

    let tickets

    if (args.length > 0) {
      let time, maxDate
      const timestamp = args.join(' ')

      try {
        time = toTime(timestamp).milliseconds()
        maxDate = new Date(Date.now() - time)
      } catch (error) {
        return message.channel.send(
          new MessageEmbed()
            .setColor(config.err_colour)
            .setAuthor(message.author.username, message.author.displayAvatarURL())
            .setTitle('<:8_:829543245348339752> | **Timestamp inválido**')
            .setDescription(`O timestamp que você inseriur, \`${timestamp}\`, é invalido.`)
            .addField('Como usar', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
            .addField('Ajuda', `Digite \`${config.prefix}ajuda ${this.name}\` para mais informações`)
            .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
        )
      }

      tickets = await Ticket.findAndCountAll({
        where: {
          open: true,
          updatedAt: {
            [Op.lte]: maxDate
          }
        }
      })
    } else {
      tickets = await Ticket.findAndCountAll({
        where: {
          open: true
        }
      })
    }

    if (tickets.count === 0) {
      return message.channel.send(
        new MessageEmbed()
          .setColor(config.err_colour)
          .setAuthor(message.author.username, message.author.display)
          .setTitle('<:8_:829543245348339752> | Sem tickets abertos')
          .setDescription('Não há nenhum ticket aberto para fechar.')
          .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
      )
    }

    log.info(`Encontrei ${tickets.count} tickets abertos`)
    // `**[` + currentHour + ":" + currentMin + `]** Encontrei ${tickets.count} tickets abertos`)

    if (config.commands.close.confirmation) {
      let success
      const pre = config.transcripts.text.enabled || config.transcripts.web.enabled
        ? `Você poderá visualizar os tickets novamente utilizando o comando \`${config.prefix}transcript <id>\``
        : ''

      const confirm = await message.channel.send(
        new MessageEmbed()
          .setColor(config.colour)
          .setAuthor(message.author.username, message.author.displayAvatarURL())
          .setTitle(`<:21:829543246073298964> | Você tem certeza que deseja fechar **${tickets.count}** tickets?`)
          .setDescription(`${pre}\n**Reaja abaixo para confirmar esta ação.**`)
          .setFooter('Sistema de suporte | ' + guild.name + ' | Expira em 15 segundos', guild.iconURL())

      )

      await confirm.react('829543245318193182')

      const collector = confirm.createReactionCollector(
        (reaction, user) => reaction.emoji.id === '829543245318193182' && user.id === message.author.id, {
          time: 15000
        })

      collector.on('collect', async () => {
        message.channel.send(
          new MessageEmbed()
            .setColor(config.colour)
            .setAuthor(message.author.username, message.author.displayAvatarURL())
            .setTitle(`**\`${tickets.count}\` tickets fechados**`)
            .setDescription(`**\`${tickets.count}\`** tickets fechados por ${message.author}`)
            .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
        )

        confirm.reactions.removeAll()
        confirm.edit(
          new MessageEmbed()
            .setColor(config.colour)
            .setAuthor(message.author.username, message.author.displayAvatarURL())
            .setTitle(`<:37:829543246286815242> |  \`${tickets.count}\` tickets fechados`)
            .setDescription('Os canais serão deletados em poucos segundos, todas as mensagens estão sendo arquivadas.')
            .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
        )

        message.delete({
          timeout: 5000
        }).then(() => confirm.delete())

        success = true
        closeAll()
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
      closeAll()
    }

    async function closeAll () {
      tickets.rows.forEach(async ticket => {
        const users = []

        if (config.transcripts.text.enabled || config.transcripts.web.enabled) {
          const {
            channel,
            id,
            creator
          } = ticket

          const user = await client.users.fetch(creator)
          const paths = {
            text: join(__dirname, `../../user/transcripts/text/${channel}.txt`),
            log: join(__dirname, `../../user/transcripts/raw/${channel}.log`),
            json: join(__dirname, `../../user/transcripts/raw/entities/${channel}.json`)
          }

          if (user) {
            let dm
            try {
              dm = user.dmChannel || await user.createDM()
            } catch (e) {
              log.warn(`Não foi possivel criar uma dm com ${user.tag}`)
              // `**[` + currentHour + ":" + currentMin + `]** Não foi possivel criar uma dm com ${user.tag}`)
            }

            const res = {}
            const embed = new MessageEmbed()
              .setColor(config.colour)
              .setAuthor(message.author.username)
              .setTitle(`Ticket ${id}`)
              .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())

            if (fs.existsSync(paths.text)) {
              const element = client.users.cache.get(ticket.creator)
              const file = `../../user/transcripts/text/${ticket.channel}.txt`
              embed.addField('Mensagens arquivadas', 'Verifique o anexo')
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

            if (fs.existsSync(paths.log) && fs.existsSync(paths.json)) {
              const data = JSON.parse(fs.readFileSync(paths.json))
              for (const u in data.entities.users) users.push(u)
              embed.addField('Web archive', await archive.export(Ticket, channel))
            }

            res.embed = embed

            try {
              if (config.commands.close.send_transcripts) dm.send(res)
              if (config.transcripts.channel.length > 1) client.channels.cache.get(config.transcripts.channel).send(res)
            } catch (e) {
              message.channel.send('<:8_:829543245348339752> | Não foi possível enviar uma **DM!**')
            }
          }

          await Ticket.update({
            open: false
          }, {
            where: {
              id
            }
          })

          log.info(log.format(`${message.author.tag} Fechou o ticket &7${id}&f`))
          // `**[` + currentHour + ":" + currentMin + `]** ${message.author.tag} Fechou o ticket ${id}`)

          client.channels.fetch(channel)
            .then(c => c.delete()
              .then(o => log.info(`Canal deletado '#${o.name}' <${o.id}>`))
              .catch(e => log.error(e)))
            .catch(e => log.error(e))

          if (config.logs.discord.enabled) {
            const embed = new MessageEmbed()
              .setColor(config.colour)
              .setAuthor(message.author.username, message.author.displayAvatarURL())
              .setTitle(`${tickets.count} ${plural('ticket', tickets.count)} fechados (${config.prefix}closeall)`)
              .addField('Fechado por', message.author, true)
              .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
              .setTimestamp()

            if (users.length > 1) { embed.addField('Membros', users.map(u => `<@${u}>`).join('\n')) }

            client.channels.cache.get(config.logs.discord.channel).send(embed)
          }
        }
      })
    }
  }
}
