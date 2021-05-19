const User = require("../models/User");
const Driver = require("../models/Driver");
const Shipment = require("../models/Shipment");
const Bill = require("../models/Bill");
const Admin = require("../models/Admin");
const fs = require('fs')
const msg = require("../util/message");
const { validationResult } = require("express-validator/check");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const moment = require('moment');
const Chat = require("../models/Chat");






exports.getLogin = async (req, res, next) => {

    try {
        return res.render("driver/auth/login", {
            path: "/login",
            pageTitle: "Driver",
            errmsg: null,
            succmsg: null,
            isAuth: req.session.isLoggedIn,
            user: req.user
        });
    } catch (err) {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }

};

exports.postLogin = async (req, res, next) => {
    const mobile = req.body.mobile;
    const password = req.body.password;
    try {
        const user = await Driver.findOne({ mobile: mobile })
        if (!user) {
            return res.render("driver/auth/login", {
                path: "/login",
                pageTitle: "Driver",
                errmsg: "تأكد من البيانات",
                succmsg: null,
                isAuth: req.session.isLoggedIn,
                user: req.user
            });
        }
        // const hashedPassword = await bcrypt.hash('123456789', 12)
        // user.password = hashedPassword
        // await user.save()
        const doMatch = await bcrypt.compare(password, user.password)
        if (!doMatch) {
            return res.render("driver/auth/login", {
                path: "/login",
                pageTitle: "Driver",
                errmsg: "تأكد من البيانات",
                succmsg: null,
                isAuth: req.session.isLoggedIn,
                user: user
            });
        }
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.isAdmin = false
        req.session.isDriver = true
        await req.session.save(err => {
            console.log(req.session);
            return res.redirect('/driver/dashboard')
        });
    } catch (err) {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }



};



exports.postLogout = (req, res, next) => {
    req.destroy(err => {
        console.log(err);
        res.redirect("/");
    });
};




exports.dashboard = async (req, res, next) => {
    try {
        const to = moment().format('YYYY-MM-DD')
        const from = moment().subtract(1, 'days').format('YYYY-MM-DD')
        const driver = await Driver.findOne({ _id: req.user._id })
        const shipments = await Shipment.find({ 'driver.id': req.user._id, 'status.no': 2 })

        const shipedToday = await Shipment.find({ 'driver.id': req.user._id, delivery_date: to })
        const pickedToday = await Shipment.find({ 'driver.id': req.user._id, pickup_date: to })
        // console.log(onProgress.onProgress);
        const msgs = msg(req, res)
        return res.render("driver/dashboard", {
            users: [],
            orders: [],
            pageTitle: "لوحه التحكم",
            path: "/dashboard",
            shipments: shipments,
            totalSalesPrice: 0,
            driver: driver,
            errmsg: msgs.err,
            succmsg: msgs.success,
            isAuth: req.session.isLoggedIn,
            shipedToday: shipedToday,
            pickedToday: pickedToday,
            user: req.user

        });
    } catch (err) {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }

};




exports.shipments = async (req, res, next) => {
    const msgs = msg(req, res)
    try {
        const shipments = await Shipment.find({ 'driver.id': req.user._id, 'status.no': 4 })
        const driver = await Driver.findOne({ _id: req.user._id })

        return res.render("driver/shipments", {
            pageTitle: "شحناتك",
            path: "/shipments",
            driver: driver,
            errmsg: msgs.err,
            succmsg: msgs.success,
            isAuth: req.session.isLoggedIn,
            shipments: shipments,
            user: req.user

        });
    } catch (err) {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }

};





exports.comissions = async (req, res, next) => {
    const msgs = msg(req, res)
    try {
        const bills = await Bill.find({ itemId: req.user._id, category: 'commission' })
        const driver = await Driver.findOne({ _id: req.user._id })
        const total = bills.reduce((acc, i) => { return acc + i.amount }, 0)
        return res.render("driver/commission", {
            users: [],
            orders: [],
            pageTitle: "العمولات",
            path: "/commission",
            total: total,
            driver: driver,
            errmsg: msgs.err,
            succmsg: msgs.success,
            isAuth: req.session.isLoggedIn,
            bills: bills,
            user: req.user

        });
    } catch (err) {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }

};



exports.custody = async (req, res, next) => {
    const msgs = msg(req, res)
    try {
        const bills = await Bill.find({ itemId: req.user._id, category: 'custody' })
        const driver = await Driver.findOne({ _id: req.user._id })
        const total = bills.reduce((acc, i) => { return acc + i.amount }, 0)
        return res.render("driver/custody", {
            users: [],
            orders: [],
            pageTitle: "العهدات",
            path: "/custody",
            total: total,
            driver: driver,
            errmsg: msgs.err,
            succmsg: msgs.success,
            isAuth: req.session.isLoggedIn,
            bills: bills,
            user: req.user

        });
    } catch (err) {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }

};





exports.chat = async (req, res, next) => {
    const msgs = msg(req, res)
    try {
        const driver = await Driver.findOne({ _id: req.user._id })
        // await Chat.deleteMany()
        const chats = await Chat.find({ driver: req.user._id })
        const admins = await Admin.find()

        const alladmins = []

        for (const a of admins) {
            const exist = chats.find(c => c.admin.toString() === a._id.toString())
            // console.log(exist);
            if (exist) {
                alladmins.push({ _id: a._id, name: a.name, chatId: exist.chatId, role: a.role })
            } else {
                alladmins.push({ _id: a._id, name: a.name, chatId: null, role: a.role })
            }
        }
        return res.render("driver/chat", {

            pageTitle: "المحدثات",
            path: "/chats",
            driver: driver,
            errmsg: msgs.err,
            succmsg: msgs.success,
            isAuth: req.session.isLoggedIn,
            alladmins: alladmins,
            user: req.user

        });
    } catch (err) {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }

};








exports.shipment = async (req, res, next) => {
    const id = req.params.id

    try {
        const shipment = await Shipment.findOne({ shipmentNo: id })
        if (!shipment) return res.redirect('/driver/dashboard')
        if (!shipment.driver.id || shipment.driver.id.toString() != req.user._id.toString()) {
            return res.render("driver/dashboard", {
                path: "/dashboard",
                pageTitle: "Dashboard",
                errmsg: "This Shipement Not Assinged To You!",
                succmsg: null,
                isAuth: req.session.isLoggedIn,
                user: req.user

            });
        }

        console.log(shipment);
        return res.render("driver/shipment", {
            path: "/shipment",
            pageTitle: "shipment",
            shipment: shipment,
            isAuth: req.session.isLoggedIn,
            user: req.user,
            errmsg: null,
            succmsg: null,
            isAuth: req.session.isLoggedIn,
            user: req.user

        });
    } catch (err) {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}



exports.startTrip = async (req, res, next) => {
    const id = req.body.id
    try {
        const shipment = await Shipment.findOne({ shipmentNo: id })
        if (!shipment) return res.redirect('/driver/dashboard')
        if (!shipment.driver.id || shipment.driver.id.toString() != req.user._id.toString()) {
            req.flash('alert', "This Shipement Is Not Assinged To You!")
            return res.redirect('/driver/dashboard')
        }
        if (shipment.status.no != 2) {
            req.flash('alert', "This Shipement Not Able To Move Yet, Check with Administrators!")
            return res.redirect('/driver/dashboard')
        }

        //Change Shipment Status

        return res.render("driver/trip", {
            path: "/shipment",
            pageTitle: "shipment",
            shipment: shipment,
            isAuth: req.session.isLoggedIn,
            user: req.user,
        });
    } catch (err) {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}
