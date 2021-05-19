function createitemBox(c) {
    $('.content').append(`
    <div class="content-item btn_hover_effect ">
    <div class="content-item_bar">
        <i class="fas fa-ellipsis-v font-s sub-menu_btn"></i>
        <ul class="sub-menu">
        <li class="sub-menu_item delete-driver">حذف العميل</li>
        </ul>
    </div>
    <div class="content-item_body">
        <div class="order-info">
        <h3>${c.name}</h3>
        </div>
        <img class="content-item_body_img" src="/${c.image ? c.image : '/admin/images/driver.png'}" class="h-75 border-r-m shadow"alt="Customer image" srcset="">
        <input type="hidden" name="driverId" value="${c._id}">
    </div>
    </div>
  `)
}

function createSingleItem(c, session) {
    $('.single-item').remove()
    $('main').append(`
        <div class="single-item scaleable ">
        <input type="hidden" name="driverId" value="${c._id}">
        <div class="inside-wrapper">
                    <i class="fas fa-times font-xl close close-single-item"></i>
                    <div class="single-item_all_actions p-3 flex f-space-around">
                    <a class="btn bg-w single-item_actions driver-shipments">الشحنات  </a>
                    <a class="btn bg-w single-item_actions open-form driver-shipments">تعيين سحنه </a>
                    <a class="btn btn-danger single-item_actions delete-driver">حذف المندوب</a>
                    </div>
                    <div class="single-item_basics bg-lightgray flex f-space-around">
    
                    </div>
                    <div class="single-item-core">
                        <div class="single-item_name">
                        <h3>اسم المندوب: ${c.name}</h3>
                        </div>
                       <div> <p>العنوان: ${c.address || 'غير معروف'} </p></div>
                       <div><p>الموبايل : ${c.mobile || 'غير معروف'} </p></div>
                       <div><p>الايميل : ${c.email || 'غير معروف'} </p></div>
                        <div class="flex"><p class="m-r-3">عدد الشحنات المسلمه: ${c.shipments.length} </p> <i class="fas fa-eye driver-shipments single-item_actions m-l-3"></i><div>
                    </div>
                    <div class="single-item-stock">
                    </div>
                </div>
            </div>
   `)
    setTimeout(() => { $('.single-item').addClass('scale') }, 100);
}


function orderItem(o) {
    $('.orders .inside-wrapper').append(`
    <div class="p-medium m-b-3 order bg-lightgray border-1-g" style="cursor:pointer">
    <input type="hidden" value="${o.id}" name="orderId">
    <div class="flex f-space-around ">
    <div> ${o.date}</div>
    <div> رقم الطلب: ${o.serial}</div>
    <div> المجموع: ${o.total}$</div>
    </div>
        <div class="itemsBox bg-lightgray p-medium none"></div>
    </div>
`)
}