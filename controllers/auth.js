var mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { validationResult } = require("express-validator/check");
const msg = require("../util/message");


exports.getLogin = async (req, res, next) => {
  const msgs = msg(req, res)

  return res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errmsg: msgs.err,
    succmsg: msgs.success,
    isAuth: req.session.isLoggedIn
  });
};

exports.postLogin = async (req, res, next) => {
  const mobile = req.body.mobile;
  const password = req.body.password;

  const user = await User.findOne({ mobile: mobile })
  if (!user) {
    req.flash("alert", "برجأ التأكد من البيانات");
    return res.redirect("/login");
  } else if (user.signUpToken) {
    req.flash("alert", "برجاء تفعيل حسابك");
    return res.redirect("/login");
  }

  const doMatch = await bcrypt.compare(password, user.password)
  if (!doMatch) {
    req.flash("alert", "الرقم السري خطا");
    return res.redirect("/login");
  }
  req.session.isLoggedIn = true;
  req.session.user = user;
  return req.session.save(err => {
    return user.isAdmin ? res.redirect('/user/dashboard') : res.redirect(`/user/shipments`);
  });


};
exports.getSignUp = async (req, res, next) => {
  const msgs = msg(req, res)


  return res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Sign Up",
    isAuthenticated: false,
    errmsg: msgs.err,
    succmsg: msgs.success,
    hasError: false,
    oldInputs: {
      name: "",
      password: "",
      confirmPassword: '',
      mobile: ''
    },
    isAuth: req.session.isLoggedIn
  });
};

exports.postSignup = async (req, res, next) => {
  const name = req.body.name;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const mobile = req.body.mobile;
  const UserName = req.body.UserName;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Sign Up",
      isAuthenticated: false,
      errmsg: errors.array()[0].msg,
      succmsg: null,
      hasError: true,
      oldInputs: {
        name: name,
        mobile: req.body.mobile,
        password: '',
        confirmPassword: '',
        UserName: UserName
      },
      isAuth: req.session.isLoggedIn
    });
  }
  try {
    const userDoc = await User.findOne({ mobile: mobile })

    if (userDoc) {
      return res.status(422).render("auth/signup", {
        path: "/Sign up",
        pageTitle: "Sign Up",
        isAuthenticated: false,
        errmsg:
          " الرقم مسجل من قبل, اذا الرقم يخصك اضغط علي تسجيل الدخول الأن",
        hasError: true,
        categories: categories,
        oldInputs: {
          name: name,
          mobile: req.body.mobile,
          password: '',
          confirmPassword: '',
          UserName: UserName
        },
        isAuth: req.session.isLoggedIn
      });
    }

    if (confirmPassword !== password) {
      req.flash("alert", "رقم المرور غير متطابق");
      return res.redirect('/signup')
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // const newcart = createcart(Cart)
    // await newcart.save()

    const user = new User({
      name: name,
      User_name: UserName,
      password: hashedPassword,
      mobile: mobile,
      signUpToken: '',
      shipments: [],
      integrationTokens: []
    });
    await user.save();


    //  const sendmail = await transporter.sendMail({
    //     to: email,
    //     from: "OnlineShop@mail.com",
    //     subject: "You Successfully Signed up :)",
    //     html: `
    //       <p>We glad to be one of our commuinty one last step just click the link below to verify your account now</p>
    //       <p>Click <a href="https://online-shop20.herokuapp.com/verfiy/${token}">HERE</a></p>
    //       `
    req.flash("success", "شكرا لأاختيارك لنا, برجاء تسجيل الدخول");

    return res.redirect("/login");

  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }




};

exports.getSignWithGoogle = (req, res, next) => {
  const oauth2Client = new google.auth.OAuth2(
    "332841012683-h94tab8psir5ed08p2f5htb63libsego.apps.googleusercontent.com",
    "kckeqDdMu-J4WuKI9wx8dSu0",
    "http://localhost:3000/auth/google/callback"
  );

  // generate a url that asks permissions for Blogger and Google Calendar scopes
  const scopes = ["https://www.googleapis.com/auth/userinfo.email"];

  const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: "offline",

    // If you only need one scope you can pass it as a string
    scope: scopes
  });
  res.redirect(url);
};

exports.getVerify = async (req, res, next) => {
  const token = req.params.token;
  const type = req.query.type;
  try {
    const user = await User.findOne({ signUpToken: token })
    if (!user) {
      return res.redirect('/login')
    }

    return res.render("auth/verfiy", {
      path: "/Vefiy",
      pageTitle: "Verify Your Account",
      isAuthenticated: false,
      errmsg: message,
      signUpToken: token,
      type: type
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }


};
exports.postVerify = async (req, res, next) => {
  const mobile = req.body.mobile;
  const type = req.query.type;
  try {
    const user = await User.findOne({ mobile: mobile })
    if (!user) return res.redirect("/");

    user[type] = undefined;
    await user.save();

  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }


};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getResetPass = (req, res, next) => {
  const msgs = msg(req, res)

  return res.render("auth/reset", {
    path: "/login",
    pageTitle: "Login",
    errmsg: msgs.err,
    succmsg: msgs.success,
    isAuth: req.session.isLoggedIn
  });
};

exports.postResetPass = (req, res, next) => {
  let token
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redirect("/reset");
    }
    token = buffer.toString("hex");
  })
  console.log(token);

  // const user = await User.findOne({ mobile: req.body.mobile })
  // if (!user) {
  //   req.flash("error", "هذا الرقم غير مسجل لدينا, برجاء ادخال الرقم الصحيح");
  //   return res.redirect("/reset");
  // }
  // user.resetToken = token;
  // user.resetTokenExpr = Date.now() + 3600000;
  // await user.save();
  // await transporter.sendMail({
  //   to: req.body.email,
  //   from: "carryit@mail.com",
  //   subject: "طلب استعاده الرقم السري",
  //   html: `
  //     <p>تم طلب استعاده رقم المرور لهذا الرقم</p>
  //     <p>Click <a href="https://online-shop20.herokuapp.com/reset/${token}">HERE</a> To Change It</p>
  //     `
  // });
  return res.render("thanks", {
    path: "/Reset-Request",
    pageTitle: "تم ارسال رمز استعاده رقم المرور",
    errmsg: msgs.err,
    succmsg: msgs.success,
    isAuth: req.session.isLoggedIn
  });

};

exports.getNewPassword = async (req, res, next) => {
  const token = req.params.token;
  try {
    const user = await User.findOne({ resetToken: token, resetTokenExpr: { $gt: Date.now() } })
    return res.render("auth/new-password", {
      path: "/NewPassword",
      pageTitle: "Reset your password",
      isAuthenticated: false,
      errmsg: message,
      userId: user._id.toString(),
      passwordToken: token,
      isAuth: req.session.isLoggedIn
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }


};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const token = req.body.passwordToken;
  let resetUser;
  User.findOne({
    _id: userId,
    resetToken: token,
    resetTokenExpr: { $gt: Date.now() }
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetToken = undefined;
      return resetUser.save();
    })
    .then(result => {
      return res.render("auth/login", {
        succmsg:
          "You Have Succssfuly Reseted Your Password, Login In Again.",
        path: "/Password Reseted",
        pageTitle: "Login",
        errmsg: null
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getThanks = (req, res, next) => {
  const msgs = msg(req, res)

  return res.render("auth/thanks", {
    path: "/thanks",
    pageTitle: "Thank Your For Sign up",
    isAuthenticated: false,
    errmsg: msgs.err,
    succmsg: msgs.success,
    isAuth: req.session.isLoggedIn
  });
};
