const Discord = require('discord.js')
const { MessageEmbed } = require('discord.js')
// const ChildLogger = require('leekslazylogger').ChildLogger;
// const log = new ChildLogger();

module.exports = {
  name: 'changeip',
  description: 'Troque o IP da sua proteção (Via DM)',
  usage: '',
  aliases: ['trocarip', 'changemyip'],
  example: 'changemyip 127.0.0.1',
  args: false,
  async execute (client, message, args, _log, { config }) {
    const guild = client.guilds.cache.get(config.guild)

    const doc = await client.db.Customers.findOne({ where: { discord: message.author.id } })
    if (doc) {
      message.channel.send(new Discord.MessageEmbed()
        .setDescription(`<:50:829690849591427083> | Verifique sua DM, ${message.author} !`)
        .setColor(config.colour)
        .setTitle('<:37:829543246286815242> | Autenticação de contas')
        .setAuthor(message.author.username, message.author.displayAvatarURL())
        .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
      )

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

      const msg = await message.author.send(new Discord.MessageEmbed()
        .setDescription(`Olá **${message.author.tag}**, seja bem-vindo ao **gerenciamento de contas da Squash Codes**. Para continuar com o procedimento de troca de IP, digite **iniciar**.`)
        .setColor(config.colour)
        .setTitle('<:37:829543246286815242> | Autenticação de contas')
        .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
        .setAuthor(message.author.username, message.author.displayAvatarURL())
      )
      const filter = (m) => m.author.id === message.author.id
      const collector = msg.channel.createMessageCollector(filter, { max: 1 })

      collector.on('collect', async (msg) => {
        await message.author.send(new Discord.MessageEmbed()
          .setDescription('Digite o novo **IP E PORTA** do seu servidor, sem conter o `mtasa://`. **Exemplo:** 123.456.78:22005 ')
          .setColor(config.colour)
          .setTitle('<:37:829543246286815242> | Autenticação de contas')
          .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
          .setAuthor(message.author.username, message.author.displayAvatarURL())
        )
        const filter3 = (m) => m.author.id === message.author.id
        const collector = msg.channel.createMessageCollector(filter3, { max: 1 })

        collector.on('collect', async (msg3) => {
          if (msg3.content.includes('mtasa://')) {
            return message.author.send(new MessageEmbed()
              .setColor(config.err_colour)
              .setAuthor(message.author.username, message.author.displayAvatarURL())
              .setTitle('<:8_:829543245348339752> | Argumentos inválidos!')
              .setDescription('Você não deve inserir o "mtasa://" no ip do seu servidor.')
              .addField('Como usar', `\`${config.prefix}${this.name} ${this.usage}\`\n`)
              .addField('Ajuda', `Digite \`${config.prefix}ajuda ${this.name}\` para mais informações`)
              .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
            )
          }
          message.author.send(new Discord.MessageEmbed()
            .setDescription('<:47:829543246564163609> | Sucesso! seu IP foi **alterado com sucesso**.')
            .setTitle('<:37:829543246286815242> | Autenticação de contas')
            .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
            .setAuthor(message.author.username, message.author.displayAvatarURL())
            .setColor(config.colour)
          )
          await client.db.Customers.update({ serverIP: msg3.content }, { where: { discord: message.author.id } })
        })
      })
    } else if (!doc) {
      await message.channel.send(`<@${message.author.id}>`, new Discord.MessageEmbed()
        .setDescription(`<:8_:829543245348339752> | Olá **${message.author.tag}**, infelizmente nenhuma conta em nosso site vinculada ao seu **discord** foi encontrada em nosso banco de dados. Autentique sua conta utilizando ${config.prefix}authenticate`)
        .setColor(config.colour)
        .setFooter('Sistema de suporte | ' + guild.name, guild.iconURL())
        .setAuthor(message.author.username, message.author.displayAvatarURL())
        .setTitle('<:37:829543246286815242> | Autenticação de contas')
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
