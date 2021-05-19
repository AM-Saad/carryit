const path = require('path');

const express = require('express');

const { check, body } = require('express-validator/check');

const driverController = require('../controllers/driver');

const isAuth = require('../middleware/is-auth');

const isDriver = require('../middleware/is-driver');

const router = express.Router();



router.get('/', driverController.getLogin);
router.get('/login', driverController.getLogin);
router.post('/login', driverController.postLogin);


router.get('/logout', driverController.postLogout);

router.get('/dashboard', isDriver, driverController.dashboard);
router.get('/shipments', isDriver, driverController.shipments);
router.get('/commissions', isDriver, driverController.comissions);
router.get('/custody', isDriver, driverController.custody);


router.get('/shipment/:id', isDriver, driverController.shipment);
router.post('/shipment/move', isDriver, driverController.startTrip);


router.get('/chat', isDriver, driverController.chat);




// router.get('/settings', isDriver, driverController.settings);
// router.post('/settings/info', isDriver, driverController.updateInfo);
// router.post('/settings/password', isDriver, driverController.changePassword);
// router.post('/settings/new-admin', isDriver, driverController.newAdmin);


module.exports = router;
