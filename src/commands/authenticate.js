const Discord = require('discord.js')
// const ChildLogger = require('leekslazylogger').ChildLogger;
// const log = new ChildLogger();
const { MessageEmbed } = require('discord.js')

module.exports = {
  name: 'authenticate',
  description: 'Vincule seu discord ao site e a sua proteção',
  usage: '[username]',
  aliases: ['autenticar', 'authenticator'],
  example: 'authenticate João Dutra',
  args: true,
  async execute (client, message, args, _log, { config }) {
    const guild = client.guilds.cache.get(config.guild)
    const logs = args.join(' ')

    if (!message.member.roles.cache.has(config.customers_role)) {
      return message.channel.send(
        new MessageEmbed()
          .setColor(config.err_colour)
          .setAuthor(message.author.username, message.author.displayAvatarURL())
          .setTitle('<:8_:829543245348339752> | Sem permissão')
          .setDescription('Você não tem permissão para usar este comando.')
          .addField('Como usar', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
          .addField('Ajuda', `Digite \`${config.prefix}ajuda ${this.name}\` para mais informações`)
          .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
      )
    }

    if (message.content.includes('+')) {
      return message.channel.send(
        new MessageEmbed()
          .setColor(config.err_colour)
          .setAuthor(message.author.username, message.author.displayAvatarURL())
          .setTitle('<:8_:829543245348339752> | Argumentos inválidos! ')
          .setDescription('Você não inseriu os argumentos corretamente. (Retire o +)')
          .addField('Como usar', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
          .addField('Ajuda', `Digite \`${config.prefix}ajuda ${this.name}\` para mais informações`)
          .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
      )
    }

    const doc = await client.db.Customers.findOne({ where: { discord: message.author.id } })

    if (doc) {
      message.channel.send(new MessageEmbed()
        .setColor(config.err_colour)
        .setAuthor(message.author.username, message.author.displayAvatarURL())
        .setTitle('<:8_:829543245348339752> | Conta já vinculada!')
        .setDescription('Seu discord já está vinculado a uma conta.')
        .addField('Como usar', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
        .addField('Ajuda', `Digite \`${config.prefix}ajuda ${this.name}\` para mais informações`)
        .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
      )
    } else if (!doc) {
      const doc2 = await client.db.Customers.findOne({ where: { username: logs } })
      if (doc2) { client.db.Customers.update({ discord: message.author.id }, { where: { username: logs } }) } else if (!doc2) {
        message.channel.send(new MessageEmbed()
          .setColor(config.err_colour)
          .setAuthor(message.author.username, message.author.displayAvatarURL())
          .setTitle('<:8_:829543245348339752> | Conta inválida')
          .setDescription('Conta não encotrada, verifique se você inseriu o **username** correto.')
          .addField('Como usar', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
          .addField('Ajuda', `Digite \`${config.prefix}ajuda ${this.name}\` para mais informações`)
          .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL()))
      }
      doc2.save()

      message.channel.send(new Discord.MessageEmbed()
        .setAuthor(message.author.username, message.author.displayAvatarURL())
        .setTitle('<:37:829543246286815242> | Autenticação de contas.')
        .setDescription('<:47:829543246564163609> | Sucesso! sua conta foi **vinculada** ao site com sucesso.')
        .setColor(config.colour)
        .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
      )
    }
  }

  /*
    const serverip = args.join(" ");

    if (!args[0]) return message.channel.send(new Discord.MessageEmbed().setColor(config.colour).setDescription(`Você não especificou o **IP** a ser alterado.`).setFooter(guild.name, guild.iconURL()));

    const doc = await client.db.Protection.findOne({ where: { discord: message.author.id } });
    if (!doc) return message.channel.send(new Discord.MessageEmbed().setColor(config.colour).setDescription(`Sua conta **não** foi encontrada em nosso **banco de dados.**`).setFooter(guild.name, guild.iconURL()));
    await client.db.Protection.update({ serverip: serverip }, { where: { discord: message.author.id } });

    message.react('☑️')
    message.channel.send(new Discord.MessageEmbed()
    .setThumbnail(guild.iconURL())
    .setColor(config.colour)
    .setFooter(guild.name, guild.iconURL())
    .setTitle(`Seu IP foi alterado com sucesso.`)
    .addField('User:', '<@' + message.author.id + '> (#' + message.author.id + ')', true)
    .addField('ServerIP:', serverip, true));

    if (config.logs.discord.enabled) {
      client.channels.cache.get(config.logs.discord.channel).send(
        new Discord.MessageEmbed()
          .setColor(config.colour)
          .setAuthor(message.author.username, message.author.displayAvatarURL())
          .addField('User:', '<@' + message.author.id + '> (#' + message.author.id + ')', true)
          .addField(`ServerIP:`, serverip, true)
          .setTitle('IP Alterado!')
          .setDescription('Alterado por: <@' + message.author.id + '>')
          .setFooter(guild.name, guild.iconURL())
          .setTimestamp()
         );
       } */
}
