const { model, Schema } = require('mongoose')

const imageReferencesSchema = new Schema({
  _id: {
    type: Schema.Types.String
  },
  references: {
    maxHeight: {
      value: {
        type: Schema.Types.Number,
        default: null
      }
    },
    nextY: {
      value: {
        type: Schema.Types.Number,
        default: null
      }
    },
    lineLimit: {
      value: {
        type: Schema.Types.Number,
        default: null
      }
    },
    header: {
      value: {
        type: Schema.Types.Number,
        default: null
      }
    }
  }
})

const ImageReferencesModel = model('image-references', imageReferencesSchema)

module.exports = {
  imageReferencesSchema, ImageReferencesModel
}
