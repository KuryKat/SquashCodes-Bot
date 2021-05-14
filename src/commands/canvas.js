

const { MessageEmbed } = require('discord.js');
const Canvas = require("canvas");
const Discord = require("discord.js");

module.exports = {
	name: 'canvas',
	description: 'Visualiza as estatísticas gerais dos tickets',
	usage: '',
	aliases: ['data', 'statistics'],
	
	args: false,
	async execute(client, message, _args, _log, { config, Ticket }) {
            //If not in a guild return
            //create a new Canvas
            const canvas = Canvas.createCanvas(1280, 831);
            //make it "2D"
            const ctx = canvas.getContext('2d');
            //set the Background to the welcome.png
            const background = await Canvas.loadImage('https://media.discordapp.net/attachments/752936948062093362/830060485280792646/Rectangle_1.png?width=1280&height=831');
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
            var textString3 = `Status da sua encomenda`;
            ctx.font = 'semibold 24px Montserrat';
            ctx.fillStyle = '#f2f2f2';
            ctx.fillText(textString3, 29, 71);

            ctx.font = 'medium 24px Montserrat';
            ctx.fillStyle = '#824BAD';
            ctx.fillText('Sistema de encomendas - Squash Codes', 78, 35);

            const box = await Canvas.loadImage('https://cdn.discordapp.com/attachments/829748398848475258/830063258793934858/Vector_1.png');
            ctx.drawImage(box, 29, 10, 39, 31)

            ctx.font = 'medium 18px Montserrat';
            ctx.fillStyle = '#949494';
            ctx.fillText('Número do pedido: #0095', 29, 100);

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
            //create a circular "mask"
            //define the user avatar
            //const avatar = await Canvas.loadImage(message.author.displayAvatarURL({ format: 'jpg' }));
            //draw the avatar
            //ctx.drawImage(avatar, 65, canvas.height / 2 - 250, 500, 500);
            //get it as a discord attachment
            const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');
            //define the welcome embed
            const embed = new Discord.MessageEmbed()
                .setImage("attachment://welcome-image.png")
                .attachFiles(attachment);
            //define the welcome channel
            message.channel.send(embed)
	}
};
