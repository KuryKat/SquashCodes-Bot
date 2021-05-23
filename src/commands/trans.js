
// const { MessageEmbed } = require('discord.js');
const fs = require('fs')
const discord = require('discord.js')

module.exports = {
  name: 'trans',
  description: 'Visualiza as estatísticas gerais dos tickets',
  usage: '',
  aliases: ['data', 'statistics'],

  args: false,
  async execute (client, message) {
    if (message.author.bot) return

    await message.delete()
    let messageCollection = new discord.Collection()
    let channelMessages = await message.channel.messages.fetch()({
      limit: 100
    }).catch(err => console.log(err))

    messageCollection = messageCollection.concat(channelMessages)

    while (channelMessages.size === 100) {
      const lastMessageId = channelMessages.lastKey()
      channelMessages = await message.channel.messages.fetch()({ limit: 100, before: lastMessageId }).catch(err => console.log(err))
      if (channelMessages) { messageCollection = messageCollection.concat(channelMessages) }
    }
    const msgs = messageCollection.array().reverse()
    const data = await fs.readFile('./template.html', 'utf8').catch(err => console.log(err))
    if (data) {
      await fs.writeFile('index.html', data).catch(err => console.log(err))
      const guildElement = document.createElement('div')
      const guildText = document.createTextNode(message.guild.name)
      const guildImg = document.createElement('img')
      guildImg.setAttribute('src', message.guild.iconURL)
      guildImg.setAttribute('width', '150')
      guildElement.appendChild(guildImg)
      guildElement.appendChild(guildText)
      console.log(guildElement.outerHTML)
      await fs.appendFile('index.html', guildElement.outerHTML).catch(err => console.log(err))

      msgs.forEach(async msg => {
        const parentContainer = document.createElement('div')
        parentContainer.className = 'parent-container'

        const avatarDiv = document.createElement('div')
        avatarDiv.className = 'avatar-container'
        const img = document.createElement('img')
        img.setAttribute('src', msg.author.displayAvatarURL)
        img.className = 'avatar'
        avatarDiv.appendChild(img)

        parentContainer.appendChild(avatarDiv)

        const messageContainer = document.createElement('div')
        messageContainer.className = 'message-container'

        const nameElement = document.createElement('span')
        const name = document.createTextNode(msg.author.tag + ' ' + msg.createdAt.toDateString() + ' ' + msg.createdAt.toLocaleTimeString() + ' EST')
        nameElement.appendChild(name)
        messageContainer.append(nameElement)

        if (msg.content.startsWith('```')) {
          const m = msg.content.replace(/```/g, '')
          const codeNode = document.createElement('code')
          const textNode = document.createTextNode(m)
          codeNode.appendChild(textNode)
          messageContainer.appendChild(codeNode)
        } else {
          const msgNode = document.createElement('span')
          const textNode = document.createTextNode(msg.content)
          msgNode.append(textNode)
          messageContainer.appendChild(msgNode)
        }
        parentContainer.appendChild(messageContainer)
        await fs.appendFile('index.html', parentContainer.outerHTML).catch(err => console.log(err))
      })
    }
  }
}
