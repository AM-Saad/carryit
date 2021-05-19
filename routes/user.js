const express = require('express');

const { check, body } = require('express-validator/check');

const UserController = require('../controllers/user');

const router = express.Router();
const isAuth = require('../middleware/is-auth');

router.get('/shipments/', isAuth, UserController.shipments);
// router.get('/shipment/:id', UserController.shipment);

router.post('/order/', isAuth, UserController.neworder);
router.post('/order/cancel', isAuth, UserController.cancel);


router.get('/tokens/', isAuth, UserController.tokens);
router.post('/tokens', isAuth, UserController.newToken);
router.get('/tokens/delete/:id', isAuth, UserController.deleteToken);

router.get('/tracking', isAuth, UserController.tracking);
router.post('/tracking', isAuth, UserController.trackShipment);

router.get('/settings', isAuth, UserController.settings);
router.post('/settings/info', isAuth, UserController.updateInfo);
router.post('/settings/password', isAuth, UserController.changePassword);



module.exports = router;