const User = require("../models/User");
const Shipment = require("../models/Shipment");
const fs = require('fs')
const msg = require("../util/message");
const { validationResult } = require("express-validator/check");
const mongoose = require("mongoose");


const { formatDate } = require("../models/helpers/formatDate");
const { validateShipment } = require("../models/helpers/shipment");

exports.shipments = async (req, res, next) => {

  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'Cannot Compelete This Proccess', reason: 'User Not Exist!' })
    const userToken = user.integrationTokens.find(t => t.token === req.token)
    if (!userToken) return res.status(404).json({ message: 'Cannot Compelete This Proccess', reason: 'This Token Not Exist' })

    const shipments = await Shipment.find({ user: req.user._id })
    return res.status(200).json({ shipments: shipments })
  } catch (error) {
    return res.status(500).json({ error: error })
  }

};

exports.postShipment = async (req, res, next) => {
  const { pickup, receiver, is_liquid, is_fragile, quantity, desc, price, notes, pickup_date, delivery_date, shipping_price, customerId } = req.body
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'Cannot Compelete This Proccess', reason: 'User Not Exist!' })
    const userToken = user.integrationTokens.find(t => t.token === req.token)
    if (!userToken) return res.status(404).json({ message: 'Cannot Compelete This Proccess', reason: 'This Token Not Exist' })

    const valid = validateShipment(pickup, receiver, price, quantity, pickup_date, delivery_date)
    if (!valid.state) return res.status(400).json({ message: 'Error, Not Valid Info', reason: valid.reason })
    const date = formatDate(new Date())

    const zone = await Zone.findOne({ zoneId: req.body.recarea })
    if (!zone || !zone.active) {
      req.flash('alert', "We're sorry, this zone is out of work temporarily")
      return res.redirect('/user/shipments')
    }
    receiver.zone.name = zone.name

    const newShipment = new Shipment({
      user: req.user._id,
      pickup: pickup,
      receiver: receiver,
      is_liquid: typeof is_liquid == Boolean ? is_liquid : '0',
      is_fragile: typeof is_fragile == Boolean ? is_liquid : '0',
      price: price,
      quantity: quantity,
      desc: desc,
      notes: notes,
      status: {
        no: 1,
        text: 'Waiting For Actions'
      },
      shipping_price: zone.shipping,
      date: date,
      pickup_date,
      delivery_date,
      customerId: customerId
    })
    await newShipment.save()
    return res.status(200).json({ shipment: newShipment })

  } catch (error) {

    return res.status(500).json({ error: error })
  }
}

exports.shipment = async (req, res, next) => {
  const id = req.params.id

  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'Cannot Compelete This Proccess', reason: 'User Not Exist!' })
    const userToken = user.integrationTokens.find(t => t.token === req.token)
    if (!userToken) return res.status(404).json({ message: 'Cannot Compelete This Proccess', reason: 'This Token Not Exist' })

    const shipment = await Shipment.findOne({ shipmentId: id })
    if (shipment) return res.status(404).json({ message: 'Cannot Compelete This Proccess', reason: 'Shipment Number Invalid' })
    return res.status(200).json({ shipment: shipment })
  } catch (error) {
    return res.status(500).json({ error: error })
  }
};