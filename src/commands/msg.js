
// const { MessageEmbed } = require('discord.js');
const Canvas = require('canvas')
const Discord = require('discord.js')

module.exports = {
  name: 'msg',
  description: 'Visualiza as estatísticas gerais dos tickets',
  usage: '',
  aliases: ['data', 'statistics'],

  args: false,
  async execute (client, message, args) {
    if (!args) return message.reply('Cadê os argumentos?')
    message.delete()
    // If not in a guild return
    // create a new Canvas
    const canvas = Canvas.createCanvas(435, 29)
    const ctx = canvas.getContext('2d')
    // set the Background to the welcome.png

    const text = args.join(' ')
    ctx.font = 'medium 24px Montserrat'
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(text, 5, 27)

    const MtaJS = require('MtaJS')
    MtaJS.Connect('MTASA', '127.0.0.1', 'root', '')

    /*
            var textString2 = `#${message.author.discriminator}`;
            ctx.font = 'bold 40px Genta';
            ctx.fillStyle = '#f2f2f2';
            ctx.fillText(textString2, 730, canvas.height / 2 + 58);
            //define the Member count
            var textString4 = `Mensagem de teste`;
            ctx.font = 'bold 60px Genta';
            ctx.fillStyle = '#f2f2f2';
            ctx.fillText(textString4, 750, canvas.height / 2 + 130);
            //get the Guild Name
            var textString4 = `Squash Codes`;
            ctx.font = 'bold 60px Genta';
            ctx.fillStyle = '#f2f2f2';
            ctx.fillText(textString4, 700, canvas.height / 2 - 150);
            */
    // create a circular "mask"
    // define the user avatar
    // const avatar = await Canvas.loadImage(message.author.displayAvatarURL({ format: 'jpg' }));
    // draw the avatar
    // ctx.drawImage(avatar, 65, canvas.height / 2 - 250, 500, 500);
    // get it as a discord attachment
    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'Msg.png')
    // define the welcome embed
    const embed = new Discord.MessageEmbed()
      .setImage('attachment://Msg.png')
      .attachFiles(attachment)
    // define the welcome channel
    message.channel.send(embed)
  }
}
