const User = require("../models/User");
const Driver = require("../models/Driver");
const Admin = require("../models/Admin");
const Shipment = require("../models/Shipment");
const Bill = require("../models/Bill");
const Zone = require("../models/Zone");
const Inventory = require("../models/Inventory");
const Company = require("../models/Company");
const Chat = require("../models/Chat");
const fs = require('fs')
const msg = require("../util/message");
const { validationResult } = require("express-validator/check");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const moment = require('moment');
const Vehicle = require("../models/Vehicle");
const { validateShipment } = require("../models/helpers/shipment");
const { formatDate } = require("../models/helpers/formatDate");




exports.dashboard = async (req, res, next) => {

  try {
    const to = moment().format('YYYY-MM-DD')
    const from = moment().subtract(1, 'days').format('YYYY-MM-DD')
    const shipments = await Shipment.find({
      date: { $gte: from, $lte: to }
    })
    const shipedToday = await Shipment.find({ delivery_date: to })
    const pickedToday = await Shipment.find({ pickup_date: to })
    const salesNumber = await Shipment.find({}).countDocuments()
    const customers = await User.find({})

    return res.render("admin/dashboard", {
      users: [],
      orders: [],
      pageTitle: "Dashboard",
      path: "/dashboard",
      shipments: shipments,
      totalSalesPrice: 0,
      customerslenght: customers.length,
      salesNumber: salesNumber,
      customers: customers,
      isAuth: req.session.isLoggedIn,
      user: req.session.user,
      shipedToday: shipedToday,
      pickedToday: pickedToday
    });
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

};






exports.getLogin = async (req, res, next) => {

  // const hashedPassword = await bcrypt.hash('bodakaka', 12)
  // const newAdmin = new Admin({
  //   name: 'Abdelrhman',
  //   mobile: '01156565910',
  //   password: hashedPassword,
  //   isAdmin: true
  // })
  // await newAdmin.save()
  if (req.session.isLoggedIn && req.session.user.isAdmin) return res.redirect('/admin/dashboard')
  return res.render("admin/auth/login", {
    path: "/login",
    pageTitle: "Admin",
    errmsg: null,
    succmsg: null,
    isAuth: req.session.isLoggedIn,
    user: req.session.user

  });
};

exports.postLogin = async (req, res, next) => {
  const mobile = req.body.mobile;
  const password = req.body.password;
  try {
    const user = await Admin.findOne({ mobile: mobile })
    console.log(user);
    if (!user) {
      return res.render("admin/auth/login", {
        path: "/login",
        pageTitle: "Admin",
        errmsg: "Make sure you entered a valid mobile and password!!",
        succmsg: null,
        isAuth: req.session.isLoggedIn,
        user: req.session.user
      });
    }

    const doMatch = await bcrypt.compare(password, user.password)
    if (!doMatch) {
      return res.render("admin/auth/login", {
        path: "/login",
        pageTitle: "Admin",
        errmsg: "Make sure you entered a valid mobile and password!!",
        succmsg: null,
        isAuth: req.session.isLoggedIn,
        user: req.session.user
      });
    }
    const company = await Company.findOne({})
    req.session.isLoggedIn = true;
    req.session.user = user;
    req.session.isAdmin = true
    req.session.company = company
    await req.session.save(err => {
      console.log(req.session);

      return res.redirect('/admin/dashboard')
    });
  } catch (error) {

  }



};



exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect("/");
  });
};







exports.shipments = async (req, res, next) => {

  return res.render("admin/shipments", {
    path: "/shipments",
    pageTitle: "Shipments",
    isAuth: req.session.isLoggedIn,
    user: req.session.user

  });
}


exports.getShipments = async (req, res, next) => {
  const fromDate = req.query.from;
  const toDate = req.query.to;
  let query = {}
  if (req.query) {
    if (req.query.no) {
      query = { shipmentNo: req.query.no }
    } else if (req.query.status) {
      query = { 'status.no': req.query.status }
    } else if (req.query.id) {
      query = { _id: req.query.id }
    } else if (req.query.zone) {
      query = { 'receiver.zone.zoneId': req.query.zone }
    } else {
      query = { [req.query.type]: { $gte: fromDate, $lte: toDate } }
    }
  }
  try {
    const shipments = await Shipment.find(query)
    return res.status(200).json({ shipments: shipments, message: 'Shipments Fetched', messageType: 'success' })
  } catch (error) { return res.status(500).json({ message: ' cannot fetched', messageType: 'danger' }) }
}


