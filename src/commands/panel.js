
const { MessageEmbed } = require('discord.js')
module.exports = {
  name: 'panel',
  description: 'Criar um widget de tickets no canal onde o comando foi executado.',
  usage: '',
  aliases: ['widget'],
  args: false,
  permission: 'MANAGE_GUILD',
  async execute (client, message, _args, log, { config, Setting }) {
    const guild = client.guilds.cache.get(config.guild)

    let msgID = await Setting.findOne({ where: { key: 'panel_msg_id' } })
    let chanID = await Setting.findOne({ where: { key: 'panel_chan_id' } })
    let panel

    if (!chanID) {
      chanID = await Setting.create({
        key: 'panel_chan_id',
        value: message.channel.id
      })
    }

    if (!msgID) {
      msgID = await Setting.create({
        key: 'panel_msg_id',
        value: ''
      })
    } else {
      try {
        panel = await client.channels.cache.get(chanID.get('value')).messages.fetch(msgID.get('value')) // get old panel message
        if (panel) {
          panel.delete({ reason: 'Creating new panel/widget' }).then(() => log.info('Deleted old panel')).catch(e => log.warn(e)) // delete old panel
        }
      } catch (e) {
        log.warn('Couldn\'t delete old panel')
        // `**[` + currentHour + ":" + currentMin + `]** Não foi possivel deletar o painel antigo`)
      }
    }

    message.delete()

    panel = await message.channel.send(
      new MessageEmbed()
        .setColor(config.colour)
        .setTitle(config.panel.title)
        .setDescription(config.panel.description)
        .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
    ) // send new panel

    const emoji = panel.guild.emojis.cache.get(config.panel.reaction) || config.panel.reaction
    panel.react(emoji) // add reaction
    Setting.update({ value: message.channel.id }, { where: { key: 'panel_chan_id' } }) // update database
    Setting.update({ value: panel.id }, { where: { key: 'panel_msg_id' } }) // update database

    log.info(`${message.author.tag} criou um painel de tickets`)
    // `**[` + currentHour + ":" + currentMin + `]** ${message.author.tag} criou um painel de tickets`)
  }
}
