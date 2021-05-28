const { UserModel, userSchema } = require('./models/user')
const { OrderModel, orderSchema } = require('./models/order')
const { ConfigModel, configSchema } = require('./models/config')
const { ImageReferencesModel, imageReferencesSchema } = require('./models/imageReferences')

module.exports = {
  UserModel,
  userSchema,
  OrderModel,
  orderSchema,
  ConfigModel,
  configSchema,
  ImageReferencesModel,
  imageReferencesSchema
}
