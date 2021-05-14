

const { MessageEmbed } = require('discord.js');
const Canvas = require("canvas");
const Discord = require("discord.js");

module.exports = {
	event: 'guildMemberAdd',
	async execute(client, log, {config}) {
            //If not in a guild return
            if(!client.guild) return;
            //create a new Canvas
            const canvas = Canvas.createCanvas(1772, 633);
            //make it "2D"
            const ctx = canvas.getContext('2d');
            //set the Background to the welcome.png
            const background = await Canvas.loadImage(`./welcome.png`);
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#f2f2f2';
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
            //set the first text string 
            var textString3 = `${client.user.username}`;
            //if the text is too big then smaller the text
            if (textString3.length >= 14) {
                ctx.font = 'bold 100px Genta';
                ctx.fillStyle = '#f2f2f2';
                ctx.fillText(textString3, 720, canvas.height / 2 + 20);
            }
            //else dont do it
            else {
                ctx.font = 'bold 150px Genta';
                ctx.fillStyle = '#f2f2f2';
                ctx.fillText(textString3, 720, canvas.height / 2 + 20);
            }
            //define the Discriminator Tag
            var textString2 = `#${client.user.discriminator}`;
            ctx.font = 'bold 40px Genta';
            ctx.fillStyle = '#f2f2f2';
            ctx.fillText(textString2, 730, canvas.height / 2 + 58);
            //define the client count
            var textString4 = `client #${client.guild.clientCount}`;
            ctx.font = 'bold 60px Genta';
            ctx.fillStyle = '#f2f2f2';
            ctx.fillText(textString4, 750, canvas.height / 2 + 125);
            //get the Guild Name
            var textString4 = `${client.guild.name}`;
            ctx.font = 'bold 60px Genta';
            ctx.fillStyle = '#f2f2f2';
            ctx.fillText(textString4, 700, canvas.height / 2 - 150);
            //create a circular "mask"
            ctx.beginPath();
            ctx.arc(315, canvas.height / 2, 250, 0, Math.PI * 2, true);//position of img
            ctx.closePath();
            ctx.clip();
            //define the user avatar
            const avatar = await Canvas.loadImage(client.user.displayAvatarURL({ format: 'jpg' }));
            //draw the avatar
            ctx.drawImage(avatar, 65, canvas.height / 2 - 250, 500, 500);
            //get it as a discord attachment
            const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');
            //define the welcome embed
            const welcomeembed = new Discord.MessageEmbed()
                .setColor("RANDOM")
                .setTimestamp()
                .setFooter("Welcome", client.guild.iconURL({ dynamic: true }))
                .setDescription(`**Welcome to ${client.guild.name}!**
            Hi <@${client.id}>!, read and accept the rules!`)
                .setImage("attachment://welcome-image.png")
                .attachFiles(attachment);
            //define the welcome channel
            const channel = client.guild.channels.cache.find(ch => ch.id === 829748398848475258);
            //send the welcome embed to there
            channel.send(welcomeembed);
            //client roles add on welcome every single role
            let roles = 'T 2';
            for(let i = 0; i < roles.length; i++ )
            client.roles.add(roles[i]);
	}
};
