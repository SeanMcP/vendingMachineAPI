'use strict'
module.exports = function(sequelize, DataTypes) {
  var Item = sequelize.define('Item', {
    name: DataTypes.STRING,
    price: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER
  }, {})

  Item.associate = function(models) {
    Item.hasMany(models.Purchase, {
      as: 'purchases',
      foreignKey: 'itemId'
    })
  }

  return Item
}
