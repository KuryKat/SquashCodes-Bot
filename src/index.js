const version = Number(process.version.split('.')[0].replace('v', ''))
if (version < 12) {
  console.log('Atualize o node para v12 ou +')
  process.exit(1)
}

const fs = require('fs')
const { join } = require('path')

const dev = fs.existsSync(join(__dirname, '../user/dev.env')) && fs.existsSync(join(__dirname, '../user/dev.config.js'))

require('dotenv').config({ path: join(__dirname, '../user/', dev ? 'dev.env' : '.env') })

module.exports.config = dev ? 'dev.config.js' : 'config.js'
const config = require(join(__dirname, '../user/', module.exports.config))
// const newConfig = require('../user/' + require('../').config);

const Discord = require('discord.js')
const client = new Discord.Client({
  autoReconnect: true,
  partials: ['MESSAGE', 'CHANNEL', 'REACTION']
})

// client.events = new Discord.Collection()
// client.commands = new Discord.Collection()
// client.cooldowns = new Discord.Collection()

// const utils = require('./modules/utils')
const leeks = require('leeks.js')

require('./modules/banner')(leeks) // big coloured text thing

const Logger = require('leekslazylogger')
const log = new Logger({
  name: config.name,
  logToFile: config.logs.files.enabled,
  maxAge: config.logs.files.keep_for,
  debug: config.debug
})

// /**
//  * storage
//  */
// const { Sequelize, Model, DataTypes } = require('sequelize')

// let sequelize

// switch (config.storage.type) {
//   case 'mysql':
//     log.info('Connecting to MySQL database...')
//     sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
//       dialect: 'mysql',
//       host: process.env.DB_HOST,
//       logging: log.debug
//     })
//     break
//   case 'mariadb':
//     log.info('Connecting to MariaDB database...')
//     sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
//       dialect: 'mariadb',
//       host: process.env.DB_HOST,
//       logging: log.debug
//     })
//     break
//   case 'postgre':
//     log.info('Connecting to PostgreSQL database...')
//     sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
//       dialect: 'postgres',
//       host: process.env.DB_HOST,
//       logging: log.debug
//     })
//     break
//   case 'microsoft':
//     log.info('Connecting to Microsoft SQL Server database...')
//     sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
//       dialect: 'mssql',
//       host: process.env.DB_HOST,
//       logging: log.debug
//     })
//     break
//   default:
//     log.info('Using SQLite storage')
//     sequelize = new Sequelize({
//       dialect: 'sqlite',
//       storage: join(__dirname, '../user/storage.db'),
//       logging: log.debug
//     })
// }

// class Ticket extends Model {}
// Ticket.init({
//   channel: DataTypes.STRING,
//   creator: DataTypes.STRING,
//   open: DataTypes.BOOLEAN,
//   topic: DataTypes.TEXT
// }, {
//   sequelize,
//   modelName: 'ticket'
// })

// class Licenses extends Model {}
// Licenses.init({
//   id: {
//     type: DataTypes.INTEGER(255),
//     primaryKey: true
//   },
//   product_id: DataTypes.INTEGER(11),
//   customer_id: DataTypes.INTEGER(11),
//   license: DataTypes.STRING(19),
//   reference: DataTypes.STRING(255)
// }, {
//   sequelize,
//   modelName: 'licenses'
// })

// class Setting extends Model {}
// Setting.init({
//   key: DataTypes.STRING,
//   value: DataTypes.STRING
// }, {
//   sequelize,
//   modelName: 'setting'
// })

// Ticket.sync()
// Setting.sync()
// Licenses.sync()

// /**
//  * event loader
//  */
// const events = fs.readdirSync(join(__dirname, 'events')).filter(file => file.endsWith('.js'))
// for (const file of events) {
//   const event = require(`./events/${file}`)
//   client.events.set(event.event, event)
//   // client.on(event.event, e => client.events.get(event.event).execute(client, e, Ticket, Setting));
//   client.on(event.event, (e1, e2) => client.events.get(event.event).execute(client, log, [e1, e2], { config, Ticket, Setting, Licenses }))
//   log.console(log.format(`> Evento &7${event.event}&f carregado com sucesso`))
// }

