exports.check = function (permission, action, redirected) {


    return async (req, res, next) => {
        try {

            const userrole = req.user.role

            let existRole = req.company.roles.find(r => r.name.toLowerCase() == userrole.toLowerCase())
            console.log(userrole);
            if (userrole == 'super admin') return next()
            const hasPremission = existRole.permissions.findIndex(p => p.name == permission);

            if (hasPremission >= 0) {
                const actionsGrants = existRole.permissions[hasPremission].actions.includes(action);
                if (actionsGrants) {
                    next()

                } else {
                    if (!redirected) {
                        return res.status(401).json({
                            message: "You don't have permissions to perform this action",
                            messageType: 'warning'
                        });
                    }
                    return res.redirect('/admin/settings/account')
                }
            } else {
                if (!redirected) {

                    return res.status(401).json({
                        message: "You don't have permissions to perform this action",
                        messageType: 'warning'
                    });
                }
                return res.redirect('/admin/dashboard')
            }
        } catch (error) {
            next(error)

        }
    }
};

