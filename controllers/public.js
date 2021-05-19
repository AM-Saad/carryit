
const msg = require("../util/message");
const Shipment = require("../models/Shipment");

exports.home = async (req, res, next) => {
  const msgs = msg(req, res)

  return res.render("public/home", {
    path: "/login",
    pageTitle: "Home",
    errmsg: msgs.err,
    succmsg: msgs.success,
    isAuth: req.session.isLoggedIn,
    user: req.session.user,
  });
};

exports.about = async (req, res, next) => {
  const msgs = msg(req, res)

  return res.render("public/about", {
    path: "/about",
    pageTitle: "About",
    errmsg: msgs.err,
    succmsg: msgs.success,
    isAuth: req.session.isLoggedIn,
    user: req.session.user,
  });
};

exports.contact = async (req, res, next) => {
  const msgs = msg(req, res)

  return res.render("public/contact", {
    path: "/contact",
    pageTitle: "Contact",
    errmsg: msgs.err,
    succmsg: msgs.success,
    isAuth: req.session.isLoggedIn,
    user: req.session.user,
  });
};

exports.shipment = async (req, res, next) => {
  const id = req.params.id

  try {
    const shipment = await Shipment.findOne({ shipmentNo: id })
    if (!shipment) return res.redirect('/')
    console.log(shipment);
    return res.render("public/shipment", {
      path: "/shipment",
      pageTitle: "shipment",
      shipment: shipment,
      isAuth: req.session.isLoggedIn,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
}
