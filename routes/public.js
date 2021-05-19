const express = require('express');

const { check, body } = require('express-validator/check');

const publicController = require('../controllers/public');

const router = express.Router();

router.get('/', publicController.home);
router.get('/about', publicController.about);
router.get('/contact', publicController.contact);

router.get('/shipment/:id', publicController.shipment);

// router.get('/:filename', async function (req, res) {
//     console.log(req.params);
//     if (req.params.filename == 'manifest.json') {
//         res.sendFile(path.resolve('./manifest.json'))

//     } else if (req.params.filename == 'service_worker.js') {
//         res.sendFile(path.resolve('./service_worker.js'))
//     }
// })


module.exports = router;