exports.createShipment = async (req, res, next) => {
  const { pickup, receiver, is_liquid, is_fragile, quantity, desc, price, notes, pickup_date, delivery_date, customerId } = req.body
  try {
    const valid = validateShipment(pickup, receiver, parseInt(price, 10), parseInt(quantity, 10), pickup_date, delivery_date)
    if (!valid.state) return res.status(400).json({ message: 'Error, Not Valid Info The Reason is' + valid.reason, reason: valid.reason })
    const date = formatDate(new Date())

    const pickupzone = await Zone.findOne({ zoneId: pickup.zone.zoneId })
    const deliveryzone = await Zone.findOne({ zoneId: receiver.zone.zoneId })
    if (!pickupzone.active) return res.status(401).json({ message: `${pickupzone.name} zone is inactive`, messageType: 'alert' })
    if (!deliveryzone.active) return res.status(401).json({ message: `${deliveryzone.name} zone is inactive`, messageType: 'alert' })
    receiver.zone.name = deliveryzone.name
    pickup.zone.name = pickupzone.name

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
        no: 2,
        text: "في المقر"
      },
      shipping_price: deliveryzone.shipping,
      date: date,
      pickup_date,
      delivery_date,
      customerId: customerId || null
    })
    await newShipment.save()
    deliveryzone.shipments.push({ id: newShipment._id, no: newShipment.shipmentNo, delivery: true })
    pickupzone.shipments.push({ id: newShipment._id, no: newShipment.shipmentNo, delivery: false })
    await deliveryzone.save()
    await pickupzone.save()
    return res.status(200).json({ shipment: newShipment, message: "Created", messageType: 'success' })

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error })
  }
}
exports.editShipment = async (req, res, next) => {

}

exports.changeStatus = async (req, res, next) => {
  const id = req.params.id
  const status = parseInt(req.body.status, 10)

  try {
    const shipment = await Shipment.findOne({ shipmentNo: id })
    if (!shipment) return res.status(404).json({ message: 'Something went wrong, please try again', messageType: 'alert' })
    const inventory = await Inventory.findOne()
    let exist = inventory.items.findIndex(s => s.id.toString() === shipment._id.toString())
    const today = moment().format('YYYY-MM-DD')
    if (exist === -1) {
      inventory.items.push({
        shipmentNo: shipment.shipmentNo,
        id: shipment._id,
        price: shipment.price,
        entry_date: today,
        by: { name: req.user.name, id: req.user._id },
        leaved_date: null,
        changed_date: null,
        in: false
      })
      exist = inventory.items.findIndex(s => s.id.toString() === shipment._id.toString())
    }


    if (status == 5 || status == 6) {
      inventory.items[exist].notes = req.body.reason
    }
    inventory.items[exist].changed_date = today
    inventory.items[exist].by = { name: req.user.name, id: req.user._id }


    switch (status) {
      case 2:
        inventory.items[exist].status = { no: status, text: 'في المقر' }
        shipment.status = { no: status, text: 'في المقر' }
        inventory.items[exist].in = true
        inventory.items[exist].leaved_date = null

        break
      case 3:
        inventory.items[exist].status = { no: status, text: 'في الطريق' }
        shipment.status = { no: status, text: 'في الطريق' }
        inventory.items[exist].leaved_date = null

        break
      case 4:
        inventory.items[exist].status = { no: status, text: 'تم التوصيل' }
        shipment.status = { no: status, text: 'تم التوصيل' }
        inventory.items[exist].in = false
        inventory.items[exist].leaved_date = today
        break
      case 5:
        inventory.items[exist].status = { no: status, text: 'مرتجع' }
        shipment.status = { no: status, text: 'مرتجع', reason: req.body.reason }
        break
      case 6:
        inventory.items[exist].status = { no: status, text: 'ملغاه', }
        shipment.status = { no: status, text: 'ملغاه', reason: req.body.reason }
        break
      default:
        break;
    }
    inventory.items[exist].history.push({
      by: { name: req.user.name, id: req.user._id },
      date: moment().format('YYYY-MM-DD:hh-mm-ss'),
      status: shipment.status
    })
    await inventory.save()
    await shipment.save()
    return res.status(200).json({ shipment: shipment, message: 'تم تعديل الشحنه', messageType: 'success' })


  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })

  }
}


exports.deleteShipment = async (req, res, next) => {
  const id = req.params.id
  try {
    const shipment = await Shipment.findOne({ _id: id })
    if (!shipment) return res.status(404).json({ message: 'Cannot find matched shipment!!', messageType: 'info' })
    await shipment.remove()
    return res.status(200).json({ message: 'Shipment Delete', messageType: 'success' })
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })
  }
}

exports.drivers = async (req, res, next) => {

  return res.render("admin/drivers", {
    path: "/drivers",
    pageTitle: "Drivers",
    isAuth: req.session.isLoggedIn,
    user: req.session.user

  });
}


exports.getDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find()
    return res.status(200).json({ drivers: drivers, message: 'customer fetched', messageType: 'success' })
  } catch (error) { return res.status(500).json({ message: ' cannot fetched', messageType: 'danger' }) }
}


