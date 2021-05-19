/*jslint browser: true*/
/*global console, alert, $, jQuery, hamburger_cross*/

(function () {


    const actionsitems = [
        {
            name: 'get-shipments',
            tobeadded: [],
            toBeRemoved: ['delete-shipments', 'edit-shipments', 'create-shipments'],
        },
        {
            name: 'create-shipments',
            tobeadded: ['get-shipments', 'get-zones'],
            toBeRemoved: [],
        },
        {
            name: 'edit-shipments',
            tobeadded: ['get-shipments', 'get-zones'],
            toBeRemoved: [],

        },
        {
            name: 'delete-shipments',
            tobeadded: ['get-shipments'],
            toBeRemoved: [],
        },


        {
            name: 'get-bills',
            tobeadded: ["get-drivers", 'get-fleets'],
            toBeRemoved: ['edit-bills', 'delete-bills', 'create-bills'],
        },
        {
            name: 'delete-bills',
            tobeadded: ['get-bills'],
            toBeRemoved: [],
        },
        {
            name: 'edit-bills',
            tobeadded: ['get-bills'],
            toBeRemoved: [],
        },
        {
            name: 'create-bills',
            tobeadded: ['get-bills', "get-drivers", 'get-fleets'],
            toBeRemoved: [],
        },



        {
            name: 'get-zones',
            tobeadded: [],
            toBeRemoved: ['create-zones', 'delete-zones', 'edit-zones', "edit-shipments", "create-shipments"],
        },
        {
            name: 'delete-zones',
            tobeadded: ['get-zones'],
            toBeRemoved: [],
        },
        {
            name: 'edit-zones',
            tobeadded: ['get-zones'],
            toBeRemoved: [],
        },
        {
            name: 'create-zones',
            tobeadded: ['get-zones'],
            toBeRemoved: [],
        },


        {
            name: 'get-fleets',
            tobeadded: ['get-drivers'],
            toBeRemoved: ['create-fleets', 'delete-fleets', 'edit-fleets', 'get-bills'],
        },
        {
            name: 'delete-fleets',
            tobeadded: ['get-fleets'],
            toBeRemoved: [],
        },
        {
            name: 'edit-fleets',
            tobeadded: ['get-fleets', 'get-drivers'],
            toBeRemoved: [],
        },
        {
            name: 'create-fleets',
            tobeadded: ['get-fleets', 'get-drivers'],
            toBeRemoved: [],
        },



        {
            name: 'get-drivers',
            tobeadded: ['get-fleets'],
            toBeRemoved: ['create-drivers', 'delete-drivers', 'edit-drivers', 'edit-fleets', "create-fleets", 'get-bills'],
        },
        {
            name: 'delete-drivers',
            tobeadded: ['get-drivers'],
            toBeRemoved: [],
        },
        {
            name: 'edit-drivers',
            tobeadded: ['get-drivers'],
            toBeRemoved: [],
        },
        {
            name: 'create-drivers',
            tobeadded: ['get-drivers'],
            toBeRemoved: [],
        },



        {
            name: 'get-customer',
            tobeadded: ['get-customer', "edit-shipments"],
            toBeRemoved: ['create-shipments', 'delete-customer', 'edit-customer', 'create-customer'],
        },
        {
            name: 'delete-customer',
            tobeadded: ['get-customer'],
            toBeRemoved: [],
        },
        {
            name: 'edit-customer',
            tobeadded: ['get-customer'],
            toBeRemoved: [],
        },
        {
            name: 'create-customer',
            tobeadded: ['get-customer'],
            toBeRemoved: [],
        },









        {
            name: 'get-inventory',
            tobeadded: [],
            toBeRemoved: ['create-shipments', 'delete-inventory', 'edit-inventory', 'create-inventory']
        },
        {
            name: 'edit-inventory',
            tobeadded: ['get-inventory']
            , toBeRemoved: [],
        },
        {
            name: 'create-inventory',
            tobeadded: ['get-inventory']
            , toBeRemoved: [],
        },
        {
            name: 'delete-inventory',
            tobeadded: ['get-inventory']
            , toBeRemoved: [],
        },


    ]
    const rolessettings = {
        jwt: $('input[name="_csrf"]').val(),

        company: null,
        choosenCompanyLogo: '',
        newrole: {
            name: '',
            permissions: []
        },
        edited: false,
        init: function () {
            this.cashDom()
            this.bindEvents()
        },
        cashDom: function () {
            // this.$mainrole = $('.main-role')
            this.$roleName = $('#roleName')
            this.$role = $('input.main-role')
            this.$getActions = $('.actions input')
            this.$companyLogo = $('#companyLogo')
            this.$saveRole = $('.create-roles')

            this.$deleteRole = $('.delete-role')
        },
        bindEvents: function () {

            this.$roleName.on('keyup', this.getRoleName.bind(this))
            this.$role.on('change', this.getMainRole.bind(this))
            this.$getActions.on('click', (e) => this.getActions(e.target))
            this.$saveRole.on('submit', this.saveRole.bind(this))
            this.$deleteRole.on('click', this.deleteRole.bind(this))
        },





        getRoleName: function (e) { rolessettings.newrole.name = $(e.target).val() },
        getMainRole: function (e) {
            e.stopPropagation()
            const state = e.target.checked
            const permission = $(e.target).data('permission')
            if (state) {
                // $(e.target).parent().find('.actions').removeClass('none')
                const exsitpermission = this.newrole.permissions.find(p => p.name == permission)
                if (!exsitpermission) {
                    this.newrole.permissions.push({ name: permission, actions: [] })
                }
            } else {
                // const oldPermissions = this.newrole.permissions.filter(p => p.name != permission)
                // this.newrole.permissions = oldPermissions
                $(e.target).parents('.role').find('.actions .premission-action').each(function () {
                    if ($(this).is(':checked')) {
                        let itemClass = $(this).data('actionname')
                        document.querySelector(`.${itemClass}`).checked = false
                        rolessettings.getActions(this)
                    }
                })

                // $(e.target).parent().find('.actions').addClass('none')
            }
        },
        getActions: function (target) {
            const state = $(target).prop('checked')
            const actionPermission = $(target).parents('.role').find('.main-role').data('permission')
            const action = $(target).data('action')
            const actionDataName = $(target).data('actionname')
            rolessettings.updatePermissionAction(action, actionPermission, actionDataName, state)

        },

        updatePermissionAction: function (action, permission, actionDataName, state) {
            const existpermission = rolessettings.newrole.permissions.find(p => p.name == permission)
            if (existpermission) {
                const existAction = existpermission.actions.filter(a => a == action)
                if (state) {
                    if (existAction.length == 0) {
                        existpermission.actions.push(action);
                        rolessettings.getToBeAddedFields(action, actionDataName, permission, state)
                    }
                } else {
                    if (existAction.length > 0) {
                        const filteredActions = existpermission.actions.filter(a => a != action)
                        existpermission.actions = filteredActions
                        rolessettings.getToBeAddedFields(action, actionDataName, permission, state)

                        const removedAction = actionsitems.findIndex(a => a.name == actionDataName)
                        const hastoBeRemoved = actionsitems[removedAction]
                        if (hastoBeRemoved) {
                            if (hastoBeRemoved.toBeRemoved.length > 0) {
                                hastoBeRemoved.toBeRemoved.forEach(dependAction => {

                                    const elm = $(`.${dependAction}`)
                                    const elmActionName = elm.data('action')
                                    const elmDataActionName = elm.data('actionname')
                                    const elmPermission = elm.parents('.role').find('.main-role').data('permission')
                                    // elm.prop('checked', false)
                                    document.querySelector(`.${dependAction}`).checked = false
                                    rolessettings.updatePermissionAction(elmActionName, elmPermission, elmDataActionName, state)

                                })

                            }
                        }

                    }
                }
            } else {
                rolessettings.newrole.permissions.push({ name: permission, actions: [] })
                const existpermission = rolessettings.newrole.permissions.find(p => p.name == permission)
                rolessettings.updatePermissionAction(action, permission, actionDataName, state)
            }

            // console.log(rolessettings.newrole.permissions);

        },
        getToBeAddedFields: function (action, actionDataName, actionPermission, state) {
            const hasactionsitems = actionsitems.findIndex(a => a.name == actionDataName)
            if (hasactionsitems >= 0) {
                actionsitems[hasactionsitems].tobeadded.forEach(a => {
                    const elm = $(`.${a}`)
                    const elmActionName = elm.data('action')
                    const elmDataActionName = elm.data('actionname')
                    const elmPermission = elm.parents('.role').find('.main-role').data('permission')
                    if (!state) {
                        // document.querySelector(`.${a}`).checked = false
                        elm.prop('checked', false)

                    } else {
                        // document.querySelector(`.${a}`).checked = true
                        elm.prop('checked', true)
                        elm.parents('.role').find('.main-role').prop('checked', true)
                        elm.parents('.role').find('.actions').removeClass('none')
                    }
                    this.updatePermissionAction(elmActionName, elmPermission, elmDataActionName, state)
                    //search for tobeadded to tobeadded
                })
            }



        },
        checkeRoleRequiremnts: function () {
            if (!rolessettings.newrole.name.replace(/\s/g, '').length) {
                showmessage('Add Role Name', 'info', 'body')
                return false
            }
            if (rolessettings.newrole.permissions.length == 0) {
                showmessage('Atleast one permission must be added!', 'warning', 'body')
                return false
            } else {

                rolessettings.newrole.permissions.forEach(p => {
                    if (p.actions.length == 0) {
                        showmessage('Add one action for every choosen permission', 'warning', 'body')
                        return false
                    }
                })
            }

            return true
        },
        saveRole: async function (e) {
            e.preventDefault()
            const res = rolessettings.checkeRoleRequiremnts()
            let formData = new FormData();
            console.log(this.jwt);
            formData.append("role", JSON.stringify(this.newrole))
            if (res) {
                const data = await fetchdata(this.jwt, `/admin/api/settings/roles`, 'post', JSON.stringify({ role: this.newrole }), true)

                console.log(data);
                if (data != null) {
                    this.newrole = {
                        name: '',
                        permissions: []
                    };
                    // Do This Vanila JS 
                    $('.roles input[type="checkbox"]').each(function () {
                        $(this).prop('checked', false)

                    })
                    showmessage(data.json.message, data.json.messageType, 'body')
                }
            }
        },
        deleteRole: async function (e) {
            console.log(e);

            if (confirm("هل تريد حذف هذا الدور")) {
                const roleName = $(e.target).parents('.all-roles_role').find('input[name="roleName"]').val()
                const data = await fetchdata(this.jwt, `/admin/api/settings/roles/${roleName}`, 'delete', {}, true)
                if (data != null) {
                    (e.target).parents('.all-roles_role').remove()
                    showmessage(data.json.message, data.json.messageType, 'body')
                }
            } else {
                e.preventDefault()
            }
        },
    }
    rolessettings.init()
})();
