module.exports = function (client) {
  client.on('messageUpdate', (_oldMessage, newMessage) => {
    client.emit('message', newMessage)
  })
}
