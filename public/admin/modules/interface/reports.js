
(function () {
    const reports = {
        jwt: localStorage.getItem('token'),
        startMonth: moment().startOf('month').format('YYYY-MM-DD'),
        endMonth: moment().endOf('month').format('YYYY-MM-DD'),
        fetchedShipments: [],
        companyitems: [],
        reportType: null,
        init: function () {
            this.cashDom()
            this.bindEvents()
            this.getPicker()
            this.getOrdersReport()
        },
        cashDom: function () {

            // this.$salesItemsReportBtn = $('#salesItemsReportBtn')
            this.$inventoryReportBtn = $('#inventoryReportBtn')
            this.$getOrdersReport = $('.get-orders-report')
        },
        bindEvents: function () {
            $('.create-excel').on('click', this.filterForExcel.bind(this))
            this.$getOrdersReport.on('click', this.openReport.bind(this))
            $('.close-report').on('click', this.closeReport.bind(this))
            this.$inventoryReportBtn.on('click', this.getitems.bind(this))
        },
        getPicker: function (e) {
            const start = moment()
            const end = moment()
            function cb(start, end) {
                $('.reportrange span').html(start + " - " + end);
                $('.sorting h4').html(start + " - " + end);
            }
            cb(this.startMonth, this.endMonth);

            $('.reportrange').daterangepicker({
                startDate: start,
                endDate: end,
                ranges: {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                    'Quarterly': [moment().subtract(4, 'month').endOf('month'), moment()],
                    'Yearly': [moment().subtract(12, 'month').endOf('month'), moment()]
                }
            }, cb);

            $('.reportrange').on('apply.daterangepicker', function (ev, picker) {
                // reports.getShipments({ from: picker.startDate.format('YYYY-MM-DD'), to: picker.endDate.format('YYYY-MM-DD') })
                reports.endMonth = picker.endDate.format('YYYY-MM-DD')
                reports.startMonth = picker.startDate.format('YYYY-MM-DD')
                reports.getOrdersReport(reports.reportType)
                cb(reports.startMonth, reports.endMonth);

            });
        },
        getShipments: async function (date) {
            const data = await fetchdata(this.jwt, `/admin/api/shipments?from=${date.from}&&to=${date.to}&&type=date`, 'get', {}, true)
            if (data != null) {
                this.fetchedShipments = data.json.shipments
                return data.json.shipments
            }
        },
        openReport: function (e) {
            const reportType = this.reportInfo(e)
            this.reportType = reportType
            $('.orders-reports').attr('data-report', reportType)
            this.getOrdersReport(reportType)
        },
        reportInfo: (e) => {

            let reportType
            if ($(e.target).data('report')) {
                reportType = $(e.target).data('report')
            } else {
                reportType = $(e.target).parents(`.report`).data('report')
            }
            return reportType
        },

        getOrdersReport: async function (reportType) {
            $('.reportrange').removeClass('none')
            $(".download-sheet").addClass('none')

            $('.report-body').empty()
            $('.report-head').empty()
            $('.report-footer').empty()
            $(`.orders-reports`).addClass(' loader-effect')
            $(`li[data-report]`).removeClass('selected')
            $(`li[data-report=${reportType || 'orders-reports'}]`).addClass('selected')

            const orders = await this.getShipments({ from: this.startMonth, to: this.endMonth })
            if (reportType == 'orders-reports') {
                const items = this.filterOrdersReport(orders)
                ordersReport(items);
            } else if (reportType === 'items-reports') {
                const items = this.filterSalesbyitems(orders)
                ordersItemsReport(items);
            } else if (reportType === 'customers-orders-reports') {
                const items = this.filterShipmentsForCustomers(orders)
                customersOrdersReport(items)
            } else {
                const items = this.filterOrdersReport(orders)
                ordersReport(items);
            }

            $(`.orders-reports`).removeClass('loader-effect')

        },
        filterOrdersReport: function (items) {
            console.log(items);
            const orders = items.map((s) => ({ date: s.date, shipmentNo: s.shipmentNo, price: s.price,shipping:s.shipping_price }))
            return orders
        },

        filterSalesbyitems: function (orders) {
            let items = []
            for (let i = 0; i < orders.length; i++) {
                items = [...items, ...orders[i].items]
                if (orders[i].externalItem) items = [...items, orders[i].externalItem]
            }

            let allItems = []
            for (let i = 0; i < items.length; i++) {

                const element = items[i];
                const index = allItems.findIndex(i => i.name === element.name)

                if (index == -1) {
                    allItems.push({ name: element.name, quantity: element.quantity, price: element.price, unit: element.unit })
                } else {
                    if (allItems[index].unit) {
                        if (allItems[index].unit === element.unit && allItems[index].price === element.price) {
                            allItems[index].quantity += element.quantity
                        } else {
                            allItems.push({ name: element.name, quantity: element.quantity, price: element.price, unit: element.unit })
                        }
                    } else {
                        allItems[index].quantity += element.quantity
                    }
                }

            }
            return allItems
        },
        filterForExcel: function (e) {

            e.preventDefault()
            let items = []
            const reportType = this.reportType

            if (reportType === 'orders-reports') {
                items = this.filterOrdersReport(this.fetchedShipments)
            } else if (reportType === 'inventory-reports') {
                console.log('here');
                items = this.filterInvetoryItems(this.companyitems)
            } else {
                items = this.filterSalesbyitems(this.fetchedShipments)
            }

            this.exportReport(items, reportType)

        },
        filterInvetoryItems: function (items) {
            const filterd = items.map((s) => ({ name: s.name, quantity: s.info.quantity, price: s.info.sellingPrice }))
            console.log(filterd);
            return filterd
        },
        exportReport: function (json, reportType) {
            const fields = Object.keys(json[0]);

            const replacer = function (key, value) { return value === null ? '' : value };
            let csv = json.map(function (row) { return '\r\n' + fields.map(function (fieldName) { return JSON.stringify(row[fieldName], replacer) }) });
            csv.unshift(fields.join(','))  // add header column
            csv = 'sep=,\r\n' + csv.join(',');


            window.URL = window.URL || window.webkiURL;

            let blob = new Blob([csv], { type: 'text/csv' });
            const csvUrl = window.URL.createObjectURL(blob);
            const filename = `${reports.startMonth}-${reports.endMonth}.csv`;

            $(".download-sheet").attr({ 'download': filename, 'href': csvUrl })
            $(".download-sheet").removeClass('none')
        },
        closeReport: function () {
            $('.report').removeClass('scale')
            $('.report-body').empty()
            $('.report-footer').empty()
            this.startMonth = moment().startOf('month').format('YYYY-MM-DD')
            this.endMonth = moment().endOf('month').format('YYYY-MM-DD')
        },

        filterShipmentsForCustomers: function (sales) {
            let customersSales = []
            sales.forEach(s => {
                if (s.customer != undefined) {
                    customersSales.push(s)
                }
            });
            console.log(customersSales)
            const filterdSalesByCusomters = customersSales.map(s => ({
                name: s.customer.name,
                items: s.externalItem != undefined ? (s.items.length + 1) : s.items.length,
                total: s.totalPrice
            }))
            return filterdSalesByCusomters

        },
        renderSalesbyCustomer: function (sales) {
            $('.report').addClass('none')
            $('.report-body').empty()

            sales.forEach(i => {
                $('.salesCustomerReport .report-body').append(`
                    <div class="  bg-lightgray">
                        <span>${i.name}</span>
                        <span>${i.items}</span>
                        <span>${i.total}</span>
                    </div>
                `)
            })

            $('.salesCustomerReport').removeClass('none')
        },
        getitems: async function (e) {
            this.companyitems = []
            $(".download-sheet").addClass('none')

            $('.reportrange').addClass('none')
            $('.report-body').empty()
            $('.report-head').empty()
            $('.report-footer').empty()
            $(`.orders-reports`).addClass('loader-effect')
            $(`li`).removeClass('selected')
            $(e.currentTarget).addClass('selected')
            this.reportType = 'inventory-reports'

            const data = await mkreqs(this.jwt, `/inventory/items/default`, 'get', {}, true)
            if (data) {
                this.companyitems = data.json.items
                inventoryReport(this.companyitems);
            }
            $(`.orders-reports`).removeClass('loader-effect')

        },

        printSheet: () => {
            window.print()
        },
    }
    reports.init()
})()