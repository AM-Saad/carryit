/*jslint browser: true*/

/*global console, alert, $, jQuery, hamburger_cross*/



(function () {
    const config = {
        jwt: $('input[name="_csrf"]').val(),
        allShipements: [],
        allCustomers: [],
        selectedCustomer: null,
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
            this.getZones()
            // this.detectScanner()
            let exist = await this.getStoredShipment()
            if (exist == false) this.getShipments({ from: this.from, to: this.to, type: this.searchDateType }, 'date')

        },
        cashDom: function () {
            this.$togglefilters = $('.toggle-filters')

            this.$togglecreateShipemntbox = $('.toggle-new-shipment')
            this.$customerImg = $('.driverImage')
            this.$searchstatus = $('#search-status')

        },
        bindEvents: function () {
            // document.addEventListener('keypress', this.checkKey.bind(this), true)

            this.$togglecreateShipemntbox.on('click', this.togglecreateShipemntbox.bind(this))
            $('#name').on('keyup', this.getCustomers.bind(this))
            $('body').on('click', '#customer_list ul li', this.chooseCustomer.bind(this))
            $('body').on('change', '#search-name', this.searchShipmentNo.bind(this))
            // this.$searchstatus.on('change', this.searchShipmentStatus.bind(this))

            $('body').on('click', '.filter-shipments', this.startFiltering.bind(this))
            $('body').on('click', '.remove-filter', this.removeFilter.bind(this))
            $('body').on('click', '.reset-filter', this.resetFilter.bind(this))

            $('body').on('click', '.create-excel', this.createExcel.bind(this))
            $('body').on('click', '.sort', this.sortShipments.bind(this))
            $('body').on('click', '.download-sheet', this.downloadSheet.bind(this))

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
            $('body').on('click', '.edit-customer', this.editShipment.bind(this))
            $('body').on('click', '.delete-customer', this.deleteShipment.bind(this))

            $('body').on('click', '.get-invoice', this.getInvoice.bind(this))
            $('body').on('click', '#printInvoice', () => window.print())
            $('body').on('click', '.close-invoice', () => $('#invoice').remove())

            $('.get-insight').on('click', this.getInsights.bind(this))
            $('body').on('click', '.close-insight', this.closeInsights.bind(this))


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
                    'اليوم': [moment(), moment()],
                    'البارحه': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'هذا الشهر': [moment().startOf('month'), moment().endOf('month')],
                    'الشهر الماضي': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                }
            }, cb);

            $('#reportrange').on('apply.daterangepicker', function (ev, picker) {
                config.startFiltering(ev, picker)
                // this.filters = { types: [], items: [] }
                // renderFilter([])
                // config.getShipments({ from: picker.startDate.format('YYYY-MM-DD'), to: picker.endDate.format('YYYY-MM-DD'), type: config.searchDateType }, 'date')
                cb(picker.startDate, picker.endDate);

            });
        },
        getStoredShipment: async function (e) {
            const shipmentId = localStorage.getItem('si')
            if (!shipmentId) return false
            const data = await this.getShipments({ no: shipmentId }, 'serial')
            if (data) {
                this.opened = data[0].shipmentNo
                createSingleItem(data[0])
                localStorage.removeItem('si')
                $('#search-name').val(shipmentId)
                return true
            }
        },
        getShipments: async function (query, searchType) {
            $('.content-item').remove()

            $('.content .loading').removeClass('none')

            const url = this.getQueryUrl(query, searchType)
            const data = await fetchdata(this.jwt, url, 'get', {}, true)
            $('.content .loading').addClass('none')

            if (data != null) {
                this.renderShipments(data.json.shipments)
                this.allShipements = data.json.shipments
                return data.json.shipments
            }
        },
        dateType: function (e) { this.searchDateType = $(e.target).val() },
        searchShipmentNo: async function (e) {
            this.resetFilter()
            const shipments = await this.getShipments({ no: e.target.value }, 'serial')
            this.filters.items = shipments
        },
        // searchShipmentStatus: function (e) { this.getShipments({ status: $(e.target).val() }, 'status') },
        getQueryUrl: (query, searchType) => {
            switch (searchType) {
                case 'date':
                    return `/admin/api/shipments?from=${query.from}&&to=${query.to}&&type=${query.type}`
                case 'serial':
                    return `/admin/api/shipments?no=${query.no}`
                case 'status':
                    return `/admin/api/shipments?status=${query.status}`
                case 'id':
                    return `/admin/api/shipments?id=${query.id}`
                case 'zone':
                    return `/admin/api/shipments?zone=${query.zone}`
                default:
                    return `/admin/api/shipments`
            }
        },
        createExcel: function (e) {
            e.preventDefault()
            let items = this.filterForExcel(this.filters.items)
            if (items.length > 0) {
                this.exportReport(items)
            }
        },
        filterForExcel: function (items) {
            const shipments = items.map((s) => ({ date: s.date, shipmentNo: s.shipmentNo, price: s.price, stauts: s.status.text, note: s.status.reason ? s.status.reason : s.status.note, driver: s.driver ? s.driver.name : 'لا يوجد' }))
            return shipments
        },
        exportReport: function (json) {
            const fields = Object.keys(json[0]);
            const replacer = function (key, value) { return value === null ? '' : value };
            let csv = json.map(function (row) { return '\r\n' + fields.map(function (fieldName) { return JSON.stringify(row[fieldName], replacer) }) });
            csv.unshift(fields.join(','))  // add header column
            csv = 'sep=,\r\n' + csv.join(',');

            window.URL = window.URL || window.webkiURL;

            console.log(csv);
            let blob = new Blob([csv], { type: 'text/csv' });
            const csvUrl = window.URL.createObjectURL(blob);
            const filename = `report.csv`;


            $(".create-excel").attr({ 'download': filename, 'href': csvUrl }).html('تحميل').addClass('download-sheet')
            $('.create-excel').removeClass('create-excel')

        },
        downloadSheet: function (e) {
            $(e.target).removeClass('download-sheet').attr({ 'href': '' }).html(`Export <i class="fas fa-file-excel"></i>`).addClass('create-excel')
        },
        getShipmentObeject: function (e) {
            const shipmentId = findItemId('shipmentId', e)
            console.log(shipmentId);
            const shipment = config.filterSingleShipment(shipmentId)
            return shipment
        },

        filterSingleShipment: function (shipmentNo) {
            const shipment = config.filters.items.find(c => c.shipmentNo.toString() === shipmentNo.toString())
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
                    console.log('');
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
            console.log(shipment);
            this.opened = shipment.shipmentNo
            return createSingleItem(shipment)

        },

        togglecreateShipemntbox: function (e) {
            $('.new-shipment-box').toggleClass('slide')
            if ($('.new-shipment-box').hasClass('slide')) $('#name').focus()

        },

        editShipment: function (e) {
            e.preventDefault()
            e.stopPropagation()
            const shipmentId = findItemId('shipmentId', e)
            const shipment = this.allShipements.find(c => c._id.toString() == shipmentId.toString())
            this.opened = shipment.shipmentNo
            this.editing = true

            $('#shipmentName').val(shipment.name);
            $('#shipmentNumber').val(shipment.mobile)
            $('#shipmentAddress').val(shipment.address)
            $('#shipmentEmail').val(shipment.email)
            $('#newshipmentnotes').val(shipment.note)

            $('.new-shipment-box').addClass('slide')

        },
        createShipmentForm: function () {
            const name = $('#name').val();
            const phone = $('#phone').val()
            const address = $('#address').val()
            const area = $('#area').val()
            const building = $('#building').val()
            const floor = $('#floor').val()
            const apartment = $('#apartment').val()

            const recname = $('#recname').val();
            const recphone = $('#recphone').val()
            const recaddress = $('#recaddress').val()
            const recarea = $('#recarea').val()
            const recbuilding = $('#recbuilding').val()
            const recfloor = $('#recfloor').val()
            const recapartment = $('#recapartment').val()

            const is_liquid = $('#is_liquid').val() == 'on' ? true : false
            const is_fragile = $('#is_fragile').val() == 'on' ? true : false

            const quantity = $('#quantity').val()
            const price = $('#price').val()

            const pickup_date = $('#pickup_date').val()
            const delivery_date = $('#delivery_date').val()
            const notes = $('#notes').val()


            if (!name.replace(/\s/g, '').length ||
                !phone.replace(/\s/g, '').length ||
                !address.replace(/\s/g, '').length ||
                !recname.replace(/\s/g, '').length ||
                !recphone.replace(/\s/g, '').length ||
                !recaddress.replace(/\s/g, '').length ||
                !pickup_date.replace(/\s/g, '').length ||
                !delivery_date.replace(/\s/g, '').length ||
                !quantity.replace(/\s/g, '').length ||
                !price.replace(/\s/g, '').length
            ) {
                showmessage('All Stared <span class="c-r">"*"</span> fields required ', 'info', 'body')
                return false
            }


            const shipment = {
                user: config.selectedCustomer,
                is_fragile: is_fragile,
                is_liquid: is_liquid,
                pickup: {
                    name: name,
                    address: address,
                    phone: phone,
                    floor: floor,
                    building: building,
                    apartment: apartment,
                    zone: { zoneId: area, name: 'عين شمس' },
                },
                receiver: {
                    name: recname,
                    address: recaddress,
                    phone: recphone,
                    floor: recfloor,
                    building: recbuilding,
                    apartment: recapartment,
                    zone: { zoneId: recarea, name: 'عين شمس' },
                },
                notes: notes,
                pickup_date: pickup_date,
                delivery_date: delivery_date,
                price: price,
                quantity: quantity
            }


            return shipment
        },
        saveShipment: async function (e) {
            e.preventDefault()
            const newform = this.createShipmentForm()
            console.log(newform);
            if (newform != false) {
                $('.new-shipment-box form').addClass('loader-effect')
                let data
                if (this.editing) {
                    $(`input[value="${this.opened}"]`).parents('.content-item').addClass('loader-effect')
                    data = await fetchdata(this.jwt, `/admin/api/shipments/${this.opened}`, 'put', JSON.stringify(newform), true)
                    $(`input[value="${this.opened}"]`).parents('.content-item').removeClass('loader-effect')
                } else {
                    data = await fetchdata(this.jwt, '/admin/api/shipments', 'post', JSON.stringify(newform), true)
                }
                console.log(data);
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
                return $('.new-shipment-box form').removeClass('loader-effect')

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

        deleteShipment: async function (e) {
            e.stopPropagation()
            if (confirm("Do you want to delete this Driver?")) {
                const shipmentId = findItemId('shipmentId', e)
                $('.single-item .inside-wrapper').addClass('loader-effect')
                $(`input[value="${shipmentId}"]`).parents('.content-item').addClass('loader-effect')
                if (shipmentId) {
                    const data = await fetchdata(this.jwt, `/admin/api/shipments/${shipmentId}`, 'delete', true)
                    if (data != null) {
                        $(`input[value="${shipmentId}"]`).parents('.content-item').fadeOut(300).remove()

                        this.allShipements = this.allShipements.filter(c => c._id.toString() != shipmentId.toString())
                        this.closeSingleShipment()
                        showmessage('Item Deleted', data.json.messageType, 'body')
                    }

                    $('.single-item .inside-wrapper').removeClass('loader-effect')
                    $(`input[value="${shipmentId}"]`).parents('.content-item').removeClass('loader-effect')

                }
            } else {
                e.preventDefault()
            }

        },

        getInvoice: function (e) {
            // const shipmentId = findItemId('shipmentId', e)
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
            const shipmentId = this.opened
            let reason
            if (status == 5) {
                reason = $('#shipmentreason').val()
            }
            $('.pop-up_container_form').addClass('loader-effect')
            const data = await fetchdata(this.jwt, `/admin/api/shipments/status/${shipmentId}`, 'put', JSON.stringify({ status: status, reason: reason }), true)
            if (data) {

                showmessage(data.json.message, data.json.messageType, 'body')
            }
            return $('.pop-up_container_form').removeClass('loader-effect')

            // $(e.target).find('.loading').css({ display: "none" })
        },
        startFiltering: async function (e, picker) {
            let items
            const { filterType, filterVal, filterSku, dataType } = this.getFiltertionInfo(e, picker)
            const exist = this.checkFilter(filterType, filterVal)
            if (!exist) {
                if (dataType == 'status') {
                    items = await this.getShipments({ status: filterVal }, 'status')
                } else if (dataType == 'zone') {
                    items = await this.getShipments({ zone: filterVal }, 'zone')
                } else if (dataType == 'date') {
                    items = await config.getShipments({ from: picker.startDate.format('YYYY-MM-DD'), to: picker.endDate.format('YYYY-MM-DD'), type: config.searchDateType }, 'date')
                } else {

                }
                this.endFilter(filterType, filterVal, filterSku, items)
            }
        },
        checkFilter: function (filterType, filterVal) {
            let exist = false
            for (let item of this.filters.types) {
                if (item.filterType === filterType && item.filterVal === filterVal) {
                    exist = true
                    break
                }
            }
            return exist
        },
        removeDuplicates: function (data, key) {
            return [
                ...new Map(data.map(x => [key(x), x])
                ).values()
            ]
        },
        endFilter: async function (filterType, filterVal, filterSku, items) {
            const all = [...config.filters.items, ...items]
            let finleitems = this.removeDuplicates(all, it => it._id)
            config.filters.items = finleitems

            config.filters.types.push({ filterType, filterSku, filterVal, items })
            config.renderShipments(config.filters.items)
            return renderFilter(config.filters.types)

        },
        removeFilter: function (e) {
            const { filterType, filterVal, filterSku } = this.getFiltertionInfo(e)

            let presestItems = []
            let presestFilters = []

            // this.filters.types = this.filters.types.filter(t => t.filterVal !== filterVal && t.filterType !== filterType)
            for (let type of this.filters.types) {
                if (type.filterVal != filterVal && type.filterType != filterType || type.filterType == filterType && type.filterVal !== filterVal) {
                    presestFilters.push(type)
                    presestItems = [...presestItems, ...type.items]
                }
            }
            this.filters.types = presestFilters
            let finleitems = this.removeDuplicates(presestItems, it => it._id)
            this.filters.items = finleitems

            this.renderShipments(finleitems)
            renderFilter(this.filters.types)
        },
        resetFilter: function () {
            renderFilter([])
            this.filters = { types: [], items: [] }
            this.renderShipments([])
        },
        getFiltertionInfo: function (e, picker) {
            const dataType = $(e.target).data('filter')

            let filterType;
            let filterVal;
            let filterSku;
            if (dataType === 'status' || dataType === 'zone') {
                filterType = $(e.target).data('filter')
                filterVal = $(e.target).data('val')
                filterSku = $(e.target).data('sku')
            } else if (dataType === 'date') {
                filterType = 'date'
                filterVal = picker.startDate.format('YYYY-MM-DD') + "-" + picker.endDate.format('YYYY-MM-DD')
                filterSku = picker.startDate.format('YYYY-MM-DD') + "-" + picker.endDate.format('YYYY-MM-DD')
            } else {
                filterType = $(e.target).parents('.options-filters_tag').data('filter')
                filterVal = $(e.target).parents('.options-filters_tag').data('val')
                filterSku = $(e.target).parents('.options-filters_tag').data('sku')
            }
            return { filterType, filterVal, filterSku, dataType }
        },

        sortShipments: function (e) {
            const { filterType, filterVal, filterSku } = this.getSortingInfo(e)
            let items = this.filters.items
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
        getZones: async function (e) {
            const data = await fetchdata(this.jwt, '/admin/api/zones', 'get', {}, true)
            if (data != null) {
                return data.json.zones.forEach(d => {
                    if (d.delivery) $('#recarea').append(`<option value=${d.zoneId}>${d.name}</option>`)
                    if (d.pickup) $('#area').append(`<option value=${d.zoneId}>${d.name}</option>`)
                    $('#zones ul').append(`<li class="filter-shipments" data-filter="zone" data-sku="${d.name}" data-val="${d.zoneId}">${d.name}</li>`)

                })

            }
        },
        getCustomers: async function (e) {
            $("#customer_list ul").removeClass('none')

            if ($('#customer_list ul li').length === 0) {

                const data = await fetchdata(this.jwt, '/admin/api/customers', 'get', {}, true)
                if (data != null) {
                    $('#customer_list ul').empty()
                    this.allCustomers = data.json.customers
                    return data.json.customers.forEach(d => { $('#customer_list ul').append(`<li data-sku="${d.name}" data-val="${d._id}">${d.name}</li>`) })
                }
            }
        },
        chooseCustomer: function (e) {
            const id = $(e.currentTarget).data('val')
            const customer = this.allCustomers.find(c => c._id.toString() === id.toString())
            this.selectedCustomer = customer._id
            $('#name').val(customer.name)
            $('#phone').val(customer.mobile)
            $('#address').val(customer.address)
            $("#customer_list ul").addClass('none')
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
        getInsights: function (e) {
            const itemsDetails = this.insightsDetails()
            return this.renderInsights(itemsDetails)
        },
        insightsDetails: function () {
            const allItems = config.filters.items
            const zonesImpressions = {}
            const zonesAmount = {}
            console.log(allItems);
            allItems.forEach(e => {
                zonesImpressions[e.receiver.zone.name] = (zonesImpressions[e.receiver.zone.name] || 0) + 1
                zonesAmount[e.receiver.zone.name] = (zonesAmount[e.receiver.zone.name] || e.shipping_price) + e.shipping_price
            })



            let arr1 = Object.values(zonesAmount);
            let max1 = Math.max(...arr1);
            let arr2 = Object.values(zonesImpressions);
            let max2 = Math.max(...arr2);

            function getMaxVal(item, max) { return Object.keys(item).find(key => item[key] === max) }

            const mostPaidFor = getMaxVal(zonesAmount, max1)
            const mostPaidBy = getMaxVal(zonesImpressions, max2)

            return { mostPaidBy, zonesImpressions, mostPaidFor, zonesAmount }
        },
        renderInsights: function (expensesInsights) {
            $('.insight-items_item').remove()

            $('.insight_content .form-actions').empty().append(`
                  <span class="gradient-green border-r-s c-w p-3">MOST PAYING By <b>${expensesInsights.mostPaidBy}</b></span>
                  <span class="gradient-blue border-r-s c-w p-3">HIEGEST PAYING GOSE FOR <b>${expensesInsights.mostPaidFor}</b></span>
            `)
            for (const key in expensesInsights.zonesImpressions) {
                $('.insight_content .insight-items.numbers').append(
                    `
                     <div class="insight-items_item">
                        <h5>اسم المنطقه: ${key}</h5>
                        <span>عدد الظهور: <b>${expensesInsights.zonesImpressions[key]}</b> Times</span>
                     </div>   
                    `
                )
            }
            for (const key in expensesInsights.zonesAmount) {

                $('.insight_content .insight-items.revenue').append(
                    `
                         <div class="insight-items_item">
                            <h5>اسم المنطقه: ${key}</h5>
                            <span>المبلغ: <b>${expensesInsights.zonesAmount[key]}$</b></span>
                         </div>   
                        `
                )
            }

            $('.insight_content').addClass('scale')
        },
        closeInsights: function () {
            $('.insight-items_item').remove()
            $('.insight_content').removeClass('scale')
        },


    }
    config.init()
})()



