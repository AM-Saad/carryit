const Driver = require("../models/Driver");
const Admin = require("../models/Admin");
const Chat = require("../models/Chat");
const msg = require("../util/message");



exports.chat = async (req, res, next) => {
  const msgs = msg(req, res)
  try {
    const drivers = await Driver.find()
    // await Chat.deleteMany()
    const chats = await Chat.find({ admin: req.user._id })
    const admin = await Admin.find({ _id: req.user._id })

    const allDrivers = []

    for (const a of drivers) {
      const exist = chats.find(c => c.driver.toString() === a._id.toString())
      // console.log(exist);
      if (exist) {
        allDrivers.push({ _id: a._id, name: a.name, chatId: exist.chatId })
      } else {
        allDrivers.push({ _id: a._id, name: a.name, chatId: null })
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
      allDrivers: allDrivers,

    });
  } catch (err) {
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

};