exports.createDriver = async (req, res, next) => {
  const { name, mobile, address, email, notes, basesalary, commission } = req.body
  console.log(req.body);
  try {
    const driver = await Driver.findOne({ mobile: mobile })
    if (driver) return res.status(400).json({ message: 'Driver with same number already exist', messageType: 'info' })

    let profileImage;
    if (req.file === undefined) {
      profileImage = 'images/emp.png'
    } else {
      profileImage = req.file.path.replace("\\", "/");
    }
    const hashedPassword = await bcrypt.hash('123456789', 12)

    const newDriver = new Driver({
      name: name.toLowerCase(),
      mobile: mobile,
      password: hashedPassword,
      address: address,
      email: email,
      image: profileImage,
      shipments: [],
      notes: notes,
      salary: {
        commission: commission,
        base_salary: baseSalary
      }
    })
    await newDriver.save()
    return res.status(200).json({ driver: newDriver, message: 'Driver Created', messageType: 'success' })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: ' cannot Created', messageType: 'danger' })
  }
}
exports.editDriver = async (req, res, next) => {
  const id = req.params.id

  try {
    const driver = await Driver.findOne({ _id: id })
    if (!driver) return res.status(404).json({ message: 'Cannot find matched driver!!', messageType: 'info' })

    if (req.file === undefined) {
      profileImage = driver.image
    } else {
      profileImage = req.file.path.replace("\\", "/");
    }
    driver.name = req.body.name.toLowerCase();
    driver.address = req.body.address
    driver.mobile = req.body.mobile
    driver.email = req.body.email
    driver.note = req.body.note
    driver.image = profileImage
    driver.salary = {
      commission: req.body.commission,
      base_salary: req.body.baseSalary
    }
    await driver.save()
    return res.status(200).json({ message: 'Driver Updated', messageType: 'success', driver: driver })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })
  }
}





exports.assignDriver = async (req, res, next) => {
  const id = req.params.id
  const driverId = req.query.driver
  console.log(driverId);
  try {
    let driver;

    if (!driverId) return res.status(404).json({ message: 'Driver Number Not Provided!', messageType: 'info' })

    const shipment = await Shipment.findOne({ shipmentNo: id })
    if (!shipment) return res.status(404).json({ message: 'Invalid Shipment Info!', messageType: 'warning' })

    if (shipment.driver.id) {
      const olddriver = await Driver.findOne({ _id: shipment.driver.id })
      olddriver.shipments = olddriver.shipments.filter(s => s.id.toString() != shipment._id.toString())
      await olddriver.save()
    }
    if (driverId === 'none') {
      shipment.driver = null
    } else {

      driver = await Driver.findOne({ _id: driverId })
      if (!driver) return res.status(404).json({ message: 'Cannot find matched driver!!', messageType: 'warning' })
      driver.shipments = driver.shipments.filter(s => s._id.toString() != id.toString())
      driver.shipments.push({ id: shipment._id, no: shipment.shipmentNo })
      shipment.driver = { name: driver.name, id: driver._id, mobile: driver.mobile, assignedAt: moment().format('YYYY-MM-DD') }
      await driver.save()
    }
    await shipment.save()
    return res.status(200).json({ message: `${shipment.driver.id ? `Shipment Assigned To ${driver.name}` : 'Shipment Not Has Driver'}`, messageType: 'success', shipment: shipment, driver: driver })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })
  }
}
exports.driverShipments = async (req, res, next) => {
  const id = req.params.id
  const fromDate = req.query.from;
  const toDate = req.query.to;
  try {
    let query = {}
    if (req.query) {
      if (req.query.no) {
        query = { shipmentNo: req.query.no, 'driver.id': id }
      } else if (req.query.status) {
        query = { 'status.no': req.query.status, 'driver.id': id }
      } else if (req.query.id) {
        query = { _id: req.query.id, 'driver.id': id }
      } else {
        console.log(req.query);
        query = { [req.query.type]: { $gte: fromDate, $lte: toDate }, 'driver.id': id }
      }
    }
    const driver = await Driver.findById(id)
    if (!driver) return res.status(404).json({ message: 'Driver Not Found!, try to refresh the page', messageType: 'info' })
    const shipments = await Shipment.find(query)
    return res.status(200).json({ message: `Shipments Fetched`, messageType: 'success', shipments: shipments })

  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })

  }
}
exports.deleteDriver = async (req, res, next) => {
  const id = req.params.id
  try {
    const driver = await Driver.findOne({ _id: id })
    if (!driver) return res.status(404).json({ message: 'Cannot find matched driver!!', messageType: 'info' })
    await driver.remove()
    return res.status(200).json({ message: 'Driver Delete', messageType: 'success' })
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })
  }
}


exports.customers = async (req, res, next) => {

  return res.render("admin/customers", {
    path: "/customers",
    pageTitle: "Customers",
    isAuth: req.session.isLoggedIn,
    user: req.session.user

  });
}


exports.getCustomers = async (req, res, next) => {
  try {
    const customers = await User.find()
    return res.status(200).json({ customers: customers, message: 'customer fetched', messageType: 'success' })
  } catch (error) { return res.status(500).json({ message: ' cannot fetched', messageType: 'danger' }) }
}


