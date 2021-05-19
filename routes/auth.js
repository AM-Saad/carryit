const express = require('express');

const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');

const router = express.Router();


router.get('/login', authController.getLogin);


router.post('/login', [
    body('mobile')
        .isLength({ min: 11 }).trim(),
    body('password')
        .isLength({ min: 8 })
        .isAlphanumeric()
        .trim()
], authController.postLogin);

router.get('/logout', authController.postLogout);
router.get('/thanks', authController.getThanks);

router.get('/signup', authController.getSignUp);

router.post('/signup',
    [

        body('name', 'برجاء ادخال الاسم'),
        body('mobile', 'برجاء ادخال رقم الموبايل صحيح ')
            .isNumeric()
            .trim()
            .isLength({ min: 11 }),
        body('password', 'برجاء ادخال رقم المرور لا يقل عن 8 حروف و ارقام')
            .isLength({ min: 8 })
            .isAlphanumeric()
            .trim(),
        body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) throw new Error('رقم المرور غير متطابق  ')
            return true
        })
    ], authController.postSignup
);


router.get('/reset', authController.getResetPass);
router.post('/reset', authController.postResetPass);

router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

router.get('/thanks', authController.getThanks);

router.get('/verfiy/:token', authController.getVerify);
router.post('/verfiy', authController.postVerify);

module.exports = router;