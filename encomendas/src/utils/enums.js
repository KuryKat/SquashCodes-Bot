const Roles = {
  MEMBER: 0,
  SELLER: 1,
  OWNER: 2
}

Object.freeze(Roles)

// TODO: Utilizar esse ENUM em todos locais que precisam referenciar qual o header, como quando utilizar o comando de Update ou quando criar a imagem/alterar header!
const OrderHeaders = {
  MAKEORDER: 0,
  DEVELOPMENT: 1,
  DELIVER: 2,
  FINISH: 3,
  OTHER: 4
}

Object.freeze(OrderHeaders)

module.exports = { OrderHeaders, Roles }
