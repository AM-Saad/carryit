function createitemBox(c) {
    $('.content .items').append(`
    <div class="content-item btn_hover_effect ">
        <div class="content-item_body">
            <p>${c.vehicle_type}</p>
            <p>${c.name}</p>
            <p>${c.driver ? c.driver.name : 'لا يوجد'}</p>
            <p>${c.active ? "نشط" : 'غير نشط'}</p>
            <input type="hidden" name="itemId" value="${c._id}">
        </div>
    </div>
  `)
}

function createSingleItem(c, session) {
    $('.single-item').remove()
    $('main').append(`
        <div class="single-item scaleable ">
        <input type="hidden" name="itemId" value="${c._id}">
        <div class="inside-wrapper">
                    <i class="fas fa-times font-xl close close-single-item"></i>
                    <div class="single-item_all_actions">
                        <a class="btn bg-w single-item_actions edit-item">تعديل</a>
                        <a class="btn bg-w single-item_actions get-vehicle-fuels get-info-table" data-val="fuels">البنزين</a>
                        <a class="btn bg-w single-item_actions get-vehicle-maintenance get-info-table" data-val="maintenance">الصيانه</a>
                        <a class="btn btn-danger single-item_actions delete-item">حذف </a>
                        <a class="btn bg-w single-item_actions open-form" data-form="assignForm">تعيين سائق</a>
                    </div>
                    <div class="single-item_basics bg-lightgray flex f-space-around">
    
                    </div>
                    <div class="single-item-core">
                        <div class="single-item_name info"><h3>اسم الوسيله: ${c.name}</h3> </div>
                       <div class="info"><p>نوع الوسيله: ${c.vehicle_type || 'غير معروف'} </p></div>
                       <div class="info"><p>الحاله: ${c.active ? "نشط" : 'غير نشط'}</p> </div>
                       <div class="info"><p>السائق: ${c.driver ? c.driver.name : 'لا يوجد'} </p></div>
                       <div class="info"><p>سعر التانك: ${c.fuel.cost || 'غير معروف'} جنيه</p></div>
                       <div class="info"><p>كميه التانك: ${c.fuel.liters || 'غير معروف'} لتر</p></div>
                    </div>

                </div>
            </div>
    `)
    setTimeout(() => { $('.single-item').addClass('scale') }, 100);
}

function infoItem(o) {
    $('.info-table .inside-wrapper .items').append(`
    <div class="p-medium m-b-3 order bg-lightgray border-1-g" style="cursor:pointer">
        <input type="hidden" value="${o._id}" name="orderId">
        <div class="flex f-space-around ">
        <div> ${o.date}</div>
        <div> المبلغ: ${o.amount}</div>
        <div> تم الدفع : ${o.done? 'نعم':'لا'}</div>
    </div>
        <div class="itemsBox bg-lightgray p-medium none"></div>
    </div>
`)
}
