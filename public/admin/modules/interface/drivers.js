/*jslint browser: true*/

/*global console, alert, $, jQuery, hamburger_cross*/



(function () {
    const config = {
        jwt: $('input[name="_csrf"]').val(),
        allDriver: [],
        openedShipments: [],
        driverImg: null,
        startMonth: moment().startOf('month').format('YYYY-MM-DD'),
        endMonth: moment().endOf('month').format('YYYY-MM-DD'),
        opened: null,
        searchDateType: 'date',
        editing: false,
        filter: [],
        init: async function () {
            this.cashDom()
            this.bindEvents()
            this.getDriver()
            this.getPicker()

        },
        cashDom: function () {

            this.$togglecreateDriverbox = $('.toggle-new-dirver')
            this.$driverImg = $('.driverImage')
            this.$searchname = $('#search-driver-name')

        },
        bindEvents: function () {

            this.$togglecreateDriverbox.on('click', this.togglecreateDriverbox.bind(this))
            this.$driverImg.on('change', this.getdriverImg.bind(this))
            this.$searchname.on('keyup', this.searchDriverName.bind(this))


            $('body').on('click', '.content-item', this.openDriver.bind(this));
            $('body').on('click', '.close-single-item', this.closeSingleDriver.bind(this))
            $('body').on('submit', '.assign-shipment', this.confirmAssigned.bind(this))
            $('body').on('click', '.drivers-shipments .order', this.openOrderBox.bind(this))
            $('body').on('click', '.drivers-shipments .close-shipments', this.closeShipments.bind(this))

            $('.new-driver-box form').on('submit', this.saveDriver.bind(this))

            $('body').on('click', '.edit-driver', this.editDriver.bind(this))

            $('body').on('click', '.delete-driver', this.deleteDriver.bind(this))

            $('body').on('click', '.driver-shipments', this.openShipmentsBox.bind(this))

            $('body').on('click', '.sort-date', this.sortShipmentsByDate.bind(this))
            // $('body').on('click', '.filter-drivers', this.filterDrivers.bind(this))
            $('body').on('click', '.sort', this.sortDrivers.bind(this))


            $('body').on('click', '.filter', this.filterShipments.bind(this))
            $('body').on('change', '#search-name', this.searchShipmentNo.bind(this))
            $('body').on('change', '#search-date-type', this.dateType.bind(this))

            $('body').on('change', '#search-status', this.searchShipmentStatus.bind(this))


            $('body').on('click', '.get-info-table', this.infoTable.bind(this))
            $('body').on('click', '.close-info-table', this.closeInfoTable.bind(this))
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
        getDriver: async function (e) {
            $('.content .loading').removeClass('none')
            const data = await fetchdata(this.jwt, '/admin/api/drivers', 'get', {}, true)
            if (data != null) {
                $('.content .loading').addClass('none')
                this.renderDrivers(data.json.drivers)

                return this.allDriver = data.json.drivers
            }
        },
        searchDriverName: function (e) {
            // const text = $(e.target).val()
            var str = e.target.value.toLowerCase()
            let filteredArr
            filteredArr = config.allDriver.filter((i) => i.name.toLowerCase().includes(str) || config.checkName(i.name.toLowerCase(), str))
            if (filteredArr.length == 0) {
                filteredArr = config.allDriver.filter((i) => i.mobile.includes(str) || config.checkName(i.mobile, str))
            }
            config.renderDrivers(filteredArr)

        },
        checkName: function (name, str) {
            var pattern = str.split("").map((x) => {
                return `(?=.*${x})`
            }).join("");
            var regex = new RegExp(`${pattern}`, "g")
            return name.match(regex);
        },

        getDriverObeject: function (e) {
            const driverId = findItemId('driverId', e)
            console.log(driverId);
            const dirver = config.filterSingleItem(driverId)
            return dirver
        },

        filterSingleItem: function (driverId) {
            const driver = this.allDriver.find(c => { return c._id.toString() === driverId.toString() })
            return driver
        },
        openDriver: function (e) {
            const driver = this.getDriverObeject(e)
            this.opened = driver._id
            return createSingleItem(driver)

        },
        closeDriver: (e) => {
            $('.single-item').remove()
        },
        togglecreateDriverbox: function (e) {
            $('.new-driver-box').toggleClass('slide')
            if ($('.new-driver-box').hasClass('slide')) $('#driverName').focus()
            this.resetData()

        },
        getdriverImg: function (e) {
            let photo = e.target.files[0];  // file from input
            config.driverImg = photo

            if (e.target.files && e.target.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    $('.item-preview_image').attr('src', e.target.result);
                }
                reader.readAsDataURL(e.target.files[0]);
            }
            $('.item-preview_image').animate({ opacity: 1 }, 300)
            console.log(config.driverImg);

        },
        createDriverForm: function () {
            const name = $('#driverName').val();
            const mobile = $('#driverNumber').val()
            const address = $('#driverAddress').val()
            const email = $('#driverEmail').val()
            const baseSalary = $('#baseSalary').val()
            const commission = $('#commission').val()
            const notes = $('#newdrivernotes').val()
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
                formData.append("baseSalary", baseSalary)
                formData.append("commission", commission)
                formData.append("image", config.driverImg)
                return formData
            }
        },
        saveDriver: async function (e) {
            e.preventDefault()
            const newform = this.createDriverForm()
            if (newform != false) {
                $('.new-driver-box').addClass('loader-effect')
                let data
                if (this.editing) {
                    $(`input[value="${this.opened}"]`).parents('.content-item').addClass('loader-effect')
                    data = await fetchdata(this.jwt, `/admin/api/drivers/${this.opened}`, 'put', newform, false)
                } else {
                    data = await fetchdata(this.jwt, '/admin/api/drivers', 'post', newform, false)
                }
                if (data != null) {
                    showmessage(data.json.message, data.json.messageType, 'body')
                    $('.new-driver-box').removeClass('loader-effect')

                    if (this.editing) {
                        this.updateDriver(data.json.driver)
                        this.togglecreateDriverbox()
                        createSingleItem(data.json.driver)
                        $(`input[value="${this.opened}"]`).parents('.content-item').removeClass('loader-effect')

                    } else {
                        this.allDriver.push(data.json.driver)
                        this.togglecreateDriverbox()
                    }
                    this.updateDriverElm(data.json.driver)

                    this.resetData()
                }

            }

        },
        resetData: function (e) {
            $('input[name="newdrivername"]').val('');
            $('input[name="newdrivermobile"]').val('')
            $('input[name="newdriveraddress"]').val('')
            $('input[name="newdriveremail"]').val('')
            $('input[name="newdrivernotes"]').val('')
            $('#baseSalary').val('')
            $('#commission').val('')
            config.driverImg = null
            config.editing = false
        },
        editDriver: function (e) {
            e.preventDefault()
            e.stopPropagation()
            const driverId = findItemId('driverId', e)
            const driver = this.allDriver.find(c => c._id.toString() == driverId.toString())
            this.opened = driver._id
            this.editing = true

            $('#driverName').val(driver.name);
            $('#driverNumber').val(driver.mobile)
            $('#driverAddress').val(driver.address)
            $('#driverEmail').val(driver.email)
            $('#newdrivernotes').val(driver.note)
            $('#commission').val(driver.commission)
            $('#baseSalary').val(driver.base_salary)

            $('.new-driver-box').addClass('slide')

        },


        renderDrivers: function (allDriver) {
            $('.content-item').remove()
            removeFullBack()
            if (allDriver.length === 0) return $("main .content").prepend(emptycontent())
            allDriver.forEach(s => $('.content').append(createitemBox(s)))
        },


        closeSingleDriver: function () {
            // config.opened = null
            $('.single-item').removeClass('scale')
        },

        deleteDriver: async function (e) {
            e.stopPropagation()
            if (confirm("Do you want to delete this Driver?")) {
                const driverId = findItemId('driverId', e)
                $('.single-item .inside-wrapper').addClass('loader-effect')
                $(`input[value="${driverId}"]`).parents('.content-item').addClass('loader-effect')
                if (driverId) {
                    const data = await fetchdata(this.jwt, `/admin/api/drivers/${driverId}`, 'delete', true)
                    if (data != null) {
                        $(`input[value="${driverId}"]`).parents('.content-item').fadeOut(300).remove()
                        this.allDriver = this.allDriver.filter(c => c._id.toString() != driverId.toString())
                        this.closeSingleDriver()
                        showmessage('Driver Deleted', data.json.messageType, 'body')
                    }

                    $('.single-item .inside-wrapper').removeClass('loader-effect')
                    $(`input[value="${driverId}"]`).parents('.content-item').removeClass('loader-effect')

                }
            } else {
                e.preventDefault()
            }

        },
        confirmAssigned: async function (e) {
            e.preventDefault()
            const shipmentNo = $('#shipmentNo').val()
            const driverId = this.opened
            $('.pop-up_container_form').addClass('loader-effect')
            const data = await fetchdata(this.jwt, `/admin/api/shipments/assign/${shipmentNo}?driver=${driverId}`, 'put', JSON.stringify({}), false)
            if (data) {
                this.updateDriver(data.json.driver)
                this.openedShipments = data.json.shipments
                this.updateDriverElm(data.json.driver)
                showmessage(data.json.message, data.json.messageType, 'body')
            }
            $('.pop-up_container_form').removeClass('loader-effect')

            // $(e.target).find('.loading').css({ display: "none" })
        },
        updateDriver: async function (updatedObj) {
            const oldIndex = config.allDriver.findIndex(d => d._id.toString() === updatedObj._id.toString())
            config.allDriver[oldIndex] = updatedObj
            return oldIndex
        },
        updateDriverElm: function (updatedObj) {
            const exisitInput = $(`input[value="${updatedObj._id}"]`).parents('.content-item')
            const newDomElm = createitemBox(updatedObj)
            if (exisitInput.length <= 0) return $('.content .items').append(newDomElm);
            if (exisitInput.length > 0) return exisitInput.replaceWith(newDomElm)
        },
        openShipmentsBox: function (e) {
            this.opened = findItemId('driverId', e)
            $('.drivers-shipments .order').remove()
            $('.drivers-shipments').addClass('slide')
        },
        getDriversShipments: async function (e) {

            // $('.drivers-shipments .loading').addClass('block')
            const data = await fetchdata(this.jwt, `/admin/api/drivers/shipments/${config.opened}`, 'get', {}, true)
            if (data != null) {
                const shipments = data.json.shipments
                config.openedShipments = shipments
                config.renderShipments(shipments)
            }

        },
        getShipments: async function (query, searchType) {
            $('.drivers-shipments').addClass('loader-effect')

            const url = this.getQueryUrl(query, searchType)
            const data = await fetchdata(this.jwt, url, 'get', {}, true)
            $('.drivers-shipments').removeClass('loader-effect')
            if (data != null) {
                this.renderShipments(data.json.shipments)
                this.openedShipments = data.json.shipments
                return data.json.shipments
            }

        },
        dateType: function (e) { this.searchDateType = $(e.target).val() },
        searchShipmentNo: function (e) { this.getShipments({ no: e.target.value }, 'serial') },
        searchShipmentStatus: function (e) {
            console.log('hhe');
            this.getShipments({ status: $(e.target).val() }, 'status')
        },
        getQueryUrl: (query, searchType) => {
            switch (searchType) {
                case 'date':
                    return `/admin/api/drivers/shipments/${config.opened}?from=${query.from}&&to=${query.to}&&type=${query.type}`
                case 'serial':
                    return `/admin/api/drivers/shipments/${config.opened}?no=${query.no}`
                case 'status':
                    return `/admin/api/drivers/shipments/${config.opened}?status=${query.status}`
                case 'id':
                    return `/admin/api/drivers/shipments/${config.opened}?id=${query.id}`
                default:
                    return `/admin/api/drivers/shipments/${config.opened}`
            }
        },
        sortDrivers: function (e) {
            const { filterType, filterVal, filterSku } = this.getSortingInfo(e)
            let items = this.allDriver
            let sorted
            if (filterType == "shipmentslength") {
                sorted = this.bubbleSort(items, filterType, filterVal)
            } else {
                sorted = this.sortHighCommission(items, filterType, filterVal)
                console.log(sorted);
            }
            this.renderDrivers(sorted)

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
            }
            if (sortType === 'shipmentslength') {
                if (sortVal === 'new') arr.reverse()
            } else {
                if (sortVal === 'high') arr.reverse()
            }
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
        renderShipments: function (orders) {
            $('.order').remove()
            $('.contentFallBack').remove()
            $('.drivers-shipments .totals').empty()
            let totalAmount = 0
            let commission = 0
            if (orders.length === 0) return $('.drivers-shipments .inside-wrapper').append(`<div class="contentFallBack"><h2>No result to display</h2></div>`)
            const driver = this.filterSingleItem(config.opened)
            console.log(driver);
            orders.forEach(o => {
                commission += driver.salary.commission
                totalAmount += o.price
                orderItem(o)
            })
            $('.drivers-shipments .totals').append(`
                <span>العموله : <b>${commission}</b></span>
                <span>مبلغ التحصيل: <b>${totalAmount}</b></span>
            `)

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
        filterShipments: function (e) {
            let filterType = $(e.target).data('status')
            let shipments = this.openedShipments.filter(s => s.status.no === filterType)
            this.renderShipments(shipments)

        },
        checkSerial: function (name, str) {
            var pattern = str.split("").map((x) => {
                return `(?=.*${x})`
            }).join("");
            var regex = new RegExp(`${pattern}`, "g")
            return name.match(regex);
        },
        closeShipments: function (e) {
            $('.drivers-shipments').removeClass('slide')
            $('.drivers-shipments .order').remove()
            config.openedShipments = []
        },
        openOrderBox: function (e) {
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
        infoTable: function (e) {
            $('.info-table .items').empty()
            $('.contentFallBack').remove()
            const type = $(e.currentTarget).data('val')
            const driver = this.filterSingleItem(config.opened)
            let items
            console.log(type);
            if (type == "commission") {
                items = driver.commission
                $('.info-table_heading').html('جميع مصاريف عموله')
            } else {
                $('.info-table_heading').html('جميع مصاريف عهده')
                items = driver.custody
            }
            console.log(items);
            $('.info-table').addClass('slide')

            if (items.length === 0) return $('.info-table .inside-wrapper').append(`<div class="contentFallBack"><h2>لا يوجد مصاريف ${type == 'custodies' ? "عهده" : "عموله"} سابقه </h2></div>`)
            console.log(items);
            console.log(type);
            let totalAmout = 0
            items.forEach(o => {
                totalAmout += o.amount
                infoItem(o)
            })
            $('.info-table .totals').empty().append(`<span>المجموع: <b>${totalAmout}</b></span> `)

        },
        closeInfoTable: function (e) {
            $('.info-table').removeClass('slide')
            $('.info-table .items').empty()
        },

    }
    config.init()
})()



