const fs = require('fs')
const { join } = require('path')
module.exports = {
  event: 'messageUpdate',
  async execute (_client, log, [o, n], { config, Ticket }) {
    if (!config.transcripts.web.enabled) return

    if (o.partial) {
      try {
        await o.fetch()
      } catch (err) {
        log.error(err)
        // err)
        return
      }
    }

    if (n.partial) {
      try {
        await n.fetch()
      } catch (err) {
        log.error(err)
        // err)
        return
      }
    }

    const ticket = await Ticket.findOne({ where: { channel: n.channel.id } })
    if (!ticket) return

    const path = `../../user/transcripts/raw/${n.channel.id}.log`
    const embeds = []
    for (const embed in n.embeds) embeds.push({ ...n.embeds[embed] })

    fs.appendFileSync(join(__dirname, path), JSON.stringify({
      id: n.id,
      author: n.author.id,
      content: n.content, // do not use cleanContent!
      time: n.createdTimestamp,
      embeds: embeds,
      attachments: [...n.attachments.values()],
      edited: true
    }) + '\n')
  }
}