exports.createCustomer = async (req, res, next) => {
  const { name, mobile, address, email, notes } = req.body
  console.log(req.body);
  try {
    const customer = await User.findOne({ mobile: mobile })
    if (customer) return res.status(400).json({ message: 'Customer with same number already exist', messageType: 'info' })

    let profileImage;
    if (req.file === undefined) {
      profileImage = 'images/emp.png'
    } else {
      profileImage = req.file.path.replace("\\", "/");
    }
    const hashedPassword = await bcrypt.hash('123456789', 12)

    const newCustomer = new User({ name: name.toLowerCase(), mobile: mobile, password: hashedPassword, address: address, email: email, image: profileImage, shipments: [], notes: notes })
    await newCustomer.save()
    return res.status(200).json({ customer: newCustomer, message: 'Customeer Created', messageType: 'success' })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: ' cannot Created', messageType: 'danger' })
  }
}
exports.editCustomer = async (req, res, next) => {
  const id = req.params.id

  try {
    const customer = await User.findOne({ _id: id })
    if (!customer) return res.status(404).json({ message: 'Cannot find matched customer!!', messageType: 'info' })

    if (req.file === undefined) {
      profileImage = customer.image
    } else {
      profileImage = req.file.path.replace("\\", "/");
    }
    customer.name = req.body.name.toLowerCase();
    customer.address = req.body.address
    customer.mobile = req.body.mobile
    customer.email = req.body.email
    customer.note = req.body.note
    customer.image = profileImage
    await customer.save()
    return res.status(200).json({ message: 'customer Updated', messageType: 'success', customer: customer })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })
  }
}

exports.customerShipments = async (req, res, next) => {
  const id = req.params.id
  try {
    const customer = await User.findById(id)
    if (!customer) return res.status(404).json({ message: 'Customer Not Found!, try to refresh the page', messageType: 'info' })
    const shipments = await Shipment.find({ user: id })
    return res.status(200).json({ message: `Shipments Fetched`, messageType: 'success', shipments: shipments, customer })

  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })

  }
}
exports.deleteCustomer = async (req, res, next) => {
  const id = req.params.id
  try {
    const customer = await User.findOne({ _id: id })
    if (!customer) return res.status(404).json({ message: 'Cannot find matched customer!!', messageType: 'info' })
    await customer.remove()
    return res.status(200).json({ message: 'customer Delete', messageType: 'success' })
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })
  }
}


exports.zones = async (req, res, next) => {

  return res.render("admin/zones", {
    path: "/zones",
    pageTitle: "Zones",
    isAuth: req.session.isLoggedIn,
    user: req.session.user

  });
}


exports.getZones = async (req, res, next) => {
  try {
    const zones = await Zone.find()
    return res.status(200).json({ zones: zones, message: 'Zones Fetched', messageType: 'success' })
  } catch (error) { return res.status(500).json({ message: ' cannot fetched', messageType: 'danger' }) }
}



exports.createZone = async (req, res, next) => {
  const { name, id, shipping, governorate, notes, delivery, pickup } = req.body
  console.log(req.body);
  try {
    const zone = await Zone.findOne({ name: name, governorate: governorate })
    if (zone) return res.status(400).json({ message: `zone with same name in ${governorate} already exist`, messageType: 'info' })



    const newZone = new Zone({ name: name.toLowerCase(), zoneId: id, shipping: shipping, shipments: [], governorate: governorate, notes: notes, delivery: delivery, pickup: pickup })
    await newZone.save()
    return res.status(200).json({ zone: newZone, message: 'Zone Created', messageType: 'success' })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: ' cannot Created', messageType: 'danger' })
  }
}
exports.deleteZone = async (req, res, next) => {
  const id = req.params.id
  try {
    const zone = await Zone.findOne({ _id: id })
    if (!zone) return res.status(404).json({ message: 'Cannot find matched zone!!', messageType: 'info' })
    await zone.remove()
    return res.status(200).json({ message: 'zone Delete', messageType: 'success' })
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })
  }
}

exports.editZone = async (req, res, next) => {
  const id = req.params.id

  try {
    const zone = await Zone.findOne({ _id: id })
    if (!zone) return res.status(404).json({ message: 'Cannot find matched zone!!', messageType: 'info' })


    zone.name = req.body.name.toLowerCase();
    zone.zoneId = req.body.id
    zone.governorate = req.body.governorate
    zone.shipping = req.body.shipping
    zone.notes = req.body.notes
    zone.delivery = req.body.delivery
    zone.pickup = req.body.pickup
    await zone.save()
    return res.status(200).json({ message: 'zone Updated', messageType: 'success', zone: zone })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })
  }
}





exports.vehicles = async (req, res, next) => {

  return res.render("admin/vehicles", {
    path: "/vehicles",
    pageTitle: "Vehicles",
    isAuth: req.session.isLoggedIn,
    user: req.session.user

  });
}


exports.getVehicle = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find()
    return res.status(200).json({ vehicles: vehicles, message: 'vehicles Fetched', messageType: 'success' })
  } catch (error) { return res.status(500).json({ message: ' cannot fetched', messageType: 'danger' }) }
}



