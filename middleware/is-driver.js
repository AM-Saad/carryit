module.exports = (req, res, next) => {
    
    if (!req.session.isLoggedIn) {
        return res.redirect('/driver/login');
    } else {
        if (!req.session.isDriver) {
            return res.redirect('/');

        }
    }
    next();
}