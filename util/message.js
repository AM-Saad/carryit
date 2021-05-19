module.exports = (req) => {
    let err = req.flash("alert");
    let success = req.flash("success");
    if (err.length > 0) {
        err = err[0];
    } else {
        err = null;
    }

    if (success.length > 0) {
        success = success[0];
    } else {
        success = null;
    }
    return { err, success }
}