exports.createVehicle = async (req, res, next) => {
  const { name, vehicle_type, active, fuel, notes } = req.body
  try {
    const newVehicle = new Vehicle({ name: name.toLowerCase(), vehicle_type: vehicle_type, fuel: JSON.parse(fuel), notes: notes, active: active })
    await newVehicle.save()
    return res.status(200).json({ vehicle: newVehicle, message: 'vehicle Created', messageType: 'success' })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: ' cannot Created', messageType: 'danger' })
  }
}
exports.deleteVehicle = async (req, res, next) => {
  const id = req.params.id
  try {
    const vehicle = await Vehicle.findOne({ _id: id })
    if (!vehicle) return res.status(404).json({ message: 'Cannot find matched vehicle!!', messageType: 'info' })
    await vehicle.remove()
    return res.status(200).json({ message: 'vehicle Delete', messageType: 'success' })
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })
  }
}

exports.editVehicle = async (req, res, next) => {
  const id = req.params.id
  console.log(req.body);
  try {
    const vehicle = await Vehicle.findOne({ _id: id })
    if (!vehicle) return res.status(404).json({ message: 'Cannot find matched vehicle!!', messageType: 'info' })


    vehicle.name = req.body.name.toLowerCase();
    vehicle.vehicle_type = req.body.vehicle_type
    vehicle.fuel = JSON.parse(req.body.fuel)
    vehicle.active = req.body.active
    vehicle.notes = req.body.notes
    await vehicle.save()
    return res.status(200).json({ message: 'vehicle Updated', messageType: 'success', vehicle: vehicle })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })
  }
}

exports.assignDriverToVehicle = async (req, res, next) => {
  const id = req.params.id
  const driverId = req.query.driver
  try {
    const vehicle = await Vehicle.findOne({ _id: id })
    if (!vehicle) return res.status(404).json({ message: 'Cannot find matched vehicle!!', messageType: 'alert' })
    if (driverId != 'none') {
      const driver = await Driver.findOne({ _id: driverId })
      if (!driver) return res.status(404).json({ message: 'Cannot find matched driver!!', messageType: 'alert' })
      vehicle.driver = { name: driver.name, id: driver._id }
      driver.vehicle = { name: vehicle.name, id: vehicle._id }
      await driver.save()

    } else {
      if (vehicle.driver) {
        const driver = await Driver.findOne({ _id: vehicle.driver.id })
        driver.vehicle = null
        await driver.save()
      }
      vehicle.driver = null

    }
    console.log(vehicle);
    await vehicle.save()
    return res.status(200).json({ message: 'Driver Assigned', messageType: 'success', vehicle: vehicle })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })
  }
}






exports.bills = async (req, res, next) => {
  return res.render(`admin/bills`, {
    path: "/bills",
    pageTitle: "bills",
    isAuth: req.session.isLoggedIn,
    user: req.session.user
  })
}

exports.getAllbills = async (req, res, next) => {
  const fromDate = req.query.from;
  const toDate = req.query.to;
  let query = {}
  if (req.query) {
    if (req.query.no) {
      query = { serialNo: req.query.no }
    } else if (req.query.category) {
      query = { category: req.query.category }
    } else if (req.query.id) {
      query = { _id: req.query.id }
    } else if (req.query.status) {
      query = { 'status.paid': req.query.status }
    } else {
      query = { [req.query.type]: { $gte: fromDate, $lte: toDate } }
    }
    console.log(query);
  }
  try {
    const bills = await Bill.find(query)
    return res.status(200).json({ bills: bills, message: 'Bills Fetched', messageType: 'success' })
  } catch (error) { return res.status(500).json({ message: ' cannot fetched', messageType: 'danger' }) }
}
exports.createBill = async (req, res, next) => {
  const { date, billtype, category, due, amount, notes, paid, itemId, itemname } = req.body

  try {

    const newBill = new Bill({
      shipment: {

      },
      billtype: billtype,
      category: category,
      itemId: itemId,
      itemname: itemname,
      notes: notes,
      amount: amount,
      date: moment().format('YYYY-MM-DD'),
      release_date: moment(date).format('YYYY-MM-DD'),
      due: moment(due).format('YYYY-MM-DD'),
      status: {
        paid: paid,
        changedBy: null,
        note: ''
      },
      creator: {
        name: req.user.name,
        id: req.user._id
      }
    })
    await newBill.save()

    if (category === 'commission' || category === "custody") {
      const driver = await Driver.findById(itemId)
      driver[category].push({ amount: amount, date: moment().format('YYYY-MM-DD'), done: paid, bill: newBill._id })
      await driver.save()
    }
    if (category === 'fuels' || category === 'maintenance') {
      const vehicles = await Vehicle.findById(itemId)
      console.log(vehicles);
      vehicles[category].push({ amount: amount, date: moment().format('YYYY-MM-DD'), done: paid, bill: newBill._id })
      await vehicles.save()
    }

    return res.status(200).json({ message: 'Bill Saved', messageType: 'success', bill: newBill })

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'cannot compelete the process, try to re-login', messageType: 'danger' })
  }
}
exports.assignExpenses = async (req, res, next) => {
  const expensesId = req.query.expensesId
  const employeeId = req.query.employeeId

  try {
    const employee = await Employee.findOne({ _id: employeeId })
    const expenses = await Expenses.findOne({ _id: expensesId })
    const assignedId = req.user._id
    const assignedName = req.user.name
    expenses.assignedTo = {
      id: employeeId,
      name: employee.name,
      department: employee.employeeState.department,
      position: employee.employeeState.position,
      assignedOn: formatDate.formatDate(new Date()),
      assignedBy: {
        id: assignedId,
        name: assignedName,
        position: req.user.role
      }
    }
    await expenses.save()

    //Send Notifications for employee
    const notification = notificationsMethods.create(req.company._id, req.user.name, expenses._id, `Mr. ${req.user.name} has assigned expenses to you <a href="/expenses">bill</a> `)

    const newNotify = new Notification(notification)
    await newNotify.save()
    employee.notifications.all.push(newNotify._id)
    employee.notifications.recent = (employee.notifications.recent + 1)
    await employee.save()
    return res.status(200).json({ message: 'Expenses Assigned', messageType: 'success' })

  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: 'cannot compelete the process, try to re-login', messageType: 'danger' })
  }
}
exports.paidStatus = async (req, res, next) => {
  const id = req.params.id

  let session

  try {
    session = await mongoose.startSession()
    session.startTransaction();

    const bill = await Bill.findOne({ _id: id })
    bill.status.paid = true

    if (bill.category == 'commission' || bill.category === "custody") {
      const driver = await Driver.findById(bill.itemId)
      if (driver) {
        const idx = driver[bill.category].findIndex(i => i.bill.toString() === bill._id.toString())
        driver[bill.category][idx].done = true
        console.log(driver);
        await driver.save({ session })
      }
    }
    await bill.save({ session })

    await session.commitTransaction()
    session.endSession()
    return res.status(200).json({ message: `تم الدفع`, messageType: 'success' })
  } catch (error) {
    console.log(error);
    await session.abortTransaction()
    return res.status(500).json({ message: 'cannot compelete the process, try to re-login', messageType: 'danger' })
  }
}
exports.deleteBill = async (req, res, next) => {
  const id = req.params.id
  try {
    const expenses = await Bill.findOne({ _id: id })

    await expenses.remove()
    return res.status(200).json({ message: 'Bill Deleted', messageType: 'success' })
    //Send Notifications for employee
  } catch (error) {
    return res.status(500).json({ message: 'cannot compelete the process, try to re-login', messageType: 'danger' })
  }
}

