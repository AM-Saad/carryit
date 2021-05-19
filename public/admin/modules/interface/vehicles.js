/*jslint browser: true*/

/*global console, alert, $, jQuery, hamburger_cross*/



(function () {
    const config = {
        jwt: $('input[name="_csrf"]').val(),
        allItems: [],
        openedShipments: [],
        customerImg: null,
        opened: null,
        editing: false,
        init: async function () {
            this.cashDom()
            this.bindEvents()
            this.getItems()

        },
        cashDom: function () {
            this.$togglefilters = $('.toggle-filters')

            this.$togglecreateItembox = $('.toggle-new-item')
            this.$customerImg = $('.driverImage')
            this.$searchname = $('#search-name')

        },
        bindEvents: function () {
            this.$togglecreateItembox.on('click', this.togglecreateItembox.bind(this))
            this.$searchname.on('keyup', this.searchItemName.bind(this))


            $('body').on('click', '.content-item', this.openItem.bind(this));
            $('body').on('click', '.close-single-item', this.closeSingleItem.bind(this))
            $('body').on('submit', '.assign-shipment', this.confirmAssigned.bind(this))

            $('.new-item-box form').on('submit', this.saveItem.bind(this))

            $('body').on('click', '.edit-item', this.editItem.bind(this))
            $('body').on('click', '.open-form[data-form="assignForm"]', this.getDriver.bind(this))
            $('body').on('submit', '.open-form[data-form="assignForm"]', this.confirmAssigned.bind(this))

            $('body').on('click', '.delete-item', this.deleteItem.bind(this))


            $('body').on('click', '.get-info-table', this.infoTable.bind(this))
            $('body').on('click', '.close-info-table', this.closeInfoTable.bind(this))
            
        },

        getItems: async function (e) {
            $('.content .loading').removeClass('none')
            const data = await fetchdata(this.jwt, '/admin/api/vehicles', 'get', {}, true)
            $('.content .loading').addClass('none')

            if (data != null) {
                this.renderItems(data.json.vehicles)
                return this.allItems = data.json.vehicles
            }
        },
        searchItemName: function (e) {
            // const text = $(e.target).val()
            var str = event.target.value.toLowerCase()
            var filteredArr = config.allItems.filter((i) => {
                var xSub = i.name.toLowerCase()
                return i.name.toLowerCase().includes(str) || config.checkName(xSub, str)
            })
            console.log(filteredArr);

            config.renderItems(filteredArr)

        },
        checkName: function (name, str) {
            var pattern = str.split("").map((x) => {
                return `(?=.*${x})`
            }).join("");
            var regex = new RegExp(`${pattern}`, "g")
            return name.match(regex);
        },

        getItemObeject: function (e) {
            const itemId = findItemId('itemId', e)
            console.log(itemId);
            const item = config.filterSingleItem(itemId)
            return item
        },

        filterSingleItem: function (itemId) {
            const item = this.allItems.find(c => { return c._id.toString() === itemId.toString() })
            return item
        },
        openItem: function (e) {
            const item = this.getItemObeject(e)
            this.opened = item._id
            return createSingleItem(item)

        },

        togglecreateItembox: function (e) {
            $('.new-item-box').toggleClass('slide')
            if ($('.new-item-box').hasClass('slide')) $('#name').focus()
            this.resetData()
        },

        createItemForm: function () {
            const name = $('#name').val();
            const vehicle_type = $('#vehicle_type').val()
            const active = document.getElementById('active').checked
            console.log(active);
            const fuelliters = parseInt($('#fuelliters').val(), 10)
            const fuelcost = parseInt($('#fuelcost').val(), 10)
            const notes = $('#notes').val()
            if (!name.replace(/\s/g, '').length || !vehicle_type) {
                showmessage('All Stared <span class="c-r">"*"</span> fields required ', 'info', 'body')
                return false
            }
            let formData = new FormData();
            formData.append("name", name)
            formData.append("active", active)
            formData.append("vehicle_type", vehicle_type)
            formData.append("fuel", JSON.stringify({ liters: fuelliters, cost: fuelcost }))
            formData.append("notes", notes)
            return formData
        },
        saveItem: async function (e) {
            e.preventDefault()
            const newform = this.createItemForm()
            if (newform != false) {
                $('.new-item-box').addClass('loader-effect')
                let data
                if (this.editing) {
                    $(`input[value="${this.opened}"]`).parents('.content-item').addClass('loader-effect')
                    data = await fetchdata(this.jwt, `/admin/api/vehicles/${this.opened}`, 'put', newform, false)
                    $(`input[value="${this.opened}"]`).parents('.content-item').removeClass('loader-effect')
                } else {
                    data = await fetchdata(this.jwt, '/admin/api/vehicles', 'post', newform, false)
                }
                $('.new-item-box').removeClass('loader-effect')
                if (data != null) {
                    showmessage(data.json.message, data.json.messageType, 'body')
                    if (this.editing) {
                        this.updateItem(data.json.vehicle)
                        this.togglecreateItembox()
                        createSingleItem(data.json.vehicle)
                        $(`input[value="${this.opened}"]`).parents('.content-item').removeClass('loader-effect')
                    } else {
                        this.allItems.push(data.json.vehicle)
                        this.togglecreateItembox()
                    }
                    this.updateItemElm(data.json.vehicle)

                    this.resetData()
                }

            }

        },
        updateItem: async function (updatedObj) {
            const oldIndex = config.allItems.findIndex(d => d._id.toString() === updatedObj._id.toString())
            config.allItems[oldIndex] = updatedObj
            return oldIndex
        },
        updateItemElm: function (updatedObj) {
            const exisitInput = $(`input[value="${updatedObj._id}"]`).parents('.content-item')
            const newDomElm = createitemBox(updatedObj)
            if (exisitInput.length <= 0) return $('.content .items').append(newDomElm);
            if (exisitInput.length > 0) return exisitInput.replaceWith(newDomElm)
        },
        editItem: function (e) {
            e.preventDefault()
            e.stopPropagation()
            const itemId = findItemId('itemId', e)
            const item = this.allItems.find(c => c._id.toString() == itemId.toString())
            this.opened = item._id
            this.editing = true
            console.log(item.active);
            $('#name').val(item.name);
            $('#vehicle_type').val(item.vehicle_type)
            $('#fuelliters').val(item.fuel.liters)
            $('#fuelcost').val(item.fuel.cost)
            // $('#active').val(item.active)
            document.getElementById('active').checked = item.active
            $('#notes').val(item.notes)
            $('.new-item-box').addClass('slide')

        },
        resetData: function (e) {
            document.getElementById('active').checked = true
            $('#name').val('');
            $('#vehicle_type').trigger('change').val('موتوسيكل')
            $('#fuelliters').val(0)
            $('#fuelcost').val(0)
            $('#notes').val('')
            config.editing = false
        },


        renderItems: function (customers) {
            $('.content .loading').removeClass('block')
            $('.content-item').remove()
            removeFullBack()

            if (customers.length === 0) return $("main .content").prepend(emptycontent())
            customers.forEach(s => createitemBox(s))
        },


        closeSingleItem: function () {
            // config.opened = null
            $('.single-item').removeClass('scale')
        },

        deleteItem: async function (e) {
            e.stopPropagation()
            if (confirm("Do you want to delete this Item?")) {
                const itemId = findItemId('itemId', e)
                $('.single-item .inside-wrapper').addClass('loader-effect')
                $(`input[value="${itemId}"]`).parents('.content-item').addClass('loader-effect')
                if (itemId) {
                    const data = await fetchdata(this.jwt, `/admin/api/vehicles/${itemId}`, 'delete', true)
                    if (data != null) {
                        $(`input[value="${itemId}"]`).parents('.content-item').fadeOut(300).remove()

                        this.allItems = this.allItems.filter(c => c._id.toString() != itemId.toString())
                        this.closeSingleItem()
                        showmessage('Zone Deleted', data.json.messageType, 'body')
                    }

                    $('.single-item .inside-wrapper').removeClass('loader-effect')
                    $(`input[value="${itemId}"]`).parents('.content-item').removeClass('loader-effect')

                }
            } else {
                e.preventDefault()
            }

        },
        getDriver: async function (e) {
            $(`[data-form="assignForm"]`).addClass('loader-effect')
            const data = await fetchdata(this.jwt, '/admin/api/drivers', 'get', {}, true)
            if (data != null) {
                $(`[data-form="assignForm"]`).removeClass('loader-effect')
                $('#driverNo').empty().append(`<option value="none">لا يوجد وسليه</option>`)
                return data.json.drivers.forEach(d => $('#driverNo').append(`<option value=${d._id}>${d.name}</option>`))

            }
        },
        confirmAssigned: async function (e) {
            e.preventDefault()
            const driver = $('#driverNo').val()
            const itemId = this.opened
            $('.pop-up_container_form').addClass('loader-effect')
            const data = await fetchdata(this.jwt, `/admin/api/vehicles/assign/${itemId}?driver=${driver}`, 'put', {}, false)
            if (data) {
                showmessage(data.json.message, data.json.messageType, 'body')
                this.updateItem(data.json.vehicle)
                createSingleItem(data.json.vehicle)
                this.updateItemElm(data.json.vehicle)

            }
            $('.pop-up_container_form').removeClass('loader-effect')

            // $(e.target).find('.loading').css({ display: "none" })
        },
        getCustomerShipments: async function (e) {
            const itemId = findItemId('itemId', e)
            $('.customer-shipments .order').remove()
            $('.customer-shipments').addClass('slide')
            $('.customer-shipments .loading').addClass('block')
            const data = await fetchdata(this.jwt, `/admin/api/customers/shipments/${itemId}`, 'get', {}, true)
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


        infoTable: function (e) {
            $('.info-table .items').empty()
            $('.contentFallBack').remove()
            const type = $(e.currentTarget).data('val')
            const vehicle = this.filterSingleItem(config.opened)
            let items
            console.log(type);
            if (type == "fuels") {
                items = vehicle.fuels
                $('.info-table_heading').html('جميع مصاريف البنزين')
            } else {
                $('.info-table_heading').html('جميع مصاريف الصيانه')
                items = vehicle.maintenance
            }
            $('.info-table').addClass('slide')

            if (items.length === 0) return $('.info-table .inside-wrapper').append(`<div class="contentFallBack"><h2>لا يوجد مصاريف ${type == 'fuels' ? "بنزين" : "صيانه"} سابقه </h2></div>`)
            console.log(items);
            console.log(type);
            let totalAmout = 0
            items.forEach(o => {
                totalAmout += o.amount
                infoItem(o)
            })
            $('.info-table .totals').empty().append(`<span>مجموع المصاريف : <b>${totalAmout}</b></span> `)

        },
        closeInfoTable: function (e) {
            $('.info-table').removeClass('slide')
            $('.info-table .items').empty()
        },



    }
    config.init()
})()



