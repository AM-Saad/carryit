function createitemBox(c) {
    $('.content .items').append(`
    <div class="content-item btn_hover_effect ">
    <div class="content-item_body">
        <p>${c.shipmentNo}</p>
        <p>${c.price}</p>
        <p>${c.entry_date}</p>
        <p>${c.status.text}</p>
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
                        <a class="btn btn-danger single-item_actions delete-item">حذف العنصر</a>
                    </div>
                    <h2>معلومات الشحنه</h2>

                    <div class="single-item_basics bg-lightgray grid g-two p-medium">
                        <div>
                            <div class=""><h3>السعر : <b>${c.price}</b> </h3></div>
                            <div class="info"><p>رقم الشحنه: <b>${c.shipmentNo}</b> </p></div>
                            <div class="info"><p>تاريخ الدخول: <b>${c.entry_date}</b></p></div>
                            <div class="info"><p>تاريخ الخروج: <b>${c.leaved_date}</b></p></div>
                            <div class="info"><p>حاله الشحنه: <b>${c.status.text}</b> </p></div>
                    
                        </div>
               
                    </div>
                    <div class=" history">
                    <h3>حركه الشحنه</h3>
               
               
                    </div>

                </div>
            </div>
   `)
    c.history.forEach(i => {
        $('.history').append(`
            <div class="flex f-space-between">
                <div> <p>التاريخ: ${i.date || 'غير معروف'} </p></div>
                <div><p>بواسطه : ${i.by.name || 'غير معروف'} </p></div>
                <div><p>الحاله : ${i.status.text || 'غير معروف'} </p></div>
            </div>
       `)
    })
    setTimeout(() => { $('.single-item').addClass('scale') }, 100);
}


function orderItem(o) {
    $('.shipment-shipments .inside-wrapper').append(`
    <div class="p-medium m-b-3 order bg-lightgray border-1-g" style="cursor:pointer">
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

function renderFilter(types) {
    $('.options-filters').empty()
    types.forEach(t => $('.options-filters').append(`
        <div class="options-filters_tag" data-filter="${t.filterType}" data-sku="${t.filterSku}" data-val="${t.filterVal}">
            <i class="fas fa-times remove-filter"></i>
            <span>${t.filterSku}</span>
        </div>
    `))
}

function invoice(i) {

    $('body').append(`
    <div id="invoice">
    <i class="close close-invoice fas fa-times"></i>

    <div class="toolbar hidden-print">
        <div class="text-right flex">
            <button id="printInvoice" class="btn btn-info"><i class="fa fa-print"></i> Print</button>
            <button class="btn btn-info"><i class="fa fa-file-pdf-o"></i> Export as PDF</button>
        </div>
        <hr>
    </div>
    <div class="invoice overflow-auto">
        <div style="min-width: 600px">
            <main>
                <div class="row contacts">
                    <div class="col invoice-details">
                        <h1 class="invoice-id">INVOICE ${i.shipmentNo}</h1>
                        <div class="date">Date of Invoice: ${i.date}</div>
                        <div class="date">Due Date: ${i.delivery_date}</div>
                    </div>
                    <div class="col invoice-to">
                        <h2 class="to">Name: ${i.receiver.name}</h2>
                        <div class="address">Address: ${i.receiver.address}</div>
                        <div class="email">Phone Number: ${i.receiver.phone}</div>
                    </div>
               
                </div>
                <table border="0" cellspacing="0" cellpadding="0">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th class="text-right">Price</th>
                            <th class="text-right">Qty</th>
                            <th class="text-right">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="no"></td>
                            
                            <td class="unit">$${i.price}</td>
                            <td class="qty">${i.quantity}</td>
                            <td class="total">$${i.price}</td>
                        </tr>
                       
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2"></td>
                            <td colspan="2">SUBTOTAL</td>
                            <td>$${i.price}</td>
                        </tr>
                        <tr>
                            <td colspan="2"></td>
                            <td colspan="2">Shipping</td>
                            <td>${i.shipping_price}</td>
                        </tr>
                        <tr>
                            <td colspan="2"></td>
                            <td colspan="2">GRAND TOTAL</td>
                            <td>$${i.price + i.shipping_price}</td>
                        </tr>
                    </tfoot>
                </table>
                <div class="thanks">Thank you!</div>
                <div class="notices">
                    <div>NOTICE:</div>
                    <div class="notice">A finance charge of 1.5% will be made on unpaid balances after 30 days.</div>
                </div>
            </main>
      
        </div>
        <!--DO NOT DELETE THIS div. IT is responsible for showing footer always at the bottom-->
        <div></div>
    </div>
</div>
    `)
}