exports.getExpensesByDate = async (req, res, next) => {
  const fromDate = req.query.from;
  const toDate = req.query.to;
  const companyId = req.company._id;
  try {
    const expenses = await Expenses.find({ date: { $gte: fromDate, $lte: toDate }, company: companyId })
    return res.status(200).json({ expenses: expenses })
  } catch (err) { return res.status(500).json({ error: err, message: 'cannot compelete the process, try to re-login', messageType: 'danger' }) }
}
exports.getExpensesDuoTo = async (req, res, next) => {

  try {
    const expenses = await Expenses.find({ 'scheduled.date': req.params.date, company: req.company._id })
    return res.status(200).json({ expenses: expenses })
  } catch (err) { return res.status(500).json({ error: err, message: 'cannot compelete the process, try to re-login', messageType: 'danger' }) }
}
exports.expensesByType = async (req, res, next) => {
  try {
    const expenses = await Expenses.find({ type: req.query.type, company: req.company._id })
    return res.status(200).json({ expenses: expenses })
  } catch (err) { return res.status(500).json({ error: err, message: 'cannot compelete the process, try to re-login', messageType: 'error' }) }
}

exports.addExpensesType = async (req, res, next) => {
  try {
    const company = await Company.findOne({ _id: req.company._id })
    if (req.body.type == '') return res.status(404).json({ message: 'Add type name', messageType: 'info' })
    const exsistType = company.data.expensesTypes.filter(t => t === req.body.type)
    if (exsistType.length > 0) return res.status(404).json({ message: 'Exist type with same name', messageType: 'warning' })
    company.data.expensesTypes.push(req.body.type)
    await company.save()
    return res.status(200).json({ message: 'added', messageType: 'success', type: req.body.type })
  } catch (err) {
    return res.status(500).json({ error: err, message: 'cannot compelete the process, try to re-login', messageType: 'error' })
  }
}
exports.deleteExpensesType = async (req, res, next) => {
  const type = req.params.type
  try {
    const company = await Company.findOne({ _id: req.company._id })

    const oldtypes = company.data.expensesTypes.filter(t => t != type)
    company.data.expensesTypes = oldtypes

    await company.save()

    return res.status(200).json({ message: 'deleted', messageType: 'success', types: oldtypes })
  } catch (err) {

    return res.status(500).json({ error: err, message: 'cannot compelete the process, try to re-login', messageType: 'error' })
  }
}







exports.inventory = async (req, res, next) => {
  // const newIn = new Inventory({
  //   info: { name: 'الرئيسي', address: '1 Main St', phone: '01156565910' },
  //   items:[],
  //   locked:true,
  //   active:true,
  //   pin:'bodakaka'
  // })
  // await newIn.save()
  return res.render("admin/inventory", {
    path: "/inventory",
    pageTitle: "Inventory",
    isAuth: req.session.isLoggedIn,
    user: req.session.user

  });
}


