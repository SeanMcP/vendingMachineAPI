const express = require('express')
const router = express.Router()
const models = require('../models/index')
const Item = require('../models/item')
const Purchase = require('../models/purchase')

const sendMessage = function(status, data) {
  let obj = {
    status: status,
    data: data
  }
  return obj
}

router.get('/api/customer/items', function(req, res) {
  models.Item.findAll()
  .then(function(data) {
    res.send(sendMessage('success', data))
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
      let message = {
        moneyGiven: req.body.moneyGiven,
        moneyRequired: data.price,
        difference: data.price - req.body.moneyGiven
      }
      res.send(sendMessage('fail', message))
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
    res.send('Item no. ' + req.params.itemId + ' successfully updated')
  })
  .catch(function() {
    res.send('Uh-oh! Something went wrong')
  })
})

router.get('/api/vendor/purchases', function(req, res) {
  models.Purchase.findAll()
  .then(function(data) {
    res.send(sendMessage('success', data))
  })
  .catch(function(error) {
    res.send('Uh-oh! Something went wrong')
  })
})

router.get('/api/vendor/money', function(req, res) {
  models.Purchase.sum('moneyRequired')
  .then(function(sum) {
    res.send(sendMessage('success', sum))
  })
  .catch(function() {
    res.send('Uh-oh! Something went wrong')
  })
})

router.get('*', function(req, res) {
  res.send('Welcome to vendingMachineAPI')
})

module.exports = router
