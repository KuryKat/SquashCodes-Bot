const { ConfigModel } = require('../modules/database')

class IDGenerator {
  constructor (initial) {
    (async () => {
      this.dbValue = await ConfigModel.findById('nextID')
      if (!this.dbValue) {
        this.dbValue = new ConfigModel({ _id: 'nextID' })
        this.dbValue.value = initial
        this.dbValue.save()
      }

      this.value = this.dbValue.value
    })()
  }

  next () {
    this.value++
    this.dbValue.value = this.value
    this.dbValue.save()
    return this.value
  }
}

module.exports = IDGenerator
