const { Model, DataTypes } = require('sequelize')

module.exports = class Customers extends Model {
  static init (sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          unique: true,
          autoIncrement: true,
          primaryKey: true
        },
        username: { type: DataTypes.STRING },
        email: { type: DataTypes.STRING },
        password: { type: DataTypes.STRING },
        ip: { type: DataTypes.STRING },
        serverIP: { type: DataTypes.STRING },
        admin: { type: DataTypes.STRING },
        createdAt: { type: DataTypes.STRING },
        discord: { type: DataTypes.STRING }
      },
      { tableName: 'customers', timestamps: false, sequelize }
    )
  }
}
