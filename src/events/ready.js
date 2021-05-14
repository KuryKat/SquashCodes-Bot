const Logger = require('leekslazylogger');
const log = new Logger();
const config = require('../../user/' + require('../').config);

module.exports = {
	event: 'ready',
	execute(client, log) {
		log.success(`Autenticado com sucesso como ${client.user.tag}`);
		//`**[` + currentHour + ":" + currentMin + `]** Autenticado com sucesso como ${client.user.tag}`)

		const updatePresence = () => {
			const presence = config.presences[Math.floor(Math.random() * config.presences.length)];
			let activity = presence.activity + config.append_presence;
			activity = activity.replace(/%s/g, config.prefix);
			client.user.setPresence({
				activity: {
					name: activity,
					type: presence.type.toUpperCase()
				}
			}).catch(log.error);
			log.debug(`Atualizando presence: ${activity} ${presence.type}`);
			//`**[` + currentHour + ":" + currentMin + `]** Atualizando presence: ${activity} ${presence.type}`)
		};
		updatePresence();
		setInterval(() => {
			updatePresence();
		}, 60000);


		if (client.guilds.cache.get(config.guild).member(client.user).hasPermission('ADMINISTRATOR', false)) {
			log.success('Permissão de \'ADMINISTRATOR\' verificada com sucesso');
			//'**[' + currentHour + ":" + currentMin + '] **Permissão de \'ADMINISTRATOR\' verificada com sucesso')
		} else { 
			log.warn('O BOT não tem a permissão de \'ADMINISTRATOR\' !');
			//'**[' + currentHour + ":" + currentMin + '] **O BOT não tem a permissão de \'ADMINISTRATOR\' !')
		}
	}
};
