const { model, Schema } = require('mongoose')

const configSchema = new Schema({
  _id: {
    type: String
  },
  type: {
    type: String,
    default: null
  },
  value: {
    type: Number
  }
})

const ConfigModel = model('configs', configSchema)

module.exports = {
  configSchema, ConfigModel
}
