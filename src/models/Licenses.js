const { Model, DataTypes } = require("sequelize");

module.exports = class Licenses extends Model {
    static init(sequelize) {
        return super.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    unique: true,
                    autoIncrement: true,
                    primaryKey: true
                },
                product_id: { type: DataTypes.STRING },
                customer_id: { type: DataTypes.STRING },
                license: { type: DataTypes.STRING },
                discord: { type: DataTypes.STRING },
            },
            { tableName: "licenses", timestamps: false, sequelize }
        );
    }
};
