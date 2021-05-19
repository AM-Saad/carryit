/*jslint browser: true*/

/*global console, alert, $, jQuery, hamburger_cross*/



(function () {
    const config = {
        jwt: $('input[name="_csrf"]').val(),
        allCustomers: [],
        openedShipments: [],
        customerImg: null,
        opened: null,
        editing: false,
        init: async function () {
            this.cashDom()
            this.bindEvents()
            await this.getCustomers()
            this.getStoredCustomer()

        },
        cashDom: function () {
            this.$togglefilters = $('.toggle-filters')

            this.$togglecreateCustomerbox = $('.toggle-new-customer')
            this.$customerImg = $('.driverImage')
            this.$searchname = $('#search-name')

        },
        bindEvents: function () {
            this.$togglefilters.on('click', this.togglefilters.bind(this))

            this.$togglecreateCustomerbox.on('click', this.togglecreateCustomerbox.bind(this))
            this.$customerImg.on('change', this.getcustomerImg.bind(this))
            this.$searchname.on('keyup', this.searchCustomerName.bind(this))


            $('body').on('click', '.content-item', this.openCusomter.bind(this));
            $('body').on('click', '.close-single-item', this.closeSingleCustomer.bind(this))
            $('body').on('submit', '.assign-shipment', this.confirmAssigned.bind(this))
            $('body').on('click', '.customer-shipments .order', this.openShipmentBox.bind(this))
            $('body').on('click', '.close-shipments', this.closeShipments.bind(this))

            $('.new-customer-box form').on('submit', this.saveCustomer.bind(this))

            $('body').on('click', '.edit-customer', this.editCustomer.bind(this))

            $('body').on('click', '.delete-customer', this.deleteCustomer.bind(this))

            $('body').on('click', '.customer-shipments', this.getCustomerShipments.bind(this))

            $('body').on('click', '.sort-date', this.sortShipmentsByDate.bind(this))
            $('body').on('keyup', '.order-serial', this.searchShipmentSerial.bind(this))
        },
        togglefilters: function (e) { $('.section-filters').toggleClass('block') },


        toggleCreateInventory: function () {
            $('.create-inventory').toggleClass('none')
        },
        openmenu: function (e) {
            e.stopPropagation()
            e.preventDefault()
            console.log('a');
            $('.wrapper').off('click')
            $('.sub-menu').not($(e.target).parent().find('.sub-menu')).removeClass('activeMenu')
            $(e.target).parent().find('.sub-menu').toggleClass('activeMenu')
            $('.wrapper').on('click', function () {
                $('.sub-menu').removeClass('activeMenu')
            })
        },
        getCustomers: async function (e) {
            if (this.allCustomers.length == 0) {
                const data = await fetchdata(this.jwt, '/admin/api/customers', 'get', {}, true)
                if (data != null) {
                    this.renderCustomers(data.json.customers)
                    return this.allCustomers = data.json.customers
                }
            }
        },
        getStoredCustomer: async function (e) {
            const customerId = localStorage.getItem('ci')
            if (!customerId) return false
            this.opened = this.filterSingleCustomer(customerId)
            createSingleItem(this.opened)
            localStorage.removeItem('ci')
            $('#search-name').trigger('change').val(customerId)
            return true
        },
        searchCustomerName: function (e) {
            // const text = $(e.target).val()
            var str = event.target.value.toLowerCase()
            var filteredArr = config.allCustomers.filter((i) => {
                var xSub = i.name.toLowerCase()
                return i.name.toLowerCase().includes(str) || config.checkName(xSub, str)
            })
            console.log(filteredArr);

            config.renderCustomers(filteredArr)

        },
        checkName: function (name, str) {
            var pattern = str.split("").map((x) => {
                return `(?=.*${x})`
            }).join("");
            var regex = new RegExp(`${pattern}`, "g")
            return name.match(regex);
        },

        getCustomerObeject: function (e) {
            const customerId = findItemId('customerId', e)
            console.log(customerId);
            const customer = config.filterSingleCustomer(customerId)
            return customer
        },

        filterSingleCustomer: function (customerId) {
            const customer = this.allCustomers.find(c => { return c._id.toString() === customerId.toString() })
            return customer
        },
        openCusomter: function (e) {
            const customer = this.getCustomerObeject(e)
            this.opened = customer._id
            return createSingleItem(customer)

        },
        closeCustomer: (e) => {
            $('.single-item').remove()
        },
        togglecreateCustomerbox: function (e) {
            $('.new-customer-box').toggleClass('slide')
            if ($('.new-customer-box').hasClass('slide')) $('#customerName').focus()
            this.resetData()
        },
        getcustomerImg: function (e) {
            let photo = e.target.files[0];  // file from input
            this.customerImg = photo

            if (e.target.files && e.target.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    $('.item-preview_image').attr('src', e.target.result);
                }
                reader.readAsDataURL(e.target.files[0]);
            }
            $('.item-preview_image').animate({ opacity: 1 }, 300)

        },
        createCustomerForm: function () {
            const name = $('#customerName').val();
            const mobile = $('#customerNumber').val()
            const address = $('#customerAddress').val()
            const email = $('#customerEmail').val()
            const notes = $('#newcustomernotes').val()
            if (!name.replace(/\s/g, '').length || !mobile.replace(/\s/g, '').length) {
                showmessage('All Stared <span class="c-r">"*"</span> fields required ', 'info', 'body')
                return false
            } else {
                let formData = new FormData();
                formData.append("name", name)
                formData.append("mobile", mobile)
                formData.append("address", address)
                formData.append("email", email)
                formData.append("notes", notes)
                formData.append("image", config.customerImg)
                return formData
            }
        },
        saveCustomer: async function (e) {
            e.preventDefault()
            const newform = this.createCustomerForm()
            if (newform != false) {
                $('.new-customer-box form').addClass('loader-effect')
                let data
                if (this.editing) {
                    $(`input[value="${this.opened}"]`).parents('.content-item').addClass('loader-effect')
                    data = await fetchdata(this.jwt, `/admin/api/customers/${this.opened}`, 'put', newform, false)

                    $(`input[value="${this.opened}"]`).parents('.content-item').removeClass('loader-effect')

                } else {
                    data = await fetchdata(this.jwt, '/admin/api/customers', 'post', newform, false)

                }
                if (data != null) {
                    showmessage(data.json.message, data.json.messageType, 'body')

                    if (this.editing) {
                        this.updateCustomer(data.json.customer)
                        this.togglecreateCustomerbox()
                        createSingleItem(data.json.customer)
                    } else {

                        this.allCustomers.push(data.json.customer)
                        this.togglecreateCustomerbox()
                    }
                    this.updateCustomerElm(data.json.customer)

                    this.resetData()
                }
                $('.new-customer-box form').removeClass('loader-effect')

            }

        },
        updateCustomer: function (updatedObj) {
            const oldIndex = config.allCustomers.findIndex(d => d._id.toString() === updatedObj._id.toString())
            config.allCustomers[oldIndex] = updatedObj
            return oldIndex
        },
        updateCustomerElm: function (updatedObj) {
            const exisitInput = $(`input[value="${updatedObj._id}"]`).parents('.content-item')
            const newDomElm = createitemBox(updatedObj)
            if (exisitInput.length <= 0) return $('.content .items').append(newDomElm);
            if (exisitInput.length > 0) return exisitInput.replaceWith(newDomElm)
        },
        resetData: function (e) {
            $('input[name="newcustomername"]').val('');
            $('input[name="newcustomermobile"]').val('')
            $('input[name="newcustomeraddress"]').val('')
            $('input[name="newcustomeremail"]').val('')
            $('input[name="newcustomernotes"]').val('')
            config.customerImg = null
            config.editing = false
        },
        editCustomer: function (e) {
            e.preventDefault()
            e.stopPropagation()
            const customerId = findItemId('customerId', e)
            const customer = this.allCustomers.find(c => c._id.toString() == customerId.toString())
            this.opened = customer._id
            this.editing = true

            $('#customerName').val(customer.name);
            $('#customerNumber').val(customer.mobile)
            $('#customerAddress').val(customer.address)
            $('#customerEmail').val(customer.email)
            $('#newcustomernotes').val(customer.note)

            $('.new-customer-box').addClass('slide')

        },


        renderCustomers: function (customers) {
            $('.content .loading').removeClass('block')
            $('.content-item').remove()
            removeFullBack()

            if (customers.length === 0) return $("main .content").prepend(emptycontent())
            customers.forEach(s => createitemBox(s))
        },


        closeSingleCustomer: function () {
            // config.opened = null
            $('.single-item').removeClass('scale')
        },

        deleteCustomer: async function (e) {
            e.stopPropagation()
            if (confirm("Do you want to delete this Customer?")) {
                const customerId = findItemId('customerId', e)
                $('.single-item .inside-wrapper').addClass('loader-effect')
                $(`input[value="${customerId}"]`).parents('.content-item').addClass('loader-effect')
                if (customerId) {
                    const data = await fetchdata(this.jwt, `/admin/api/customers/${customerId}`, 'delete', true)
                    if (data != null) {
                        $(`input[value="${customerId}"]`).parents('.content-item').fadeOut(300).remove()

                        this.allCustomers = this.allCustomers.filter(c => c._id.toString() != customerId.toString())
                        this.closeSingleCustomer()
                        showmessage('Driver Deleted', data.json.messageType, 'body')
                    }

                    $('.single-item .inside-wrapper').removeClass('loader-effect')
                    $(`input[value="${customerId}"]`).parents('.content-item').removeClass('loader-effect')

                }
            } else {
                e.preventDefault()
            }

        },
        confirmAssigned: async function (e) {
            e.preventDefault()
            const shipmentNo = $('#shipmentNo').val()
            const customerId = this.opened
            $('.pop-up_container_form').addClass('loader-effect')
            const data = await fetchdata(this.jwt, `/admin/api/drivers/assign/${customerId}?shipment=${shipmentNo}`, 'put', {}, false)
            if (data) {

                showmessage(data.json.message, data.json.messageType, 'body')
            }
            $('.pop-up_container_form').removeClass('loader-effect')

            // $(e.target).find('.loading').css({ display: "none" })
        },
        getCustomerShipments: async function (e) {
            const customerId = findItemId('customerId', e)
            $('.customer-shipments_sheet .order').remove()
            $('.customer-shipments_sheet').addClass('slide')
            $('.customer-shipments_sheet .loading').addClass('block')
            const data = await fetchdata(this.jwt, `/admin/api/customers/shipments/${customerId}`, 'get', {}, true)
            if (data != null) {
                const shipments = data.json.shipments
                config.openedShipments = shipments
                config.renderShipments(shipments)
            }

        },
        renderShipments: function (orders) {
            $('.customer-shipments_sheet .loading').removeClass('block')
            $('.order').remove()
            $('.contentFallBack').remove()
            if (orders.length === 0) return $('.customer-shipments_sheet .inside-wrapper').append(`<div class="contentFallBack"><h2>No result to display</h2></div>`)
            orders.forEach(o => orderItem(o))


        },


        sortShipmentsByDate: function (e) {
            let sorted = []
            bubbleSort(config.openedShipments)
            function bubbleSort(arr) {
                var noSwaps;
                for (var i = arr.length; i > 0; i--) {
                    noSwaps = true
                    for (var j = 0; j < i - 1; j++) {
                        if (arr[j].date > arr[j + 1].date) {
                            var temp = arr[j]
                            arr[j] = arr[j + 1]
                            arr[j + 1] = temp
                            noSwaps = false
                        }
                    }
                    if (noSwaps) break;
                }
                return sorted = arr
            }
            if ($(e.target).hasClass('sort-new')) {

                config.renderShipments(sorted.reverse())
            } else {
                config.renderShipments(sorted)

            }
            return sorted
        },

        searchShipmentSerial: function (e) {
            // const text = $(e.target).val()
            var str = event.target.value.toString()
            var filteredArr = config.openedShipments.filter((i) => {

                var xSub = i.serial.toString()
                return i.serial.toString().includes(str) || config.checkSerial(xSub, str)
            })
            config.renderShipments(filteredArr)

        },
        checkSerial: function (name, str) {
            var pattern = str.split("").map((x) => {
                return `(?=.*${x})`
            }).join("");
            var regex = new RegExp(`${pattern}`, "g")
            return name.match(regex);
        },
        closeShipments: function (e) {
            $('.customer-shipments_sheet').removeClass('slide')
            $('.customer-shipments_sheet .order').remove()
            config.openedShipments = []
        },
        openShipmentBox: function (e) {
            let orderId
            if ($(e.target).hasClass('.order')) {
                orderId = $(e.target).find('input[name="orderId"]').val()
            } else {
                orderId = $(e.target).parents('.order').find('input[name="orderId"]').val()
            }

            const order = config.openedShipments.find(o => { return o.id == orderId })
            const itemsBox = $(e.target).parents('.order').find('.itemsBox')

            if (!itemsBox.has('.item').length > 0) {
                itemsBox.removeClass('none')
                order.items.forEach(i => {
                    if (i.hasPeriodTime) {

                        itemsBox.append(`
                        <div class="grid bg-w p-3 border-1-b">
                        <p class="item">${i.name}</p >
                        <p>Plan:${i.plan.unit}</p>
                        <p>Plan:${i.plan.price}</p>
                        <p>Duration:${i.plan.periodTime.from} - ${i.plan.periodTime.to}</p>

                        </div>
                        `)
                    } else {

                        itemsBox.append(`
                        <div class="flex f-space-around bg-w p-3 border-1-b p-relative">
                        ${i.refunded ?
                                `<div class="marked paidstatuse block alert-warning" style="right:70px">
                                <span tooltip="Refunded" flow="left"><i class="fas fa-sync font-s"></i></span>
                            </div>`
                                : ''}
                        <p class="item">${i.name}</p>
                        <p>Quantity:${i.quantity}</p>
                        </div>
                        `)
                    }
                })
            } else {
                itemsBox.addClass('none')
                itemsBox.empty()
            }

        },


    }
    config.init()
})()