// /**
//  * command loader
//  */
// const commands = fs.readdirSync(join(__dirname, 'commands')).filter(file => file.endsWith('.js'))
// for (const file of commands) {
//   const command = require(`./commands/${file}`)
//   client.commands.set(command.name, command)
//   log.console(log.format(`> Comando &7${config.prefix}${command.name}&f carregado com sucesso`))
// }

// log.info(`Foram carregados ${events.length} eventos e ${commands.length} comandos`)

// const oneDay = 1000 * 60 * 60 * 24
// const txt = '../user/transcripts/text'
// const clean = () => {
//   const files = fs.readdirSync(join(__dirname, txt)).filter(file => file.endsWith('.txt'))
//   let total = 0
//   for (const file of files) {
//     const diff = (new Date() - new Date(fs.statSync(join(__dirname, txt, file)).mtime))
//     if (Math.floor(diff / oneDay) > config.transcripts.text.keep_for) {
//       fs.unlinkSync(join(__dirname, txt, file))
//       total++
//     }
//   }
//   if (total > 0) log.info(`Deletando ${total} arquivos antigos ${utils.plural('transcript', total)}`)
// }

// if (config.transcripts.text.enabled) {
//   clean()
//   setInterval(clean, oneDay)
// }

// const { readdir, statSync } = require('fs')
// const { resolve } = require('path')

// function requireDir ({ dir, filesOnly = ['js', 'json'], recursive = true }, callback) {
//   readdir(dir, (err, files) => {
//     if (err) throw new Error(err)

//     for (const file of files) {
//       const fullPath = resolve(dir, file)

//       if (statSync(dir + '/' + file).isDirectory() && recursive) requireDir({ dir: dir + '/' + file, filesOnly }, callback)

//       if (!filesOnly.some((ext) => new RegExp(`.${ext}$`).test(file))) continue

//       try {
//         const required = require(fullPath)
//         callback(null, [required, fullPath])
//       } catch (err) {
//         callback(err, file)
//       }
//     }
//   })
// }

// // async function docDB (collection, find, _id, options = {}) {
// //   const document = await database[collection].findOne(find)
// //   if (document) return document
// //   options._id = find._id !== undefined && _id === undefined ? find._id : _id
// //   const newDoc = new database[collection](options)
// //   await newDoc.save()
// //   return newDoc
// // }
// // function shuffle (arr = []) {
// //   const array = [...arr]
// //   for (let i = array.length - 1; i > 0; i--) {
// //     const j = Math.floor(Math.random() * (i + 1));
// //     [array[i], array[j]] = [array[j], array[i]]
// //   }
// //   return array
// // }

// const db = require('./database.js')
// client.db = db

// client.once('ready', () => {
//   db.authenticate()
//     .then(() => {
//       console.log('[DATABASE] CONECTADO A DATABASE')
//       requireDir({ dir: './src/models/' }, (err, [file, path]) => {
//         if (err) console.error(err)

//         file.init(db)
//         file.sync()

//         const bracket = path.includes('/') ? '/' : '\\'

//         db[path.split(bracket)[path.split(bracket).length - 1].replace('.js', '')] = file
//       })
//     })
//     .catch((err) => console.error(err))
// })

// process.on('unhandledRejection', error => {
//   log.warn('An error was not caught')
//   log.warn(`Uncaught ${error.name}: ${error.message}`)
//   log.error(error)
// })

/**
 * SISTEMA DE ENCOMENDAS
 */
const encomendas = require('../encomendas')
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true
})

const db = mongoose.connection
db.on('open', () => log.info('Conexão ao MongoDB realizada com sucesso!'))
db.on('error', console.error)

module.exports.db = db

setTimeout(async () => {
  encomendas(client, config, log)
  client.login(process.env.TOKEN)
}, 800)
