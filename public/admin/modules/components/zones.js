function createitemBox(c) {
    $('.content .items').append(`
    <div class="content-item btn_hover_effect ">
        <div class="content-item_body">
            <p>${c.name}</p>
            <p>${c.zoneId}</p>
            <p>${c.shipping} جنيه</p>
            <input type="hidden" name="zoneId" value="${c._id}">
        </div>
    </div>
  `)
}

function createSingleItem(c, session) {
    $('.single-item').remove()
    $('main').append(`
        <div class="single-item scaleable ">
        <input type="hidden" name="zoneId" value="${c._id}">
        <div class="inside-wrapper">
                    <i class="fas fa-times font-xl close close-single-item"></i>
                    <div class="single-item_all_actions">
                        <a class="btn bg-w single-item_actions edit-zone">تعديل</a>
                        <a class="btn btn-danger single-item_actions delete-zone">حذف المنطقه</a>
                    </div>
                    <div class="single-item_basics bg-lightgray flex f-space-around">
    
                    </div>
                    <div class="grid g-two">
                    
                        <div class="single-item-core">
                            <div class="info single-item_name"> <h3>اسم المنطقه: ${c.name}</h3></div>
                            <div class="info"><p>رقم المنطقه: ${c.zoneId || 'غير معروف'} </p></div>
                            <div class="info"><p>المحافظه : ${c.governorate || 'غير معروف'} </p ></div>
                            <div class="info"><p>سعر الشحن : ${c.shipping + 'جنيه' || 'غير معروف'} </p></div>
                       
                        </div>
                        <div class="single-item-core">
                            <div class="info"><p>تسليم: ${c.delivery ? 'نعم' : 'لا'} </p></div>
                            <div class="info"><p>استلام: ${c.pickup ? 'نعم' : 'لا'} </p></div>
                            <div class="info"><p>عدد التسليم في المنطقه: ${c.shipments.filter(s => s.delivery === true).reduce((sum, record) => { return sum + 1 }, 0)} </p></div>
                            <div class="info"><p>عدد الاستلام من المنطقه: ${c.shipments.filter(s => s.delivery === false).reduce((sum, record) => { return sum + 1 }, 0)} </p></div>
                        </div>
                    </div>

    <div class="single-item-stock">
    </div>
                </div >
            </div >
    `)
    setTimeout(() => { $('.single-item').addClass('scale') }, 100);
}


function orderItem(o) {
    $('.customer-shipments .inside-wrapper').append(`
    < div class="p-medium m-b-3 order bg-lightgray border-1-g" style = "cursor:pointer" >
        <input type="hidden" value="${o.id}" name="orderId">
            <div class="flex f-space-around ">
                <div> ${o.date}</div>
                <div> رقم الشحنه: ${o.shipmentNo}</div>
                <div> حاله الشحنه: ${o.status.text}</div>
            </div>
            <div class="itemsBox bg-lightgray p-medium none"></div>
    </div>
`)
}