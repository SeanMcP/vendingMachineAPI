'use strict'
module.exports = function(sequelize, DataTypes) {
  var Purchase = sequelize.define('Purchase', {
    itemId: DataTypes.INTEGER,
    moneyGiven: DataTypes.INTEGER,
    moneyRequired: DataTypes.INTEGER,
    changeTendered: DataTypes.INTEGER
  }, {})

  Purchase.associate = function(models) {
    Purchase.belongsTo(models.Item, {
      as: "item",
      foreignKey: 'itemId'
    })
  }

  return Purchase
}
