const { model, Schema } = require('mongoose')

const userSchema = new Schema({
  _id: {
    type: String,
    required: [true, 'User ID is required! (String)'],
    minlength: [1, 'Minimum length of ID is 1'],
    maxlength: [18, 'Maximum length of ID is 18']
  },
  username: String,
  discriminator: String,
  orders: {
    default: [],
    type: [
      {
        ref: 'orders',
        type: String
      }
    ]
  },
  details: {
    role: {
      type: Number,
      default: 0
    }
  }
})

const UserModel = model('users', userSchema)

module.exports = {
  userSchema, UserModel
}
