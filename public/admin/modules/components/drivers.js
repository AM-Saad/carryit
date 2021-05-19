function createitemBox(c) {
    return `
    <div class="content-item btn_hover_effect ">
  
    <div class="content-item_body">
        <p>${c.name}</p>
        <p>${c.mobile}</p>
        <p>${c.shipments.length}</p>
        <input type="hidden" name="driverId" value="${c._id}">
    </div>
    </div>
  `
}

function createSingleItem(c, session) {
    $('.single-item').remove()
    $('main').append(`
        <div class="single-item scaleable ">
        <input type="hidden" name="driverId" value="${c._id}">
        <div class="inside-wrapper">
                    <i class="fas fa-times font-xl close close-single-item"></i>
                    <div class="single-item_all_actions">
                    <a class="btn bg-w single-item_actions driver-shipments">الشحنات</a>
                    <a class="btn bg-w single-item_actions get-driver-custodies get-info-table" data-val="custodies">عهد المندوب</a>
                    <a class="btn bg-w single-item_actions get-driver-commission get-info-table" data-val="commission">عمولات المندوب</a>
                    <a class="btn bg-w single-item_actions open-form " data-form="assignShipment">تعيين شحنه </a>
                    <a class="btn btn-info single-item_actions edit-driver">تعديل</a>
                        <a class="btn btn-danger single-item_actions delete-driver">حذف المندوب</a>
                    </div>
                    <div class="single-item_basics bg-lightgray flex f-space-around">
    
                    </div>
                    <div class="single-item-core">
                        <div class="grid g-two">
                            <div>
                                <div class="info single-item_name" ><p>اسم المندوب: ${c.name}</p> </div>
                                <div class="info"><p>الموبايل : ${c.mobile || 'غير معروف'} </p></div>
                                <div class="info"> <p>العنوان: ${c.address || 'غير معروف'} </p></div>
                                <div class="info"><p>الايميل : ${c.email || 'غير معروف'} </p></div>
                            </div>
                            <div>
                                <div class="info"><p> المركبه : ${c.vehicle ? c.vehicle.name : 'غير معروف'} </p></div>
                                <div class="info"><p>المرتب الثابت : ${c.salary.base_salary || 'غير محدد'} </p></div>
                                <div class="info"><p>العموله/للشحنه : ${c.salary.commission || 'غير محدد'} </p></div>
                                <div class="info"><p> عدد الشحنات : ${c.shipments.length} </p><div>
                            </div>
                        </div>
                    </div>
                    <div class="single-item-stock">
                    </div>
                </div>
            </div>
   `)
    setTimeout(() => { $('.single-item').addClass('scale') }, 100);
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
function infoItem(o) {
    $('.info-table .inside-wrapper .items').append(`
    <div class="p-medium m-b-3 order bg-lightgray border-1-g" style="cursor:pointer">
        <input type="hidden" value="${o._id}" name="orderId">
        <div class="flex f-space-around ">
        <div> ${o.date}</div>
        <div> المبلغ: ${o.amount}</div>
        <div> تم الدفع : ${o.done ? 'نعم' : 'لا'}</div>
    </div>
        <div class="itemsBox bg-lightgray p-medium none"></div>
    </div>
`)
}
