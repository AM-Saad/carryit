module.exports = (req, res, next) => {
    
    if (!req.session.isLoggedIn) {
        return res.redirect('/admin/login');
    } else {
        if (!req.session.user.isAdmin) {
            return res.redirect('/');

        }
    }
    next();
}