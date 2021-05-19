const path = require('path');

const express = require('express');

const { check, body } = require('express-validator/check');

const adminController = require('../controllers/admin');

const isAuth = require('../middleware/is-auth');

const isAdmin = require('../middleware/is-admin');
const isRoled = require('../middleware/check-role');

const router = express.Router();



router.get('/', adminController.getLogin);
router.get('/login', adminController.getLogin);
router.post('/login', adminController.postLogin);


router.get('/logout', adminController.postLogout);

router.get('/dashboard', isAdmin, adminController.dashboard);





router.get('/shipments', isAdmin, isRoled.check('shipments', 'get', true), adminController.shipments);
router.get('/api/shipments', isAdmin, isRoled.check('shipments', 'get', false), adminController.getShipments);
router.post('/api/shipments', isAdmin, isRoled.check('shipments', 'create', false), adminController.createShipment);
router.put('/api/shipments/:id', isAdmin, isRoled.check('shipments', 'edit', false), adminController.editShipment);
router.put('/api/shipments/status/:id', isAdmin, isRoled.check('shipments', 'edit', false), adminController.changeStatus);
router.put('/api/shipments/assign/:id', isAdmin, isRoled.check('shipments', 'edit', false), adminController.assignDriver);
router.delete('/api/shipments/:id', isAdmin, isRoled.check('shipments', 'delete', false), adminController.deleteShipment);


router.get('/customers', isAdmin, isRoled.check('customers', 'get', true), adminController.customers);
router.get('/api/customers', isAdmin, isRoled.check('customers', 'get', false), adminController.getCustomers);
router.post('/api/customers', isAdmin, isRoled.check('customers', 'create', false), adminController.createCustomer);
router.get('/api/customers/shipments/:id', isAdmin, isRoled.check('customers', 'get', false), adminController.customerShipments);
router.put('/api/customers/:id', isAdmin, isRoled.check('customers', 'edit', false), adminController.editCustomer);
router.delete('/api/customers/:id', isAdmin, isRoled.check('customers', 'delete', false), adminController.deleteCustomer);




router.get('/drivers', isAdmin, isRoled.check('drivers', 'get', true), adminController.drivers);
router.get('/api/drivers', isAdmin, isRoled.check('drivers', 'get', false), adminController.getDrivers);
router.post('/api/drivers', isAdmin, isRoled.check('drivers', 'create', false), adminController.createDriver);
// router.put('/api/drivers/assign/:id', isAdmin, adminController.assignDriver);
router.get('/api/drivers/shipments/:id', isAdmin, isRoled.check('drivers', 'get', false), adminController.driverShipments);
router.put('/api/drivers/:id', isAdmin, isRoled.check('drivers', 'edit', false), adminController.editDriver);
router.delete('/api/drivers/:id', isAdmin, isRoled.check('drivers', 'delete', false), adminController.deleteDriver);




router.get('/zones', isAdmin, isRoled.check('zones', 'get', true), adminController.zones);
router.get('/api/zones', isAdmin, isRoled.check('zones', 'get', false), adminController.getZones);
router.post('/api/zones', isAdmin, isRoled.check('zones', 'create', false), adminController.createZone);
router.delete('/api/zones/:id', isAdmin, isRoled.check('zones', 'delete', false), adminController.deleteZone);
router.put('/api/zones/:id', isAdmin, isRoled.check('zones', 'edit', false), adminController.editZone);




router.get('/vehicles', isAdmin, isRoled.check('fleets', 'get', true), adminController.vehicles);
router.get('/api/vehicles', isAdmin, isRoled.check('fleets', 'get', false), adminController.getVehicle);
router.post('/api/vehicles', isAdmin, isRoled.check('fleets', 'create', false), adminController.createVehicle);
router.put('/api/vehicles/:id', isAdmin, isRoled.check('fleets', 'edit', false), adminController.editVehicle);
router.put('/api/vehicles/assign/:id', isAdmin, isRoled.check('fleets', 'edit', false), adminController.assignDriverToVehicle);
router.delete('/api/vehicles/:id', isAdmin, isRoled.check('fleets', 'delete', false), adminController.deleteVehicle);





router.get('/bills', isAdmin, isRoled.check('bills', 'get', true), adminController.bills)
router.get('/api/bills', isAdmin, isRoled.check('bills', 'get', false), adminController.getAllbills)
router.post('/api/bills', isAdmin, isRoled.check('bills', 'create', false), adminController.createBill)
router.delete('/api/bills/:id', isAdmin, isRoled.check('bills', 'delete', false), adminController.deleteBill)
// router.post('/api/bills/edit', isAdmin, adminController.editExpenses)
router.get('/api/bills/date', isAdmin, isRoled.check('bills', 'get', false), adminController.getExpensesByDate)
router.put('/api/bills/:id/paid', isAdmin, isRoled.check('bills', 'edit', false), adminController.paidStatus)





router.get('/inventory', isAdmin, isRoled.check('inventory', 'get', true), adminController.inventory);
router.get('/api/inventory', isAdmin, isRoled.check('inventory', 'get', false), adminController.getInventory);
router.delete('/api/inventory/:id', isAdmin, isRoled.check('inventory', 'delete', false), adminController.deleteInventoryItem);

// router.post('/api/inventory', isAdmin, adminController.createShipment);
// router.put('/api/inventory/:id', isAdmin, adminController.editShipment);
// router.put('/api/inventory/status/:id', isAdmin, adminController.changeStatus);
// router.put('/api/inventory/assign/:id', isAdmin, adminController.assignDriver);

router.get('/chat', isAdmin, adminController.chat);


router.get('/settings', isAdmin, adminController.settings);
router.get('/settings/account', isAdmin, adminController.accountSettings);
router.post('/settings/info', isAdmin, adminController.updateInfo);
router.post('/settings/password', isAdmin, adminController.changePassword);


router.get('/settings/admins', isAdmin, adminController.admins);
router.get('/settings/new-admin', isAdmin, adminController.createAdmin);
router.post('/settings/new-admin', isAdmin, adminController.postAdmin);
router.post('/settings/admins/:id', isAdmin, adminController.deleteAdmin);


router.get('/settings/roles', isAdmin, adminController.roles);
router.post('/api/settings/roles', isAdmin, adminController.createRole);
router.delete('/api/settings/roles/:role', isAdmin, adminController.deleteRole);

router.get('/reports', isAdmin, adminController.reports);


module.exports = router;
