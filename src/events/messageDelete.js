
const fs = require('fs')
const { join } = require('path')
module.exports = {
  event: 'messageDelete',
  async execute (_client, log, [message], { config, Ticket }) {
    if (!config.transcripts.web.enabled) return

    if (message.partial) {
      try {
        await message.fetch()
      } catch (err) {
        log.warn('Falha ao dar fetch na mensagem deletada')
        // '**[' + Date().getHours() + ":" + currentMin + ']**Falha ao dar fetch na mensagem deletada')
        log.error(err.message)
        // err.message)
        return
      }
    }

    const ticket = await Ticket.findOne({ where: { channel: message.channel.id } })
    if (!ticket) return

    const path = `../../user/transcripts/raw/${message.channel.id}.log`
    const embeds = []
    for (const embed in message.embeds) embeds.push(message.embeds[embed].toJSON())

    fs.appendFileSync(join(__dirname, path), JSON.stringify({
      id: message.id,
      author: message.author.id,
      content: message.content, // do not use cleanContent!
      time: message.createdTimestamp,
      embeds: embeds,
      attachments: [...message.attachments.values()],
      edited: message.edits.length > 1,
      deleted: true // delete the message
    }) + '\n')
  }
}
