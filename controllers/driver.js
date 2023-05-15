const Driver = require("../models/Driver");
const Shipment = require("../models/Shipment");
const Admin = require("../models/Admin");
const msg = require("../util/message");
const Chat = require("../models/Chat");







exports.chat = async (req, res, next) => {
    const msgs = msg(req, res)
    try {
        const driver = await Driver.findOne({ _id: req.user._id })
        // await Chat.deleteMany()
        const chats = await Chat.find({ driver: req.user._id })
        const admins = await Admin.find()

        const allAdmins = []

        for (const a of admins) {
            const exist = chats.find(c => c.admin.toString() === a._id.toString())
            // console.log(exist);
            if (exist) {
                allAdmins.push({ _id: a._id, name: a.name, chatId: exist.chatId, role: a.role })
            } else {
                allAdmins.push({ _id: a._id, name: a.name, chatId: null, role: a.role })
            }
        }
        return res.render("driver/chat", {

            pageTitle: "المحدثات",
            path: "/chats",
            driver: driver,
            errmsg: msgs.err,
            succmsg: msgs.success,
            isAuth: req.session.isLoggedIn,
            allAdmins: allAdmins,
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
