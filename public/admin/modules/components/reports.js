function ordersReport(orders) {
    $('.orders-reports .report-head').append(`
    <span><b>التاريخ</b></span>
    <span>رقم الشحنه</span>
    <span>سعر التحصيل</span>
    <span>سعر الشحن</span>
`)
    let totalSolditems = 0
    let totalIncome = 0
    let totalItemsprices = 0
    orders.forEach(i => {
        $('.orders-reports .report-body').append(`
        <div class="  bg-lightgray">
                <span>${i.date}</span>
                <span>${i.shipmentNo}</span>
                <span>${i.price || 0}</span>
                <span>$${i.shipping || 0}</span>
            </div>
        `)
        totalSolditems += parseInt(i.price, 10)
        totalIncome += parseInt(i.shipping || 0, 10)
    })

    $('.orders-reports .report-footer').append(`
    <span>______</span>
    <span>______</span>
    <span>${totalSolditems}</span>
    <span><span class="c-g">$</span>${totalIncome}</span>
`)
    $('.orders-reports').addClass('scale')
}

function ordersItemsReport(items) {
    $('.report').removeClass('scale')
    $('.report-body').empty()

    let totalSolditems = 0
    let totalIncome = 0
    let totalItemsprices = 0
    items.forEach(i => {
        $('.items-reports .report-body').append(`
            <div class=" bg-lightgray">
                <span>${i.unit ? i.name + ' / ' + i.unit : i.name}</span>
                <span>${i.quantity}</span>
                <span>${i.price}</span>
                <span>${(i.quantity * i.price)}</span>
            </div>
        `)
        totalSolditems += i.quantity
        totalIncome += (i.quantity * i.price)
        totalItemsprices += i.price
    })
    $('.items-reports .report-footer').empty()

    $('.items-reports .report-footer').append(`
        <span><b>Total</b></span>
        <span>${totalSolditems}</span>
        <span>${totalItemsprices}</span>
        <span>${totalIncome}</span>
    `)
    $('.items-reports').addClass('scale')
}


function customersOrdersReport(items) {
    $('.report').removeClass('scale')
    $('.report-body').empty()

    items.forEach(i => {
        $('.customers-orders-reports .report-body').append(`
            <div class=" bg-lightgray">
            <span>${i.name}</span>
            <span>${i.items}</span>
            <span>${i.total}</span>
            </div>
        `)

    })
    $('.customers-orders-reports .report-footer').empty()


    $('.customers-orders-reports').addClass('scale')
}