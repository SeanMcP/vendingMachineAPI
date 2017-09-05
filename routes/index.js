const express = require('express')
const router = express.Router()
const models = require('../models/index')
const Item = require('../models/item')
const Purchase = require('../models/purchase')

router.get('/', function(req, res) {
  res.send('Just a slash')
})

// GET /api/customer/items - get a list of items
// POST /api/customer/items/:itemId/purchases - purchase an item
// GET /api/vendor/purchases - get a list of all purchases with their item and date/time
// GET /api/vendor/money - get a total amount of money accepted by the machine
// POST /api/vendor/items - add a new item not previously existing in the machine
// PUT /api/vendor/items/:itemId - update item quantity, description, and cost

router.get('/api', function(req, res) {
  res.send('You have found the API')
})

router.get('/api/customer/items', function(req, res) {
  models.Item.findAll()
  .then(function(data) {
    res.send(data)
  })
  .catch(function(err) {
    res.send('Uh-oh! Something went wrong')
  })
})

router.post('/api/customer/items/:itemId/purchases', function(req, res) {

  models.Item.findOne({ where: { id: req.params.itemId } })
  .then(function(data) {

    if(req.body.moneyGiven >= data.price && data.quantity > 0) {

      let calcChange = req.body.moneyGiven - data.price

      let newPurchase = {
        itemId: req.params.itemId,
        moneyGiven: req.body.moneyGiven,
        moneyRequired: data.price,
        changeTendered: calcChange
      }

      models.Purchase.create(newPurchase)
      .then(function() {

        models.Item.update({
            quantity: data.quantity - 1
          },
          { where: { id: req.params.itemId }
        })
        .then(function() {
          console.log('Decreased quantity by one')
        })
        .catch(function() {
          console.log('Failed to decrease quantity by one')
        })

        res.send('You have successfully purchased 1 ' + data.name + ' and receive ' + calcChange + ' cents change')
      })
      .catch(function() {
        res.send('Uh-oh! Something went wrong')
      })
    } else if(data.quantity <= 0) {
      res.send('Out of stock')
    } else {
      res.send('Insufficient funds')
    }
  })
  .catch(function() {
    res.send('Unable to find item')
  })
})


router.post('/api/vendor/items', function(req, res) {

  let newItem = {
    name: req.body.name,
    price: req.body.price,
    quantity: req.body.quantity
  }

  models.Item.create(newItem)
  .then(function() {
    res.send('You have successfully added ' + req.body.quantity + ' new ' + req.body.name + 's')
  })
  .catch(function() {
    res.send('Something went wrong: nothing added')
  })
})

router.put('/api/vendor/items/:itemId', function(req, res) {
  models.Item.update({
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity
    },
    { where: { id: req.params.itemId }
  })
  .then(function() {
    res.send('Item successfully updated')
  })
  .catch(function() {
    res.send('Uh-oh! Something went wrong')
  })
})

module.exports = router
