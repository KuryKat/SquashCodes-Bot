const Axios = require('axios')
const NodeCache = require('node-cache')

const cache = new NodeCache()

const api = Axios.create({
  baseURL: 'https://discord.com/api/v8',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bot ' + process.env.TOKEN
  }
})

async function getUser (id) {
  let user = cache.get(id)
  if (!user) {
    user = (await api.get(`/users/${id}`)).data
    cache.set(id, user, 3600)
  }
  return user
}

async function updateRole (guild, id, role) {
  await api.put(`/guilds/${guild}/members/${id}/roles/${role}`)
}

module.exports = {
  getUser, updateRole
}
