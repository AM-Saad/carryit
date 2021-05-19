const path = require('path');

const express = require('express');

const { check, body } = require('express-validator/check');

const apiController = require('../controllers/api');

const isAuth = require('../middleware/is-auth');

const token = require('../middleware/api-auth');

const router = express.Router();


router.get('/v1/shipments', token, apiController.shipments)
router.post('/v1/shipments', token, apiController.postShipment)
router.get('/v1/shipments/:id', token, apiController.shipment)


module.exports = router;
