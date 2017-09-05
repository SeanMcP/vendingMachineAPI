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
    // res.send(sendMessage('success', data))
    res.status(200).send(sendMessage('success', data))
  })
  .catch(function(err) {
    res.status(403).send(sendMessage('fail', err))
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
      .then(function(purchase) {

        models.Item.update({
            quantity: data.quantity - 1
          },
          { where: { id: req.params.itemId }
        })
        .then(function(updatedItem) {
          res.status(200).send(sendMessage('success', updatedItem))
        })
        .catch(function(err) {
          res.status(304).send(sendMessage('fail', err))
        })

      })
      .catch(function(err) {
        res.status(304).send(sendMessage('fail', err))
      })
    } else if(data.quantity <= 0) {
      res.status(403).send(sendMessage('fail', err))
    } else {
      let message = {
        moneyGiven: req.body.moneyGiven,
        moneyRequired: data.price,
        difference: data.price - req.body.moneyGiven
      }
      res.status(400).send(sendMessage('fail', message))
    }
  })
  .catch(function(err) {
    res.status(403).send(sendMessage('fail', err))
  })
})


router.post('/api/vendor/items', function(req, res) {

  let newItem = {
    name: req.body.name,
    price: req.body.price,
    quantity: req.body.quantity
  }

  models.Item.create(newItem)
  .then(function(data) {
    res.status(200).send(sendMessage('success', data))
  })
  .catch(function(err) {
    res.status(304).send(sendMessage('fail', err))
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
  .then(function(data) {
    res.status(200).send(sendMessage('success', data))
  })
  .catch(function(err) {
    res.status(304).send(sendMessage('fail', err))
  })
})

router.get('/api/vendor/purchases', function(req, res) {
  models.Purchase.findAll()
  .then(function(data) {
    res.status(200).send(sendMessage('success', data))
  })
  .catch(function(err) {
    res.status(403).send(sendMessage('fail', err))
  })
})

router.get('/api/vendor/money', function(req, res) {
  models.Purchase.sum('moneyRequired')
  .then(function(sum) {
    res.status(200).send(sendMessage('success', sum))
  })
  .catch(function(err) {
    res.status(403).send(sendMessage('fail', err))
  })
})

module.exports = router
