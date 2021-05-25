const { model, Schema } = require('mongoose')

const userSchema = new Schema({
  _id: {
    type: Schema.Types.String,
    required: [true, 'User ID is required! (String)'],
    minlength: [1, 'Minimum length of ID is 1'],
    maxlength: [18, 'Maximum length of ID is 18']
  },
  username: Schema.Types.String,
  discriminator: Schema.Types.String,
  orders: {
    default: [],
    type: [
      {
        ref: 'orders',
        type: Schema.Types.String
      }
    ]
  },
  details: {
    role: {
      type: Schema.Types.Number,
      default: 0
    }
  }
})

const UserModel = model('users', userSchema)

module.exports = {
  userSchema, UserModel
}
