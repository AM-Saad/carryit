
/*jslint browser: true*/

/*global console, alert, $, jQuery, hamburger_cross*/

(function () {
    const mainpanel = {

        jwt: localStorage.getItem('token'),
        choosenCompanyResult: '',
        detectingScan: false,
        fetchedExpenses: [],
        fetchedSales: [],
        init: async function () {
            this.cashDom()
            this.bindEvents()
            const from = moment().startOf('month').format('YYYY-MM-DD')
            const to = moment().endOf('month').format('YYYY-MM-DD')
            const lastMonthFrom = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD')
            const lastMonthTo = moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD')

            const thisMonthSales = await this.searchSalesByDate(from, to)
            const lastMonthSales = await this.searchSalesByDate(lastMonthFrom, lastMonthTo)

            const thisMonthExpenses = await this.searchExpensesByDate(from, to)
            const lastMonthExpenses = await this.searchExpensesByDate(lastMonthFrom, lastMonthTo)

            this.comparisonBetweenTowMonthes(thisMonthSales, lastMonthSales)
        },
        cashDom: function () {
            $('body').on('click', '.shipment', this.storeShipment.bind(this))
            $('body').on('click', '.customer', this.storeCustomer.bind(this))

        },
        bindEvents: function () {
        },
        showMessage: function (message, messageType, selector) {

            $(selector).prepend(`
            <p class="message alert alert-${messageType}">${message}</p>
            `)
            $('.message').animate({ top: '80px' }, 300)
            setTimeout(function () {
                $('.message').animate({ top: '0' }, 200, function () {
                    $(this).remove()
                })
            }, 5000);

        },
        storeShipment: function (e) {
            e.preventDefault()
            console.log(e);
            const siD = $(e.target).data('si')
            localStorage.setItem('si', siD)
            return window.location.href = e.currentTarget.href
        },
        storeCustomer: function (e) {
            e.preventDefault()
            console.log(e);
            const siD = $(e.target).data('ci')
            localStorage.setItem('ci', siD)
            return window.location.href = e.currentTarget.href
        },

        searchSalesByDate: async (from, to) => {

            const data = await fetchdata(mainpanel.jwt, `/admin/api/shipments/?from=${from}&&to=${to}&&type=date`, 'get', {}, true)
            if (data) {
                mainpanel.fetchedSales = data.json.shipments
                return data.json.shipments
            }
            return mainpanel.showMessage(res.message, res.messageType, 'body')




        },
        searchExpensesByDate: async (from, to) => {

            try {
                const res = await fetch(`/admin/api/bills?from=${from}&&to=${to}&&type=date`, {
                    headers: {
                        Authorization: "Bearer " + mainpanel.jwt
                    }
                })
                if (res.status != 200) {
                    return mainpanel.showMessage(res.message, res.messageType, 'body')
                } else {
                    const response = await res.json()
                    return response.expenses

                }
            } catch (error) {
                return mainpanel.showMessage('Something went wrong, please try again..', 'error', 'body')

            }

        },

        makeDailySalesFilterations: function (sales) {
            const shipmentPerDay = {}
            const revenuePerDay = {}
            const sources = {}
            const sellers = {}

            sales.forEach(s => {
                shipmentPerDay[s.date] = (shipmentPerDay[s.date] || 0) + 1
                revenuePerDay[s.date] = (revenuePerDay[s.date] || 0) + s.shipping_price
                sources[s.leadSource] = (sources[s.leadSource] || 0) + 1
            })
            return { shipmentPerDay, revenuePerDay, sources, sellers }

        },
        createComparisonChartsCanvas: function (firstMonthSales, secondMonthSales, firstFiltertion, secondFiltertion) {
            console.log(firstFiltertion);
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            let firstsalesDates = []
            let secondsalesDates = []
            let datelength = []

            firstMonthSales.forEach((s, i) => firstsalesDates.push(`${mainpanel.getDate(s.date)}/${mainpanel.getMonth(s.date) + 1}`))
            secondMonthSales.forEach(s => secondsalesDates.push(`${mainpanel.getDate(s.date)}/${mainpanel.getMonth(s.date) + 1}`))

            const filteringfirstdates = [...new Set(firstsalesDates)]
            const filteringseconddates = [...new Set(secondsalesDates)]
            console.log();
            if (filteringseconddates.length > filteringfirstdates.length) {
                filteringseconddates.forEach((s, i) => {
                    datelength.push(i + 1)
                })
            } else {
                filteringfirstdates.forEach((s, i) => {
                    datelength.push(i + 1)
                })
            }
            const firstRevenue = Object.values(firstFiltertion.revenuePerDay)
            const secondRevenue = Object.values(secondFiltertion.revenuePerDay)

            const firseshipmentPerDay = Object.values(firstFiltertion.shipmentPerDay)
            const secondshipmentPerDay = Object.values(secondFiltertion.shipmentPerDay)

            var canvas = document.getElementById("compareTwoMonthessales");
            var ctx = canvas.getContext('2d');

            var myChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: [...new Set(firstsalesDates)],
                    datasets: [{
                        data: firseshipmentPerDay,
                        backgroundColor: [
                            '#00f800',
                            '#f8b700',
                            'red',
                            'purple',
                            'blue',
                        ],
                        labels: [...new Set(firstsalesDates)]
                    }, {
                        data: secondshipmentPerDay,
                        backgroundColor: [
                            'black',
                            'grey',
                            'lightgrey'
                        ],
                        labels: [...new Set(secondsalesDates)],
                    },]
                },
                options: {
                    responsive: true,
                    legend: {
                        display: false,
                    },
                    tooltips: {
                        callbacks: {
                            label: function (tooltipItem, data) {
                                var dataset = data.datasets[tooltipItem.datasetIndex];
                                var index = tooltipItem.index;
                                return ' شحنه ' + dataset.data[index] + ': ' + dataset.labels[index];
                            }
                        }
                    }
                }
            });
            var seconcanvas = document.getElementById("compareTwoMonthessalesreveneu");
            var secondctx = seconcanvas.getContext('2d');
            var data = {
                labels: datelength,
                datasets: [{
                    label: months[mainpanel.getMonth(firstMonthSales[0].date)],
                    fill: false,
                    lineTension: 0.1,
                    backgroundColor: "rgba(225,0,0,0.4)",
                    borderColor: "red", // The main line color
                    borderCapStyle: 'square',
                    borderDash: [], // try [5, 15] for instance
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: "black",
                    pointBackgroundColor: "white",
                    pointBorderWidth: 1,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: "yellow",
                    pointHoverBorderColor: "brown",
                    pointHoverBorderWidth: 2,
                    pointRadius: 4,
                    pointHitRadius: 10,
                    // notice the gap in the data and the spanGaps: true
                    data: firstRevenue,
                    spanGaps: true,

                    // yAxisID: "y-axis-2",
                }, {
                    label: months[mainpanel.getMonth(secondMonthSales[0].date)],
                    fill: false,
                    lineTension: 0.1,
                    backgroundColor: "rgba(167,105,0,0.4)",
                    borderColor: "rgb(167, 105, 0)",
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: "white",
                    pointBackgroundColor: "black",
                    pointBorderWidth: 1,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: "brown",
                    pointHoverBorderColor: "yellow",
                    pointHoverBorderWidth: 2,
                    pointRadius: 4,
                    pointHitRadius: 10,
                    // notice the gap in the data and the spanGaps: false
                    data: secondRevenue,
                    spanGaps: true,
                    // yAxisID: "y-axis-2",
                }

                ]
            };

            // Notice the scaleLabel at the same level as Ticks
            var options = {

                responsive: true,
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                beginAtZero: true
                            },
                            scaleLabel: {
                                display: true,
                                labelString: '',
                                fontSize: 20
                            },
                            position: "left",
                            id: "y-axis-2",
                        },
                        {
                            ticks: {
                                beginAtZero: true
                            },
                            scaleLabel: {
                                display: false,
                                labelString: '',
                                fontSize: 20
                            },
                            position: "right",
                            id: "y-axis-1",
                        }
                    ]
                }
            };
            // Chart declaration:
            var myBarChart = new Chart(secondctx, {
                type: 'bar',
                data: data,
                options: options
            });
            $('.chart').removeClass('none')
        },
        comparisonBetweenTowMonthes: function (thisMonth, lastMonth, thisMonthExpenses, lastMonthExpenses) {

            const thisMonthFilterations = this.makeDailySalesFilterations(thisMonth)
            const lastMonthFilterations = this.makeDailySalesFilterations(lastMonth)
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            let lastMonthSalesLength = 0
            let lastMonthRevenue = 0

            let thisMonthRevenue = 0

            let percentageOfSales
            let percentageOfRevenue

            // if (thisMonth.length > 0) {

            const lastSalesThisMonth = thisMonth.length - 1

            const dateOfLastSales = this.getDate(thisMonth[lastSalesThisMonth].date)

            //get last month sales until same day as today

            lastMonth.forEach(s => {
                if (this.getDate(s.date) <= dateOfLastSales) {
                    lastMonthSalesLength += 1
                    lastMonthRevenue += s.shipping_price
                }
            })

            thisMonth.forEach(s => thisMonthRevenue += s.shipping_price)

            if (lastMonthSalesLength < thisMonth.length) {
                percentageOfSales = 100 - ((lastMonthSalesLength / thisMonth.length) * 100)
            } else {
                percentageOfSales = 100 - ((thisMonth.length / lastMonthSalesLength) * 100)
            }

            if (lastMonthRevenue < thisMonthRevenue) {
                percentageOfRevenue = 100 - ((lastMonthRevenue / thisMonthRevenue) * 100)
            } else {
                percentageOfRevenue = 100 - ((thisMonthRevenue / lastMonthRevenue) * 100)
            }

            // }
            const salesPercentageFloor = Math.floor(percentageOfSales)
            const revenuePercentageFloor = Math.floor(percentageOfRevenue)
            $('.over-all-review .infograph').prepend(
                `
                <div class=" over-all-review_box  over-all-review_compare_percentage grid g-two">
                <div class="over-all-review_compare_percentage_item ">
                <div>
                    <p>الشحنات حتي <b>${dateOfLastSales}/${months[this.getMonth(thisMonth[0].date)]}</b><br><b>${thisMonth.length}</b> شحنه
                    <span style="font-size:13px; font-weight:lighter">مقارنه بـ الشهر الماضي ${lastMonth.length === 0 ? '<b>صفر</b>' : lastMonth.length} شحنه</p>
                </div>
                <div class="item_percentage">
                    ${lastMonthSalesLength < thisMonth.length ? `<p style="color:#00f800"><b>%</b>${salesPercentageFloor} <i class="fas fa-arrow-up"></i></p>` : `<p style="color:red"><b>%</b>${salesPercentageFloor} <i class="fas fa-arrow-down"></i></p>`}
                </div>
                </div>
                <div class="over-all-review_compare_percentage_item p-medium border-1 border-r-m m-b-3">
                    <div>
                        <p>العائدات حتي <b>${dateOfLastSales}/${months[this.getMonth(thisMonth[0].date)]}</b><br>$${thisMonthRevenue}
                        <span style="font-size:13px; font-weight:lighter">مقارنه بـ الشهر الماضي ${lastMonthRevenue === 0 ? 'صفر' : lastMonthRevenue} $</p>

                    </div>
                    <div class="item_percentage">
                    ${lastMonthRevenue < thisMonthRevenue ? `<p style="color:#00f800"><b>%</b>${revenuePercentageFloor} <i class="fas fa-arrow-up"></i></p>` : `<p style="color:red"><b>%</b>${revenuePercentageFloor} <i class="fas fa-arrow-down"></i></p>`}
                </div>
                </div>
           
                </div>
    
                `

            )

            mainpanel.createComparisonChartsCanvas(thisMonth, lastMonth, thisMonthFilterations, lastMonthFilterations)



            $('.over-all-review').find('.loading').addClass('none')

        },
        getMonth: function (date) {
            const newDate = new Date(date)
            return newDate.getMonth()
        },
        getDate: function (date) {
            const newDate = new Date(date)
            return newDate.getDate()
        }
    }
    mainpanel.init()
})()


