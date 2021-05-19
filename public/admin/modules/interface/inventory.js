/*jslint browser: true*/

/*global console, alert, $, jQuery, hamburger_cross*/



(function () {
    const config = {
        jwt: $('input[name="_csrf"]').val(),
        allShipements: [],
        openedShipments: [],
        customerImg: null,
        opened: null,
        editing: false,
        filters: { types: [], items: [] },
        searchDateType: 'date',
        from: moment().format('YYYY-MM-DD'),
        to: moment().format('YYYY-MM-DD'),
        scanner_action: null,
        scanning: false,
        init: async function () {
            this.cashDom()
            this.bindEvents()
            this.getPicker()
            this.detectScanner()
            let exist = await this.getStoredShipment()
            if (exist == false) this.getShipments({ from: this.from, to: this.to, type: this.searchDateType }, 'entry_date')

        },
        cashDom: function () {
            this.$togglefilters = $('.toggle-filters')

            this.$togglecreateShipemntbox = $('.toggle-new-customer')
            this.$customerImg = $('.driverImage')
            this.$searchname = $('#search-name')
            this.$searchstatus = $('#search-status')

        },
        bindEvents: function () {
            // document.addEventListener('keypress', this.checkKey.bind(this), true)

            this.$togglecreateShipemntbox.on('click', this.togglecreateShipemntbox.bind(this))
            this.$searchname.on('keyup', this.searchShipmentNo.bind(this))
            this.$searchstatus.on('change', this.searchShipmentStatus.bind(this))

            $('body').on('click', '.filter-shipments', this.filterItems.bind(this))
            $('body').on('click', '.remove-filter', this.removeFilter.bind(this))
            $('body').on('click', '.create-excel', this.createExcel.bind(this))
            $('body').on('click', '.sort', this.sortShipments.bind(this))

            $('body').on('click', '.content-item', this.openShipment.bind(this));
            $('body').on('click', '.close-single-item', this.closeSingleShipment.bind(this))
            $('body').on('change', '#shipmentstatus', this.checkChangedStatus.bind(this))

            $('body').on('change', '#search-date-type', this.dateType.bind(this))
            $('body').on('submit', '.change-status', this.changeStatus.bind(this))


            $('body').on('click', '.open-form[data-form="assignForm"]', this.getDriver.bind(this))
            $('body').on('submit', '.assign-shipment', this.confirmAssigned.bind(this))

            $('body').on('click', '.customer-shipments .order', this.openShipmentBox.bind(this))
            $('body').on('click', '.customer-shipments .close-shipments', this.closeShipments.bind(this))

            $('.new-shipment-box form').on('submit', this.saveShipment.bind(this))
            $('body').on('click', '.edit-item', this.editShipment.bind(this))
            $('body').on('click', '.delete-item', this.deleteItem.bind(this))

            $('body').on('click', '.get-invoice', this.getInvoice.bind(this))
            $('body').on('click', '#printInvoice', () => window.print())
            $('body').on('click', '.close-invoice', () => $('#invoice').remove())

        },

        getPicker: function (e) {
            const start = moment()
            const end = moment()
            function cb(start, end) {
                $('#reportrange span').html(start.format('MMMM D, YYYY') + " - " + end.format('MMMM D, YYYY'));
                $('.sorting h4').html(start.format('MMMM D, YYYY') + " - " + end.format('MMMM D, YYYY'));
            }
            cb(start, end);

            $('#reportrange').daterangepicker({
                startDate: start,
                endDate: end,
                ranges: {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                }
            }, cb);

            $('#reportrange').on('apply.daterangepicker', function (ev, picker) {
                config.from = picker.startDate.format('YYYY-MM-DD')
                config.to = picker.endDate.format('YYYY-MM-DD')
                config.getShipments({ from: picker.startDate.format('YYYY-MM-DD'), to: picker.endDate.format('YYYY-MM-DD'), type: config.searchDateType }, 'date')
                cb(picker.startDate, picker.endDate);

            });
        },
        getStoredShipment: async function (e) {
            const itemId = localStorage.getItem('si')
            if (!itemId) return false
            const data = await this.getShipments({ no: itemId }, 'serial')
            if (data) {
                this.opened = data[0].shipmentNo

                createSingleItem(data[0])
                localStorage.removeItem('si')
                return true
            }
        },
        getShipments: async function (query, searchType) {
            $('.content-item').remove()
            this.filters = { types: [], items: [] }
            renderFilter([])
            $('.content .loading').removeClass('none')

            const url = this.getQueryUrl(query, searchType)
            const data = await fetchdata(this.jwt, url, 'get', {}, true)
            $('.content .loading').addClass('none')

            if (data != null) {
                this.renderShipments(data.json.inventory[0].items)
                this.allShipements = data.json.inventory[0].items
                return data.json.inventory[0].items
            }
        },
        dateType: function (e) { this.searchDateType = $(e.target).val() },
        searchShipmentNo: function (e) { this.getShipments({ no: e.target.value }, 'serial') },
        searchShipmentStatus: function (e) { this.getShipments({ status: $(e.target).val() }, 'status') },
        getQueryUrl: (query, searchType) => {
            switch (searchType) {
                case 'date':
                    return `/admin/api/inventory?from=${query.from}&&to=${query.to}&&type=${query.type}`
                case 'serial':
                    return `/admin/api/inventory?no=${query.no}`
                case 'status':
                    return `/admin/api/inventory?status=${query.status}`
                case 'id':
                    return `/admin/api/inventory?id=${query.id}`
                default:
                    return `/admin/api/inventory`
            }
        },
        createExcel: function (e) {
            e.preventDefault()
            let items = this.filterForExcel(this.allShipements)
            this.exportReport(items)
        },
        filterForExcel: function (items) {
            const shipments = items.map((s) => ({ date: s.date, shipmentNo: s.shipmentNo, price: s.price, stauts: s.status.text, note: s.status.reason ? s.status.reason : s.status.note, driver: s.driver.name }))
            return shipments
        },
        exportReport: function (json) {
            const fields = Object.keys(json[0]);

            const replacer = function (key, value) { return value === null ? '' : value };
            let csv = json.map(function (row) { return '\r\n' + fields.map(function (fieldName) { return JSON.stringify(row[fieldName], replacer) }) });
            csv.unshift(fields.join(','))  // add header column
            csv = 'sep=,\r\n' + csv.join(',');


            window.URL = window.URL || window.webkiURL;

            let blob = new Blob([csv], { type: 'text/csv' });
            const csvUrl = window.URL.createObjectURL(blob);
            const filename = `report.csv`;

            $(".download-sheet").attr({ 'download': filename, 'href': csvUrl })
            // $('.download-sheet').trigger('click')
            $(".download-sheet").removeClass('none')
        },
        getShipmentObeject: function (e) {
            const itemId = findItemId('itemId', e)
            const shipment = config.filterSingleShipment(itemId)
            return shipment
        },

        filterSingleShipment: function (itemId) {
            const shipment = this.allShipements.find(c => { return c._id.toString() === itemId.toString() })
            return shipment
        },
        checkKey: function (e) {
            const uniKey = e.which
            const char = String.fromCharCode(e.which)
            if (!this.scanning) {

                switch (uniKey) {
                    case 99:
                        this.scanning = true
                        this.scanner_action = { method: 'put', status: 5 }
                        showmessage('الشحنات الممسوحه القادمه سوف يتم تعدلها الي تم الالغاء', 'danger', 'body')
                        break;
                    case 100:
                        this.scanning = true
                        this.scanner_action = { method: 'put', statue: 4 }
                        showmessage(' الشحنات الممسوحه القادمه سوف يتم تعدلها الي تم التسليم', 'info', 'body')
                        break;
                    case 42:
                        this.scanning = true
                        this.scanner_action = { method: 'put', statue: 3 }
                        showmessage(' الشحنات الممسوحه القادمه سوف يتم تعدلها الي في الطريق', 'info', 'body')
                        break;
                    case 103:
                        this.scanning = true
                        this.scanner_action = { method: 'get' }
                        showmessage(' الشحنات الممسوحه القادمه سوف يتم احضارها', 'info', 'body')

                        break;
                    default:
                        this.scanning = false
                        return

                }
            }

        },
        detectScanner: function () {
            $(document).scannerDetection({
                timeBeforeScanTest: 200,
                avgTimeByChar: 40,
                // it's not a barcode if a character takes longer than 100ms
                // wait  for the next character for upto 200ms 
                preventDefault: true, endChar: [13],
                onComplete: function (barcode) {
                    console.log(barcode);
                    config.scanning = false;
                    // $('#scannerInput').val(barcode);
                    // if (!validScan) return showmessage("Try to scan again.", "info", 'body')
                    config.scannerActions(barcode, config.scanner_action)
                },
                // main callback function
                onError: function (string, qty) {
                    console.log('immaa');
                    // return showmessage("Try to scan again.", "info", 'body')
                }
            });
        },
        scannerActions: async function (barcode, action) {
            console.log(action);
            // if (action.method == 'get') {
            const data = await config.getShipments({ id: "60534f9fbce2202a08147b38" }, 'id')
            if (data) {
                console.log(data);
                createSingleItem(data[0])
            }
            // }
        },
        // $(window).scannerDetection()[0].scannerDetectionOff()

        openShipment: function (e) {
            const shipment = this.getShipmentObeject(e)
            this.opened = shipment.shipmentNo
            return createSingleItem(shipment)

        },
        closeCustomer: (e) => {
            $('.single-item').remove()
        },
        togglecreateShipemntbox: function (e) {
            $('.new-shipment-box').toggleClass('slide')
            if ($('.new-shipment-box').hasClass('slide')) $('#shipmentName').focus()

        },

        createShipmentForm: function () {
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
        saveShipment: async function (e) {
            e.preventDefault()
            const newform = this.createShipmentForm()
            if (newform != false) {
                $('.new-shipment-box form').addClass('loader-effect')
                let data
                if (this.editing) {
                    $(`input[value="${this.opened}"]`).parents('.content-item').addClass('loader-effect')
                    data = await fetchdata(this.jwt, `/admin/api/shipments/${this.opened}`, 'put', newform, false)

                    $(`input[value="${this.opened}"]`).parents('.content-item').removeClass('loader-effect')

                } else {
                    data = await fetchdata(this.jwt, '/admin/api/shipments', 'post', newform, false)

                }
                if (data != null) {
                    showmessage(data.json.message, data.json.messageType, 'body')

                    if (this.editing) {
                        this.updateItem(data.json.shipment)
                        this.togglecreateShipemntbox()
                        createSingleItem(data.json.shipment)
                        $(`input[value="${this.opened}"]`).parents('.content-item').removeClass('loader-effect')

                    } else {

                        this.allShipements.push(data.json.shipment)
                        this.togglecreateShipemntbox()
                    }
                    this.updateItemElm(data.json.shipment)

                    this.resetData()
                }
                $('.new-shipment-box form').removeClass('loader-effect')

            }

        },
        updateItem: async function (updatedObj) {
            const oldIndex = config.allShipements.findIndex(d => d._id.toString() === updatedObj._id.toString())
            config.allShipements[oldIndex] = updatedObj
            return oldIndex
        },
        updateItemElm: function (updatedObj) {
            const exisitInput = $(`input[value="${updatedObj._id}"]`).parents('.content-item')
            const newDomElm = createitemBox(updatedObj)
            if (exisitInput.length <= 0) return $('.content .items').append(newDomElm);
            if (exisitInput.length > 0) return exisitInput.replaceWith(newDomElm)
        },
        resetData: function (e) {
            $('input[name="newshipmentname"]').val('');
            $('input[name="newshipmentmobile"]').val('')
            $('input[name="newshipmentaddress"]').val('')
            $('input[name="newshipmentemail"]').val('')
            $('input[name="newshipmentnotes"]').val('')
            config.customerImg = null
            config.editing = false
        },
        editShipment: function (e) {
            e.preventDefault()
            e.stopPropagation()
            const itemId = findItemId('itemId', e)
            const shipment = this.allShipements.find(c => c._id.toString() == itemId.toString())
            this.opened = shipment.shipmentNo
            this.editing = true

            $('#shipmentName').val(shipment.name);
            $('#shipmentNumber').val(shipment.mobile)
            $('#shipmentAddress').val(shipment.address)
            $('#shipmentEmail').val(shipment.email)
            $('#newshipmentnotes').val(shipment.note)

            $('.new-shipment-box').addClass('slide')

        },


        renderShipments: function (shipments) {
            $('.content .loading').removeClass('block')
            $('.content-item').remove()
            removeFullBack()

            if (shipments.length === 0) return $("main .content").prepend(emptycontent())
            shipments.forEach(s => createitemBox(s))
        },


        closeSingleShipment: function () {
            // config.opened = null
            $('.single-item').removeClass('scale')
        },

        deleteItem: async function (e) {
            e.stopPropagation()
            if (confirm("هل تريد حذف هذا العنصر?")) {
                const itemId = findItemId('itemId', e)
                $('.single-item .inside-wrapper').addClass('loader-effect')
                $(`input[value="${itemId}"]`).parents('.content-item').addClass('loader-effect')
                if (itemId) {
                    const data = await fetchdata(this.jwt, `/admin/api/inventory/${itemId}`, 'delete', true)
                    if (data != null) {
                        $(`input[value="${itemId}"]`).parents('.content-item').fadeOut(300).remove()

                        this.allShipements = this.allShipements.filter(c => c._id.toString() != itemId.toString())
                        this.closeSingleShipment()
                        showmessage('Item Deleted', data.json.messageType, 'body')
                    }

                    $('.single-item .inside-wrapper').removeClass('loader-effect')
                    $(`input[value="${itemId}"]`).parents('.content-item').removeClass('loader-effect')

                }
            } else {
                e.preventDefault()
            }

        },

        getInvoice: function (e) {
            // const itemId = findItemId('itemId', e)
            const shipment = this.getShipmentObeject(e)
            invoice(shipment)
        },
        checkChangedStatus: (e) => {
            const status = $('#shipmentstatus').val()
            if (status == 5 || status == 6) {
                $('.shipmentreason').removeClass('none')
            } else {
                $('.shipmentreason').addClass('none')
            }
        },
        changeStatus: async function (e) {
            e.preventDefault()
            const status = $('#shipmentstatus').val()
            const itemId = this.opened
            let reason
            if (status == 5) {
                reason = $('#shipmentreason').val()
            }
            $('.pop-up_container_form').addClass('loader-effect')
            const data = await fetchdata(this.jwt, `/admin/api/shipments/status/${itemId}`, 'put', JSON.stringify({ status: status, reason: reason }), true)
            if (data) {

                showmessage(data.json.message, data.json.messageType, 'body')
            }
            $('.pop-up_container_form').removeClass('loader-effect')

            // $(e.target).find('.loading').css({ display: "none" })
        },
        filterItems: function (e) {
            const { filterType, filterVal, filterSku } = this.getFiltertionInfo(e)
            let exist = false
            for (let item of this.filters.types) {
                if (item.filterType === filterType && item.filterVal === filterVal) {
                    exist = true
                    break
                }
            }
            if (!exist) {
                let items = []
                if (filterType == "status") {
                    items = this.filterStatus(filterVal)
                } else {
                    items = this.bubbleSort(this.allShipements)
                    if (filterVal == 'high') items = items.reverse()
                }
                this.filters.items = [...this.filters.items, ...items]
                this.filters.types.push({ filterType, filterSku, filterVal, items })
                this.renderShipments(this.filters.items)
                renderFilter(this.filters.types)
            }

        },

        filterStatus: function (status) {

            let shipments = this.allShipements.filter(s => s.status.no === status)
            return shipments
        },
        removeFilter: function (e) {
            const { filterType, filterVal, filterSku } = this.getFiltertionInfo(e)

            let presestFilters = []
            let presestItems = []
            for (let item of this.filters.types) {
                console.log(item);
                console.log(filterType);
                if (item.filterVal != filterVal && item.filterType == filterType) {
                    console.log('here');
                    presestFilters.push(item)
                    presestItems = [...presestItems, ...item.items]
                }
            }
            this.filters.types = presestFilters
            this.filters.items = presestItems
            if (this.filters.items.length == 0) {
                this.renderShipments(this.allShipements)
            } else {
                this.renderShipments(this.filters.items)
            }
            renderFilter(this.filters.types)
        },
        getFiltertionInfo: function (e) {
            let filterType;
            let filterVal;
            let filterSku;
            if ($(e.target).hasClass('filter-shipments')) {
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

        sortShipments: function (e) {
            const { filterType, filterVal, filterSku } = this.getSortingInfo(e)
            let items = this.allShipements
            if (this.filters.items.length > 0) items = this.filters.items
            const sorted = this.bubbleSort(items, filterType, filterVal)
            this.renderShipments(sorted)

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
            for (var i = arr.length; i > 0; i--) {
                if (sortType == 'date') {
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
                } else {
                    noSwaps = true
                    for (var j = 0; j < i - 1; j++) {
                        if (arr[j].price > arr[j + 1].price) {
                            var temp = arr[j]
                            arr[j] = arr[j + 1]
                            arr[j + 1] = temp
                            noSwaps = false
                        }
                    }
                    if (noSwaps) break;
                }
            }
            if (sortType === 'date') {
                if (sortVal === 'new') arr.reverse()
            } else {
                if (sortVal === 'high') arr.reverse()
            }
            return sorted = arr
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
            const shipmentNo = this.opened
            const driverNumber = $('#driverNo').val()
            $('.pop-up_container_form').addClass('loader-effect')
            const data = await fetchdata(this.jwt, `/admin/api/shipments/assign/${shipmentNo}?driver=${driverNumber}`, 'put', JSON.stringify({}), true)
            if (data) {
                this.updateItem(data.json.shipment)
                createSingleItem(data.json.shipment)
                this.updateItemElm(data.json.shipment)
                showmessage(data.json.message, data.json.messageType, 'body')
            }
            $('.pop-up_container_form').removeClass('loader-effect')

            // $(e.target).find('.loading').css({ display: "none" })
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