exports.getInventory = async (req, res, next) => {
  const fromDate = req.query.from;
  const toDate = req.query.to;
  let query = {}
  if (req.query) {
    if (req.query.no) {
      query = { items: { $elemMatch: { shipmentNo: req.query.no } } }
    } else if (req.query.status) {
      query = { items: { $elemMatch: { 'status.no': req.query.status } } }
    } else if (req.query.id) {
      query = { items: { $elemMatch: { id: req.query.id } } }
    } else {
      query = { items: { $elemMatch: { [req.query.type]: { $gte: fromDate, $lte: toDate } } } }
    }
  }
  console.log(query);
  try {
    const inventory = await Inventory.find(query)
    return res.status(200).json({ inventory: inventory, message: 'Fetched', messageType: 'success' })
  } catch (error) { return res.status(500).json({ message: ' cannot fetched', messageType: 'danger' }) }
}


exports.deleteInventoryItem = async (req, res, next) => {
  const id = req.params.id
  try {
    const inventory = await Inventory.findOne()
    inventory.items = inventory.items.filter(i => i._id.toString() !== id.toString())
    await inventory.save()
    return res.status(200).json({ inventory: inventory, message: 'deleted', messageType: 'success' })
  } catch (error) {
    return res.status(500).json({ message: ' cannot Delete', messageType: 'danger' })
  }
}




