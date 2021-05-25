const { model, Schema } = require('mongoose')

const configSchema = new Schema({
  _id: {
    type: Schema.Types.String
  },
  type: {
    type: Schema.Types.String,
    default: null
  },
  value: {
    type: Schema.Types.Number
  }
})

const ConfigModel = model('configs', configSchema)

module.exports = {
  configSchema, ConfigModel
}
