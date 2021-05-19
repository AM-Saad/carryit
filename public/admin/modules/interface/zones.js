/*jslint browser: true*/

/*global console, alert, $, jQuery, hamburger_cross*/



(function () {
    const config = {
        jwt: $('input[name="_csrf"]').val(),
        allZones: [],
        openedShipments: [],
        customerImg: null,
        opened: null,
        editing: false,
        init: async function () {
            this.cashDom()
            this.bindEvents()
            this.getZones()

        },
        cashDom: function () {
            this.$togglefilters = $('.toggle-filters')

            this.$togglecreateZonebox = $('.toggle-new-zone')
            this.$customerImg = $('.driverImage')
            this.$searchname = $('#search-name')

        },
        bindEvents: function () {
            this.$togglefilters.on('click', this.togglefilters.bind(this))

            this.$togglecreateZonebox.on('click', this.togglecreateZonebox.bind(this))
            this.$searchname.on('keyup', this.searchCustomerName.bind(this))


            $('body').on('click', '.content-item', this.openZone.bind(this));
            $('body').on('click', '.close-single-item', this.closeSingleCustomer.bind(this))
            $('body').on('submit', '.assign-shipment', this.confirmAssigned.bind(this))
            $('body').on('click', '.customer-shipments .order', this.openShipmentBox.bind(this))
            $('body').on('click', '.customer-shipments .close-shipments', this.closeShipments.bind(this))

            $('.new-zone-box form').on('submit', this.saveZone.bind(this))

            $('body').on('click', '.edit-zone', this.editZone.bind(this))

            $('body').on('click', '.delete-zone', this.deleteZone.bind(this))

            $('body').on('click', '.customer-shipments', this.getCustomerShipments.bind(this))

            $('body').on('click', '.sort', this.sortZones.bind(this))

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
        getZones: async function (e) {

            $('.content .loading').removeClass('none')
            const data = await fetchdata(this.jwt, '/admin/api/zones', 'get', {}, true)
            $('.content .loading').addClass('none')

            if (data != null) {
                this.renderZones(data.json.zones)
                return this.allZones = data.json.zones
            }
        },
        searchCustomerName: function (e) {
            // const text = $(e.target).val()
            var str = event.target.value.toLowerCase()
            var filteredArr = config.allZones.filter((i) => {
                var xSub = i.name.toLowerCase()
                return i.name.toLowerCase().includes(str) || config.checkName(xSub, str)
            })
            console.log(filteredArr);

            config.renderZones(filteredArr)

        },
        checkName: function (name, str) {
            var pattern = str.split("").map((x) => {
                return `(?=.*${x})`
            }).join("");
            var regex = new RegExp(`${pattern}`, "g")
            return name.match(regex);
        },

        getZoneObeject: function (e) {
            const zoneId = findItemId('zoneId', e)
            console.log(zoneId);
            const zone = config.filterSingleZone(zoneId)
            return zone
        },

        filterSingleZone: function (zoneId) {
            const zone = this.allZones.find(c => { return c._id.toString() === zoneId.toString() })
            return zone
        },
        openZone: function (e) {
            const zone = this.getZoneObeject(e)
            this.opened = zone._id
            return createSingleItem(zone)

        },
        closeCustomer: (e) => {
            $('.single-item').remove()
        },
        togglecreateZonebox: function (e) {
            $('.new-zone-box').toggleClass('slide')
            if ($('.new-zone-box').hasClass('slide')) $('#zoneName').focus()
            this.resetData()
        },

        createZoneForm: function () {
            const name = $('#zoneName').val();
            const governorate = $('#governorate').val()
            const id = parseInt($('#zoneId').val(), 10)
            const shipping = parseInt($('#zoneshipping').val(), 10)

            const delivery = document.getElementById("delivery").checked
            const pickup = document.getElementById("pickup").checked
            console.log(pickup);
            console.log(delivery);
            const notes = $('#newzoneotes').val()
            if (!name.replace(/\s/g, '').length || !governorate.replace(/\s/g, '').length || !shipping) {
                showmessage('All Stared <span class="c-r">"*"</span> fields required ', 'info', 'body')
                return false
            } else {
                let formData = new FormData();
                formData.append("name", name)
                formData.append("governorate", governorate)
                formData.append("id", id)
                formData.append("shipping", shipping)
                formData.append("notes", notes)
                formData.append("delivery", delivery)
                formData.append("pickup", pickup)

                return formData
            }
        },
        saveZone: async function (e) {
            e.preventDefault()
            const newform = this.createZoneForm()
            if (newform != false) {
                $('.new-zone-box form').addClass('loader-effect')
                let data
                if (this.editing) {
                    $(`input[value="${this.opened}"]`).parents('.content-item').addClass('loader-effect')
                    data = await fetchdata(this.jwt, `/admin/api/zones/${this.opened}`, 'put', newform, false)
                    $(`input[value="${this.opened}"]`).parents('.content-item').removeClass('loader-effect')

                } else {
                    data = await fetchdata(this.jwt, '/admin/api/zones', 'post', newform, false)
                }
                if (data != null) {
                    showmessage(data.json.message, data.json.messageType, 'body')

                    if (this.editing) {
                        const updatedZone = data.json.zone
                        const oldObject = this.allZones.findIndex(c => c._id.toString() == updatedZone._id.toString())
                        this.allZones[oldObject] = updatedZone
                        this.togglecreateZonebox()
                        this.renderZones(this.allZones)
                        createSingleItem(updatedZone)
                    } else {

                        this.allZones.push(data.json.zone)
                        this.renderZones(this.allZones)
                        this.togglecreateZonebox()
                    }
                    this.resetData()
                }
                $('.new-zone-box form').removeClass('loader-effect')

            }

        },
        resetData: function (e) {
            $('input[name="newzonename"]').val('');
            $('input[name="newzoneId"]').val('')
            $('input[name="newzoneshipping"]').val('')
            $('input[name="newzoneotes"]').val('')
            document.getElementById('pickup').checked = true
            document.getElementById('delivery').checked = true
            config.customerImg = null
            config.editing = false
        },
        editZone: function (e) {
            e.preventDefault()
            e.stopPropagation()
            const zoneId = findItemId('zoneId', e)
            const zone = this.allZones.find(c => c._id.toString() == zoneId.toString())
            this.opened = zone._id
            this.editing = true

            $('#zoneName').val(zone.name);
            $('#zoneId').val(zone.zoneId)
            $('#zoneshipping').val(zone.shipping)
            $('#newzoneotes').val(zone.notes)
            $('#governorate').trigger('change').val(zone.governorate)
            $('.new-zone-box').addClass('slide')
            document.getElementById('pickup').checked = zone.pickup
            document.getElementById('delivery').checked = zone.delivery

        },


        renderZones: function (customers) {
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

        deleteZone: async function (e) {
            e.stopPropagation()
            if (confirm("Do you want to delete this Zone?")) {
                const zoneId = findItemId('zoneId', e)
                $('.single-item .inside-wrapper').addClass('loader-effect')
                $(`input[value="${zoneId}"]`).parents('.content-item').addClass('loader-effect')
                if (zoneId) {
                    const data = await fetchdata(this.jwt, `/admin/api/zones/${zoneId}`, 'delete', true)
                    if (data != null) {
                        $(`input[value="${zoneId}"]`).parents('.content-item').fadeOut(300).remove()

                        this.allZones = this.allZones.filter(c => c._id.toString() != zoneId.toString())
                        this.closeSingleCustomer()
                        showmessage('Zone Deleted', data.json.messageType, 'body')
                    }

                    $('.single-item .inside-wrapper').removeClass('loader-effect')
                    $(`input[value="${zoneId}"]`).parents('.content-item').removeClass('loader-effect')

                }
            } else {
                e.preventDefault()
            }

        },
        confirmAssigned: async function (e) {
            e.preventDefault()
            const shipmentNo = $('#shipmentNo').val()
            const zoneId = this.opened
            $('.pop-up_container_form').addClass('loader-effect')
            const data = await fetchdata(this.jwt, `/admin/api/drivers/assign/${zoneId}?shipment=${shipmentNo}`, 'put', {}, false)
            if (data) {

                showmessage(data.json.message, data.json.messageType, 'body')
            }
            $('.pop-up_container_form').removeClass('loader-effect')

            // $(e.target).find('.loading').css({ display: "none" })
        },
        getCustomerShipments: async function (e) {
            const zoneId = findItemId('zoneId', e)
            $('.customer-shipments .order').remove()
            $('.customer-shipments').addClass('slide')
            $('.customer-shipments .loading').addClass('block')
            const data = await fetchdata(this.jwt, `/admin/api/customers/shipments/${zoneId}`, 'get', {}, true)
            if (data != null) {
                const shipments = data.json.shipments
                config.openedShipments = shipments
                config.renderShipments(shipments)
            }

        },
        renderShipments: function (orders) {
            $('.customer-shipments .loading').removeClass('block')
            $('.order').remove()
            $('.contentFallBack').remove()
            if (orders.length === 0) return $('.customer-shipments .inside-wrapper').append(`<div class="contentFallBack"><h2>No result to display</h2></div>`)
            orders.forEach(o => orderItem(o))


        },

        sortZones: function (e) {
            const { filterType, filterVal, filterSku } = this.getSortingInfo(e)
            let items = this.allZones
            let sorted
            if (filterType == "shipmentslength" || filterType === 'price') {
                sorted = this.bubbleSort(items, filterType, filterVal)
            } else {
                sorted = this.sortHighCommission(items, filterType, filterVal)
                console.log(sorted);
            }
            this.renderZones(sorted)

        },
        getSortingInfo: function (e) {
            let filterType;
            let filterVal;
            let filterSku;
            if ($(e.target).hasClass('sort')) {
                filterType = $(e.target).data('filter')
                filterVal = $(e.target).data('val')
                filterSku = $(e.target).data('sku')
            } else {
                filterType = $(e.target).parents('.options-filters_tag').data('filter')
                filterVal = $(e.target).parents('.options-filters_tag').data('val')
                filterSku = $(e.target).parents('.options-filters_tag').data('sku')
            }
            return { filterType, filterVal, filterSku }

        },
        bubbleSort: function (arr, sortType, sortVal) {
            let sorted = []
            var noSwaps;
            if (sortType == 'shipmentslength') {
                for (var i = arr.length; i > 0; i--) {
                    noSwaps = true
                    for (var j = 0; j < i - 1; j++) {
                        if (arr[j].shipments.length > arr[j + 1].shipments.length) {
                            var temp = arr[j]
                            arr[j] = arr[j + 1]
                            arr[j + 1] = temp
                            noSwaps = false
                        }
                    }
                    if (noSwaps) break;
                }
            } else {
                for (var i = arr.length; i > 0; i--) {
                    noSwaps = true
                    for (var j = 0; j < i - 1; j++) {
                        if (arr[j].shipping > arr[j + 1].shipping) {
                            var temp = arr[j]
                            arr[j] = arr[j + 1]
                            arr[j + 1] = temp
                            noSwaps = false
                        }
                    }
                    if (noSwaps) break;
                }
            }
            if (sortVal === 'high') arr.reverse()
            return sorted = arr
        },
        sortHighCommission: function (arr, sortType, sortVal) {
            let sorted = []
            var noSwaps;
            for (var i = arr.length; i > 0; i--) {
                noSwaps = true
                for (var j = 0; j < i - 1; j++) {
                    const first = arr[j].commission.reduce((acc, co) => { return acc + co.amount }, 0)
                    const sec = arr[j + 1].commission.reduce((acc, co) => { return acc + co.amount }, 0)
                    console.log(first);
                    if (first > sec) {
                        var temp = arr[j]
                        arr[j] = arr[j + 1]
                        arr[j + 1] = temp
                        noSwaps = false
                    }
                }
                if (noSwaps) break;
            }
            if (sortVal === 'high') arr.reverse()

            return sorted = arr
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
            $('.customer-shipments').removeClass('slide')
            $('.customer-shipments .order').remove()
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