exports.chat = async (req, res, next) => {
  const msgs = msg(req, res)
  try {
    const drivers = await Driver.find()
    // await Chat.deleteMany()
    const chats = await Chat.find({ admin: req.user._id })
    const admin = await Admin.find({ _id: req.user._id })

    const alldrivers = []

    for (const a of drivers) {
      const exist = chats.find(c => c.driver.toString() === a._id.toString())
      // console.log(exist);
      if (exist) {
        alldrivers.push({ _id: a._id, name: a.name, chatId: exist.chatId })
      } else {
        alldrivers.push({ _id: a._id, name: a.name, chatId: null })
      }
    }
    return res.render("admin/chat", {
      user: req.user,
      pageTitle: "المحدثات",
      path: "/chats",
      admin: admin,
      errmsg: msgs.err,
      succmsg: msgs.success,
      isAuth: req.session.isLoggedIn,
      alldrivers: alldrivers,

    });
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

};





exports.settings = async (req, res, next) => {
  const msgs = msg(req, res)

  try {

    const user = await Admin.findById(req.user._id)
    // const company = new Company({
    //   owner: { name: user.nmae, id: null },
    //   name: 'Carry It',
    //   address: '',
    //   subscriptions: {
    //     activated: true,
    //     trail: true,

    //     duration: {
    //       from: moment().format('YYYY-MM-DD'),
    //       to: moment().add(8, 'days').format('YYYY-MM-DD')
    //     },
    //     history: {
    //       activation_counts: 0,
    //       dates: [{
    //         data: moment().format('YYYY-MM-DD'),
    //         status: true
    //       }]
    //     },

    //   },
    //   secretKey: 12345,
    //   roles: [{
    //     name: 'super admin',
    //     permissions: [{
    //       name: 'all'
    //     }]
    //   }],
    // });
    // await company.save()

    if (!user) {
      req.flash('alert', 'حدث شئ خطا, برجاء اعاده تسجيل الدخول')
      return res.redirect('/admin/settings')
    }
    return res.render('admin/settings/main', {
      user: user,
      pageTitle: `Settings`,
      path: '/settings',
      errmsg: msgs.err,
      succmsg: msgs.success,
      isAuth: req.session.isLoggedIn,
      user: req.session.user
    })
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
}

exports.accountSettings = async (req, res, next) => {
  const msgs = msg(req, res)

  try {

    const user = await Admin.findById(req.user._id)
    if (!user) {
      req.flash('alert', 'حدث شئ خطا, برجاء اعاده تسجيل الدخول')
      return res.redirect('/admin/settings')
    }
    return res.render('admin/settings/main', {
      user: user,
      pageTitle: `${user.name}`,
      path: '/settings',
      errmsg: msgs.err,
      succmsg: msgs.success,
      isAuth: req.session.isLoggedIn,
      user: req.session.user
    })
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
}
exports.updateInfo = async (req, res, next) => {
  const { mobile, name } = req.body
  try {
    const user = await Admin.findOne({ _id: req.user._id })
    if (!user) {
      req.flash('alert', 'حدث شئ خطا, برجاء اعاده تسجيل الدخول')
      return res.redirect('/admin/settings')
    }

    if (!mobile || !name) {
      req.flash('alert', 'برجاء ادخال رقم الموبايل و الاسم')
      return res.redirect('/admin/settings')
    }

    user.mobile = mobile
    user.name = name
    await user.save()
    req.flash('success', 'تم التعديل')
    return res.redirect('/admin/settings')


  } catch (err) {
    console.log(err);

    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

}
exports.changePassword = async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body
  try {
    const user = await Admin.findOne({ _id: req.user._id })
    if (!user) {
      req.flash('alert', 'حدث شئ خطا, برجاء اعاده تسجيل الدخول')
      return res.redirect('/admin/settings')
    }
    const isMatched = await bcrypt.compare(oldPassword, user.password)
    if (!isMatched) {
      req.flash('alert', ' خطأ في رقم المرور القديم')
      return res.redirect('/admin/settings')
    }
    if (newPassword != confirmPassword) {
      req.flash('alert', 'رقم المرور غير متطابق')
      return res.redirect('/admin/settings')
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    user.password = hashedPassword
    await user.save()
    req.flash('success', ' تم تغير رقم المورور')
    return res.redirect('/admin/settings')


  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

}



exports.admins = async (req, res, next) => {
  const msgs = msg(req, res)

  try {
    const user = await Admin.findById(req.user._id)
    if (user.role !== 'super admin') return res.redirect('/admin/settings')
    const admins = await Admin.find()
    const company = await Company.findOne()
    if (!user) {
      req.flash('alert', 'حدث شئ خطا, برجاء اعاده تسجيل الدخول')
      return res.redirect('/admin/settings')
    }
    return res.render('admin/settings/admins', {
      user: user,
      pageTitle: `${user.name}`,
      path: '/settings',
      errmsg: msgs.err,
      succmsg: msgs.success,
      isAuth: req.session.isLoggedIn,
      user: req.session.user,
      admins: admins,
      company: company,

    })
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
}

exports.createAdmin = async (req, res, next) => {
  const msgs = msg(req, res)
  const id = req.query.id
  const edit = req.query.edit
  if (req.user.role !== 'super admin') return res.redirect('/admin/settings')

  try {
    let admin = null
    const company = await Company.findOne()
    console.log(edit);
    console.log(id);
    if (edit) {
      admin = await Admin.findById(id)
      console.log(admin);
    }
    return res.render('admin/settings/new-admins', {
      pageTitle: `${req.session.user.name}`,
      path: '/create-admin',
      errmsg: msgs.err,
      succmsg: msgs.success,
      isAuth: req.session.isLoggedIn,
      user: req.session.user,
      admin: admin,
      company: company,
      edit: edit

    })
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
}

exports.postAdmin = async (req, res, next) => {
  const { name, mobile, password, confirmPassword, role, department } = req.body
  try {
    if (!mobile || !name) {
      req.flash('alert', 'برجاء ادخال رقم الموبايل و الاسم')
      return res.redirect('/admin/settings')
    }

    const edit = req.query.edit
    if (edit) {
      const admin = await Admin.findById(req.body.id)
      admin.name = name
      admin.mobile = mobile
      admin.isAdmin = true
      admin.role = role
      admin.department = department
      await admin.save()
    } else {
      if (!password) {
        req.flash('alert', 'ادخل رقم المرور')
        return res.redirect('/admin/settings')
      }
      if (password != confirmPassword) {
        req.flash('alert', 'رقم المرور غير متطابق')
        return res.redirect('/admin/settings')
      }
      const hashedPassword = await bcrypt.hash(password, 12)
      const newAdmin = new Admin({
        name: name,
        mobile: mobile,
        password: hashedPassword,
        isAdmin: true,
        role: role,
        department: department,
      })
      await newAdmin.save()
    }

    req.flash('success', 'تم ')
    return res.redirect('/admin/settings/admins')

  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

}

exports.deleteAdmin = async (req, res, next) => {
  const id = req.params.id
  if (req.user.role !== 'super admin') return res.redirect('/admin/settings')
  try {
    const user = await Admin.findById(req.params._id)
    await user.remove()
    req.flash('success', 'تم حذف الادمن')

    return res.redirect('/admin/admins')
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

}


exports.roles = async (req, res, next) => {

  try {
    const user = await Admin.findById(req.user._id)
    if (user.role !== 'super admin') return res.redirect('/admin/settings')
    const company = await Company.findOne()
    return res.render("admin/settings/roles", {
      path: "/roles",
      pageTitle: "roles",
      isAuth: req.session.isLoggedIn,
      user: req.session.user,
      company: company,
      roles: company.roles
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

}


exports.createRole = async (req, res, next) => {
  const { role } = req.body
  try {
    const exist = req.company.roles.find(r => r.name === role.name)
    if (exist) return res.status(401).json({ message: 'لديك دور بهذا الاسم بالفعل', messageType: 'info' })
    const newRole = {
      name: role.name,
      permissions: role.permissions
    }
    const company = await Company.findOneAndUpdate({}, { $push: { roles: newRole } })

    req.roles = company.roles
    return res.status(200).json({ message: 'Role Created Successfully', messageType: 'success' })
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })
  }
}



exports.deleteRole = async (req, res, next) => {
  const role = req.params.role
  try {

    const company = await Company.findOne({})
    company.roles = company.roles.filter(r => r.name !== role)
    await company.save()
    await Admin.updateMany({ role: role }, { role: null })
    return res.status(200).json({ message: 'Role Created Successfully', messageType: 'success' })
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong, please try again later', messageType: 'danger' })
  }
}


exports.reports = async (req, res, next) => {

  return res.render("admin/reports", {
    path: "/reports",
    pageTitle: "Reports",
    isAuth: req.session.isLoggedIn,
    user: req.session.user

  });
}