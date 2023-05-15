
const msg = require("../util/message");

const User = require("../models/User");


const jwt = require("jsonwebtoken");




exports.tokens = async (req, res, next) => {
    const msgs = msg(req, res)
    const existToken = req.query.new
    let newToken = null
    try {
        const user = await User.findById(req.user._id)
        if (!user) {
            req.flash('alert', 'حدث شئ خطا, برجاء اعاده تسجيل الدخول')
            return res.redirect('/user/tokens')
        }
        if (existToken) {
            newToken = user.integrationTokens.find(t => t._id.toString() === existToken.toString())
        }
        return res.render('user/tokens', {
            user: user,
            pageTitle: `Tokens`,
            path: '/tokens',
            errmsg: msgs.err,
            succmsg: msgs.success,
            isAuth: req.session.isLoggedIn,
            tokens: user.integrationTokens,
            newToken: newToken
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


