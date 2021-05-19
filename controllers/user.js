
const msg = require("../util/message");
const { formatDate } = require("../models/helpers/formatDate");
const { validateShipment } = require("../models/helpers/shipment");
const User = require("../models/User");
const Shipment = require("../models/Shipment");
const Zone = require("../models/Zone");

const jwt = require("jsonwebtoken");
const { createToken } = require("../models/helpers/createtoken");
const { shipments } = require("./api");
const Inventory = require("../models/Inventory");


exports.shipments = async (req, res, next) => {
    const msgs = msg(req, res)
    try {
        const user = await User.findById(req.user._id)
        if (!user) {
            req.flash('alert', 'حدث شئ خطا, برجاء اعاده تسجيل الدخول')
            return res.redirect('/user/shipments')
        }
        const shipments = await Shipment.find({ user: req.user._id })
        const zones = await Zone.find()

        return res.render('user/shipments', {
            user: user,
            shipments: shipments,
            pageTitle: `${user.name}`,
            path: '/profile',
            errmsg: msgs.err,
            succmsg: msgs.success,
            isAuth: req.session.isLoggedIn,
            user: req.session.user,
            zones: zones
        })
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}



exports.neworder = async (req, res, next) => {
    let { is_liquid, is_fragile, quantity, desc, price, notes, pickup_date, delivery_date, zoneId } = req.body
    const pickup = {
        zone: { name: req.body.area, zoneId: '' },
        address: req.body.address,
        building: req.body.building,
        apartment: req.body.apartment,
        floor: req.body.floor,
        name: req.body.name,
        phone: req.body.phone
    }
    const receiver = {
        zone: { zoneId: req.body.recarea, name: '' },
        address: req.body.recaddress,
        building: req.body.recbuilding,
        apartment: req.body.recapartment,
        floor: req.body.recfloor,
        name: req.body.recname,
        phone: req.body.recphone
    }
    price = parseInt(price, 10)
    quantity = parseInt(quantity, 10)

    delete req.body._csrf
    const date = formatDate(new Date())
    const valid = validateShipment(pickup, receiver, price, quantity, pickup_date, delivery_date)
    try {
        if (!valid.state) {
            req.flash('alert', valid.reason)
            return res.redirect('/user/shipments')
        }
        const zone = await Zone.findOne({ zoneId: req.body.recarea })
        if (!zone || !zone.active) {
            req.flash('alert', 'عفوا هذه المنطقه خارج الخدمه مؤقتا')
            return res.redirect('/user/shipments')
        }
        receiver.zone.name = zone.name

        const newShipment = new Shipment({
            user: req.user._id,
            pickup: pickup,
            receiver: receiver,
            is_liquid: is_liquid === 'on' ? true : false,
            is_fragile: is_fragile === 'on' ? true : false,
            price: price,
            quantity: quantity,
            desc: desc,
            notes: notes,
            shipping_price: zone.shipping,
            delivery_date,
            pickup_date,
            date: date,
            status: {
                no: 1,
                text: 'تحت الطلب'
            }
        })

        console.log(newShipment);

        const inventory = await Inventory.findOne()
        inventory.items.push({
            shipmentNo: shipment.shipmentNo,
            id: shipment._id,
            price: shipment.price,
            entry_date: date,
            by: { name: req.user.name, id: req.user._id },
            leaved_date: null,
            changed_date: null,
            in: true
        })
        await newShipment.save()
        //  new pick up
        return res.redirect(`/user/shipments`)
    } catch (err) {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }

}



exports.cancel = async (req, res, next) => {
    const id = req.body.id

    try {
        const shipment = await Shipment.findById(id)

        if (!shipment) {

            req.flash('alert', 'حدث شئ خطا, برجاء اعاده تسجيل الدخول')
            return res.redirect('/user/shipments')

        }

        if (shipment.user.toString() != req.user._id.toString()) {

            return res.redirect('/')
        }

        shipment.status.no = 4
        shipment.status.text = "تم الالغاء"
        shipment.status.note = "تم الغاء الطلب من طرف الموزع"

        await shipment.save()
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}



exports.tokens = async (req, res, next) => {
    const msgs = msg(req, res)
    const existToken = req.query.new
    let newtoken = null
    try {
        const user = await User.findById(req.user._id)
        if (!user) {
            req.flash('alert', 'حدث شئ خطا, برجاء اعاده تسجيل الدخول')
            return res.redirect('/user/tokens')
        }
        if (existToken) {
            newtoken = user.integrationTokens.find(t => t._id.toString() === existToken.toString())
        }
        return res.render('user/tokens', {
            user: user,
            pageTitle: `Tokens`,
            path: '/tokens',
            errmsg: msgs.err,
            succmsg: msgs.success,
            isAuth: req.session.isLoggedIn,
            tokens: user.integrationTokens,
            newtoken: newtoken
        })
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}
exports.newToken = async (req, res, next) => {
    const name = req.body.name

    if (!name) {

    }
    try {
        const user = await User.findById(req.user._id)
        if (!user) {
            req.flash('alert', 'حدث شئ خطا, برجاء اعاده تسجيل الدخول')
            return res.redirect('/user/tokens')
        }
        let newtoken = jwt.sign({ user }, "amsstudiosecret");

        let token = { name: name, token: newtoken, used: 0 }

        user.integrationTokens.unshift(token)
        await user.save()

        req.flash('success', 'تم انشاء الرمز')
        return res.redirect(`/user/tokens?new=${user.integrationTokens[0]._id}`)
    } catch (err) {

        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }

}

exports.deleteToken = async (req, res, next) => {
    const id = req.params.id

    try {
        const user = await User.findById(req.user._id)
        if (!user) {
            req.flash('alert', 'حدث شئ خطا, برجاء اعاده تسجيل الدخول')
            return res.redirect('/user/tokens')
        }
        user.integrationTokens = user.integrationTokens.filter(t => t._id.toString() !== id.toString())
        await user.save()
        req.flash('success', 'تم حذف الرمز')
        return res.redirect('/user/tokens')
    } catch (err) {
        console.log(err);

        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}




exports.tracking = async (req, res, next) => {
    const msgs = msg(req, res)

    try {
        const user = await User.findById(req.user._id)
        if (!user) {
            req.flash('alert', 'حدث شئ خطا, برجاء اعاده تسجيل الدخول')
            return res.redirect('/user/tracking')
        }

        return res.render('user/tracking', {
            user: user,
            pageTitle: `Tracking`,
            path: '/tracking',
            errmsg: msgs.err,
            succmsg: msgs.success,
            isAuth: req.session.isLoggedIn,
            shipment: null
        })
    } catch (err) {
        console.log(err);

        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}

exports.trackShipment = async (req, res, next) => {
    const shipmentId = req.body.shipmentId

    try {
        const shipment = await Shipment.findOne({ shipmentNo: shipmentId })
        if (!shipment) {
            return res.render('user/tracking', {
                user: req.user,
                pageTitle: `Tracking`,
                path: '/tracking',
                errmsg: 'خطأ في رقم الشحنه',
                succmsg: null,
                isAuth: req.session.isLoggedIn,
                shipment: null
            })
        }
        return res.render('user/tracking', {
            user: req.user,
            pageTitle: `Tracking`,
            path: '/tracking',
            errmsg: null,
            succmsg: null,
            isAuth: req.session.isLoggedIn,
            shipment: shipment
        })

    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}


exports.settings = async (req, res, next) => {
    const msgs = msg(req, res)

    try {

        const user = await User.findById(req.user._id)
        if (!user) {
            req.flash('alert', 'حدث شئ خطا, برجاء اعاده تسجيل الدخول')
            return res.redirect('/user/settings')
        }
        return res.render('user/settings', {
            user: user,
            pageTitle: `${user.name}`,
            path: '/settings',
            errmsg: msgs.err,
            succmsg: msgs.success,
            isAuth: req.session.isLoggedIn,
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
        const user = await User.findOne({ _id: req.user._id })
        if (!user) {
            req.flash('alert', 'حدث شئ خطا, برجاء اعاده تسجيل الدخول')
            return res.redirect('/user/settings')
        }

        if (!mobile || !name) {
            req.flash('alert', 'Mobile and name are required')
            return res.redirect('/user/settings')
        }

        user.mobile = mobile
        user.name = name
        await user.save()
        req.flash('success', 'Information Updated')
        return res.redirect('/user/settings')


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
        const user = await User.findOne({ _id: req.user._id })
        if (!user) {
            req.flash('alert', 'حدث شئ خطا, برجاء اعاده تسجيل الدخول')
            return res.redirect('/user/settings')
        }
        const isMatched = await bcrypt.compare(oldPassword, user.password)
        if (!isMatched) {
            req.flash('alert', 'Old password not correct')
            return res.redirect('/user/settings')
        }
        if (newPassword != confirmPassword) {
            req.flash('alert', 'Password not matched')
            return res.redirect('/user/settings')
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12)
        user.password = hashedPassword
        await user.save()
        req.flash('success', ' Password changed successfully')
        return res.redirect('/user/settings')


    } catch (err) {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }

}