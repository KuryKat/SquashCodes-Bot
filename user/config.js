/**
 * ###############################################################################################
 *  ____                                        _     _____              _             _
 * |  _ \  (_)  ___    ___    ___    _ __    __| |   |_   _| (_)   ___  | | __   ___  | |_   ___
 * | | | | | | / __|  / __|  / _ \  | '__|  / _` |     | |   | |  / __| | |/ /  / _ \ | __| / __|
 * | |_| | | | \__ \ | (__  | (_) | | |    | (_| |     | |   | | | (__  |   <  |  __/ | |_  \__ \
 * |____/  |_| |___/  \___|  \___/  |_|     \__,_|     |_|   |_|  \___| |_|\_\  \___|  \__| |___/
 *
 * ---------------------
 *      Quick Start
 * ---------------------
 *
 *  > For detailed instructions, visit the GitHub repository and read the documentation:
 *  https://github.com/eartharoid/DiscordTickets/wiki
 *
 *  > IMPORTANT: Also edit the TOKEN in 'user/.env'
 *
 * ---------------------
 *       Support
 * ---------------------
 *
 *  > Information: https://github.com/eartharoid/DiscordTickets/#readme
 *  > Discord Support Server: https://go.eartharoid.me/discord
 *  > Wiki: https://github.com/eartharoid/DiscordTickets/wiki
 *
 * ###############################################################################################
 */

module.exports = {
  prefix: '!',
  name: 'SquashCodes',
  presences: [
    {
      activity: '%ssuporte',
      type: 'PLAYING'
    },
    {
      activity: 'Squash Codes',
      type: 'WATCHING'
    }
  ],
  owners: ['367425061122211843'],
  append_presence: ' | %sajuda',
  colour: '#a852ff',
  warn_colour: '#ffcc00',
  err_colour: '#ff5e52',
  cooldown: 3,
  guild: '846728206697758731', // ID of your guild (REQUIRED)
  staff_role: '846755035400503327', // ID of your Support Team role (REQUIRED)
  customers_role: '846755008090865704', // ID of your customers role
  ordersCategory: '847077722253688862', /// ID of your orders category

  tickets: {
    category: '842664736305709056', // ID of your tickets category (REQUIRED)
    send_img: true,
    ping: 'staff',
    text: '<:31:829543245792149507> | {{ tag }} um membro da equipe irá lhe atender em breve. Enquanto isso, descreva com detalhes o que deseja!',
    pin: false,
    max: 1,
    default_topic: {
      command: 'Nenhum tópico definido',
      panel: 'Creiado via painel'
    }
  },

  commands: {
    close: {
      confirmation: true,
      send_transcripts: true
    },
    delete: {
      confirmation: true
    },
    new: {
      enabled: true
    },
    closeall: {
      enabled: true
    }
  },

  transcripts: {
    text: {
      enabled: true,
      keep_for: 90
    },
    web: {
      enabled: false,
      server: 'https://tickets.example.com'
    },
    channel: '842664870499188747' // ID of your archives channel
  },

  panel: {
    title: '<:older:843703298942828574> | Ticket de suporte',
    description: 'Reaja abaixo (<:confirm:842975453701996564>) para abrir um canal de suporte.',
    reaction: '842975453701996564'
  },

  storage: {
    type: 'mysql'
  },

  logs: {
    files: {
      enabled: true,
      keep_for: 7
    },
    discord: {
      enabled: true,
      channel: '845870381373194261'
    },
    console: {
      enabled: true,
      channel: '829722281689088001'
    }
  },

  debug: false,
  updater: true
}
