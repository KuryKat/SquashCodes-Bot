const Roles = {
  MEMBER: 0,
  CUSTOMER: 1,
  SELLER: 2,
  OWNER: 3
}

Object.freeze(Roles)

const OrderHeaders = {
  MAKEORDER: 0,
  DEVELOPMENT: 1,
  DELIVER: 2,
  OTHER: 3
}

Object.freeze(OrderHeaders)

module.exports = { OrderHeaders, Roles }
