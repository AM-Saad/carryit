const arVal = {
    "commission": "عموله",
    "custody": "عهده",
    "shipment": "شحنه",
    "fuels": "بنزين",
    "maintenance": "صيانه مركبه",
}

function createitemBox(c) {
    return `
    <div class="content-item btn_hover_effect ">
  
    <div class="content-item_body">
        <p>${c.serialNo}</p>
        <p>${c.date}</p>
        <p>${c.amount}</p>
        <p>${arVal[c.category]}</p>
        <input type="hidden" name="itemId" value="${c._id}">
    </div>
    </div>
  `
}

function createSingleItem(c, session) {
    console.log(c);
    $('.single-item').remove()
    $('main').append(`
        <div class="single-item scaleable ">
        <input type="hidden" name="itemId" value="${c._id}">
        <div class="inside-wrapper">
                    <div class="single-item_all_actions">
                        <i class="fas fa-times font-xl close close-single-item"></i>
                        <a class="btn btn-info single-item_actions edit-item">تعديل</a>
                        <a class="btn btn-danger single-item_actions delete-item">حذف الفاتوره</a>
                        ${c.status.paid ? '' : '<a class="btn btn-success single-item_actions pay-item">دفع الفاتوره</a>'}  
                    </div>
                    <div class="single-item_basics bg-lightgray flex f-space-around">
    
                    </div>
                    <div class="single-item-core grid g-two">
                        <div class="">
                            <div class="single-item_name"><h3>المبلغ: ${c.amount} جنيه</h3> </div>
                            <div class="info"><p>حاله الفاتوره : ${c.status.paid ? 'تم الدفع' : 'لم تدفع'} </p></div>
                            <div class="info"><p>نوع الفاتوره : ${c.billtype === 'out' ? 'صادرات' : 'واردات'} </p></div>
                            <div class="info"><p>تصنيف الفاتوره : ${arVal[c.category]} </p></div>
                            <div class="info"><p>اصدرت لأجل : ${c.itemname || 'غير معروف'} </p></div>
                            <div class="info"> <p> صدرت من: ${c.creator.name || 'غير معروف'} </p></div>
                        </div>
                        <div class="">
                            <div class="info"><p>رقم الفاتوره : ${c.serialNo || 'غير معروف'} </p></div>
                            <div class="info"><p>تاريخ الانشاء : ${c.date || 'غير معروف'} </p></div>
                            <div class="info"> <p>تاريخ الاصدار: ${c.release_date || 'غير معروف'} </p></div>
                            <div class="info"><p>تاريخ الاستحقاق : ${c.due || 'غير معروف'} </p></div>
                       </div>
                      
                    </div>
                </div>
            </div>
   `)
    setTimeout(() => { $('.single-item').addClass('scale') }, 100);
}

function renderFilter(types) {
    $('.options-filters').empty()
    types.forEach(t => $('.options-filters').append(`
        <div class="options-filters_tag" data-filter="${t.filterType}" data-sku="${t.filterSku}" data-val="${t.filterVal}">
            <i class="fas fa-times remove-filter"></i>
            <span>${t.filterSku}</span>
        </div>
    `))
}

function orderItem(o) {
    $('.drivers-shipments .inside-wrapper .items').append(`
    <div class="p-medium m-b-3 order bg-lightgray border-1-g" style="cursor:pointer">
    <input type="hidden" value="${o._id}" name="orderId">
    <div class="flex f-space-around ">
    <div> ${o.date}</div>
    <div> رقم الشحنه: ${o.shipmentNo}</div>
    <div> حاله الشحنه: ${o.status.text}</div>
    </div>
        <div class="itemsBox bg-lightgray p-medium none"></div>
    </div>
`)
}