/*jslint browser: true*/

/*global console, alert, $, jQuery, hamburger_cross*/


(function () {
    const expenses = {

        allItems: [],
        jwt: $('input[name="_csrf"]').val(),
        from: moment().format('YYYY-MM-DD'),
        to: moment().format('YYYY-MM-DD'),
        opened: null,
        searchDateType: 'date',
        detectingScan: false,
        filters: { types: [], items: [] },
        companysuppliers: [],
        expensesDate: moment().format('YYYY-MM-DD'),
        init: function () {
            this.cashDom()
            this.bindEvents()
            const from = moment().startOf('month').format('YYYY-MM-DD')
            const to = moment().endOf('month').format('YYYY-MM-DD')
            this.getExpenses({ from: this.from, to: this.to, type: this.searchDateType }, 'date')
            this.getPickers()
        },
        cashDom: function () {

            this.$togglecreateItembox = $('.toggle-new-item')

            this.$expensesForm = $('.save-expenses')
            this.$expensestypebox = $('.new-expenses-type')

            this.$searchname = $('#search-name')
            this.$searchstatus = $('#search-status')
            this.$groupPaidExpenses = $('.paid-expenses')
            this.$groupSchudledExpenses = $('.schedule-expenses')
        },
        bindEvents: function () {

            this.$togglecreateItembox.on('click', this.togglecreateItembox.bind(this))
            $('body').on('change', '#search-date-type', this.dateType.bind(this))

            this.$searchname.on('keyup', this.searchBillNo.bind(this))
            this.$searchstatus.on('change', this.searchShipmentStatus.bind(this))
            $('body').on('click', '.create-excel', this.createExcel.bind(this))

            this.$expensestypebox.on('click', function () { $('.expenses-type-box').toggleClass('none') })

            $('body').on('click', '.edit-item', this.editItem.bind(this))
            $('.new-item-box form').on('submit', this.saveItem.bind(this))

            this.$groupPaidExpenses.on('click', expenses.groupItemsByPaidState.bind(this))
            this.$groupSchudledExpenses.on('click', expenses.groupItemsBySchduledExpenses.bind(this))
            $('.get-insight').on('click', function (e) {
                const itemsDetails = expenses.getExpensesDetails()
                expenses.renderExpensesInsights(itemsDetails)
            })

            $('body').on('click', '.content-item', this.openItem.bind(this))

            $('body').on('click', '.sort', this.sortBills.bind(this))

            $('body').on('click', '.filter-items', this.startFiltering.bind(this))
            $('body').on('click', '.remove-filter', this.removeFilter.bind(this))
            $('body').on('click', '.reset-filter', this.resetFilter.bind(this))



            $('body').on('click', '.getInvoice', this.expensesInvoice.bind(this))
            $('body').on('click', '.pay-item', this.changePaidState.bind(this))
            $('body').on('change', '#category', this.getCategory.bind(this))
            $('body').on('click', '.delete-item', this.removeExpenses.bind(this))
            $('body').on('click', '.close-insight', this.closeInsights.bind(this))


            $('body').on('click', '.close-single-item', this.closeSingleItem.bind(this))

        },
        togglecreateItembox: function (e) {
            console.log(e);
            $('.new-item-box').toggleClass('slide')
            this.resetData()
        },
        renderExpensesCustomTypes: function (e) {
            $('.filter-type_custom .filter-type-item').remove()
            this.company.data.expensesTypes.forEach(t => {
                $('.filter-type_custom').prepend(`
                    <div class="form-check filter-type-item bg-lightgray ">
                    <input class="form-check-input" type="radio" name="type" id="${t}" value="${t}">
                    <label class="form-check-label" for="${t}">${t}</label>
                    <i class="fas fa-trash font-xs c-r delete-custom-type"></i>
                    </div>
                `)
                $('#expensesType').append(`
                <option value="${t}">${t}</option>
                `)
            })

            $('.filter-type_custom .loading').removeClass('block')

        },

        getPickers: () => {
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
                expenses.startFiltering(ev, picker)

                cb(picker.startDate, picker.endDate);

            });
        },

        getExpenses: async function (query, searchType) {

            $('.content .loading').removeClass('none')
            const url = this.getQueryUrl(query, searchType)
            const data = await fetchdata(this.jwt, url, 'get', {}, true)
            $('.content .loading').addClass('none')
            if (data != null) {
                this.renderExpenses(data.json.bills)
                this.allItems = data.json.bills
                return data.json.bills
            }
        },
        dateType: function (e) { this.searchDateType = $(e.target).val() },
        searchBillNo: function (e) {
            this.filters = { types: [], items: [] }
            renderFilter([])
            this.getExpenses({ no: e.target.value }, 'serial')
        },
        searchShipmentStatus: function (e) { this.getExpenses({ category: $(e.target).val() }, 'category') },
        getQueryUrl: (query, searchType) => {
            switch (searchType) {
                case 'date':
                    return `/admin/api/bills?from=${query.from}&&to=${query.to}&&type=${query.type}`
                case 'serial':
                    return `/admin/api/bills?no=${query.no}`
                case 'category':
                    return `/admin/api/bills?category=${query.category}`
                case 'id':
                    return `/admin/api/bills?id=${query.id}`
                case 'status':
                    return `/admin/api/bills?status=${query.status}`
                default:
                    return `/admin/api/bills`
            }
        },
        createExcel: function (e) {
            e.preventDefault()
            let items = this.filterForExcel(this.allItems)
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

        sortBills: function (e) {
            const { filterType, filterVal, filterSku } = this.getSortingInfo(e)
            let items = this.filters.items
            const sorted = this.bubbleSort(items, filterType, filterVal)
            this.renderExpenses(sorted)

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
            console.log(sortType);
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
                        if (arr[j].amount > arr[j + 1].amount) {
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
        startFiltering: async function (e, picker) {
            let items
            const { filterType, filterVal, filterSku, dataType } = this.getFiltertionInfo(e, picker)
            const exist = this.checkFilter(filterType, filterVal)
            console.log(dataType);
            if (!exist) {
                if (dataType == 'category') {
                    items = await this.getExpenses({ category: filterVal }, 'category')
                } else if (dataType == 'date') {
                    items = await expenses.getExpenses({ from: picker.startDate.format('YYYY-MM-DD'), to: picker.endDate.format('YYYY-MM-DD'), type: expenses.searchDateType }, 'date')
                } else if (dataType === 'status') {
                    items = await this.getExpenses({ status: filterVal }, 'status')

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

            const all = [...expenses.filters.items, ...items]
            let finleitems = this.removeDuplicates(all, it => it._id)
            expenses.filters.items = finleitems

            expenses.filters.types.push({ filterType, filterSku, filterVal, items })

            expenses.renderExpenses(expenses.filters.items)
            return renderFilter(expenses.filters.types)

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

            this.renderExpenses(finleitems)
            renderFilter(this.filters.types)
        },
        resetFilter: function () {
            renderFilter([])
            this.filters = { types: [], items: [] }
            this.renderExpenses([])
        },
        getFiltertionInfo: function (e, picker) {
            const dataType = $(e.target).data('filter')
            let filterType;
            let filterVal;
            let filterSku;
            if (dataType === 'category' || dataType === 'status') {
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



        editItem: function (e) {
            e.preventDefault()
            e.stopPropagation()
            const itemId = findItemId('itemId', e)
            const item = this.allItems.find(c => c._id.toString() == itemId.toString())
            this.opened = item._id
            this.editing = true

            $('#amount').val(item.amount);
            $('#category').trigger('change').val(item.category)
            $('#billType').trigger('change').val(item.billtype)

            $('#date').trigger('change').val(item.release_date)
            $('#due').trigger('change').val(item.due)

            document.getElementById('paid').checked = item.status.paid
            $('#notes').val(item.notes)
            $('.new-item-box').addClass('slide')

        },
        resetData: function (e) {
            document.getElementById('paid').checked = false

            $('#billType').trigger('change').val('out');
            $('#category').trigger('change').val('rent');
            $('#date').val('')
            $('#due').val('')
            $('#amount').val(0)
            $('#notes').val('')

            expenses.editing = false
        },

        createItemForm: function () {
            const billtype = $('#billType').val();
            const category = $('#category').val();
            const date = $('#date').val()
            const due = $('#due').val()
            const amount = $('#amount').val()
            const notes = $('#notes').val()
            const paid = document.getElementById('paid').checked
            if (!due.replace(/\s/g, '').length || !date.replace(/\s/g, '').length | !amount) {
                showmessage('All Stared <span class="c-r">"*"</span> fields required ', 'info', 'body')
                return false
            }
            let formData = new FormData();
            formData.append("billtype", billtype)
            formData.append("category", category)
            formData.append("date", date)
            formData.append("due", due)
            formData.append("amount", amount)
            formData.append("paid", paid)
            formData.append("notes", notes)

            const billItemVal = $('#category').find(":selected").data('val')
            if (billItemVal) {
                let itemId = $(`[data-item-val=${billItemVal}`).val()
                let itemname = $(`[data-item-val=${billItemVal}`).find(":selected").data('text')
                formData.append('itemId', itemId)
                formData.append('itemname', itemname)
            }
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
                    data = await fetchdata(this.jwt, `/admin/api/bills/${this.opened}`, 'put', newform, false)

                    $(`input[value="${this.opened}"]`).parents('.content-item').removeClass('loader-effect')

                } else {
                    data = await fetchdata(this.jwt, '/admin/api/bills', 'post', newform, false)

                }
                $('.new-item-box').removeClass('loader-effect')
                if (data != null) {
                    showmessage(data.json.message, data.json.messageType, 'body')
                    if (this.editing) {
                        this.updateItem(data.json.bill)
                        this.togglecreateItembox()
                        createSingleItem(data.json.bill)
                        $(`input[value="${this.opened}"]`).parents('.content-item').removeClass('loader-effect')

                    } else {
                        this.allItems.push(data.json.bill)
                        this.togglecreateItembox()
                    }
                    this.updateItemElm(data.json.bill)

                    this.resetData()
                }
            }
        },
        updateItem: function (updatedObj) {
            const oldIndex = expenses.allItems.findIndex(d => d._id.toString() === updatedObj._id.toString())
            expenses.allItems[oldIndex] = updatedObj
            return oldIndex
        },
        updateItemElm: function (updatedObj) {
            const exisitInput = $(`input[value="${updatedObj._id}"]`).parents('.content-item')
            const newDomElm = createitemBox(updatedObj)
            if (exisitInput.length <= 0) return $('.content .items').append(newDomElm);
            if (exisitInput.length > 0) return exisitInput.replaceWith(newDomElm)
        },
        renderExpenses: function (allItems) {
            $('.content-item').remove()
            removeFullBack()

            if (allItems.length === 0) return $("main .content").prepend(emptycontent())
            console.log('here');
            allItems.forEach(s => $('.content .items').append(createitemBox(s)))
            expenses.getExpensesSummary(allItems)
        },

        getItemObeject: function (e) {
            const itemId = findItemId('itemId', e)
            const item = expenses.filterSingleItem(itemId)
            return item
        },

        filterSingleItem: function (itemId) {
            const item = this.filters.items.find(c => { return c._id.toString() === itemId.toString() })
            return item
        },
        openItem: function (e) {

            const item = this.getItemObeject(e)
            this.opened = item._id
            return createSingleItem(item)

        },
        closeSingleItem: function () {
            $('.single-item').removeClass('scale')
        },

        expensesInvoice: function (e) {
            e.stopPropagation()
            const expensesId = findItemId('expensesId', e)
            const fetchedexpenses = this.filterSingleExpenses(expensesId)
            this.renderInvoice(fetchedexpenses)
        },
        renderInvoice: function (e) {
            createInvoiceClass('expenses', '.invoice-wrapper', e)
            $('.close-invoice').on('click', function (e) { $("#invoice").remove() })
        },
        confirmAssigned: async function (e) {
            const expensesId = $(e.target).parent('.employee').find('input[name="expensesId"]').val()
            const employeeName = $(e.target).parents('.employee').find('input[name="employeeName"]').val()
            const employeeId = $(e.target).parent('.employee').find('input[name="employeeId"]').val()

            $(e.target).find('.loading').css({ display: "block" })
            const rawResponse = await fetch(`/expenses/assign?expensesId=${expensesId}&&employeeId=${employeeId}`, {
                method: 'POST',
                headers: {
                    Authorization: "Bearer " + expenses.jwt,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ expensesType: expenses.expensesType, paidOn: expenses.scheduleDate, amount: expenses.expensesAmount, quantity: expenses.expensesQuantity, paidBy: expenses.paidBy, describtion: expenses.expensesDescribtion, approved: expenses.paid })
            });
            if (rawResponse.status === 200) {
                $(`input[value=${expensesId}]`).parents('.content-item').find('.AssignedTo').html('Assigned To:' + employeeName)
            }
            const res = await rawResponse.json()
            showmessage(res.message, res.messageType, 'body')
            $(e.target).find('.loading').css({ display: "none" })
        },
        changePaidState: async function (e) {
            $('.single-item').addClass('loader-effect')
            const itemId = findItemId('itemId', e)
            const data = await fetchdata(this.jwt, `/admin/api/bills/${itemId}/paid`, 'put', JSON.stringify({}), true);
            if (data != null) {
                showmessage('تم دفع الفاتوره', data.json.messageType, 'body')
                $(e.target).remove()
            }
            $('.single-item').removeClass('loader-effect')

        },
        getCategory: function (e) {
            const type = $(e.target).find(':selected').data('val')
            console.log(e.target);
            console.log(type);
            $('.toggleable').addClass('none')
            if (type === "driver") {
                this.getDrivers()
                $('#driverNo').parents('.form-group').removeClass('none')
            } else if (type === 'shipment') {
                $('#shipmentNo').parents('.form-group').removeClass('none')
            } else if (type === 'vehicle') {
                $('#vehicles').parents('.form-group').removeClass('none')
                this.getVehicles()
            } else {
                $('.toggleable').addClass('none')

            }
        },
        getDrivers: async function (e) {
            if ($(`#driverNo option`).length === 0) {

                $(`#driverNo`).parents('.toggleable').addClass('loader-effect')
                const data = await fetchdata(this.jwt, '/admin/api/drivers', 'get', {}, true)
                if (data != null) {
                    $('#driverNo').empty()
                    $(`#driverNo`).parents('.toggleable').removeClass('loader-effect')
                    return data.json.drivers.forEach(d => $('#driverNo').append(`<option data-text="${d.name}" value=${d._id}>${d.name}</option>`))

                }
            }

        },
        getVehicles: async function (e) {
            $(`#vehicles`).parents('.toggleable').addClass('loader-effect')
            const data = await fetchdata(this.jwt, '/admin/api/vehicles', 'get', {}, true)
            if (data != null) {
                $('#vehicles').empty()
                $(`#vehicles`).parents('.toggleable').removeClass('loader-effect')
                return data.json.vehicles.forEach(d => $('#vehicles').append(`<option data-text="${d.name}" value=${d._id}>${d.name}</option>`))

            }
        },
        removeExpenses: async function (e) {
            e.stopPropagation()
            if (confirm("Do you want to delete this Driver?")) {
                const itemId = findItemId('itemId', e)
                $('.single-item .inside-wrapper').addClass('loader-effect')
                $(`input[value="${itemId}"]`).parents('.content-item').addClass('loader-effect')
                if (itemId) {
                    const data = await fetchdata(this.jwt, `/admin/api/bills/${itemId}`, 'delete', true)
                    if (data != null) {
                        $(`input[value="${itemId}"]`).parents('.content-item').fadeOut(300).remove()
                        this.allItems = this.allItems.filter(c => c._id.toString() != itemId.toString())
                        this.closeSingleItem()
                        showmessage('Bill Deleted', data.json.messageType, 'body')
                    }

                    $('.single-item .inside-wrapper').removeClass('loader-effect')
                    $(`input[value="${itemId}"]`).parents('.content-item').removeClass('loader-effect')

                }
            } else {
                e.preventDefault()
            }

        },
        getExpensesSummary: function (expenses) {

            const expensesPaidFor = {}
            expenses.forEach(e => {
                expensesPaidFor[e.category] = (expensesPaidFor[e.category] || e.amount) + e.amount
            })
            let arr1 = Object.values(expensesPaidFor);
            let max = Math.max(...arr1);
            function getKeyByValue(expensesPaidFor, max) {
                return Object.keys(expensesPaidFor).find(key => expensesPaidFor[key] === max);
            }
            const mostPaidFor = getKeyByValue(expensesPaidFor, max)
            this.renderSummary(expensesPaidFor)
        },
        renderSummary: function (expensesPaidFor) {
            $('#operations-summary').empty()
            for (const key in expensesPaidFor) {
                $('#operations-summary').append(`
                    <span class="btn-small">
                    ${key}
                    $${expensesPaidFor[key]}
                    </span>
                `)
            }
        },



        getExpensesDetails: function () {

            const allExpenses = expenses.filters.items
            const expensesPaidBy = {}
            const expensesPaidFor = {}
            console.log(allExpenses);
            allExpenses.forEach(e => {
                expensesPaidBy[e.itemname] = (expensesPaidBy[e.itemname] || 0) + 1
                expensesPaidFor[e.category] = (expensesPaidFor[e.category] || e.amount) + e.amount
            })



            let arr1 = Object.values(expensesPaidFor);
            let max1 = Math.max(...arr1);
            let arr2 = Object.values(expensesPaidBy);
            let max2 = Math.max(...arr2);

            function getMaxVal(item, max) { return Object.keys(item).find(key => item[key] === max) }

            const mostPaidFor = getMaxVal(expensesPaidFor, max1)
            const mostPaidBy = getMaxVal(expensesPaidBy, max2)

            return { mostPaidBy, expensesPaidBy, mostPaidFor, expensesPaidFor }
        },
        renderExpensesInsights: function (expensesInsights) {
            const arVal = {
                "commission": "عموله",
                "custody": "عهده",
                "shipment": "شحنه",
                "fuels": "بنزين",
                "maintenance": "صيانه مركبه",
            }
            $('.insight-items_item').remove()

            $('.insight_content .form-actions').empty().append(`
                  <span class="gradient-green border-r-s c-w p-3">اعلي قيمه للفواتير <b>${expensesInsights.mostPaidBy}</b></span>
                  <span class="gradient-blue border-r-s c-w p-3">الاكثر تحصيل للفواتير <b>${arVal[expensesInsights.mostPaidFor]}</b></span>
            `)
            for (const key in expensesInsights.expensesPaidBy) {
                $('.insight_content .insight-items.numbers').append(
                    `
                     <div class="insight-items_item">
                        <h5>اسم العنصر: ${key}</h5>
                        <span>عدد الظهور: <b>${expensesInsights.expensesPaidBy[key]}</b> مرات</span>
                     </div>   
                    `
                )
            }
            for (const key in expensesInsights.expensesPaidFor) {

                $('.insight_content .insight-items.revenue').append(
                    `
                         <div class="insight-items_item">
                            <h5>اسم التصنيف: ${arVal[key]}</h5>
                            <span>المبلغ: <b>${expensesInsights.expensesPaidFor[key]} جنيه</b></span>
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

        groupItemsByPaidState: function () {
            const allExpenses = expenses.allExpenses

            let paid = {}
            allExpenses.forEach(e => {
                if (paid[e.status.paid]) {
                    paid[e.status.paid].push(e)
                } else {
                    paid[e.status.paid] = []
                    paid[e.status.paid].push(e)
                }

            })
            expenses.renderExpensesGroups(paid, 'paid')

        },
        groupItemsBySchduledExpenses: function () {
            const allExpenses = expenses.allExpenses

            let scheduled = {}
            allExpenses.forEach(e => {

                if (scheduled[e.scheduled.state]) {
                    scheduled[e.scheduled.state].push(e)
                } else {
                    scheduled[e.scheduled.state] = []
                    scheduled[e.scheduled.state].push(e)
                }

            })
            expenses.renderExpensesGroups(scheduled, 'scheduled')
        },
        renderExpensesGroups(allExpenses, state) {
            const today = [moment().format('YYYY-MM-DD')]
            $('.group-items').remove()
            $('.content-item').remove()
            for (const key in allExpenses) {
                $('.content').append(`  
                    <div class="group-items grid bg-darkgray" data-key="${key}">
                        <h3 class="f-center">${state == 'scheduled' ? key == 'true' ? 'Scheduled' : 'Not Scheduled' : key == 'true' ? 'Paid' : 'Not Paid'}</h3>
                        <div class="items"></div>
                    </div>
                `)
                allExpenses[key].forEach(e => {
                    $(`[data-key='${key}']`).find('.items').append(`
                    <div class="content-item">
                    <input type="hidden" value="${e._id}" name="expensesId">
                        <div class="flex f-space-between">
                            <span class="font-xs">${e.date}</span>
                            <i class="fas fa-ellipsis-v  sub-menu_btn"></i>
                            <ul class="sub-menu">
                                <li class="sub-menu_item getInvoice">Invoice <i class="fas fa-file"></i></li>
                                <li class="sub-menu_item assignTo">Assign to <i class="fas fa-angle-double-right"></i></li>
                                ${e.status.paid ? '' : "<li class='sub-menu_item changePaidState'>Paid</li>"}
                                <li class="deleteExpenses">Remove <i class="fas fa-trash"></i></li>
                            </ul>
                        </div>
                        <p class="total">$ <b>${e.total}</b></p>
                        <div class="expenses-group_item_body">
                            <p class="AssignedTo">Assigned To: ${e.assignedTo != null ? e.assignedTo.name : 'No One..'}</p>
                            <p class="paidState" style="${e.status.paid ? 'color:green;' : 'color:red;'}"></p>
                            <div class="marked paidstatuse block ${e.status.paid ? 'alert-success' : 'alert-danger'}" style="right:70px">
                                <span tooltip="${e.status.paid ? `Paid by ${e.status.paidBy}` : 'Not Paid '}" flow="left"><i class="far fa-check-circle"></i></span>
                            </div>
                          
                            <div class="marked ${e.scheduled.state ? 'block' : ''}  ${e.scheduled.date < today ? 'alert-error' : e.scheduled.date == today ? 'alert-warning' : 'alert-info'}">
                                <span tooltip="Paid On ${e.scheduled.date}" flow="left"><i class="fa fa-calendar"></i></span>
                            </div>
                        </div>
                    </div>
                    `)

                })
            }


        },

    }
    expenses.init()
})()