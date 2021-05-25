const { model, Schema } = require('mongoose')

const orderSchema = new Schema({
  _id: {
    type: Schema.Types.String,
    required: [true, 'Order ID is required! (String)'],
    minlength: [1, 'Minimum length of ID is 1'],
    maxlength: [18, 'Maximum length of ID is 18']
  },
  messageID: {
    type: Schema.Types.String,
    default: null,
    minlength: [1, 'Minimum length of ID is 1'],
    maxlength: [18, 'Maximum length of ID is 18']
  },
  name: {
    type: Schema.Types.String,
    required: [true, 'Order Name is required (String)'],
    minlength: [1, 'Minimum length of Order Name is 1'],
    maxlength: [20, 'Maximum length of Order Name is 20']
  },
  description: {
    type: Schema.Types.String,
    required: [true, 'Order Description is required (String)'],
    minlength: [1, 'Minimum length of Order Description is 1'],
    maxlength: [100, 'Maximum length of Order Description is 100']
  },
  status: {
    type: Schema.Types.String,
    default: 'open',
    validate: {
      validator: (value) => /open|closed|development|delivered|canceled/g.test(value),
      message: (props) => `${props.value} is a Invalid status for Order ('open' | 'closed' | 'development' | 'delivered' | 'canceled')`
    }
  },
  customer: {
    ref: 'users',
    type: Schema.Types.String
  },
  price: {
    type: Schema.Types.String,
    required: [true, 'Order Price is required (String)'],
    validate: {
      validator: (value) => /^(R\$|\$|€)([1-9]\d{0,2}((\.\d{3})*|\d*))(,\d{2})?$/.test(value),
      message: (props) => `${props.value} is a Invalid Price for Order`
    }
  },
  responsibles: {
    required: [true, 'Order responsibles is required (String[])'],
    minlength: [1, 'Minimum length of Order responsibles is 1'],
    type: [
      {
        ref: 'users',
        type: Schema.Types.String
      }
    ]
  }
})

const OrderModel = model('orders', orderSchema)

module.exports = {
  OrderModel, orderSchema
}
